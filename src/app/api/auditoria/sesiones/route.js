// api/auditoria/sesiones/route.js

import pool from '@/lib/db';
import { getAuditoriaSesionesBLL } from '@/modulos/auditoria/bll/auditoriaBLL'; // <-- Importar BLL

export async function GET(request) {
    const url = new URL(request.url);
    // 1. EXTRAER TODOS LOS PARÁMETROS DE LA URL
    const filtros = {
        usuario: url.searchParams.get('usuario') || '',
        tipoEvento: url.searchParams.get('tipoEvento') || '',
        fechaDesde: url.searchParams.get('fechaDesde') || '',
        fechaHasta: url.searchParams.get('fechaHasta') || '',
        busquedaGeneral: url.searchParams.get('busquedaGeneral') || '',
    };

    try {
        // 2. PASAR LOS FILTROS REALES AL BLL
        const sesiones = await getAuditoriaSesionesBLL(pool, filtros); // <-- Llama a BLL
        return Response.json({ success: true, sesiones });
        
    } catch (error) {
       let status = 500;
        let errorMessage = 'Error interno del servidor.'; // Mensaje genérico para 500

        // LÓGICA DE CLASIFICACIÓN DEL ERROR (BLL vs DAL/Genérico)
        // Si el mensaje de error contiene la frase clave de la BLL, lo clasificamos como 400.
        if (error.message.includes('posterior a la fecha "Hasta"')) {
            status = 400; // <-- Status 400 para errores de cliente (validación)
            errorMessage = error.message; // Usamos el mensaje específico de la BLL
        } else {
             // Si no es el error de validación, se asume un error de servidor (ej. DB, conexión).
             console.error('Error de servidor no clasificado:', error.message);
        }

        // Devolvemos el status y el mensaje específico en el cuerpo JSON
        return Response.json({ 
            success: false, 
            error: errorMessage 
        }, { status: status });
    }
}