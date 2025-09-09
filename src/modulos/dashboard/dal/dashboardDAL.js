import pool from '@/lib/db'; 
export const getEvaluacionesByRole = async (filtros) => { 
    let query = ` 
        SELECT 
            e.idEvaluacion, 
            e.fechaHora, 
            e.duracion, 
            e.puntuacionActitud, 
            e.puntuacionEstructura, 
            e.puntuacionProtocolos, 
            e.observaciones, 
            e.estado, 
            e.idEvaluado, 
            ue.nombre AS nombreEvaluado, 
            ue.apellido AS apellidoEvaluado 
        FROM Evaluacion e 
        JOIN Usuario ue ON ue.idUsuario = e.idEvaluado 
    `; 
    let params = []; 

    if (filtros.idTeamLeader) { 
        query += ' JOIN OperadorTeamLeader otl ON otl.idUsuario = ue.idUsuario WHERE otl.idTeamLeader = ?'; 
        params.push(filtros.idTeamLeader); 
    } else if (filtros.idOperador) { 
        query += ' WHERE ue.idUsuario = ?'; 
        params.push(filtros.idOperador); 
    } 

    query += ' ORDER BY e.fechaHora DESC'; 

    try { 
        const [rows] = await pool.query(query, params); 
        return rows; 
    } catch (error) { 
        console.error('Error en DAL al obtener datos del dashboard:', error); 
        throw new Error('Error de base de datos'); 
    } 
}; 

export const getOperadoresDeTeamLeader = async (idTeamLeader) => { 
    const query = ` 
        SELECT 
            u.idUsuario, 
            u.nombre, 
            u.apellido, 
            tl.nombre AS nombreTeamLeader, 
            tl.apellido AS apellidoTeamLeader, 
            AVG((e.puntuacionActitud + e.puntuacionEstructura + e.puntuacionProtocolos) / 3) AS promedio, 
            COUNT(e.idEvaluacion) AS llamadas 
        FROM Usuario u 
        JOIN Evaluacion e ON e.idEvaluado = u.idUsuario 
        -- Ahora unimos a la nueva tabla intermedia para encontrar al Team Leader.
        JOIN OperadorTeamLeader otl ON otl.idUsuario = u.idUsuario
        JOIN Usuario tl ON otl.idTeamLeader = tl.idUsuario
        WHERE otl.idTeamLeader = ? 
        GROUP BY u.idUsuario, tl.nombre, tl.apellido 
        ORDER BY u.nombre; 
    `; 
    const [rows] = await pool.query(query, [idTeamLeader]); 
    return rows; 
}; 

export const getTodosLosOperadores = async () => { 
    const query = ` 
        SELECT 
            u.idUsuario, 
            u.nombre, 
            u.apellido, 
            tl.nombre AS nombreTeamLeader, 
            tl.apellido AS apellidoTeamLeader, 
            AVG((e.puntuacionActitud + e.puntuacionEstructura + e.puntuacionProtocolos) / 3) AS promedio, 
            COUNT(e.idEvaluacion) AS llamadas 
        FROM Usuario u 
        JOIN Evaluacion e ON e.idEvaluado = u.idUsuario 
        -- Usamos LEFT JOIN para incluir operadores que no tengan un Team Leader asignado.
        LEFT JOIN OperadorTeamLeader otl ON otl.idUsuario = u.idUsuario 
        LEFT JOIN Usuario tl ON otl.idTeamLeader = tl.idUsuario 
        GROUP BY u.idUsuario, tl.nombre, tl.apellido 
        ORDER BY u.nombre; 
    `; 
    const [rows] = await pool.query(query); 
    return rows; 
}; 

export const getOperadoresAgrupadosPorTeamLeader = async () => {
    const query = `
        SELECT
            tl.idUsuario AS idTeamLeader,
            tl.nombre AS nombreTeamLeader,
            tl.apellido AS apellidoTeamLeader,
            u.idUsuario AS idOperador,
            u.nombre AS nombreOperador,
            u.apellido AS apellidoOperador,
            AVG((e.puntuacionActitud + e.puntuacionEstructura + e.puntuacionProtocolos) / 3) AS promedio,
            COUNT(e.idEvaluacion) AS llamadas
        FROM Usuario u
        JOIN Evaluacion e ON e.idEvaluado = u.idUsuario
        -- Ahora unimos a la nueva tabla intermedia para agrupar
        JOIN OperadorTeamLeader otl ON otl.idUsuario = u.idUsuario
        JOIN Usuario tl ON otl.idTeamLeader = tl.idUsuario
        GROUP BY tl.idUsuario, u.idUsuario
        ORDER BY tl.nombre, u.nombre;
    `;
    const [rows] = await pool.query(query);

    const teamLeaders = {};
    rows.forEach(row => {
        const { idTeamLeader, nombreTeamLeader, apellidoTeamLeader, ...operadorData } = row;
        if (!teamLeaders[idTeamLeader]) {
            teamLeaders[idTeamLeader] = {
                idUsuario: idTeamLeader,
                nombre: nombreTeamLeader,
                apellido: apellidoTeamLeader,
                operadores: [],
            };
        }
        teamLeaders[idTeamLeader].operadores.push({
            idUsuario: operadorData.idOperador,
            nombre: operadorData.nombreOperador,
            apellido: operadorData.apellidoOperador,
            promedio: parseFloat(operadorData.promedio) || 0,
            llamadas: parseInt(operadorData.llamadas) || 0,
        });
    });

    Object.values(teamLeaders).forEach(tl => {
        const totalPromedio = tl.operadores.reduce((sum, op) => sum + op.promedio, 0);
        tl.promedio = tl.operadores.length > 0 ? (totalPromedio / tl.operadores.length).toFixed(2) : 0;
        tl.llamadas = tl.operadores.reduce((sum, op) => sum + op.llamadas, 0);
    });

    return Object.values(teamLeaders);
};

export const actualizarEstadoEvaluacion = async (idEvaluacion, nuevoEstado) => { 
    const query = 'UPDATE Evaluacion SET estado = ? WHERE idEvaluacion = ?'; 
    await pool.query(query, [nuevoEstado, idEvaluacion]); 
};