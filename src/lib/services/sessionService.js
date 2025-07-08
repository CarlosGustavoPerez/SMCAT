const STORAGE_KEY = 'usuarioActual';

export function guardarUsuarioEnSesion(usuario) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuario));
}

export function obtenerUsuarioDeSesion() {
  const usuario = localStorage.getItem(STORAGE_KEY);
  return usuario ? JSON.parse(usuario) : null;
}

export function limpiarSesion() {
  localStorage.removeItem(STORAGE_KEY);
}
