# 📋 PRESENTACIÓN DEL TRABAJO PRÁCTICO
## Sistema de Evaluación de Calidad de Atención Telefónica (SMCAT)
### Materia: Base de Datos Aplicadas

---

## 1. INTRODUCCIÓN

El **Sistema de Evaluación de Calidad de Atención Telefónica (SMCAT)** es una aplicación web desarrollada con **Next.js** y **MySQL** que permite evaluar y monitorear la calidad de atención de operadores telefónicos. El sistema implementa una **arquitectura en capas** que separa la lógica de negocio, acceso a datos y presentación, garantizando escalabilidad, mantenibilidad y reutilización de código.

### Objetivos del Sistema:
- ✅ Registrar evaluaciones de calidad de llamadas telefónicas
- ✅ Visualizar métricas de desempeño en tiempo real
- ✅ Generar reportes analíticos filtrados
- ✅ Gestionar usuarios y roles de forma segura
- ✅ Implementar control de acceso basado en roles (RBAC)

---

## 2. MÓDULO DE AUTENTICACIÓN (LOGIN)

### 2.1 Arquitectura del Login

El módulo de autenticación implementa un flujo seguro de validación de credenciales con las siguientes capas:

```
Frontend (LoginScreen.jsx)
    ↓
API Route (/api/auth/login)
    ↓
Capa de Negocio (authBLL.js)
    ↓
Capa de Datos (authDAL.js)
    ↓
Base de Datos MySQL
```

### 2.2 Flujo de Autenticación

**1. Validación de Credenciales (Frontend → Backend)**

El usuario ingresa `nombreUsuario` y `contrasena` en la interfaz. Los datos se envían a través de una solicitud **POST** a `/api/auth/login`:

```javascript
// LoginScreen.jsx - Envío de credenciales
const handleLogin = async (usuario, contraseña) => {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            nombreUsuario: usuario, 
            contrasena: contraseña 
        })
    });
    const data = await response.json();
    // ... manejo de respuesta
};
```

**2. Validación en la Base de Datos**

La capa DAL (Data Access Layer) realiza una consulta SQL para buscar el usuario:

```sql
SELECT idUsuario, nombre, apellido, nombreUsuario, contrasena, 
       rol, grupos, fechaUltimoCambioClave
FROM Usuario
WHERE nombreUsuario = ?;
```

### 2.3 Seguridad en Contraseñas

- **Hashing con bcryptjs**: Las contraseñas se almacenan hasheadas con un `salt factor de 12`
- **Comparación segura**: Se utiliza `bcrypt.compare()` para validar sin almacenar contraseñas en texto plano
- **Política de cambio forzado**: Usuarios nuevos o con contraseña reseteada deben cambiar su clave al primer login
- **Auditoría de intentos**: Todos los logins se registran en la tabla `AuditoriaSesion` con IP, fecha y hora

### 2.4 Implementación del Login Seguro

```javascript
// authDAL.js - Consulta de usuario
export const obtenerUsuarioPorNombreDB = async (nombreUsuario) => {
    const sql = `
        SELECT idUsuario, nombre, apellido, nombreUsuario, 
               contrasena, rol, grupos, fechaUltimoCambioClave
        FROM Usuario
        WHERE nombreUsuario = ?
    `;
    const [rows] = await pool.query(sql, [nombreUsuario]);
    return rows.length > 0 ? rows[0] : null;
};

// authBLL.js - Validación y comparación de contraseña
export const loginUsuario = async (nombreUsuario, contrasena) => {
    const usuario = await obtenerUsuarioPorNombreDB(nombreUsuario);
    
    if (!usuario) {
        return { success: false, error: 'Usuario no encontrado' };
    }
    
    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena);
    
    if (!contrasenaValida) {
        return { success: false, error: 'Contraseña incorrecta' };
    }
    
    // Retorna información del usuario sin la contraseña
    return {
        success: true,
        idUsuario: usuario.idUsuario,
        nombreUsuario: usuario.nombreUsuario,
        rol: usuario.rol,
        grupos: usuario.grupos,
        mustChangePassword: !usuario.fechaUltimoCambioClave
    };
};
```

### 2.5 Manejo de Sesiones

Las sesiones se almacenan en **sessionStorage** del navegador:

```javascript
// sessionStorage.js
export const saveSessionUser = (usuario) => {
    if (typeof window !== 'undefined') {
        sessionStorage.setItem('usuario', JSON.stringify(usuario));
    }
};

export const getSessionUser = () => {
    if (typeof window !== 'undefined') {
        const usuario = sessionStorage.getItem('usuario');
        return usuario ? JSON.parse(usuario) : null;
    }
    return null;
};
```

### 2.6 Auditoría de Acceso

Cada login se registra en la tabla `AuditoriaSesion`:

```sql
INSERT INTO AuditoriaSesion (idUsuario, nombreUsuario, tipoEvento, 
                            ipOrigen, detalle, fechaHora)
VALUES (?, ?, 'LOGIN', ?, ?, NOW());
```

---

## 3. DASHBOARD

### 3.1 Propósito del Dashboard

El **Dashboard** es la vista principal que muestra:
- 📊 Métricas agregadas de desempeño
- 📈 Evaluaciones recientes del usuario
- 🎯 Promedio de puntuaciones por criterio
- 👥 Información del operador logueado

### 3.2 Arquitectura del Dashboard

```
Dashboard (Frontend)
    ↓
GET /api/dashboard (API Route)
    ↓
dashboardBLL.obtenerEstadisticas()
    ↓
dashboardDAL (Consultas SQL agregadas)
    ↓
Base de Datos (Tablas: Evaluacion, Usuario)
```

### 3.3 Consultas SQL Principales

**Obtener evaluaciones recientes del usuario:**

```sql
SELECT e.*, u.nombre, u.apellido
FROM Evaluacion e
JOIN Usuario u ON e.idEvaluado = u.idUsuario
WHERE e.idEvaluador = ? OR e.idEvaluado = ?
ORDER BY e.fechaHora DESC
LIMIT 5;
```

**Calcular promedio de puntuaciones:**

```sql
SELECT 
    ROUND(AVG(puntuacionActitud), 2) as promedio_actitud,
    ROUND(AVG(puntuacionEstructura), 2) as promedio_estructura,
    ROUND(AVG(puntuacionProtocolos), 2) as promedio_protocolos
FROM Evaluacion
WHERE idEvaluado = ? 
  AND MONTH(fechaHora) = MONTH(CURDATE())
  AND YEAR(fechaHora) = YEAR(CURDATE());
```

### 3.4 Implementación en Frontend

```javascript
// DashBoard.jsx - Carga de datos
useEffect(() => {
    const cargarEstadisticas = async () => {
        try {
            const response = await fetch('/api/dashboard', {
                headers: {
                    'X-User-Groups-JSON': JSON.stringify(usuario.grupos)
                }
            });
            const data = await response.json();
            
            if (data.success) {
                setEstadisticas(data.estadisticas);
                setEvaluacionesRecientes(data.evaluacionesRecientes);
            }
        } catch (error) {
            console.error('Error al cargar dashboard:', error);
        }
    };
    
    cargarEstadisticas();
}, [usuario]);
```

### 3.5 Visualización de Métricas

El dashboard incluye:

- **Tarjetas de Resumen**: Muestran KPIs (Key Performance Indicators)
  - Promedio de Actitud
  - Promedio de Estructura
  - Promedio de Protocolos
  - Total de Evaluaciones

- **Gráfico de Líneas**: Evolución de puntuaciones en el tiempo (Chart.js)

- **Tabla de Evaluaciones Recientes**: Últimas 5 evaluaciones con filtros

---

## 4. ESTRUCTURA DE LA BASE DE DATOS

### 4.1 Modelo Entidad-Relación

```
┌──────────────────┐        ┌───────────────────┐
│     Usuario      │        │   Evaluacion      │
├──────────────────┤        ├───────────────────┤
│ idUsuario (PK)   │◄───────│ idEvaluacion (PK) │
│ nombre           │        │ idEvaluador (FK)  │
│ apellido         │        │ idEvaluado (FK)   │
│ nombreUsuario    │        │ puntuacionActitud │
│ contrasena       │        │ puntuacionEstruc. │
│ rol              │        │ puntuacionProto.  │
│ grupos           │        │ observaciones     │
│ fechaUltimoCam.  │        │ fechaHora         │
└──────────────────┘        └───────────────────┘

┌──────────────────┐        ┌───────────────────┐
│   GruposUsuario  │        │AuditoriaSesion    │
├──────────────────┤        ├───────────────────┤
│ idGrupo (PK)     │        │ idEvento (PK)     │
│ nombre           │        │ idUsuario (FK)    │
│ descripcion      │        │ tipoEvento        │
│ permisos         │        │ ipOrigen          │
│ estado           │        │ detalle           │
└──────────────────┘        │ fechaHora         │
                             └───────────────────┘
```

### 4.2 Descripción de Tablas Principales

#### **Tabla: Usuario**

Almacena la información de todos los usuarios del sistema.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idUsuario` | INT (PK) | Identificador único |
| `nombre` | VARCHAR(100) | Nombre del usuario |
| `apellido` | VARCHAR(100) | Apellido del usuario |
| `nombreUsuario` | VARCHAR(50) UNIQUE | Nombre de usuario para login |
| `contrasena` | VARCHAR(255) | Contraseña hasheada (bcrypt) |
| `rol` | VARCHAR(50) | Rol: Analista, Operador, Supervisor, etc. |
| `grupos` | JSON | Array de grupos a los que pertenece |
| `fechaUltimoCambioClave` | DATETIME | Control de expiración de contraseña |
| `estado` | TINYINT | 1=Activo, 0=Inactivo |
| `fechaCreacion` | DATETIME | Fecha de registro |

**Índices:**
```sql
CREATE UNIQUE INDEX idx_nombreUsuario ON Usuario(nombreUsuario);
CREATE INDEX idx_rol ON Usuario(rol);
```

#### **Tabla: Evaluacion**

Registra cada evaluación realizada a un operador.

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idEvaluacion` | INT (PK) | Identificador único |
| `idEvaluador` | INT (FK) | Usuario que realizó la evaluación |
| `idEvaluado` | INT (FK) | Usuario evaluado (Operador) |
| `puntuacionActitud` | DECIMAL(3,2) | 0.00 a 5.00 |
| `puntuacionEstructura` | DECIMAL(3,2) | 0.00 a 5.00 |
| `puntuacionProtocolos` | DECIMAL(3,2) | 0.00 a 5.00 |
| `observaciones` | TEXT | Comentarios de la evaluación |
| `estado` | VARCHAR(50) | Pendiente, Completada, Rechazada |
| `fechaHora` | DATETIME | Cuando se realizó |

**Índices:**
```sql
CREATE INDEX idx_idEvaluador ON Evaluacion(idEvaluador);
CREATE INDEX idx_idEvaluado ON Evaluacion(idEvaluado);
CREATE INDEX idx_fechaHora ON Evaluacion(fechaHora);
```

#### **Tabla: AuditoriaSesion**

Registra todos los eventos de auditoría (logins, cambios, etc.).

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `idEvento` | INT (PK) | Identificador único |
| `idUsuario` | INT (FK) | Usuario que realizó la acción |
| `nombreUsuario` | VARCHAR(50) | Nombre del usuario (desnormalizado) |
| `tipoEvento` | VARCHAR(50) | LOGIN, LOGOUT, RESET_CLAVE, etc. |
| `ipOrigen` | VARCHAR(45) | Dirección IP (soporta IPv4 e IPv6) |
| `detalle` | JSON | Información adicional del evento |
| `fechaHora` | DATETIME | Timestamp del evento |

**Índices:**
```sql
CREATE INDEX idx_idUsuario ON AuditoriaSesion(idUsuario);
CREATE INDEX idx_tipoEvento ON AuditoriaSesion(tipoEvento);
CREATE INDEX idx_fechaHora ON AuditoriaSesion(fechaHora);
```

### 4.3 Relaciones y Restricciones

```sql
-- Foreign Keys
ALTER TABLE Evaluacion 
ADD CONSTRAINT fk_evaluador FOREIGN KEY (idEvaluador) 
    REFERENCES Usuario(idUsuario);

ALTER TABLE Evaluacion 
ADD CONSTRAINT fk_evaluado FOREIGN KEY (idEvaluado) 
    REFERENCES Usuario(idUsuario);

ALTER TABLE AuditoriaSesion 
ADD CONSTRAINT fk_audUsuario FOREIGN KEY (idUsuario) 
    REFERENCES Usuario(idUsuario);
```

### 4.4 Características de Integridad Referencial

- **Eliminación en cascada**: Si se elimina un usuario, se marcan sus evaluaciones como inactivas
- **Restricción de valores**: Los roles solo pueden ser ciertos valores predefinidos
- **Validación de rangos**: Las puntuaciones están limitadas a 0.00 - 5.00
- **Timestamps automáticos**: Las fechas de creación y modificación se actualizan automáticamente

---

## 5. PATRONES DE DISEÑO IMPLEMENTADOS

### 5.1 Arquitectura en Capas (Layered Architecture)

El sistema separa responsabilidades en tres capas:

```
┌─────────────────────────────────────────────────┐
│         CAPA DE PRESENTACIÓN (React)             │
│  LoginScreen.jsx, DashBoard.jsx, Reports.jsx    │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    CAPA DE NEGOCIO (BLL - Business Logic)       │
│  authBLL.js, dashboardBLL.js, evaluacionBLL.js │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│    CAPA DE DATOS (DAL - Data Access Layer)      │
│   authDAL.js, dashboardDAL.js, evaluacionDAL.js│
└──────────────────┬──────────────────────────────┘
                   │
            ┌──────▼──────┐
            │    MySQL    │
            └─────────────┘
```

**Ventajas:**
- 🔄 Reutilización de código
- 🧪 Facilita testing unitario
- 🛡️ Separación de responsabilidades
- 📈 Escalabilidad

### 5.2 Patrón Repository

El DAL actúa como un repositorio que encapsula todas las operaciones con la base de datos:

```javascript
// authDAL.js - Implementación del patrón Repository
export const obtenerUsuarioPorNombreDB = async (nombreUsuario) => {
    // Encapsula la lógica de consulta
};

export const crearAuditoriaSesionDB = async (idUsuario, tipoEvento, ipOrigen) => {
    // Encapsula la lógica de inserción
};
```

### 5.3 Patrón DTO (Data Transfer Object)

Se utilizan objetos simples para transferir datos entre capas:

```javascript
// Ejemplo de DTO de Usuario
{
    idUsuario: 1,
    nombreUsuario: "juan.perez",
    rol: "Analista",
    grupos: ["Supervisores", "Evaluadores"]
}
```

### 5.4 Control de Acceso Basado en Roles (RBAC)

Se implementa un middleware de autenticación que verifica roles:

```javascript
// authMiddleware.js
export const requireRole = (request, rolesPermitidos) => {
    const usuario = getSessionUser();
    
    if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
        return NextResponse.json(
            { error: 'Acceso denegado' },
            { status: 403 }
        );
    }
};
```

---

## 6. OPTIMIZACIONES Y BUENAS PRÁCTICAS

### 6.1 Optimizaciones de Base de Datos

✅ **Índices estratégicos**:
- Índice en `nombreUsuario` para login rápido
- Índice en `idEvaluador` e `idEvaluado` para filtrados
- Índice en `fechaHora` para reportes por período

✅ **Consultas parametrizadas**:
```javascript
// ✅ Seguro contra SQL Injection
const [rows] = await pool.query('SELECT * FROM Usuario WHERE nombreUsuario = ?', [nombreUsuario]);

// ❌ NUNCA hacer esto:
// const rows = await pool.query(`SELECT * FROM Usuario WHERE nombreUsuario = '${nombreUsuario}'`);
```

✅ **Pool de conexiones**:
```javascript
// lib/db.js
const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
```

### 6.2 Seguridad

✅ **Hashing de contraseñas**: bcryptjs con salt factor 12
✅ **Auditoría de acceso**: Registro en `AuditoriaSesion` de todos los logins
✅ **Variables de entorno**: Credenciales en `.env.local`
✅ **Validaciones en frontend y backend**: Doble validación
✅ **HTTPS en producción**: (Recomendado en despliegue real)

### 6.3 Mantenibilidad

✅ **Separación de responsabilidades**: Cada componente tiene una única función
✅ **Código DRY**: Reutilización de funciones comunes
✅ **Documentación**: Comentarios en funciones complejas
✅ **Nombres descriptivos**: Variables y funciones autoexplicativas

---

## 7. FLUJOS CRÍTICOS

### 7.1 Flujo Completo de Login

```
1. Usuario ingresa credenciales
   ↓
2. Frontend valida campos no vacíos
   ↓
3. POST /api/auth/login con (nombreUsuario, contrasena)
   ↓
4. authBLL.loginUsuario():
   - Busca usuario en BD
   - Compara contraseña con bcrypt.compare()
   - Si fallida: retorna error
   ↓
5. Si exitoso:
   - Crea entrada en AuditoriaSesion (tipoEvento: LOGIN)
   - Retorna usuario sin contraseña
   ↓
6. Frontend almacena sesión en sessionStorage
   ↓
7. Si mustChangePassword=true:
   - Muestra modal ChangePasswordModal
   - Bloquea acceso a Dashboard
   ↓
8. Usuario cambia contraseña y accede al Dashboard
```

### 7.2 Flujo de Carga del Dashboard

```
1. Usuario autenticado accede a /dashboard
   ↓
2. DashBoard.jsx en useEffect():
   - Obtiene usuario de sessionStorage
   - Realiza GET /api/dashboard
   ↓
3. dashboardBLL.obtenerEstadisticas():
   - Calcula promedios de puntuaciones
   - Obtiene evaluaciones recientes
   ↓
4. dashboardDAL ejecuta queries:
   - AVG(puntuacionActitud, Estructura, Protocolos)
   - SELECT últimas evaluaciones
   ↓
5. Retorna JSON con estadísticas
   ↓
6. Frontend renderiza tarjetas y gráficos
```

---

## 8. REFERENCIAS Y ESTÁNDARES

### 8.1 Estándares SQL y BBDD

📚 **Referencias Consultadas**:
- **ACID**: Transacciones garantizan Atomicidad, Consistencia, Aislamiento y Durabilidad
- **Normalización**: El diseño sigue hasta 3FN (Tercera Forma Normal)
- **Índices**: Optimización usando estrategia de índices selectivos
- **Foreign Keys**: Integridad referencial mediante restricciones

### 8.2 Seguridad en Bases de Datos

✅ **Prepared Statements**: Previene SQL Injection
✅ **Hashing**: bcryptjs en lugar de almacenar texto plano
✅ **Auditoría**: Tabla AuditoriaSesion registra cambios críticos
✅ **Principio de Menor Privilegio**: Usuarios DB limitados a operaciones necesarias

### 8.3 Tecnologías Aplicadas

| Tecnología | Propósito |
|------------|-----------|
| **Next.js** | Framework React con API Routes integradas |
| **MySQL** | Base de datos relacional |
| **bcryptjs** | Hashing seguro de contraseñas |
| **Tailwind CSS** | Estilos y UI responsiva |
| **Chart.js** | Visualización de datos y gráficos |
| **mysql2/promise** | Conector MySQL con Promises |

### 8.4 Patrones de Arquitectura

- **MVC**: Model (BD) - View (React) - Controller (BLL)
- **Repository**: DAL encapsula acceso a datos
- **Middleware**: Control de acceso centralizado
- **DTO**: Transferencia de datos tipados

---

## 9. CONCLUSIÓN

El sistema **SMCAT** demuestra la implementación de:

✅ **Arquitectura robusta** en capas con separación clara de responsabilidades
✅ **Seguridad**: Autenticación con hashing, auditoría de acceso, validaciones en frontend y backend
✅ **Base de datos bien modelada** con integridad referencial, índices optimizados y normalización
✅ **Patrones de diseño** profesionales (Repository, DTO, RBAC)
✅ **Escalabilidad**: Estructura modular permite agregar nuevos módulos fácilmente

El sistema está listo para:
- Manejar múltiples usuarios concurrentes
- Crecer en funcionalidad manteniendo arquitectura limpia
- Ser auditado y monitoreado
- Ser desplegado en producción con ajustes de seguridad

---

## 10. ANEXOS

### A. Ejemplo de Query Optimizada

```sql
-- Obtener evaluaciones con información del operador
SELECT 
    e.idEvaluacion,
    e.puntuacionActitud,
    e.puntuacionEstructura,
    e.puntuacionProtocolos,
    ROUND((e.puntuacionActitud + e.puntuacionEstructura + e.puntuacionProtocolos) / 3, 2) as promedio,
    u.nombre,
    u.apellido,
    e.fechaHora
FROM Evaluacion e
INNER JOIN Usuario u ON e.idEvaluado = u.idUsuario
WHERE e.idEvaluador = ? 
  AND e.fechaHora BETWEEN ? AND ?
ORDER BY e.fechaHora DESC
LIMIT 20;
```

### B. Estructura de Respuesta API

```json
{
    "success": true,
    "usuario": {
        "idUsuario": 1,
        "nombreUsuario": "juan.perez",
        "nombre": "Juan",
        "apellido": "Pérez",
        "rol": "Analista",
        "grupos": ["Evaluadores"]
    },
    "estadisticas": {
        "totalEvaluaciones": 45,
        "promedioActitud": 4.50,
        "promedioEstructura": 4.30,
        "promedioProtocolos": 4.60
    }
}
```

### C. Diagrama de Flujo de Autenticación

```
[Login Page]
    │
    ├─> Validación Frontend
    │   ├─> Campos requeridos
    │   └─> Formato básico
    │
    └─> POST /api/auth/login
        │
        ├─> [authMiddleware]
        │   └─> Verificar headers
        │
        └─> [authBLL.loginUsuario]
            │
            ├─> [authDAL.obtenerUsuarioPorNombreDB]
            │   └─> SELECT Usuario WHERE nombreUsuario = ?
            │
            ├─> bcrypt.compare(contrasena, hash)
            │   ├─> ✓ Válida
            │   └─> ✗ Inválida → Error 401
            │
            ├─> [authDAL.crearAuditoriaSesionDB]
            │   └─> INSERT AuditoriaSesion (LOGIN)
            │
            └─> return { success: true, usuario: {...} }
                │
                └─> [sessionStorage] ✓ Autenticado
```

---

**Autor**: Carlos Gustavo Pérez  
**Materia**: Base de Datos Aplicadas  
**Fecha**: Noviembre 2025
