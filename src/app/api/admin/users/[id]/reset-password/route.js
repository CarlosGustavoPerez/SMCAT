import { resetearClave } from '@/lib/bll/adminBLL';

export async function PUT(request, { params }) {
    try {
        const { id } = params;
        await resetearClave(id);
        return Response.json({ success: true });
    } catch (error) {
        console.error('Error en PUT /api/admin/users/[id]/reset-password:', error);
        return Response.json({ success: false, error: 'Error al resetear la clave' }, { status: 500 });
    }
}