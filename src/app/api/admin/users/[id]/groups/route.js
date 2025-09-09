import { NextResponse } from 'next/server';
import {
    obtenerGruposDeUsuario,
    asignarGrupoAUsuario,
    removerGrupoDeUsuario
} from '@/modulos/admin/bll/adminBLL';

export async function GET(request, context) {
    try {
        const { id } = await context.params;


        if (!id) {
            return NextResponse.json({ error: 'ID de usuario no proporcionado.' }, { status: 400 });
        }
        
        // Usar la variable 'id' corregida en la llamada a la BLL
        const grupos = await obtenerGruposDeUsuario(id);

        if (!grupos || grupos.length === 0) {
            return NextResponse.json({ message: 'No se encontraron grupos para este usuario.' }, { status: 404 });
        }

        return NextResponse.json(grupos);
    } catch (error) {
        console.error('Error en la ruta GET de grupos de usuario:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}

export async function POST(request, context) {
    try {
        const { id } = context.params;
        const { idGrupo } = await request.json();
        console.log(`function POST Asignando grupo ID ${idGrupo} al usuario ID ${id}`);
        if (!id) {
            return NextResponse.json({ error: 'ID de usuario no proporcionado en la URL.' }, { status: 400 });
        }

        if (!idGrupo) {
            return NextResponse.json({ error: 'ID de grupo no proporcionado en el cuerpo de la petición.' }, { status: 400 });
        }
        await asignarGrupoAUsuario(id, idGrupo);
        return NextResponse.json({ message: 'Grupo asignado exitosamente.' });
    } catch (error) {
        console.error('Error en la ruta POST de asignación de grupo:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}

export async function DELETE(request, context) {
    try {
        const { id } = context.params;
        const { idGrupo } = await request.json();

        if (!id || !idGrupo) {
            return NextResponse.json({ error: 'Faltan datos de usuario o grupo.' }, { status: 400 });
        }

        await removerGrupoDeUsuario(id, idGrupo);
        return NextResponse.json({ message: 'Grupo removido exitosamente.' });
    } catch (error) {
        console.error('Error en la ruta DELETE de remoción de grupo:', error);
        return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
    }
}