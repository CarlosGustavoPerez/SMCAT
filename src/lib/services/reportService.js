export const obtenerReportes = async ({ grupos, idUsuario, dateFrom, dateTo, operator }) => {
    const res = await fetch('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupos, idUsuario, dateFrom, dateTo, operator }),
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Error al obtener reportes');
    return data.evaluaciones;
};

// Esta función se mantiene igual para obtener la lista de operadores
export const obtenerOperadores = async ({ grupos, idUsuario }) => {
    const res = await fetch('/api/reportes/operadores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grupos, idUsuario }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Error al obtener operadores');
    return data.operadores;
};