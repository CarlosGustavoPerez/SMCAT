import { obtenerEvaluacionesDB, obtenerOperadoresDB } from '@/modulos/reportes/dal/reportDAL';

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

export const obtenerReportes = async (filtros) => {
    const rol = getRol(filtros.grupos);
    
    if (rol === 'Desconocido') {
        throw new Error("Rol de usuario no válido.");
    }
    const reportes = await obtenerEvaluacionesDB({ ...filtros, rol });
    return reportes;
};

export const obtenerOperadores = async (filtros) => {
    const rol = getRol(filtros.grupos);

    if (rol === 'Desconocido') {
        throw new Error("Rol de usuario no válido.");
    }
    
    const operadores = await obtenerOperadoresDB({ ...filtros, rol });
    return operadores;
};