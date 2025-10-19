# Requisitos - Integración Documentos ↔ Proyectos

## Introducción

Este documento define los requisitos para implementar una integración profunda entre los módulos de Documentos y Proyectos en ConstructPro, permitiendo que cada documento esté vinculado a un proyecto específico y aprovechando IA para automatizar la categorización y extracción de datos.

## Glosario

- **Proyecto**: Obra de construcción con presupuesto, equipo y documentación asociada
- **Documento**: Archivo digital (PDF, imagen, DWG, etc.) relacionado con un proyecto
- **Factura/Recibo**: Documento que representa un gasto y puede ser procesado con IA
- **Metadatos IA**: Datos extraídos automáticamente de documentos usando Claude API
- **Sugerencia de Proyecto**: Recomendación automática de a qué proyecto pertenece un documento

## Requisitos Funcionales

### Requisito 1: Vinculación Obligatoria Documento-Proyecto

**User Story:** Como usuario de ConstructPro, quiero que cada documento esté asociado a un proyecto específico, para mantener la organización y trazabilidad de toda la documentación.

#### Criterios de Aceptación

1. WHEN el usuario sube un documento, THE Sistema SHALL solicitar la selección de un proyecto
2. THE Sistema SHALL NOT permitir guardar un documento sin proyecto asociado
3. WHEN el usuario visualiza documentos, THE Sistema SHALL mostrar a qué proyecto pertenece cada uno
4. WHEN el usuario está en la vista de un proyecto, THE Sistema SHALL mostrar solo los documentos de ese proyecto
5. WHEN se elimina un proyecto, THE Sistema SHALL manejar los documentos asociados según configuración (eliminar o mover a "Sin Proyecto")

### Requisito 2: Selector de Proyecto en Módulo Documentos

**User Story:** Como usuario, quiero filtrar documentos por proyecto desde el módulo de Documentos, para ver solo la documentación relevante de cada obra.

#### Criterios de Aceptación

1. THE módulo de Documentos SHALL incluir un selector de proyecto en la parte superior
2. THE selector SHALL mostrar "Todos los Proyectos" como opción por defecto
3. WHEN el usuario selecciona un proyecto, THE Sistema SHALL filtrar todos los documentos mostrados
4. THE selector SHALL mostrar proyectos activos primero, luego completados
5. THE selector SHALL incluir información del proyecto (nombre, cliente, estado)
6. THE Sistema SHALL recordar el último proyecto seleccionado en la sesión del usuario

### Requisito 3: Estadísticas de Documentos por Proyecto

**User Story:** Como gerente de proyecto, quiero ver estadísticas de documentos de cada proyecto, para tener visibilidad del estado de la documentación.

#### Criterios de Aceptación

1. WHEN el usuario selecciona un proyecto, THE Sistema SHALL mostrar:
   - Total de documentos del proyecto
   - Total de carpetas del proyecto
   - Espacio en disco utilizado (en GB)
   - Total de documentos compartidos
2. THE Sistema SHALL actualizar las estadísticas en tiempo real al agregar/eliminar documentos
3. THE Sistema SHALL mostrar las estadísticas en 4 tarjetas visuales con iconos distintivos
4. THE Sistema SHALL permitir hacer clic en cada estadística para ver detalles

### Requisito 4: Escaneo de Recibos con Contexto de Proyecto

**User Story:** Como supervisor en obra, quiero escanear recibos y que el sistema sugiera automáticamente el proyecto correcto, para agilizar el registro de gastos.

#### Criterios de Aceptación

1. WHEN el usuario escanea un recibo desde el módulo de Documentos con un proyecto seleccionado, THE Sistema SHALL pre-seleccionar ese proyecto
2. WHEN el usuario escanea un recibo sin proyecto seleccionado, THE Sistema SHALL usar IA para sugerir el proyecto más probable
3. THE Sistema SHALL mostrar el nivel de confianza de la sugerencia (0-100%)
4. THE Sistema SHALL permitir al usuario cambiar el proyecto sugerido
5. WHEN la confianza es baja (<50%), THE Sistema SHALL solicitar confirmación explícita del usuario
6. THE Sistema SHALL considerar para la sugerencia:
   - Proyecto actual del usuario
   - Historial de compras similares
   - Proveedores frecuentes por proyecto
   - Categoría del gasto

### Requisito 5: Guardado Integrado Documento-Gasto

**User Story:** Como administrador, quiero que al escanear una factura se cree automáticamente el documento Y el gasto asociado, para mantener la trazabilidad completa.

#### Criterios de Aceptación

1. WHEN el usuario confirma un recibo escaneado, THE Sistema SHALL:
   - Guardar la imagen en storage organizado por proyecto
   - Crear registro en tabla `documentos` con tipo "Factura"
   - Crear registro en tabla `gastos` vinculado al documento
   - Actualizar estadísticas del proyecto
2. THE documento SHALL incluir metadatos extraídos por IA en formato JSON
3. THE gasto SHALL incluir referencia al documento_id
4. THE Sistema SHALL permitir ver el documento desde el registro de gasto
5. THE Sistema SHALL permitir ver el gasto desde el documento
6. WHEN falla el guardado, THE Sistema SHALL hacer rollback completo (no guardar nada)

### Requisito 6: Búsqueda de Documentos por Proyecto

**User Story:** Como usuario, quiero buscar documentos dentro de un proyecto específico, para encontrar rápidamente la documentación que necesito.

#### Criterios de Aceptación

1. THE buscador de documentos SHALL respetar el filtro de proyecto activo
2. WHEN el usuario busca con "Todos los Proyectos", THE Sistema SHALL buscar en todos los documentos
3. WHEN el usuario busca con un proyecto específico, THE Sistema SHALL buscar solo en ese proyecto
4. THE búsqueda SHALL incluir: nombre, descripción, proveedor, contenido (si está indexado)
5. THE Sistema SHALL resaltar el término buscado en los resultados
6. THE Sistema SHALL mostrar a qué proyecto pertenece cada resultado

### Requisito 7: Vista de Documentos desde Proyecto

**User Story:** Como gerente de proyecto, quiero acceder a los documentos directamente desde la vista del proyecto, para tener acceso rápido a toda la documentación de la obra.

#### Criterios de Aceptación

1. THE vista de detalle de proyecto SHALL incluir una sección "Documentos"
2. THE sección SHALL mostrar:
   - Total de documentos
   - Documentos recientes (últimos 5)
   - Botón "Ver Todos los Documentos"
3. WHEN el usuario hace clic en "Ver Todos", THE Sistema SHALL abrir el módulo de Documentos con el proyecto pre-seleccionado
4. THE Sistema SHALL permitir subir documentos directamente desde la vista del proyecto
5. THE Sistema SHALL permitir escanear recibos directamente desde la vista del proyecto

### Requisito 7B: Vista de Carpetas por Proyecto

**User Story:** Como usuario, quiero ver los documentos organizados en carpetas por tipo, para navegar fácilmente por la documentación del proyecto.

#### Criterios de Aceptación

1. WHEN el usuario selecciona un proyecto, THE Sistema SHALL mostrar carpetas predefinidas:
   - Contratos
   - Planos
   - Facturas
   - Permisos
   - Reportes
   - Certificados
   - Otros
2. THE Sistema SHALL mostrar la cantidad de archivos en cada carpeta
3. THE Sistema SHALL indicar visualmente si una carpeta contiene documentos procesados con IA
4. WHEN el usuario hace clic en una carpeta, THE Sistema SHALL mostrar solo los documentos de ese tipo
5. THE Sistema SHALL incluir tabs de navegación para cambiar entre carpetas
6. THE Sistema SHALL permitir crear carpetas personalizadas

### Requisito 8: Organización de Storage por Proyecto

**User Story:** Como administrador del sistema, quiero que los archivos se organicen en el storage por proyecto, para facilitar backups y gestión de espacio.

#### Criterios de Aceptación

1. THE Sistema SHALL organizar archivos en storage con estructura:
   ```
   /storage/proyectos/{proyecto_id}/{tipo_documento}/{archivo}
   ```
2. THE tipos de documento SHALL incluir: contratos, planos, facturas, permisos, reportes, certificados, otros
3. WHEN se sube un documento, THE Sistema SHALL crear automáticamente las carpetas necesarias
4. WHEN se elimina un proyecto, THE Sistema SHALL tener opción de eliminar o archivar los archivos
5. THE Sistema SHALL validar que no se exceda el límite de espacio por proyecto (configurable)

### Requisito 9: Metadatos IA en Documentos

**User Story:** Como usuario, quiero que el sistema extraiga automáticamente información de los documentos, para no tener que capturar datos manualmente.

#### Criterios de Aceptación

1. WHEN se sube una factura/recibo, THE Sistema SHALL extraer automáticamente:
   - Monto total, subtotal, IVA
   - Fecha de emisión
   - Proveedor (nombre completo)
   - RFC del emisor
   - Folio/número de factura
   - Lista de items con cantidades y precios
   - Forma de pago
   - Categoría sugerida
2. THE Sistema SHALL guardar los metadatos en formato JSON en campo `metadatos_ia`
3. THE Sistema SHALL marcar el documento como `procesado_ia = true`
4. THE Sistema SHALL permitir editar los datos extraídos antes de confirmar
5. WHEN la extracción falla, THE Sistema SHALL permitir captura manual

### Requisito 10: Vinculación Documento-Gasto Bidireccional

**User Story:** Como contador, quiero poder navegar entre documentos y gastos fácilmente, para verificar la información y hacer auditorías.

#### Criterios de Aceptación

1. WHEN el usuario ve un gasto, THE Sistema SHALL mostrar un botón "Ver Factura" si hay documento asociado
2. WHEN el usuario ve un documento tipo Factura, THE Sistema SHALL mostrar un botón "Ver Gasto" si hay gasto asociado
3. THE Sistema SHALL indicar visualmente si un documento tiene gasto asociado
4. THE Sistema SHALL indicar visualmente si un gasto tiene documento asociado
5. THE Sistema SHALL permitir asociar/desasociar documentos y gastos manualmente

### Requisito 11: Sugerencia Inteligente de Proyecto

**User Story:** Como usuario, quiero que el sistema sugiera automáticamente el proyecto correcto al escanear un recibo, para ahorrar tiempo y evitar errores.

#### Criterios de Aceptación

1. THE Sistema SHALL usar Claude API para analizar el contexto y sugerir proyecto
2. THE Sistema SHALL considerar:
   - Proyecto actual del usuario (si está en vista de proyecto)
   - Historial de compras del mismo proveedor
   - Categoría del gasto vs presupuesto del proyecto
   - Proyectos activos vs completados
   - Ubicación del proyecto (si el recibo tiene dirección)
3. THE Sistema SHALL devolver:
   - ID del proyecto sugerido
   - Nivel de confianza (0-100%)
   - Razón de la sugerencia
   - Lista de proyectos alternativos (top 3)
4. WHEN la confianza es alta (>80%), THE Sistema SHALL auto-seleccionar el proyecto
5. WHEN la confianza es media (50-80%), THE Sistema SHALL sugerir pero permitir cambio fácil
6. WHEN la confianza es baja (<50%), THE Sistema SHALL solicitar selección manual

### Requisito 12: Dashboard de Documentos por Proyecto

**User Story:** Como gerente de proyecto, quiero ver un dashboard de documentos en la vista del proyecto, para tener visibilidad del estado de la documentación.

#### Criterios de Aceptación

1. THE vista de proyecto SHALL incluir un widget de "Documentos"
2. THE widget SHALL mostrar:
   - Total de documentos por tipo (gráfica de dona)
   - Documentos recientes (lista de últimos 5)
   - Facturas pendientes de procesar
   - Espacio utilizado vs límite
3. THE widget SHALL permitir acciones rápidas:
   - Subir documento
   - Escanear recibo
   - Ver todos los documentos
4. THE widget SHALL actualizarse en tiempo real

### Requisito 13: Filtros Avanzados en Documentos

**User Story:** Como usuario, quiero filtrar documentos por múltiples criterios, para encontrar exactamente lo que busco.

#### Criterios de Aceptación

1. THE módulo de Documentos SHALL incluir filtros por:
   - Proyecto (selector principal)
   - Tipo de documento (Contrato, Plano, Factura, etc.)
   - Rango de fechas
   - Proveedor (para facturas)
   - Procesado con IA (sí/no)
   - Tiene gasto asociado (sí/no)
2. THE Sistema SHALL permitir combinar múltiples filtros
3. THE Sistema SHALL mostrar contador de resultados
4. THE Sistema SHALL permitir guardar combinaciones de filtros como "vistas"
5. THE Sistema SHALL permitir limpiar todos los filtros con un clic

### Requisito 14: Exportación de Documentos por Proyecto

**User Story:** Como administrador, quiero exportar todos los documentos de un proyecto, para hacer backups o entregas al cliente.

#### Criterios de Aceptación

1. THE Sistema SHALL permitir exportar documentos de un proyecto en formato ZIP
2. THE exportación SHALL incluir:
   - Todos los archivos organizados por carpetas
   - Archivo Excel con índice de documentos
   - Metadatos extraídos por IA (si aplica)
3. THE Sistema SHALL mostrar progreso de la exportación
4. THE Sistema SHALL enviar notificación cuando la exportación esté lista
5. THE Sistema SHALL mantener el archivo disponible por 24 horas

### Requisito 15: Permisos de Documentos por Proyecto

**User Story:** Como administrador, quiero controlar quién puede ver documentos de cada proyecto, para mantener la confidencialidad.

#### Criterios de Aceptación

1. THE Sistema SHALL respetar los permisos del proyecto para acceso a documentos
2. WHEN un usuario no tiene acceso a un proyecto, THE Sistema SHALL NOT mostrar sus documentos
3. THE Sistema SHALL permitir compartir documentos específicos con usuarios externos
4. THE Sistema SHALL registrar quién accede a cada documento (auditoría)
5. THE Sistema SHALL permitir configurar permisos por tipo de documento

---

## Requisitos No Funcionales

### Rendimiento

1. **RNF-1**: La carga de documentos de un proyecto SHALL completarse en menos de 2 segundos para hasta 1000 documentos
2. **RNF-2**: El escaneo y procesamiento de un recibo con IA SHALL completarse en menos de 5 segundos
3. **RNF-3**: La búsqueda de documentos SHALL devolver resultados en menos de 1 segundo
4. **RNF-4**: La sugerencia de proyecto SHALL completarse en menos de 3 segundos

### Escalabilidad

1. **RNF-5**: El sistema SHALL soportar hasta 10,000 documentos por proyecto
2. **RNF-6**: El sistema SHALL soportar hasta 100 proyectos activos simultáneamente
3. **RNF-7**: El storage SHALL soportar hasta 100GB por proyecto

### Seguridad

1. **RNF-8**: Todos los archivos SHALL estar encriptados en storage
2. **RNF-9**: Las URLs de descarga SHALL ser temporales (expiración 1 hora)
3. **RNF-10**: El acceso a documentos SHALL requerir autenticación
4. **RNF-11**: Todas las operaciones SHALL registrarse en logs de auditoría

### Usabilidad

1. **RNF-12**: El selector de proyecto SHALL ser accesible con teclado
2. **RNF-13**: El escaneo de recibos SHALL funcionar en dispositivos móviles
3. **RNF-14**: La interfaz SHALL ser responsive en pantallas desde 320px
4. **RNF-15**: Los mensajes de error SHALL ser claros y accionables

### Compatibilidad

1. **RNF-16**: El sistema SHALL soportar formatos: PDF, JPG, PNG, DWG, XLSX, DOCX
2. **RNF-17**: El sistema SHALL funcionar en Chrome, Firefox, Safari, Edge (últimas 2 versiones)
3. **RNF-18**: La API SHALL ser compatible con REST estándar
4. **RNF-19**: Los metadatos IA SHALL estar en formato JSON estándar

### Mantenibilidad

1. **RNF-20**: El código SHALL estar documentado con JSDoc/TSDoc
2. **RNF-21**: Las migraciones de BD SHALL ser reversibles
3. **RNF-22**: Los servicios SHALL tener tests unitarios (cobertura >80%)
4. **RNF-23**: La arquitectura SHALL seguir principios SOLID

---

## Dependencias

### Externas
- Claude API (Anthropic) - Para procesamiento de documentos
- Storage Service (S3, Azure Blob, o local) - Para almacenamiento de archivos
- PostgreSQL/MySQL - Base de datos

### Internas
- Módulo de Proyectos (existente)
- Módulo de Finanzas (existente)
- Módulo de Documentos (existente, a modificar)
- Sistema de Autenticación (existente)

---

## Restricciones

1. **Restricción Técnica**: El tamaño máximo de archivo es 20MB
2. **Restricción de Negocio**: Solo usuarios con rol "Admin" o "Gerente" pueden eliminar documentos
3. **Restricción de Costo**: Límite de 10,000 llamadas/mes a Claude API
4. **Restricción de Tiempo**: Implementación completa en 3 semanas

---

## Criterios de Éxito

1. ✅ 100% de documentos nuevos están asociados a un proyecto
2. ✅ 90% de recibos escaneados tienen sugerencia de proyecto correcta
3. ✅ Reducción del 70% en tiempo de registro de facturas
4. ✅ 0 documentos huérfanos (sin proyecto) después de migración
5. ✅ Satisfacción de usuarios >8/10 en encuesta post-implementación

---

## Riesgos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Migración de datos existentes falla | Media | Alto | Backup completo antes de migración, script de rollback |
| Claude API tiene downtime | Baja | Medio | Implementar fallback a captura manual |
| Performance con muchos documentos | Media | Medio | Implementar paginación y lazy loading |
| Usuarios no adoptan nueva funcionalidad | Media | Alto | Capacitación y documentación clara |
| Costos de Claude API exceden presupuesto | Baja | Medio | Monitoreo de uso, límites por usuario |

---

## Glosario Técnico

- **proyecto_id**: UUID que identifica un proyecto
- **documento_id**: UUID que identifica un documento
- **gasto_id**: UUID que identifica un gasto
- **metadatos_ia**: Campo JSONB con datos extraídos por IA
- **procesado_ia**: Boolean que indica si el documento fue procesado con IA
- **confianza**: Número 0-100 que indica certeza de sugerencia de IA

---

**Versión**: 1.0.0  
**Fecha**: 18 de Enero, 2024  
**Estado**: Aprobado para Implementación
