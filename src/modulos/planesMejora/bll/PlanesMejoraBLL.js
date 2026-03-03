// src/modulos/planesMejora/bll/PlanesMejoraBLL.js
import { getOperadoresBajoRendimiento, crearPlanMejora, getTeamLeaderIdByOperador, getPlanesMejoraActivos, actualizarEstadoPlan, getUmbralCritico } from '@/modulos/planesMejora/dal/PlanesMejoraDAL';
import { notificarTeamLeader } from '@/modulos/notifications/NotificationService';

export class PlanesMejoraBLL {
    
    async obtenerOperadoresElegibles(umbralCritico) {
        if (umbralCritico === undefined || umbralCritico === null) {
            throw new Error("Umbral crítico requerido para la lógica BLL.");
        }
        const hoy = new Date();
        const primerDiaMesActual = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const ultimoDiaMesAnterior = new Date(primerDiaMesActual.getTime() - 1);
        const primerDiaMesAnterior = new Date(ultimoDiaMesAnterior.getFullYear(), ultimoDiaMesAnterior.getMonth(), 1);
        const fechaFin = ultimoDiaMesAnterior.toISOString().split('T')[0];
        const fechaInicio = primerDiaMesAnterior.toISOString().split('T')[0];
        const mesEvaluado = ultimoDiaMesAnterior.getMonth() + 1; // getMonth() es base 0
        const anioEvaluado = ultimoDiaMesAnterior.getFullYear();
        const operadores = await getOperadoresBajoRendimiento(fechaInicio, fechaFin, umbralCritico);
        return {
            operadores,
            mesEvaluado: `${mesEvaluado < 10 ? '0' : ''}${mesEvaluado}`, // 09
            anioEvaluado
        };
    }

    async crearPlan(planData) {
        try {
            const resultadoDB = await crearPlanMejora(planData);
            if (resultadoDB.insertId) {
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
        return umbral !== null ? umbral : 2.5;
    }
}
