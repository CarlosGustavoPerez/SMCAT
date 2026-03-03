import {
    obtenerUsuariosDB,
    crearUsuarioDB,
    actualizarUsuarioDB,
    eliminarUsuarioDB,
    obtenerGruposDB,
    crearGrupoDB,
    obtenerGruposDeUsuarioDB,
    asignarGrupoAUsuarioDB,
    removerGrupoDeUsuarioDB,
    obtenerTeamLeadersDB,
    getUsernameById, 
    updatePassword,
    updatePasswordForceChange,
    crearOperadorTeamLeaderDB,
    actualizarTeamLeaderDeOperadorDB,
    obtenerTeamLeaderDeOperadorDB
} from '@/modulos/admin/dal/adminDAL';
import bcrypt from 'bcryptjs';

export const obtenerUsuarios = async () => {
    try {
        const usuarios = await obtenerUsuariosDB();
        return usuarios;
    } catch (error) {
        throw new Error('Error en la BLL al obtener usuarios: ' + error.message);
    }
};

export const crearUsuario = async (usuarioData) => {
    try {
        if (!usuarioData.nombre || !usuarioData.contrasena || !usuarioData.idGrupo) {
            throw new Error('Faltan datos obligatorios (nombre, contraseña o grupo) para crear el usuario.');
        }
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(usuarioData.contrasena, salt);
        const usuarioParaDB = {
            nombre: usuarioData.nombre,
            apellido: usuarioData.apellido,
            nombreUsuario: usuarioData.nombreUsuario,
            contrasena: hashedPassword, // Hasheada
        };
    const idUsuario = await crearUsuarioDB(usuarioParaDB);
        await asignarGrupoAUsuario(idUsuario, usuarioData.idGrupo);
        if (usuarioData.idTeamLeader) {
            await crearOperadorTeamLeader(idUsuario, usuarioData.idTeamLeader);
        }
    return { idUsuario, newPassword: usuarioData.contrasena };
    } catch (error) {
        throw new Error('Error en la BLL al crear usuario y asignar dependencias: ' + error.message);
    }
};

export const actualizarUsuario = async (idUsuario, usuarioData) => {
    try {
        const { idTeamLeader, ...usuarioDatosBase } = usuarioData;
        await actualizarUsuarioDB(idUsuario, usuarioDatosBase);
        if (idTeamLeader !== undefined && idTeamLeader !== null && idTeamLeader !== '') {
            await actualizarTeamLeaderDeOperadorDB(idUsuario, idTeamLeader);
        }
    } catch (error) {
        throw new Error('Error en la BLL al actualizar usuario: ' + error.message);
    }
};

export const resetearClave = async (userId) => {
    try {
        const username = await getUsernameById(userId); 
        
        if (!username) {
            throw new Error("El usuario especificado no existe.");
        }

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const year = today.getFullYear();
        const dateString = `${day}${month}${year}`;
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomChars = '';
        for (let i = 0; i < 4; i++) {
            randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        const basePassword = username + dateString;
        let nuevaClave;
        
        if (basePassword.length >= 12) {
            nuevaClave = basePassword.substring(0, 12);
        } else {
            const charsNeeded = 12 - basePassword.length;
            let padding = '';
            for (let i = 0; i < charsNeeded; i++) {
                padding += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            nuevaClave = basePassword + padding;
        }
        
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(nuevaClave, salt);
    const updateResult = await updatePasswordForceChange(userId, hashedPassword);
        
        if (!updateResult.success) {
            throw new Error("Fallo al actualizar la contraseña en la base de datos.");
        }

        return { 
            success: true, 
            newPassword: nuevaClave,
        };
    }
    catch (error) {
        throw new Error('Error en la BLL al resetear clave: ' + error.message);
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
export const obtenerTeamLeaders = async () => {
    try {
        const teamLeaders = await obtenerTeamLeadersDB();
        return teamLeaders;
    } catch (error) {
        throw new Error('Error en la BLL al obtener Team Leaders: ' + error.message);
    }
};

export const crearOperadorTeamLeader = async (idUsuario, idTeamLeader) => {
    try {
        await crearOperadorTeamLeaderDB(idUsuario, idTeamLeader);
    } catch (error) {
        throw new Error('Error en la BLL al asignar Team Leader: ' + error.message);
    }
};
export const obtenerTeamLeaderDeOperador = async (idUsuario) => {
    try {
        const idTeamLeader = await obtenerTeamLeaderDeOperadorDB(idUsuario);
        return idTeamLeader ? String(idTeamLeader) : null; 
    } catch (error) {
        console.error("Error en BLL al obtener TL de operador:", error);
        return null;
    }
};