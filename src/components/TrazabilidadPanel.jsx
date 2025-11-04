import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify'; 
import { Loader2, Clock } from 'lucide-react'; 
import EvaluacionHistorial from './EvaluacionHistorial';
import { obtenerTodoElHistorial, obtenerOpcionesDeFiltro } from '@/modulos/dashboard/services/dashBoardService';
const TrazabilidadPanel = ({ usuario }) => {
    const [historialCompleto, setHistorialCompleto] = useState(null);
    const [historialFiltrado, setHistorialFiltrado] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState({
        campo: '',
        valor: ''
    });

    const [opcionesEvaluador, setOpcionesEvaluador] = useState([]);
    const [opcionesEvaluado, setOpcionesEvaluado] = useState([]);
    const [opcionesIdEvaluacion, setOpcionesIdEvaluacion] = useState([]);
    useEffect(() => {
        const cargarDataInicial = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const historialData = await obtenerTodoElHistorial();
                setHistorialCompleto(historialData);
                setHistorialFiltrado(historialData);
                const opcionesData = await obtenerOpcionesDeFiltro();
                setOpcionesEvaluador(opcionesData.evaluadores || []);
                setOpcionesEvaluado(opcionesData.evaluados || []);
                setOpcionesIdEvaluacion(opcionesData.idsEvaluacion || []);

            } catch (err) {
                console.error('Error inicial al cargar datos:', err);
                toast.error('Error inicial al cargar datos: ' + err.message); 
                setError(err.message || 'Error al cargar los datos iniciales.');
            } finally {
                setIsLoading(false);
            }
        };
        cargarDataInicial();
    }, []);

    const aplicarFiltro = useCallback(() => {
        if (!historialCompleto) return; 
        if (!filtro.campo || !filtro.valor) {
            setHistorialFiltrado(historialCompleto);
            return;
        }
        const campoFiltrar = filtro.campo;
        const valorFiltro = filtro.valor;
        const resultado = historialCompleto.filter(item => { 
            const itemValue = item[campoFiltrar];
            if (campoFiltrar === 'idEvaluacion' || campoFiltrar === 'idEvaluador' || campoFiltrar === 'idEvaluado') {
                return String(itemValue) === String(valorFiltro); 
            } else if (campoFiltrar === 'accion' || campoFiltrar === 'estado') {
                return itemValue === valorFiltro;
            }
            return false;
        });
        setHistorialFiltrado(resultado);
    }, [historialCompleto, filtro]); 
    useEffect(() => {
        aplicarFiltro();
    }, [filtro, aplicarFiltro]);
    const listaOpcionesValor = useMemo(() => {
        switch (filtro.campo) {
            case 'idEvaluador':
                return opcionesEvaluador;
            case 'idEvaluado':
                return opcionesEvaluado;
            case 'idEvaluacion':
                return opcionesIdEvaluacion.map(id => ({ id, nombreCompleto: `Evaluación ID ${id}` }));
            default:
                return [];
        }
    }, [filtro.campo, opcionesEvaluador, opcionesEvaluado, opcionesIdEvaluacion]);
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        if (name === 'campo') {
            setFiltro({ campo: value, valor: '' });
        } else {
            setFiltro(prev => ({ ...prev, valor: value }));
        }
    };
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="ml-3 text-xl text-blue-600">Cargando datos de trazabilidad...</p>
            </div>
        );
    }
    if (error) { 
        return (
            <div className="p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg max-w-7xl mx-auto mt-10">
                <h2 className="text-xl font-bold">Error de Carga</h2>
                <p>{error}</p>
            </div>
        );
    }
    return (
        <div className="p-8 bg-gray-50 min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-6">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Trazabilidad de Evaluaciones 🕵️‍♂️
                    </h1>
                </div>
                <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-200 p-6 mb-10">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">Opciones de Filtrado</h2>
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Campo</label>
                            <select 
                                name="campo" 
                                onChange={handleFiltroChange} 
                                className="p-3 border border-gray-300 rounded-xl w-full focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm transition-shadow"
                                value={filtro.campo}
                            >
                                <option value="">FILTRAR POR...</option>
                                <option value="idEvaluacion">ID de Evaluación</option>
                                <option value="idEvaluador">Evaluador</option>
                                <option value="idEvaluado">Evaluado</option>
                                <option value="accion">Tipo de Acción</option>
                                <option value="estado">Estado de la Evaluación</option>
                            </select>
                        </div>
                        {filtro.campo && (
                            <div className="flex-1 w-full">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                                {(filtro.campo === 'accion' || filtro.campo === 'estado') ? (
                                    <select
                                        name="valor"
                                        value={filtro.valor}
                                        onChange={handleFiltroChange} 
                                        className="p-3 border border-gray-300 rounded-xl w-full focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm transition-shadow"
                                    >
                                        <option value="">Seleccionar Valor</option>
                                        {filtro.campo === 'accion' && (
                                            <>
                                                <option value="INSERT">INSERT (Creación)</option>
                                                <option value="UPDATE">UPDATE (Modificación)</option>
                                            </>
                                        )}
                                        {filtro.campo === 'estado' && (
                                            <>
                                                <option value="CERRADA CON CONFORMIDAD">CERRADA CON CONFORMIDAD</option>
                                                <option value="CERRADA SIN CONFORMIDAD">CERRADA SIN CONFORMIDAD</option>
                                                <option value="PENDIENTE DE REVISION">PENDIENTE DE REVISION</option>
                                                <option value="INICIADA">INICIADA</option>
                                            </>
                                        )}
                                    </select>
                                ) : (
                                    <select
                                        name="valor"
                                        value={filtro.valor}
                                        onChange={handleFiltroChange} 
                                        className="p-3 border border-gray-300 rounded-xl w-full focus:ring-blue-500 focus:border-blue-500 text-gray-800 shadow-sm transition-shadow"
                                    >
                                        <option value="">
                                            Seleccionar {filtro.campo === 'idEvaluador' ? 'Evaluador' : filtro.campo === 'idEvaluado' ? 'Evaluado' : 'ID'}
                                        </option>
                                        {listaOpcionesValor.map(opcion => ( 
                                            <option key={opcion.id} value={opcion.id}>
                                                {opcion.nombreCompleto} 
                                                {(filtro.campo !== 'idEvaluacion') && (
                                                    ` (ID: ${opcion.id})`
                                                )}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        )}
                        {(filtro.campo || filtro.valor) && (
                            <button
                                onClick={() => setFiltro({ campo: '', valor: '' })} 
                                className="flex items-center px-6 py-3 bg-red-500 text-white font-semibold rounded-xl hover:bg-red-600 transition-colors shadow-lg w-full sm:w-auto justify-center"
                            >
                                <Clock className="w-4 h-4 mr-2" /> Restablecer
                            </button>
                        )}
                    </div>
                </div>
                <div className="mt-8">
                    {historialFiltrado !== null && historialFiltrado.length > 0 ? (
                        <EvaluacionHistorial historial={historialFiltrado} /> 
                    ) : (
                        historialFiltrado !== null && (
                            <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-lg border border-gray-200">
                                No se encontraron registros que coincidan con los filtros aplicados.
                            </div>
                        )
                    )}
                    {!isLoading && historialFiltrado === null && historialCompleto === null && (
                           <div className="p-8 text-center text-gray-500 bg-white rounded-2xl shadow-lg border border-gray-200">
                                Cargando el historial completo de trazabilidad...
                           </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrazabilidadPanel;