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
        const result = await crearUsuario(data);
        // result can be either an id or an object { idUsuario, newPassword }
        if (result && typeof result === 'object') {
            return NextResponse.json({ message: 'Usuario agregado exitosamente', idUsuario: result.idUsuario, newPassword: result.newPassword }, { status: 201 });
        }
        return NextResponse.json({ message: 'Usuario agregado exitosamente', idUsuario: result }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
