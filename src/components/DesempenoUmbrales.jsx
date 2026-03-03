// src/components/DesempenoUmbrales.jsx
"use client";
import React, { useState, useEffect, useRef } from 'react';

import { BarChart3, Users, ChevronLeft, Search, Filter, X } from 'lucide-react';
import { toast } from 'react-toastify';
import Chart from 'chart.js/auto';
import { obtenerDesempeno } from '../modulos/desempeno/services/DesempenoService';
import StatCard from '@/components/StatCard';

const getUmbralInfo = (promedio, umbrales) => {
    if (!umbrales || umbrales.length === 0 || promedio === null || promedio === undefined) {
        return { color: 'gray', colorClass: 'bg-gray-100 text-gray-600', borderClass: 'border-l-gray-300', nivel: 'Sin datos', barColor: '#9CA3AF' };
    }
    const num = parseFloat(promedio);
    const umbral = umbrales.find(u => num >= parseFloat(u.rango_min));
    if (!umbral) return { color: 'gray', colorClass: 'bg-gray-100 text-gray-600', borderClass: 'border-l-gray-300', nivel: 'Fuera de rango', barColor: '#9CA3AF' };

    if (umbral.color === 'green') return { color: 'green', colorClass: 'border-green-500', borderClass: 'border-l-green-500', nivel: umbral.nombre_nivel, barColor: '#10B981' };
    if (umbral.color === 'yellow') return { color: 'yellow', colorClass: 'border-yellow-500', borderClass: 'border-l-yellow-500', nivel: umbral.nombre_nivel, barColor: '#F59E0B' };
    return { color: 'red', colorClass: 'border-red-500', borderClass: 'border-l-red-500', nivel: umbral.nombre_nivel, barColor: '#EF4444' };

};

const UmbralBadge = ({ nivel, colorClass }) => (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colorClass}`}>
        {nivel}
    </span>
);

const GraficoDesempeno = ({ operadores, umbrales }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || operadores.length === 0) return;

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        const labels = operadores.map(op =>
            `${op.nombre} ${op.apellido}`.split(' ').slice(0, 2).join(' ')
        );
        const valores = operadores.map(op => parseFloat(op.promedio));
        const colores = operadores.map(op => getUmbralInfo(op.promedio, umbrales).barColor);
        const niveles = operadores.map(op => getUmbralInfo(op.promedio, umbrales).nivel);

        chartRef.current = new Chart(canvasRef.current, {
            type: 'bar',
            data: {
                labels,
                datasets: [{ data: valores, backgroundColor: colores, borderRadius: 6, barThickness: 22 }]
            },
            options: {
                indexAxis: 'y',
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: (ctx) => {
                                const i = ctx.dataIndex;
                                return [
                                    ` Promedio: ${valores[i].toFixed(2)}`,
                                    ` Llamadas: ${operadores[i].llamadas}`,
                                    ` Nivel: ${niveles[i]}`,
                                ];
                            }
                        }
                    },
                },
                scales: {
                    x: { min: 0, max: 5, ticks: { stepSize: 1, color: '#9CA3AF' }, grid: { color: '#F3F4F6' } },
                    y: { ticks: { color: '#6B7280' }, grid: { display: false } }
                }
            },
        });

        return () => {
            if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
        };
    }, [operadores, umbrales]);

    const altura = Math.max(200, operadores.length * 44 + 40);

    return (
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 mb-6">
            <h3 className="text-base font-semibold text-gray-700 mb-4 flex items-center">
                <BarChart3 className="w-4 h-4 mr-2 text-indigo-500" />
                Visualización de Desempeño
            </h3>
            <div style={{ height: altura, position: 'relative' }}>
                <canvas ref={canvasRef} />
            </div>
        </div>
    );
};

const TablaOperadores = ({ operadores, umbrales }) => {
    if (operadores.length === 0) {
        return (
            <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-12 text-center">
                <Users className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No se encontraron operadores con los filtros aplicados.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50">
                    <tr>
                        {['Operador', 'TeamLeader', 'Promedio', 'Llamadas', 'Nivel'].map(col => (
                            <th key={col} className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {operadores.map((op, i) => {
                        const info = getUmbralInfo(op.promedio, umbrales);
                        return (
                            <tr key={op.idUsuario} className={`border-l-4 ${info.borderClass} hover:bg-gray-50 transition-colors`}>
                                <td className="px-6 py-4 text-sm font-medium text-gray-800">
                                    {op.nombre} {op.apellido}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {op.nombreTeamLeader} {op.apellidoTeamLeader}
                                </td>
                                <td className="px-6 py-4 text-sm font-bold text-gray-800">
                                    {parseFloat(op.promedio).toFixed(2)}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {op.llamadas}
                                </td>
                                <td className="px-6 py-4">
                                    <UmbralBadge nivel={info.nivel} colorClass={info.colorClass} />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

const DesempenoUmbrales = ({ usuario }) => {
    const esAnalista = usuario.grupos.some(g => g.nombreGrupo === 'Analista');
    const esTeamLeader = usuario.grupos.some(g => g.nombreGrupo === 'TeamLeader');

    const [umbrales, setUmbrales] = useState([]);
    const [teamLeaders, setTeamLeaders] = useState([]);
    const [operadores, setOperadores] = useState([]);
    const [selectedTL, setSelectedTL] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [vista, setVista] = useState(esAnalista ? 'teamleaders' : 'operadores');

    const [filtros, setFiltros] = useState({
        nombre: '',
        nivelUmbral: '',
        fechaDesde: '',
        fechaHasta: '',
    });

    // Carga inicial
    useEffect(() => {
        const cargar = async () => {
            setIsLoading(true);
            try {
                const data = await obtenerDesempeno({
                    grupos: usuario.grupos,
                    idUsuario: usuario.idUsuario,
                    filtro: esTeamLeader ? { idTeamLeader: usuario.idUsuario } : {},
                });
                setUmbrales(data.umbrales || []);
                if (esAnalista) setTeamLeaders(data.teamLeaders || []);
                if (esTeamLeader) setOperadores(data.operadores || []);
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoading(false);
            }
        };
        cargar();
    }, []);

    const handleSelectTL = async (tl) => {
        setIsLoading(true);
        setSelectedTL(tl);
        try {
            const data = await obtenerDesempeno({
                grupos: usuario.grupos,
                idUsuario: usuario.idUsuario,
                filtro: { idTeamLeader: tl.idUsuario },
            });
            setOperadores(data.operadores || []);
            setVista('operadores');
        } catch (error) {
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleVolver = () => {
        setVista('teamleaders');
        setSelectedTL(null);
        setOperadores([]);
        setFiltros({ nombre: '', nivelUmbral: '', fechaDesde: '', fechaHasta: '' });
    };

    const limpiarFiltros = () => {
        setFiltros({ nombre: '', nivelUmbral: '', fechaDesde: '', fechaHasta: '' });
    };

    const hayFiltros = Object.values(filtros).some(v => v !== '');

    // Filtrado en cliente
    const operadoresFiltrados = operadores.filter(op => {
        const nombreCompleto = `${op.nombre} ${op.apellido}`.toLowerCase();
        if (filtros.nombre && !nombreCompleto.includes(filtros.nombre.toLowerCase())) return false;
        if (filtros.nivelUmbral) {
            const info = getUmbralInfo(op.promedio, umbrales);
            if (info.nivel !== filtros.nivelUmbral) return false;
        }
        return true;
    });

    const nivelesUnicos = [...new Set(umbrales.map(u => u.nombre_nivel))];

    // Resumen de niveles para el header
    const resumen = operadoresFiltrados.reduce((acc, op) => {
        const info = getUmbralInfo(op.promedio, umbrales);
        acc[info.color] = (acc[info.color] || 0) + 1;
        return acc;
    }, {});

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Cargando datos...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-1">
                        {vista === 'operadores' && esAnalista && (
                            <button onClick={handleVolver} className="flex items-center text-gray-500 hover:text-gray-800 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                        )}
                        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <BarChart3 className="w-6 h-6 text-indigo-600" />
                            Desempeño por Umbrales
                        </h1>
                    </div>
                    <p className="text-gray-500 text-sm ml-9">
                        {vista === 'teamleaders'
                            ? 'Seleccioná un equipo para ver el desempeño individual de sus operadores.'
                            : esTeamLeader
                                ? 'Desempeño de tu equipo'
                                : `Equipo de ${selectedTL?.nombre} ${selectedTL?.apellido}`
                        }
                    </p>
                </div>

                {/* Vista TeamLeaders */}
                {vista === 'teamleaders' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {teamLeaders.length === 0 ? (
                            <div className="col-span-full text-center py-12 bg-white rounded-2xl shadow ring-1 ring-gray-200">
                                <p className="text-gray-500">No se encontraron equipos.</p>
                            </div>
                        ) : teamLeaders.map(tl => {
                            const info = getUmbralInfo(tl.promedio, umbrales);
                            console.log(info)
                            return (
                                <StatCard
                                    key={tl.idUsuario}
                                    title={`Equipo de: ${tl.nombre} ${tl.apellido}`}
                                    value={
                                        <div className="text-2xl">
                                            Promedio: <b>{parseFloat(tl.promedio).toFixed(2)}</b>
                                            <br />
                                            ({tl.llamadas} llamadas)
                                        </div>
                                    }
                                    icon={Users}
                                    color={info.color === 'green' ? 'bg-green-300' : info.color === 'yellow' ? 'bg-yellow-300' : 'bg-red-300'}
                                    onClick={() => handleSelectTL(tl)}
                                    description={`Nivel: ${info.nivel}`}
                                    statusColorClass={info.colorClass}
                                />
                                // <button
                                //     key={tl.idUsuario}
                                //     onClick={() => handleSelectTL(tl)}
                                //     className={`bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-6 text-left 
                                //                border-l-4 ${info.borderClass} hover:shadow-xl hover:scale-[1.02] 
                                //                transition-all duration-200 cursor-pointer`}
                                // >
                                //     <div className="flex items-start justify-between mb-3">
                                //         <div>
                                //             <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">TeamLeader</p>
                                //             <p className="font-bold text-gray-800">{tl.nombre} {tl.apellido}</p>
                                //         </div>
                                //         <div className={`w-10 h-10 rounded-xl flex items-center justify-center 
                                //                         ${info.color === 'green' ? 'bg-emerald-100' : info.color === 'yellow' ? 'bg-amber-100' : 'bg-red-100'}`}>
                                //             <Users className={`w-5 h-5 ${info.color === 'green' ? 'text-emerald-600' : info.color === 'yellow' ? 'text-amber-600' : 'text-red-600'}`} />
                                //         </div>
                                //     </div>
                                //     <div className="flex items-end justify-between">
                                //         <div>
                                //             <p className="text-3xl font-bold text-gray-800">{parseFloat(tl.promedio).toFixed(2)}</p>
                                //             <p className="text-xs text-gray-400 mt-0.5">{tl.llamadas} llamadas evaluadas</p>
                                //         </div>
                                //         <UmbralBadge nivel={info.nivel} colorClass={info.colorClass} />
                                //     </div>
                                // </button>

                            );
                        })}
                    </div>
                )}

                {/* Vista Operadores */}
                {vista === 'operadores' && (
                    <>
                        {/* Resumen de niveles */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {[
                                { color: 'green', label: 'Óptimo', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
                                { color: 'yellow', label: 'Precaución', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
                                { color: 'red', label: 'Crítico', bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
                            ].map(({ color, label, bg, text, border }) => (
                                <div key={color} className={`${bg} border ${border} rounded-xl p-4 text-center`}>
                                    <p className={`text-2xl font-bold ${text}`}>{resumen[color] || 0}</p>
                                    <p className={`text-xs font-medium ${text} mt-0.5`}>{label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Filtros */}
                        <div className="bg-white rounded-2xl shadow-lg ring-1 ring-gray-200 p-5 mb-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Operador</label>
                                    <select
                                        value={filtros.nombre}
                                        onChange={e => setFiltros(p => ({ ...p, nombre: e.target.value }))}
                                        className="w-full py-2 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                                    >
                                        <option value="">-- Todos --</option>
                                        {operadores.map(op => (
                                            <option key={op.idUsuario} value={`${op.nombre} ${op.apellido}`}>
                                                {op.nombre} {op.apellido}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Nivel de umbral</label>
                                    <select
                                        value={filtros.nivelUmbral}
                                        onChange={e => setFiltros(p => ({ ...p, nivelUmbral: e.target.value }))}
                                        className="w-full py-2 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                                    >
                                        <option value="">-- Todos --</option>
                                        {nivelesUnicos.map(n => <option key={n} value={n}>{n}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Desde</label>
                                    <input
                                        type="date"
                                        value={filtros.fechaDesde}
                                        onChange={e => setFiltros(p => ({ ...p, fechaDesde: e.target.value }))}
                                        className="w-full py-2 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Hasta</label>
                                    <input
                                        type="date"
                                        value={filtros.fechaHasta}
                                        onChange={e => setFiltros(p => ({ ...p, fechaHasta: e.target.value }))}
                                        className="w-full py-2 px-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-700"
                                    />
                                </div>
                            </div>
                            {hayFiltros && (
                                <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
                                    <button onClick={limpiarFiltros} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors">
                                        <X className="w-3.5 h-3.5" /> Limpiar filtros
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Gráfico */}
                        {operadoresFiltrados.length > 0 && (
                            <GraficoDesempeno operadores={operadoresFiltrados} umbrales={umbrales} />
                        )}

                        {/* Tabla */}
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm text-gray-500">
                                <span className="font-semibold text-gray-800">{operadoresFiltrados.length}</span> operadores encontrados
                            </p>
                        </div>
                        <TablaOperadores operadores={operadoresFiltrados} umbrales={umbrales} />
                    </>
                )}
            </div>
        </div>
    );
};

export default DesempenoUmbrales;