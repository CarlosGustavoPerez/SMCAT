import { NextResponse } from 'next/server';
import { PlanesMejoraBLL } from '@/modulos/planesMejora/bll/PlanesMejoraBLL';
import { requireRole } from '@/modulos/authentication/be/authMiddleware';

const planesService = new PlanesMejoraBLL();
export async function GET(request) {
    const authResult = requireRole(request, ['Supervisor', 'Analista', 'TeamLeader', 'Administrador']); 
    if (authResult) return authResult; 

    try {
        const planes = await planesService.obtenerTodosLosPlanes();
        return NextResponse.json({ success: true, planes }); 
    } catch (error) {
        console.error('API Error (Listar Planes):', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor al obtener planes.' }, { status: 500 });
    }
}