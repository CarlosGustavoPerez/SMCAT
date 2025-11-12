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
        // Lógica de negocio adicional si es necesaria
        return usuarios;
    } catch (error) {
        throw new Error('Error en la BLL al obtener usuarios: ' + error.message);
    }
};

export const crearUsuario = async (usuarioData) => {
    try {
        // Validación de datos y lógica de negocio
        if (!usuarioData.nombre || !usuarioData.contrasena || !usuarioData.idGrupo) {
            throw new Error('Faltan datos obligatorios (nombre, contraseña o grupo) para crear el usuario.');
        }

        // 1. Hashear la contrasena
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(usuarioData.contrasena, salt);

        // 2. Crear un objeto para la tabla Usuario
        const usuarioParaDB = {
            nombre: usuarioData.nombre,
            apellido: usuarioData.apellido,
            nombreUsuario: usuarioData.nombreUsuario,
            contrasena: hashedPassword, // Hasheada
            // Los campos rol, idTeamLeader del userForm no son necesarios para la tabla Usuario
        };

        // 3. Persistir en la tabla Usuario
    const idUsuario = await crearUsuarioDB(usuarioParaDB); // Obtiene el nuevo ID

        // 4. Asignar Grupo/Rol (Obligatorio)
        await asignarGrupoAUsuario(idUsuario, usuarioData.idGrupo); // Reutilizamos la función existente

        // 5. Asignar Team Leader (Condicional, solo si se selecciona)
        if (usuarioData.idTeamLeader) {
            await crearOperadorTeamLeader(idUsuario, usuarioData.idTeamLeader); // Nueva función BLL/DAL
        }

    // Devolver también la contraseña en texto plano para mostrarla al administrador
    return { idUsuario, newPassword: usuarioData.contrasena };
    } catch (error) {
        // En un entorno real, aquí se implementaría una lógica de Rollback
        throw new Error('Error en la BLL al crear usuario y asignar dependencias: ' + error.message);
    }
};

export const actualizarUsuario = async (idUsuario, usuarioData) => {
    try {
        // Separar idTeamLeader del resto de datos del usuario
        const { idTeamLeader, ...usuarioDatosBase } = usuarioData;

        // Actualizar los datos básicos del usuario
        await actualizarUsuarioDB(idUsuario, usuarioDatosBase);

        // Si se proporciona idTeamLeader, actualizar la asignación de Team Leader
        if (idTeamLeader !== undefined && idTeamLeader !== null && idTeamLeader !== '') {
            await actualizarTeamLeaderDeOperadorDB(idUsuario, idTeamLeader);
        }
    } catch (error) {
        throw new Error('Error en la BLL al actualizar usuario: ' + error.message);
    }
};

export const resetearClave = async (userId) => {
    try {
        // 2. Obtener nombre de usuario usando el DAL
        const username = await getUsernameById(userId); 
        
        if (!username) {
            throw new Error("El usuario especificado no existe.");
        }

        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0'); 
        const year = today.getFullYear();
        const dateString = `${day}${month}${year}`;

        // Generar 4 caracteres aleatorios para completar 12 caracteres totales
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let randomChars = '';
        for (let i = 0; i < 4; i++) {
            randomChars += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Contraseña de 12 caracteres: username(variable) + dateString(8) + randomChars(4)
        // Ajustar para que sea exactamente 12 caracteres
        const basePassword = username + dateString;
        let nuevaClave;
        
        if (basePassword.length >= 12) {
            // Si el username + fecha ya tiene 12 o más, tomar los primeros 12
            nuevaClave = basePassword.substring(0, 12);
        } else {
            // Si es menor a 12, rellenar con caracteres aleatorios hasta completar 12
            const charsNeeded = 12 - basePassword.length;
            let padding = '';
            for (let i = 0; i < charsNeeded; i++) {
                padding += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            nuevaClave = basePassword + padding;
        }
        
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(nuevaClave, salt);
        
        // 3. Persistencia: Usar la función de DAL específica
    // Usar la variante que deja fechaUltimoCambioClave en NULL para forzar el cambio en el primer login
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
        // Podríamos filtrar solo los usuarios con el rol 'Team Leader' aquí si la DAL lo soporta
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