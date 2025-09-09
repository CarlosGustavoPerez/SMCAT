export const findUserByUsername = async (nombreUsuario, dbClient) => {
    try {
        const [users] = await dbClient.query(
            'SELECT idUsuario, nombre, apellido, nombreUsuario, contraseña FROM Usuario WHERE nombreUsuario = ?',
            [nombreUsuario]
        );
        return users[0] || null;
    } catch (error) {
        console.error('Error en DAL al buscar usuario:', error);
        throw new Error('Error de base de datos.');
    }
};
export const findGroupsByUserId = async (userId, dbClient) => {
    try {
        const [groups] = await dbClient.query(
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