import React from "react";
import { useState, useEffect, useRef } from "react";
import { Star, Filter } from "lucide-react";
import Chart from "chart.js/auto"; // Import Chart.js
import {
  obtenerReportes,
  obtenerOperadores,
  obtenerReportesFiltrados,
} from '../lib/services/reportService';
import { calcularPromediosPorOperador } from '../utils/reportUtils';

const Reports = ({ usuario }) => {
  const [reportData, setReportData] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [filters, setFilters] = useState({ dateFrom: '', dateTo: '', operator: '', campaign: '' });
  const [operadoresDisponibles, setOperadoresDisponibles] = useState([]);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (chartData.length === 0) return; // Evita crear gráfico si no hay datos
    // Destruir el gráfico anterior
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

    // Limpiar gráfico al desmontar
    return () => {
      if (chartInstanceRef.current) chartInstanceRef.current.destroy();
    };
  }, [chartData]);

  useEffect(() => {
    const fetchReportData = async () => {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rol: usuario.rol,
          idUsuario: usuario.idUsuario
        })
      });

      const data = await res.json();
      if (data.success) {
        setReportData(data.evaluaciones);

        // Calcular promedio por operador para el gráfico
        const agrupado = {};

        data.evaluaciones.forEach((ev) => {
          const nombre = `${ev.nombreEvaluado} ${ev.apellidoEvaluado}`;
          if (!agrupado[nombre]) {
            agrupado[nombre] = { total: 0, count: 0 };
          }
          const promedio = (ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos) / 3;
          agrupado[nombre].total += promedio;
          agrupado[nombre].count += 1;
        });

        const resumen = Object.entries(agrupado).map(([nombre, datos]) => ({
          operator: nombre,
          avgScore: (datos.total / datos.count).toFixed(1)
        }));

        setChartData(resumen);
      }
    };

    fetchReportData();
  }, []);

  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        const evaluaciones = await obtenerReportes({ rol: usuario.rol, idUsuario: usuario.idUsuario });
        setReportData(evaluaciones);

        const operadores = await obtenerOperadores({ rol: usuario.rol, idUsuario: usuario.idUsuario });
        setOperadoresDisponibles(operadores);

        setChartData(calcularPromediosPorOperador(evaluaciones));
      } catch (err) {
        console.error(err);
      }
    };

    if (usuario) cargarDatosIniciales();
  }, [usuario]);

  const aplicarFiltros = async () => {
    try {
      const evaluacionesFiltradas = await obtenerReportesFiltrados({ ...filters, rol: usuario.rol, idUsuario: usuario.idUsuario });
      setReportData(evaluacionesFiltradas);
      setChartData(calcularPromediosPorOperador(evaluacionesFiltradas));
    } catch (err) {
      console.error(err);
    }
  };

  const calcularPromedios = (evaluaciones) => {
    const acumulador = {};

    evaluaciones.forEach((ev) => {
      const nombre = `${ev.nombreEvaluado} ${ev.apellidoEvaluado}`;
      if (!acumulador[nombre]) {
        acumulador[nombre] = { total: 0, cantidad: 0 };
      }

      const promedio = (
        (ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos) / 3
      );

      acumulador[nombre].total += promedio;
      acumulador[nombre].cantidad += 1;
    });

    return Object.entries(acumulador).map(([nombre, datos]) => ({
      operator: nombre,
      avgScore: (datos.total / datos.cantidad).toFixed(1)
    }));
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hasta</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Operador</label>
            <select
              value={filters.operator}
              onChange={(e) => setFilters({ ...filters, operator: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
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
          >
            <Filter className="h-4 w-4 mr-2" />
            Aplicar Filtros
          </button>

        </div>
      </div>

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
                <th className="text-left py-3 px-4 font-semibold text-gray-600">Observaciones</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">{`${row.nombreEvaluado} ${row.apellidoEvaluado}`}</td>
                  <td className="py-3 px-4">{new Date(row.fechaHora).toLocaleDateString()}</td>
                  <td className="py-3 px-4">{row.puntuacionActitud}</td>
                  <td className="py-3 px-4">{row.puntuacionEstructura}</td>
                  <td className="py-3 px-4">{row.puntuacionProtocolos}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{row.observaciones}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default Reports;
