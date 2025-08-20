import { guardarNuevaEvaluacion } from '@/lib/bll/evaluacionBLL';

export async function POST(req) {
  try {
    const data = await req.json();
    await guardarNuevaEvaluacion(data);
    return Response.json({ success: true, message: 'Evaluación guardada' });
  } catch (error) {
    console.error('Error en la ruta /api/evaluacion/nueva:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}