// api/auditoria/filtros/route.js

import pool from '@/lib/db';
import { getAuditoriaFiltrosBLL } from '@/modulos/auditoria/bll/auditoriaBLL'; // <-- Importar BLL

export async function GET(request) {
    try {
        // Llama a BLL, que contiene la lógica de Promise.all
        const filtrosData = await getAuditoriaFiltrosBLL(pool); // <-- Llama a BLL

        return Response.json({ 
            success: true, 
            usuariosUnicos: filtrosData.usuariosUnicos, 
            tiposEventoUnicos: filtrosData.tiposEventoUnicos 
        });
        
    } catch (error) {
        // ... (manejo de errores)
        console.error('Error en endpoint de filtros de auditoría:', error);
        return Response.json({ success: false, error: 'Error al cargar opciones de filtro' }, { status: 500 });
    }
}