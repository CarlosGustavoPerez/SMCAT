import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      idEvaluado,
      idEvaluador,
      fechaHora,
      duracion,
      actitud,
      estructura,
      protocolos,
      observaciones,
      idCampaña
    } = body;

    if (!idEvaluado || !idEvaluador || !fechaHora || !duracion || !actitud || !estructura || !protocolos || !idCampaña) {
      return Response.json({ success: false, error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO Evaluacion 
        (fechaHora, duracion, puntuacionActitud, puntuacionEstructura, puntuacionProtocolos, observaciones, idEvaluador, idEvaluado, idCampaña) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        fechaHora,
        duracion,
        actitud,
        estructura,
        protocolos,
        observaciones || null,
        idEvaluador,
        idEvaluado,
        idCampaña
      ]
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error al guardar evaluación:', error);
    return Response.json({ success: false, error: 'Error interno al guardar evaluación' }, { status: 500 });
  }
}
