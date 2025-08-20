import { modificarGrupo, eliminarGrupo } from '@/lib/bll/adminBLL';

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        const groupData = await request.json();
        await modificarGrupo(id, groupData);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error en PUT /api/admin/groups/[id]:', error);
        return Response.json({ success: false, error: 'Error al modificar grupo' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id } = params;
        await eliminarGrupo(id);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error en DELETE /api/admin/groups/[id]:', error);
        return Response.json({ success: false, error: 'Error al eliminar grupo' }, { status: 500 });
    }
}