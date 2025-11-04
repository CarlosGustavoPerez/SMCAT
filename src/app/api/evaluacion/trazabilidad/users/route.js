import { getFiltroOptionsBLL } from '@/modulos/evaluaciones/bll/evaluacionBLL';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const options = await getFiltroOptionsBLL(); 
        return NextResponse.json(options);
    } catch (error) {
        console.error('API Error al obtener opciones de trazabilidad:', error);
        return NextResponse.json(
            { message: 'Error al obtener lista de usuarios para filtros.' }, 
            { status: 500 }
        );
    }
}