import { obtenerOperadores } from '@/lib/bll/evaluacionBLL';

// Esta ruta actúa como un punto de entrada para el frontend.
// Su única responsabilidad es llamar a la capa BLL para obtener los datos.
export async function GET() {
  try {
    // La ruta llama a la función de la BLL para obtener la lógica.
    // La BLL se encarga de la lógica de negocio y de llamar al DAL.
    const operadores = await obtenerOperadores();

    // Si todo es exitoso, devuelve los operadores.
    return Response.json({ success: true, operadores });
  } catch (error) {
    // Manejo de errores centralizado.
    console.error('Error al obtener operadores:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}