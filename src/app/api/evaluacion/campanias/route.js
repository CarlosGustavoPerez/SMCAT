import { obtenerCampanias } from '@/lib/bll/evaluacionBLL';

// La ruta de la API solo llama a la función del BLL para obtener las campañas.
export async function GET() {
  try {
    const campanias = await obtenerCampanias();
    return Response.json({ success: true, campanias });
  } catch (error) {
    console.error('Error al obtener campañas:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}