import { obtenerGruposDeUsuario } from '@/modulos/admin/bll/adminBLL';

export async function GET(request, { params }) {
    try {
        const { id } = params;
        const userGroups = await obtenerGruposDeUsuario(id);
        return Response.json(userGroups);
    } catch (error) {
        console.error('Error en GET /api/admin/users/[id]/groups:', error);
        return Response.json({ success: false, error: 'Error al obtener grupos del usuario' }, { status: 500 });
    }
}