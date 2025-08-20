// src/app/api/admin/groups/route.js
// API Route

import { NextResponse } from 'next/server';
import { obtenerGrupos, agregarGrupo } from '@/lib/bll/adminBLL';

/**
 * Maneja las peticiones GET para obtener todos los grupos.
 * @returns {NextResponse} Respuesta con la lista de grupos.
 */
export async function GET() {
    try {
        const grupos = await obtenerGrupos();
        return NextResponse.json(grupos, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Maneja las peticiones POST para agregar un nuevo grupo.
 * @param {Request} request - La petición HTTP.
 * @returns {NextResponse} Respuesta con el ID del nuevo grupo.
 */
export async function POST(request) {
    try {
        const data = await request.json();
        const idGrupo = await agregarGrupo(data);
        return NextResponse.json({ message: 'Grupo agregado exitosamente', idGrupo }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
