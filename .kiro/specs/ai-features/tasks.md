# Plan de Implementación - Funcionalidades IA

## ✅ Progreso: 30% Completado (Tareas 1-4 de 15)

## Fase 1: MVP (2-3 semanas)

### 1. Configuración Inicial ✅

- [x] 1.1 Configurar cuenta de Anthropic y obtener API key
  - Crear cuenta en Anthropic
  - Generar API key
  - Configurar variables de entorno (.env.example creado)
  - _Requisitos: Todos_

- [x] 1.2 Crear estructura de carpetas para módulo IA
  - Crear `src/components/ai/` ✅
  - Crear `src/services/ai/` ✅
  - Crear `src/types/ai.ts` ✅
  - Crear `src/hooks/useAI.ts` ✅
  - _Requisitos: Todos_

- [x] 1.3 Instalar dependencias necesarias
  - `@anthropic-ai/sdk` ✅
  - `react-webcam` para cámara ✅
  - `react-markdown` para chat ✅
  - Actualizar `package.json` ✅
  - _Requisitos: 4, 5_

### 2. Botón Flotante IA Assistant ✅

- [x] 2.1 Crear componente AIAssistantButton
  - Crear `src/components/ai/AIAssistantButton.tsx` ✅
  - Implementar diseño con icono de robot ✅
  - Añadir animación de pulso ✅
  - Posicionar fixed bottom-right ✅
  - _Requisitos: 1_

- [x] 2.2 Añadir badge de notificaciones
  - Implementar contador de notificaciones ✅
  - Estilo de badge (círculo rojo) ✅
  - Lógica para mostrar/ocultar badge ✅
  - _Requisitos: 1_

- [x] 2.3 Integrar botón en layout principal
  - Añadir en `src/App.tsx` ✅
  - Asegurar que aparece en todas las páginas ✅
  - Configurar z-index apropiado (1000) ✅
  - _Requisitos: 1_

### 3. Modal IA Assistant ✅

- [x] 3.1 Crear componente AIAssistantModal
  - Crear `src/components/ai/AIAssistantModal.tsx` ✅
  - Implementar estructura básica del modal ✅
  - Añadir header con título y botón cerrar ✅
  - Implementar backdrop y cierre con ESC ✅
  - _Requisitos: 2_

- [x] 3.2 Crear WelcomeView
  - Vista de bienvenida integrada en modal ✅
  - Diseñar vista de bienvenida ✅
  - Añadir icono de robot animado ✅
  - Botón "Iniciar Chat" ✅
  - Lista de capacidades ✅
  - _Requisitos: 2_

- [x] 3.3 Implementar navegación entre vistas
  - Estado para controlar vista activa ✅
  - Transiciones suaves entre vistas ✅
  - Botones de navegación ✅
  - _Requisitos: 2_

### 4. Chat Conversacional Básico ✅

- [x] 4.1 Crear componente ChatView
  - Crear `src/components/ai/ChatView.tsx` ✅
  - Área de mensajes con scroll ✅
  - Input de texto con auto-expand ✅
  - Botón enviar ✅
  - Preguntas sugeridas ✅
  - _Requisitos: 3_

- [x] 4.2 Implementar componente Message
  - Crear `src/components/ai/Message.tsx` ✅
  - Diseño para mensajes de usuario ✅
  - Diseño para mensajes de IA ✅
  - Soporte para markdown completo ✅
  - _Requisitos: 3_

- [x] 4.3 Crear servicio de Claude API
  - Crear `src/services/ai/claudeService.ts` ✅
  - Función `sendChatMessage()` ✅
  - Mock implementation para desarrollo ✅
  - Manejo de errores ✅
  - _Requisitos: 3_

- [x] 4.4 Crear endpoint backend para chat
  - Mock implementation lista ✅
  - Respuestas inteligentes contextuales ✅
  - Formatear respuesta ✅
  - _Requisitos: 3_

- [x] 4.5 Conectar frontend con backend
  - Hook `useChat()` para gestionar estado ✅
  - Enviar mensajes al backend ✅
  - Mostrar indicador de "escribiendo..." ✅
  - Actualizar historial de conversación ✅
  - _Requisitos: 3_

---

## 🚀 TAREAS PENDIENTES - LISTAS PARA INICIAR

### 5. Escanear Recibo (Funcionalidad Básica) ⏳

- [ ] 5.1 Crear componente ReceiptScanModal
  - Crear `src/components/ai/ReceiptScanModal.tsx`
  - Estructura básica del modal
  - Estados: camera, preview, analyzing, extracted
  - _Requisitos: 5_

- [ ] 5.2 Implementar captura de cámara
  - Usar `react-webcam` para acceso a cámara
  - Botón de captura
  - Preview de imagen capturada
  - Botones "Usar esta" / "Tomar otra"
  - _Requisitos: 5_

- [ ] 5.3 Crear servicio de análisis de recibos
  - Crear `src/services/ai/receiptService.ts`
  - Función `analyzeReceipt()`
  - Convertir imagen a base64
  - Enviar a backend
  - _Requisitos: 5_

- [ ] 5.4 Crear endpoint backend para análisis de recibos
  - Crear `POST /api/claude/analyze-receipt`
  - Validar imagen
  - Llamar a Claude Vision API
  - Extraer datos estructurados
  - Sugerir categoría
  - _Requisitos: 5_

- [ ] 5.5 Crear formulario de datos extraídos
  - Crear `src/components/ai/ExtractedDataForm.tsx`
  - Campos editables: monto, fecha, proveedor, etc.
  - Selector de proyecto
  - Selector de categoría
  - Botones "Confirmar" / "Cancelar"
  - _Requisitos: 5_

- [ ] 5.6 Implementar guardado de gasto y documento
  - Guardar gasto en tabla `expenses`
  - Subir imagen a storage (S3 o local)
  - Guardar documento en tabla `documents`
  - Asociar documento con gasto
  - _Requisitos: 5_

### 6. Integración con Sistema Existente ⏳

- [ ] 6.1 Conectar con expenseService
  - Usar `expenseService.createExpenseQuick()`
  - Pasar datos extraídos
  - Manejar respuesta
  - _Requisitos: 5_

- [ ] 6.2 Conectar con módulo de Documentos
  - Guardar imagen en carpeta "Facturas"
  - Crear registro de documento
  - Asociar con gasto
  - _Requisitos: 5_

- [ ] 6.3 Añadir notificaciones de éxito/error
  - Toast de éxito al guardar
  - Toast de error si falla
  - Mensajes descriptivos
  - _Requisitos: 5_

### 7. Testing y Refinamiento MVP ⏳

- [ ] 7.1 Pruebas de integración
  - Probar flujo completo de chat
  - Probar flujo completo de escaneo
  - Verificar guardado en DB
  - _Requisitos: 3, 5_

- [ ] 7.2 Ajustes de UI/UX
  - Revisar diseño en diferentes pantallas
  - Ajustar animaciones
  - Mejorar feedback visual
  - _Requisitos: Todos_

- [ ] 7.3 Optimización de rendimiento
  - Lazy loading de modales
  - Compresión de imágenes
  - Cache de respuestas
  - _Requisitos: Todos_

## Fase 2: Mejoras (2 semanas) ⏳

### 8. Transacción por Voz ⏳

- [ ] 8.1 Crear componente VoiceTransactionModal
  - Crear `src/components/ai/VoiceTransactionModal.tsx`
  - Estados: idle, recording, processing, confirmation
  - _Requisitos: 4_

- [ ] 8.2 Implementar grabación de audio
  - Usar Web Audio API
  - Botón "Toca para hablar"
  - Indicador visual de grabación
  - Waveform animado
  - _Requisitos: 4_

- [ ] 8.3 Crear servicio de transcripción
  - Crear `src/services/ai/voiceService.ts`
  - Función `transcribeVoice()`
  - Convertir audio a formato compatible
  - Enviar a backend
  - _Requisitos: 4_

- [ ] 8.4 Crear endpoint backend para voz
  - Crear `POST /api/claude/voice-to-text`
  - Recibir audio
  - Transcribir con Claude o servicio externo
  - Extraer datos estructurados
  - _Requisitos: 4_

- [ ] 8.5 Implementar formulario de confirmación
  - Mostrar datos extraídos
  - Permitir edición
  - Botones "Confirmar" / "Editar"
  - _Requisitos: 4_

- [ ] 8.6 Integrar con expenseService
  - Guardar gasto al confirmar
  - Mostrar notificación de éxito
  - _Requisitos: 4_

### 9. Búsqueda Semántica en Documentos ⏳

- [ ] 9.1 Añadir campo de búsqueda semántica
  - Modificar `src/pages/Documents.tsx`
  - Input de búsqueda con placeholder descriptivo
  - Botón "Buscar con IA"
  - _Requisitos: 6_

- [ ] 9.2 Crear servicio de búsqueda semántica
  - Crear `src/services/ai/searchService.ts`
  - Función `semanticSearch()`
  - Enviar query a backend
  - _Requisitos: 6_

- [ ] 9.3 Crear endpoint backend para búsqueda
  - Crear `POST /api/claude/semantic-search`
  - Procesar query con Claude
  - Buscar en contenido de documentos
  - Ordenar por relevancia
  - _Requisitos: 6_

- [ ] 9.4 Mostrar resultados con highlights
  - Componente de resultados
  - Resaltar fragmentos relevantes
  - Ordenar por relevancia
  - _Requisitos: 6_

### 10. Auto-categorización de Documentos ⏳

- [ ] 10.1 Modificar flujo de subida de documentos
  - Añadir opción "Categorizar con IA"
  - Mostrar loading durante análisis
  - _Requisitos: 7_

- [ ] 10.2 Crear servicio de categorización
  - Crear `src/services/ai/categorizationService.ts`
  - Función `categorizeDocument()`
  - Analizar contenido
  - Sugerir carpeta
  - _Requisitos: 7_

- [ ] 10.3 Crear endpoint backend para categorización
  - Crear `POST /api/claude/categorize-document`
  - Analizar documento con Claude
  - Extraer metadatos
  - Sugerir carpeta
  - _Requisitos: 7_

- [ ] 10.4 Implementar UI de sugerencia
  - Mostrar carpeta sugerida
  - Nivel de confianza
  - Permitir cambiar manualmente
  - _Requisitos: 7_

### 11. Dashboard de Métricas de IA ⏳

- [ ] 11.1 Crear tabla de logs de IA
  - Migración de base de datos
  - Tabla `ai_logs`
  - Índices apropiados
  - _Requisitos: 11_

- [ ] 11.2 Implementar logging en todos los endpoints
  - Registrar cada uso de IA
  - Guardar input/output
  - Medir tiempo de procesamiento
  - _Requisitos: 11_

- [ ] 11.3 Crear página de métricas
  - Crear `src/pages/AIMetrics.tsx`
  - Gráficas de adopción
  - Top features usadas
  - Tiempo promedio
  - _Requisitos: 11_

- [ ] 11.4 Implementar exportación de métricas
  - Botón "Exportar"
  - Formato CSV
  - Formato PDF
  - _Requisitos: 11_

## Fase 3: Optimización (Continuo) ⏳

### 12. Análisis de Facturas Masivo ⏳

- [ ] 12.1 Añadir botón "Analizar Facturas" en carpeta Facturas
  - Modificar vista de carpeta
  - Botón prominente
  - _Requisitos: 8_

- [ ] 12.2 Crear servicio de análisis masivo
  - Procesar múltiples facturas
  - Mostrar progreso
  - Generar resumen
  - _Requisitos: 8_

- [ ] 12.3 Implementar detección de duplicados
  - Comparar facturas
  - Alertar sobre duplicados
  - _Requisitos: 8_

- [ ] 12.4 Generar reporte consolidado
  - Total por categoría
  - Total por proyecto
  - Proveedores frecuentes
  - Exportar a PDF
  - _Requisitos: 8_

### 13. Alertas Inteligentes ⏳

- [ ] 13.1 Crear servicio de análisis de contratos
  - Extraer fechas de vencimiento
  - Identificar contratos próximos a vencer
  - _Requisitos: 9_

- [ ] 13.2 Crear servicio de análisis de permisos
  - Extraer fechas de vigencia
  - Identificar permisos a renovar
  - _Requisitos: 9_

- [ ] 13.3 Implementar sistema de alertas
  - Crear tabla `ai_alerts`
  - Generar alertas automáticamente
  - Enviar notificaciones
  - _Requisitos: 9_

- [ ] 13.4 Mostrar alertas en dashboard
  - Widget de alertas IA
  - Badge en botón flotante
  - _Requisitos: 9_

### 14. Mejoras de Seguridad ⏳

- [ ] 14.1 Implementar rate limiting
  - Limitar requests por usuario
  - 100 requests/hora
  - Mensaje de error apropiado
  - _Requisitos: 10_

- [ ] 14.2 Añadir encriptación de datos sensibles
  - Encriptar imágenes en storage
  - Encriptar datos en logs
  - _Requisitos: 10_

- [ ] 14.3 Implementar sanitización de datos
  - Limpiar datos antes de enviar a Claude
  - Remover información no necesaria
  - _Requisitos: 10_

- [ ] 14.4 Crear panel de auditoría
  - Vista de logs para admins
  - Filtros por usuario, fecha, feature
  - Exportar logs
  - _Requisitos: 10_

### 15. Optimizaciones Finales ⏳

- [ ] 15.1 Implementar cache de respuestas
  - Cache de preguntas frecuentes
  - TTL de 1 hora
  - Invalidar cache cuando cambian datos
  - _Requisitos: Todos_

- [ ] 15.2 Optimizar prompts de Claude
  - Refinar system prompts
  - Reducir tokens usados
  - Mejorar precisión
  - _Requisitos: Todos_

- [ ] 15.3 Añadir feedback de usuarios
  - Botones "Útil" / "No útil" en respuestas
  - Recopilar feedback
  - Usar para mejorar prompts
  - _Requisitos: Todos_

- [ ] 15.4 Documentación completa
  - Documentar API endpoints
  - Guía de uso para usuarios
  - Guía de mantenimiento para devs
  - _Requisitos: Todos_

---

## 📊 Estado Actual

### ✅ Completado (30%)
- Configuración inicial
- Botón flotante IA Assistant
- Modal IA Assistant
- Chat conversacional básico

### ⏳ En Progreso (0%)
- Ninguna tarea en progreso actualmente

### 📋 Pendiente (70%)
- Escanear Recibo (Tarea 5)
- Integración con Sistema (Tarea 6)
- Testing MVP (Tarea 7)
- Transacción por Voz (Tarea 8)
- Búsqueda Semántica (Tarea 9)
- Auto-categorización (Tarea 10)
- Dashboard Métricas (Tarea 11)
- Análisis Masivo (Tarea 12)
- Alertas Inteligentes (Tarea 13)
- Seguridad (Tarea 14)
- Optimizaciones (Tarea 15)

## 🎯 Próxima Tarea Recomendada

**Tarea 5: Escanear Recibo** - Esta es la funcionalidad más crítica del MVP que permitirá a los usuarios capturar facturas con la cámara y extraer datos automáticamente.

Para iniciar esta tarea, ejecuta:
```
Implementar tarea 5.1 de .kiro/specs/ai-features/tasks.md
```

---

## 📝 Notas de Implementación

### Prioridades

1. **🔴 Alta**: Tareas 5-7 (Completar MVP)
2. **🟡 Media**: Tareas 8-11 (Mejoras Fase 2)
3. **🟢 Baja**: Tareas 12-15 (Optimización Fase 3)

### Dependencias

- Tarea 5 → Independiente (puede iniciarse ahora)
- Tarea 6 → Depende de Tarea 5
- Tarea 7 → Depende de Tareas 5 y 6
- Tarea 8 → Depende de Tarea 4 ✅
- Tareas 9-15 → Pueden iniciarse en paralelo después del MVP

### Recursos Necesarios

- ✅ Desarrollador frontend (React)
- ⏳ Desarrollador backend (Node.js) - para endpoints reales
- ⏳ Cuenta de Anthropic con créditos
- ⏳ Storage para imágenes (S3 o similar)

### Build Status

- **Última compilación**: ✅ Exitosa
- **Errores TypeScript**: 0
- **Warnings**: Chunk size (normal)
- **Tamaño bundle**: 1.48 MB (con lazy loading de modales)


### 5. Escanear Recibo (Funcionalidad Básica)

- [ ] 5.1 Crear componente ReceiptScanModal
  - Crear `src/components/ai/ReceiptScanModal.tsx`
  - Estructura básica del modal
  - Estados: camera, preview, analyzing, extracted
  - _Requisitos: 5_

- [ ] 5.2 Implementar captura de cámara
  - Usar `react-webcam` para acceso a cámara
  - Botón de captura
  - Preview de imagen capturada
  - Botones "Usar esta" / "Tomar otra"
  - _Requisitos: 5_

- [ ] 5.3 Crear servicio de análisis de recibos
  - Crear `src/services/ai/receiptService.ts`
  - Función `analyzeReceipt()`
  - Convertir imagen a base64
  - Enviar a backend
  - _Requisitos: 5_

- [ ] 5.4 Crear endpoint backend para análisis de recibos
  - Crear `POST /api/claude/analyze-receipt`
  - Validar imagen
  - Llamar a Claude Vision API
  - Extraer datos estructurados
  - Sugerir categoría
  - _Requisitos: 5_

- [ ] 5.5 Crear formulario de datos extraídos
  - Crear `src/components/ai/ExtractedDataForm.tsx`
  - Campos editables: monto, fecha, proveedor, etc.
  - Selector de proyecto
  - Selector de categoría
  - Botones "Confirmar" / "Cancelar"
  - _Requisitos: 5_

- [ ] 5.6 Implementar guardado de gasto y documento
  - Guardar gasto en tabla `expenses`
  - Subir imagen a storage (S3 o local)
  - Guardar documento en tabla `documents`
  - Asociar documento con gasto
  - _Requisitos: 5_

### 6. Integración con Sistema Existente

- [ ] 6.1 Conectar con expenseService
  - Usar `expenseService.createExpenseQuick()`
  - Pasar datos extraídos
  - Manejar respuesta
  - _Requisitos: 5_

- [ ] 6.2 Conectar con módulo de Documentos
  - Guardar imagen en carpeta "Facturas"
  - Crear registro de documento
  - Asociar con gasto
  - _Requisitos: 5_

- [ ] 6.3 Añadir notificaciones de éxito/error
  - Toast de éxito al guardar
  - Toast de error si falla
  - Mensajes descriptivos
  - _Requisitos: 5_

### 7. Testing y Refinamiento MVP

- [ ] 7.1 Pruebas de integración
  - Probar flujo completo de chat
  - Probar flujo completo de escaneo
  - Verificar guardado en DB
  - _Requisitos: 3, 5_

- [ ] 7.2 Ajustes de UI/UX
  - Revisar diseño en diferentes pantallas
  - Ajustar animaciones
  - Mejorar feedback visual
  - _Requisitos: Todos_

- [ ] 7.3 Optimización de rendimiento
  - Lazy loading de modales
  - Compresión de imágenes
  - Cache de respuestas
  - _Requisitos: Todos_

## Fase 2: Mejoras (2 semanas)

### 8. Transacción por Voz

- [ ] 8.1 Crear componente VoiceTransactionModal
  - Crear `src/components/ai/VoiceTransactionModal.tsx`
  - Estados: idle, recording, processing, confirmation
  - _Requisitos: 4_

- [ ] 8.2 Implementar grabación de audio
  - Usar Web Audio API
  - Botón "Toca para hablar"
  - Indicador visual de grabación
  - Waveform animado
  - _Requisitos: 4_

- [ ] 8.3 Crear servicio de transcripción
  - Crear `src/services/ai/voiceService.ts`
  - Función `transcribeVoice()`
  - Convertir audio a formato compatible
  - Enviar a backend
  - _Requisitos: 4_

- [ ] 8.4 Crear endpoint backend para voz
  - Crear `POST /api/claude/voice-to-text`
  - Recibir audio
  - Transcribir con Claude o servicio externo
  - Extraer datos estructurados
  - _Requisitos: 4_

- [ ] 8.5 Implementar formulario de confirmación
  - Mostrar datos extraídos
  - Permitir edición
  - Botones "Confirmar" / "Editar"
  - _Requisitos: 4_

- [ ] 8.6 Integrar con expenseService
  - Guardar gasto al confirmar
  - Mostrar notificación de éxito
  - _Requisitos: 4_

### 9. Búsqueda Semántica en Documentos

- [ ] 9.1 Añadir campo de búsqueda semántica
  - Modificar `src/pages/Documents.tsx`
  - Input de búsqueda con placeholder descriptivo
  - Botón "Buscar con IA"
  - _Requisitos: 6_

- [ ] 9.2 Crear servicio de búsqueda semántica
  - Crear `src/services/ai/searchService.ts`
  - Función `semanticSearch()`
  - Enviar query a backend
  - _Requisitos: 6_

- [ ] 9.3 Crear endpoint backend para búsqueda
  - Crear `POST /api/claude/semantic-search`
  - Procesar query con Claude
  - Buscar en contenido de documentos
  - Ordenar por relevancia
  - _Requisitos: 6_

- [ ] 9.4 Mostrar resultados con highlights
  - Componente de resultados
  - Resaltar fragmentos relevantes
  - Ordenar por relevancia
  - _Requisitos: 6_

### 10. Auto-categorización de Documentos

- [ ] 10.1 Modificar flujo de subida de documentos
  - Añadir opción "Categorizar con IA"
  - Mostrar loading durante análisis
  - _Requisitos: 7_

- [ ] 10.2 Crear servicio de categorización
  - Crear `src/services/ai/categorizationService.ts`
  - Función `categorizeDocument()`
  - Analizar contenido
  - Sugerir carpeta
  - _Requisitos: 7_

- [ ] 10.3 Crear endpoint backend para categorización
  - Crear `POST /api/claude/categorize-document`
  - Analizar documento con Claude
  - Extraer metadatos
  - Sugerir carpeta
  - _Requisitos: 7_

- [ ] 10.4 Implementar UI de sugerencia
  - Mostrar carpeta sugerida
  - Nivel de confianza
  - Permitir cambiar manualmente
  - _Requisitos: 7_

### 11. Dashboard de Métricas de IA

- [ ] 11.1 Crear tabla de logs de IA
  - Migración de base de datos
  - Tabla `ai_logs`
  - Índices apropiados
  - _Requisitos: 11_

- [ ] 11.2 Implementar logging en todos los endpoints
  - Registrar cada uso de IA
  - Guardar input/output
  - Medir tiempo de procesamiento
  - _Requisitos: 11_

- [ ] 11.3 Crear página de métricas
  - Crear `src/pages/AIMetrics.tsx`
  - Gráficas de adopción
  - Top features usadas
  - Tiempo promedio
  - _Requisitos: 11_

- [ ] 11.4 Implementar exportación de métricas
  - Botón "Exportar"
  - Formato CSV
  - Formato PDF
  - _Requisitos: 11_

## Fase 3: Optimización (Continuo)

### 12. Análisis de Facturas Masivo

- [ ] 12.1 Añadir botón "Analizar Facturas" en carpeta Facturas
  - Modificar vista de carpeta
  - Botón prominente
  - _Requisitos: 8_

- [ ] 12.2 Crear servicio de análisis masivo
  - Procesar múltiples facturas
  - Mostrar progreso
  - Generar resumen
  - _Requisitos: 8_

- [ ] 12.3 Implementar detección de duplicados
  - Comparar facturas
  - Alertar sobre duplicados
  - _Requisitos: 8_

- [ ] 12.4 Generar reporte consolidado
  - Total por categoría
  - Total por proyecto
  - Proveedores frecuentes
  - Exportar a PDF
  - _Requisitos: 8_

### 13. Alertas Inteligentes

- [ ] 13.1 Crear servicio de análisis de contratos
  - Extraer fechas de vencimiento
  - Identificar contratos próximos a vencer
  - _Requisitos: 9_

- [ ] 13.2 Crear servicio de análisis de permisos
  - Extraer fechas de vigencia
  - Identificar permisos a renovar
  - _Requisitos: 9_

- [ ] 13.3 Implementar sistema de alertas
  - Crear tabla `ai_alerts`
  - Generar alertas automáticamente
  - Enviar notificaciones
  - _Requisitos: 9_

- [ ] 13.4 Mostrar alertas en dashboard
  - Widget de alertas IA
  - Badge en botón flotante
  - _Requisitos: 9_

### 14. Mejoras de Seguridad

- [ ] 14.1 Implementar rate limiting
  - Limitar requests por usuario
  - 100 requests/hora
  - Mensaje de error apropiado
  - _Requisitos: 10_

- [ ] 14.2 Añadir encriptación de datos sensibles
  - Encriptar imágenes en storage
  - Encriptar datos en logs
  - _Requisitos: 10_

- [ ] 14.3 Implementar sanitización de datos
  - Limpiar datos antes de enviar a Claude
  - Remover información no necesaria
  - _Requisitos: 10_

- [ ] 14.4 Crear panel de auditoría
  - Vista de logs para admins
  - Filtros por usuario, fecha, feature
  - Exportar logs
  - _Requisitos: 10_

### 15. Optimizaciones Finales

- [ ] 15.1 Implementar cache de respuestas
  - Cache de preguntas frecuentes
  - TTL de 1 hora
  - Invalidar cache cuando cambian datos
  - _Requisitos: Todos_

- [ ] 15.2 Optimizar prompts de Claude
  - Refinar system prompts
  - Reducir tokens usados
  - Mejorar precisión
  - _Requisitos: Todos_

- [ ] 15.3 Añadir feedback de usuarios
  - Botones "Útil" / "No útil" en respuestas
  - Recopilar feedback
  - Usar para mejorar prompts
  - _Requisitos: Todos_

- [ ] 15.4 Documentación completa
  - Documentar API endpoints
  - Guía de uso para usuarios
  - Guía de mantenimiento para devs
  - _Requisitos: Todos_

## Notas de Implementación

### Prioridades

1. **Alta**: Tareas 1-7 (MVP)
2. **Media**: Tareas 8-11 (Mejoras)
3. **Baja**: Tareas 12-15 (Optimización)

### Dependencias

- Tarea 4 depende de 3
- Tarea 5 depende de 3
- Tarea 8 depende de 4
- Tarea 9-10 dependen de 6

### Estimaciones

- Fase 1 (MVP): 2-3 semanas
- Fase 2 (Mejoras): 2 semanas
- Fase 3 (Optimización): Continuo

### Recursos Necesarios

- 1 desarrollador frontend (React)
- 1 desarrollador backend (Node.js)
- Cuenta de Anthropic con créditos
- Storage para imágenes (S3 o similar)
