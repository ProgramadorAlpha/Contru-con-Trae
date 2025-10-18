# API Endpoints - AI Features

## Resumen

Documentación de los endpoints backend necesarios para las funcionalidades de IA.

## Autenticación

Todos los endpoints requieren autenticación mediante JWT token en el header:

```
Authorization: Bearer <token>
```

## Endpoints

### 1. Chat Conversacional

#### POST /api/claude/chat

Envía un mensaje al asistente de IA y recibe una respuesta.

**Request:**
```json
{
  "message": "¿Cuál es el presupuesto del proyecto Casa Azul?",
  "context": {
    "userId": "user-123",
    "projectsData": [...],
    "recentTransactions": [...],
    "conversationHistory": [...]
  }
}
```

**Response:**
```json
{
  "message": "El presupuesto del proyecto Casa Azul es de $500,000 MXN...",
  "suggestions": [
    "Ver desglose por categoría",
    "Comparar con otros proyectos"
  ],
  "visualData": {
    "type": "chart",
    "data": {...}
  }
}
```

---

### 2. Análisis de Recibos

#### POST /api/claude/analyze-receipt

Analiza una imagen de recibo/factura y extrae datos estructurados.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "projectContext": [...]
}
```

**Response:**
```json
{
  "extractedData": {
    "total": 1250.50,
    "date": "2024-01-15",
    "supplier": "Ferretería El Constructor",
    "items": ["Cemento gris 50kg x 10", "Arena fina 1m³"],
    "rfc": "FEC850101ABC",
    "invoiceNumber": "A-12345"
  },
  "suggestedCategory": "materiales",
  "suggestedProject": "proyecto-123",
  "confidence": 0.92
}
```

---

### 3. Transcripción de Voz

#### POST /api/claude/voice-to-text

Transcribe audio y extrae datos de transacción.

**Request:**
```
Content-Type: multipart/form-data

audio: <audio_file>
language: "es-MX"
```

**Response:**
```json
{
  "transcription": "Gasté 500 pesos en cemento para el proyecto casa azul",
  "extractedData": {
    "amount": 500,
    "category": "materiales",
    "project": "casa-azul",
    "description": "Cemento"
  },
  "confidence": 0.85
}
```

---

### 4. Búsqueda Semántica

#### POST /api/claude/semantic-search

Busca documentos usando lenguaje natural.

**Request:**
```json
{
  "query": "contratos relacionados con electricidad",
  "filters": {
    "projectId": "proyecto-123",
    "folder": "Contratos",
    "dateRange": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    }
  }
}
```

**Response:**
```json
{
  "results": [
    {
      "documentId": "doc-1",
      "documentName": "Contrato Electricidad - Proyecto Casa Azul.pdf",
      "relevance": 0.95,
      "highlights": ["instalaciones eléctricas", "proyecto casa azul"],
      "snippet": "Contrato para instalaciones eléctricas..."
    }
  ],
  "totalResults": 5,
  "processingTime": 450
}
```

---

### 5. Categorización de Documentos

#### POST /api/claude/categorize-document

Categoriza automáticamente un documento.

**Request:**
```
Content-Type: multipart/form-data

file: <document_file>
content: "optional_text_content"
```

**Response:**
```json
{
  "suggestedFolder": "Contratos",
  "confidence": 0.92,
  "extractedMetadata": {
    "date": "2024-01-15",
    "parties": ["Empresa ABC", "Proveedor XYZ"],
    "amount": 50000,
    "type": "Contrato de servicios"
  },
  "reasoning": "El documento parece ser un contrato basado en..."
}
```

---

### 6. Análisis Masivo

#### POST /api/ai/bulk-analysis

Analiza múltiples facturas de una carpeta.

**Request:**
```json
{
  "folderId": "folder-123",
  "options": {
    "detectDuplicates": true,
    "findInconsistencies": true
  }
}
```

**Response:**
```json
{
  "totalDocuments": 45,
  "processedDocuments": 43,
  "failedDocuments": 2,
  "summary": {
    "totalAmount": 125430.50,
    "byCategory": {
      "Materiales": 78500.00,
      "Mano de Obra": 32100.00
    },
    "byProject": {...},
    "bySupplier": {...}
  },
  "duplicates": [...],
  "inconsistencies": [...]
}
```

---

### 7. Alertas Inteligentes

#### GET /api/ai/alerts

Obtiene alertas inteligentes.

**Query Parameters:**
- `type`: contract_expiring | permit_renewal | invoice_overdue
- `severity`: low | medium | high | critical
- `isRead`: true | false

**Response:**
```json
[
  {
    "id": "alert-1",
    "type": "contract_expiring",
    "severity": "high",
    "title": "Contrato próximo a vencer",
    "message": "El contrato con Proveedor XYZ vence en 15 días",
    "documentId": "doc-123",
    "projectId": "proj-456",
    "dueDate": "2024-02-01T00:00:00Z",
    "createdAt": "2024-01-15T10:30:00Z",
    "isRead": false
  }
]
```

#### PATCH /api/ai/alerts/:id/read

Marca una alerta como leída.

**Response:**
```json
{
  "success": true
}
```

---

### 8. Métricas de IA

#### GET /api/ai/metrics

Obtiene métricas de uso de IA.

**Query Parameters:**
- `from`: fecha inicio (ISO 8601)
- `to`: fecha fin (ISO 8601)

**Response:**
```json
{
  "totalUsage": 1247,
  "usageByFeature": {
    "chat": 523,
    "receipt_scan": 412,
    "voice": 198,
    "search": 87,
    "categorization": 27
  },
  "averageProcessingTime": 1850,
  "averageConfidence": 0.89,
  "adoptionRate": 0.67,
  "topUsers": [
    { "userId": "user-1", "usageCount": 234 }
  ]
}
```

#### POST /api/ai/logs

Registra el uso de una funcionalidad de IA.

**Request:**
```json
{
  "userId": "user-123",
  "feature": "receipt_scan",
  "action": "analyze_receipt",
  "inputData": {...},
  "outputData": {...},
  "confidence": 0.92,
  "processingTime": 1850
}
```

**Response:**
```json
{
  "success": true,
  "logId": "log-123"
}
```

---

## Códigos de Error

### 400 Bad Request
- Datos de entrada inválidos
- Imagen corrupta o formato no soportado
- Audio en formato no compatible

### 401 Unauthorized
- Token de autenticación inválido o expirado

### 403 Forbidden
- Usuario sin permisos para acceder al recurso

### 429 Too Many Requests
- Rate limit excedido (100 requests/hora)

### 500 Internal Server Error
- Error en Claude API
- Error en procesamiento de datos

### 503 Service Unavailable
- Claude API no disponible temporalmente

---

## Rate Limiting

- **Límite general**: 100 requests/hora por usuario
- **Chat**: 50 mensajes/hora
- **Análisis de recibos**: 30 análisis/hora
- **Voz**: 20 transcripciones/hora
- **Búsqueda**: Sin límite (usa cache)

Headers de respuesta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 85
X-RateLimit-Reset: 1640000000
```

---

## Webhooks (N8N Integration)

### Expense Created
Trigger cuando se crea un gasto via IA.

**Payload:**
```json
{
  "event": "expense.created",
  "source": "ai",
  "data": {
    "expenseId": "exp-123",
    "amount": 500,
    "category": "materiales",
    "createdBy": "user-123",
    "confidence": 0.92
  }
}
```

### Receipt Processed
Trigger cuando se procesa un recibo.

**Payload:**
```json
{
  "event": "receipt.processed",
  "data": {
    "receiptId": "receipt-123",
    "expenseId": "exp-123",
    "documentId": "doc-123",
    "extractedData": {...}
  }
}
```

### Alert Generated
Trigger cuando se genera una alerta.

**Payload:**
```json
{
  "event": "alert.generated",
  "data": {
    "alertId": "alert-123",
    "type": "contract_expiring",
    "severity": "high",
    "affectedUsers": ["user-123", "user-456"]
  }
}
```

---

## Seguridad

### Encriptación
- Todas las comunicaciones usan HTTPS/TLS 1.3
- Imágenes se encriptan en storage
- Logs se encriptan en base de datos

### Sanitización
- Datos se limpian antes de enviar a Claude
- Se remueve información no necesaria
- Se validan todos los inputs

### Auditoría
- Todos los requests se registran
- Logs incluyen: usuario, timestamp, acción, resultado
- Retención de logs: 90 días

---

## Ejemplos de Implementación

### Node.js/Express

```javascript
// POST /api/claude/chat
app.post('/api/claude/chat', authenticate, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Preparar prompt
    const systemPrompt = buildSystemPrompt(context);
    
    // Llamar a Claude
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: message }]
    });
    
    res.json({
      message: response.content[0].text
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Python/FastAPI

```python
@app.post("/api/claude/analyze-receipt")
async def analyze_receipt(
    image: str,
    project_context: list,
    current_user: User = Depends(get_current_user)
):
    try:
        # Llamar a Claude Vision
        response = anthropic.messages.create(
            model="claude-3-5-sonnet-20241022",
            max_tokens=1024,
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": image
                        }
                    },
                    {
                        "type": "text",
                        "text": "Analiza este recibo y extrae los datos..."
                    }
                ]
            }]
        )
        
        extracted_data = json.loads(response.content[0].text)
        
        return {
            "extractedData": extracted_data,
            "suggestedCategory": categorize(extracted_data),
            "confidence": 0.92
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

## Testing

### Postman Collection

Importa la colección de Postman para probar todos los endpoints:

```bash
curl -o ai-endpoints.postman_collection.json \
  https://api.constructpro.com/docs/postman
```

### cURL Examples

```bash
# Chat
curl -X POST https://api.constructpro.com/api/claude/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hola", "context": {}}'

# Analyze Receipt
curl -X POST https://api.constructpro.com/api/claude/analyze-receipt \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64...", "projectContext": []}'
```

---

## Monitoreo

### Métricas a Monitorear

- Latencia promedio por endpoint
- Tasa de error
- Uso de tokens de Claude
- Rate limit hits
- Confianza promedio de extracciones

### Alertas

- Latencia > 5 segundos
- Tasa de error > 5%
- Rate limit > 80%
- Claude API down

---

## Changelog

### v1.0.0 (2024-01-15)
- Implementación inicial de todos los endpoints
- Soporte para chat, recibos y voz
- Sistema de métricas y alertas

---

## Soporte

Para preguntas o problemas:
- Email: dev@constructpro.com
- Slack: #ai-features
- Docs: https://docs.constructpro.com/ai
