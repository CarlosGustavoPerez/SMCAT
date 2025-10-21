// api/auth/logout/route.js

// Importamos la función de la BLL que creamos para auditoría
import { registrarEventoSesion } from '@/modulos/authentication/bll/authBLL'; 
import pool from '@/lib/db';

function getClientIp(request) {
  let ipOrigen = request.headers.get('x-forwarded-for') 
              || request.headers.get('x-real-ip') 
              || request.socket?.remoteAddress 
              || 'N/A';
  if (ipOrigen.startsWith('::ffff:')) ipOrigen = ipOrigen.replace('::ffff:', '');

  return { ipOrigen};
}


export async function POST(request) {
    try {
        const { idUsuario, nombreUsuario } = await request.json();
        const { ipOrigen } = getClientIp(request); 

        if (!idUsuario) {
            // Este es un caso de auditoría: se intenta cerrar sesión sin saber quién es.
            console.warn('Intento de logout sin ID de usuario.');
        }
        const userToLog = nombreUsuario || 'ID_SIN_NOMBRE';
        // 1. LLAMADA A LA BLL DE AUDITORÍA
        await registrarEventoSesion({ 
            idUsuario, 
            nombreUsuario: userToLog,  // o puedes buscarlo si el tiempo lo permite
            tipoEvento: 'LOGOUT', 
            ipOrigen,
        }, pool);

        // 2. Respuesta al Frontend
        return Response.json({ success: true, message: 'Logout auditado' });

    } catch (error) {
        console.error('Error en logout endpoint:', error);
        // Es importante retornar éxito al frontend para que el logout local ocurra,
        // incluso si la auditoría falla por un error de DB (a menos que se quiera ser muy estricto).
        return Response.json({ success: true, error: 'Error al auditar' }, { status: 500 });
    }
}