import { findUserByUsername, findGroupsByUserId, registrarAuditoriaSesion } from '@/modulos/authentication/dal/authDAL';
import { Usuario } from '../be/Usuario';
import bcrypt from 'bcryptjs';
const DIAS_EXPIRACION = 30;
export const verificarVencimientoClave = (usuarioDB) => {
    if (!usuarioDB.fechaUltimoCambioClave) {
        return { claveVencida: true, motivo: "Fecha de cambio de clave no registrada." };
    }
    const lastChangeDate = new Date(usuarioDB.fechaUltimoCambioClave);
    const expirationDate = new Date(lastChangeDate);
    expirationDate.setDate(lastChangeDate.getDate() + DIAS_EXPIRACION);

    const today = new Date();

    if (today > expirationDate) {
        return { claveVencida: true, motivo: "La clave ha vencido." };
    } else {
        return { claveVencida: false };
    }
};

export const loginUsuario = async (nombreUsuario, contrasena, dbClient) => {
    if (!nombreUsuario || !contrasena) {
        return null;
    }
    const usuarioDB = await findUserByUsername(nombreUsuario, dbClient);
    if (!usuarioDB) {
        return null;
    }
    const isMatch = await bcrypt.compare(contrasena, usuarioDB.contrasena);
    if (!isMatch) {
        return null;
    }
    const vencimiento = verificarVencimientoClave(usuarioDB);

    if (vencimiento.claveVencida) {
        // En lugar de devolver null (que se interpretaría como clave/usuario incorrecto),
        // devolvemos un objeto específico que la API Route pueda interpretar
        // para forzar el cambio de clave.
        return {
            error: true,
            errorCode: 'KEY_EXPIRED',
            message: vencimiento.motivo || "Su clave ha vencido y requiere ser cambiada.",
            idUsuario: usuarioDB.idUsuario,
            nombreUsuario: usuarioDB.nombreUsuario
        };
    }

    const gruposUsuario = await findGroupsByUserId(usuarioDB.idUsuario, dbClient);
    const { contrasena: _, fechaUltimoCambioClave: __, ...usuarioSinClave } = usuarioDB;
    
    const usuarioConGrupos = { ...usuarioSinClave, grupos: gruposUsuario };
    const usuario = new Usuario(usuarioConGrupos);

    return usuario;
};
export const registrarEventoSesion = async (datosAuditoria, dbClient) => {
    await registrarAuditoriaSesion(datosAuditoria, dbClient);
};