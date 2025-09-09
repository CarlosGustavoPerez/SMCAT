import { modificarUsuario, eliminarUsuario } from '@/modulos/admin/bll/adminBLL';

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const userData = await request.json();
        await modificarUsuario(id, userData);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error en PUT /api/admin/users/[id]:', error);
        return Response.json({ success: false, error: 'Error al modificar usuario' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await eliminarUsuario(id);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error en DELETE /api/admin/users/[id]:', error);
        return Response.json({ success: false, error: 'Error al eliminar usuario' }, { status: 500 });
    }
}