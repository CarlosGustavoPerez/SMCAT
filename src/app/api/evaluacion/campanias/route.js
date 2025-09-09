import { obtenerCampanias } from '@/modulos/evaluaciones/bll/evaluacionBLL';

export async function GET() {
  try {
    const campanias = await obtenerCampanias();
    return Response.json({ success: true, campanias });
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}