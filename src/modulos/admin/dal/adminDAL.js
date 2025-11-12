import pool from '@/lib/db';

export const obtenerUsuariosDB = async () => {
    const query = 'SELECT * FROM Usuario';
    const [rows] = await pool.query(query);
    return rows;
};

export const crearUsuarioDB = async (usuarioData) => {
    const { nombre, apellido, nombreUsuario, contrasena } = usuarioData; 
    const query = 'INSERT INTO Usuario (nombre, apellido, nombreUsuario, contrasena) VALUES (?, ?, ?, ?)';
    const [result] = await pool.query(query, [nombre, apellido, nombreUsuario, contrasena]); 
    return result.insertId;
};

export const actualizarUsuarioDB = async (idUsuario, usuarioData) => {
    const { nombre, apellido, nombreUsuario, contrasena } = usuarioData;
    
    // Construir dinámicamente la query solo con los campos que se proporcionan
    const updates = [];
    const values = [];
    
    if (nombre !== undefined && nombre !== null) {
        updates.push('nombre = ?');
        values.push(nombre);
    }
    if (apellido !== undefined && apellido !== null) {
        updates.push('apellido = ?');
        values.push(apellido);
    }
    if (nombreUsuario !== undefined && nombreUsuario !== null) {
        updates.push('nombreUsuario = ?');
        values.push(nombreUsuario);
    }
    if (contrasena !== undefined && contrasena !== null) {
        updates.push('contrasena = ?');
        values.push(contrasena);
    }
    
    if (updates.length === 0) {
        // Si no hay campos para actualizar, retornar sin hacer nada
        return;
    }
    
    values.push(idUsuario);
    const query = `UPDATE Usuario SET ${updates.join(', ')} WHERE idUsuario = ?`;
    await pool.query(query, values);
};
export async function getUsernameById(userId) {
    const query = 'SELECT nombreUsuario FROM Usuario WHERE idUsuario = ?';
    const [rows] = await pool.query(query, [userId]);
    
    return rows.length > 0 ? rows[0].nombreUsuario : null;
}

export async function updatePassword(userId, hashedPassword) {
    try {
        const query = `
            UPDATE Usuario 
            SET contrasena = ?, fechaUltimoCambioClave = NOW() 
            WHERE idUsuario = ?
        `;
        const [result] = await pool.query(query, [hashedPassword, userId]);
        
        return { success: result.affectedRows > 0 };
    } catch (error) {
        console.error("Error al actualizar la contraseña en DAL:", error);
        throw new Error("Error de persistencia.");
    }
}

// Actualiza la contraseña pero deja fechaUltimoCambioClave en NULL para forzar cambio en el primer login
export async function updatePasswordForceChange(userId, hashedPassword) {
    try {
        const query = `
            UPDATE Usuario 
            SET contrasena = ?, fechaUltimoCambioClave = NULL 
            WHERE idUsuario = ?
        `;
        const [result] = await pool.query(query, [hashedPassword, userId]);
        return { success: result.affectedRows > 0 };
    } catch (error) {
        console.error("Error al actualizar la contraseña (force change) en DAL:", error);
        throw new Error("Error de persistencia.");
    }
}
export const eliminarUsuarioDB = async (idUsuario) => {
    const query = 'DELETE FROM Usuario WHERE idUsuario = ?';
    await pool.query(query, [idUsuario]);
};

export const obtenerGruposDB = async () => {
    const query = 'SELECT * FROM Grupo';
    const [rows] = await pool.query(query);
    return rows;
};

export const crearGrupoDB = async (grupoData) => {
    const { nombreGrupo } = grupoData;
    const query = 'INSERT INTO Grupo (nombreGrupo) VALUES (?)';
    const [result] = await pool.query(query, [nombreGrupo]);
    return result.insertId;
};

export const obtenerGruposDeUsuarioDB = async (idUsuario) => {
    const query = `
        SELECT g.idGrupo, g.nombreGrupo
        FROM Grupo g
        JOIN UsuarioGrupo ug ON g.idGrupo = ug.idGrupo
        WHERE ug.idUsuario = ?
    `;
    const [rows] = await pool.query(query, [idUsuario]);
    return rows;
};

export const asignarGrupoAUsuarioDB = async (idUsuario, idGrupo) => {
    try {
        const query = 'INSERT INTO UsuarioGrupo (idUsuario, idGrupo) VALUES (?, ?)';
        await pool.query(query, [idUsuario, idGrupo]);
    } catch (error) {
        console.error('Error en la DAL al asignar grupo:', error);
        throw error; 
    }
};

export const removerGrupoDeUsuarioDB = async (idUsuario, idGrupo) => {
    try {
        const query = 'DELETE FROM UsuarioGrupo WHERE idUsuario = ? AND idGrupo = ?';
        await pool.query(query, [idUsuario, idGrupo]);
    } catch (error) {
        console.error('Error en la DAL al remover grupo:', error);
        throw error; 
    }
};
export const obtenerTeamLeadersDB = async () => {
    const query = `
        SELECT u.idUsuario, u.nombre, u.apellido, u.nombreUsuario 
        FROM Usuario u
        INNER JOIN UsuarioGrupo ug ON u.idUsuario = ug.idUsuario
        INNER JOIN Grupo g ON ug.idGrupo = g.idGrupo
        WHERE g.nombreGrupo = 'TeamLeader'
    `;
    const [rows] = await pool.query(query);
    return rows;
};
        
export const obtenerTeamLeaderDeOperadorDB = async (idUsuario) => {
    const query = 'SELECT idTeamLeader FROM OperadorTeamLeader WHERE idUsuario = ?';
    // Nota: idTeamLeader es TEXT en tu esquema, pero aquí lo tratamos como ID numérico.
    const [rows] = await pool.query(query, [idUsuario]);
    
    return rows.length > 0 ? rows[0].idTeamLeader : null;
};
export const crearOperadorTeamLeaderDB = async (idUsuario, idTeamLeader) => {
    try {
        const query = 'INSERT INTO OperadorTeamLeader (idUsuario, idTeamLeader) VALUES (?, ?)';
        await pool.query(query, [idUsuario, idTeamLeader]);
        
    } catch (error) {
        console.error('Error en la DAL al crear asignación Operador-TeamLeader:', error);
        throw error; 
    }
};

export const actualizarTeamLeaderDeOperadorDB = async (idUsuario, idTeamLeader) => {
    try {
        // Primero verificar si existe un registro previo
        const [rows] = await pool.query(
            'SELECT idUsuario FROM OperadorTeamLeader WHERE idUsuario = ?',
            [idUsuario]
        );

        if (rows.length > 0) {
            // Actualizar el registro existente
            const query = 'UPDATE OperadorTeamLeader SET idTeamLeader = ? WHERE idUsuario = ?';
            await pool.query(query, [idTeamLeader, idUsuario]);
        } else {
            // Crear uno nuevo si no existe
            const query = 'INSERT INTO OperadorTeamLeader (idUsuario, idTeamLeader) VALUES (?, ?)';
            await pool.query(query, [idUsuario, idTeamLeader]);
        }
    } catch (error) {
        console.error('Error en la DAL al actualizar Team Leader del operador:', error);
        throw error;
    }
};