# ConstructPro - System Master Documentation

## 📋 Índice de Contenidos
1. [Estructura del Sistema](#estructura-del-sistema)
2. [Componentes Existentes](#componentes-existentes)
3. [Servicios y APIs](#servicios-y-apis)
4. [Rutas y Navegación](#rutas-y-navegación)
5. [Sistema de Autenticación](#sistema-de-autenticación)
6. [Reglas de Modificación](#reglas-de-modificación)

---

## 🏗️ Estructura del Sistema

### Arquitectura General
```
ConstructPro/
├── src/
│   ├── api/              # Endpoints API
│   ├── components/       # Componentes React
│   ├── contexts/         # Contextos (Theme, Auth)
│   ├── hooks/            # Custom Hooks
│   ├── lib/              # Utilidades
│   ├── pages/            # Páginas principales
│   ├── services/         # Lógica de negocio
│   ├── types/            # TypeScript types
│   └── utils/            # Funciones auxiliares
├── scripts/              # Scripts de deployment
└── docs/                 # Documentación adicional
```

---

## 🧩 Componentes Existentes

### 1. Layout Components
- **Header** (`src/components/Header.tsx`)
  - ✅ Barra de búsqueda
  - ✅ Toggle de tema oscuro (1 instancia)
  - ✅ Centro de notificaciones (1 instancia)
  - ✅ Perfil de usuario
  - ✅ Botones de configuración y logout
  - ⚠️ **NO DUPLICAR**: Ya tiene dark mode toggle y notifications

- **Sidebar** (`src/components/Sidebar.tsx`)
  - ✅ Logo de ConstructPro (clickeable)
  - ✅ Navegación principal
  - ✅ Sección de Job Costing
  - ✅ Estados activos con highlight
  - ⚠️ **NO DUPLICAR**: Logo ya existe y funciona

- **Layout** (`src/components/Layout.tsx`)
  - ✅ Wrapper principal con Header + Sidebar
  - ✅ Soporte para tema oscuro

### 2. Dashboard Components
- **EnhancedDashboard** (`src/pages/EnhancedDashboard.tsx`)
  - ✅ Dashboard principal mejorado
  - ✅ Widgets de estadísticas
  - ✅ Gráficos interactivos
  - ✅ Filtros de período

### 3. Job Costing Components
- **SubcontractsPage** - Gestión de subcontratos
- **ProgressCertificatesPage** - Certificados de progreso
- **CostCodesPage** - Códigos de costo
- **ExpenseApprovalsPage** - Aprobación de gastos
- **ProjectFinancialsPage** - Financials del proyecto
- **AuditLogPage** - Registro de auditoría

### 4. Theme Components
- **DarkModeToggle** (`src/components/DarkModeToggle.tsx`)
  - ✅ Toggle de tema oscuro
  - ✅ Variantes: default, compact
  - ⚠️ **SOLO UNA INSTANCIA EN HEADER**

- **NotificationCenter** (`src/components/NotificationCenter.tsx`)
  - ✅ Centro de notificaciones
  - ✅ Badge con contador
  - ⚠️ **SOLO UNA INSTANCIA EN HEADER**

---

## 🔐 Sistema de Autenticación

### Archivos de Autenticación
1. **Types** (`src/types/auth.ts`)
   - User, UserRole, UserPermissions
   - ActivityFeedItem
   - LoginCredentials, RegisterData

2. **Service** (`src/services/authService.ts`)
   - login(), register(), logout()
   - updateProfile(), uploadAvatar()
   - changePassword()
   - getActivityFeed()
   - hasPermission()

3. **Context** (`src/contexts/AuthContext.tsx`)
   - AuthProvider
   - useAuth() hook

4. **Pages**
   - LoginPage (`src/pages/LoginPage.tsx`)
   - UserProfilePage (`src/pages/UserProfilePage.tsx`)

### Credenciales Demo
```
Admin:
- Email: admin@constructpro.com
- Password: password123

Project Manager:
- Email: pm@constructpro.com
- Password: password123

Cost Controller:
- Email: cost@constructpro.com
- Password: password123
```

### Roles y Permisos
- **admin**: Acceso completo
- **project_manager**: Gestión de proyectos y subcontratos
- **cost_controller**: Aprobación de gastos y certificados
- **viewer**: Solo lectura

---

## 🛣️ Rutas y Navegación

### Rutas Públicas
- `/login` - Página de login

### Rutas Protegidas (Requieren autenticación)
- `/` → Redirect a `/dashboard-enhanced`
- `/dashboard-enhanced` - Dashboard principal
- `/projects` - Proyectos
- `/budget` - Presupuesto
- `/reports` - Reportes
- `/documents` - Documentos
- `/tools` - Herramientas
- `/team` - Equipo de trabajo
- `/profile` - Perfil de usuario

### Rutas Job Costing
- `/subcontracts` - Subcontratos
- `/certificates` - Certificados de progreso
- `/cost-codes` - Códigos de costo
- `/expense-approvals` - Aprobación de gastos
- `/project-financials/:projectId` - Financials del proyecto
- `/audit-log` - Registro de auditoría

---

## 🔧 Servicios y APIs

### Core Services
1. **authService** - Autenticación y usuarios
2. **subcontractService** - Gestión de subcontratos
3. **progressCertificateService** - Certificados de progreso
4. **costCodeService** - Códigos de costo
5. **expenseService** - Gestión de gastos
6. **projectFinancialsService** - Financials de proyectos
7. **auditLogService** - Registro de auditoría

### API Endpoints
- `/api/expenses/auto-create` - Creación automática de gastos (OCR)

---

## ⚠️ Reglas de Modificación

### ANTES de Agregar Nuevas Funcionalidades

1. **VERIFICAR EXISTENCIA**
   - ✅ Revisar este documento maestro
   - ✅ Buscar componentes similares
   - ✅ Verificar si ya existe la funcionalidad

2. **SOLICITAR AUTORIZACIÓN**
   - ❓ Preguntar: "¿Ya existe un componente para [funcionalidad]?"
   - ❓ Confirmar: "¿Debo crear uno nuevo o modificar el existente?"
   - ❓ Validar: "¿Esto causará duplicación?"

3. **EVITAR DUPLICACIONES**
   - ❌ NO crear múltiples dark mode toggles
   - ❌ NO crear múltiples notification centers
   - ❌ NO crear múltiples logos
   - ❌ NO crear múltiples sistemas de login

### ANTES de Eliminar Funcionalidades

1. **VERIFICAR DEPENDENCIAS**
   - ✅ Buscar referencias en otros archivos
   - ✅ Verificar si otros componentes lo usan
   - ✅ Confirmar que no romperá la app

2. **SOLICITAR CONFIRMACIÓN**
   - ❓ Preguntar: "¿Puedo eliminar [componente]?"
   - ❓ Confirmar: "¿Hay dependencias?"
   - ❓ Validar: "¿Hay alternativa?"

---

## 🐛 Problemas Conocidos y Soluciones

### 1. Duplicación de Dark Mode Toggle
- **Problema**: Aparecen 2 toggles de tema oscuro
- **Causa**: Se agregó uno nuevo sin verificar el existente
- **Solución**: Mantener solo el del Header
- **Estado**: ✅ RESUELTO

### 2. Duplicación de Notification Center
- **Problema**: Aparecen 2 campanas de notificaciones
- **Causa**: Se agregó una nueva sin verificar la existente
- **Solución**: Mantener solo la del Header
- **Estado**: ✅ RESUELTO

### 3. Logo No Clickeable
- **Problema**: El logo no redirige al dashboard
- **Causa**: Falta Link component
- **Solución**: Envolver logo en Link to="/dashboard-enhanced"
- **Estado**: ✅ RESUELTO

### 4. Sistema de Login
- **Problema**: No había sistema de autenticación
- **Causa**: No estaba implementado
- **Solución**: Sistema completo implementado
- **Estado**: ✅ IMPLEMENTADO

---

## 📊 Estado del Sistema

### Completado ✅
- [x] Sistema de autenticación completo
- [x] Roles y permisos
- [x] Perfil de usuario con avatar
- [x] Feed de actividad
- [x] Cambio de contraseña
- [x] Job Costing System (Phases 1-8)
- [x] Dashboard mejorado
- [x] Tema oscuro
- [x] Notificaciones

### En Progreso 🔄
- [ ] Integración de AuthProvider en App
- [ ] Rutas protegidas
- [ ] Header con usuario actual
- [ ] Logout funcional

### Pendiente ⏳
- [ ] Data Migration (Task 30)
- [ ] Configuración de n8n
- [ ] Tests E2E completos
- [ ] Documentación de usuario

---

## 📝 Changelog

### 2024-01-15
- ✅ Creado sistema de autenticación completo
- ✅ Implementado perfil de usuario
- ✅ Agregado feed de actividad
- ✅ Implementado cambio de avatar
- ✅ Creado documento maestro

### 2024-01-14
- ✅ Completado Task 31 (Production Deployment)
- ✅ Creados scripts de deployment
- ✅ Documentación de deployment completa

### 2024-01-13
- ✅ Corregidos errores en SubcontractsPage
- ✅ Corregidos errores en ProgressCertificatesPage
- ✅ Corregidos props de widgets financieros

---

## 🔒 Política de Cambios

### Cambios Menores (Sin Autorización)
- Corrección de typos
- Ajustes de estilos CSS
- Mejoras de performance sin cambios de API

### Cambios Mayores (Requieren Autorización)
- Agregar nuevos componentes
- Modificar estructura de datos
- Cambiar rutas o navegación
- Agregar nuevas dependencias
- Eliminar componentes existentes

### Cambios Críticos (Requieren Revisión Completa)
- Modificar sistema de autenticación
- Cambiar estructura de base de datos
- Modificar permisos y roles
- Cambiar flujos de aprobación
- Modificar cálculos financieros

---

## 📞 Contacto y Soporte

Para cualquier duda sobre modificaciones:
1. Consultar este documento primero
2. Verificar en el código existente
3. Solicitar autorización antes de proceder
4. Documentar cambios realizados

---

**Última actualización**: 2024-01-15  
**Versión del documento**: 1.0.0  
**Mantenido por**: Equipo de Desarrollo ConstructPro
