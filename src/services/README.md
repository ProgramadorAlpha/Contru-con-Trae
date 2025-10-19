# Services with localStorage Persistence

Este directorio contiene todos los servicios de la aplicación con persistencia en localStorage.

## Servicios Disponibles

### 1. LocalStorage Service (`localStorage.service.ts`)

Servicio centralizado para gestionar localStorage con:
- Type safety
- Versionado de datos
- Manejo de errores
- Importación/exportación de datos
- Migración entre versiones

**Uso básico:**

```typescript
import { localStorageService } from './services/localStorage.service';

// Guardar datos
localStorageService.set('mi_clave', { nombre: 'Juan', edad: 30 });

// Obtener datos
const datos = localStorageService.get('mi_clave', { nombre: '', edad: 0 });

// Verificar si existe
if (localStorageService.has('mi_clave')) {
  console.log('Datos encontrados');
}

// Eliminar datos
localStorageService.remove('mi_clave');

// Limpiar todo
localStorageService.clear();
```

### 2. Ingreso Service (`ingreso.service.ts`)

Gestiona ingresos/entradas de dinero con persistencia automática.

**Características:**
- ✅ Persistencia automática en localStorage
- ✅ CRUD completo (Create, Read, Update, Delete)
- ✅ Filtros por proyecto, fecha, categoría
- ✅ Estadísticas y totales
- ✅ Exportación/importación de datos

**Uso:**

```typescript
import { ingresoService } from './services/ingreso.service';

// Crear ingreso
const ingreso = await ingresoService.createIngreso({
  proyecto_id: 'proj-1',
  monto: 5000,
  fecha: '2025-01-18',
  descripcion: 'Pago inicial',
  categoria: 'Anticipo'
});

// Obtener ingresos de un proyecto
const ingresos = await ingresoService.getIngresosByProyecto('proj-1');

// Obtener estadísticas
const stats = await ingresoService.getEstadisticasIngresos('proj-1');
console.log('Total ingresos:', stats.total);

// Actualizar ingreso
await ingresoService.updateIngreso(ingreso.id, {
  monto: 6000,
  descripcion: 'Pago inicial actualizado'
});

// Eliminar ingreso
await ingresoService.deleteIngreso(ingreso.id);
```

### 3. Gasto Service (`gasto.service.ts`)

Gestiona gastos/egresos con persistencia automática.

**Características:**
- ✅ Persistencia automática en localStorage
- ✅ CRUD completo
- ✅ Vinculación con documentos
- ✅ Sistema de aprobación
- ✅ Filtros y estadísticas

**Uso:**

```typescript
import { gastoService } from './services/gasto.service';

// Crear gasto
const gasto = await gastoService.createGasto({
  proyecto_id: 'proj-1',
  categoria: 'Materiales',
  concepto: 'Cemento',
  monto: 1500,
  fecha: '2025-01-18',
  proveedor: 'Proveedor XYZ'
});

// Vincular con documento
await gastoService.linkToDocument(gasto.id, 'doc-123');

// Aprobar gasto
await gastoService.approveGasto(gasto.id, 'user-1');

// Obtener gastos pendientes
const pendientes = await gastoService.getAllGastos({
  proyecto_id: 'proj-1',
  aprobado: false
});
```

### 4. Documento Service (`documento.service.ts`)

Gestiona documentos con persistencia automática.

**Características:**
- ✅ Persistencia automática en localStorage
- ✅ Upload de documentos
- ✅ Escaneo de recibos con IA
- ✅ Búsqueda y filtros
- ✅ Organización por carpetas/tipos

**Uso:**

```typescript
import { documentoService } from './services/documento.service';

// Subir documento
const documento = await documentoService.subirDocumento({
  proyecto_id: 'proj-1',
  nombre: 'Contrato Principal',
  tipo: 'Contratos',
  archivo: file,
  descripcion: 'Contrato firmado con el cliente'
});

// Escanear recibo
const resultado = await documentoService.escanearRecibo({
  archivo: file,
  proyecto_id: 'proj-1'
});

// Buscar documentos
const resultados = await documentoService.buscarDocumentos({
  proyecto_id: 'proj-1',
  busqueda: 'factura',
  tipo: 'Facturas'
});

// Obtener documentos por carpeta
const facturas = await documentoService.getDocumentosPorCarpeta('proj-1', 'Facturas');
```

### 5. Proyecto Service (`proyecto.service.ts`)

Gestiona proyectos y sus estadísticas.

**Características:**
- ✅ Obtención de proyectos
- ✅ Estadísticas de documentos
- ✅ Validación de límites
- ✅ Integración con documentos

**Uso:**

```typescript
import { proyectoService } from './services/proyecto.service';

// Obtener proyectos activos
const proyectos = await proyectoService.getProyectosUsuario('user-1', {
  activos: true
});

// Obtener estadísticas de documentos
const stats = await proyectoService.getEstadisticasDocumentos('proj-1');
console.log('Total documentos:', stats.total_documentos);
console.log('Espacio usado:', stats.espacio_usado_gb, 'GB');

// Validar límites antes de subir
const validation = await proyectoService.validarLimites('proj-1', fileSize);
if (!validation.valid) {
  console.error('Límite excedido:', validation.reason);
}
```

## Persistencia de Datos

### Cómo Funciona

Todos los servicios usan `localStorageService` internamente para persistir datos:

1. **Lectura**: Al iniciar, los servicios cargan datos desde localStorage
2. **Escritura**: Cada operación CRUD guarda automáticamente en localStorage
3. **Versionado**: Los datos incluyen versión para migraciones futuras
4. **Timestamp**: Cada registro incluye `created_at` y `updated_at`

### Estructura de Datos en localStorage

```
constructpro_v1_documentos    → Array de documentos
constructpro_v1_ingresos      → Array de ingresos
constructpro_v1_gastos        → Array de gastos
```

### Inspeccionar Datos

Para ver los datos guardados:

1. Abre DevTools (F12)
2. Ve a Application → Local Storage
3. Busca las claves con prefijo `constructpro_v1_`

### Exportar/Importar Datos

```typescript
// Exportar todos los datos
const allData = localStorageService.exportData();
console.log(JSON.stringify(allData, null, 2));

// Exportar datos específicos
const ingresos = ingresoService.exportData();
const gastos = gastoService.exportData();

// Importar datos
ingresoService.importData(ingresos);
gastoService.importData(gastos);
```

### Limpiar Datos

```typescript
// Limpiar un servicio específico
ingresoService.clearAll();
gastoService.clearAll();

// Limpiar todo localStorage de la app
localStorageService.clear();
```

## Migración a Base de Datos Real

Cuando estés listo para migrar a una base de datos real:

### Paso 1: Exportar Datos Actuales

```typescript
// En la consola del navegador
const ingresos = ingresoService.exportData();
const gastos = gastoService.exportData();

console.log('Ingresos:', JSON.stringify(ingresos, null, 2));
console.log('Gastos:', JSON.stringify(gastos, null, 2));
```

### Paso 2: Actualizar Servicios

Reemplaza las implementaciones mock con llamadas API reales:

```typescript
// Antes (mock con localStorage)
async createIngreso(data: CreateIngresoDTO): Promise<Ingreso> {
  const ingresos = this.getIngresos();
  const newIngreso = { ...data, id: generateId() };
  ingresos.push(newIngreso);
  this.saveIngresos(ingresos);
  return newIngreso;
}

// Después (API real)
async createIngreso(data: CreateIngresoDTO): Promise<Ingreso> {
  const response = await fetch('/api/ingresos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    throw new Error('Failed to create ingreso');
  }
  
  return response.json();
}
```

### Paso 3: Importar Datos a la Base de Datos

Usa los scripts de migración en `/migrations` para importar los datos exportados.

## Ventajas del Sistema Actual

✅ **Sin backend requerido**: Funciona completamente offline
✅ **Desarrollo rápido**: No necesitas configurar base de datos
✅ **Testing fácil**: Datos aislados por navegador
✅ **Persistencia**: Los datos sobreviven recargas de página
✅ **Type-safe**: TypeScript en todos los servicios

## Limitaciones

❌ **No sincroniza entre dispositivos**: Datos locales al navegador
❌ **Límite de almacenamiento**: ~5-10MB dependiendo del navegador
❌ **No multi-usuario**: Sin autenticación real
❌ **Puede perderse**: Si se limpia localStorage del navegador

## Mejores Prácticas

1. **Siempre usa los servicios**: No accedas localStorage directamente
2. **Maneja errores**: Todos los métodos pueden lanzar excepciones
3. **Valida datos**: Verifica que los datos existan antes de usarlos
4. **Exporta regularmente**: Haz backups de datos importantes
5. **Usa TypeScript**: Aprovecha los tipos para evitar errores

## Debugging

### Ver logs en consola

Todos los servicios logean operaciones importantes:

```
✅ Ingreso created with projectId: proj-1
✅ Ingresos persisted to localStorage
✅ Gasto updated: {...}
✅ Document uploaded and persisted: {...}
```

### Verificar tamaño de datos

```typescript
const size = localStorageService.getSize();
const formatted = localStorageService.getSizeFormatted();
console.log('Tamaño total:', formatted);
```

### Verificar integridad

```typescript
// Verificar que los datos se guardaron
const ingresos = ingresoService.exportData();
console.log('Total ingresos en localStorage:', ingresos.length);

// Verificar un ingreso específico
const ingreso = await ingresoService.getIngresoById('ingreso-123');
if (ingreso) {
  console.log('Ingreso encontrado:', ingreso);
} else {
  console.error('Ingreso no encontrado');
}
```

## Soporte

Si encuentras problemas con la persistencia:

1. Verifica que localStorage esté habilitado en el navegador
2. Revisa la consola para errores
3. Verifica el tamaño de datos (límite ~5MB)
4. Intenta limpiar y reiniciar si hay corrupción

---

**Última actualización**: Enero 18, 2025
**Versión**: 1.0.0
