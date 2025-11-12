import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ChangePasswordModal = ({ userId, nombreUsuario, onClose, onChanged }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Las contraseñas no coinciden');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('La nueva contraseña debe tener al menos 8 caracteres');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idUsuario: userId, oldPassword, newPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.message || 'Error cambiando la contraseña');
                setLoading(false);
                return;
            }
            toast.success('Contraseña cambiada correctamente');
            setLoading(false);
            onChanged && onChanged(newPassword);
            onClose && onClose();
        } catch (error) {
            console.error('Error cambiando la contraseña:', error);
            toast.error('Error cambiando la contraseña');
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Cambiar contraseña para {nombreUsuario}</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="block text-sm text-gray-700">Contraseña actual</label>
                        <div className="relative">
                            <input 
                                type={showOldPassword ? 'text' : 'password'} 
                                value={oldPassword} 
                                onChange={(e) => setOldPassword(e.target.value)} 
                                className="w-full p-2 border rounded text-gray-500" 
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowOldPassword(!showOldPassword)}
                                className="absolute right-3 top-2 text-gray-600 hover:text-gray-900"
                                aria-label={showOldPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                tabIndex={-1}
                            >
                                {showOldPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm text-gray-700">Nueva contraseña</label>
                        <div className="relative">
                            <input 
                                type={showNewPassword ? 'text' : 'password'} 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                className="w-full p-2 border rounded text-gray-500" 
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-2 text-gray-600 hover:text-gray-900"
                                aria-label={showNewPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                tabIndex={-1}
                            >
                                {showNewPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>
                    <div className="mb-3">
                        <label className="block text-sm text-gray-700">Confirmar nueva contraseña</label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? 'text' : 'password'} 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                className="w-full p-2 border rounded text-gray-500"  
                                required 
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-2 text-gray-600 hover:text-gray-900"
                                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                                tabIndex={-1}
                            >
                                {showConfirmPassword ? '🙈' : '👁️'}
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded text-gray-800">Cancelar</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Cambiando...' : 'Cambiar'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ChangePasswordModal;
