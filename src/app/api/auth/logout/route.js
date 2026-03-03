// api/auth/logout/route.js
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
            console.warn('Intento de logout sin ID de usuario.');
        }
        const userToLog = nombreUsuario || 'ID_SIN_NOMBRE';
        await registrarEventoSesion({ 
            idUsuario, 
            nombreUsuario: userToLog,
            tipoEvento: 'LOGOUT', 
            ipOrigen,
        }, pool);
        return Response.json({ success: true, message: 'Logout auditado' });

    } catch (error) {
        console.error('Error en logout endpoint:', error);
        return Response.json({ success: true, error: 'Error al auditar' }, { status: 500 });
    }
}