"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, TrendingUp } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Image from 'next/image';
import smcatLogo from './logos/SMCAT.png';
import { obtenerUsuarioDeSesion, guardarUsuarioEnSesion, limpiarSesion } from '@/lib/services/sessionService';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/DashBoard';
import EvaluationForm from '@/components/EvaluationForms';
import Reports from '@/components/Reports';

// Componente Principal con Navegación
const SMCATApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    const usuario = obtenerUsuarioDeSesion();
    if (usuario) {
      setUsuarioActual(usuario);
      setIsLoggedIn(true);
    }
  }, []);

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={(usuario) => {
          guardarUsuarioEnSesion(usuario);
          setIsLoggedIn(true);
          setUsuarioActual(usuario);
        }}
      />
    );
  }

    const baseMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'evaluation', label: 'Nueva Evaluación', icon: FileText, visibleFor: ['Analista'] },
    { id: 'reports', label: 'Reportes', icon: TrendingUp }
  ];

  const menuItems = baseMenu.filter(
    (item) =>
      !item.visibleFor || item.visibleFor.includes(usuarioActual.rol)
  );


  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard usuario={usuarioActual} />;
      case 'evaluation':
        return usuarioActual && (
          <EvaluationForm
            usuario={usuarioActual}
            onEvaluacionGuardada={() => setCurrentView('dashboard')}
          />
        );
      case 'reports':
        return <Reports usuario={usuarioActual} />;
      default:
        return <Dashboard usuario={usuarioActual} />;
    }
  };

  return (
    <>
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <Image
            src={smcatLogo}
            alt="SMCAT Logo"
            height={64}
            className="mx-auto mb-2"
          />
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-gray-50 transition duration-200 ${
                currentView === item.id
                  ? 'bg-blue-50 border-r-2 border-blue-500 text-blue-600'
                  : 'text-gray-700'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-6">
          <button
            onClick={() => {
              limpiarSesion();
              setIsLoggedIn(false);
              setUsuarioActual(null);
              localStorage.removeItem('usuarioActual');
            }}
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">{renderCurrentView()}</div>
    </div>
    <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
};

export default SMCATApp;
