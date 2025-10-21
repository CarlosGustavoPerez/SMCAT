import React from "react";
import { useState, useEffect, useRef } from "react";
import { Filter } from "lucide-react";
import Chart from "chart.js/auto"; // Import Chart.js
import { obtenerReportes, obtenerOperadores } from '../modulos/reportes/services/reportService';
import { calcularPromediosPorOperador } from '../lib/utils/reportUtils';

const Reports = ({ usuario }) => {
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', operator: '', campaign: '' });
  const [operadoresDisponibles, setOperadoresDisponibles] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const hayFiltrosAplicados = filters.dateFrom || filters.dateTo || filters.operator;

  useEffect(() => {
        const cargarDatosIniciales = async () => {
            if (!usuario) return; // Se asegura de que el usuario esté disponible
            setIsLoading(true);
            try {
                // Llamadas a la capa de servicios
                const [evaluaciones, operadores] = await Promise.all([
                    obtenerReportes({ grupos: usuario.grupos, idUsuario: usuario.idUsuario }),
                    obtenerOperadores({ grupos: usuario.grupos, idUsuario: usuario.idUsuario })
                ]);
                setReportData(evaluaciones);
                setChartData(calcularPromediosPorOperador(evaluaciones));
                setOperadoresDisponibles(operadores);

            } catch (err) {
                console.error("Error al cargar datos iniciales:", err);
                toast.error("Error al cargar los datos iniciales.");
            } finally {
                setIsLoading(false);
            }
        };

        cargarDatosIniciales();
    }, [usuario]);
    useEffect(() => {
        if (chartRef.current && chartData.length > 0) {
            // Destruir el gráfico anterior para evitar errores
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            // Crear el nuevo gráfico
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: chartData.map(item => item.operator),
                    datasets: [{
                        label: 'Promedio de Puntuaciones',
                        data: chartData.map(item => item.avgScore),
                        backgroundColor: ['#3B82F6', '#10B981', '#8B5CF6'],
                        borderColor: ['#1D4ED8', '#059669', '#6D28D9'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 5,
                            title: {
                                display: true,
                                text: 'Puntuación (0-5)',
                                font: { size: 14 }
                            },
                            ticks: {
                                stepSize: 1
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: 'Operador',
                                font: { size: 14 }
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                label: (context) => `${context.raw}/5`
                            }
                        }
                    }
                }
            });
        }
    }, [chartData]);
const aplicarFiltros = async () => {
        setIsLoading(true);
        try {
            // ✅ CORREGIDO: Llamar a la función del servicio con los filtros
            const evaluacionesFiltradas = await obtenerReportes({ ...filters, grupos: usuario.grupos, idUsuario: usuario.idUsuario });
            console.log('Evaluaciones filtradas:', evaluacionesFiltradas.length);
            setReportData(evaluacionesFiltradas);
            setChartData(calcularPromediosPorOperador(evaluacionesFiltradas));
        } catch (err) {
            console.error("Error al aplicar filtros:", err);
            toast.error("Error al aplicar los filtros.");
        } finally {
            setIsLoading(false);
        }
    };
    const limpiarFiltros = async () => {
    setIsLoading(true);
    try {
        // 1. Resetear el estado de los filtros a su valor inicial
        setFilters({ dateFrom: '', dateTo: '', operator: '', campaign: '' });

        // 2. Volver a cargar los datos iniciales, sin filtros
        const [evaluaciones, operadores] = await Promise.all([
            obtenerReportes({ grupos: usuario.grupos, idUsuario: usuario.idUsuario }),
            obtenerOperadores({ grupos: usuario.grupos, idUsuario: usuario.idUsuario })
        ]);

        setReportData(evaluaciones);
        setChartData(calcularPromediosPorOperador(evaluaciones));
        setOperadoresDisponibles(operadores);
    } catch (err) {
        console.error("Error al limpiar filtros:", err);
        toast.error("Error al limpiar los filtros y cargar los datos.");
    } finally {
        setIsLoading(false);
    }
};
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reportes Detallados</h1>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Desde</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operador</label>
            <select
              value={filters.operator}
              onChange={(e) => setFilters({ ...filters, operator: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-700"
            >
              <option value="">Todos</option>
              {operadoresDisponibles.map((op) => (
                <option
                  key={op.idUsuario}
                  value={`${op.nombre} ${op.apellido}`}
                >
                  {op.nombre} {op.apellido}
                </option>
              ))}
            </select>

          </div>
        </div>

        <div className="flex justify-end mt-4">
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            disabled={isLoading}
          >
            <Filter className="h-4 w-4 mr-2" />
            {isLoading ? 'Cargando...' : 'Aplicar Filtros'}
          </button>
            {hayFiltrosAplicados && (
            <button
              onClick={limpiarFiltros}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? 'Limpiando...' : 'Borrar Filtros'}
            </button>
          )}
        </div>
      </div>
      {isLoading ? (
          <div className="text-center text-gray-500">Cargando datos...</div>
        ) : reportData.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-8">
              No se encontraron registros para los filtros aplicados.
          </div>
        ) : (
          <>
          {/* Gráfico de Barras con Chart.js */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Promedio de Puntuaciones por Operador</h2>
            <div className="h-64">
              <canvas ref={chartRef} className="w-full h-full"></canvas>
            </div>
          </div>

          {/* Tabla de Evaluaciones */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Detalle de Evaluaciones</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Operador</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Fecha</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Actitud</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Estructura</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Protocolos</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-900 text-sm uppercase tracking-wider">Promedio</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-600">Observaciones</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((row, index) => {
                    const averageScore = (row.puntuacionActitud + row.puntuacionEstructura + row.puntuacionProtocolos) / 3;
                    return (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 text-gray-700">
                        <td className="py-3 px-4 ">{`${row.nombreEvaluado} ${row.apellidoEvaluado}`}</td>
                        <td className="py-3 px-4">{new Date(row.fechaHora).toLocaleDateString()}</td>
                        <td className="py-3 px-4">{row.puntuacionActitud}</td>
                        <td className="py-3 px-4">{row.puntuacionEstructura}</td>
                        <td className="py-3 px-4">{row.puntuacionProtocolos}</td>
                        <td className="py-3 px-4 font-bold text-blue-700">{averageScore.toFixed(2)}</td>
                        <td className="py-3 px-4 text-sm">{row.observaciones}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
  
        </>
      )}
    </div>
  );
};
export default Reports;
