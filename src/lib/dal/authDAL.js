import pool from '@/lib/db';

/**
 * Busca un usuario en la base de datos por su nombre de usuario.
 * @param {string} nombreUsuario - El nombre de usuario a buscar.
 * @returns {Promise<object|null>} El objeto de usuario si se encuentra, o null.
 */
export const findUserByUsername = async (nombreUsuario) => {
    try {
        const [users] = await pool.query(
            'SELECT idUsuario, nombre, apellido, nombreUsuario, contraseña FROM Usuario WHERE nombreUsuario = ?',
            [nombreUsuario]
        );
        return users[0] || null;
    } catch (error) {
        console.error('Error en DAL al buscar usuario:', error);
        throw new Error('Error de base de datos.');
    }
};

/**
 * Busca los grupos a los que pertenece un usuario en la base de datos.
 * @param {number} userId - El ID del usuario.
 * @returns {Promise<Array<object>>} Un array de objetos con los grupos del usuario.
 */
export const findGroupsByUserId = async (userId) => {
    try {
        const [groups] = await pool.query(
            `SELECT g.idGrupo, g.nombreGrupo
             FROM Grupo g
             JOIN UsuarioGrupo ug ON g.idGrupo = ug.idGrupo
             WHERE ug.idUsuario = ?`,
            [userId]
        );
        return groups;
    } catch (error) {
        console.error('Error en DAL al buscar grupos de usuario:', error);
        throw new Error('Error de base de datos.');
    }
};