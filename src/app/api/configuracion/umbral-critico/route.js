// src/app/api/configuracion/umbral-critico/route.js

import { NextResponse } from 'next/server';
import { requireRole } from '@/modulos/authentication/be/authMiddleware';
import { PlanesMejoraBLL } from '@/modulos/planesMejora/bll/PlanesMejoraBLL'; 

const planesService = new PlanesMejoraBLL();

export async function GET(request) {
    const authResult = requireRole(request, ['Supervisor', 'Admin', 'TeamLeader', 'Operador']); 
    if (authResult) return authResult; 

    try {
        // La API Route llama ÚNICAMENTE al BLL
        const umbral = await planesService.obtenerUmbralCritico(); 
        
        // El BLL ya ha manejado el fallback, así que devolvemos el valor directamente
        return NextResponse.json({ success: true, umbral }); 
    } catch (error) {
        console.error('API Error al obtener umbral crítico:', error);
        return NextResponse.json({ success: false, error: 'Error interno al obtener configuración.' }, { status: 500 });
    }
}