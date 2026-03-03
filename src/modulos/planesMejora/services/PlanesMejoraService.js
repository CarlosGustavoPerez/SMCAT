// src/modulos/planesMejora/services/PlanesMejoraService.js
import { getSessionUser } from '@/lib/utils/sessionStorage'; 

const getAuthHeaders = () => {
    const usuario = getSessionUser();
    if (!usuario || !usuario.grupos) {
        return { 'Content-Type': 'application/json' }; 
    }
    const userGroupsJson = JSON.stringify(usuario.grupos);
    return {
        'Content-Type': 'application/json',
        'X-User-Groups-JSON': userGroupsJson, 
    };
};
export async function obtenerOperadoresElegibles(umbralCritico) {
    if (umbralCritico === undefined || umbralCritico === null) {
        throw new Error("El umbral crítico es requerido para obtener operadores elegibles.");
    }
    const url = `/api/planes-mejora/operadores-elegibles?umbralCritico=${umbralCritico}`;
    const res = await fetch(url, {
        headers: getAuthHeaders(), // <-- Protegido
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al obtener operadores elegibles.');
    }
    return data;
}
export async function crearPlanMejora(plan) {
    const res = await fetch('/api/planes-mejora/nuevo', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(plan)
    });
    const data = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar el Plan de Mejora.');
    }
    return data;
}
export async function obtenerTodosLosPlanes() {
    const res = await fetch('/api/planes-mejora/todos', {
        headers: getAuthHeaders(),
    }); 
    const data = await res.json();

    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al obtener el listado de planes.');
    }
    return data.planes;
}
export async function cerrarPlanMejora(planId, estado, resultado) {
    const res = await fetch(`/api/planes-mejora/${planId}/cerrar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ estado, resultado })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al cerrar el Plan de Mejora.');
    }
    return data;
}
export async function obtenerUmbralCritico() {
    const res = await fetch('/api/configuracion/umbral-critico', { 
        headers: getAuthHeaders(),
    }); 
    const data = await res.json();
    if (!res.ok || !data.success) {
        console.error('Fallo al obtener el umbral crítico del backend. Usando 3.0 como fallback.');
        return 2.5;
    }
    return parseFloat(data.umbral); 
}
export async function guardarUmbrales(umbralesData) {
    const res = await fetch('/api/configuracion/umbrales-abm', {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(umbralesData)
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Fallo al guardar la configuración de umbrales.');
    }
    return data;
}