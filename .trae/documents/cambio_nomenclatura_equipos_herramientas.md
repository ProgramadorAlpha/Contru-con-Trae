# Documento Técnico: Cambio de Nomenclatura de "Equipos" a "Herramientas"

## 1. Resumen del Proyecto

Este documento detalla la estrategia técnica para cambiar el término "Equipos" por "Herramientas" en toda la aplicación ConstructPro, incluyendo frontend, backend, base de datos y todos los componentes relacionados.

## 2. Alcance del Cambio

### 2.1 Objetivo
Eliminar la confusión entre "equipos de trabajo" (grupos de personas) y "equipos/herramientas" (maquinaria y dispositivos) mediante el uso consistente del término "Herramientas".

### 2.2 Áreas Afectadas
- **Frontend**: Componentes React, páginas, hooks, utilidades
- **Backend**: Servicios, APIs, lógica de negocio
- **Base de Datos**: Esquemas, tablas, columnas, índices
- **Tipos e Interfaces**: Definiciones TypeScript
- **Documentación**: Archivos MD, comentarios, mensajes de error

## 3. Análisis de Archivos Afectados

### 3.1 Frontend (React/TypeScript)

#### Componentes Principales
```
src/components/equipment/
├── EquipmentAssignment.tsx
├── EquipmentCard.tsx
├── EquipmentDetail.tsx
├── EquipmentList.tsx
├── EquipmentMaintenance.tsx
├── MaintenanceCalendar.tsx
└── DocumentUpload.tsx
```

#### Páginas
```
src/pages/
├── EquipmentPage.tsx
└── reports/
    └── EquipmentReports.tsx
```

#### Hooks Personalizados
```
src/hooks/
├── useEquipment.ts
└── useEquipmentFilters.ts
```

#### Servicios
```
src/services/
├── equipmentService.ts
└── maintenanceService.ts
```

#### Tipos e Interfaces
```
src/types/
└── equipment.ts
```

#### Utilidades
```
src/utils/
├── equipmentValidators.ts
└── formatters.ts
```

### 3.2 Backend y APIs

#### Archivos de API
```
src/api/
└── equipmentAPI.ts (si existe)
```

#### Servicios
```
src/services/
├── assignmentService.ts (referencias a equipment)
└── maintenanceService.ts
```

### 3.3 Base de Datos

#### Tablas Afectadas (potencialmente)
- `equipment` → `tools`
- `equipment_maintenance` → `tool_maintenance`
- `equipment_assignments` → `tool_assignments`
- `equipment_categories` → `tool_categories`

#### Columnas Afectadas
- `equipment_id` → `tool_id`
- `equipment_name` → `tool_name`
- `equipment_type` → `tool_type`
- `equipment_status` → `tool_status`

## 4. Estrategia de Migración

### 4.1 Fase 1: Preparación y Análisis
1. **Backup completo** del código y base de datos
2. **Identificación exhaustiva** de todas las referencias
3. **Creación de scripts** de migración
4. **Configuración de ambiente** de pruebas

### 4.2 Fase 2: Cambios en Tipos e Interfaces
1. Renombrar `equipment.ts` a `tools.ts`
2. Actualizar todas las interfaces:
   - `Equipment` → `Tool`
   - `EquipmentStatus` → `ToolStatus`
   - `CreateEquipmentDTO` → `CreateToolDTO`
   - `UpdateEquipmentDTO` → `UpdateToolDTO`

### 4.3 Fase 3: Componentes y Páginas
1. **Renombrar archivos** de equipment/ a tools/
2. **Actualizar imports** en todos los archivos
3. **Cambiar nombres** de componentes:
   - `EquipmentList` → `ToolList`
   - `EquipmentPage` → `ToolPage`
   - `useEquipment` → `useTools`

### 4.4 Fase 4: Servicios y APIs
1. **Renombrar servicios**:
   - `equipmentService.ts` → `toolService.ts`
   - Actualizar todas las funciones y endpoints
2. **Actualizar hooks** que consumen estos servicios

### 4.5 Fase 5: Base de Datos
1. **Crear scripts SQL** para renombrar tablas y columnas
2. **Actualizar constraints** y relaciones
3. **Migrar datos** existentes
4. **Actualizar índices** y vistas

### 4.6 Fase 6: Validación y Testing
1. **Pruebas unitarias** de todos los componentes
2. **Pruebas de integración** de APIs
3. **Validación de UI** en todos los navegadores
4. **Verificación de datos** en base de datos

## 5. Script de Migración Detallado

### 5.1 Búsqueda y Reemplazo de Términos

#### Términos a Cambiar (Español)
```bash
# En archivos .tsx, .ts, .js
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -exec sed -i 's/Equipo/Herramienta/g' {} \;
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -exec sed -i 's/equipo/herramienta/g' {} \;
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -exec sed -i 's/EQUIPOS/HERRAMIENTAS/g' {} \;
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -exec sed -i 's/EQUIPOS/HERRAMIENTAS/g' {} \;
```

#### Términos a Cambiar (Inglés)
```bash
# Variables y funciones (camelCase)
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -exec sed -i 's/equipment/tool/g' {} \;
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -exec sed -i 's/Equipment/Tool/g' {} \;
find src/ -type f \( -name "*.tsx" -o -name "*.ts" -o -name "*.js" \) -exec sed -i 's/EQUIPMENT/TOOL/g' {} \;
```

### 5.2 Renombrado de Archivos y Carpetas
```bash
# Renombrar carpetas
mv src/components/equipment src/components/tools
mv src/pages/EquipmentPage.tsx src/pages/ToolPage.tsx

# Renombrar archivos individuales
mv src/types/equipment.ts src/types/tools.ts
mv src/services/equipmentService.ts src/services/toolService.ts
mv src/hooks/useEquipment.ts src/hooks/useTools.ts
# ... continuar con todos los archivos
```

### 5.3 Actualización de Base de Datos (PostgreSQL/Supabase)
```sql
-- Renombrar tablas
ALTER TABLE equipment RENAME TO tools;
ALTER TABLE equipment_maintenance RENAME TO tool_maintenance;
ALTER TABLE equipment_assignments RENAME TO tool_assignments;
ALTER TABLE equipment_categories RENAME TO tool_categories;

-- Renombrar columnas
ALTER TABLE tools RENAME COLUMN equipment_id TO tool_id;
ALTER TABLE tools RENAME COLUMN equipment_name TO tool_name;
ALTER TABLE tools RENAME COLUMN equipment_type TO tool_type;
ALTER TABLE tools RENAME COLUMN equipment_status TO tool_status;

-- Actualizar foreign keys
ALTER TABLE tool_maintenance RENAME COLUMN equipment_id TO tool_id;
ALTER TABLE tool_assignments RENAME COLUMN equipment_id TO tool_id;

-- Actualizar índices
ALTER INDEX idx_equipment_id RENAME TO idx_tool_id;
ALTER INDEX idx_equipment_status RENAME TO idx_tool_status;
```

## 6. Consideraciones de Compatibilidad

### 6.1 Versionado de API
- **Mantener endpoints antiguos** durante un período de transición
- **Implementar versionado** (v1 para equipos, v2 para herramientas)
- **Notificar a consumidores** de la API sobre el cambio

### 6.2 Migración de Datos
- **Preservar todos los datos** existentes
- **Mantener IDs** para referencias externas
- **Crear mapeo** de antiguos a nuevos nombres
- **Validar integridad** referencial

### 6.3 Backward Compatibility
- **URLs antiguas** deben redirigir a nuevas
- **APIs deprecadas** con mensajes de advertencia
- **Período de gracia** para que usuarios se adapten

## 7. Riesgos y Mitigación

### 7.1 Riesgos Identificados

| Riesgo | Impacto | Probabilidad | Mitigación |
|--------|---------|--------------|------------|
| Pérdida de datos | Alto | Bajo | Backup completo antes de iniciar |
| Rotura de APIs externas | Alto | Medio | Mantener endpoints antiguos temporalmente |
| Errores de usuario | Medio | Alto | Comunicación clara y capacitación |
| Conflictos de merge | Medio | Medio | Trabajar en rama separada |
| Performance degradation | Bajo | Medio | Pruebas de carga post-migración |

### 7.2 Plan de Rollback
1. **Scripts de reversión** preparados para cada cambio
2. **Snapshot de base de datos** antes de la migración
3. **Branch Git** con código original preservado
4. **Procedimiento documentado** para rollback rápido

## 8. Lista de Verificación (Checklist)

### 8.1 Pre-Migración
- [ ] Backup completo de código y base de datos
- [ ] Ambiente de pruebas configurado
- [ ] Scripts de migración preparados
- [ ] Equipo notificado y capacitado
- [ ] Ventana de mantenimiento programada

### 8.2 Durante la Migración
- [ ] Ejecutar scripts de renombrado de archivos
- [ ] Actualizar todos los imports y referencias
- [ ] Renombrar variables, funciones y clases
- [ ] Actualizar base de datos
- [ ] Verificar que no hay errores de compilación

### 8.3 Post-Migración
- [ ] Pruebas unitarias pasan
- [ ] Pruebas de integración pasan
- [ ] UI se renderiza correctamente
- [ ] Funcionalidad completa verificada
- [ ] Performance no degradada
- [ ] Documentación actualizada
- [ ] Usuarios finales notificados

### 8.4 Verificación Final
- [ ] Buscar referencias residuales a "equipo/equipment"
- [ ] Validar que todas las URLs funcionan
- [ ] Confirmar que APIs responden correctamente
- [ ] Verificar que reportes generan datos correctos
- [ ] Asegurar que emails/notificaciones usan nuevo término

## 9. Comunicación

### 9.1 Stakeholders a Notificar
- **Equipo de desarrollo**: Cambios técnicos y timeline
- **Usuarios finales**: Nuevo término y fecha de cambio
- **API consumers**: Cambios en endpoints y versionado
- **Soporte técnico**: Documentación para atender consultas

### 9.2 Canales de Comunicación
- **Email corporativo** a todos los usuarios
- **Anuncio en dashboard** de la aplicación
- **Documentación técnica** actualizada
- **Changelog** en repositorio

## 10. Timeline Estimado

| Fase | Duración | Dependencias |
|------|----------|--------------|
| Preparación | 2-3 días | - |
| Cambios en tipos | 1 día | Preparación completa |
| Frontend components | 3-4 días | Tipos actualizados |
| Backend/APIs | 2-3 días | Frontend en progreso |
| Base de datos | 1 día | Backend completo |
| Testing & QA | 2-3 días | Todos los cambios |
| **Total** | **11-17 días** | - |

## 11. Recursos Necesarios

### 11.1 Human Resources
- **1 Developer Senior**: Coordinación y cambios críticos
- **2 Developers**: Implementación de cambios
- **1 QA Engineer**: Pruebas y validación
- **1 DBA**: Migración de base de datos

### 11.2 Herramientas y Accesos
- **Acceso a repositorio** Git
- **Acceso a base de datos** de producción
- **Herramientas de búsqueda** masiva en código
- **Ambiente de staging** para pruebas

---

**Nota**: Este documento debe ser revisado y aprobado por el equipo técnico y stakeholders antes de iniciar la migración. Se recomienda realizar una prueba piloto en ambiente de staging antes de proceder con producción.