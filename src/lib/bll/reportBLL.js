import { obtenerEvaluacionesDB, obtenerOperadoresDB } from '@/lib/dal/reportDAL';

/**
 * Determina el rol del usuario a partir de sus grupos.
 * @param {Array} grupos - Array de objetos de grupo del usuario.
 * @returns {string} El rol del usuario ('Analista', 'TeamLeader', 'Operador') o 'Desconocido'.
 */
const getRol = (grupos) => {
    if (!grupos || grupos.length === 0) {
        return 'Desconocido';
    }
    if (grupos.some(grupo => grupo.nombreGrupo === 'Analista')) {
        return 'Analista';
    }
    if (grupos.some(grupo => grupo.nombreGrupo === 'TeamLeader')) {
        return 'TeamLeader';
    }
    if (grupos.some(grupo => grupo.nombreGrupo === 'Operador')) {
        return 'Operador';
    }
    return 'Desconocido';
};

/**
 * Obtiene los reportes aplicando los filtros y permisos según el rol del usuario.
 * @param {object} filtros - Objeto con los filtros, grupos y ID del usuario.
 * @returns {Promise<Array>} Un array de objetos de evaluaciones filtradas.
 */
export const obtenerReportes = async (filtros) => {
    const rol = getRol(filtros.grupos);
    
    // Aquí se aplica la lógica de negocio para los permisos
    if (rol === 'Desconocido') {
        throw new Error("Rol de usuario no válido.");
    }

    // Llama a la capa DAL para obtener los datos con el filtro de rol
    const reportes = await obtenerEvaluacionesDB({ ...filtros, rol });
    return reportes;
};

/**
 * Obtiene la lista de operadores aplicando los filtros y permisos según el rol del usuario.
 * @param {object} filtros - Objeto con los filtros, grupos y ID del usuario.
 * @returns {Promise<Array>} Un array de objetos de operadores.
 */
export const obtenerOperadores = async (filtros) => {
    const rol = getRol(filtros.grupos);

    if (rol === 'Desconocido') {
        throw new Error("Rol de usuario no válido.");
    }
    
    // Llama a la capa DAL para obtener la lista de operadores con el filtro de rol
    const operadores = await obtenerOperadoresDB({ ...filtros, rol });
    return operadores;
};
