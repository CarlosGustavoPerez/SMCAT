import {
    obtenerUsuariosDB,
    crearUsuarioDB,
    actualizarUsuarioDB,
    eliminarUsuarioDB,
    obtenerGruposDB,
    crearGrupoDB,
    obtenerGruposDeUsuarioDB,
    asignarGrupoAUsuarioDB,
    removerGrupoDeUsuarioDB
} from '@/lib/dal/adminDAL';

/**
 * Obtiene todos los usuarios y los team leaders.
 * @returns {Promise<Array>} Un array de objetos de usuario.
 */
export const obtenerUsuarios = async () => {
    try {
        const usuarios = await obtenerUsuariosDB();
        // Lógica de negocio adicional si es necesaria
        return usuarios;
    } catch (error) {
        throw new Error('Error en la BLL al obtener usuarios: ' + error.message);
    }
};

/**
 * Crea un nuevo usuario.
 * @param {object} usuarioData - Datos del nuevo usuario.
 * @returns {Promise<number>} El ID del nuevo usuario.
 */
export const crearUsuario = async (usuarioData) => {
    try {
        // Validación de datos y lógica de negocio
        if (!usuarioData.nombre || !usuarioData.email) {
            throw new Error('Faltan datos obligatorios para crear el usuario.');
        }
        const id = await crearUsuarioDB(usuarioData);
        return id;
    } catch (error) {
        throw new Error('Error en la BLL al crear usuario: ' + error.message);
    }
};

/**
 * Actualiza un usuario.
 * @param {number} idUsuario - El ID del usuario a actualizar.
 * @param {object} usuarioData - Datos del usuario a actualizar.
 * @returns {Promise<void>}
 */
export const actualizarUsuario = async (idUsuario, usuarioData) => {
    try {
        await actualizarUsuarioDB(idUsuario, usuarioData);
    } catch (error) {
        throw new Error('Error en la BLL al actualizar usuario: ' + error.message);
    }
};

/**
 * Elimina un usuario.
 * @param {number} idUsuario - El ID del usuario a eliminar.
 * @returns {Promise<void>}
 */
export const eliminarUsuario = async (idUsuario) => {
    try {
        await eliminarUsuarioDB(idUsuario);
    } catch (error) {
        throw new Error('Error en la BLL al eliminar usuario: ' + error.message);
    }
};

/**
 * Obtiene todos los grupos disponibles.
 * @returns {Promise<Array>} Un array de objetos de grupo.
 */
export const obtenerGrupos = async () => {
    try {
        const grupos = await obtenerGruposDB();
        return grupos;
    } catch (error) {
        throw new Error('Error en la BLL al obtener grupos: ' + error.message);
    }
};

/**
 * Crea un nuevo grupo.
 * @param {object} grupoData - Datos del nuevo grupo.
 * @returns {Promise<number>} El ID del nuevo grupo.
 */
export const agregarGrupo = async (grupoData) => {
    try {
        if (!grupoData.nombreGrupo) {
            throw new Error('Falta el nombre del grupo.');
        }
        const id = await crearGrupoDB(grupoData);
        return id;
    } catch (error) {
        throw new Error('Error en la BLL al agregar grupo: ' + error.message);
    }
};

/**
 * Obtiene los grupos de un usuario específico.
 * @param {number} idUsuario - El ID del usuario.
 * @returns {Promise<Array>} Un array de objetos de grupo.
 */
export const obtenerGruposDeUsuario = async (idUsuario) => {
    try {
        const grupos = await obtenerGruposDeUsuarioDB(idUsuario);
        return grupos;
    } catch (error) {
        throw new Error('Error en la BLL al obtener grupos de usuario: ' + error.message);
    }
};

/**
 * Asigna un grupo a un usuario.
 * @param {number} idUsuario - El ID del usuario.
 * @param {number} idGrupo - El ID del grupo.
 * @returns {Promise<void>}
 */
export const asignarGrupoAUsuario = async (idUsuario, idGrupo) => {
    try {
        await asignarGrupoAUsuarioDB(idUsuario, idGrupo);
    } catch (error) {
        throw new Error('Error en la BLL al asignar grupo a usuario: ' + error.message);
    }
};

/**
 * Remueve un grupo de un usuario.
 * @param {number} idUsuario - El ID del usuario.
 * @param {number} idGrupo - El ID del grupo.
 * @returns {Promise<void>}
 */
export const removerGrupoDeUsuario = async (idUsuario, idGrupo) => {
    try {
        await removerGrupoDeUsuarioDB(idUsuario, idGrupo);
    } catch (error) {
        throw new Error('Error en la BLL al remover grupo de usuario: ' + error.message);
    }
};
