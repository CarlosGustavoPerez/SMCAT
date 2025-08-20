import { obtenerEvaluacionesDB, obtenerOperadoresDB } from '@/lib/dal/reportDAL';

// Capa de Lógica de Negocio (BLL) - Contiene las reglas de la aplicación.
// Se comunica con la DAL y puede realizar validaciones o transformaciones de datos.

/**
 * Obtiene los reportes de evaluaciones aplicando la lógica de negocio.
 * @param {object} filtros - Filtros de la solicitud.
 * @returns {Promise<Array>} Un array de objetos con los reportes.
 */
export const obtenerReportes = async (filtros) => {
    // Aquí se aplica la lógica de negocio, como validar los permisos del usuario
    if (!filtros.grupos || !filtros.idUsuario) {
        throw new Error("Rol y ID de usuario son requeridos.");
    }
    // Llama a la capa DAL para obtener los datos
    const reportes = await obtenerEvaluacionesDB(filtros);
    // Se pueden aplicar transformaciones de datos o cálculos adicionales aquí
    return reportes;
};

/**
 * Obtiene la lista de operadores con la lógica de negocio.
 * @param {object} filtros - Filtros de la solicitud.
 * @returns {Promise<Array>} Un array de objetos con los operadores.
 */
export const obtenerOperadores = async (filtros) => {
    // Aquí se aplica la lógica de negocio
    if (!filtros.grupos || !filtros.idUsuario) {
        throw new Error("Rol y ID de usuario son requeridos.");
    }
    
    // Llama a la capa DAL para obtener los datos
    const operadores = await obtenerOperadoresDB(filtros);

    return operadores;
};