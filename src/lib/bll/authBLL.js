import { login as loginService } from '../services/authService';
import { Usuario } from '../be/Usuario';

export const loginUsuario = async (nombreUsuario, contraseña) => {
  if (!nombreUsuario || !contraseña) {
    throw new Error('El usuario y la contraseña son requeridos.');
  }

  const usuarioData = await loginService(nombreUsuario, contraseña);

  const usuario = new Usuario(usuarioData);

  return usuario;
};