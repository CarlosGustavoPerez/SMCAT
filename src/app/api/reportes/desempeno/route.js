// src/app/api/reportes/desempeno/route.js
import { NextResponse } from 'next/server';
import { getDesempenoBLL } from '@/modulos/dashboard/bll/dashboardBLL';
import { requireRole } from '@/modulos/authentication/be/authMiddleware';

export async function POST(request) {
    const authResult = requireRole(request, ['Analista', 'TeamLeader', 'Administrador']);
    if (authResult) return authResult;

    try {
        const { grupos, idUsuario, filtro } = await request.json();

        const data = await getDesempenoBLL({ grupos, idUsuario, filtro });

        return NextResponse.json({ success: true, ...data });

    } catch (error) {
        console.error('Error en /api/reportes/desempeno:', error);
        const esValidacion = error.message === 'Filtro inválido.';
        return NextResponse.json(
            { success: false, error: error.message || 'Error interno del servidor.' },
            { status: esValidacion ? 400 : 500 }
        );
    }
}