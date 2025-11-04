import { getAllTrazabilidadBLL } from '@/modulos/evaluaciones/bll/evaluacionBLL';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const historial = await getAllTrazabilidadBLL();
        return NextResponse.json(historial);
    } catch (error) {
        console.error('API Error al obtener trazabilidad completa:', error.message);
        return NextResponse.json({ message: error.message || 'Error interno' }, { status: 500 });
    }
}