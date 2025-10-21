// src/modulos/auditoria/bll/auditoriaBLL.js
import { 
    getAuditoriaSesionesDAL,
    getUniqueUsersDAL, 
    getUniqueEventTypesDAL 
} from '@/modulos/auditoria/dal/auditoriaDAL';
export const getAuditoriaSesionesBLL = async (dbClient, filtros) => {
    const { fechaDesde, fechaHasta } = filtros;
    
    if (fechaDesde && fechaHasta) {
        const dDesde = new Date(fechaDesde);
        const dHasta = new Date(fechaHasta);
        
        if (dDesde > dHasta) {
            throw new Error('La fecha "Desde" no puede ser posterior a la fecha "Hasta".');
        }
    }
    return getAuditoriaSesionesDAL(dbClient, filtros);
};
export const getAuditoriaFiltrosBLL = async (dbClient) => {
    const [usuarios, tiposEvento] = await Promise.all([
        getUniqueUsersDAL(dbClient),
        getUniqueEventTypesDAL(dbClient)
    ]);

    return {
        usuariosUnicos: usuarios,
        tiposEventoUnicos: tiposEvento
    };
};