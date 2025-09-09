import { NextResponse } from 'next/server';
import { obtenerGrupos, agregarGrupo } from '@/modulos/admin/bll/adminBLL';

export async function GET() {
    try {
        const grupos = await obtenerGrupos();
        return NextResponse.json(grupos, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const idGrupo = await agregarGrupo(data);
        return NextResponse.json({ message: 'Grupo agregado exitosamente', idGrupo }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
