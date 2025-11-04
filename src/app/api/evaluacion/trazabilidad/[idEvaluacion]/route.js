import { getTrazabilidadEvaluacionBLL } from '@/modulos/evaluaciones/bll/evaluacionBLL';
import { NextResponse } from 'next/server';
export async function GET(request, { params }) {
    const { idEvaluacion } = params;
    
    try {
        const id = parseInt(idEvaluacion, 10);
        if (isNaN(id)) {
            return NextResponse.json({ message: 'ID de Evaluación inválido.' }, { status: 400 });
        }
        const historial = await getTrazabilidadEvaluacionBLL(id);
        return NextResponse.json(historial);
    } catch (error) {
        console.error('API Error al obtener trazabilidad:', error.message);
        return NextResponse.json({ message: error.message || 'Error interno del servidor' }, { status: 500 });
    }
}