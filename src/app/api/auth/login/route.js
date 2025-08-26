import { loginUsuario as loginUsuarioBLL } from '@/lib/bll/authBLL';

/**
 * Maneja las solicitudes POST para el endpoint de login.
 * @param {Request} request - El objeto de solicitud HTTP.
 * @returns {Response} - La respuesta JSON con el resultado del login.
 */
export async function POST(request) {
  try {
    const { nombreUsuario, contraseña } = await request.json();
    if (!nombreUsuario || !contraseña) {
      return Response.json({ success: false, error: 'Faltan datos' }, { status: 400 });
    }

    const usuario = await loginUsuarioBLL(nombreUsuario, contraseña);
    if (!usuario) {
      return Response.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
    }

    return Response.json({ success: true, usuario });
  } catch (error) {
    console.error('Error en login endpoint:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}
