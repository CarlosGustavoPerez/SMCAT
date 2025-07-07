// src/app/api/evaluacion/estado/route.js
import pool from '@/lib/db';

export async function POST(request) {
  try {
    const { idEvaluacion, nuevoEstado } = await request.json();
    const estadosValidos = [
      'CERRADA CON CONFORMIDAD',
      'CERRADA SIN CONFORMIDAD'
    ];

    if (!estadosValidos.includes(nuevoEstado)) {
      return Response.json({ success: false, error: 'Estado inválido' }, { status: 400 });
    }

    await pool.query(
      'UPDATE Evaluacion SET estado = ? WHERE idEvaluacion = ?',
      [nuevoEstado, idEvaluacion]
    );

    return Response.json({ success: true, mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
