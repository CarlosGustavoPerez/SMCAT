// src/components/PlanMejora.jsx

"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { obtenerOperadoresElegibles, crearPlanMejora,obtenerTodosLosPlanes,obtenerUmbralCritico  } from '@/modulos/planesMejora/services/PlanesMejoraService';
import { User, Calendar, Save, List, Clock, CheckCircle } from 'lucide-react';

const PlanMejora = ({ usuario }) => {
    // El idUsuario actual será el supervisor_id en la base de datos
    const supervisorId = usuario?.idUsuario; 
    const [mesEvaluadoInfo, setMesEvaluadoInfo] = useState(null);
    const [operadoresElegibles, setOperadoresElegibles] = useState([]);
    const [isLoadingOperadores, setIsLoadingOperadores] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [planesActivos, setPlanesActivos] = useState([]); // <-- AGREGAR ESTADO PARA LOS PLANES
    const [isPlanesLoading, setIsPlanesLoading] = useState(true); // <-- AGREGAR ESTADO DE CARGA PARA PLANES
    const [umbralCritico, setUmbralCritico] = useState(null);
    const [planData, setPlanData] = useState({
        operador_id: '',
        objetivos: '',
        acciones_correctivas: '',
        fecha_finalizacion: ''
    });

    useEffect(() => {
        const fetchUmbral = async () => {
            try {
                const umbral = await obtenerUmbralCritico(); 
                setUmbralCritico(umbral); 
            } catch (error) {
                 toast.error('Error al cargar la configuración de umbrales.');
                 setUmbralCritico(3.0); // Valor de fallback
            }
        };
        fetchUmbral();
    }, [])
    useEffect(() => {
        const cargarOperadores = async () => {
            if (!supervisorId || umbralCritico === null) return;
            setIsLoadingOperadores(true);
            try {
                const resultado = await obtenerOperadoresElegibles(umbralCritico);
                setOperadoresElegibles(resultado.operadores);
                setMesEvaluadoInfo({
                    mes: resultado.mesEvaluado,
                    anio: resultado.anioEvaluado
                });
                if (resultado.operadores.length > 0) {
                    setPlanData(prev => ({ ...prev, operador_id: resultado.operadores[0].idUsuario }));
                }
            } catch (error) {
                toast.error(error.message);
            } finally {
                setIsLoadingOperadores(false);
            }
        };
             cargarOperadores();
    }, [supervisorId, umbralCritico]);



    const cargarPlanesActivos = async () => {
        setIsPlanesLoading(true);
        try {
            const data = await obtenerTodosLosPlanes(); 
            setPlanesActivos(data);
        } catch (error) {
            toast.error('Error al cargar la lista de planes activos.');
        } finally {
            setIsPlanesLoading(false);
        }
    };
    useEffect(() => {
        cargarPlanesActivos();
    }, []);

    if (isLoadingOperadores) { // Cambiado de 'isLoading' a 'isLoadingOperadores'
        return <div className="p-6 text-center text-gray-500">Cargando operadores elegibles...</div>;
    }
    const handleChange = (e) => {
        setPlanData({ ...planData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!planData.operador_id || !planData.objetivos || !planData.acciones_correctivas || !planData.fecha_finalizacion) {
            return toast.warn('Por favor, complete todos los campos requeridos para el plan.');
        }

        setIsSubmitting(true);

        const dataToSend = {
            ...planData,
            supervisor_id: supervisorId,
            // Aseguramos que operador_id sea un número, ya que el select devuelve un string
            operador_id: parseInt(planData.operador_id), 
        };

        try {
            await crearPlanMejora(dataToSend);
            toast.success('Plan de Mejora creado con éxito. El Team Leader ha sido notificado.');
            
            // Limpiar formulario y quitar el operador de la lista de elegibles
            setPlanData({ operador_id: '', objetivos: '', acciones_correctivas: '', fecha_finalizacion: '' });
            setOperadoresElegibles(op => op.filter(o => o.idUsuario !== dataToSend.operador_id));

        } catch (error) {
            // Maneja el error que viene de la API Route (ej. "Error al guardar...")
            toast.error(error.message || 'Error desconocido al crear el plan.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoadingOperadores) {
        return <div className="p-6 text-center text-gray-500">Cargando operadores elegibles...</div>;
    }

    // Aquí se renderizaría la otra vista (Tabla de planes activos) si se cambia la vista interna
    const renderPlanCreationForm = () => (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Selector de Operador */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <User className="h-4 w-4 mr-2" /> Operador a Evaluar
                    </label>
                    <select
                        name="operador_id"
                        value={planData.operador_id}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                        disabled={operadoresElegibles.length === 0}
                    >
                        {operadoresElegibles.length === 0 ? (
                            <option value="">No hay operadores con bajo rendimiento</option>
                        ) : (
                            operadoresElegibles.map(op => (
                                <option key={op.idUsuario} value={op.idUsuario}>
                                    {op.nombre} {op.apellido} (Promedio: {op.promedio})
                                </option>
                            ))
                        )}
                    </select>
                </div>

                {/* Fecha de Finalización (Criterio de Aceptación) */}
                <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" /> Fecha de Finalización
                    </label>
                    <input
                        type="date"
                        name="fecha_finalizacion"
                        value={planData.fecha_finalizacion}
                        onChange={handleChange}
                        required
                        min={new Date().toISOString().split('T')[0]} // No permitir fechas pasadas
                        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                    />
                </div>
            </div>

            {/* Objetivos */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Objetivos del Plan
                </label>
                <textarea
                    name="objetivos"
                    placeholder="Escriba los objetivos específicos y medibles para el operador."
                    value={planData.objetivos}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
            </div>

            {/* Acciones Correctivas */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acciones Correctivas (Pasos a seguir)
                </label>
                <textarea
                    name="acciones_correctivas"
                    placeholder="Describa las acciones correctivas específicas que deberá realizar el operador (e.g., coaching, capacitación)."
                    value={planData.acciones_correctivas}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-700"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting || operadoresElegibles.length === 0}
                className={`w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition duration-150 ${
                    isSubmitting || operadoresElegibles.length === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                }`}
            >
                <Save className="h-5 w-5 mr-2" />
                {isSubmitting ? 'Creando Plan...' : 'Crear Plan de Mejora'}
            </button>
        </form>
    );
    // Componente auxiliar para formatear la tabla de planes activos
    const PlanesActivosTable = ({ planes, isLoading }) => {
        if (isLoading) {
            return <div className="p-4 text-center text-gray-500">Cargando planes activos...</div>;
        }

        if (planes.length === 0) {
            return <div className="p-4 text-center text-gray-500 border border-gray-200 rounded-lg">No hay planes de mejora registrados.</div>;
        }

        const getStatusStyle = (estado) => {
            switch (estado) {
                case 'Activo':
                    return 'bg-green-100 text-green-800';
                case 'Finalizado':
                    return 'bg-blue-100 text-blue-800';
                default:
                    return 'bg-gray-100 text-gray-800';
            }
        };
        
        const formatDate = (dateString) => {
            if (!dateString) return 'N/A';
            // Asumiendo formato YYYY-MM-DD
            return new Date(dateString).toLocaleDateString('es-AR');
        };

        return (
            <div className="overflow-x-auto mt-6 border rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Operador</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Supervisor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F. Creación</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">F. Límite</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {planes.map((plan) => (
                            <tr key={plan.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {plan.id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <User className="h-4 w-4 inline mr-1 text-blue-500"/>
                                    {plan.nombreOperador} {plan.apellidoOperador}
                                    <p className="text-xs text-gray-400 truncate">Objetivo: {plan.objetivos.substring(0, 40)}...</p>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {plan.nombreSupervisor} {plan.apellidoSupervisor}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(plan.fecha_creacion)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-700">
                                    <Calendar className="h-4 w-4 inline mr-1 text-gray-500"/>
                                    {formatDate(plan.fecha_finalizacion)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(plan.estado)}`}>
                                        {plan.estado}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                <span>Gestión de Planes de Mejora </span>
                
            </h1>
            
            <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="mb-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-blue-600 flex items-center">
                        <List className="h-5 w-5 mr-2" />
                        
                        {mesEvaluadoInfo && (
                    <span className="text-lg font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full shadow-md">
                        Mes Evaluado: {mesEvaluadoInfo.mes}/{mesEvaluadoInfo.anio}
                    </span>
                )}
                    </h2>
                </div>
                {renderPlanCreationForm()}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="mb-4">
                    <h2 className="text-xl font-semibold text-blue-600 flex items-center">
                        <CheckCircle className="h-5 w-5 mr-2" /> 
                        Monitoreo de Todos los Planes
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Listado completo de planes generados (Activos y Finalizados).
                    </p>
                </div>
                <PlanesActivosTable planes={planesActivos} isLoading={isPlanesLoading} />
            </div>


        </div>
    );
};

export default PlanMejora;