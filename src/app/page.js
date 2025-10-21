"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, FileText, TrendingUp, ShieldCheck, User, Calendar,CheckSquare, SearchCheck } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import Image from 'next/image';
import smcatLogo from './logos/SMCAT.png';
import { getSessionUser, saveSessionUser, clearSession } from '@/lib/utils/sessionStorage';
import LoginScreen from '@/components/LoginScreen';
import Dashboard from '@/components/DashBoard';
import PlanMejora from '@/components/PlanMejora';
import EvaluationForm from '@/components/EvaluationForms';
import Reports from '@/components/Reports';
import AdminPanel from '@/components/admin/AdminPanel';
import AuditoriaPanel from '@/components/AuditoriaSesionesReport';
import UmbralesPanel from '@/components/UmbralesABM';

import { logoutUsuario } from '@/modulos/authentication/services/authService';

// Componente Principal con Navegación
const SMCATApp = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [currentView, setCurrentView] = useState('dashboard');
    const [usuarioActual, setUsuarioActual] = useState(null);

    const userHasPermission = (user, requiredGroups) => {
        // Corrección: Verifica que 'user' no sea null antes de continuar.
        if (!user || !requiredGroups || requiredGroups.length === 0) {
            return false;
        }
        const userGroupNames = user.grupos?.map(g => g.nombreGrupo) || [];
        return requiredGroups.some(reqGroup => userGroupNames.includes(reqGroup));
    };

    useEffect(() => {
        const usuario = getSessionUser();
        if (usuario) {
            setUsuarioActual(usuario);
            setIsLoggedIn(true);
            const initialView = getInitialView(usuario);
            setCurrentView(initialView);
        }
        else{
            
        }
    }, []);

    const getInitialView = (usuario) => {
        const userGroups = usuario.grupos?.map(g => g.nombreGrupo) || [];
        if (userGroups.includes('Administrador')) {
            return 'admin';
        }
        return 'dashboard';
    };

    if (!isLoggedIn) {
        return (
            <LoginScreen
                onLogin={(usuario) => {
                    saveSessionUser(usuario);
                    setIsLoggedIn(true);
                    setUsuarioActual(usuario);
                }}
            />
        );
    }
    
    const handleLogout = async () => {
        if (usuarioActual && usuarioActual.idUsuario) {
        await logoutUsuario(usuarioActual.idUsuario, usuarioActual.nombreUsuario);
    }
        clearSession();
        setIsLoggedIn(false);
        setUsuarioActual(null);
    };

    // Menú base con los grupos requeridos.
    const baseMenu = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart3, requiredGroups: ['Operador', 'Analista', 'TeamLeader'] },
        { id: 'evaluation', label: 'Nueva Evaluación', icon: FileText, requiredGroups: ['Analista'] },
        { id: 'reports', label: 'Reportes', icon: TrendingUp, requiredGroups: ['Operador', 'Analista', 'TeamLeader'] },
        { id: 'planMejora', label: 'Planes de Mejora', icon: CheckSquare, requiredGroups: ['Analista', 'TeamLeader', 'Supervisor'] }, 
        { id: 'admin', label: 'Gestión de Seguridad', icon: ShieldCheck, requiredGroups: ['Administrador'] },
        { id: 'auditoriaSesion', label: 'Auditoría de Sesiones', icon: SearchCheck, requiredGroups: ['Administrador'] },
        { id: 'umbralesABM', label: 'Umbrales de Desempeño', icon: TrendingUp, requiredGroups: ['Administrador'] },
    ];

    // Filtra los ítems del menú, verificando que usuarioActual exista.
    const menuItems = baseMenu.filter(
        (item) => usuarioActual && userHasPermission(usuarioActual, item.requiredGroups),
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
            case 'planMejora':
                return <PlanMejora usuario={usuarioActual}/>; 
            case 'admin':
                return usuarioActual && <AdminPanel usuario={usuarioActual} />;
            case 'auditoriaSesion':
                return usuarioActual && <AuditoriaPanel usuario={usuarioActual} />;
            case 'umbralesABM':
                return usuarioActual && <UmbralesPanel usuario={usuarioActual} />;
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
                                } cursor-pointer` }
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.label}
                            </button>
                        ))}
                    </nav>
                    <div className="absolute bottom-6 left-6">
                        <button
                            onClick={handleLogout}
                            className="text-gray-500 hover:text-gray-700 text-sm"
                        >
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    {/* VERIFICACIÓN AGREGADA AQUÍ */}
                    {usuarioActual && (
                        <div className="p-2 flex justify-end items-center mb-2">
                            <div className="flex items-center mr-3">
                                <User className="h-5 w-5 mr-2 text-gray-500" />
                                <span className="text-gray-700">
                                    Hola, <span className="font-semibold">{usuarioActual.nombre}</span>
                                </span>
                            </div>
                            <div className="flex items-center">
                                <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                                <span  className="text-gray-700">
                                    Hoy,{' '}
                                    {new Date().toLocaleDateString('es-ES', {
                                        day: '2-digit',
                                        month: 'long',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                    <hr className="border-gray-200" />
                    {renderCurrentView()}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={3000} />
        </>
    );
};

export default SMCATApp;
