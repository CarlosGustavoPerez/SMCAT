// /api/admin/team-leaders/route.js

import { NextResponse } from 'next/server';
import { obtenerTeamLeaders } from '@/modulos/admin/bll/adminBLL';

export async function GET() {
    try {
        const teamLeaders = await obtenerTeamLeaders();
        return NextResponse.json(teamLeaders, { status: 200 });
    } catch (error) {
        console.error('Error en GET /api/admin/team-leaders:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}