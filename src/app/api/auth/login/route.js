import pool from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("BODY:", body);

    const { nombreUsuario, contraseña } = body;

    if (!nombreUsuario || !contraseña) {
      console.log("Faltan datos");
      return Response.json({ success: false, error: 'Faltan datos' }, { status: 400 });
    }

    const [users] = await pool.query(
      'SELECT idUsuario, nombre, apellido, nombreUsuario, contraseña, rol FROM Usuario WHERE nombreUsuario = ?',
      [nombreUsuario]
    );

    console.log("USERS ENCONTRADOS:", users);

    if (users.length === 0) {
      return Response.json({ success: false, error: 'Usuario no encontrado' }, { status: 404 });
    }

    const usuario = users[0];

    if (contraseña !== usuario.contraseña) {
      return Response.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 });
    }

    const { contraseña: _, ...usuarioSinClave } = usuario;

    return Response.json({ success: true, usuario: usuarioSinClave });
  } catch (error) {
    console.error('Error en login:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}

