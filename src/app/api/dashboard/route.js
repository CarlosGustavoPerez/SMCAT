import {
  getEvaluacionesByRoleBLL,
  getOperadoresByTeamLeaderBLL,
  getOperadoresAgrupadosPorTeamLeaderBLL, // Importar la nueva función
} from '@/lib/bll/dashboardBLL';

export async function POST(request) {
  try {
    const { grupos, idUsuario, filtro } = await request.json();
    let data;

    const esAnalista = grupos.some((grupo) => grupo.nombreGrupo === 'Analista');
    const esTeamLeader = grupos.some((grupo) => grupo.nombreGrupo === 'TeamLeader');
    const esOperador = grupos.some((grupo) => grupo.nombreGrupo === 'Operador');

    // Analista: Vista inicial de Team Leaders.
    // Esto solo ocurre si es un analista y no hay filtro de idOperador ni idTeamLeader.
    if (esAnalista && !filtro.idOperador && !filtro.idTeamLeader) {
      data = await getOperadoresAgrupadosPorTeamLeaderBLL();
      return Response.json({
        success: true,
        evaluacionesHoy: 0,
        promedioHoy: 0,
        recientes: [],
        operadores: data, // 'operadores' aquí es un array de team leaders
      });
    }

    // Team Leader: Vista inicial con sus propios operadores.
    if (esTeamLeader && !filtro.idOperador) {
      data = await getOperadoresByTeamLeaderBLL(idUsuario);
      const operadoresConPromedioNumerico = data.map(op => ({
        ...op,
        promedio: parseFloat(op.promedio) || 0,
        llamadas: parseInt(op.llamadas) || 0,
      }));
      return Response.json({
        success: true,
        evaluacionesHoy: 0,
        promedioHoy: 0,
        recientes: [],
        operadores: operadoresConPromedioNumerico,
      });
    }
    
    // Vista de operadores para analistas haciendo drill-down.
    // Se activa cuando hay un filtro de idTeamLeader.
    if (esAnalista && filtro.idTeamLeader) {
        data = await getOperadoresByTeamLeaderBLL(filtro.idTeamLeader);
        const operadoresConPromedioNumerico = data.map(op => ({
            ...op,
            promedio: parseFloat(op.promedio) || 0,
            llamadas: parseInt(op.llamadas) || 0,
        }));
        return Response.json({
            success: true,
            evaluacionesHoy: 0,
            promedioHoy: 0,
            recientes: [],
            operadores: operadoresConPromedioNumerico,
        });
    }

    // Caso de drill-down (Analista o Team Leader) o vista de Operador.
    // Aquí se muestran las evaluaciones.
    if (filtro.idOperador) {
        const evaluacionesCompletas = await getEvaluacionesByRoleBLL(filtro);
        const promedioGeneral = evaluacionesCompletas.length > 0
          ? (evaluacionesCompletas.reduce((total, ev) => {
                const sum = ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos;
                return total + sum / 3;
              }, 0) / evaluacionesCompletas.length).toFixed(2)
          : 0;
        const evaluacionesRecientes = evaluacionesCompletas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

        return Response.json({
          success: true,
          promedioHoy: promedioGeneral,
          evaluacionesHoy: evaluacionesCompletas.length,
          recientes: evaluacionesRecientes,
          operadores: [],
        });
    }

    // Operador: Vista inicial con sus propias llamadas.
    if (esOperador) {
      const evaluacionesCompletas = await getEvaluacionesByRoleBLL({ idOperador: idUsuario });
      const promedioGeneral = evaluacionesCompletas.length > 0
        ? (evaluacionesCompletas.reduce((total, ev) => {
              const sum = ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos;
              return total + sum / 3;
            }, 0) / evaluacionesCompletas.length).toFixed(2)
        : 0;
      const evaluacionesRecientes = evaluacionesCompletas.sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

      return Response.json({
        success: true,
        promedioHoy: promedioGeneral,
        evaluacionesHoy: evaluacionesCompletas.length,
        recientes: evaluacionesRecientes,
        operadores: [],
      });
    }

    // Si no se cumple ninguna de las condiciones anteriores.
    return Response.json(
        { success: false, error: 'Acceso no autorizado o rol no reconocido' },
        { status: 403 }
    );

  } catch (error) {
    console.error('Error en el endpoint del dashboard:', error);
    return Response.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
