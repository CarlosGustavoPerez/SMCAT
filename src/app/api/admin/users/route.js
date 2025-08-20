// src/app/api/admin/users/route.js
// API Route

import { NextResponse } from 'next/server';
import { obtenerUsuarios, crearUsuario } from '@/lib/bll/adminBLL';

/**
 * Maneja las peticiones GET para obtener todos los usuarios.
 * @returns {NextResponse} Respuesta con la lista de usuarios.
 */
export async function GET() {
    try {
        const usuarios = await obtenerUsuarios();
        return NextResponse.json(usuarios, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Maneja las peticiones POST para crear un nuevo usuario.
 * @param {Request} request - La petición HTTP.
 * @returns {NextResponse} Respuesta con el ID del nuevo usuario.
 */
export async function POST(request) {
    try {
        const data = await request.json();
        const idUsuario = await crearUsuario(data);
        return NextResponse.json({ message: 'Usuario agregado exitosamente', idUsuario }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
