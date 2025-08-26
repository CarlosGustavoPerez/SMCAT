import { findUserByUsername, findGroupsByUserId } from '@/lib/dal/authDAL';
import { Usuario } from '../be/Usuario';
import bcrypt from 'bcryptjs';

/**
 * Lógica de negocio para el inicio de sesión de un usuario.
 * @param {string} nombreUsuario - El nombre de usuario.
 * @param {string} contraseña - La contraseña del usuario.
 * @returns {Promise<Usuario|null>} El objeto de usuario con sus grupos si el login es exitoso, de lo contrario null.
 */
export const loginUsuario = async (nombreUsuario, contraseña) => {
  if (!nombreUsuario || !contraseña) {
    return null;
  }

  const usuarioDB = await findUserByUsername(nombreUsuario);
  if (!usuarioDB) {
    return null;
  }
  
  const isMatch = await bcrypt.compare(contraseña, usuarioDB.contraseña);
  if (!isMatch) {
    return null;
  }

  // Obtener los grupos del usuario
  const gruposUsuario = await findGroupsByUserId(usuarioDB.idUsuario);
  
  // Excluir la contraseña y añadir los grupos
  const { contraseña: _, ...usuarioSinClave } = usuarioDB;
  const usuarioConGrupos = { ...usuarioSinClave, grupos: gruposUsuario };
  const usuario = new Usuario(usuarioConGrupos);

  return usuario;
};
