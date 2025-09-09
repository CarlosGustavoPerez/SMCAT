import { obtenerOperadores } from '@/modulos/evaluaciones/bll/evaluacionBLL';

export async function GET() {
  try {
    const operadores = await obtenerOperadores();

    return Response.json({ success: true, operadores });
  } catch (error) {
    console.error('Error al obtener operadores:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}