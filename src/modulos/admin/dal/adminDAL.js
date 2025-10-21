import pool from '@/lib/db';

/**
 * Obtiene todos los usuarios de la base de datos.
 * @returns {Promise<Array>} Un array de objetos con los usuarios.
 */
export const obtenerUsuariosDB = async () => {
    const query = 'SELECT * FROM Usuario';
    const [rows] = await pool.query(query);
    return rows;
};

/**
 * Crea un nuevo usuario en la base de datos.
 * @param {object} usuarioData - Los datos del nuevo usuario.
 * @returns {Promise<number>} El ID del nuevo usuario.
 */
export const crearUsuarioDB = async (usuarioData) => {
    // Nota: 'contraseña' ahora contiene el hash de bcrypt.
    // Asegúrate de que los nombres coincidan con las claves en usuarioData
    const { nombre, apellido, nombreUsuario, contraseña } = usuarioData; 
    
    // Corregido el nombre de la variable en el query y en el array de valores
    const query = 'INSERT INTO Usuario (nombre, apellido, nombreUsuario, contraseña) VALUES (?, ?, ?, ?)';
    // Usamos el hash que viene en usuarioData.contraseña
    const [result] = await pool.query(query, [nombre, apellido, nombreUsuario, contraseña]); 
    return result.insertId;
};

/**
 * Actualiza un usuario en la base de datos.
 * @param {number} idUsuario - El ID del usuario a actualizar.
 * @param {object} usuarioData - Los datos a actualizar.
 * @returns {Promise<void>}
 */
export const actualizarUsuarioDB = async (idUsuario, usuarioData) => {
    const { nombre, apellido, email, rol, password, idTeamLeader } = usuarioData;
    const query = 'UPDATE Usuario SET nombre = ?, apellido = ?, email = ?, rol = ?, password = ?, idTeamLeader = ? WHERE idUsuario = ?';
    await pool.query(query, [nombre, apellido, email, rol, password, idTeamLeader, idUsuario]);
};

/**
 * Elimina un usuario de la base de datos.
 * @param {number} idUsuario - El ID del usuario a eliminar.
 * @returns {Promise<void>}
 */
export const eliminarUsuarioDB = async (idUsuario) => {
    const query = 'DELETE FROM Usuario WHERE idUsuario = ?';
    await pool.query(query, [idUsuario]);
};

/**
 * Obtiene todos los grupos disponibles de la base de datos.
 * @returns {Promise<Array>} Un array de objetos con los grupos.
 */
export const obtenerGruposDB = async () => {
    const query = 'SELECT * FROM Grupo';
    const [rows] = await pool.query(query);
    return rows;
};

/**
 * Crea un nuevo grupo en la base de datos.
 * @param {object} grupoData - Los datos del nuevo grupo.
 * @returns {Promise<number>} El ID del nuevo grupo.
 */
export const crearGrupoDB = async (grupoData) => {
    const { nombreGrupo } = grupoData;
    const query = 'INSERT INTO Grupo (nombreGrupo) VALUES (?)';
    const [result] = await pool.query(query, [nombreGrupo]);
    return result.insertId;
};

/**
 * Obtiene los grupos a los que pertenece un usuario específico de la base de datos.
 * @param {number} idUsuario - El ID del usuario.
 * @returns {Promise<Array>} Un array de objetos con los grupos del usuario.
 */
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

/**
 * Asigna un grupo a un usuario en la base de datos.
 * @param {number} idUsuario - El ID del usuario.
 * @param {number} idGrupo - El ID del grupo.
 * @returns {Promise<void>}
 */
export const asignarGrupoAUsuarioDB = async (idUsuario, idGrupo) => {
    try {
        const query = 'INSERT INTO UsuarioGrupo (idUsuario, idGrupo) VALUES (?, ?)';
        await pool.query(query, [idUsuario, idGrupo]);
    } catch (error) {
        console.error('Error en la DAL al asignar grupo:', error);
        throw error; // Propaga el error para que la BLL y la API lo manejen.
    }
};

/**
 * Remueve un grupo de un usuario en la base de datos.
 * @param {number} idUsuario - El ID del usuario.
 * @param {number} idGrupo - El ID del grupo.
 * @returns {Promise<void>}
 */
export const removerGrupoDeUsuarioDB = async (idUsuario, idGrupo) => {
    try {
        const query = 'DELETE FROM UsuarioGrupo WHERE idUsuario = ? AND idGrupo = ?';
        await pool.query(query, [idUsuario, idGrupo]);
    } catch (error) {
        console.error('Error en la DAL al remover grupo:', error);
        throw error; // Propaga el error para que la BLL y la API lo manejen.
    }
};
