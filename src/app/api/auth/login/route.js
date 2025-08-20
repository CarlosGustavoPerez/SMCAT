import { findUserByUsername, findGroupsByUserId } from '@/lib/dal/authDAL';
import bcrypt from 'bcryptjs';

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
        const usuarioDB = await findUserByUsername(nombreUsuario);
        if (!usuarioDB) {
            return Response.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
        }
        const isMatch = await bcrypt.compare(contraseña, usuarioDB.contraseña);
        if (!isMatch) {
            return Response.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
        }
        // Obtener los grupos del usuario
        const gruposUsuario = await findGroupsByUserId(usuarioDB.idUsuario);
        // Excluir la contraseña y añadir los grupos antes de enviar la respuesta
        const { contraseña: _, ...usuarioSinClave } = usuarioDB;
        const usuarioConGrupos = { ...usuarioSinClave, grupos: gruposUsuario };
        return Response.json({ success: true, usuario: usuarioConGrupos });
    } catch (error) {
        console.error('Error en login endpoint:', error);
        return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}
