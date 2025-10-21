import { NextResponse } from 'next/server';
import { PlanesMejoraBLL } from '@/modulos/planesMejora/bll/PlanesMejoraBLL';
import { requireRole } from '@/modulos/authentication/be/authMiddleware';

const planesService = new PlanesMejoraBLL();

/**
 * REQ-005: Cierra un plan de mejora existente.
 */
export async function PUT(request, { params }) {
    // Roles autorizados para CERRAR un plan (Supervisor o Analista)
    const authResult = requireRole(request, ['Supervisor', 'Analista', 'Administrador']);
    if (authResult) return authResult; 
    
    const planId = params.planId;

    try {
        const { estado, resultado } = await request.json();
        
        if (!planId || !estado || !resultado) {
            return NextResponse.json({ success: false, error: 'Faltan parámetros: ID, estado o resultado.' }, { status: 400 });
        }
        
        // La BLL se encarga de la validación del estado y el guardado
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