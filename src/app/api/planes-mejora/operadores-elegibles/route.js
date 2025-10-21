// src/app/api/planes-mejora/operadores-elegibles/route.js

import { NextResponse } from 'next/server';
import { PlanesMejoraBLL } from '@/modulos/planesMejora/bll/PlanesMejoraBLL';
import { requireRole } from '@/modulos/authentication/be/authMiddleware';

const planesService = new PlanesMejoraBLL();

export async function GET(request) {
    const authResult = requireRole(request, ['Supervisor', 'Admin']); 
    if (authResult) return authResult; 

    try {
        const { searchParams } = new URL(request.url);
        const umbralCritico = parseFloat(searchParams.get('umbralCritico')); 

        if (isNaN(umbralCritico)) {
             return NextResponse.json({ success: false, error: 'Umbral crítico inválido.' }, { status: 400 });
        }

        const resultadoBLL = await planesService.obtenerOperadoresElegibles(umbralCritico);
        
        return NextResponse.json({ 
            success: true, 
            operadores: resultadoBLL.operadores,
            mesEvaluado: resultadoBLL.mesEvaluado,
            anioEvaluado: resultadoBLL.anioEvaluado
        });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
    }
}