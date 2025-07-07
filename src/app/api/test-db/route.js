import pool from '@/lib/db';

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT idUsuario, nombre, apellido, nombreUsuario, rol FROM Usuario');
    return Response.json({ success: true, data: rows });
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error);
    return Response.json({ success: false, error: 'Error de conexión con la base de datos' }, { status: 500 });
  }
}
