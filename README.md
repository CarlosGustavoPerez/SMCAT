# 🧠 Sistema de Evaluación de Calidad de Atención Telefónica (SMCAT)

Este proyecto es un sistema web desarrollado con [Next.js](https://nextjs.org) que permite a **Analistas** evaluar llamadas de **Operadores**, gestionar reportes, y visualizar métricas de desempeño, siguiendo una arquitectura en capas y aplicando patrones de diseño.

---

## 📦 Tecnologías Utilizadas

- **Next.js** (App Router)
- **React.js** + **Hooks**
- **Tailwind CSS**
- **Chart.js** (visualización de datos)
- **MySQL** (Base de datos)
- **Node.js** / API Routes (`/api/`)
- **Arquitectura en capas** y patrones como MVC, Repository, DTO

---

## 🚀 Instalación y Ejecución

### 1. Clonar el repositorio

```bash
git clone https://github.com/usuario/smcat.git
cd smcat
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar en entorno de desarrollo

```bash
npm run dev
```

Visitar [http://localhost:3000](http://localhost:3000)

---

## 👥 Roles del Sistema

- **Analista**: Registra evaluaciones
- **Operador**: Visualiza su desempeño y puede dar conformidad
- **TeamLeader**: Supervisa resultados de su equipo

---

## 🧪 Funcionalidades Principales

- **Login** con control de acceso por rol
- **Dashboard** con métricas y evaluaciones recientes
- **Formulario de Evaluación** con validaciones
- **Reportes** con filtros, tabla de resultados y gráficos
- **Persistencia** en base de datos MySQL

---

## 📂 Estructura de Carpetas

```
src
  |__app
  |  |__api
  |  |  |__admin
  |  |  |  |__groups
  |  |  |  |  |  |__route.ts
  |  |  |  |  |__[id]
  |  |  |  |  |  |__route.ts
  |  |  |  |  |  |__groups
  |  |  |  |  |  |  |__route.ts
  |  |  |  |  |  |  |__[groupsId]
  |  |  |  |  |  |  |  |__route.ts
  |  |  |__auth
  |  |  |  |__login
  |  |  |  |  |__route.ts
  |  |  |__dashboard
  |  |  |  |__route.ts
  |  |  |__evaluacion
  |  |  |  |__campanias
  |  |  |  |  |__route.ts
  |  |  |  |__datos-operador
  |  |  |  |  |__route.ts
  |  |  |  |__estado
  |  |  |  |  |__route.ts
  |  |  |  |__nueva
  |  |  |  |  |__route.ts
  |  |  |  |__operadores
  |  |  |  |  |__route.ts
  |  |  |__reportess
  |  |  |  |__route.ts
  |  |  |  |__operadores
  |  |  |  |  |__route.ts
  |  |__page.js
  |__components
  |  |__admin
  |  |  |__AdminPanel.jsx
  |  |  |__GroupManagement.jsx
  |  |  |__UserManagement.jsx
  |  |__DashBoard.jsx
  |  |__EvaluationForms.jsx
  |  |__LoginScreen.jsx
  |  |__Reports.jsx
  |__lib
  |  |__db.js
  |  |__utils
  |  |  |__sessionStorage.js
  |__modulos
  |  |__admin
  |  |  |__bll
  |  |  |__dal
  |  |  |__services
  |  |__authentication
  |  |  |__be
  |  |  |__bll
  |  |  |__dal
  |  |  |__services
  |  |__dashboard
  |  |  |__be
  |  |  |__bll
  |  |  |__dal
  |  |  |__services
  |  |__evaluaciones
  |  |  |__be
  |  |  |__bll
  |  |  |__dal
  |  |  |__services
  |  |__reportes
  |  |  |__bll
  |  |  |__dal
  |  |  |__services
```

---

## 🧩 Patrones de Diseño Aplicados

- **MVC** (Vista: React / Controlador: lógica / Modelo: servicios)
- **Repository** (`evaluacionService.js`)
- **Observer** (`useState`, `useEffect`)
- **DTO** (objetos de datos transferidos al backend)
- **Componentes Reutilizables** (e.g. `StarRating`)

👉 Ver documento completo en `/docs/PatronesDiseñoAplicados.md`

---

## 📊 Reportes y Métricas

- Visualización del promedio de puntuaciones por operador
- Filtros por fecha, operador y campaña
- Gráfico de barras y tabla detallada

---

## 🛡️ Seguridad

- Validaciones en login
- Autenticación por `nombreUsuario` y `contrasena`
- Acceso restringido según el rol del usuario

---

## 📄 Licencia

Este proyecto es parte de un Trabajo Práctico de la materia **Ingeniería de Software** y se encuentra bajo una licencia académica.

---

## 🙌 Autor

**Carlos Gustavo Pérez**  
