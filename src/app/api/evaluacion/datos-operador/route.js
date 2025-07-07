import pool from '@/lib/db';

export async function POST(req) {
  const { idOperador } = await req.json();

  try {
    const [rows] = await pool.query(
      `SELECT t.nombre AS nombreTL, t.apellido AS apellidoTL
       FROM Usuario u
       LEFT JOIN Usuario t ON u.idTeamLeader = t.idUsuario
       WHERE u.idUsuario = ?`,
      [idOperador]
    );
console.log();
    if (rows.length === 0) {
      return Response.json({ success: false, error: 'Operador no encontrado' }, { status: 404 });
    }

    const { nombreTL, apellidoTL } = rows[0];

    return Response.json({
      success: true,
      teamLeader: nombreTL && apellidoTL ? `${nombreTL} ${apellidoTL}` : 'No asignado'
    });
  } catch (err) {
    console.error('Error al buscar TeamLeader:', err);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
