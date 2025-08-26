import { obtenerTeamLeader } from '@/lib/bll/evaluacionBLL';

// La ruta de la API solo recibe la solicitud y llama al BLL.
export async function POST(req) {
  try {
    // Extrae el idOperador del cuerpo de la solicitud.
    const { idOperador } = await req.json();

    // Llama a la función del BLL que se encarga de la lógica.
    const teamLeader = await obtenerTeamLeader(idOperador);

    // Devuelve la respuesta con el Team Leader obtenido.
    return Response.json({ success: true, teamLeader });
  } catch (error) {
    // Manejo de errores.
    console.error('Error al obtener Team Leader:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}