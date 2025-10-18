# Diseño - Funcionalidades IA en ConstructPro

## Visión General

Este documento describe el diseño técnico y de interfaz para las funcionalidades de IA en ConstructPro, incluyendo arquitectura, componentes, flujos de datos y especificaciones de UI/UX.

## Arquitectura del Sistema

### Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ AI Assistant │  │ Voice Input  │  │ Receipt Scan │      │
│  │   Button     │  │  Component   │  │  Component   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  API Layer (Node.js)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ /api/claude/ │  │ /api/claude/ │  │ /api/claude/ │      │
│  │    chat      │  │ voice-to-text│  │analyze-receipt│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Claude API (Anthropic)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Messages   │  │    Audio     │  │    Vision    │      │
│  │     API      │  │ Transcription│  │     API      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    N8N Workflows                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Save to DB  │  │ Send Alerts  │  │ Update Stats │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  PostgreSQL Database                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Expenses    │  │  Documents   │  │  AI Logs     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## Componentes de Frontend

### 1. AIAssistantButton (Botón Flotante)

**Ubicación**: `src/components/ai/AIAssistantButton.tsx`

**Props**:
```typescript
interface AIAssistantButtonProps {
  notificationCount?: number
  onOpen: () => void
}
```

**Diseño**:
- Posición: `fixed bottom-6 right-6`
- Tamaño: 64px x 64px
- Color de fondo: `#2563eb` (azul primario)
- Icono: Robot con destellos (lucide-react: `Bot` + `Sparkles`)
- Animación: Pulso sutil cada 3 segundos
- Badge: Círculo rojo con número si hay notificaciones
- Z-index: 1000

**Estados**:
- Default: Azul con sombra
- Hover: Escala 1.1, sombra más pronunciada
- Active: Escala 0.95
- Disabled: Opacidad 0.5

### 2. AIAssistantModal (Modal Principal)

**Ubicación**: `src/components/ai/AIAssistantModal.tsx`

**Props**:
```typescript
interface AIAssistantModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: 'welcome' | 'chat' | 'features'
}
```

**Estructura**:
```jsx
<Modal>
  <Header>
    <Icon /> {/* Robot con destellos */}
    <Title>IA Assistant</Title>
    <Subtitle>Análisis inteligente disponible</Subtitle>
    <CloseButton />
  </Header>
  
  <Body>
    {view === 'welcome' && <WelcomeView />}
    {view === 'chat' && <ChatView />}
    {view === 'features' && <FeaturesView />}
  </Body>
</Modal>
```

**Diseño**:
- Tamaño: 600px x 700px (responsive en móvil: 100% x 90vh)
- Fondo: `#1a1f2e` (dark navy)
- Bordes: Punteados 2px `#2563eb`
- Border-radius: 16px
- Sombra: `0 20px 60px rgba(0, 0, 0, 0.5)`

### 3. WelcomeView (Vista de Bienvenida)

**Ubicación**: `src/components/ai/WelcomeView.tsx`

**Contenido**:
- Icono grande de robot animado (120px x 120px)
- Título: "IA Assistant"
- Subtítulo: "Análisis inteligente disponible"
- Botón principal: "Iniciar Chat" (azul, prominente)
- Descripción: "Pregunta sobre proyectos, presupuestos, cronogramas y más"
- Lista de capacidades con iconos

### 4. ChatView (Vista de Chat)

**Ubicación**: `src/components/ai/ChatView.tsx`

**Estructura**:
```jsx
<ChatContainer>
  <MessagesArea>
    {messages.map(msg => (
      <Message key={msg.id} role={msg.role}>
        {msg.content}
      </Message>
    ))}
  </MessagesArea>
  
  <InputArea>
    <TextInput placeholder="Escribe tu pregunta..." />
    <VoiceButton />
    <SendButton />
  </InputArea>
</ChatContainer>
```

**Diseño de Mensajes**:
- Usuario: Alineado a la derecha, fondo `#2563eb`, texto blanco
- IA: Alineado a la izquierda, fondo `#242b3d`, texto `#ffffff`
- Timestamp: Texto pequeño `#94a3b8`
- Markdown: Soporte para **negrita**, *cursiva*, listas, código

### 5. FeaturesView (Funcionalidades IA)

**Ubicación**: `src/components/ai/FeaturesView.tsx`

**Contenido**:
```jsx
<FeaturesGrid>
  <FeatureCard
    icon={<Mic />}
    title="Transacción por Voz"
    description="Toca para hablar"
    onClick={handleVoiceTransaction}
  />
  
  <FeatureCard
    icon={<Camera />}
    title="Escanear Recibo"
    description="Haz clic para añadir"
    onClick={handleScanReceipt}
  />
</FeaturesGrid>
```

**Diseño de FeatureCard**:
- Fondo: `#242b3d`
- Padding: 24px
- Border-radius: 12px
- Hover: Escala 1.02, sombra
- Icono: 48px x 48px, color según función (azul para voz, verde para cámara)

### 6. VoiceTransactionModal

**Ubicación**: `src/components/ai/VoiceTransactionModal.tsx`

**Estados**:
1. **Idle**: Botón "Toca para hablar" con icono de micrófono
2. **Recording**: Forma de onda animada, botón "Detener"
3. **Processing**: Loading spinner, "Procesando audio..."
4. **Confirmation**: Formulario con datos extraídos, botones "Confirmar" / "Editar"
5. **Success**: Checkmark verde, "Gasto registrado exitosamente"

**Componentes**:
```jsx
<VoiceModal>
  {state === 'idle' && <RecordButton />}
  {state === 'recording' && <Waveform />}
  {state === 'processing' && <LoadingSpinner />}
  {state === 'confirmation' && (
    <ConfirmationForm
      amount={extractedData.amount}
      category={extractedData.category}
      project={extractedData.project}
      description={extractedData.description}
      onConfirm={handleConfirm}
      onEdit={handleEdit}
    />
  )}
  {state === 'success' && <SuccessMessage />}
</VoiceModal>
```

### 7. ReceiptScanModal

**Ubicación**: `src/components/ai/ReceiptScanModal.tsx`

**Estados**:
1. **Camera**: Vista de cámara con botón de captura
2. **Preview**: Imagen capturada con botones "Usar esta" / "Tomar otra"
3. **Analyzing**: Loading con mensaje "Analizando recibo..."
4. **Extracted**: Formulario con datos extraídos (editable)
5. **Saved**: Confirmación de guardado

**Componentes**:
```jsx
<ReceiptModal>
  {state === 'camera' && (
    <CameraView>
      <Video ref={videoRef} />
      <CaptureButton onClick={capturePhoto} />
    </CameraView>
  )}
  
  {state === 'preview' && (
    <PreviewView>
      <Image src={capturedImage} />
      <ButtonGroup>
        <Button onClick={useImage}>Usar esta</Button>
        <Button onClick={retake}>Tomar otra</Button>
      </ButtonGroup>
    </PreviewView>
  )}
  
  {state === 'analyzing' && <AnalyzingSpinner />}
  
  {state === 'extracted' && (
    <ExtractedDataForm
      data={extractedData}
      onSave={handleSave}
      onCancel={handleCancel}
    />
  )}
  
  {state === 'saved' && <SavedConfirmation />}
</ReceiptModal>
```

## Servicios de Backend

### 1. Claude Chat Service

**Endpoint**: `POST /api/claude/chat`

**Request**:
```typescript
interface ChatRequest {
  message: string
  context: {
    userId: string
    projectsData: Project[]
    recentTransactions: Transaction[]
    conversationHistory?: Message[]
  }
}
```

**Response**:
```typescript
interface ChatResponse {
  message: string
  suggestions?: string[]
  visualData?: {
    type: 'chart' | 'table'
    data: any
  }
}
```

**Implementación**:
```typescript
// src/services/api/claudeService.ts
export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  // 1. Preparar contexto para Claude
  const systemPrompt = buildSystemPrompt(request.context)
  
  // 2. Llamar a Claude API
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [
      ...request.context.conversationHistory || [],
      { role: 'user', content: request.message }
    ]
  })
  
  // 3. Procesar respuesta
  const aiMessage = response.content[0].text
  
  // 4. Extraer datos visuales si aplica
  const visualData = extractVisualData(aiMessage)
  
  return {
    message: aiMessage,
    visualData
  }
}
```

### 2. Voice to Text Service

**Endpoint**: `POST /api/claude/voice-to-text`

**Request**:
```typescript
interface VoiceToTextRequest {
  audioFile: Blob
  language: 'es-MX'
}
```

**Response**:
```typescript
interface VoiceToTextResponse {
  transcription: string
  extractedData: {
    amount?: number
    category?: string
    project?: string
    description?: string
  }
  confidence: number
}
```

**Implementación**:
```typescript
export async function transcribeVoice(request: VoiceToTextRequest): Promise<VoiceToTextResponse> {
  // 1. Convertir audio a formato compatible
  const audioBuffer = await request.audioFile.arrayBuffer()
  
  // 2. Transcribir con Claude (o servicio de transcripción)
  const transcription = await transcribeAudio(audioBuffer)
  
  // 3. Extraer datos estructurados con Claude
  const extractedData = await extractTransactionData(transcription)
  
  return {
    transcription,
    extractedData,
    confidence: calculateConfidence(extractedData)
  }
}

async function extractTransactionData(text: string) {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Extrae los siguientes datos de esta transacción: "${text}"
      
      Devuelve un JSON con:
      - amount: número (solo el valor numérico)
      - category: string (materiales, mano_de_obra, equipos, transporte, otros)
      - project: string (nombre del proyecto mencionado)
      - description: string (descripción del gasto)
      
      Si algún dato no está presente, usa null.`
    }]
  })
  
  return JSON.parse(response.content[0].text)
}
```

### 3. Receipt Analysis Service

**Endpoint**: `POST /api/claude/analyze-receipt`

**Request**:
```typescript
interface AnalyzeReceiptRequest {
  image: string // base64
  projectContext: Project[]
}
```

**Response**:
```typescript
interface AnalyzeReceiptResponse {
  extractedData: {
    total: number
    date: string
    supplier: string
    items: string[]
    rfc?: string
    invoiceNumber?: string
  }
  suggestedCategory: string
  suggestedProject?: string
  confidence: number
}
```

**Implementación**:
```typescript
export async function analyzeReceipt(request: AnalyzeReceiptRequest): Promise<AnalyzeReceiptResponse> {
  const response = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: [
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: 'image/jpeg',
            data: request.image
          }
        },
        {
          type: 'text',
          text: `Analiza este recibo/factura y extrae:
          
          1. Monto total
          2. Fecha de emisión
          3. Nombre del proveedor/comercio
          4. Lista de items/conceptos
          5. RFC (si está visible)
          6. Número de folio/factura
          
          Devuelve un JSON estructurado.`
        }
      ]
    }]
  })
  
  const extractedData = JSON.parse(response.content[0].text)
  
  // Sugerir categoría basándose en items
  const suggestedCategory = categorizePurchase(extractedData.items)
  
  // Sugerir proyecto si es posible
  const suggestedProject = matchProject(extractedData, request.projectContext)
  
  return {
    extractedData,
    suggestedCategory,
    suggestedProject,
    confidence: calculateConfidence(extractedData)
  }
}
```

## Modelos de Datos

### AIConversation

```typescript
interface AIConversation {
  id: string
  userId: string
  messages: AIMessage[]
  createdAt: Date
  updatedAt: Date
}

interface AIMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  metadata?: {
    visualData?: any
    suggestions?: string[]
  }
}
```

### AILog

```typescript
interface AILog {
  id: string
  userId: string
  feature: 'chat' | 'voice' | 'receipt_scan'
  action: string
  inputData: any
  outputData: any
  confidence?: number
  processingTime: number
  timestamp: Date
}
```

### ExtractedReceipt

```typescript
interface ExtractedReceipt {
  id: string
  userId: string
  imageUrl: string
  extractedData: {
    total: number
    date: string
    supplier: string
    items: string[]
    rfc?: string
    invoiceNumber?: string
  }
  linkedExpenseId?: string
  linkedDocumentId?: string
  confidence: number
  createdAt: Date
}
```

## Flujos de Datos

### Flujo 1: Chat Conversacional

```
Usuario escribe mensaje
  ↓
Frontend envía a /api/claude/chat con contexto
  ↓
Backend prepara prompt con datos del usuario
  ↓
Claude API procesa y responde
  ↓
Backend formatea respuesta (markdown, visuales)
  ↓
Frontend muestra respuesta en chat
  ↓
Guardar en historial de conversación
```

### Flujo 2: Transacción por Voz

```
Usuario toca botón de micrófono
  ↓
Solicitar permisos de micrófono
  ↓
Grabar audio (mostrar waveform)
  ↓
Usuario detiene grabación
  ↓
Enviar audio a /api/claude/voice-to-text
  ↓
Backend transcribe audio
  ↓
Claude extrae datos estructurados
  ↓
Frontend muestra formulario de confirmación
  ↓
Usuario confirma o edita
  ↓
Guardar gasto en DB
  ↓
Trigger N8N workflow para notificaciones
  ↓
Mostrar confirmación de éxito
```

### Flujo 3: Escanear Recibo

```
Usuario abre cámara
  ↓
Capturar foto del recibo
  ↓
Mostrar preview
  ↓
Usuario confirma imagen
  ↓
Enviar a /api/claude/analyze-receipt
  ↓
Claude Vision analiza imagen (OCR)
  ↓
Extraer datos estructurados
  ↓
Sugerir categoría y proyecto
  ↓
Frontend muestra formulario editable
  ↓
Usuario revisa y confirma
  ↓
Guardar gasto en Finanzas
  ↓
Guardar imagen en Documentos/Facturas
  ↓
Asociar documento con gasto
  ↓
Trigger N8N workflow
  ↓
Mostrar confirmación
```

## Consideraciones de Diseño

### Responsive Design

- **Desktop**: Modal centrado, 600px x 700px
- **Tablet**: Modal 80% ancho, 90% alto
- **Mobile**: Modal fullscreen con header fijo

### Animaciones

- Botón flotante: Pulso cada 3s
- Modal: Fade in + slide up (300ms)
- Waveform: Animación continua mientras graba
- Loading: Spinner con mensaje contextual
- Success: Checkmark animado con confetti

### Accesibilidad

- Todos los botones con `aria-label`
- Modal con `role="dialog"` y `aria-modal="true"`
- Navegación por teclado (Tab, Enter, Esc)
- Contraste de colores WCAG AA
- Textos alternativos para iconos

### Performance

- Lazy loading de modales
- Debounce en input de chat (300ms)
- Compresión de imágenes antes de enviar
- Cache de respuestas frecuentes
- Paginación en historial de chat

## Integración con N8N

### Webhooks

1. **Expense Created**: Trigger cuando se crea un gasto via IA
2. **Receipt Processed**: Trigger cuando se procesa un recibo
3. **Alert Generated**: Trigger cuando IA genera una alerta

### Workflows

1. **Save Expense Workflow**: Guardar gasto en DB + actualizar estadísticas
2. **Process Receipt Workflow**: Guardar imagen + crear documento + asociar gasto
3. **Send Alert Workflow**: Enviar notificación push/email cuando hay alertas

## Seguridad

### Autenticación

- JWT token en header de todos los requests
- Validación de token en backend antes de llamar a Claude
- Rate limiting por usuario (100 requests/hora)

### Encriptación

- HTTPS para todo el tráfico
- Encriptación de imágenes en S3
- Sanitización de datos antes de enviar a Claude

### Logs y Auditoría

- Registrar todas las llamadas a Claude API
- Guardar inputs/outputs para auditoría
- Permitir a admins revisar logs
- Retención de logs: 90 días

## Métricas

### KPIs a Medir

1. **Adopción**: % usuarios que usan IA al mes
2. **Frecuencia**: Promedio de interacciones por usuario
3. **Tiempo de registro**: Comparar con/sin IA
4. **Precisión**: % de datos extraídos correctamente
5. **Satisfacción**: NPS de funcionalidades IA

### Dashboard de Métricas

- Gráfica de adopción mensual
- Top features más usadas
- Tiempo promedio de procesamiento
- Tasa de error/éxito
- Feedback de usuarios
