// src/app/api/planes-mejora/nuevo/route.js

import { NextResponse } from 'next/server';
import { PlanesMejoraBLL } from '@/modulos/planesMejora/bll/PlanesMejoraBLL';
import { requireRole } from '@/modulos/authentication/be/authMiddleware'; // <-- Usamos el nuevo middleware

const planesService = new PlanesMejoraBLL();

export async function POST(request) {
    // Roles autorizados: Supervisor y Analista (quienes típicamente crean evaluaciones y planes)
    const authResult = requireRole(request, ['Supervisor', 'Analista', 'Administrador']);
    if (authResult) return authResult; // Detiene la ejecución si falla la autorización

    try {
        const planData = await request.json();
        // ... (Validación de datos) ...
        
        const nuevoPlan = await planesService.crearPlan(planData);
        
        return NextResponse.json({ 
            success: true, 
            message: 'Plan de Mejora creado con éxito.',
            planId: nuevoPlan.insertId 
        });
        
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error al crear el plan.' }, { status: 500 });
    }
}