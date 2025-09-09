import { obtenerTeamLeader } from '@/modulos/evaluaciones/bll/evaluacionBLL';

export async function POST(req) {
  try {
    const { idOperador } = await req.json();
    const teamLeader = await obtenerTeamLeader(idOperador);
    return Response.json({ success: true, teamLeader });
  } catch (error) {
    console.error('Error al obtener Team Leader:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}