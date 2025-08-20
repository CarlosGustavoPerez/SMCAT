import { obtenerDashboard } from '../services/dashBoardService';
import { actualizarEstadoEvaluacion } from '../dal/dashboardDAL';
import { DashboardStats } from '../be/DashboardStats'; // Tu entidad de negocio

export const obtenerDatosDashboard = async ({ rol, idUsuario }) => {
    // Lógica de negocio (aquí no hay mucha, pero podría haberla)
    const data = await obtenerDashboard({ rol, idUsuario });
    return new DashboardStats(data);
};

export const cambiarEstadoDeEvaluacion = async (idEvaluacion, nuevoEstado) => {
    // Lógica de negocio: validación del estado
    const estadosValidos = ['CERRADA CON CONFORMIDAD', 'CERRADA SIN CONFORMIDAD'];
    if (!estadosValidos.includes(nuevoEstado)) {
        throw new Error('Estado inválido. No se puede actualizar.');
    }

    // Llama a la capa de servicios
    await actualizarEstadoEvaluacion(idEvaluacion, nuevoEstado);
};