import { loginUsuario as loginUsuarioBLL } from '@/modulos/authentication/bll/authBLL';
import pool from '@/lib/db';

export async function POST(request) {
    try {
        const { nombreUsuario, contraseña } = await request.json();
        if (!nombreUsuario || !contraseña) {
            return Response.json({ success: false, error: 'Faltan datos' }, { status: 400 });
        }
        const usuario = await loginUsuarioBLL(nombreUsuario, contraseña, pool);
        if (!usuario) {
            return Response.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
        }
        return Response.json({ success: true, usuario });
    } catch (error) {
        console.error('Error en login endpoint:', error);
        return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}