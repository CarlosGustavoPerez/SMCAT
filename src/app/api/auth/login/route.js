import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { nombreUsuario, contraseña } = body;

    if (!nombreUsuario || !contraseña) {
      return Response.json({ success: false, error: 'Faltan datos' }, { status: 400 });
    }

    // Buscar usuario por nombreUsuario
    const [users] = await pool.query(
      'SELECT idUsuario, nombre, apellido, nombreUsuario, contraseña, rol FROM Usuario WHERE nombreUsuario = ?',
      [nombreUsuario]
    );

    if (users.length === 0) {
      return Response.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    const usuario = users[0];

    // Verificar contraseña (sin hash)
    if (contraseña !== usuario.contraseña) {
      return Response.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Devuelve datos del usuario sin la contraseña
    const { contraseña: _, ...usuarioSinClave } = usuario;

    return Response.json({ success: true, usuario: usuarioSinClave });
  } catch (error) {
    console.error('Error en login:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
