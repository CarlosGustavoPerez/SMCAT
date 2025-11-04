import { getOperadoresBajoRendimiento, crearPlanMejora, getTeamLeaderIdByOperador, getPlanesMejoraActivos, actualizarEstadoPlan, getUmbralCritico } from '@/modulos/planesMejora/dal/PlanesMejoraDAL';
import { notificarTeamLeader } from '@/modulos/notifications/NotificationService';

export class PlanesMejoraBLL {
    
    async obtenerOperadoresElegibles(umbralCritico) {
        if (umbralCritico === undefined || umbralCritico === null) {
            throw new Error("Umbral crítico requerido para la lógica BLL.");
        }

        const hoy = new Date();
        
        // 1. Calcular el PRIMER DÍA del mes ACTUAL
        const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        
        // 2. Calcular el ÚLTIMO DÍA del mes ANTERIOR
        // Restamos un milisegundo al primer día del mes actual para obtener el último día del mes anterior
        const ultimoDiaMesAnterior = new Date(primerDiaMesActual.getTime() - 1);
        
        // 3. Calcular el PRIMER DÍA del mes ANTERIOR
        const primerDiaMesAnterior = new Date(ultimoDiaMesAnterior.getFullYear(), ultimoDiaMesAnterior.getMonth(), 1);
        
        // Formateo a YYYY-MM-DD para la consulta SQL
        const fechaFin = ultimoDiaMesAnterior.toISOString().split('T')[0];
        const fechaInicio = primerDiaMesAnterior.toISOString().split('T')[0];
        
        const mesEvaluado = ultimoDiaMesAnterior.getMonth() + 1; // getMonth() es base 0
        const anioEvaluado = ultimoDiaMesAnterior.getFullYear();
        
        console.log(`Evaluando rendimiento del mes ${mesEvaluado}/${anioEvaluado} (entre ${fechaInicio} y ${fechaFin}) con umbral < ${umbralCritico}`);

        // 1. Obtener operadores con bajo rendimiento en el periodo
        // Pasamos las fechas y el umbral al DAL
        const operadores = await getOperadoresBajoRendimiento(fechaInicio, fechaFin, umbralCritico);
        
        // Retornamos los operadores y la información del mes para el frontend
        return {
            operadores,
            mesEvaluado: `${mesEvaluado < 10 ? '0' : ''}${mesEvaluado}`, // 09
            anioEvaluado
        };
    }

    async crearPlan(planData) {
        try {
            // 1. Guardar el plan
            const resultadoDB = await crearPlanMejora(planData);
            
            if (resultadoDB.insertId) {
                // 2. Criterio de Aceptación: Notificar automáticamente al Team Leader
                const teamLeaderId = await getTeamLeaderIdByOperador(planData.operador_id); 
                
                if (teamLeaderId) {
                    await notificarTeamLeader(teamLeaderId, `Nuevo Plan de Mejora ID ${resultadoDB.insertId} asignado al Operador ${planData.operador_id}.`);
                } else {
                    console.warn(`No se encontró Team Leader para el operador ${planData.operador_id}. No se envió notificación.`);
                }
            }
            return resultadoDB;
        } catch (error) {
            console.error('Error en la creación del plan de mejora:', error);
            throw new Error('Fallo al persistir el plan de mejora.');
        }
    }
    
    
    async obtenerTodosLosPlanes() {
        return await getPlanesMejoraActivos();
    }

    async cerrarPlan(planId, nuevoEstado, resultado) {
        return await actualizarEstadoPlan(planId, nuevoEstado, resultado);
    }

    async obtenerUmbralCritico() {
        const umbral = await getUmbralCritico();
        
        // Lógica de negocio: si no se encuentra en la DB, asumimos el valor por defecto (ej. 3.0)
        return umbral !== null ? umbral : 2.5;
    }

}
