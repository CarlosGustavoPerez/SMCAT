export async function loginUsuario(nombreUsuario, contrasena) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombreUsuario, contrasena }),
  });

  const data = await res.json();
  const json = data;

  // Devolvemos el objeto de respuesta completo para que el frontend pueda
  // manejar casos como KEY_EXPIRED y mostrar el modal de cambio de clave.
  if (!res.ok) {
    return json;
  }

  return json;
}
export async function logoutUsuario(idUsuario, nombreUsuario) {
  // Llamamos al nuevo endpoint /api/auth/logout
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idUsuario, nombreUsuario }),
  });
  
  // No necesitamos la respuesta del backend para el frontend,
  // pero el fetch debe ejecutarse para registrar la auditoría.
  if (!res.ok) {
     console.error('Error al intentar auditar el logout.');
     // Opcional: Manejar el error de forma silenciosa para no interrumpir el logout local.
  }
}