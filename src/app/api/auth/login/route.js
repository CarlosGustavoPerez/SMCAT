import { loginUsuario, registrarEventoSesion } from '@/modulos/authentication/bll/authBLL'; // <-- Importamos ambas
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

function getClientIp(request) {
  let ipOrigen = request.headers.get('x-forwarded-for') 
              || request.headers.get('x-real-ip') 
              || request.socket?.remoteAddress 
              || 'N/A';
  
  // Normalizar IPv6 mapeado a IPv4 (::ffff:192.168.1.1 -> 192.168.1.1)
  if (typeof ipOrigen === 'string' && ipOrigen.startsWith('::ffff:')) {
    ipOrigen = ipOrigen.replace('::ffff:', '');
  }
  
  // Si x-forwarded-for contiene múltiples IPs, tomar la primera
  if (typeof ipOrigen === 'string' && ipOrigen.includes(',')) {
    ipOrigen = ipOrigen.split(',')[0].trim();
  }

  return { ipOrigen };
}

export async function POST(request) {
    const { nombreUsuario, contrasena } = await request.json();
    const { ipOrigen} = getClientIp(request); 
    console.log('IP Origen del cliente:', ipOrigen);
    try {
        if (!nombreUsuario || !contrasena) {
            await registrarEventoSesion({ 
                nombreUsuario: nombreUsuario || 'VACÍO', 
                tipoEvento: 'LOGIN_FALLIDO', 
                ipOrigen,
                detalle: 'Faltan datos requeridos (nombre o clave)' 
            }, pool);

            return NextResponse.json({ success: false, error: 'Faltan datos' }, { status: 400 });
        }

        const result = await loginUsuario (nombreUsuario, contrasena, pool); // Capturamos el resultado (usuario o error)

        if (result && result.error === true && result.errorCode === 'KEY_EXPIRED') {
            const usuario = result; 
            await registrarEventoSesion({ 
                nombreUsuario: usuario.nombreUsuario, 
                tipoEvento: 'LOGIN_FALLIDO', 
                ipOrigen, 
                detalle: 'Clave vencida: ' + result.message
            }, pool);
            
            return NextResponse.json({ 
                success: false, 
                error: 'Clave expirada', 
                message: result.message, 
                errorCode: 'KEY_EXPIRED',
                idUsuario: result.idUsuario,
                nombreUsuario: result.nombreUsuario
            }, { status: 403 });
        }

        if (!result) {
        // REGISTRO DE LOGIN FALLIDO POR CREDENCIALES
            await registrarEventoSesion({ 
                nombreUsuario, 
                tipoEvento: 'LOGIN_FALLIDO', 
                ipOrigen, 
                detalle: 'Credenciales inválidas' 
            }, pool); 
        
            return NextResponse.json({ success: false, error: 'Credenciales inválidas' }, { status: 401 });
        }

        const usuario = result; 
        // REGISTRO DE LOGIN EXITOSO
        await registrarEventoSesion({ 
            idUsuario: usuario.idUsuario, 
            nombreUsuario: usuario.nombreUsuario, 
            tipoEvento: 'LOGIN_EXITOSO', 
            ipOrigen,
        }, pool);

        return NextResponse.json({ success: true, usuario });
    
    } catch (error) {
        console.error('Error en login endpoint:', error);

        // REGISTRO DE FALLO INTERNO DEL SERVIDOR
        await registrarEventoSesion({ 
            nombreUsuario: nombreUsuario || 'N/A', 
            tipoEvento: 'LOGIN_FALLIDO', 
            ipOrigen, 
            detalle: `Error interno: ${error.message.substring(0, 100)}` 
        }, pool);

        return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
    }
}