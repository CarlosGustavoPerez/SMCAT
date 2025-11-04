import React, { useState } from 'react';
import smcatLogo from '@/app/logos/SMCAT.png';
import Image from 'next/image';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import { loginUsuario } from '@/modulos/authentication/services/authService';

const LoginScreen = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    
    try {
      const usuario = await loginUsuario(credentials.username, credentials.password);
      
      if (usuario) {
        onLogin(usuario);
      } 
      if (usuario == null) {
        toast.error('Credenciales inválidas');
        setCredentials({ username: '', password: '' });
      }
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      toast.error('Error al iniciar sesión. Intente nuevamente.');
      setCredentials({ username: '', password: '' });
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              placeholder="Ingrese su contrasena"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-10 text-gray-600 hover:text-gray-900"
              aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
              tabIndex={-1}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Iniciar Sesión
          </button>
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
    
  );
};

export default LoginScreen;
