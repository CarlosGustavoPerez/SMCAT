import { loginUsuario, registrarEventoSesion } from '@/modulos/authentication/bll/authBLL'; // <-- Importamos ambas
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
    const { nombreUsuario, contraseña } = await request.json();
    const { ipOrigen} = getClientIp(request); 

    try {
        if (!nombreUsuario || !contraseña) {
            // REGISTRO DE FALLO POR DATOS INCOMPLETOS
            await registrarEventoSesion({ 
                nombreUsuario: nombreUsuario || 'VACÍO', 
                tipoEvento: 'LOGIN_FALLIDO', 
                ipOrigen,
                detalle: 'Faltan datos requeridos (nombre o clave)' 
            }, pool);
            
            return Response.json({ success: false, error: 'Faltan datos' }, { status: 400 });
        }
        
        const usuario = await loginUsuario (nombreUsuario, contraseña, pool);

        if (!usuario) {
            // REGISTRO DE LOGIN FALLIDO POR CREDENCIALES
            await registrarEventoSesion({ 
                nombreUsuario, 
                tipoEvento: 'LOGIN_FALLIDO', 
                ipOrigen, 
                detalle: 'Credenciales inválidas' 
            }, pool); 
            
            return Response.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
        }
        
        // REGISTRO DE LOGIN EXITOSO
        await registrarEventoSesion({ 
            idUsuario: usuario.idUsuario, 
            nombreUsuario: usuario.nombreUsuario, 
            tipoEvento: 'LOGIN_EXITOSO', 
            ipOrigen,
        }, pool);

        return Response.json({ success: true, usuario });
        
    } catch (error) {
        console.error('Error en login endpoint:', error);
        
        // REGISTRO DE FALLO INTERNO DEL SERVIDOR
        await registrarEventoSesion({ 
            nombreUsuario: nombreUsuario || 'N/A', 
            tipoEvento: 'LOGIN_FALLIDO', 
            ipOrigen, 
            detalle: `Error interno: ${error.message.substring(0, 100)}` // Limitar detalle
        }, pool);
        
        return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}