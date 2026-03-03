// api/auditoria/sesiones/route.js

import pool from '@/lib/db';
import { getAuditoriaSesionesBLL } from '@/modulos/auditoria/bll/auditoriaBLL';

export async function GET(request) {
    const url = new URL(request.url);
    const filtros = {
        usuario: url.searchParams.get('usuario') || '',
        tipoEvento: url.searchParams.get('tipoEvento') || '',
        fechaDesde: url.searchParams.get('fechaDesde') || '',
        fechaHasta: url.searchParams.get('fechaHasta') || '',
        busquedaGeneral: url.searchParams.get('busquedaGeneral') || '',
    };

    try {
        const sesiones = await getAuditoriaSesionesBLL(pool, filtros);
        return Response.json({ success: true, sesiones });
        
    } catch (error) {
       let status = 500;
        let errorMessage = 'Error interno del servidor.';
        if (error.message.includes('posterior a la fecha "Hasta"')) {
            status = 400;
            errorMessage = error.message;
        } else {
             console.error('Error de servidor no clasificado:', error.message);
        }
        return Response.json({ 
            success: false, 
            error: errorMessage 
        }, { status: status });
    }
}