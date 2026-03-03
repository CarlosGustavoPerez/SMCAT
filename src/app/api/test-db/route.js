import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS ahora');
    return Response.json({ success: true, ahora: rows[0].ahora });
  } catch (error) {
    return Response.json({ success: false, error: 'No se pudo conectar a la base de datos' }, { status: 500 });
  }
}
