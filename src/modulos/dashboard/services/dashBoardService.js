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
  };
}

export async function actualizarEstadoEvaluacion(idEvaluacion, nuevoEstado) {
  const res = await fetch('/api/evaluacion/estado', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idEvaluacion, nuevoEstado }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'No se pudo actualizar el estado');
  }

  return data;
}