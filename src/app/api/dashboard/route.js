import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { rol, idUsuario } = await request.json();

    let query = `
      SELECT 
        e.fechaHora,
        e.duracion,
        e.puntuacionActitud,
        e.puntuacionEstructura,
        e.puntuacionProtocolos,
        e.observaciones,
        e.estado,
        e.idEvaluado,
        e.idEvaluacion,
        ue.nombre AS nombreEvaluado,
        ue.apellido AS apellidoEvaluado
      FROM Evaluacion e
      JOIN Usuario ue ON ue.idUsuario = e.idEvaluado
    `;

    let params = [];

    // Filtro según el rol
    if (rol === 'Operador') {
      query += ' WHERE ue.idUsuario = ?';
      params.push(idUsuario);
    } else if (rol === 'TeamLeader') {
      query += ' WHERE ue.idTeamLeader = ?';
      params.push(idUsuario);
    }
    query += ' ORDER BY e.fechaHora DESC';

    const [rows] = await pool.query(query, params);

    // Obtener las 10 más recientes para mostrar en la grilla
    const recientes = rows.slice(0, 10);

    // Calcular promedio general (de todos los registros obtenidos según rol)
    const promedioGeneral =
      rows.length > 0
        ? (
            rows.reduce((total, ev) => {
              const sum = ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos;
              return total + sum / 3;
            }, 0) / rows.length
          ).toFixed(2)
        : 0;

    return Response.json({
      success: true,
      promedioHoy: promedioGeneral,
      evaluacionesHoy: rows.length, // Total evaluaciones visibles al usuario
      recientes
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
