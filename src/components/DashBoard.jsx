import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  BarChart3,
  User,
  Loader2,
  ChevronLeft,
  Stars,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { obtenerDashboard, actualizarEstadoEvaluacion } from '../modulos/dashboard/services/dashBoardService';

const StatCard = ({ title, value, icon: Icon, color, onClick, description, statusColorClass, statusBadge }) => (
  <div
        className={`bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 flex flex-col justify-between cursor-pointer 
                    transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
                    ${statusColorClass || 'border-l-4 border-gray-300'} // Borde lateral dinámico
                    border-l-4 pl-8 // Aseguramos el padding y el grosor del borde
                  `}
        onClick={onClick}
    >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-xl shadow-md`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
    {description && (
      <p className="text-sm text-gray-500 mt-2">{description}</p>
    )}
    {statusBadge && (
        <span
            className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold self-start 
                        ${statusBadge.class}`}
        >
            {statusBadge.text}
        </span>
    )}
  </div>
);

const ScoreCard = ({ title, score }) => (
  <div className="flex items-center justify-between border-b pb-2 border-gray-200 last:border-b-0 last:pb-0">
    <span className="text-gray-600 font-medium">{title}</span>
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`h-5 w-5 ${star <= score ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.691h4.168c.969 0 1.371 1.24.588 1.81l-3.375 2.454a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.375-2.454a1 1 0 00-1.176 0l-3.375 2.454c-.785.57-1.84-.197-1.54-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.094 9.385c-.783-.57-.381-1.81.588-1.81h4.168a1 1 0 00.95-.691l1.286-3.957z" />
        </svg>
      ))}
    </div>
  </div>
);

const Dashboard = ({ usuario }) => {
  const [stats, setStats] = useState({
    evaluacionesHoy: 0,
    promedioHoy: 0,
    recientes: [],
    operadores: [],
    teamLeaders: [], // Nuevo estado para los analistas
    llamadasPorOperador: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewLevel, setViewLevel] = useState(null);
  const [selectedTeamLeader, setSelectedTeamLeader] = useState(null); // Nuevo estado
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [umbrales, setUmbrales] = useState([]);
  const isTeamLeaderOrAnalista = usuario.grupos.some(
    (g) => g.nombreGrupo === 'TeamLeader' || g.nombreGrupo === 'Analista'
  );

  const esAnalista = usuario.grupos.some(g => g.nombreGrupo === 'Analista');
  const esTeamLeader = usuario.grupos.some(g => g.nombreGrupo === 'TeamLeader');

  const getUmbralColor = (score, umbralesArray) => {
    if (!umbralesArray || umbralesArray.length === 0 || score === null || score === undefined) {
        return { color: 'gray', nivel: 'Sin Datos' };
    }
    
    const numericScore = parseFloat(score);

    // Buscar el umbral que corresponde
    const umbral = umbralesArray.find(u => {
        const min = parseFloat(u.rango_min);
        
        // Si el score es mayor o igual al mínimo de ese rango, pertenece a ese nivel
        return numericScore >= min;
    });

    // Devolver el color de Tailwind mapeado en la BLL
    if (umbral) {
        const twColor = umbral.color === 'green' ? 'border-green-500' :
                        umbral.color === 'yellow' ? 'border-yellow-500' :
                        'border-red-500';
        return { colorClass: twColor, nivel: umbral.nombre_nivel };
    }
    
    // Default
    return { colorClass: 'border-gray-300', nivel: 'Fuera de Rango' };
  };
  useEffect(() => {
    const cargarVistaInicial = async () => {
      try {
        setIsLoading(true);
        let filtroInicial = {};
        let initialView = 'general';

        if (usuario.grupos.some((grupo) => grupo.nombreGrupo === 'Operador')) {
          filtroInicial.idOperador = usuario.idUsuario;
        } else if (esAnalista) {
          initialView = 'teamleaders';
        } else if (esTeamLeader) {
          filtroInicial.idTeamLeader = usuario.idUsuario;
          initialView = 'operadores';
        }

        const data = await obtenerDashboard({
          grupos: usuario.grupos,
          idUsuario: usuario.idUsuario,
          filtro: filtroInicial,
        });
        if (initialView === 'teamleaders') {
          setStats((prevStats) => ({ ...prevStats, teamLeaders: data.operadores || [] }));
        } else if (initialView === 'operadores') {
          setStats((prevStats) => ({ ...prevStats, operadores: data.operadores || [] }));
        } else {
          setStats((prevStats) => ({
            ...prevStats,
            evaluacionesHoy: data.evaluacionesHoy || 0,
            promedioHoy: data.promedioHoy || 0,
            recientes: data.recientes || [],
          }));
        }
        setViewLevel(initialView);
        setUmbrales(data.umbrales || []);
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    cargarVistaInicial();
  }, [usuario.idUsuario, isTeamLeaderOrAnalista, usuario.grupos, esAnalista, esTeamLeader]);

  const cambiarEstado = async (idEvaluacion, nuevoEstado) => {
    try {
      await actualizarEstadoEvaluacion(idEvaluacion, nuevoEstado);
      toast.success('Estado actualizado correctamente');
      const data = await obtenerDashboard({
        grupos: usuario.grupos,
        idUsuario: usuario.idUsuario,
        filtro: { idOperador: selectedOperator?.idUsuario || usuario.idUsuario },
      });
      setStats((prevStats) => ({
        ...prevStats,
        llamadasPorOperador: data.recientes || [],
      }));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDrillDown = async (id, targetView) => {
    setIsLoading(true);
    let newStats = { ...stats };
    let newViewLevel = targetView;
    let filtro = {};
    let data = null;

    if (targetView === 'operadores') {
        // Lógica para Analistas
        if(esAnalista) {
            filtro = { idTeamLeader: id };
            setSelectedTeamLeader(stats.teamLeaders.find((tl) => tl.idUsuario === id));
        } 
        // Lógica para Team Leaders
        else {
            filtro = { idTeamLeader: usuario.idUsuario };
        }
        
        data = await obtenerDashboard({
            grupos: usuario.grupos,
            idUsuario: usuario.idUsuario,
            filtro: filtro,
        });
        
        newStats = {
            ...stats,
            operadores: data.operadores || [],
        };
        newViewLevel = 'operadores';
    } 
    else if (targetView === 'llamadas') {
        filtro = { idOperador: id };

        data = await obtenerDashboard({
            grupos: usuario.grupos,
            idUsuario: usuario.idUsuario,
            filtro: filtro,
        });
        newStats = { 
            ...stats, 
            llamadasPorOperador: data.recientes || [], 
        };
        setSelectedOperator(stats.operadores.find((op) => op.idUsuario === id));
        newViewLevel = 'llamadas';
    } else if (targetView === 'detalle') {
      setSelectedEvaluation(
        stats.llamadasPorOperador.find((ev) => ev.idEvaluacion === id)
      );
      newViewLevel = 'detalle';
    }
    if (data && data.umbrales) {
        setUmbrales(data.umbrales);
    }
    setStats(newStats);
    setViewLevel(newViewLevel);
    setIsLoading(false);
  };

  const handleDrillUp = () => {
    if (viewLevel === 'detalle') {
      setViewLevel('llamadas');
      setSelectedEvaluation(null);
    } else if (viewLevel === 'llamadas') {
      if (esAnalista) {
        setViewLevel('operadores');
        setSelectedOperator(null);
      } else if (esTeamLeader) {
        setViewLevel('operadores');
        setSelectedOperator(null);
      } else {
        setViewLevel('general');
      }
    } else if (viewLevel === 'operadores') {
      if (esAnalista) {
        setViewLevel('teamleaders');
        setSelectedTeamLeader(null);
      }
    }
  };
  const UmbralesLegend = ({ umbrales }) => {
      const getColorClass = (color) => {
          if (color === 'green') return 'bg-green-500';
          if (color === 'yellow') return 'bg-yellow-500';
          return 'bg-red-500';
      };

      if (!umbrales || umbrales.length === 0) {
          return null;
      }

      return (
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-4 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                Referencia de Umbrales de Desempeño
            </h3>
            <div className="flex flex-wrap gap-4 md:gap-8">
                {umbrales.map((u) => (
                    <div key={u.nombre_nivel} className="flex items-center space-x-2">
                        <span className={`h-4 w-4 rounded-full ${getColorClass(u.color)} shadow-sm`}></span>
                        <span className="text-sm font-medium text-gray-600">
                            {u.nombre_nivel}: 
                            <span className="font-mono text-gray-700 ml-1">
                                {u.rango_max === null ? 'Máx' : u.rango_max} -  {u.rango_min}
                            </span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
      );
    };
  const renderContent = () => {
    if (isLoading || viewLevel === null) {
      return (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      );
    }

    switch (viewLevel) {
      case 'general':
        const generalScore = parseFloat(stats.promedioHoy);
        const generalUmbral = getUmbralColor(generalScore, umbrales);
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 animate-fade-in">
            <StatCard
              title="Promedio de Evaluaciones"
              value={`${stats.promedioHoy} (${stats.evaluacionesHoy} llamadas)`}
              icon={TrendingUp}
              color="bg-gradient-to-br from-purple-500 to-indigo-500"
              onClick={() => handleDrillDown(null, 'llamadas')}
              description={`Nivel: ${generalUmbral.nivel}. Puntuación promedio de todas las llamadas monitoreadas.`} // Añadir nivel
              statusColorClass={generalUmbral.colorClass}
            />
          </div>
        );

      case 'teamleaders':
        return (
          <div className="animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Promedios por Equipos de Trabajo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.teamLeaders && stats.teamLeaders.length > 0 ? (
                stats.teamLeaders.map((tl) => {
                  const tlPromedio = parseFloat(tl.promedio);
                  const tlUmbral = getUmbralColor(tlPromedio, umbrales);
                  return (
                  <StatCard
                    key={tl.idUsuario}
                    title={`Equipo de: ${tl.nombre} ${tl.apellido}`}
                    value={
                            <>
                              Promedio: <b>{parseFloat(tl.promedio).toFixed(2)}</b>
                              <br />
                              ({tl.llamadas} llamadas)
                            </>
                          }
                    icon={Users}
                    color="bg-gradient-to-br from-purple-500 to-pink-500"
                    onClick={() => handleDrillDown(tl.idUsuario, 'operadores')}
                    description={`Nivel: ${tlUmbral.nivel}`}
                    statusColorClass={tlUmbral.colorClass}
                  />
                )})
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
                  <p className="text-gray-500">No se encontraron equipos.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'operadores':
        const tituloOperadores = esAnalista
          ? `Operadores de ${selectedTeamLeader?.nombre} ${selectedTeamLeader?.apellido}`
          : `Operadores de mi Equipo`;
        return (
          <div className="animate-fade-in">
            {stats.teamLeaders && stats.teamLeaders.length > 0 ? (
              <div className="flex items-center mb-6">
                <button
                  onClick={handleDrillUp}
                  className="flex items-center text-gray-600 hover:text-gray-900 transition mr-4 cursor-pointer"
                >
                  <ChevronLeft className="h-5 w-5" />
                  <span className="ml-1 text-sm font-medium">Atrás</span>
                </button>
                <h2 className="text-2xl font-bold text-gray-800">
                  {tituloOperadores}
                </h2>
              </div>
            ) : (
              <div className="flex items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  {tituloOperadores}
                </h2>
            </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.operadores && stats.operadores.length > 0 ? (
                stats.operadores.map((op) => {
                  const opPromedio = parseFloat(op.promedio);
                  const opUmbral = getUmbralColor(opPromedio, umbrales);
                  return (
                  <StatCard
                    key={op.idUsuario}
                    title={`Promedio de llamadas de: ${op.nombre} ${op.apellido}`}
                    value={
                            <>
                              Promedio: <b>{parseFloat(op.promedio).toFixed(2)}</b>
                              <br/>
                              ({op.llamadas} llamadas)
                            </>
                          }
                            // {`Promedio: ${(parseFloat(op.promedio)).toFixed(2)} (${op.llamadas} llamadas)`}
                    icon={User}
                    color="bg-gradient-to-br from-sky-500 to-cyan-500"
                    onClick={() => handleDrillDown(op.idUsuario, 'llamadas')}
                    description={`Nivel: ${opUmbral.nivel}`} // Añadir nivel
                    statusColorClass={opUmbral.colorClass}
                  />
                )})
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
                  <p className="text-gray-500">No se encontraron operadores.</p>
                </div>
              )}
            </div>
          </div>
        );

      case 'llamadas':
        return (
          <div className="animate-fade-in">
            <div className="flex items-center mb-6">
              <button
                onClick={handleDrillUp}
                className="flex items-center text-gray-600 hover:text-gray-900 transition mr-4 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium">Atrás</span>
              </button>
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedOperator
                  ? `Llamadas de ${selectedOperator.nombre} ${selectedOperator.apellido}`
                  : 'Llamadas Recientes'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stats.llamadasPorOperador && stats.llamadasPorOperador.length > 0 ? (
                stats.llamadasPorOperador.map((ev) => {
                  const evPromedio = (
                    (ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos) / 3
                  ).toFixed(2);
                  const llamadasUmbral = getUmbralColor(evPromedio, umbrales);
                  let statusBadgeData;
                    if (ev.estado === 'PENDIENTE DE REVISION') {
                        statusBadgeData = { text: 'PENDIENTE', class: 'bg-yellow-100 text-yellow-800' };
                    } else if (ev.estado === 'CERRADA CON CONFORMIDAD') {
                        statusBadgeData = { text: 'CONFORME', class: 'bg-green-100 text-green-800' };
                    } else if (ev.estado === 'CERRADA SIN CONFORMIDAD') {
                        statusBadgeData = { text: 'NO CONFORME', class: 'bg-red-100 text-red-800' };
                    } else {
                        statusBadgeData = { text: 'Estado Desconocido', class: 'bg-gray-100 text-gray-800' };
                    }
                  return (
                  <StatCard
                    key={ev.idEvaluacion}
                    title={`Fecha: ${new Date(ev.fechaHora).toLocaleDateString()}`}
                    value={`Promedio: ${(
                      (ev.puntuacionActitud +
                        ev.puntuacionEstructura +
                        ev.puntuacionProtocolos) /
                      3
                    ).toFixed(2)}`}
                    icon={Calendar}
                    color="bg-gradient-to-br from-indigo-500 to-blue-500"
                    onClick={() => handleDrillDown(ev.idEvaluacion, 'detalle')}
                    description={`Nivel: ${llamadasUmbral.nivel}`} // Añadir nivel
                    statusColorClass={llamadasUmbral.colorClass}
                    statusBadge={statusBadgeData} // ¡Pasa el nuevo dato!
                  />
                )})
              ) : (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
                  <p className="text-gray-500">No hay llamadas para este operador.</p>
                </div>
              )}
            </div>
          </div>
        );
      case 'detalle':
        const ev = selectedEvaluation;
        if (!ev) {
          return (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow-lg ring-1 ring-gray-200">
              <p className="text-gray-500">No se encontraron los detalles de la evaluación.</p>
            </div>
          );
        }
        return (
          <div className="animate-fade-in">
            <div className="flex items-center mb-6">
              <button
                onClick={handleDrillUp}
                className="flex items-center text-gray-600 hover:text-gray-900 transition mr-4 cursor-pointer"
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="ml-1 text-sm font-medium">Atrás</span>
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Detalles de la Evaluación</h2>
            </div>
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                <p><strong>Operador:</strong> {ev.nombreEvaluado} {ev.apellidoEvaluado}</p>
                {/* <p><strong>Evaluador:</strong> {ev.nombreEvaluador} {ev.apellidoEvaluador}</p> */}
                <p><strong>Fecha:</strong> {new Date(ev.fechaHora).toLocaleString('es-ES')}</p>
                <p><strong>Duración:</strong> {ev.duracion}</p>
              </div>
              <div className="space-y-4">
                <ScoreCard title="Actitud" score={ev.puntuacionActitud} />
                <ScoreCard title="Estructura" score={ev.puntuacionEstructura} />
                <ScoreCard title="Protocolos" score={ev.puntuacionProtocolos} />
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Observaciones</p>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-gray-800">
                  {ev.observaciones}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="font-semibold text-gray-700 mr-2">Estado:</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold
                                ${ev.estado === 'PENDIENTE DE REVISION' ? 'bg-gray-200 text-gray-800' : ''}
                                ${ev.estado === 'CERRADA CON CONFORMIDAD' ? 'bg-green-100 text-green-800' : ''}
                                ${ev.estado === 'CERRADA SIN CONFORMIDAD' ? 'bg-red-100 text-red-800' : ''}
                            `}
                  >
                    {ev.estado}
                  </span>
                </div>
                {ev.estado === 'PENDIENTE DE REVISION' && ev.idEvaluado === usuario.idUsuario && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => cambiarEstado(ev.idEvaluacion, 'CERRADA CON CONFORMIDAD')}
                      title="Dar conformidad"
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-full text-sm hover:bg-green-700 transition-colors shadow-md"
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />Conforme
                    </button>
                    <button
                      onClick={() => cambiarEstado(ev.idEvaluacion, 'CERRADA SIN CONFORMIDAD')}
                      title="No conforme"
                      className="flex items-center px-4 py-2 bg-red-600 text-white rounded-full text-sm hover:bg-red-700 transition-colors shadow-md"
                    >
                      <ThumbsDown className="h-4 w-4 mr-2" />No Conforme
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <UmbralesLegend umbrales={umbrales} />
        {renderContent()}
      </div>
    </div>
  );
};

export default Dashboard;
