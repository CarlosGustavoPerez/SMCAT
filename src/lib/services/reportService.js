// services/reportService.js
export const obtenerReportes = async ({ rol, idUsuario }) => {
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rol, idUsuario }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Error al obtener reportes');
  return data.evaluaciones;
};

export const obtenerOperadores = async ({ rol, idUsuario }) => {
  const res = await fetch('/api/reportes/operadores', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ rol, idUsuario }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Error al obtener operadores');
  return data.operadores;
};

export const obtenerReportesFiltrados = async (filters) => {
  const res = await fetch('/api/reportes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(filters),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Error al filtrar reportes');
  return data.evaluaciones;
};
