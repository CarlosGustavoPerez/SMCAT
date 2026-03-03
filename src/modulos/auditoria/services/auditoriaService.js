// src/modulos/auditoria/services/auditoriaService.js

export async function getAuditoriaSesiones(params) { 
    const url = `/api/auditoria/sesiones${params ? '?' + params : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
        let errorDetail = 'Error al obtener los reportes de auditoría.';
        try {
            const errorBody = await res.json();
            errorDetail = errorBody.error || errorDetail;
        } catch (e) {
        }
        throw new Error(errorDetail); 
    }
    
    return res.json();
}
export async function getFilterOptions() {
    const res = await fetch('/api/auditoria/filtros');
    
    if (!res.ok) {
        throw new Error('Error al obtener opciones de filtro.');
    }
    
    return res.json();
}