// src/app/api/reportes/desempeno/route.js
import { NextResponse } from 'next/server';
import {
    getOperadoresDeTeamLeader,
    getOperadoresAgrupadosPorTeamLeader,
    getUmbralesDesempenoDAL,
} from '@/modulos/dashboard/dal/dashboardDAL';
import { requireRole } from '@/modulos/authentication/be/authMiddleware';
import pool from '@/lib/db';

export async function POST(request) {
    const authResult = requireRole(request, ['Analista', 'TeamLeader', 'Administrador']);
    if (authResult) return authResult;

    try {
        const { grupos, idUsuario, filtro } = await request.json();

        const esAnalista = grupos.some(g => g.nombreGrupo === 'Analista');
        const esTeamLeader = grupos.some(g => g.nombreGrupo === 'TeamLeader');

        const umbrales = await getUmbralesDesempenoDAL(pool);
        const umbralesConColor = umbrales.map(u => ({
            ...u,
            color: u.nombre_nivel === 'Óptimo' ? 'green'
                 : u.nombre_nivel === 'Precaución' ? 'yellow'
                 : 'red'
        }));

        // Analista sin filtro de TL → devuelve lista de TeamLeaders con promedios
        if (esAnalista && !filtro?.idTeamLeader) {
            const data = await getOperadoresAgrupadosPorTeamLeader();
            return NextResponse.json({
                success: true,
                teamLeaders: data,
                operadores: [],
                umbrales: umbralesConColor,
            });
        }

        // Analista con TL seleccionado o TeamLeader → devuelve operadores
        const idTL = filtro?.idTeamLeader || (esTeamLeader ? idUsuario : null);
        if (!idTL) {
            return NextResponse.json({ success: false, error: 'Filtro inválido.' }, { status: 400 });
        }

        const operadores = await getOperadoresDeTeamLeader(idTL);
        const operadoresNorm = operadores.map(op => ({
            ...op,
            promedio: parseFloat(op.promedio) || 0,
            llamadas: parseInt(op.llamadas) || 0,
        }));

        return NextResponse.json({
            success: true,
            teamLeaders: [],
            operadores: operadoresNorm,
            umbrales: umbralesConColor,
        });

    } catch (error) {
        console.error('Error en /api/reportes/desempeno:', error);
        return NextResponse.json({ success: false, error: 'Error interno del servidor.' }, { status: 500 });
    }
}