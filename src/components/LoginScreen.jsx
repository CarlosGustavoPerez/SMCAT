import React, { useState } from 'react';
import smcatLogo from '@/app/logos/SMCAT.png';
import Image from 'next/image';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import { loginUsuario } from '@/modulos/authentication/services/authService';
import { useRouter } from 'next/navigation';
import ChangePasswordModal from '@/components/ChangePasswordModal';

const LoginScreen = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const [showChangeModal, setShowChangeModal] = useState(false);
  const [changeUser, setChangeUser] = useState(null);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await loginUsuario(credentials.username, credentials.password);

      if (!res) {
        toast.error('Error al iniciar sesión. Intente nuevamente.');
        setCredentials({ username: '', password: '' });
        setLoading(false);
        return;
      }

      // Caso: clave vencida -> mostrar modal para cambiar contraseña
      if (res.error && res.errorCode === 'KEY_EXPIRED') {
        setChangeUser({ idUsuario: res.idUsuario, nombreUsuario: res.nombreUsuario });
        setShowChangeModal(true);
        setLoading(false);
        return;
      }

      if (res.success && res.usuario) {
        onLogin(res.usuario);
        // Redirigir al dashboard por defecto
        router.push('/'); // app root shows dashboard by default; or '/dashboard' if route exists
      } else {
        toast.error('Credenciales inválidas');
        setCredentials({ username: '', password: '' });
        setLoading(false);
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión. Intente nuevamente.');
      setCredentials({ username: '', password: '' });
      setLoading(false);
    }
  };

  // Maneja submit con Enter
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Image
            src={smcatLogo}
            alt="SMCAT Logo"
            height={128}
            className="mx-auto mb-2"
          />
          <p className="text-gray-600">Sistema de Monitoreo de Calidad de Atención Telefónica.</p>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Usuario</label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ingrese su usuario"
              autoFocus
            />
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">contrasena</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="Ingrese su contrasena"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
              className="absolute right-3 top-10 text-gray-600 hover:text-gray-900 disabled:opacity-50"
              aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Iniciando sesión...
              </>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
      {showChangeModal && changeUser && (
        <ChangePasswordModal
          userId={changeUser.idUsuario}
          nombreUsuario={changeUser.nombreUsuario}
          onClose={() => setShowChangeModal(false)}
          onChanged={async (newPassword) => {
            // Después de cambiar la contraseña, volver a mostrar el login
            // para que inicie sesión nuevamente con la nueva contraseña
            toast.success('Contraseña cambiada exitosamente. Por favor inicie sesión nuevamente.');
            setShowChangeModal(false);
            setCredentials({ username: changeUser.nombreUsuario, password: '' });
            setChangeUser(null);
          }}
        />
      )}
    </div>
    
  );
};

export default LoginScreen;
