import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(
      `SELECT idUsuario, nombre, apellido FROM Usuario WHERE rol = 'Operador'`
    );

    const operadores = rows.map(op => ({
      id: op.idUsuario,
      nombreCompleto: `${op.nombre} ${op.apellido}`
    }));

    return Response.json({ success: true, operadores });
  } catch (err) {
    console.error('Error al obtener operadores:', err);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
