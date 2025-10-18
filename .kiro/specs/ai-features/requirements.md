# Requisitos - Funcionalidades IA en ConstructPro

## Introducción

Este documento define los requisitos para implementar funcionalidades avanzadas de Inteligencia Artificial en ConstructPro, utilizando la API de Claude de Anthropic. El sistema permitirá a los usuarios interactuar con la aplicación mediante voz, escaneo de documentos y chat conversacional.

## Glosario

- **IA Assistant**: Asistente de inteligencia artificial conversacional integrado en la aplicación
- **Claude API**: API de Anthropic para procesamiento de lenguaje natural y visión
- **OCR**: Optical Character Recognition - Reconocimiento óptico de caracteres
- **N8N**: Plataforma de automatización de workflows
- **Transacción por Voz**: Funcionalidad para registrar gastos mediante comandos de voz
- **Escanear Recibo**: Funcionalidad para extraer datos de recibos/facturas mediante fotografía

## Requisitos

### Requisito 1: Botón Flotante IA Assistant

**User Story:** Como usuario de ConstructPro, quiero tener acceso rápido al asistente de IA desde cualquier página de la aplicación, para poder hacer consultas sin interrumpir mi flujo de trabajo.

#### Criterios de Aceptación

1. WHEN el usuario está en cualquier página de la aplicación, THE Sistema SHALL mostrar un botón flotante en la esquina inferior derecha
2. WHEN el usuario hace clic en el botón flotante, THE Sistema SHALL abrir el modal del IA Assistant
3. WHEN hay notificaciones o alertas de IA, THE Sistema SHALL mostrar un badge numérico en el botón flotante
4. WHEN el usuario hace hover sobre el botón, THE Sistema SHALL mostrar una animación de pulso sutil
5. THE botón flotante SHALL tener un z-index superior a otros elementos para estar siempre visible

### Requisito 2: Modal IA Assistant

**User Story:** Como usuario, quiero ver un modal atractivo y funcional del asistente de IA, para entender las capacidades disponibles y acceder fácilmente al chat.

#### Criterios de Aceptación

1. WHEN el modal se abre, THE Sistema SHALL mostrar un icono de robot con destellos animados
2. THE modal SHALL mostrar el título "IA Assistant" y subtítulo "Análisis inteligente disponible"
3. THE modal SHALL incluir un botón prominente azul con el texto "Iniciar Chat"
4. THE modal SHALL mostrar la descripción "Pregunta sobre proyectos, presupuestos, cronogramas y más"
5. THE modal SHALL tener bordes punteados y fondo oscuro (#1a1f2e) consistente con el diseño de la aplicación
6. WHEN el usuario presiona ESC o hace clic fuera del modal, THE Sistema SHALL cerrar el modal

### Requisito 3: Chat Conversacional con IA

**User Story:** Como usuario, quiero poder hacer preguntas en lenguaje natural sobre mis proyectos y finanzas, para obtener información rápida sin navegar por múltiples pantallas.

#### Criterios de Aceptación

1. WHEN el usuario hace clic en "Iniciar Chat", THE Sistema SHALL abrir la interfaz de chat
2. THE Sistema SHALL mostrar un historial de conversación con mensajes del usuario y respuestas de la IA
3. WHEN el usuario envía un mensaje, THE Sistema SHALL mostrar un indicador de "escribiendo..." mientras la IA procesa
4. THE Sistema SHALL enviar el contexto del usuario (proyectos activos, transacciones recientes) junto con cada mensaje
5. WHEN la IA responde, THE Sistema SHALL formatear la respuesta con markdown (negritas, listas, tablas si aplica)
6. THE Sistema SHALL mantener el historial de conversación durante la sesión del usuario
7. WHEN el usuario pregunta sobre datos financieros, THE Sistema SHALL incluir gráficas visuales cuando sea relevante

### Requisito 4: Transacción por Voz

**User Story:** Como supervisor en obra, quiero registrar gastos mediante comandos de voz, para ahorrar tiempo cuando estoy en campo sin acceso fácil al teclado.

#### Criterios de Aceptación

1. WHEN el usuario selecciona "Transacción por Voz", THE Sistema SHALL solicitar permisos de micrófono
2. WHEN el usuario toca el botón de micrófono, THE Sistema SHALL iniciar la grabación y mostrar un indicador visual animado
3. WHILE el usuario habla, THE Sistema SHALL mostrar una forma de onda animada
4. WHEN el usuario termina de hablar, THE Sistema SHALL enviar el audio a Claude API para transcripción
5. THE Sistema SHALL extraer del comando de voz: monto, categoría, proyecto y descripción
6. WHEN la IA procesa el comando, THE Sistema SHALL mostrar un formulario de confirmación con los datos extraídos
7. THE formulario de confirmación SHALL permitir al usuario editar cualquier campo antes de guardar
8. WHEN el usuario confirma, THE Sistema SHALL guardar el gasto en la base de datos y mostrar notificación de éxito
9. IF la IA no puede extraer algún campo obligatorio, THE Sistema SHALL solicitar al usuario que lo complete manualmente

### Requisito 5: Escanear Recibo

**User Story:** Como administrador, quiero escanear recibos y facturas con la cámara, para automatizar la captura de datos y reducir errores de transcripción manual.

#### Criterios de Aceptación

1. WHEN el usuario selecciona "Escanear Recibo", THE Sistema SHALL solicitar permisos de cámara
2. WHEN el usuario toma una foto, THE Sistema SHALL mostrar un preview de la imagen capturada
3. THE Sistema SHALL enviar la imagen a Claude Vision API para análisis OCR
4. WHILE la IA procesa la imagen, THE Sistema SHALL mostrar un loading state con mensaje "Analizando recibo..."
5. THE Sistema SHALL extraer: monto total, fecha, proveedor, conceptos/items, RFC (si aplica), número de folio
6. WHEN la extracción es exitosa, THE Sistema SHALL mostrar un formulario editable con todos los datos extraídos
7. THE Sistema SHALL sugerir automáticamente la categoría del gasto basándose en los items
8. IF hay múltiples proyectos activos, THE Sistema SHALL mostrar una lista para que el usuario seleccione el proyecto
9. WHEN el usuario confirma, THE Sistema SHALL guardar el gasto en Finanzas Y guardar la imagen en Documentos/Facturas
10. THE Sistema SHALL asociar el documento de factura con el registro de gasto para trazabilidad

### Requisito 6: Búsqueda Semántica en Documentos

**User Story:** Como usuario, quiero buscar documentos usando lenguaje natural, para encontrar información relevante sin recordar nombres exactos de archivos.

#### Criterios de Aceptación

1. WHEN el usuario escribe una consulta en lenguaje natural en el buscador de documentos, THE Sistema SHALL usar Claude API para entender la intención
2. THE Sistema SHALL buscar en el contenido de los documentos, no solo en nombres de archivo
3. WHEN se encuentran resultados, THE Sistema SHALL ordenarlos por relevancia semántica
4. THE Sistema SHALL resaltar los fragmentos relevantes en los resultados
5. WHEN el usuario pregunta "contratos relacionados con electricidad", THE Sistema SHALL encontrar contratos que mencionen instalaciones eléctricas, aunque no contengan la palabra exacta

### Requisito 7: Auto-categorización de Documentos

**User Story:** Como usuario, quiero que el sistema sugiera automáticamente la carpeta correcta al subir un documento, para ahorrar tiempo y mantener la organización.

#### Criterios de Aceptación

1. WHEN el usuario sube un documento, THE Sistema SHALL analizar el contenido con Claude API
2. THE Sistema SHALL sugerir la carpeta más apropiada (Contratos, Planos, Facturas, Permisos, Reportes, Certificados)
3. THE Sistema SHALL extraer metadatos relevantes (fecha, partes involucradas, monto si aplica)
4. WHEN la confianza de la sugerencia es alta (>80%), THE Sistema SHALL auto-categorizar el documento
5. WHEN la confianza es media (50-80%), THE Sistema SHALL mostrar la sugerencia pero permitir al usuario cambiarla
6. WHEN la confianza es baja (<50%), THE Sistema SHALL solicitar al usuario que seleccione la carpeta manualmente

### Requisito 8: Análisis de Facturas Masivo

**User Story:** Como contador, quiero procesar múltiples facturas de la carpeta de Facturas, para generar reportes consolidados sin revisar cada factura individualmente.

#### Criterios de Aceptación

1. WHEN el usuario selecciona "Analizar Facturas" en la carpeta de Facturas, THE Sistema SHALL procesar todas las facturas no analizadas
2. THE Sistema SHALL extraer datos de cada factura: monto, fecha, proveedor, proyecto asociado
3. WHEN el análisis termina, THE Sistema SHALL generar un resumen con:
   - Total gastado por categoría
   - Total gastado por proyecto
   - Proveedores más frecuentes
   - Tendencias de gasto mensual
4. THE Sistema SHALL detectar facturas duplicadas y alertar al usuario
5. THE Sistema SHALL identificar inconsistencias (ej: facturas sin proyecto asociado, montos inusuales)

### Requisito 9: Alertas Inteligentes

**User Story:** Como gerente de proyecto, quiero recibir alertas proactivas sobre documentos importantes, para no perder fechas límite o renovaciones.

#### Criterios de Aceptación

1. THE Sistema SHALL analizar contratos y extraer fechas de vencimiento
2. WHEN un contrato está próximo a vencer (30 días antes), THE Sistema SHALL enviar una alerta al usuario
3. THE Sistema SHALL analizar permisos y extraer fechas de vigencia
4. WHEN un permiso necesita renovación, THE Sistema SHALL notificar con 15 días de anticipación
5. THE Sistema SHALL identificar facturas pendientes de pago basándose en fechas de vencimiento
6. WHEN hay facturas vencidas, THE Sistema SHALL mostrar una alerta en el dashboard
7. THE Sistema SHALL permitir al usuario configurar el tiempo de anticipación de las alertas

### Requisito 10: Seguridad y Privacidad

**User Story:** Como administrador del sistema, quiero asegurar que todas las interacciones con IA sean seguras y cumplan con regulaciones de privacidad, para proteger datos sensibles de la empresa.

#### Criterios de Aceptación

1. THE Sistema SHALL incluir el token de autenticación del usuario en todos los requests a Claude API
2. THE Sistema SHALL encriptar datos sensibles (facturas, contratos) en tránsito usando HTTPS
3. THE Sistema SHALL encriptar documentos almacenados en la base de datos
4. THE Sistema SHALL registrar todas las interacciones con IA en logs de auditoría
5. THE Sistema SHALL respetar los permisos de usuario (usuarios sin acceso a finanzas no pueden ver facturas)
6. THE Sistema SHALL sanitizar datos antes de enviarlos a Claude API (remover información no necesaria)
7. THE Sistema SHALL permitir a los administradores revisar logs de uso de IA
8. THE Sistema SHALL cumplir con GDPR/CCPA permitiendo a usuarios solicitar eliminación de sus datos de IA

### Requisito 11: Métricas y Monitoreo

**User Story:** Como administrador, quiero ver métricas de uso de las funcionalidades de IA, para evaluar su adopción y efectividad.

#### Criterios de Aceptación

1. THE Sistema SHALL registrar cada uso de funcionalidades IA (chat, voz, escaneo)
2. THE Sistema SHALL calcular métricas de adopción (% de usuarios que usan IA al mes)
3. THE Sistema SHALL medir tiempo promedio de registro de gastos (con y sin IA)
4. THE Sistema SHALL calcular precisión de extracción de datos de recibos (comparando con correcciones manuales)
5. THE Sistema SHALL mostrar un dashboard de métricas de IA en la sección de Configuración
6. THE Sistema SHALL permitir exportar métricas en formato CSV o PDF
