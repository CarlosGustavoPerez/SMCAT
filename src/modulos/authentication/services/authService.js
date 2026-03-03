// src/modulos/authentication/services/authService.js
export async function loginUsuario(nombreUsuario, contrasena) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombreUsuario, contrasena }),
  });

  const data = await res.json();
  const json = data;
  if (!res.ok) {
    return json;
  }

  return json;
}
export async function logoutUsuario(idUsuario, nombreUsuario) {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUsuario, nombreUsuario }),
  });
  if (!res.ok) {
     console.error('Error al intentar auditar el logout.');
  }
}