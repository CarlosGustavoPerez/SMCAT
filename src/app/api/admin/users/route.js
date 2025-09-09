import { NextResponse } from 'next/server';
import { obtenerUsuarios, crearUsuario } from '@/modulos/admin/bll/adminBLL';

export async function GET() {
    try {
        const usuarios = await obtenerUsuarios();
        return NextResponse.json(usuarios, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const data = await request.json();
        const idUsuario = await crearUsuario(data);
        return NextResponse.json({ message: 'Usuario agregado exitosamente', idUsuario }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
