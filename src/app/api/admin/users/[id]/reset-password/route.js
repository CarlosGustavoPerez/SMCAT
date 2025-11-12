import { resetearClave } from '@/modulos/admin/bll/adminBLL';
import { registrarEventoSesion } from '@/modulos/authentication/bll/authBLL';
import { getUsernameById } from '@/modulos/admin/dal/adminDAL';
import pool from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request, context) {
    // Await params per Next.js synchronous dynamic API requirement
    const params = await context.params;
    try {
        const userId = Number(params.id);
        const result = await resetearClave(userId);

        // Registrar auditoría: quién realizó el reseteo (si el cliente envió info en headers)
        try {
            const adminHeader = request.headers.get('X-User-JSON');
            let adminInfo = null;
            if (adminHeader) {
                try { adminInfo = JSON.parse(adminHeader); } catch (e) { adminInfo = null; }
            }

            const ipOrigen = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'N/A';
            
            // Obtener el nombre de usuario del usuario afectado
            const targetUsername = await getUsernameById(userId);

            await registrarEventoSesion({
                idUsuario: userId, // usuario afectado
                nombreUsuario: targetUsername || 'DESCONOCIDO',
                tipoEvento: 'RESET_CLAVE',
                ipOrigen,
                detalle: `Clave reseteada por admin ${adminInfo?.nombreUsuario || 'N/A'} (id:${adminInfo?.idUsuario || 'N/A'})`
            }, pool);
        } catch (e) {
            // No bloquear la operación si la auditoría falla; loguear para investigar
            console.error('Fallo al registrar auditoría de reseteo de clave:', e);
        }

        return NextResponse.json({ 
            message: `Clave reseteada. La nueva clave es: ${result.newPassword}`, 
            newPassword: result.newPassword 
        }, { status: 200 });
    } catch (error) {
        console.error("Fallo al resetear contraseña en API:", error.message);
        const status = error.message.includes("no existe") ? 404 : 500;

        return NextResponse.json({ 
            message: error.message || "Error interno del servidor." 
        }, { status });
    }
}