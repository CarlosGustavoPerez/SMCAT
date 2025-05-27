"use client";

import React, { useState, useEffect } from 'react';
import { Search, Download, CheckCircle, AlertCircle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Reports = () => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    operator: '',
    campaign: '',
  });

  const [filteredData, setFilteredData] = useState([]);

  // Sample data (aligned with example)
  const reportData = [
    {
      operator: 'Juan Pérez',
      dateTime: '2025-05-15T14:20:00',
      duration: '03:20',
      attitudeScore: 4,
      structureScore: 3,
      protocolScore: 5,
      observations: 'Falta claridad en el cierre',
      campaign: 'Ventas Inbound',
      visualized: false,
    },
    {
      operator: 'María González',
      dateTime: '2025-05-15T15:15:00',
      duration: '02:30',
      attitudeScore: 5,
      structureScore: 4,
      protocolScore: 5,
      observations: 'Excelente manejo del cliente',
      campaign: 'Atención al Cliente',
      visualized: true,
    },
    {
      operator: 'Carlos López',
      dateTime: '2025-05-14T16:45:00',
      duration: '04:12',
      attitudeScore: 3,
      structureScore: 4,
      protocolScore: 3,
      observations: 'Mejorar saludo inicial',
      campaign: 'Soporte Técnico',
      visualized: false,
    },
    {
      operator: 'Ana Martínez',
      dateTime: '2025-05-14T17:00:00',
      duration: '03:18',
      attitudeScore: 5,
      structureScore: 5,
      protocolScore: 4,
      observations: 'Muy profesional y empática',
      campaign: 'Retención',
      visualized: true,
    },
  ];

  // Filter data based on user input
  useEffect(() => {
    let data = reportData;

    if (filters.dateFrom) {
      data = data.filter(
        (item) => new Date(item.dateTime) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      data = data.filter(
        (item) => new Date(item.dateTime) <= new Date(filters.dateTo)
      );
    }
    if (filters.operator) {
      data = data.filter((item) => item.operator === filters.operator);
    }
    if (filters.campaign) {
      data = data.filter((item) => item.campaign === filters.campaign);
    }

    setFilteredData(data);
  }, [filters]);

  // Calculate average scores for chart
  const chartData = {
    labels: [...new Set(filteredData.map((item) => item.operator))],
    datasets: [
      {
        label: 'Promedio de Puntuaciones',
        data: [...new Set(filteredData.map((item) => item.operator))].map(
          (operator) => {
            const operatorData = filteredData.filter(
              (item) => item.operator === operator
            );
            const avgScore =
              operatorData.reduce(
                (sum, item) =>
                  sum +
                  (item.attitudeScore + item.structureScore + item.protocolScore) / 3,
                0
              ) / operatorData.length;
            return avgScore.toFixed(1);
          }
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        max: 5,
        title: {
          display: true,
          text: 'Puntuación Promedio (1-5)',
          color: '#333',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Operadores',
          color: '#333',
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Promedio de Puntuaciones por Operador',
        color: '#333',
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: (context) =>
            `Promedio: ${context.raw} (Actitud, Estructura, Protocolos)`,
        },
      },
    },
  };

  // Export to CSV (simplified, requires library like PapaParse for production)
  const exportToCSV = () => {
    const headers = [
      'Operador',
      'Fecha y Hora',
      'Duración',
      'Actitud',
      'Estructura',
      'Protocolos',
      'Observaciones',
      'Campaña',
      'Visualizada',
    ];
    const rows = filteredData.map((item) => [
      item.operator,
      new Date(item.dateTime).toLocaleString('es-ES', {
        dateStyle: 'short',
        timeStyle: 'short',
      }),
      item.duration,
      item.attitudeScore,
      item.structureScore,
      item.protocolScore,
      item.observations || '-',
      item.campaign,
      item.visualized ? 'Sí' : 'No',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'reporte_evaluaciones.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle visualization confirmation (placeholder)
  const handleVisualize = (index) => {
    const updatedData = [...filteredData];
    updatedData[index].visualized = true;
    setFilteredData(updatedData);
    alert('Visualización confirmada');
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Reportes de Evaluaciones</h1>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label
              htmlFor="dateFrom"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Desde
            </label>
            <input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Fecha de inicio"
            />
          </div>

          <div>
            <label
              htmlFor="dateTo"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Hasta
            </label>
            <input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Fecha de fin"
            />
          </div>

          <div>
            <label
              htmlFor="operator"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Operador
            </label>
            <select
              id="operator"
              value={filters.operator}
              onChange={(e) =>
                setFilters({ ...filters, operator: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Seleccionar operador"
            >
              <option value="">Todos</option>
              <option value="Juan Pérez">Juan Pérez</option>
              <option value="María González">María González</option>
              <option value="Carlos López">Carlos López</option>
              <option value="Ana Martínez">Ana Martínez</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="campaign"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Campaña
            </label>
            <select
              id="campaign"
              value={filters.campaign}
              onChange={(e) =>
                setFilters({ ...filters, campaign: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Seleccionar campaña"
            >
              <option value="">Todas</option>
              <option value="Ventas Inbound">Ventas Inbound</option>
              <option value="Atención al Cliente">Atención al Cliente</option>
              <option value="Soporte Técnico">Soporte Técnico</option>
              <option value="Retención">Retención</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-4">
          <button
            onClick={() =>
              setFilters({ dateFrom: '', dateTo: '', operator: '', campaign: '' })
            }
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
          >
            Limpiar
          </button>
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center"
            aria-label="Aplicar filtros"
          >
            <Search className="h-4 w-4 mr-2" />
            Filtrar
          </button>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Promedio de Puntuaciones por Operador
        </h2>
        {filteredData.length > 0 ? (
          <div className="h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-500">No hay datos para mostrar</p>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Evaluaciones Detalladas
          </h2>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition duration-200 flex items-center"
            aria-label="Exportar a CSV"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Operador
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Fecha y Hora
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Duración
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Actitud
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Estructura
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Protocolos
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Observaciones
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Campaña
                </th>
                <th className="text-left py-3 px-4 font-semibold text-gray-600">
                  Estado
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((row, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">{row.operator}</td>
                    <td className="py-3 px-4">
                      {new Date(row.dateTime).toLocaleString('es-ES', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3 px-4">{row.duration}</td>
                    <td className="py-3 px-4 text-blue-600 font-semibold">
                      {row.attitudeScore}/5
                    </td>
                    <td className="py-3 px-4 text-green-600 font-semibold">
                      {row.structureScore}/5
                    </td>
                    <td className="py-3 px-4 text-purple-600 font-semibold">
                      {row.protocolScore}/5
                    </td>
                    <td className="py-3 px-4">{row.observations || '-'}</td>
                    <td className="py-3 px-4">{row.campaign}</td>
                    <td className="py-3 px-4">
                      {row.visualized ? (
                        <span className="flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Visualizada
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVisualize(index)}
                          className="flex items-center text-yellow-600 hover:text-yellow-700"
                          aria-label={`Confirmar visualización para ${row.operator}`}
                        >
                          
                          <AlertCircle className="h-4 w-4 mr-1" />
                          No Visualizada
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-gray-500">
                    No se encontraron evaluaciones para los filtros seleccionados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;