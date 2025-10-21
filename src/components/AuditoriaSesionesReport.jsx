// src/modulos/auditoria/components/AuditoriaSesionesReport.js

import React, { useState, useEffect,useCallback } from 'react';
import { getAuditoriaSesiones, getFilterOptions } from '@/modulos/auditoria/services/auditoriaService';
import { toast } from 'react-toastify';
// Importa tu componente de Tabla/Grid

const AuditoriaSesionesReport = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [triggerSearch, setTriggerSearch] = useState(0);
    const [opcionesFiltro, setOpcionesFiltro] = useState({
        usuarios: [],
        eventos: []
    });
    const [filtros, setFiltros] = useState({
        usuario: '',
        tipoEvento: '',
        fechaDesde: '',
        fechaHasta: '',
        busquedaGeneral: ''
    });
    useEffect(() => {
        const loadOptions = async () => {
            try {
                const response = await getFilterOptions();
                setOpcionesFiltro({
                    usuarios: response.usuariosUnicos,
                    eventos: response.tiposEventoUnicos
                });
            } catch (error) {
                console.error('Fallo al cargar las opciones de filtro:', error);
                toast.error('Fallo al cargar las opciones de filtro:', error.message);
            }
        };
        loadOptions();
        
        // La carga de datos principal (loadData) también debe ocurrir aquí al inicio
        // aunque el useEffect de loadData/[loadData, triggerSearch] ya se encarga.
    }, []);
    const loadData = useCallback(async () => {
        setLoading(true);
        const params = new URLSearchParams(filtros).toString();
        
        try {
            const response = await getAuditoriaSesiones(params);
            setData(response.sesiones);
            // Si la búsqueda fue exitosa, pero no encontró resultados:
            if (response.sesiones.length === 0) {
                 toast('No se encontraron registros con los filtros aplicados.', { icon: '🔍' });
            }
        } catch (error) {
            // --- CAPTURA EL ERROR LANZADO POR EL SERVICE ---
            console.error('Fallo al cargar la auditoría:', error.message);
            setData([]); // Limpia la tabla en caso de error
            // Muestra el mensaje de error específico (ej. "La fecha Desde...")
            toast.error(error.message);
            handleClearFilters();
            setTriggerSearch(prev => prev + 1);
            
        } finally {
            setLoading(false);
        }
    }, [filtros]);

    // Ejecutar la carga inicial y cada vez que los filtros cambien
    useEffect(() => {
        loadData();
    }, [loadData, triggerSearch]);
    
    // Manejador genérico de cambios en los filtros
    const handleFilterChange = (name, value) => {
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleClearFilters = () => {
        setFiltros({ usuario: '', tipoEvento: '', fechaDesde: '', fechaHasta: '', busquedaGeneral: '' });
        setTriggerSearch(prev => prev + 1);
    };

    // La función getRowStyle se adaptará para usar clases o estilos más discretos.
    const getRowStyle = (evento) => {
        switch (evento) {
            case 'LOGIN_FALLIDO':
                return 'bg-red-50 hover:bg-red-100'; // Clases Tailwind para rojo suave
            case 'LOGIN_EXITOSO':
                return 'bg-green-50 hover:bg-green-100'; // Clases Tailwind para verde suave
            default: // LOGOUT y otros
                return 'hover:bg-gray-50';
        }
    };

    // Definición de las columnas (se mantiene igual)
    const columns = [
        { header: 'Fecha y Hora', accessor: 'fechaHora' },
        { header: 'Usuario', accessor: 'nombreUsuario' },
        { header: 'Evento', accessor: 'tipoEvento' },
        { header: 'IP Origen', accessor: 'ipOrigen' },
        { header: 'Detalle', accessor: 'detalle' },
    ];
    
    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Trazabilidad Detallada de Sesiones</h2>
            
            {/* -------------------- SECCIÓN DE FILTROS (Moderno) -------------------- */}
            <div className="bg-white p-5 rounded-xl shadow-lg mb-6">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    
                    {/* Filtro 1: Usuario */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
                        <select 
                            value={filtros.usuario} 
                            onChange={(e) => handleFilterChange('usuario', e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10 text-gray-500"
                        >
                            <option value="">-- Todos --</option>
                            {opcionesFiltro.usuarios.map(user => (
                                <option key={user} value={user}>{user}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro 2: Tipo de Evento */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Evento</label>
                        <select 
                            value={filtros.tipoEvento} 
                            onChange={(e) => handleFilterChange('tipoEvento', e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10 text-gray-500"
                        >
                            <option value="">-- Todos --</option>
                            {opcionesFiltro.eventos.map(evento => (
                                <option key={evento} value={evento}>{evento}</option>
                            ))}
                        </select>
                    </div>

                    {/* Filtro 3: Fecha Desde */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input 
                            type="date"
                            value={filtros.fechaDesde}
                            onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10 text-gray-500"
                        />
                    </div>
                    
                    {/* Filtro 4: Fecha Hasta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input 
                            type="date"
                            value={filtros.fechaHasta}
                            onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10 text-gray-500"
                        />
                    </div>

                    {/* Filtro 5: Búsqueda General */}
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Búsqueda General (IP, Navegador, Detalle)</label>
                        <input 
                            type="text"
                            placeholder="Buscar..."
                            value={filtros.busquedaGeneral}
                            onChange={(e) => handleFilterChange('busquedaGeneral', e.target.value)}
                            className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm h-10 text-gray-500"
                        />
                    </div>
                </div>

                {/* Botones de Acción de Filtro */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-gray-200">
                    <button 
                        onClick={handleClearFilters}
                        disabled={loading}
                        className="flex items-center bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 transition duration-200"
                    >
                        {/* <FaRotateCcw className="h-4 w-4 mr-2" /> */}
                        Limpiar Filtros
                    </button>
                    
                </div>
            </div>
            
            {/* ----------------- TABLA DE RESULTADOS ----------------- */}

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                    <p className="text-sm text-gray-600">Total de registros encontrados: <strong className="text-gray-800">{data.length}</strong></p>
                </div>

                {loading ? (
                    <p className="p-6 text-center text-blue-600">Cargando datos de auditoría...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    {columns.map(col => (
                                        <th 
                                            key={col.accessor} 
                                            className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                                            style={{ minWidth: col.width || 'auto' }}
                                        >
                                            {col.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data.map((row) => (
                                    <tr 
                                        key={row.idAuditoria} 
                                        className={getRowStyle(row.tipoEvento)} // Aplica clases condicionales
                                    >
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-600">
                                            {new Date(row.fechaHora).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {row.nombreUsuario}
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${row.tipoEvento === 'LOGIN_FALLIDO' ? 'bg-red-100 text-red-800' : 
                                                  row.tipoEvento === 'LOGIN_EXITOSO' ? 'bg-green-100 text-green-800' : 
                                                  'bg-blue-100 text-blue-800'}`}
                                            >
                                                {row.tipoEvento.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-500">
                                            {row.ipOrigen}
                                        </td>
                                        
                                        <td className="px-6 py-3 text-xs text-gray-500 max-w-xs truncate" title={row.detalle}>
                                            {row.detalle || '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuditoriaSesionesReport;