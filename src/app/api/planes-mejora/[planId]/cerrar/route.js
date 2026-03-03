// src/app/api/planes-mejora/[planId]/cerrar/route.js
import { NextResponse } from 'next/server';
import { PlanesMejoraBLL } from '@/modulos/planesMejora/bll/PlanesMejoraBLL';
import { requireRole } from '@/modulos/authentication/be/authMiddleware';

const planesService = new PlanesMejoraBLL();

export async function PUT(request, { params }) {
    const authResult = requireRole(request, ['Supervisor', 'Analista', 'Administrador']);
    if (authResult) return authResult; 
    
    const planId = params.planId;

    try {
        const { estado, resultado } = await request.json();
        
        if (!planId || !estado || !resultado) {
            return NextResponse.json({ success: false, error: 'Faltan parámetros: ID, estado o resultado.' }, { status: 400 });
        }
        await planesService.cerrarPlan(planId, estado, resultado);
        
        return NextResponse.json({ 
            success: true, 
            message: `Plan ${planId} cerrado con éxito.`
        });
        
    } catch (error) {
        console.error('API Error (Cerrar Plan):', error);
        return NextResponse.json({ success: false, error: error.message || 'Error al cerrar el plan.' }, { status: 500 });
    }
}