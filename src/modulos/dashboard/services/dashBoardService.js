export async function obtenerDashboard({ grupos, idUsuario, filtro }) {
  const res = await fetch('/api/dashboard', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ grupos, idUsuario, filtro }),
  });
  
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al obtener el dashboard');
  }

  return {
    evaluacionesHoy: data.evaluacionesHoy,
    promedioHoy: data.promedioHoy,
    recientes: data.recientes,
    operadores: data.operadores,
    umbrales: data.umbrales,
  };
}

export async function actualizarEstadoEvaluacion(idEvaluacion, nuevoEstado, idUsuarioAccion) {
  const res = await fetch('/api/evaluacion/estado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idEvaluacion, nuevoEstado,idUsuarioAccion }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'No se pudo actualizar el estado');
  }

  return data;
}
export const obtenerTodoElHistorial = async () => {
    const response = await fetch('/api/evaluacion/trazabilidad/todos');
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al obtener todo el historial.');
    }
    return response.json();
};
export const obtenerOpcionesDeFiltro = async () => {
    try {
        const response = await fetch('/api/evaluacion/trazabilidad/users');
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error al obtener opciones de filtro: ${response.status} - ${errorText}`);
        }
        return response.json();
    } catch (error) {
        console.error('Error en el servicio al obtener opciones de filtro:', error);
        throw error;
    }
};