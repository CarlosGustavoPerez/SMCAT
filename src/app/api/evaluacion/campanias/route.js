import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query(`SELECT idCampaña, nombre FROM Campaña`);

    const campanias = rows.map(c => ({
      id: c.idCampaña,
      nombre: c.nombre
    }));

    return Response.json({ success: true, campanias });
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    return Response.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
