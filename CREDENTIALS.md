# ConstructPro - Credenciales de Acceso

## 🔐 Credenciales Demo

### Administrador
```
Email: admin@constructpro.com
Password: password123
Rol: Admin
Permisos: Acceso completo al sistema
```

### Project Manager
```
Email: pm@constructpro.com
Password: password123
Rol: Project Manager
Permisos: Gestión de proyectos y subcontratos
```

### Cost Controller
```
Email: cost@constructpro.com
Password: password123
Rol: Cost Controller
Permisos: Aprobación de gastos y certificados
```

## 📋 Permisos por Rol

### Admin
- ✅ Crear/editar/eliminar proyectos
- ✅ Crear/editar/aprobar subcontratos
- ✅ Crear/aprobar/rechazar certificados
- ✅ Crear/aprobar/rechazar gastos
- ✅ Ver financials y exportar reportes
- ✅ Ver audit log
- ✅ Gestionar usuarios
- ✅ Gestionar configuración

### Project Manager
- ✅ Crear/editar proyectos
- ✅ Crear/editar/aprobar subcontratos
- ✅ Crear/aprobar/rechazar certificados
- ✅ Crear gastos
- ✅ Ver financials y exportar reportes
- ✅ Ver audit log
- ❌ Aprobar gastos
- ❌ Gestionar usuarios
- ❌ Eliminar proyectos

### Cost Controller
- ✅ Ver proyectos
- ✅ Ver subcontratos
- ✅ Aprobar/rechazar certificados
- ✅ Crear/aprobar/rechazar gastos
- ✅ Ver financials y exportar reportes
- ✅ Ver audit log
- ❌ Crear/editar proyectos
- ❌ Crear/editar subcontratos
- ❌ Gestionar usuarios

### Viewer
- ✅ Ver proyectos
- ✅ Ver subcontratos
- ✅ Ver certificados
- ✅ Ver gastos
- ✅ Ver financials
- ❌ Crear/editar/eliminar
- ❌ Aprobar/rechazar
- ❌ Exportar reportes
- ❌ Ver audit log

## 🔄 Cambio de Contraseña

Para cambiar la contraseña:
1. Iniciar sesión
2. Ir a "Mi Perfil" en el sidebar
3. Click en tab "Security"
4. Ingresar contraseña actual
5. Ingresar nueva contraseña (mínimo 8 caracteres)
6. Confirmar nueva contraseña
7. Click en "Change Password"

## 👤 Actualización de Perfil

Para actualizar el perfil:
1. Iniciar sesión
2. Ir a "Mi Perfil" en el sidebar
3. Click en tab "Profile"
4. Editar información (nombre, teléfono, departamento)
5. Click en "Save Changes"

## 📸 Cambio de Avatar

Para cambiar el avatar:
1. Iniciar sesión
2. Ir a "Mi Perfil" en el sidebar
3. Click en el botón de cámara sobre el avatar
4. Seleccionar imagen (máx 5MB)
5. Avatar se actualiza automáticamente

## 🔒 Seguridad

### Almacenamiento
- Las credenciales se almacenan en localStorage
- En producción, usar Firebase Auth o similar
- Implementar refresh tokens
- Configurar timeout de sesión

### Mejores Prácticas
- Cambiar contraseñas regularmente
- No compartir credenciales
- Cerrar sesión al terminar
- Usar contraseñas fuertes (mínimo 8 caracteres)

## 🆘 Problemas Comunes

### No puedo iniciar sesión
1. Verificar email y contraseña
2. Verificar que no haya espacios extra
3. Probar con credenciales demo
4. Limpiar caché del navegador

### Sesión expirada
1. Volver a iniciar sesión
2. Verificar conexión a internet
3. Limpiar localStorage si persiste

### No veo mi avatar
1. Verificar que la imagen sea válida
2. Verificar tamaño (máx 5MB)
3. Intentar con otra imagen
4. Refrescar la página

---

**Última actualización**: 2024-01-15  
**Versión**: 1.0.0
