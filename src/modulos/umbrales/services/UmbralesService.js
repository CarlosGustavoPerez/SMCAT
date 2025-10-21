// Asume que tienes una función para obtener headers de autenticación
const getAuthHeaders = () => ({ 'Content-Type': 'application/json' /* , 'Authorization': ... */ }); 

export async function obtenerRangosDePrecaucion() { // Renombrada para mayor claridad
    const res = await fetch('/api/configuracion/umbrales-abm');
    const data = await res.json();
    if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al obtener rangos de precaución.');
    }
    // Retorna { precaucion_min, precaucion_max }
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