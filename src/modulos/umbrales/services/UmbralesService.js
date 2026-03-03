// src/modulos/umbrales/services/UmbralesService.js
const getAuthHeaders = () => ({ 'Content-Type': 'application/json'}); 

export async function obtenerRangosDePrecaucion() { 
    const res = await fetch('/api/configuracion/umbrales-abm');
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al obtener rangos de precaución.');
    }
    return data;
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