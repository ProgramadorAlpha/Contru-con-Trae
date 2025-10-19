# Guía de Usuario - Módulo de Presupuestos

## Índice

1. [Introducción](#introducción)
2. [Gestión de Clientes](#gestión-de-clientes)
3. [Crear Presupuesto con IA](#crear-presupuesto-con-ia)
4. [Editar Presupuesto Manualmente](#editar-presupuesto-manualmente)
5. [Enviar Presupuesto al Cliente](#enviar-presupuesto-al-cliente)
6. [Seguimiento de Presupuestos](#seguimiento-de-presupuestos)
7. [Aprobación y Firma Digital](#aprobación-y-firma-digital)
8. [Conversión a Proyecto](#conversión-a-proyecto)
9. [Versionado de Presupuestos](#versionado-de-presupuestos)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## Introducción

El módulo de Presupuestos de TRAE permite crear cotizaciones profesionales de forma rápida y eficiente, utilizando inteligencia artificial para generar partidas detalladas. El sistema gestiona todo el ciclo de vida del presupuesto: desde la creación hasta la conversión en proyecto activo.

### Características Principales

- ✨ **Creación asistida por IA**: Conversa con Claude para generar presupuestos detallados
- 📊 **Gestión de estados**: Control completo del flujo (borrador → enviado → aprobado → convertido)
- 📧 **Envío profesional**: Genera PDF y link de visualización para el cliente
- ✍️ **Firma digital**: Firma electrónica con validez legal
- 🔄 **Versionado**: Crea múltiples versiones durante la negociación
- 🚀 **Conversión automática**: Transforma presupuestos aprobados en proyectos con un clic

---

## Gestión de Clientes

### Crear un Nuevo Cliente

1. Navega a **Clientes** desde el menú lateral
2. Haz clic en el botón **"+ Nuevo Cliente"**
3. Completa el formulario con la información del cliente:
   - **Datos básicos**: Nombre, empresa, email, teléfono
   - **Datos fiscales**: CIF/NIF
   - **Dirección completa**: Calle, ciudad, provincia, código postal, país
   - **Datos bancarios** (opcional): Banco, IBAN, SWIFT

4. Haz clic en **"Guardar"**

### Buscar Clientes Existentes

- Utiliza la barra de búsqueda para encontrar clientes por:
  - Nombre
  - Empresa
  - Email
  - Teléfono

### Ver Estadísticas del Cliente

Cada cliente muestra automáticamente:
- Total de presupuestos creados
- Presupuestos aprobados (%)
- Total facturado
- Total cobrado
- Proyectos activos y completados

---

## Crear Presupuesto con IA

### Paso 1: Iniciar Creación

1. Navega a **Presupuestos** desde el menú lateral
2. Haz clic en **"+ Nuevo Presupuesto"**
3. Selecciona o crea un cliente
4. Ingresa el nombre del proyecto y ubicación de la obra

### Paso 2: Conversar con IA

El chat de IA te ayudará a crear el presupuesto. Puedes:

**Ejemplo de conversación:**

```
Usuario: "Necesito un presupuesto para construir una casa unifamiliar 
de 150m² en dos plantas, con acabados de calidad media"

IA: "Entendido. Voy a crear un presupuesto detallado para una casa 
unifamiliar de 150m². ¿Incluye el terreno o solo la construcción?"

Usuario: "Solo construcción, el terreno ya está"

IA: "Perfecto. He generado el presupuesto con 5 fases:
- Fase 1: Cimentación y Estructura
- Fase 2: Albañilería y Cerramientos
- Fase 3: Instalaciones
- Fase 4: Acabados
- Fase 5: Exteriores y Limpieza"
```

### Paso 3: Adjuntar Archivos (Opcional)

Puedes adjuntar documentos para que la IA los analice:
- 📐 Planos arquitectónicos
- 📋 Especificaciones técnicas
- 📷 Fotos del terreno
- 📄 Memorias descriptivas

### Paso 4: Revisar y Ajustar

La IA generará automáticamente:
- Partidas organizadas por fases
- Cantidades y unidades
- Precios unitarios
- Subtotales por fase
- IVA (21%) y total general
- Plan de pagos sugerido

---

## Editar Presupuesto Manualmente

### Editar Información General

1. En el editor de presupuesto, haz clic en **"Editar Información"**
2. Modifica:
   - Nombre del proyecto
   - Ubicación de la obra
   - Días de validez
   - Notas y condiciones

### Gestionar Fases

**Agregar nueva fase:**
- Haz clic en **"+ Agregar Fase"**
- Ingresa nombre y descripción
- Define duración estimada (días)
- Establece porcentaje de cobro

**Editar fase existente:**
- Haz clic en el ícono de edición (✏️) en la fase
- Modifica los datos necesarios
- Guarda los cambios

**Eliminar fase:**
- Haz clic en el ícono de eliminar (🗑️)
- Confirma la eliminación

### Gestionar Partidas

**Agregar partida a una fase:**
1. Dentro de la fase, haz clic en **"+ Agregar Partida"**
2. Completa:
   - Código (ej: 1.1, 1.2)
   - Nombre descriptivo
   - Unidad (m³, m², unidad, etc.)
   - Cantidad
   - Precio unitario

3. El total se calcula automáticamente

**Editar partida:**
- Haz clic en la partida para editarla
- Modifica los valores necesarios
- Los totales se recalculan automáticamente

**Agregar subpartidas:**
- Dentro de una partida, haz clic en **"+ Agregar Subpartida"**
- Completa los detalles de la subpartida

### Editar Plan de Pagos

1. Ve a la sección **"Plan de Pagos"**
2. Modifica los pagos existentes:
   - Descripción (ej: "Adelanto", "Fin Fase 1")
   - Porcentaje del total
   - Vinculación a fase (opcional)

3. Verifica que la suma de porcentajes sea 100%

### Validaciones Automáticas

El sistema valida automáticamente:
- ✅ Suma de fases = Subtotal
- ✅ Subtotal + IVA = Total
- ✅ Plan de pagos suma 100%
- ✅ Todos los campos obligatorios completos

---

## Enviar Presupuesto al Cliente

### Paso 1: Preparar Envío

1. Abre el presupuesto en estado "Borrador"
2. Revisa que toda la información esté correcta
3. Haz clic en **"Enviar a Cliente"**

### Paso 2: Configurar Envío

En el modal de envío:
- **Email del cliente**: Verifica que sea correcto
- **Mensaje personalizado**: Agrega un mensaje opcional
- **Días de validez**: Confirma el período de validez (por defecto 30 días)

### Paso 3: Confirmar Envío

Al hacer clic en **"Enviar"**, el sistema:
1. ✅ Genera un PDF profesional del presupuesto
2. ✅ Crea un link único de visualización
3. ✅ Envía email al cliente con:
   - PDF adjunto
   - Link para ver online
   - Botones para aprobar/rechazar
4. ✅ Cambia el estado a "Enviado"

### Qué Recibe el Cliente

El cliente recibe un email con:
- **Asunto**: "Presupuesto [Número] - [Nombre Proyecto]"
- **PDF adjunto**: Presupuesto completo en formato profesional
- **Link de visualización**: Acceso web sin necesidad de login
- **Instrucciones**: Cómo aprobar o rechazar el presupuesto

---

## Seguimiento de Presupuestos

### Dashboard de Presupuestos

El dashboard muestra métricas clave:
- **Total de presupuestos**: Cantidad total creada
- **Aprobados**: Cantidad y porcentaje de aprobación
- **Pendientes**: Presupuestos enviados sin respuesta
- **Rechazados**: Cantidad y porcentaje
- **Monto total facturado**: Suma de presupuestos aprobados
- **Monto total cobrado**: Suma de cobros reales

### Estados de Presupuesto

| Estado | Descripción | Acciones Disponibles |
|--------|-------------|---------------------|
| 🟡 **Borrador** | En edición, no enviado | Editar, Enviar, Eliminar |
| 🔵 **Enviado** | Enviado al cliente, esperando respuesta | Ver, Duplicar, Crear versión |
| 🟢 **Aprobado** | Cliente aprobó el presupuesto | Firmar, Convertir a proyecto |
| 🔴 **Rechazado** | Cliente rechazó el presupuesto | Ver motivo, Crear versión |
| ⚫ **Expirado** | Venció el plazo de validez | Crear versión, Reenviar |
| ✅ **Convertido** | Ya se convirtió en proyecto | Ver proyecto vinculado |

### Filtrar Presupuestos

Utiliza los filtros para encontrar presupuestos:
- **Por estado**: Borrador, Enviado, Aprobado, etc.
- **Por cliente**: Selecciona un cliente específico
- **Por fecha**: Rango de fechas de creación
- **Por monto**: Rango de montos (mínimo - máximo)

### Tracking de Visualización

El sistema registra automáticamente:
- 📧 Fecha de envío
- 👁️ Fecha de primera visualización
- ✅ Fecha de aprobación/rechazo
- 💬 Comentarios del cliente (si rechaza)

---

## Aprobación y Firma Digital

### Aprobación del Cliente

Cuando el cliente accede al link público:
1. Ve el presupuesto completo con todas las fases y partidas
2. Puede descargar el PDF
3. Tiene dos opciones:
   - **Aprobar**: Acepta el presupuesto
   - **Rechazar**: Rechaza con opción de agregar comentarios

### Notificaciones

Recibirás una notificación automática cuando:
- ✅ El cliente visualiza el presupuesto
- ✅ El cliente aprueba el presupuesto
- ❌ El cliente rechaza el presupuesto

### Firma Digital

Una vez aprobado, puedes firmar digitalmente:

**Paso 1: Iniciar Firma**
1. Abre el presupuesto aprobado
2. Haz clic en **"Firmar Digitalmente"**

**Paso 2: Elegir Método de Firma**
- **Dibujar firma**: Usa el mouse o pantalla táctil
- **Cargar imagen**: Sube una imagen de tu firma
- **Firma electrónica**: Usa certificado digital (si está configurado)

**Paso 3: Confirmar Firma**
- Ingresa tu nombre completo
- Revisa los datos
- Haz clic en **"Confirmar Firma"**

El sistema registra:
- Tipo de firma utilizada
- Nombre del firmante
- Fecha y hora exacta
- Dirección IP

**Paso 4: Firma del Cliente**
- Envía el link de firma al cliente
- El cliente firma de la misma manera
- Ambas firmas quedan registradas

### PDF Firmado

Una vez ambas partes firman:
- Se genera un PDF final con ambas firmas
- Se envía automáticamente por email a ambas partes
- Se almacena en el storage del proyecto

---

## Conversión a Proyecto

### Cuándo Convertir

Convierte un presupuesto a proyecto cuando:
- ✅ El presupuesto está en estado "Aprobado"
- ✅ Ambas partes han firmado (recomendado)
- ✅ Estás listo para iniciar la ejecución

### Proceso de Conversión

**Paso 1: Iniciar Conversión**
1. Abre el presupuesto aprobado
2. Haz clic en **"Convertir a Proyecto"**

**Paso 2: Revisar Información**
El modal muestra un resumen:
- Nombre del proyecto
- Cliente
- Monto total
- Número de fases
- Plan de pagos

**Paso 3: Confirmar Conversión**
Haz clic en **"Confirmar Conversión"**

### Qué Crea el Sistema Automáticamente

Al convertir, el sistema crea:

1. **Proyecto nuevo** con:
   - Toda la información del presupuesto
   - Fases con sus partidas
   - Montos presupuestados
   - Estado inicial: "En Planificación"

2. **Factura de adelanto**:
   - Según el porcentaje definido en el plan de pagos
   - Estado: "Pendiente de pago"
   - Fecha de vencimiento calculada

3. **Estructura de fases**:
   - Fase 1: Estado "Pendiente" (lista para iniciar)
   - Fases 2+: Estado "Bloqueada" (requieren cobro previo)

4. **Vinculación bidireccional**:
   - El presupuesto guarda el ID del proyecto
   - El proyecto guarda el ID del presupuesto

### Después de la Conversión

- El presupuesto cambia a estado "Convertido"
- Ya no se puede editar el presupuesto
- Puedes navegar directamente al proyecto creado
- El sistema te redirige automáticamente al nuevo proyecto

---

## Versionado de Presupuestos

### Cuándo Crear una Versión

Crea una nueva versión cuando:
- El cliente solicita cambios
- Necesitas ajustar precios
- Quieres proponer alternativas
- El presupuesto fue rechazado

### Crear Nueva Versión

**Paso 1: Desde el Presupuesto Original**
1. Abre el presupuesto que quieres versionar
2. Haz clic en **"Crear Nueva Versión"**

**Paso 2: Editar la Nueva Versión**
- El sistema copia todos los datos
- Incrementa el número de versión (v1 → v2)
- Puedes editar cualquier aspecto
- El presupuesto original permanece intacto

**Paso 3: Enviar Nueva Versión**
- Envía la nueva versión al cliente
- El cliente verá claramente que es la versión 2

### Comparar Versiones

**Acceder al Comparador:**
1. Abre cualquier versión del presupuesto
2. Haz clic en **"Comparar Versiones"**
3. Selecciona las dos versiones a comparar

**Qué Muestra el Comparador:**
- Diferencias en montos totales
- Cambios en fases (agregadas/eliminadas/modificadas)
- Cambios en partidas (precios, cantidades)
- Variación porcentual
- Resaltado visual de cambios

### Gestión de Versiones

**Ver Todas las Versiones:**
- En la lista de presupuestos, cada versión aparece como entrada separada
- El número de versión se muestra claramente (v1, v2, v3)

**Cuando se Aprueba una Versión:**
- La versión aprobada se puede convertir a proyecto
- Las demás versiones se marcan como "Obsoletas"
- Las versiones obsoletas permanecen para historial

---

## Preguntas Frecuentes

### ¿Puedo editar un presupuesto después de enviarlo?

No directamente. Una vez enviado, el presupuesto queda "congelado" para mantener integridad. Si necesitas hacer cambios:
- Crea una nueva versión
- Edita la nueva versión
- Envía la versión actualizada

### ¿Qué pasa si el presupuesto expira?

- El sistema cambia automáticamente el estado a "Expirado"
- Puedes crear una nueva versión con fecha de validez actualizada
- Puedes reenviar el presupuesto con nueva fecha

### ¿Puedo eliminar un presupuesto?

- Solo puedes eliminar presupuestos en estado "Borrador"
- Los presupuestos enviados, aprobados o convertidos no se pueden eliminar
- Esto mantiene la integridad del historial

### ¿Cómo funciona el cálculo del IVA?

- El IVA se calcula automáticamente al 21% sobre el subtotal
- Si necesitas otro porcentaje, puedes editarlo manualmente
- El total siempre es: Subtotal + IVA

### ¿Puedo duplicar un presupuesto?

Sí, desde cualquier presupuesto:
1. Haz clic en el menú de acciones (⋮)
2. Selecciona **"Duplicar"**
3. Se crea una copia en estado "Borrador"
4. Puedes editarla libremente

### ¿La IA siempre genera precios correctos?

La IA genera precios estimados basados en:
- Datos de mercado
- Proyectos similares
- Bases de datos de construcción

**Siempre debes revisar y ajustar:**
- Verifica que los precios sean competitivos
- Ajusta según tu región y proveedores
- Considera tus márgenes de ganancia

### ¿Qué pasa si el cliente no puede acceder al link?

Si el cliente tiene problemas:
1. Verifica que el email no esté en spam
2. Reenvía el presupuesto desde el sistema
3. Descarga el PDF y envíalo manualmente
4. El link es válido hasta que expire el presupuesto

### ¿Puedo convertir un presupuesto sin firma digital?

Sí, la firma digital es opcional. Puedes convertir un presupuesto aprobado directamente. Sin embargo, se recomienda la firma digital para:
- Mayor validez legal
- Registro completo de aceptación
- Protección ante disputas

### ¿Cómo cancelo un presupuesto enviado?

No puedes "cancelar" un presupuesto enviado, pero puedes:
- Esperar a que expire naturalmente
- Crear una nueva versión si el cliente solicita cambios
- Contactar al cliente directamente para informar cambios

### ¿Los presupuestos se sincronizan en tiempo real?

Sí, todos los cambios se guardan automáticamente en Firestore:
- Los cambios son visibles inmediatamente
- Múltiples usuarios pueden ver el mismo presupuesto
- El historial de cambios se mantiene

---

## Soporte

Si tienes problemas o preguntas:
- Consulta la documentación técnica en `/docs`
- Revisa los logs del sistema
- Contacta al administrador del sistema

---

**Última actualización**: Enero 2025  
**Versión del módulo**: 1.0.0
