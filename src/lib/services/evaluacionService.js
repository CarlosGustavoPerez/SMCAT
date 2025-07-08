export async function obtenerOperadores() {
  const res = await fetch('/api/evaluacion/operadores');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al obtener operadores');
  }
  return data.operadores;
}

export async function obtenerCampanias() {
  const res = await fetch('/api/evaluacion/campanias');
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al obtener campañas');
  }
  return data.campanias;
}

export async function obtenerTeamLeader(idOperador) {
  const res = await fetch('/api/evaluacion/datos-operador', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idOperador }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al obtener Team Leader');
  }
  return data.teamLeader;
}

export async function guardarEvaluacion(evaluacion) {
  const res = await fetch('/api/evaluacion/nueva', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evaluacion),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al guardar evaluación');
  }
  return data;
}
