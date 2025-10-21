export async function loginUsuario(nombreUsuario, contraseña) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombreUsuario, contraseña }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    return null; // Retornamos null en caso de fallo
  }

  return data.usuario;
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