import { cambiarEstadoDeEvaluacion } from '@/modulos/dashboard/bll/dashboardBLL';

export async function POST(request) {
  try {
    const { idEvaluacion, nuevoEstado } = await request.json();
    await cambiarEstadoDeEvaluacion(idEvaluacion, nuevoEstado);
    
    return Response.json({ success: true, mensaje: 'Estado actualizado correctamente' });
  } catch (error) {
    console.error('Error en el endpoint de actualización de estado:', error);
    return Response.json({ success: false, error: error.message || 'Error interno del servidor' }, { status: 500 });
  }
}