// src/modulos/desempeno/services/DesempenoService.js
import { getSessionUser } from '@/lib/utils/sessionStorage';

const getAuthHeaders = () => {
    const usuario = getSessionUser();
    if (!usuario?.grupos) return { 'Content-Type': 'application/json' };
    return {
        'Content-Type': 'application/json',
        'X-User-Groups-JSON': JSON.stringify(usuario.grupos),
    };
};

export async function obtenerDesempeno(filtros) {
    const res = await fetch('/api/reportes/desempeno', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(filtros),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'Error al obtener datos de desempeño.');
    return data;
}