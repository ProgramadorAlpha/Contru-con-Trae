# Plan de Pruebas de Calidad - ConstructPro

## Objetivo
Verificar que toda la aplicación funcione correctamente, con cada botón ejecutando su función diseñada, todos los módulos conectados, y toda la lógica implementada completamente.

## Alcance
- **Modo de Prueba**: Todos los datos se guardan localmente (mock data)
- **Prioridad**: Funcionalidad completa y respuesta adecuada a cada interacción
- **Cobertura**: 100% de botones, formularios, y flujos de usuario

---

## Fase 1: Preparación del Entorno de Pruebas

### 1.1 Configuración Inicial
- [ ] Clonar repositorio y verificar rama correcta
- [ ] Instalar dependencias: `npm install`
- [ ] Verificar que el build funciona: `npm run build`
- [ ] Iniciar servidor de desarrollo: `npm run dev`
- [ ] Verificar que no hay errores en consola al cargar

### 1.2 Herramientas de Prueba
- [ ] Navegadores: Chrome, Firefox, Safari, Edge
- [ ] Extensiones: React DevTools, Redux DevTools
- [ ] Herramientas de red: DevTools Network tab
- [ ] Consola del navegador para errores JavaScript

---

## Fase 2: Pruebas de Autenticación

### 2.1 Login
**Ubicación**: `/login`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Cargar página de login | Formulario visible con campos email/password | ⏳ | |
| Ingresar credenciales válidas | Redirección a dashboard | ⏳ | |
| Ingresar credenciales inválidas | Mensaje de error visible | ⏳ | |
| Click en "Recordarme" | Checkbox se marca/desmarca | ⏳ | |
| Click en "¿Olvidaste tu contraseña?" | Navegación a recuperación | ⏳ | |
| Validación de campos vacíos | Mensajes de error en campos | ⏳ | |

### 2.2 Registro
**Ubicación**: `/register`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Cargar página de registro | Formulario completo visible | ⏳ | |
| Completar formulario válido | Usuario creado, redirección | ⏳ | |
| Email duplicado | Error de email existente | ⏳ | |
| Contraseñas no coinciden | Error de validación | ⏳ | |
| Validación de formato email | Error si formato inválido | ⏳ | |

### 2.3 Perfil de Usuario
**Ubicación**: `/profile`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver perfil | Datos del usuario visibles | ⏳ | |
| Editar nombre | Cambio guardado y reflejado | ⏳ | |
| Cambiar avatar | Imagen actualizada | ⏳ | |
| Cambiar contraseña | Contraseña actualizada | ⏳ | |
| Botón "Guardar cambios" | Datos persistidos localmente | ⏳ | |
| Botón "Cancelar" | Cambios descartados | ⏳ | |

---

## Fase 3: Pruebas del Dashboard

### 3.1 Dashboard Principal
**Ubicación**: `/dashboard-enhanced`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Cargar dashboard | Todos los widgets visibles | ⏳ | |
| Widget de proyectos activos | Número correcto mostrado | ⏳ | |
| Widget de presupuesto | Gráfico de barras visible | ⏳ | |
| Widget de tareas pendientes | Lista de tareas visible | ⏳ | |
| Widget de equipo | Avatares del equipo visibles | ⏳ | |
| Click en proyecto | Navegación a detalle | ⏳ | |
| Filtros de fecha | Datos filtrados correctamente | ⏳ | |
| Botón "Exportar" | Descarga de reporte | ⏳ | |
| Gráficos interactivos | Tooltips y hover funcionan | ⏳ | |

### 3.2 Widgets Financieros

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Widget de rentabilidad | Cálculos correctos | ⏳ | |
| Widget de costos comprometidos | Suma correcta | ⏳ | |
| Widget de desglose por código | Datos por categoría | ⏳ | |
| Actualización en tiempo real | Cambios reflejados | ⏳ | |

---

## Fase 4: Pruebas de Proyectos

### 4.1 Lista de Proyectos
**Ubicación**: `/projects`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver lista de proyectos | Tabla con todos los proyectos | ⏳ | |
| Botón "Nuevo Proyecto" | Modal de creación abierto | ⏳ | |
| Buscar proyecto | Filtrado en tiempo real | ⏳ | |
| Filtrar por estado | Solo proyectos del estado | ⏳ | |
| Ordenar por columna | Orden correcto aplicado | ⏳ | |
| Click en proyecto | Navegación a detalle | ⏳ | |
| Paginación | Navegación entre páginas | ⏳ | |

### 4.2 Crear Proyecto

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Abrir modal de creación | Formulario completo visible | ⏳ | |
| Completar campos obligatorios | Sin errores de validación | ⏳ | |
| Seleccionar cliente | Dropdown funciona | ⏳ | |
| Seleccionar fechas | Date picker funciona | ⏳ | |
| Ingresar presupuesto | Formato numérico correcto | ⏳ | |
| Botón "Crear" | Proyecto guardado localmente | ⏳ | |
| Botón "Cancelar" | Modal cerrado sin guardar | ⏳ | |
| Validación de campos | Errores mostrados | ⏳ | |

### 4.3 Editar Proyecto

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Botón "Editar" | Modal con datos precargados | ⏳ | |
| Modificar campos | Cambios reflejados | ⏳ | |
| Botón "Guardar" | Cambios persistidos | ⏳ | |
| Validación | Errores si datos inválidos | ⏳ | |

### 4.4 Eliminar Proyecto

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Botón "Eliminar" | Modal de confirmación | ⏳ | |
| Confirmar eliminación | Proyecto removido de lista | ⏳ | |
| Cancelar eliminación | Proyecto permanece | ⏳ | |

---

## Fase 5: Pruebas de Presupuesto

### 5.1 Gestión de Presupuesto
**Ubicación**: `/budget`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver presupuesto de proyecto | Desglose completo visible | ⏳ | |
| Agregar partida | Nueva línea en presupuesto | ⏳ | |
| Editar partida | Cambios guardados | ⏳ | |
| Eliminar partida | Partida removida | ⏳ | |
| Calcular totales | Suma correcta automática | ⏳ | |
| Exportar presupuesto | Archivo descargado | ⏳ | |

---

## Fase 6: Pruebas de Job Costing

### 6.1 Subcontratos
**Ubicación**: `/subcontracts`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver lista de subcontratos | Tabla completa visible | ⏳ | |
| Botón "Nuevo Subcontrato" | Formulario abierto | ⏳ | |
| Crear subcontrato | Guardado localmente | ⏳ | |
| Asignar código de costo | Dropdown funciona | ⏳ | |
| Ingresar monto | Cálculos automáticos | ⏳ | |
| Agregar términos | Campo de texto funciona | ⏳ | |
| Subir documento | Archivo adjuntado | ⏳ | |
| Editar subcontrato | Cambios guardados | ⏳ | |
| Cambiar estado | Estado actualizado | ⏳ | |
| Eliminar subcontrato | Confirmación y eliminación | ⏳ | |

### 6.2 Certificados de Avance
**Ubicación**: `/certificates`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver lista de certificados | Tabla con certificados | ⏳ | |
| Crear certificado | Formulario completo | ⏳ | |
| Seleccionar subcontrato | Dropdown funciona | ⏳ | |
| Ingresar porcentaje | Cálculo automático de monto | ⏳ | |
| Calcular retención | Retención correcta | ⏳ | |
| Calcular neto a pagar | Cálculo correcto | ⏳ | |
| Aprobar certificado | Estado cambia a aprobado | ⏳ | |
| Rechazar certificado | Modal de razón, estado rechazado | ⏳ | |
| Exportar certificado | PDF generado | ⏳ | |

### 6.3 Códigos de Costo
**Ubicación**: `/cost-codes`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver catálogo de códigos | Jerarquía visible | ⏳ | |
| Expandir/colapsar divisiones | Animación suave | ⏳ | |
| Crear código personalizado | Código agregado | ⏳ | |
| Editar código | Cambios guardados | ⏳ | |
| Desactivar código | Estado inactivo | ⏳ | |
| Buscar código | Filtrado en tiempo real | ⏳ | |
| Filtrar por tipo | Solo códigos del tipo | ⏳ | |

### 6.4 Aprobación de Gastos
**Ubicación**: `/expense-approvals`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver cola de aprobación | Lista de gastos pendientes | ⏳ | |
| Filtrar por proyecto | Solo gastos del proyecto | ⏳ | |
| Ver detalle de gasto | Modal con información completa | ⏳ | |
| Clasificar gasto | Asignación de proyecto/código | ⏳ | |
| Aprobar gasto | Estado cambia a aprobado | ⏳ | |
| Rechazar gasto | Modal de razón, estado rechazado | ⏳ | |
| Aprobar múltiples | Selección y aprobación masiva | ⏳ | |
| Ver adjuntos | Imagen/PDF visible | ⏳ | |

### 6.5 Financieros del Proyecto
**Ubicación**: `/project-financials/:projectId`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver resumen financiero | Todos los widgets visibles | ⏳ | |
| Gráfico de rentabilidad | Datos correctos | ⏳ | |
| Gráfico de costos comprometidos | Suma correcta | ⏳ | |
| Desglose por código de costo | Tabla detallada | ⏳ | |
| Reporte de job costing | Datos completos | ⏳ | |
| Exportar reporte | PDF/Excel descargado | ⏳ | |
| Filtrar por fecha | Datos filtrados | ⏳ | |

### 6.6 Registro de Auditoría
**Ubicación**: `/audit-log`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver log de auditoría | Lista de eventos | ⏳ | |
| Filtrar por usuario | Solo eventos del usuario | ⏳ | |
| Filtrar por acción | Solo acciones del tipo | ⏳ | |
| Filtrar por fecha | Rango de fechas correcto | ⏳ | |
| Ver detalle de evento | Modal con información completa | ⏳ | |
| Exportar log | CSV descargado | ⏳ | |

---

## Fase 7: Pruebas de Reportes

### 7.1 Generación de Reportes
**Ubicación**: `/reports`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Seleccionar tipo de reporte | Opciones visibles | ⏳ | |
| Seleccionar proyecto | Dropdown funciona | ⏳ | |
| Seleccionar rango de fechas | Date picker funciona | ⏳ | |
| Botón "Generar Reporte" | Reporte generado | ⏳ | |
| Vista previa | Reporte visible en pantalla | ⏳ | |
| Exportar PDF | Archivo descargado | ⏳ | |
| Exportar Excel | Archivo descargado | ⏳ | |
| Gráficos en reporte | Visualizaciones correctas | ⏳ | |

---

## Fase 8: Pruebas de Documentos

### 8.1 Gestión de Documentos
**Ubicación**: `/documents`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver lista de documentos | Grid/lista visible | ⏳ | |
| Subir documento | Archivo cargado | ⏳ | |
| Buscar documento | Filtrado en tiempo real | ⏳ | |
| Filtrar por tipo | Solo documentos del tipo | ⏳ | |
| Filtrar por proyecto | Solo docs del proyecto | ⏳ | |
| Descargar documento | Archivo descargado | ⏳ | |
| Eliminar documento | Confirmación y eliminación | ⏳ | |
| Compartir documento | Modal de compartir | ⏳ | |

---

## Fase 9: Pruebas de Herramientas

### 9.1 Gestión de Herramientas
**Ubicación**: `/tools`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver inventario | Lista completa | ⏳ | |
| Agregar herramienta | Formulario y guardado | ⏳ | |
| Editar herramienta | Cambios guardados | ⏳ | |
| Asignar a proyecto | Asignación registrada | ⏳ | |
| Registrar mantenimiento | Historial actualizado | ⏳ | |
| Buscar herramienta | Filtrado funciona | ⏳ | |
| Exportar inventario | Excel descargado | ⏳ | |

---

## Fase 10: Pruebas de Equipo

### 10.1 Gestión de Equipo
**Ubicación**: `/team`

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver lista de miembros | Tabla/cards visibles | ⏳ | |
| Agregar miembro | Formulario y guardado | ⏳ | |
| Editar miembro | Cambios guardados | ⏳ | |
| Asignar rol | Rol actualizado | ⏳ | |
| Asignar a proyecto | Asignación registrada | ⏳ | |
| Desactivar miembro | Estado inactivo | ⏳ | |
| Buscar miembro | Filtrado funciona | ⏳ | |

---

## Fase 11: Pruebas de Navegación y UI

### 11.1 Sidebar

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Click en cada ítem del menú | Navegación correcta | ⏳ | |
| Expandir/colapsar sidebar | Animación suave | ⏳ | |
| Ítem activo resaltado | Estilo visual correcto | ⏳ | |
| Submenús | Expansión/colapso funciona | ⏳ | |
| Responsive | Sidebar adaptable en móvil | ⏳ | |

### 11.2 Header

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Botón de notificaciones | Dropdown abierto | ⏳ | |
| Ver notificaciones | Lista visible | ⏳ | |
| Marcar como leída | Estado actualizado | ⏳ | |
| Menú de usuario | Dropdown abierto | ⏳ | |
| Click en "Perfil" | Navegación a perfil | ⏳ | |
| Click en "Cerrar sesión" | Logout y redirección | ⏳ | |
| Toggle tema oscuro/claro | Tema cambiado | ⏳ | |

### 11.3 Breadcrumbs

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Ver breadcrumbs | Ruta actual visible | ⏳ | |
| Click en nivel anterior | Navegación correcta | ⏳ | |
| Actualización automática | Breadcrumbs actualizados | ⏳ | |

---

## Fase 12: Pruebas de Persistencia Local

### 12.1 LocalStorage

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Crear proyecto | Guardado en localStorage | ⏳ | |
| Recargar página | Datos persisten | ⏳ | |
| Editar datos | Cambios guardados | ⏳ | |
| Eliminar datos | Removidos de storage | ⏳ | |
| Cerrar sesión | Datos de sesión limpiados | ⏳ | |

### 12.2 Estado de la Aplicación

| Acción | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Filtros aplicados | Persisten al navegar | ⏳ | |
| Orden de tabla | Persiste al navegar | ⏳ | |
| Página actual | Persiste al navegar | ⏳ | |
| Tema seleccionado | Persiste entre sesiones | ⏳ | |

---

## Fase 13: Pruebas de Validación

### 13.1 Validación de Formularios

| Formulario | Validaciones | Estado | Notas |
|------------|-------------|--------|-------|
| Login | Email formato, campos requeridos | ⏳ | |
| Registro | Email único, contraseña fuerte | ⏳ | |
| Proyecto | Fechas válidas, presupuesto > 0 | ⏳ | |
| Subcontrato | Monto > 0, fechas válidas | ⏳ | |
| Certificado | Porcentaje 0-100, cálculos | ⏳ | |
| Gasto | Monto > 0, clasificación completa | ⏳ | |

### 13.2 Validación de Datos

| Tipo de Dato | Validación | Estado | Notas |
|--------------|-----------|--------|-------|
| Emails | Formato válido | ⏳ | |
| Fechas | Formato ISO, rango válido | ⏳ | |
| Números | Positivos, formato correcto | ⏳ | |
| Porcentajes | 0-100 | ⏳ | |
| Teléfonos | Formato válido | ⏳ | |

---

## Fase 14: Pruebas de Cálculos

### 14.1 Cálculos Financieros

| Cálculo | Fórmula | Estado | Notas |
|---------|---------|--------|-------|
| Costo comprometido | Suma de subcontratos | ⏳ | |
| Costo actual | Suma de gastos aprobados | ⏳ | |
| Varianza | Presupuesto - Costo actual | ⏳ | |
| Margen | (Presupuesto - Costo) / Presupuesto * 100 | ⏳ | |
| Retención | Monto certificado * % retención | ⏳ | |
| Neto a pagar | Certificado - Retención | ⏳ | |
| Presupuesto restante | Presupuesto - Comprometido - Actual | ⏳ | |

### 14.2 Agregaciones

| Agregación | Cálculo | Estado | Notas |
|------------|---------|--------|-------|
| Total por proyecto | Suma de gastos | ⏳ | |
| Total por código de costo | Suma por categoría | ⏳ | |
| Promedio de margen | Media de proyectos | ⏳ | |
| Total comprometido | Suma de subcontratos activos | ⏳ | |

---

## Fase 15: Pruebas de Rendimiento

### 15.1 Tiempos de Carga

| Página | Tiempo Esperado | Tiempo Real | Estado |
|--------|----------------|-------------|--------|
| Dashboard | < 2s | | ⏳ |
| Lista de proyectos | < 1s | | ⏳ |
| Detalle de proyecto | < 1.5s | | ⏳ |
| Reportes | < 3s | | ⏳ |
| Gráficos | < 1s | | ⏳ |

### 15.2 Interactividad

| Acción | Tiempo Esperado | Tiempo Real | Estado |
|--------|----------------|-------------|--------|
| Click en botón | Inmediato | | ⏳ |
| Abrir modal | < 200ms | | ⏳ |
| Filtrar tabla | < 500ms | | ⏳ |
| Buscar | < 300ms | | ⏳ |
| Ordenar | < 400ms | | ⏳ |

---

## Fase 16: Pruebas de Responsive

### 16.1 Breakpoints

| Dispositivo | Resolución | Estado | Notas |
|-------------|-----------|--------|-------|
| Desktop | 1920x1080 | ⏳ | |
| Laptop | 1366x768 | ⏳ | |
| Tablet | 768x1024 | ⏳ | |
| Mobile | 375x667 | ⏳ | |

### 16.2 Adaptabilidad

| Componente | Responsive | Estado | Notas |
|------------|-----------|--------|-------|
| Sidebar | Colapsa en móvil | ⏳ | |
| Tablas | Scroll horizontal | ⏳ | |
| Formularios | Stack vertical | ⏳ | |
| Gráficos | Redimensionan | ⏳ | |
| Modales | Pantalla completa en móvil | ⏳ | |

---

## Fase 17: Pruebas de Accesibilidad

### 17.1 Navegación por Teclado

| Acción | Funciona | Estado | Notas |
|--------|----------|--------|-------|
| Tab entre campos | ✓ | ⏳ | |
| Enter para submit | ✓ | ⏳ | |
| Esc para cerrar modal | ✓ | ⏳ | |
| Flechas en dropdowns | ✓ | ⏳ | |

### 17.2 ARIA y Semántica

| Elemento | Atributos ARIA | Estado | Notas |
|----------|---------------|--------|-------|
| Botones | aria-label | ⏳ | |
| Formularios | aria-required | ⏳ | |
| Modales | aria-modal | ⏳ | |
| Alertas | role="alert" | ⏳ | |

---

## Fase 18: Pruebas de Errores

### 18.1 Manejo de Errores

| Escenario | Comportamiento Esperado | Estado | Notas |
|-----------|------------------------|--------|-------|
| Error de red | Mensaje amigable | ⏳ | |
| Datos inválidos | Validación clara | ⏳ | |
| Sesión expirada | Redirección a login | ⏳ | |
| 404 | Página de error | ⏳ | |
| Permisos insuficientes | Mensaje de acceso denegado | ⏳ | |

### 18.2 Recuperación

| Escenario | Recuperación | Estado | Notas |
|-----------|-------------|--------|-------|
| Error al guardar | Retry automático | ⏳ | |
| Datos corruptos | Limpieza y reinicio | ⏳ | |
| Conflicto de versión | Resolución manual | ⏳ | |

---

## Fase 19: Pruebas de Seguridad

### 19.1 Autenticación

| Prueba | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Acceso sin login | Redirección a login | ⏳ | |
| Token expirado | Re-autenticación | ⏳ | |
| Logout | Limpieza de sesión | ⏳ | |

### 19.2 Autorización

| Prueba | Resultado Esperado | Estado | Notas |
|--------|-------------------|--------|-------|
| Rol de usuario | Acceso limitado | ⏳ | |
| Rol de admin | Acceso completo | ⏳ | |
| Acciones restringidas | Botones ocultos/deshabilitados | ⏳ | |

---

## Fase 20: Reporte Final

### 20.1 Resumen de Resultados

| Categoría | Total | Pasadas | Fallidas | % Éxito |
|-----------|-------|---------|----------|---------|
| Autenticación | | | | |
| Dashboard | | | | |
| Proyectos | | | | |
| Job Costing | | | | |
| Reportes | | | | |
| Navegación | | | | |
| Validación | | | | |
| Cálculos | | | | |
| **TOTAL** | | | | |

### 20.2 Bugs Encontrados

| ID | Severidad | Módulo | Descripción | Estado |
|----|-----------|--------|-------------|--------|
| | | | | |

### 20.3 Recomendaciones

1. **Críticas**: Bugs que impiden funcionalidad core
2. **Altas**: Bugs que afectan experiencia de usuario
3. **Medias**: Mejoras de usabilidad
4. **Bajas**: Optimizaciones menores

---

## Criterios de Aceptación

### Mínimo para Producción
- ✅ 100% de funcionalidad core funcionando
- ✅ 0 bugs críticos
- ✅ < 5 bugs de severidad alta
- ✅ Todos los cálculos financieros correctos
- ✅ Persistencia local funcionando
- ✅ Responsive en dispositivos principales

### Ideal para Producción
- ✅ 100% de pruebas pasadas
- ✅ 0 bugs de cualquier severidad
- ✅ Rendimiento óptimo
- ✅ Accesibilidad completa
- ✅ Documentación completa

---

## Notas para el Equipo de QA

1. **Prioridad**: Funcionalidad > Estética
2. **Datos**: Usar mock data, verificar persistencia local
3. **Documentación**: Capturar screenshots de bugs
4. **Reproducibilidad**: Documentar pasos exactos
5. **Comunicación**: Reportar bugs inmediatamente

---

**Fecha de Inicio**: _____________
**Fecha de Finalización**: _____________
**QA Lead**: _____________
**Equipo**: _____________
