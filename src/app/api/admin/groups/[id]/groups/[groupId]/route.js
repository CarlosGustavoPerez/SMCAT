import { asignarGrupoAUsuario, removerGrupoDeUsuario } from '@/modulos/admin/bll/adminBLL';

export async function POST(request, { params }) {
    try {
        const { id: userId, groupId } = params;
        await asignarGrupoAUsuario(userId, groupId);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error en POST /api/admin/users/[id]/groups/[groupId]:', error);
        return Response.json({ success: false, error: 'Error al asignar grupo' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    try {
        const { id: userId, groupId } = params;
        await removerGrupoDeUsuario(userId, groupId);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error en DELETE /api/admin/users/[id]/groups/[groupId]:', error);
        return Response.json({ success: false, error: 'Error al remover grupo' }, { status: 500 });
    }
}