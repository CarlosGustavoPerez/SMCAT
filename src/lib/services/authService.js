export async function loginUsuario(nombreUsuario, contraseña) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nombreUsuario, contraseña }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Error al iniciar sesión');
  }

  return data.usuario;
}
