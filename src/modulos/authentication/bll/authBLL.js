import { findUserByUsername, findGroupsByUserId } from '@/modulos/authentication/dal/authDAL';
import { Usuario } from '../be/Usuario';
import bcrypt from 'bcryptjs';

export const loginUsuario = async (nombreUsuario, contraseña, dbClient) => {
    if (!nombreUsuario || !contraseña) {
        return null;
    }
    const usuarioDB = await findUserByUsername(nombreUsuario, dbClient);
    if (!usuarioDB) {
        return null;
    }
    const isMatch = await bcrypt.compare(contraseña, usuarioDB.contraseña);
    if (!isMatch) {
        return null;
    }
    const gruposUsuario = await findGroupsByUserId(usuarioDB.idUsuario, dbClient);
    const { contraseña: _, ...usuarioSinClave } = usuarioDB;
    const usuarioConGrupos = { ...usuarioSinClave, grupos: gruposUsuario };
    const usuario = new Usuario(usuarioConGrupos);

    return usuario;
};