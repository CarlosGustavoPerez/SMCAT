import { actualizarUsuario, eliminarUsuario } from '@/modulos/admin/bll/adminBLL';
import { NextResponse } from 'next/server';

export async function PUT(request, context) {
    try {
        const params = await context.params;
        const id = params.id;
        const userData = await request.json();
        await actualizarUsuario(id, userData);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error en PUT /api/admin/users/[id]:', error);
        return NextResponse.json({ success: false, error: 'Error al modificar usuario' }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const params = await context.params;
        const id = params.id;
        await eliminarUsuario(id);
        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Error en DELETE /api/admin/users/[id]:', error);
        return NextResponse.json({ success: false, error: 'Error al eliminar usuario' }, { status: 500 });
    }
}