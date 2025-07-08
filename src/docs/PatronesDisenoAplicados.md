# 📐 Patrones de Diseño Aplicados en el Sistema de Evaluación de Llamadas

---

## 1. Patrón MVC (Modelo - Vista - Controlador)

**Aplicación en el sistema:**

- **Modelo:**  
  `evaluacionService.js`: Contiene la lógica de negocio para acceder a los datos, como `guardarEvaluacion`, `obtenerOperadores`, `obtenerCampanias`, etc.

- **Vista:**  
  Componentes React como `EvaluationForm.jsx`, `Reports.jsx`, que representan la interfaz de usuario.

- **Controlador:**  
  Funciones como `handleSubmit`, `handleOperatorChange`, `aplicarFiltros` que controlan la interacción del usuario y actualizan el modelo y la vista.

**Beneficio:** Separa responsabilidades para una mejor mantenibilidad.

---

## 2. Patrón Repository

**Aplicación en el sistema:**

- Archivo `evaluacionService.js` actúa como repositorio de datos.
- Centraliza el acceso a los recursos remotos mediante `fetch` hacia endpoints como `/api/reports`, `/api/reportes/operadores`, `/api/evaluaciones`, etc.

**Beneficio:** Abstracción del acceso a datos, facilitando cambios en la fuente de datos sin afectar el resto del sistema.

---

## 3. Patrón Observer (implícito por React)

**Aplicación en el sistema:**

- Uso de `useState` y `useEffect` en componentes como `EvaluationForm` y `Reports`.
- React actualiza automáticamente la UI cuando el estado cambia (por ejemplo, al modificar `formData`, `chartData`, o `filters`).

**Beneficio:** Desacopla la vista de la lógica de negocio al reaccionar a los cambios de estado.

---

## 4. Patrón DTO (Data Transfer Object)

**Aplicación en el sistema:**

Objeto `evaluacion` armado antes de llamar a `guardarEvaluacion` contiene solo los datos necesarios:

```js
const evaluacion = {
  idEvaluado: operator,
  idEvaluador: usuario.idUsuario,
  fechaHora,
  duracion: `00:${callDuration}`,
  actitud: attitude,
  estructura: callStructure,
  protocolos: protocolCompliance,
  observaciones,
  idCampaña: campaign
};
```

**Beneficio:** Facilita la transferencia de información entre el frontend y backend.

---

## 5. Patrón de Componente Reutilizable

**Aplicación en el sistema:**

Componente `StarRating` definido como:

```js
const StarRating = ({ value, onChange, label, required = true }) => ( ... )
```

Se reutiliza con distintas props para actitud, estructura y protocolos.

**Beneficio:** Fomenta la reutilización de código y reduce la duplicación.

---

## 📋 Resumen

| Patrón                  | Aplicación Concreta en el Código                         |
|------------------------|----------------------------------------------------------|
| MVC                    | Separación entre `services`, componentes y controladores |
| Repository             | `evaluacionService.js`                                   |
| Observer               | `useState`, `useEffect` en componentes React             |
| DTO                    | Objeto `evaluacion` enviado al backend                   |
| Componente Reutilizable| `StarRating` para distintas puntuaciones                 |

---

## ✅ Conclusión

El sistema implementa varios patrones de diseño que aseguran una arquitectura modular, reutilizable y mantenible, alineada con buenas prácticas de desarrollo frontend moderno.
