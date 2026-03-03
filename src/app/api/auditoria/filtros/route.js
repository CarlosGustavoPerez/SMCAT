// api/auditoria/filtros/route.js

import pool from '@/lib/db';
import { getAuditoriaFiltrosBLL } from '@/modulos/auditoria/bll/auditoriaBLL';

export async function GET(request) {
    try {
        const filtrosData = await getAuditoriaFiltrosBLL(pool);
        return Response.json({ 
            success: true, 
            usuariosUnicos: filtrosData.usuariosUnicos, 
            tiposEventoUnicos: filtrosData.tiposEventoUnicos 
        });
    } catch (error) {
        console.error('Error en endpoint de filtros de auditoría:', error);
        return Response.json({ success: false, error: 'Error al cargar opciones de filtro' }, { status: 500 });
    }
}