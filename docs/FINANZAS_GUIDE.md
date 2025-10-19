# Guía de Usuario - Módulo de Finanzas

## Índice

1. [Introducción](#introducción)
2. [Dashboard de Finanzas](#dashboard-de-finanzas)
3. [Control de Tesorería](#control-de-tesorería)
4. [Sistema de Alertas Financieras](#sistema-de-alertas-financieras)
5. [Gestión de Facturas](#gestión-de-facturas)
6. [Bloqueo Automático de Fases](#bloqueo-automático-de-fases)
7. [Análisis de Rentabilidad](#análisis-de-rentabilidad)
8. [Mejores Prácticas](#mejores-prácticas)
9. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

El módulo de Finanzas de TRAE proporciona control total sobre el flujo de caja de tus proyectos de construcción. Protege tu capital de trabajo mediante alertas automáticas, bloqueo de fases sin cobro, y análisis detallado de rentabilidad.

### Características Principales

- 💰 **Control de Tesorería**: Monitoreo en tiempo real del capital disponible
- 🚨 **Alertas Automáticas**: Notificaciones sobre situaciones críticas
- 🔒 **Bloqueo de Fases**: Protección automática contra ejecución sin cobro
- 📄 **Facturación Automática**: Generación según plan de pagos
- 📊 **Análisis de Rentabilidad**: Comparativa presupuesto vs real
- 📈 **Métricas Consolidadas**: Vista global de todos los proyectos

---

## Dashboard de Finanzas

### Acceder al Dashboard

1. Navega a **Finanzas** desde el menú lateral
2. El dashboard muestra métricas consolidadas de todos tus proyectos

### Métricas Principales

#### Ingresos y Gastos

**Ingresos Totales**
- Suma de todas las facturas cobradas
- Incluye adelantos y pagos por fase
- Actualización en tiempo real

**Gastos Totales**
- Suma de todos los gastos pagados
- Incluye costos directos y gastos operativos
- Desglose por categoría disponible

**Utilidad Neta**
- Cálculo: Ingresos - Gastos
- Indicador de rentabilidad global
- Comparación con período anterior

**Variación Porcentual**
- Compara con mes/trimestre/año anterior
- Indicador visual: 🟢 positivo, 🔴 negativo
- Ayuda a identificar tendencias

#### Pagos Pendientes

**Total de Pagos Pendientes**
- Suma de facturas por pagar a proveedores
- Incluye solo facturas en estado "Pendiente"
- Excluye facturas ya pagadas

**Pagos que Vencen Hoy**
- Cantidad de pagos con vencimiento hoy
- Alerta visual si hay pagos vencidos
- Link directo para registrar pago

#### Margen Bruto Promedio

**Cálculo del Margen**
- Fórmula: (Ingresos - Costos Directos) / Ingresos × 100
- Promedio de todos los proyectos activos
- Indicador de salud del negocio

**Indicadores Visuales**
- 🟢 Verde: Margen > 25% (Excelente)
- 🟡 Amarillo: Margen 15-25% (Aceptable)
- 🔴 Rojo: Margen < 15% (Crítico)

#### Tesorería Total

**Capital Disponible**
- Suma de tesorería de todos los proyectos activos
- Cálculo: Total cobrado - Total pagado
- Actualización automática con cada transacción

### Accesos Rápidos

El dashboard proporciona acceso directo a:
- 📊 **Control de Gastos**: Registrar y gestionar gastos
- 📄 **Facturación**: Ver y crear facturas
- 💼 **Presupuestos**: Gestionar presupuestos
- 📈 **Reportes**: Generar reportes financieros
- 💰 **Flujo de Caja**: Proyección de ingresos y gastos
- 🏢 **Proveedores**: Gestión de proveedores

### Resumen de Alertas

En la parte superior del dashboard:
- Contador de alertas por prioridad
- Alertas críticas destacadas en rojo
- Click para ver detalle completo

---

## Control de Tesorería

### ¿Qué es la Tesorería?

La tesorería es el capital disponible en un proyecto después de restar los gastos pagados de los cobros recibidos.

**Fórmula**: `Tesorería = Cobros - Gastos Pagados`

### Ver Tesorería de un Proyecto

**Opción 1: Desde el Proyecto**
1. Abre el proyecto
2. Ve a la pestaña **"Finanzas"**
3. La tarjeta de tesorería muestra el saldo actual

**Opción 2: Desde Dashboard de Finanzas**
- El dashboard muestra la tesorería total
- Click en un proyecto para ver detalle

### Tarjeta de Tesorería

La tarjeta muestra:

**Saldo Actual**
- Monto disponible en euros
- Actualizado en tiempo real
- Formato: €XX,XXX.XX

**Indicador de Salud**
- 🟢 Verde: Tesorería > 50% del costo de próxima fase
- 🟡 Amarillo: Tesorería entre 20-50%
- 🔴 Rojo: Tesorería < 20%

**Comparación con Próxima Fase**
- Muestra el costo estimado de la siguiente fase
- Indica si hay capital suficiente
- Alerta si la tesorería es insuficiente

**Desglose Detallado**
- Total de cobros recibidos
- Total de gastos pagados
- Diferencia (tesorería)

### Actualización Automática

La tesorería se actualiza automáticamente cuando:
- ✅ Se registra un cobro de factura
- ✅ Se registra un pago de gasto
- ✅ Se completa una fase (genera factura)
- ✅ Se convierte un presupuesto (crea adelanto)

### Interpretación de Indicadores

**🟢 Indicador Verde (Saludable)**
- Tienes capital suficiente para la próxima fase
- Puedes continuar con la ejecución sin problemas
- Margen de seguridad adecuado

**🟡 Indicador Amarillo (Precaución)**
- Capital justo para la próxima fase
- Considera acelerar cobros pendientes
- Monitorea gastos de cerca

**🔴 Indicador Rojo (Crítico)**
- Capital insuficiente para próxima fase
- No inicies nuevas fases sin cobrar
- Prioriza cobros urgentemente

---

## Sistema de Alertas Financieras

### Tipos de Alertas

El sistema genera automáticamente 4 tipos de alertas:

#### 1. Alerta de Bajo Capital (Crítica)

**Cuándo se genera:**
- Tesorería < 120% del costo de la próxima fase

**Qué significa:**
- No tienes suficiente capital para ejecutar la siguiente fase con margen de seguridad

**Acción recomendada:**
- Cobrar facturas pendientes
- Generar y enviar factura de fase completada
- Posponer inicio de nueva fase

#### 2. Alerta de Cobro Pendiente (Alta)

**Cuándo se genera:**
- Una fase alcanza 100% de progreso sin cobro registrado

**Qué significa:**
- Completaste una fase pero no has cobrado

**Acción recomendada:**
- Generar factura de la fase completada
- Enviar factura al cliente
- Hacer seguimiento del cobro

#### 3. Alerta de Sobrecosto (Alta)

**Cuándo se genera:**
- Gastos reales > 110% del presupuesto original

**Qué significa:**
- Estás gastando más de lo presupuestado

**Acción recomendada:**
- Revisar gastos no planificados
- Negociar cambio de alcance con cliente
- Ajustar presupuesto de fases restantes

#### 4. Alerta de Pago Vencido (Media)

**Cuándo se genera:**
- Fecha de vencimiento de pago a proveedor < fecha actual

**Qué significa:**
- Tienes pagos atrasados a proveedores

**Acción recomendada:**
- Registrar el pago si ya se realizó
- Priorizar el pago para evitar penalizaciones
- Contactar al proveedor si hay problemas

### Panel de Alertas

**Acceder al Panel:**
1. Navega a **Finanzas** > **Alertas**
2. O haz click en el contador de alertas del dashboard

**Vista del Panel:**
- Alertas agrupadas por prioridad
- Colores distintivos:
  - 🔴 Crítica (rojo)
  - 🟠 Alta (naranja)
  - 🟡 Media (amarillo)
  - 🔵 Baja (azul)

**Información de Cada Alerta:**
- Título descriptivo
- Mensaje detallado
- Proyecto afectado
- Datos específicos (montos, fechas, etc.)
- Acción recomendada
- Botones de acción rápida

### Gestionar Alertas

**Marcar como Resuelta:**
1. Abre la alerta
2. Haz click en **"Marcar como Resuelta"**
3. Agrega una nota explicativa (opcional)
4. Confirma

**Acciones Rápidas:**
- **Generar Factura**: Crea factura directamente desde la alerta
- **Enviar Recordatorio**: Envía email al cliente
- **Ver Proyecto**: Navega al proyecto afectado
- **Registrar Pago**: Registra pago de factura

### Notificaciones

Recibes notificaciones cuando:
- Se crea una alerta crítica o alta
- Una alerta existente empeora
- Se resuelve automáticamente una alerta

**Configurar Notificaciones:**
1. Ve a **Configuración** > **Notificaciones**
2. Activa/desactiva alertas financieras
3. Elige canal: In-app, Email, ambos

---

## Gestión de Facturas

### Generación Automática

Las facturas se generan automáticamente en dos momentos:

**1. Al Convertir Presupuesto**
- Se crea la factura de adelanto
- Según el porcentaje del plan de pagos
- Estado inicial: "Pendiente de pago"

**2. Al Completar una Fase**
- Se crea la factura de la fase
- Según el porcentaje del plan de pagos
- Vinculada a la fase completada

### Crear Factura Manual

Si necesitas crear una factura adicional:

**Paso 1: Abrir Modal**
1. Ve a **Finanzas** > **Facturas**
2. Haz click en **"+ Nueva Factura"**

**Paso 2: Completar Datos**
- Selecciona el proyecto
- Selecciona la fase (opcional)
- Ingresa el monto
- Define fecha de vencimiento
- Agrega descripción

**Paso 3: Guardar**
- La factura se crea en estado "Borrador"
- Puedes editarla antes de enviar

### Estados de Factura

| Estado | Descripción | Acciones |
|--------|-------------|----------|
| 🟡 Borrador | En edición | Editar, Enviar, Eliminar |
| 🔵 Enviada | Enviada al cliente | Ver, Registrar cobro |
| 🟢 Cobrada | Pago recibido | Ver, Descargar PDF |
| 🔴 Vencida | Pasó fecha de vencimiento | Enviar recordatorio, Registrar cobro |
| ⚫ Cancelada | Factura anulada | Ver |

### Enviar Factura

**Paso 1: Preparar Envío**
1. Abre la factura en estado "Borrador"
2. Revisa todos los datos
3. Haz click en **"Enviar a Cliente"**

**Paso 2: Generar PDF**
- El sistema genera automáticamente un PDF profesional
- Incluye: datos de empresa, cliente, partidas, totales

**Paso 3: Enviar Email**
- Se envía email al cliente con PDF adjunto
- Estado cambia a "Enviada"
- Se registra fecha de envío

### Registrar Cobro

Cuando el cliente paga:

**Paso 1: Abrir Modal de Cobro**
1. Abre la factura
2. Haz click en **"Registrar Cobro"**

**Paso 2: Completar Información**
- **Fecha de cobro**: Cuándo se recibió el pago
- **Método de pago**: Transferencia, efectivo, cheque, tarjeta
- **Referencia**: Número de transferencia o comprobante
- **Notas**: Información adicional (opcional)

**Paso 3: Confirmar**
- Estado cambia a "Cobrada"
- Se actualiza la tesorería del proyecto
- Se verifica si se debe desbloquear la siguiente fase
- Se ejecutan verificaciones financieras

### Qué Sucede al Registrar un Cobro

El sistema ejecuta automáticamente:

1. ✅ Actualiza estado de factura a "Cobrada"
2. ✅ Suma el monto a la tesorería del proyecto
3. ✅ Verifica si la siguiente fase está bloqueada
4. ✅ Desbloquea la fase si corresponde
5. ✅ Ejecuta verificaciones financieras
6. ✅ Actualiza métricas del dashboard

### Lista de Facturas

**Ver Todas las Facturas:**
1. Ve a **Finanzas** > **Facturas**
2. Lista completa con filtros

**Filtros Disponibles:**
- Por estado
- Por proyecto
- Por rango de fechas
- Por cliente

**Información Mostrada:**
- Número de factura
- Cliente
- Proyecto vinculado
- Monto total
- Fecha de emisión
- Fecha de vencimiento
- Estado actual

---

## Bloqueo Automático de Fases

### ¿Por Qué Bloquear Fases?

El bloqueo automático protege tu capital de trabajo evitando que ejecutes fases sin haber cobrado las anteriores.

**Beneficios:**
- 🛡️ Protección del flujo de caja
- 💰 Asegura cobros antes de nuevos gastos
- 📊 Mantiene tesorería saludable
- ⚠️ Previene problemas financieros

### Reglas de Bloqueo

**Fase 1 (Primera Fase)**
- Requiere que el adelanto esté cobrado
- No puede iniciarse sin adelanto
- Protege la inversión inicial

**Fases Posteriores (2, 3, 4...)**
- Requieren que la fase anterior esté cobrada
- No pueden iniciarse sin cobro previo
- Mantienen flujo de caja positivo

### Cómo Funciona

**Escenario 1: Inicio de Proyecto**
```
Presupuesto Aprobado
    ↓
Conversión a Proyecto
    ↓
Se crea Factura de Adelanto (Estado: Pendiente)
    ↓
Fase 1: BLOQUEADA (requiere adelanto)
Fases 2+: BLOQUEADAS (requieren fase anterior)
```

**Escenario 2: Cobro de Adelanto**
```
Registrar Cobro de Adelanto
    ↓
Tesorería se actualiza
    ↓
Fase 1: SE DESBLOQUEA ✅
Fases 2+: Siguen bloqueadas
```

**Escenario 3: Completar Fase 1**
```
Fase 1 alcanza 100%
    ↓
Se genera Factura de Fase 1 (Estado: Pendiente)
    ↓
Fase 2: Sigue BLOQUEADA (requiere cobro Fase 1)
```

**Escenario 4: Cobro de Fase 1**
```
Registrar Cobro de Factura Fase 1
    ↓
Tesorería se actualiza
    ↓
Fase 2: SE DESBLOQUEA ✅
```

### Indicadores Visuales

**En la Lista de Fases:**
- 🔒 Ícono de candado en fases bloqueadas
- Texto: "Bloqueada - Pendiente cobro Fase X"
- Botón "Iniciar Fase" deshabilitado

**En el Detalle de Fase:**
- Banner rojo con motivo de bloqueo
- Información de factura pendiente
- Link a la factura para facilitar cobro

### Forzar Desbloqueo (Administradores)

En casos excepcionales, los administradores pueden forzar el desbloqueo:

**Paso 1: Abrir Modal**
1. En la fase bloqueada, click en **"Forzar Desbloqueo"**
2. Se abre modal de confirmación

**Paso 2: Justificar**
- Ingresa el motivo del desbloqueo forzado
- Ejemplo: "Cliente pagará al finalizar todas las fases"

**Paso 3: Confirmar**
- Se registra en auditoría
- La fase se desbloquea
- Se crea alerta de seguimiento

**⚠️ Advertencia:**
- Forzar desbloqueo aumenta el riesgo financiero
- Úsalo solo en casos justificados
- Monitorea la tesorería de cerca

---

## Análisis de Rentabilidad

### ¿Cuándo se Genera?

El análisis de rentabilidad se genera automáticamente cuando:
- Un proyecto alcanza estado "Completado"
- Todas las fases están al 100%
- Se han registrado todos los gastos

### Acceder al Análisis

**Opción 1: Desde el Proyecto**
1. Abre el proyecto completado
2. Ve a la pestaña **"Finanzas"**
3. Click en **"Ver Análisis de Rentabilidad"**

**Opción 2: Desde Dashboard de Finanzas**
1. Ve a **Finanzas** > **Reportes**
2. Selecciona el proyecto
3. Click en **"Análisis de Rentabilidad"**

### Componentes del Análisis

#### 1. Resumen de Ingresos

**Presupuesto Original**
- Monto del presupuesto aprobado inicial
- Base para comparaciones

**Cambios Aprobados**
- Modificaciones al alcance durante ejecución
- Aumentos o disminuciones acordadas

**Total Facturado**
- Suma de todas las facturas emitidas
- Presupuesto original + cambios

**Total Cobrado**
- Suma de facturas efectivamente cobradas
- Puede ser menor si hay pendientes

#### 2. Costos Directos

Desglose por categoría:

**Subcontratistas**
- Pagos a empresas subcontratadas
- Mano de obra externa

**Materiales**
- Compra de materiales de construcción
- Suministros

**Maquinaria**
- Alquiler de equipos
- Combustible y mantenimiento

**Otros Costos Directos**
- Gastos directamente atribuibles al proyecto

**Total Costos Directos**
- Suma de todas las categorías

#### 3. Gastos Operativos

Desglose por categoría:

**Personal Propio**
- Salarios de empleados de la empresa
- Beneficios sociales

**Transporte**
- Combustible de vehículos propios
- Peajes y estacionamiento

**Permisos y Licencias**
- Permisos de construcción
- Licencias municipales

**Otros Gastos Operativos**
- Seguros
- Gastos administrativos

**Total Gastos Operativos**
- Suma de todas las categorías

#### 4. Resultados Financieros

**Margen Bruto**
- Fórmula: Ingresos - Costos Directos
- Indica rentabilidad antes de gastos operativos

**Margen Bruto %**
- Fórmula: (Margen Bruto / Ingresos) × 100
- Porcentaje de ganancia sobre ingresos

**Utilidad Neta**
- Fórmula: Margen Bruto - Gastos Operativos
- Ganancia final del proyecto

**Utilidad Neta %**
- Fórmula: (Utilidad Neta / Ingresos) × 100
- Porcentaje de ganancia neta

**ROI (Retorno de Inversión)**
- Fórmula: (Utilidad Neta / Costos Totales) × 100
- Eficiencia de la inversión

#### 5. Comparativa Presupuesto vs Real

Tabla detallada mostrando:

| Concepto | Presupuestado | Real | Variación | Variación % |
|----------|---------------|------|-----------|-------------|
| Subcontratistas | €50,000 | €52,000 | +€2,000 | +4% |
| Materiales | €30,000 | €28,500 | -€1,500 | -5% |
| ... | ... | ... | ... | ... |

**Interpretación de Variaciones:**
- 🟢 Verde: Gasto menor al presupuestado (ahorro)
- 🔴 Rojo: Gasto mayor al presupuestado (sobrecosto)
- Porcentaje indica magnitud de la desviación

#### 6. Análisis de Tiempo

**Tiempo Planificado**
- Duración estimada en el presupuesto
- En días

**Tiempo Real**
- Duración efectiva del proyecto
- Desde inicio hasta completado

**Variación**
- Diferencia en días
- Positivo: se demoró más
- Negativo: se completó antes

#### 7. Notas y Observaciones

Espacio para agregar:
- Explicaciones de variaciones significativas
- Lecciones aprendidas
- Factores externos que afectaron
- Recomendaciones para futuros proyectos

### Exportar Análisis

**Generar PDF:**
1. En el análisis, click en **"Exportar a PDF"**
2. Se genera PDF profesional con:
   - Todos los datos y tablas
   - Gráficos visuales
   - Notas y observaciones
3. Descarga automáticamente

**Usos del PDF:**
- Presentación a dirección
- Archivo histórico
- Base para futuros presupuestos
- Análisis de mejora continua

### Interpretar Resultados

**Proyecto Exitoso:**
- ✅ Utilidad Neta positiva
- ✅ Margen Bruto > 20%
- ✅ Variaciones < 10%
- ✅ Tiempo dentro de lo planificado

**Proyecto con Problemas:**
- ❌ Utilidad Neta negativa o muy baja
- ❌ Margen Bruto < 15%
- ❌ Sobrecostos > 15%
- ❌ Retrasos significativos

**Acciones Correctivas:**
- Analiza categorías con mayor variación
- Identifica causas raíz
- Ajusta presupuestos futuros
- Mejora procesos de control

---

## Mejores Prácticas

### Control de Tesorería

1. **Monitorea Diariamente**
   - Revisa la tesorería de proyectos activos
   - Presta atención a indicadores rojos
   - Actúa antes de que se vuelva crítico

2. **Mantén Margen de Seguridad**
   - Ideal: Tesorería > 50% próxima fase
   - Mínimo: Tesorería > 20% próxima fase
   - Nunca inicies fase con tesorería insuficiente

3. **Acelera Cobros**
   - Envía facturas inmediatamente al completar fases
   - Haz seguimiento de facturas enviadas
   - Ofrece descuentos por pronto pago

### Gestión de Alertas

1. **Revisa Alertas Diariamente**
   - Prioriza alertas críticas
   - Resuelve alertas altas en 24-48 horas
   - No ignores alertas recurrentes

2. **Actúa Proactivamente**
   - No esperes a que se vuelvan críticas
   - Toma acción en alertas amarillas
   - Previene problemas mayores

3. **Documenta Resoluciones**
   - Agrega notas al resolver alertas
   - Explica qué acción tomaste
   - Facilita auditorías futuras

### Facturación

1. **Factura Inmediatamente**
   - Al completar cada fase
   - No esperes a terminar el proyecto
   - Mantén flujo de caja constante

2. **Verifica Datos**
   - Revisa montos antes de enviar
   - Confirma datos del cliente
   - Evita errores que retrasen cobros

3. **Haz Seguimiento**
   - Contacta al cliente si no paga en plazo
   - Envía recordatorios amigables
   - Mantén comunicación abierta

### Bloqueo de Fases

1. **Respeta los Bloqueos**
   - No fuerces desbloqueos sin justificación
   - Los bloqueos protegen tu negocio
   - Negocia pagos antes de iniciar

2. **Comunica con el Cliente**
   - Explica la política de cobros por fase
   - Incluye en el contrato inicial
   - Evita sorpresas

3. **Documenta Excepciones**
   - Si fuerzas desbloqueo, documenta por qué
   - Obtén aprobación de dirección
   - Monitorea de cerca

### Análisis de Rentabilidad

1. **Revisa Cada Proyecto**
   - Analiza todos los proyectos completados
   - Identifica patrones
   - Aprende de errores

2. **Compara con Presupuesto**
   - Entiende dónde te desviaste
   - Ajusta estimaciones futuras
   - Mejora precisión de presupuestos

3. **Comparte Aprendizajes**
   - Discute con el equipo
   - Implementa mejoras
   - Documenta lecciones aprendidas

---

## Preguntas Frecuentes

### ¿Con qué frecuencia se actualiza la tesorería?

La tesorería se actualiza en tiempo real cada vez que:
- Registras un cobro
- Registras un pago de gasto
- Se completa una transacción financiera

No necesitas actualizar manualmente.

### ¿Puedo desactivar el bloqueo automático de fases?

No se recomienda desactivar el bloqueo, ya que protege tu capital. Sin embargo, los administradores pueden forzar desbloqueos caso por caso con justificación.

### ¿Qué hago si una alerta es incorrecta?

Si una alerta se generó por error:
1. Verifica que los datos sean correctos
2. Si hay un error en los datos, corrígelo
3. La alerta se resolverá automáticamente
4. Si persiste, marca como resuelta con nota explicativa

### ¿Puedo editar una factura después de enviarla?

No, una vez enviada, la factura queda "congelada" para mantener integridad. Si necesitas hacer cambios:
- Cancela la factura original
- Crea una nueva factura corregida
- Envía la nueva factura

### ¿Cómo se calcula el margen bruto?

Margen Bruto = Ingresos Totales - Costos Directos

Los costos directos incluyen:
- Subcontratistas
- Materiales
- Maquinaria
- Otros costos directamente atribuibles

No incluyen gastos operativos (personal propio, transporte, etc.)

### ¿Qué es un buen margen bruto en construcción?

Depende del tipo de proyecto, pero generalmente:
- Excelente: > 25%
- Bueno: 20-25%
- Aceptable: 15-20%
- Bajo: < 15%

Ajusta según tu mercado y tipo de obra.

### ¿Puedo generar facturas manualmente?

Sí, además de las facturas automáticas, puedes crear facturas manuales para:
- Cambios de alcance
- Trabajos adicionales
- Ajustes de precio
- Cualquier cobro no contemplado en el plan original

### ¿Las alertas se envían por email?

Depende de tu configuración:
- Ve a **Configuración** > **Notificaciones**
- Activa "Alertas Financieras por Email"
- Elige qué prioridades quieres recibir

Por defecto, solo las alertas críticas se envían por email.

### ¿Puedo ver la rentabilidad de un proyecto antes de completarlo?

Sí, puedes ver métricas parciales:
- Ingresos cobrados hasta el momento
- Gastos pagados hasta el momento
- Margen bruto parcial
- Proyección de rentabilidad final

El análisis completo se genera al completar el proyecto.

### ¿Qué pasa si un cliente nunca paga una factura?

Si una factura queda impaga:
1. Permanece en estado "Vencida"
2. Genera alertas continuas
3. La fase siguiente permanece bloqueada
4. Afecta la tesorería del proyecto

Acciones recomendadas:
- Seguimiento legal si es necesario
- Considerar cancelar el proyecto
- Documentar para futuras referencias

### ¿Puedo exportar datos financieros?

Sí, puedes exportar:
- Análisis de rentabilidad (PDF)
- Lista de facturas (CSV)
- Reporte de gastos (CSV)
- Dashboard de finanzas (PDF)

Usa los botones de exportación en cada sección.

---

## Soporte

Si tienes problemas o preguntas:
- Consulta la documentación técnica en `/docs`
- Revisa los logs del sistema
- Contacta al administrador del sistema

---

**Última actualización**: Enero 2025  
**Versión del módulo**: 1.0.0
