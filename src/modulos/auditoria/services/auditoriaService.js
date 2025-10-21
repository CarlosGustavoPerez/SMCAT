// src/modulos/auditoria/services/auditoriaService.js

export async function getAuditoriaSesiones(params) { 
    const url = `/api/auditoria/sesiones${params ? '?' + params : ''}`;
    const res = await fetch(url);
    if (!res.ok) {
        // --- LÓGICA CRÍTICA DE CAPTURA DE ERROR ---
        let errorDetail = 'Error al obtener los reportes de auditoría.';
        
        try {
            // Intenta leer el cuerpo de la respuesta como JSON
            const errorBody = await res.json();
            // Asume que el backend (Route) devuelve el mensaje en la propiedad 'error'
            errorDetail = errorBody.error || errorDetail;
        } catch (e) {
            // Si no se puede parsear el JSON, mantenemos el mensaje genérico
        }
        
        // Lanza un nuevo Error que contiene el mensaje específico
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