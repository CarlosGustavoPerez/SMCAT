// src/modulos/auditoria/dal/auditoriaDAL.js

export const getAuditoriaSesionesDAL = async (dbClient, filtros) => {
    let query = 'SELECT idAuditoria, nombreUsuario, fechaHora, tipoEvento, ipOrigen, detalle FROM AuditoriaSesion WHERE 1=1';
    const params = [];
    if (filtros.usuario) {
        query += ' AND nombreUsuario = ?';
        params.push(filtros.usuario);
    }
    if (filtros.tipoEvento) {
        query += ' AND tipoEvento = ?';
        params.push(filtros.tipoEvento);
    }
    if (filtros.fechaDesde) {
        query += ' AND fechaHora >= ?'; 
        params.push(filtros.fechaDesde); 
    }
    if (filtros.fechaHasta) {
        query += ' AND fechaHora <= ?';
        params.push(filtros.fechaHasta); 
    }
    if (filtros.busquedaGeneral) {
        const searchTerm = `%${filtros.busquedaGeneral}%`;
        query += ' AND (ipOrigen LIKE ? OR OR detalle LIKE ?)';
        params.push(searchTerm, searchTerm, searchTerm); 
    }
    query += ' ORDER BY fechaHora DESC'; 
    try {
        const [sesiones] = await dbClient.query(query, params); 
        return sesiones;
    } catch (error) {
        console.error('Error al ejecutar consulta dinámica en DAL:', query, params, error);
        throw new Error('Error de base de datos al aplicar filtros.');
    }
};

export const getUniqueUsersDAL = async (dbClient) => {
    try {
        const query = 'SELECT DISTINCT nombreUsuario FROM AuditoriaSesion WHERE nombreUsuario IS NOT NULL ORDER BY nombreUsuario ASC';
        const [usuarios] = await dbClient.query(query);
        return usuarios.map(row => row.nombreUsuario);
    } catch (error) {
        console.error('Error en DAL al obtener usuarios únicos:', error);
        throw new Error('Error de DB al obtener usuarios para filtros.');
    }
};

export const getUniqueEventTypesDAL = async (dbClient) => {
    try {
        const query = 'SELECT DISTINCT tipoEvento FROM AuditoriaSesion ORDER BY tipoEvento ASC';
        const [eventos] = await dbClient.query(query);
        return eventos.map(row => row.tipoEvento);
    } catch (error) {
        console.error('Error en DAL al obtener eventos únicos:', error);
        throw new Error('Error de DB al obtener eventos para filtros.');
    }
};