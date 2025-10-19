# Plan de Implementación - Integración Documentos ↔ Proyectos

## ✅ Progreso: 0% Completado (0 de 94 subtareas)

## Resumen Ejecutivo

**Objetivo**: Integrar profundamente los módulos de Documentos y Proyectos para que cada documento esté vinculado a un proyecto específico, con sugerencias inteligentes de IA.

**Duración Estimada**: 3 semanas (15 días hábiles)

**Equipo Requerido**:
- 1 Desarrollador Backend (Node.js/PostgreSQL)
- 1 Desarrollador Frontend (React/TypeScript)
- 1 QA Tester
- 1 DevOps (para deployment)

**Dependencias Críticas**:
- Claude API configurada y funcionando
- Storage configurado (S3 o local)
- Base de datos PostgreSQL

---

## Fase 1: Preparación de Base de Datos (Días 1-2)

- [x] **Tarea 1: Migración de Base de Datos**





  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 4 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 1.1 Crear archivo de migración
  - Archivo: `migrations/20250118_add_proyecto_documents_integration.sql`
  - Agregar columna `proyecto_id` a tabla `documentos`
  - Agregar columnas de metadatos IA
  - Agregar campos específicos para facturas
  - _Requisitos: 1, 5_

- [ ] 1.2 Crear foreign keys y constraints
  - FK de `documentos.proyecto_id` → `proyectos.id`
  - FK de `gastos.documento_id` → `documentos.id`
  - Constraint NOT NULL en `proyecto_id`
  - _Requisitos: 1_

- [ ] 1.3 Crear índices para performance
  - `idx_docs_proyecto` en `documentos(proyecto_id)`
  - `idx_docs_tipo_proyecto` en `documentos(proyecto_id, tipo)`
  - `idx_docs_factura_fecha` en `documentos(fecha_factura)`
  - `idx_gastos_documento` en `gastos(documento_id)`
  - _Requisitos: Performance_

- [ ] 1.4 Crear vista de estadísticas
  - Vista `v_proyecto_documentos_stats`
  - Incluir: total docs, facturas, espacio, gastos
  - _Requisitos: 3_

- [ ] 1.5 Testing de migración
  - Probar en base de datos de desarrollo
  - Verificar rollback funciona
  - Documentar proceso
  - _Requisitos: Todos_

- [x] **Tarea 2: Migración de Datos Existentes**


  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 6 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 2.1 Crear script de migración de datos
  - Archivo: `scripts/migrate_existing_documents.js`
  - Asignar documentos huérfanos a proyecto "General"
  - Crear proyecto "General" si no existe
  - _Requisitos: 1_

- [ ] 2.2 Backup de datos antes de migración
  - Script de backup automático
  - Guardar en carpeta `backups/`
  - Verificar integridad del backup
  - _Requisitos: Seguridad_


- [ ] 2.3 Ejecutar migración de datos
  - Ejecutar script en producción
  - Monitorear progreso
  - Validar resultados
  - _Requisitos: 1_

- [ ] 2.4 Validación post-migración
  - Verificar 0 documentos sin proyecto
  - Verificar integridad de relaciones
  - Generar reporte de migración
  - _Requisitos: 1_

---

## Fase 2: Servicios de Backend (Días 3-6)

- [x] **Tarea 3: Servicio de Proyectos**


  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 8 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 3.1 Crear ProyectoService
  - Archivo: `backend/services/proyecto.service.js`
  - Método `getProyectosUsuario()`
  - Método `getDocumentosProyecto()`
  - Método `getEstadisticasDocumentos()`
  - _Requisitos: 2, 3_

- [ ] 3.2 Implementar validación de límites
  - Método `validarLimites(proyectoId, nuevoDocumentoSize)`
  - Verificar límite de documentos
  - Verificar límite de espacio
  - _Requisitos: 8_

- [ ] 3.3 Implementar método de proyectos activos
  - Método `getProyectosActivosParaSugerencia()`
  - Incluir historial de gastos recientes
  - Incluir proveedores frecuentes
  - _Requisitos: 4, 11_

- [ ] 3.4 Tests unitarios de ProyectoService
  - Test de cada método
  - Cobertura > 80%
  - _Requisitos: Testing_

- [x] **Tarea 4: Servicio de Documentos**


  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 12 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 4.1 Crear DocumentoService
  - Archivo: `backend/services/documento.service.js`
  - Método `subirDocumento()`
  - Método `getDocumentoCompleto()`
  - Método `buscarDocumentos()`
  - _Requisitos: 5, 6_

- [ ] 4.2 Implementar escaneo de recibos
  - Método `escanearRecibo()`
  - Integración con ClaudeService
  - Guardado transaccional (documento + gasto)
  - Rollback en caso de error
  - _Requisitos: 4, 5_

- [ ] 4.3 Implementar sugerencia de proyecto
  - Método `sugerirProyecto()`
  - Análisis de contexto del usuario
  - Análisis de historial de compras
  - Cálculo de confianza
  - _Requisitos: 4, 11_

- [ ] 4.4 Implementar vinculación documento-gasto
  - Método `vincularConGasto()`
  - Validar que documento es factura
  - Actualizar ambas tablas
  - _Requisitos: 10_

- [ ] 4.5 Implementar exportación de documentos
  - Método `exportarDocumentosProyecto()`
  - Generar ZIP con archivos
  - Incluir índice Excel
  - _Requisitos: 14_

- [ ] 4.6 Tests unitarios de DocumentoService
  - Test de cada método
  - Cobertura > 80%
  - _Requisitos: Testing_

- [x] **Tarea 5: Servicio de Claude (Mejoras)**



  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 10 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 5.1 Mejorar análisis de recibos
  - Método `analizarRecibo()` mejorado
  - Extraer todos los campos requeridos
  - Manejo de errores robusto
  - _Requisitos: 9_

- [ ] 5.2 Implementar sugerencia de proyecto con IA
  - Método `sugerirProyectoParaRecibo()`
  - Prompt optimizado para sugerencia
  - Análisis de contexto
  - Cálculo de confianza y alternativas
  - _Requisitos: 11_

- [ ] 5.3 Implementar búsqueda semántica
  - Método `busquedaSemantica()`
  - Ordenar por relevancia
  - Explicar por qué es relevante
  - _Requisitos: 6_

- [ ] 5.4 Implementar categorización de documentos
  - Método `categorizarDocumento()`
  - Sugerir tipo de documento
  - Extraer metadatos básicos
  - _Requisitos: 9_

- [ ] 5.5 Tests unitarios de ClaudeService
  - Mocks de Claude API
  - Test de cada método
  - _Requisitos: Testing_

- [x] **Tarea 6: Storage Service**


  - **Prioridad**: 🟡 Media  
  - **Estimación**: 6 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 6.1 Implementar organización por proyecto
  - Estructura: `/proyectos/{id}/{tipo}/{archivo}`
  - Crear carpetas automáticamente
  - _Requisitos: 8_

- [ ] 6.2 Implementar compresión de imágenes
  - Comprimir antes de subir
  - Máximo 2MB por imagen
  - Mantener calidad aceptable
  - _Requisitos: Performance_

- [ ] 6.3 Implementar URLs firmadas
  - URLs temporales con expiración
  - Seguridad en descargas
  - _Requisitos: Seguridad_

---

## Fase 3: Endpoints API (Días 7-8)

- [x] **Tarea 7: Endpoints de Proyectos**


  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 4 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 7.1 Crear rutas de proyectos
  - Archivo: `backend/routes/proyectos.routes.js`
  - GET `/api/proyectos`
  - GET `/api/proyectos/:id/documentos`
  - GET `/api/proyectos/:id/documentos/stats`
  - GET `/api/proyectos/:id/documentos/carpetas`
  - _Requisitos: 2, 3, 7B_

- [ ] 7.2 Crear controladores
  - Archivo: `backend/controllers/proyecto.controller.js`
  - Implementar cada endpoint
  - Validación de parámetros
  - Manejo de errores
  - _Requisitos: 2, 3_

- [ ] 7.3 Tests de integración
  - Test de cada endpoint
  - Casos de éxito y error
  - _Requisitos: Testing_

- [x] **Tarea 8: Endpoints de Documentos**


  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 6 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 8.1 Crear rutas de documentos
  - Archivo: `backend/routes/documentos.routes.js`
  - POST `/api/documentos/upload`
  - POST `/api/documentos/escanear-recibo`
  - POST `/api/documentos/buscar`
  - GET `/api/documentos/:id`
  - DELETE `/api/documentos/:id`
  - _Requisitos: 5, 6_

- [ ] 8.2 Configurar multer para uploads
  - Límite de 20MB
  - Validación de tipos MIME
  - Storage en memoria
  - _Requisitos: 5_

- [ ] 8.3 Crear controladores
  - Archivo: `backend/controllers/documento.controller.js`
  - Implementar cada endpoint
  - Validación de parámetros
  - Manejo de errores
  - _Requisitos: 5, 6_

- [ ] 8.4 Tests de integración
  - Test de cada endpoint
  - Test de upload de archivos
  - Test de escaneo de recibos
  - _Requisitos: Testing_

- [x] **Tarea 9: Endpoints de IA**



  - **Prioridad**: 🟡 Media  
  - **Estimación**: 4 horas  
  - **Asignado a**: Backend Developer

#### Subtareas:

- [ ] 9.1 Crear rutas de IA
  - Archivo: `backend/routes/ia.routes.js`
  - POST `/api/ia/sugerir-proyecto`
  - POST `/api/ia/busqueda-semantica`
  - _Requisitos: 11, 6_

- [ ] 9.2 Crear controladores
  - Archivo: `backend/controllers/ia.controller.js`
  - Implementar endpoints
  - Rate limiting específico
  - _Requisitos: 11, 6_

---

## Fase 4: Componentes Frontend (Días 9-12)

- [x] **Tarea 10: ProyectoSelector Component**


  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 6 horas  
  - **Asignado a**: Frontend Developer

#### Subtareas:

- [ ] 10.1 Crear componente ProyectoSelector
  - Archivo: `src/components/documentos/ProyectoSelector.tsx`
  - Props interface
  - Estado local
  - _Requisitos: 2_

- [ ] 10.2 Implementar dropdown de proyectos
  - Lista de proyectos con búsqueda
  - Mostrar info del proyecto (cliente, estado)
  - Opción "Todos los Proyectos"
  - _Requisitos: 2_

- [ ] 10.3 Implementar carga de proyectos
  - Hook para cargar proyectos
  - Loading state
  - Error handling
  - _Requisitos: 2_

- [ ] 10.4 Estilos y animaciones
  - Diseño consistente con la app
  - Animación de apertura/cierre
  - Responsive
  - _Requisitos: UX_

- [x] **Tarea 11: DocumentosPage Rediseñado**


  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 12 horas  
  - **Asignado a**: Frontend Developer

#### Subtareas:

- [ ] 11.1 Rediseñar estructura de DocumentosPage
  - Archivo: `src/pages/DocumentosPage.tsx`
  - Header con título y descripción
  - Integrar ProyectoSelector
  - Sección de información del proyecto seleccionado
  - Sección de estadísticas (4 tarjetas)
  - Vista de carpetas del proyecto
  - Acciones rápidas IA en footer
  - _Requisitos: 2, 3, 7B_

- [ ] 11.2 Implementar estadísticas de proyecto
  - 4 tarjetas: Total Documentos, Carpetas Proyecto, Espacio Usado, Compartidos
  - Cargar desde API `/api/proyectos/:id/documentos/stats`
  - Actualizar en tiempo real
  - Iconos distintivos para cada tarjeta
  - _Requisitos: 3_

- [ ] 11.3 Implementar vista de carpetas
  - Grid de carpetas (4 columnas en desktop)
  - Carpetas predefinidas: Contratos, Planos, Facturas, Permisos, Reportes, Certificados, Otros
  - Mostrar cantidad de archivos por carpeta
  - Badge de IA si la carpeta tiene documentos procesados
  - Click en carpeta para ver documentos
  - _Requisitos: 7B_

- [ ] 11.4 Implementar vista de documentos dentro de carpeta
  - Breadcrumb: "Proyecto: Casa Los Pinos > Documentos"
  - Tabs de navegación entre carpetas
  - Lista de documentos con información completa
  - Badges de IA y monto (para facturas)
  - Acciones por documento
  - _Requisitos: 7B, 6_

- [ ] 11.5 Implementar búsqueda
  - Input de búsqueda en header
  - Debounce de 300ms
  - Buscar en nombre, proveedor, descripción
  - Resaltar términos
  - _Requisitos: 6_

- [ ] 11.6 Implementar acciones rápidas IA
  - Botón "Escanear Factura"
  - Botón "Registro por Voz"
  - Botón "Buscar Inteligente"
  - _Requisitos: 4_

- [ ] 11.7 Responsive design
  - Mobile first
  - Grid de carpetas: 4 cols → 2 cols → 1 col
  - Tabs horizontales con scroll en móvil
  - Touch gestures
  - _Requisitos: UX_

- [x] **Tarea 12: ScanReceiptModal Mejorado**

  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 12 horas  
  - **Asignado a**: Frontend Developer

#### Subtareas:

- [ ] 12.1 Agregar prop proyectoIdDefault
  - Modificar interface de props
  - Pre-seleccionar proyecto si se proporciona
  - _Requisitos: 4_

- [ ] 12.2 Implementar estado de sugerencia de proyecto
  - Nuevo estado: 'project-suggestion'
  - Mostrar proyecto sugerido
  - Mostrar nivel de confianza
  - Mostrar alternativas
  - _Requisitos: 4, 11_

- [ ] 12.3 Implementar UI de sugerencia
  - Diseño de tarjeta de sugerencia
  - Lista de proyectos alternativos
  - Botones "Confirmar" / "Cambiar"
  - Mostrar razón de sugerencia
  - _Requisitos: 4, 11_

- [ ] 12.4 Integrar con API de sugerencia
  - Llamar a `/api/ia/sugerir-proyecto`
  - Manejar respuesta
  - Auto-seleccionar si confianza > 80%
  - _Requisitos: 11_

- [ ] 12.5 Mejorar flujo de guardado
  - Guardar documento + gasto en una llamada
  - Manejo de errores transaccionales
  - Feedback visual
  - _Requisitos: 5_

- [x] **Tarea 13: CarpetasProyectoGrid Component**


  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 6 horas  
  - **Asignado a**: Frontend Developer

#### Subtareas:

- [ ] 13.1 Crear componente CarpetasProyectoGrid
  - Archivo: `src/components/documentos/CarpetasProyectoGrid.tsx`
  - Grid responsive de carpetas
  - Props: proyectoId, onCarpetaClick
  - _Requisitos: 7B_

- [ ] 13.2 Implementar lógica de carpetas
  - Cargar estadísticas de documentos por tipo
  - Calcular cantidad de archivos por carpeta
  - Detectar si carpeta tiene documentos con IA
  - _Requisitos: 7B_

- [ ] 13.3 Diseño de tarjeta de carpeta
  - Icono de carpeta grande
  - Badge de IA si aplica
  - Nombre de carpeta
  - Cantidad de archivos
  - Hover effects
  - _Requisitos: 7B, UX_

- [ ] 13.4 Navegación a documentos
  - Click en carpeta abre vista de documentos
  - Pasar tipo de documento como filtro
  - Actualizar URL con parámetro de carpeta
  - _Requisitos: 7B_

- [x] **Tarea 14: ProyectoDocumentosWidget**

  - **Prioridad**: 🟡 Media  
  - **Estimación**: 6 horas  
  - **Asignado a**: Frontend Developer

#### Subtareas:

- [ ] 14.1 Actualizar componente ProyectoCard/Widget
  - Archivo: `src/components/proyectos/ProyectoCard.tsx`
  - Mostrar información del proyecto (nombre, cliente, estado, avance)
  - 4 tarjetas de estadísticas: Budget, Docs, Equipo, Reportes
  - Botones de acción: Ver Documentos, Finanzas, Cronograma, Config
  - _Requisitos: 7, 12_

- [ ] 14.2 Implementar navegación a documentos
  - Click en tarjeta "Docs" abre módulo de documentos
  - Pre-seleccionar el proyecto actual
  - Pasar proyectoId como parámetro
  - _Requisitos: 7_

- [ ] 14.3 Integrar en vista de proyectos
  - Agregar widget a página principal de proyectos
  - Grid de proyectos con cards
  - Responsive design
  - _Requisitos: 7_

- [x] **Tarea 15: DocumentoListItem Component**



  - **Prioridad**: 🔴 Alta � Alta  
**Estimación**: 5 horas  
**Asignado a**: Frontend Developer

#### Subtareas:

- [ ] 15.1 Crear componente DocumentoListItem
  - Archivo: `src/components/documentos/DocumentoListItem.tsx`
  - Layout horizontal para lista
  - Icono de documento
  - Nombre y descripción
  - Proveedor y fecha (para facturas)
  - Monto destacado (para facturas)
  - Badge de IA si procesado
  - _Requisitos: 6, 9_

- [ ] 15.2 Implementar acciones
  - Botón "Ver"
  - Botón "Descargar"
  - Botón "Vincular a Gasto" (si es factura sin gasto)
  - Botón "Ver Gasto" (si es factura con gasto)
  - _Requisitos: 10_

- [ ] 15.3 Estados visuales
  - Hover effect
  - Estado seleccionado
  - Estado de carga
  - _Requisitos: UX_

- [ ] 15.4 Diseño responsive
  - Ajustar layout en móvil
  - Ocultar acciones secundarias en pantallas pequeñas
  - Menú de acciones en móvil
  - _Requisitos: UX_

- [x] **Tarea 16: Hooks y Utilidades**


  - **Prioridad**: 🟡 Media  
  - **Estimación**: 5 horas  
  - **Asignado a**: Frontend Developer

#### Subtareas:

- [ ] 16.1 Crear hook useProyectos
  - Archivo: `src/hooks/useProyectos.ts`
  - Cargar proyectos del usuario
  - Filtrar por estado (activos, todos, completados)
  - Cache en sesión
  - _Requisitos: 2_

- [ ] 16.2 Crear hook useDocumentos
  - Archivo: `src/hooks/useDocumentos.ts`
  - Cargar documentos por proyecto
  - Filtrar por carpeta/tipo
  - Búsqueda
  - Paginación
  - _Requisitos: 6, 7B_

- [ ] 16.3 Crear hook useCarpetasProyecto
  - Archivo: `src/hooks/useCarpetasProyecto.ts`
  - Cargar estadísticas de carpetas
  - Calcular cantidad de documentos por tipo
  - Detectar documentos con IA
  - _Requisitos: 7B_

- [ ] 16.4 Crear utilidades de formato
  - Archivo: `src/utils/documentos.utils.ts`
  - Formatear tamaño de archivo (bytes → GB)
  - Formatear fechas
  - Iconos por tipo de documento
  - Colores por tipo de documento
  - _Requisitos: UX_

---

## Fase 5: Integración y Testing (Días 13-14)

- [x] **Tarea 17: Testing End-to-End**

  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 10 horas  
  - **Asignado a**: QA Tester

#### Subtareas:

- [ ] 17.1 Test de navegación por carpetas
  - Seleccionar proyecto
  - Verificar vista de carpetas
  - Click en carpeta "Facturas"
  - Verificar lista de documentos filtrada
  - Navegar entre carpetas con tabs
  - _Requisitos: 7B_

- [ ] 17.2 Test de flujo completo de escaneo
  - Escanear recibo sin proyecto
  - Verificar sugerencia de proyecto
  - Confirmar y guardar
  - Verificar documento aparece en carpeta "Facturas"
  - Verificar gasto creado
  - _Requisitos: 4, 5, 11_

- [ ] 17.3 Test de flujo con proyecto pre-seleccionado
  - Seleccionar proyecto
  - Escanear recibo desde vista de carpetas
  - Verificar proyecto pre-seleccionado
  - Guardar
  - Verificar documento en carpeta correcta
  - _Requisitos: 4, 7B_

- [ ] 17.4 Test de navegación documento-gasto
  - Ver documento en lista
  - Click en "Ver Gasto"
  - Navegar a módulo de finanzas
  - Volver a documento
  - _Requisitos: 10_

- [ ] 17.5 Test de estadísticas
  - Verificar 4 tarjetas de estadísticas
  - Subir nuevo documento
  - Verificar actualización en tiempo real
  - Verificar contador de carpetas
  - _Requisitos: 3_

- [ ] 17.6 Test de búsqueda
  - Buscar por nombre de documento
  - Buscar por proveedor
  - Verificar resultados filtrados
  - _Requisitos: 6_

- [ ] 17.7 Test de límites y validaciones
  - Intentar subir archivo muy grande
  - Intentar subir tipo no permitido
  - Verificar mensajes de error
  - _Requisitos: 8_

- [x] **Tarea 18: Testing de Performance**

  - **Prioridad**: 🟡 Media  
  - **Estimación**: 4 horas  
  - **Asignado a**: QA Tester

#### Subtareas:

- [ ] 18.1 Test de carga de carpetas
  - Proyecto con múltiples carpetas
  - Medir tiempo de carga de vista de carpetas
  - Verificar < 1 segundo
  - _Requisitos: Performance, 7B_

- [ ] 18.2 Test de carga de documentos
  - Carpeta con 1000 documentos
  - Medir tiempo de carga de lista
  - Verificar paginación funciona
  - Verificar < 2 segundos
  - _Requisitos: Performance_

- [ ] 18.3 Test de escaneo de recibos
  - Medir tiempo de procesamiento con IA
  - Verificar < 5 segundos
  - _Requisitos: Performance_

- [ ] 18.4 Test de búsqueda
  - Búsqueda en proyecto con 10000 documentos
  - Verificar < 1 segundo
  - _Requisitos: Performance_

- [x] **Tarea 19: Corrección de Bugs**

  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 8 horas  
  - **Asignado a**: Backend + Frontend Developers

#### Subtareas:

- [ ] 19.1 Revisar y corregir bugs encontrados en testing
- [ ] 19.2 Optimizar queries lentas (especialmente vista de carpetas)
- [ ] 19.3 Mejorar manejo de errores
- [ ] 19.4 Ajustes de UI/UX (responsive, animaciones)
- [ ] 19.5 Verificar navegación entre vistas funciona correctamente

---

## Fase 6: Deployment y Documentación (Día 15)

- [x] **Tarea 20: Deployment**

  - **Prioridad**: 🔴 Alta  
  - **Estimación**: 4 horas  
  - **Asignado a**: DevOps

#### Subtareas:

- [ ] 20.1 Ejecutar migraciones en producción
  - Backup de base de datos
  - Ejecutar migraciones
  - Validar resultados
  - _Requisitos: 1_

- [ ] 20.2 Deploy de backend
  - Build de producción
  - Deploy a servidor
  - Verificar health checks
  - _Requisitos: Todos_

- [ ] 20.3 Deploy de frontend
  - Build de producción
  - Deploy a CDN
  - Verificar funcionamiento
  - _Requisitos: Todos_

- [ ] 20.4 Configurar monitoreo
  - Logs de errores
  - Métricas de uso
  - Alertas
  - _Requisitos: Seguridad_

- [x] **Tarea 21: Documentación**


  - **Prioridad**: 🟡 Media  
  - **Estimación**: 4 horas  
  - **Asignado a**: Tech Lead

#### Subtareas:

- [ ] 21.1 Documentar API
  - Swagger/OpenAPI
  - Ejemplos de requests
  - _Requisitos: Todos_

- [ ] 21.2 Guía de usuario
  - Cómo navegar por carpetas
  - Cómo escanear recibos
  - Cómo buscar documentos
  - Cómo vincular gastos
  - _Requisitos: Todos_

- [ ] 21.3 Guía de mantenimiento
  - Cómo ejecutar migraciones
  - Cómo monitorear uso de IA
  - Troubleshooting común
  - _Requisitos: Todos_

---

## 📊 Resumen de Tareas

### Por Fase

| Fase | Tareas | Subtareas | Días | Prioridad |
|------|--------|-----------|------|-----------|
| 1. Base de Datos | 2 | 9 | 2 | 🔴 Alta |
| 2. Backend Services | 4 | 20 | 4 | 🔴 Alta |
| 3. API Endpoints | 3 | 10 | 2 | 🔴 Alta |
| 4. Frontend | 7 | 31 | 4 | 🔴 Alta |
| 5. Testing | 3 | 16 | 2 | 🔴 Alta |
| 6. Deployment | 2 | 8 | 1 | 🔴 Alta |
| **TOTAL** | **21** | **94** | **15** | - |

### Por Prioridad

- 🔴 **Alta**: 16 tareas (76%)
- 🟡 **Media**: 5 tareas (24%)

### Por Rol

- **Backend Developer**: 9 tareas (43%)
- **Frontend Developer**: 7 tareas (33%)
- **QA Tester**: 3 tareas (14%)
- **DevOps**: 1 tarea (5%)
- **Tech Lead**: 1 tarea (5%)

---

## 📅 Cronograma Detallado

### Semana 1 (Días 1-5)

**Lunes-Martes**: Fase 1 - Base de Datos  
**Miércoles-Viernes**: Fase 2 - Backend Services (parcial)

### Semana 2 (Días 6-10)

**Lunes**: Fase 2 - Backend Services (completar)  
**Martes-Miércoles**: Fase 3 - API Endpoints  
**Jueves-Viernes**: Fase 4 - Frontend (inicio)

### Semana 3 (Días 11-15)

**Lunes-Martes**: Fase 4 - Frontend (completar)  
**Miércoles-Jueves**: Fase 5 - Testing  
**Viernes**: Fase 6 - Deployment y Documentación

---

## 🎯 Hitos Clave

1. **Día 2**: ✅ Base de datos migrada y validada
2. **Día 6**: ✅ Servicios de backend completos y testeados
3. **Día 8**: ✅ API endpoints funcionando
4. **Día 12**: ✅ Frontend completo e integrado
5. **Día 14**: ✅ Testing completo, bugs corregidos
6. **Día 15**: ✅ Deployment exitoso en producción

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Migración de datos falla | Media | Alto | Backup completo, script de rollback, testing exhaustivo |
| Claude API lenta | Baja | Medio | Implementar timeouts, fallback a captura manual |
| Bugs en producción | Media | Alto | Testing exhaustivo, deployment gradual, rollback plan |
| Retrasos en desarrollo | Media | Medio | Buffer de 2 días, priorizar tareas críticas |

---

## 📝 Notas de Implementación

### Orden de Implementación

1. **Primero**: Base de datos (sin esto, nada funciona)
2. **Segundo**: Backend services (lógica de negocio)
3. **Tercero**: API endpoints (interfaz con frontend)
4. **Cuarto**: Frontend (UI/UX)
5. **Quinto**: Testing (validación)
6. **Sexto**: Deployment (producción)

### Dependencias Críticas

- Tarea 3-6 dependen de Tarea 1-2 (Base de datos)
- Tarea 7-9 dependen de Tarea 3-6 (Services)
- Tarea 10-15 dependen de Tarea 7-9 (API)
- Tarea 16-18 dependen de Tarea 10-15 (Frontend)
- Tarea 19-20 dependen de Tarea 16-18 (Testing)

### Puntos de Sincronización

- **Día 2**: Reunión de validación de migración
- **Día 6**: Reunión de revisión de backend
- **Día 8**: Reunión de integración backend-frontend
- **Día 12**: Reunión de demo de funcionalidades
- **Día 14**: Reunión de go/no-go para deployment

---

**Versión**: 1.0.0  
**Fecha**: 18 de Enero, 2024  
**Estado**: Listo para Implementación Inmediata
