import { guardarNuevaEvaluacion } from '@/modulos/evaluaciones/bll/evaluacionBLL';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const data = await req.json();
    const idUsuarioSupervisor = data.idEvaluador;
    
    if (!idUsuarioSupervisor) {
      return NextResponse.json({ success: false, error: 'ID de Evaluador (Auditor) faltante en la solicitud.' }, { status: 400 });
    }
    
    await guardarNuevaEvaluacion(data, idUsuarioSupervisor); 
    
    return NextResponse.json({ success: true, message: 'Evaluación guardada' });
  } catch (error) {
    console.error('Error en la ruta /api/evaluacion/nueva:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}