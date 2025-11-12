// /api/admin/users/[id]/teamleader/route.js
import { NextResponse } from 'next/server';
import { obtenerTeamLeaderDeOperador } from '@/modulos/admin/bll/adminBLL';

export async function GET(request, context) {
    try {
        const { id } = await context.params;
        const idTeamLeader = await obtenerTeamLeaderDeOperador(Number(id));
        return NextResponse.json({ idTeamLeader: idTeamLeader }, { status: 200 });
    } catch (error) {
        console.error('Error en GET /api/admin/users/[id]/teamleader:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}