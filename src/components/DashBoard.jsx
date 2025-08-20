import React, { useEffect, useState } from 'react';
import { Calendar, ThumbsUp, ThumbsDown, TrendingUp, BarChart3,User,Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { obtenerDashboard, actualizarEstadoEvaluacion } from '../lib/services/dashBoardService';

const Dashboard = ({ usuario }) => {
  const [stats, setStats] = useState({
    evaluacionesHoy: 0,
    promedioHoy: 0,
    recientes: []
  });
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const cargarEvaluaciones = async () => {
      try {
        setIsLoading(true);
        const data = await obtenerDashboard({
          //rol: usuario.rol,
          grupos: usuario.grupos,
          idUsuario: usuario.idUsuario,
        });
        setStats(data);
      } catch (error) {
        console.error('Error al cargar dashboard:', error);
        toast.error(error.message);
      } finally {
                setIsLoading(false);
            }
    };
    cargarEvaluaciones();
  }, [usuario]);
  
  const cambiarEstado = async (idEvaluacion, nuevoEstado) => {
    try {
      await actualizarEstadoEvaluacion(idEvaluacion, nuevoEstado);
      toast.success('Estado actualizado correctamente');
      const data = await obtenerDatosDashboard({
        rol: usuario.rol,
        idUsuario: usuario.idUsuario,
      });
      setStats(data);
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center space-x-2 text-gray-600">
              <User className="h-5 w-5" />
              <span>Hola {usuario.nombre} ({usuario.grupos && usuario.grupos.length > 0 ? 
                usuario.grupos.map(g => g.nombreGrupo).join(', ') : 
                'Sin grupos'})
              </span>
            <Calendar className="h-5 w-5" />
            <span>Hoy, {new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : (
          <>
      

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          <StatCard title="Promedio General" value={stats.promedioHoy} icon={TrendingUp} color="bg-purple-500" />
          <StatCard title="Llamadas Monitoreadas" value={stats.evaluacionesHoy} icon={BarChart3} color="bg-orange-500" /> 
        </div>

        {/* Evaluaciones Recientes */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Evaluaciones Recientes</h2>
          {stats.recientes.length === 0 ? (
            <p className="text-gray-500">No hay evaluaciones recientes.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-gray-600 min-w-[150px] whitespace-nowrap">Operador</th>
                    <th className="text-left py-3 px-4 text-gray-600 min-w-[180px] whitespace-nowrap">Fecha</th>
                    <th className="text-left py-3 px-4 text-gray-600">Duración</th>
                    <th className="text-left py-3 px-4 text-gray-600">Actitud</th>
                    <th className="text-left py-3 px-4 text-gray-600">Estructura</th>
                    <th className="text-left py-3 px-4 text-gray-600">Protocolos</th>
                    <th className="text-left py-3 px-4 text-gray-600 min-w-[150px] whitespace-nowrap">Resultado</th>
                    <th className="text-left py-3 px-4 text-gray-600">Observaciones</th>
                    <th className="text-left py-3 px-4 text-gray-600 min-w-[220px] whitespace-nowrap">Estado</th>

                  </tr>
                </thead>
                <tbody>
                  {stats.recientes.map((ev, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">{ev.nombreEvaluado} {ev.apellidoEvaluado}</td>
                      <td className="py-3 px-4 text-gray-600">{new Date(ev.fechaHora).toLocaleString()}</td>
                      <td className="py-3 px-4 text-gray-600">{ev.duracion}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{ev.puntuacionActitud}/5</td>
                      <td className="py-3 px-4 font-semibold text-green-600">{ev.puntuacionEstructura}/5</td>
                      <td className="py-3 px-4 font-semibold text-purple-600">{ev.puntuacionProtocolos}/5</td>
                      <td className="py-3 px-4">
                          {(() => {
                              const resultado =
                              (ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos) / 3;
                              
                              let texto = '';
                              let colorClass = '';

                              if (resultado === 5) {
                              texto = 'EXCELENTE';
                              colorClass = 'bg-green-100 text-green-800';
                              } else if (resultado >= 4) {
                              texto = 'MUY BUENO';
                              colorClass = 'bg-lime-100 text-lime-800';
                              } else if (resultado >= 3) {
                              texto = 'BUENO';
                              colorClass = 'bg-blue-100 text-blue-800';
                              } else if (resultado >= 2) {
                              texto = 'REGULAR';
                              colorClass = 'bg-yellow-100 text-yellow-800';
                              } else {
                              texto = 'MALO';
                              colorClass = 'bg-red-100 text-red-800';
                              }

                              return (
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
                                  {texto}
                              </span>
                              );
                          })()}
                          </td>

                      <td className="py-3 px-4 text-gray-600">{ev.observaciones}</td>
                      <td className="py-3 px-4 text-center">
                          {(() => {
                              let colorClass = '';

                              switch (ev.estado) {
                              case 'PENDIENTE DE REVISION':
                                  colorClass = 'bg-gray-100 text-gray-800';
                                  break;
                              case 'CERRADA CON CONFORMIDAD':
                                  colorClass = 'bg-green-100 text-green-800';
                                  break;
                              case 'CERRADA SIN CONFORMIDAD':
                                  colorClass = 'bg-red-100 text-red-800';
                                  break;
                              default:
                                  colorClass = 'bg-gray-50 text-gray-600';
                              }

                              const puedeDarConformidad =
                              ev.estado === 'PENDIENTE DE REVISION' &&
                              ev.idEvaluado === usuario.idUsuario;

                              return (
                              <div className="flex flex-col items-center space-y-2">
                                  <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${colorClass}`}
                                  >
                                  {ev.estado}
                                  </span>

                                  {puedeDarConformidad && (
                                  <div className="flex space-x-2">
                                      <button
                                      onClick={() =>
                                          cambiarEstado(ev.idEvaluacion, 'CERRADA CON CONFORMIDAD')
                                      }
                                      title="Dar conformidad"
                                      className="bg-green-100 text-green-800 p-2 rounded-full hover:bg-green-200 transition"
                                      >
                                      <ThumbsUp className="h-5 w-5" />
                                      </button>
                                      <button
                                      onClick={() =>
                                          cambiarEstado(ev.idEvaluacion, 'CERRADA SIN CONFORMIDAD')
                                      }
                                      title="No conforme"
                                      className="bg-red-100 text-red-800 p-2 rounded-full hover:bg-red-200 transition"
                                      >
                                      <ThumbsDown className="h-5 w-5" />
                                      </button>
                                  </div>
                                  )}
                              </div>
                              );
                          })()}
                          </td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      
    </>
      )}
      </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white rounded-xl shadow-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default Dashboard;
