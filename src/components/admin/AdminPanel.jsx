// src/components/admin/AdminPanel.jsx

import React, { useState } from 'react';
import UserManagement from './UserManagement';
import GroupManagement from './GroupManagement';

const AdminPanel = ({ usuario }) => {
    const [currentAdminView, setCurrentAdminView] = useState('users');

    const renderAdminView = () => {
        switch (currentAdminView) {
            case 'users':
                return <UserManagement />;
            case 'groups':
                return <GroupManagement />;
            default:
                return <UserManagement />;
        }
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Seguridad</h1>
            <div className="flex mb-6 border-b border-gray-200">
                <button
                    onClick={() => setCurrentAdminView('users')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                        currentAdminView === 'users' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                    Usuarios
                </button>
                <button
                    onClick={() => setCurrentAdminView('groups')}
                    className={`px-4 py-2 font-medium text-sm transition-colors duration-200 ${
                        currentAdminView === 'groups' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-blue-600'
                    }`}
                >
                    Grupos
                </button>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
                {renderAdminView()}
            </div>
        </div>
    );
};

export default AdminPanel;
