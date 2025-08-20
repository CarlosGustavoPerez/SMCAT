import { getEvaluacionesByRole } from '@/lib/dal/dashboardDAL';

export async function POST(request) {
  try {
    const { grupos, idUsuario } = await request.json();
    let filtros = {};

    // ✅ CORRECCIÓN: Iteramos sobre el array de grupos para aplicar los filtros
    if (grupos && Array.isArray(grupos)) {
      if (grupos.some(grupo => grupo.nombreGrupo === 'Operador')) {
        console.log('Filtrando por Operador');
        filtros.idOperador = idUsuario;
      }
      if (grupos.some(grupo => grupo.nombreGrupo === 'TeamLeader')) {
        console.log('Filtrando por TeamLeader');
        filtros.idTeamLeader = idUsuario;
      }
      if (grupos.some(grupo => grupo.nombreGrupo === 'Analista')) {
        console.log('Filtrando por Analista');
        // Los analistas ven todas las evaluaciones, por lo que no se necesita filtro de ID.
      }
    }

    // Obtiene las evaluaciones basándose en los filtros dinámicos
    const evaluacionesCompletas = await getEvaluacionesByRole(filtros);

    // Lógica de negocio para calcular el promedio y filtrar evaluaciones
    const promedioGeneral =
      evaluacionesCompletas.length > 0
        ? (evaluacionesCompletas.reduce((total, ev) => {
            const sum = ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos;
            return total + sum / 3;
          }, 0) / evaluacionesCompletas.length).toFixed(2)
        : 0;

    // Obtiene las 10 evaluaciones más recientes
    const evaluacionesRecientes = evaluacionesCompletas
      .sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora))
      .slice(0, 10);

    return Response.json({
      success: true,
      promedioHoy: promedioGeneral,
      evaluacionesHoy: evaluacionesCompletas.length,
      recientes: evaluacionesRecientes,
    });
  } catch (error) {
    console.error('Error en el endpoint del dashboard:', error);
    return Response.json({ success: false, error: 'Error interno del servidor' }, { status: 500 });
  }
}