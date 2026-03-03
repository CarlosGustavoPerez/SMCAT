// src/components/UmbralesABM.jsx

"use client";
import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Settings, Save } from 'lucide-react';
import { obtenerRangosDePrecaucion, guardarUmbrales } from '@/modulos/umbrales/services/UmbralesService';

const UmbralesABM = () => {
    const [precaucionMin, setPrecaucionMin] = useState(null); 
    const [precaucionMax, setPrecaucionMax] = useState(null); 
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        const fetchUmbrales = async () => {
            setIsLoading(true);
            try {
                const data = await obtenerRangosDePrecaucion(); 
                setPrecaucionMin(Number(data.precaucion_min));
                setPrecaucionMax(Number(data.precaucion_max));
                
            } catch (error) {
                toast.error('Error al cargar la configuración: ' + error.message);
                setPrecaucionMin(2.50); 
                setPrecaucionMax(3.99);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUmbrales();
    }, []);

    const criticoMax = precaucionMin !== null 
    ? (Number(precaucionMin) - 0.01).toFixed(2)
    : 'N/A';

const optimoMin = precaucionMax !== null 
    ? (Number(precaucionMax) + 0.01).toFixed(2)
    : 'N/A';
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (precaucionMin === null || precaucionMax === null || isNaN(precaucionMin) || isNaN(precaucionMax)) {
            return toast.warn('Por favor, ingrese valores válidos para el rango de Precaución.');
        }
        if (precaucionMin >= precaucionMax) {
            return toast.error('El mínimo de Precaución debe ser estrictamente menor que el máximo.');
        }
        if (precaucionMin < 0.1 || precaucionMax > 4.99) {
            return toast.warn('Los rangos deben estar dentro de los límites lógicos (0.1 a 4.99).');
        }

        setIsSubmitting(true);
        const umbralesAEnviar = {
            precaucion_min: parseFloat(precaucionMin.toFixed(2)),
            precaucion_max: parseFloat(precaucionMax.toFixed(2)),
        };

        try {
            await guardarUmbrales(umbralesAEnviar); // 👈 Función del Service
            toast.success('Rangos de desempeño actualizados con éxito.');
        } catch (error) {
            toast.error(error.message || 'Error al guardar los rangos.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-6 text-center text-gray-500">Cargando configuración...</div>;
    }
    
    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                <Settings className="h-7 w-7 mr-3 text-blue-600" /> Configuración de Umbrales de Desempeño
            </h1>

            <div className="bg-white p-6 rounded-lg shadow-xl">
                <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-800">
                    <p className="font-semibold">Instrucción:</p>
                    <p className="text-sm">Edite el rango de **Precaución**. Los límites de **Crítico** y **Óptimo** se ajustarán automáticamente.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className='border-l-4 border-yellow-500 pl-4'>
                        <label htmlFor="precaucionMin" className="block text-sm font-medium text-red-700 mb-1">
                            1. Umbral Crítico (Rango Mínimo de Precaución)
                        </label>
                        <input
                            type="number"
                            id="precaucionMin"
                            value={precaucionMin !== null ? precaucionMin.toFixed(2) : ''}
                            onChange={(e) => setPrecaucionMin(parseFloat(e.target.value) || 0)}
                            min="0.1"
                            max={precaucionMax !== null ? (precaucionMax - 0.02).toFixed(2) : '4.98'} // Límite dinámico
                            step="0.01"
                            required
                            className="w-full p-3 border border-yellow-300 rounded-md shadow-sm text-lg text-gray-600"
                            disabled={isSubmitting}
                        />
                        <p className="mt-1 text-xs text-gray-500">Valor mínimo para no ser considerado Crítico. Si es 2.50, Crítico va hasta 2.49.</p>
                    </div>
                    <div className='border-l-4 border-green-500 pl-4'>
                        <label htmlFor="precaucionMax" className="block text-sm font-medium text-green-700 mb-1">
                            2. Umbral Óptimo (Rango Máximo de Precaución)
                        </label>
                        <input
                            type="number"
                            id="precaucionMax"
                            value={precaucionMax !== null ? precaucionMax.toFixed(2) : ''}
                            onChange={(e) => setPrecaucionMax(parseFloat(e.target.value) || 0)}
                            min={precaucionMin !== null ? (precaucionMin + 0.02).toFixed(2) : '0.02'} // Límite dinámico
                            max="4.99"
                            step="0.01"
                            required
                            className="w-full p-3 border border-green-300 rounded-md shadow-sm text-lg text-gray-600"
                            disabled={isSubmitting}
                        />
                        <p className="mt-1 text-xs text-gray-500">Valor máximo para no ser considerado Óptimo. Si es 3.99, Óptimo empieza en 4.00.</p>
                    </div>

                    {/* Tabla de Rangos Resultantes (SOLO LECTURA) */}
                    <div className="mt-8">
                        <h3 className="text-lg font-semibold mb-2 text-gray-700">Rangos de Desempeño Resultantes:</h3>
                        <div className="border rounded-lg overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rango Mínimo</th>
                                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rango Máximo</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    <tr className="bg-red-50">
                                        <td className="px-4 py-2 font-medium text-red-800">Crítico</td>
                                        <td className="px-4 py-2 text-gray-600">0.00</td>
                                        <td className="px-4 py-2 font-semibold text-gray-600">{criticoMax}</td>
                                    </tr>
                                    <tr className="bg-yellow-50">
                                        <td className="px-4 py-2 font-medium text-yellow-800">Precaución</td>
                                        <td className="px-4 py-2 font-semibold text-gray-600">{precaucionMin !== null ? precaucionMin.toFixed(2) : 'N/A'}</td>
                                        <td className="px-4 py-2 font-semibold text-gray-600">{precaucionMax !== null ? precaucionMax.toFixed(2) : 'N/A'}</td>
                                    </tr>
                                    <tr className="bg-green-50">
                                        <td className="px-4 py-2 font-medium text-green-800">Óptimo</td>
                                        <td className="px-4 py-2 font-semibold text-gray-600">{optimoMin}</td>
                                        <td className="px-4 py-2 text-gray-600">5.00</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || criticoMax >= optimoMin || precaucionMin >= precaucionMax}
                        className="w-full flex items-center justify-center py-3 px-4 rounded-md shadow-sm text-base font-medium transition duration-150 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
                    >
                        <Save className="h-5 w-5 mr-2" />
                        {isSubmitting ? 'Guardando...' : 'Guardar Rangos'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default UmbralesABM;