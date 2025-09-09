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
} from '@/modulos/admin/dal/adminDAL';

export const obtenerUsuarios = async () => {
    try {
        const usuarios = await obtenerUsuariosDB();
        // Lógica de negocio adicional si es necesaria
        return usuarios;
    } catch (error) {
        throw new Error('Error en la BLL al obtener usuarios: ' + error.message);
    }
};

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

export const actualizarUsuario = async (idUsuario, usuarioData) => {
    try {
        await actualizarUsuarioDB(idUsuario, usuarioData);
    } catch (error) {
        throw new Error('Error en la BLL al actualizar usuario: ' + error.message);
    }
};

export const eliminarUsuario = async (idUsuario) => {
    try {
        await eliminarUsuarioDB(idUsuario);
    } catch (error) {
        throw new Error('Error en la BLL al eliminar usuario: ' + error.message);
    }
};

export const obtenerGrupos = async () => {
    try {
        const grupos = await obtenerGruposDB();
        return grupos;
    } catch (error) {
        throw new Error('Error en la BLL al obtener grupos: ' + error.message);
    }
};

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

export const obtenerGruposDeUsuario = async (idUsuario) => {
    try {
        const grupos = await obtenerGruposDeUsuarioDB(idUsuario);
        return grupos;
    } catch (error) {
        throw new Error('Error en la BLL al obtener grupos de usuario: ' + error.message);
    }
};

export const asignarGrupoAUsuario = async (idUsuario, idGrupo) => {
    try {
        await asignarGrupoAUsuarioDB(idUsuario, idGrupo);
    } catch (error) {
        throw new Error('Error en la BLL al asignar grupo a usuario: ' + error.message);
    }
};

export const removerGrupoDeUsuario = async (idUsuario, idGrupo) => {
    try {
        await removerGrupoDeUsuarioDB(idUsuario, idGrupo);
    } catch (error) {
        throw new Error('Error en la BLL al remover grupo de usuario: ' + error.message);
    }
};
