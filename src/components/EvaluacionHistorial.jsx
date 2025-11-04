import React from 'react';
import { Clock, User, CheckCircle, XCircle, Edit, FilePlus } from 'lucide-react';

const getIconAndColor = (tipoAccion, nuevoEstado) => {
    if (tipoAccion === 'INSERT') {
        return { icon: FilePlus, color: 'bg-indigo-500' };
    }
    if (nuevoEstado === 'CERRADA CON CONFORMIDAD') {
        return { icon: CheckCircle, color: 'bg-green-500' };
    }
    if (nuevoEstado === 'CERRADA SIN CONFORMIDAD') {
        return { icon: XCircle, color: 'bg-red-500' };
    }
    return { icon: Edit, color: 'bg-yellow-500' };
};

const TimelineItem = ({ event, isLast }) => {
    const { icon: Icon, color } = getIconAndColor(event.tipo_accion, event.estado_nuevo);
    const date = new Date(event.fechaHora).toLocaleString('es-ES', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    return (
        <div className="flex relative pb-8">
            {!isLast && (
                <div className="absolute top-4 left-4 h-full w-0.5 bg-gray-200 z-0"></div>
            )}
            <div className={`h-8 w-8 rounded-full ${color} flex items-center justify-center text-white ring-8 ring-white z-10 shadow-md`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="ml-6 flex-1 bg-white p-4 rounded-xl shadow-lg border border-gray-200 transition-all duration-300 hover:shadow-xl">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {event.accion === 'INSERT' ? 'Evaluación Creada por' :
                         'Evaluación Actualizada por'}
                         
                         <span className="font-medium ml-1">{event.actor || event.id_usuario_accion}</span>
                    </h3>
                    <span className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {date}
                    </span>
                </div>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <User className="h-4 w-4 mr-1.5 text-blue-500" />
                    Evaluado: <span className="font-medium ml-1">{event.nombreEvaluado}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1 flex items-center">
                    <User className="h-4 w-4 mr-1.5 text-blue-500" />
                    Evaluado por: <span className="font-medium ml-1">{event.nombreEvaluador}</span>
                </p>
                <div className="flex justify-between items-start">
                    <p className="mt-1 text-sm">
                    <span className="font-bold text-gray-800 ml-2">Estado: {event.estado}</span>
                </p>
                    <span className="text-xs text-gray-500 flex items-center">
                        <p className="mt-1 text-sm">
                        Id evaluación: <span className="font-bold ml-1">
                        {event.idEvaluacion}</span>
                        </p>
                    </span>
                </div>
                

                
            </div>
        </div>
    );
};
const EvaluacionHistorial = ({ historial }) => {
    if (!historial || historial.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-lg">
                No hay registros de auditoría disponibles para esta evaluación.
            </div>
        );
    }
    return (
        <div className="max-w-4xl mx-auto">
             <h2 className="text-3xl font-bold text-gray-800 mb-4 border-b">Historial de Trazabilidad</h2>
             <span className="text-lg font-semibold text-gray-700 px-4 py-1 bg-white rounded-full shadow-md border border-gray-200">
                Total de registros: {historial.length ?? 0}
            </span> 
            <div className="relative pt-4">
                {historial.map((event, index) => (
                    <TimelineItem
                        key={event.id_auditoria}
                        event={event}
                        isLast={index === historial.length - 1}
                    />
                ))}
            </div>
        </div>
    );
};
export default EvaluacionHistorial;