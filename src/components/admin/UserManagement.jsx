import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash, RotateCcw } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    resetPassword,
    getGroups,
    assignGroupToUser,
    removeGroupFromUser,
    getGroupsByUserId
} from '@/modulos/admin/services/adminService';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userForm, setUserForm] = useState({ nombre: '', apellido: '', nombreUsuario: '', contraseña: '', rol: 'Analista', idTeamLeader: null });
    const [userGroups, setUserGroups] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const usersData = await getUsers();
            const groupsData = await getGroups();
            setGroups(groupsData); // Guardamos los grupos también

            // 1. Obtener los IDs de los grupos para todos los usuarios en paralelo
            const usersWithGroupsPromises = usersData.map(async (user) => {
                // getGroupsByUserId devuelve un array de objetos grupo: [{ idGrupo: 10, nombreGrupo: 'Grupo A' }, ...]
                const userGroups = await getGroupsByUserId(user.idUsuario);
                
                // Adjuntar los nombres de los grupos como una string separada por comas
                const groupNames = userGroups.map(g => g.nombreGrupo).join(', ');
                return {
                    ...user,
                    groupNames: groupNames // Nueva propiedad para mostrar en la grilla
                };
            });

            // 2. Esperar a que todas las promesas se resuelvan
            const usersWithGroups = await Promise.all(usersWithGroupsPromises);
            setUsers(usersWithGroups);
        } catch (error) {
            toast.error('Error al cargar datos: ' + error.message);
        }
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setUserForm({ nombre: '', apellido: '', nombreUsuario: '', contraseña: '', rol: 'Analista', idTeamLeader: null });
        setIsModalOpen(true);
    };

    const handleEditClick = (user) => {
        setIsEditing(true);
        setSelectedUser(user);
        setUserForm({
            nombre: user.nombre,
            apellido: user.apellido,
            nombreUsuario: user.nombreUsuario,
            contraseña: '', // No cargar la contraseña por seguridad
            rol: user.rol,
            idTeamLeader: user.idTeamLeader
        });
        setIsModalOpen(true);
    };

    const handleGroupClick = async (user) => {
        setSelectedUser(user);
        try {
            const userGroupsData = await getGroupsByUserId(user.idUsuario);
            setUserGroups(userGroupsData.map(g => g.idGrupo));
            setIsGroupModalOpen(true);
        } catch (error) {
            toast.error('Error al cargar grupos del usuario: ' + error.message);
        }
    };

    const handleResetPassword = async (idUsuario) => {
        if (window.confirm('¿Está seguro de que desea resetear la clave de este usuario?')) {
            try {
                await resetPassword(idUsuario);
                toast.success('Clave reseteada correctamente.');
            } catch (error) {
                toast.error('Error al resetear clave: ' + error.message);
            }
        }
    };

    const handleDelete = async (idUsuario) => {
        if (window.confirm('¿Está seguro de que desea eliminar este usuario?')) {
            try {
                await deleteUser(idUsuario);
                toast.success('Usuario eliminado correctamente.');
                fetchData();
            } catch (error) {
                toast.error('Error al eliminar usuario: ' + error.message);
            }
        }
    };

    // Fragmento a modificar en UserManagement.jsx
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                // Lógica de edición
                await updateUser(selectedUser.idUsuario, userForm);
                toast.success('Usuario modificado correctamente.');
            } else {
                // Lógica de AGREGAR (Aplicar generación de usuario/contraseña por defecto)

                // Limpiamos y convertimos a minúsculas para asegurar el formato 'cperez'
                const nombreLimpio = userForm.nombre.trim();
                const apellidoLimpio = userForm.apellido.trim();

                if (!nombreLimpio || !apellidoLimpio) {
                    throw new Error('Nombre y Apellido son obligatorios para generar credenciales.');
                }
                
                const defaultUsername = (nombreLimpio.charAt(0) + apellidoLimpio).toLowerCase();
                
                const newUserForm = {
                    ...userForm,
                    nombreUsuario: defaultUsername, // Asignar el nombre de usuario generado
                    contraseña: defaultUsername,    // Asignar la contraseña generada (por defecto)
                };

                await addUser(newUserForm); // Usamos el nuevo objeto con credenciales
                toast.success('Usuario agregado correctamente.');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al guardar usuario: ' + error.message);
        }
    };

    const handleGroupChange = async (groupId, isChecked) => {
        try {
            if (isChecked) {
                await assignGroupToUser(selectedUser.idUsuario, groupId);
                setUserGroups([...userGroups, groupId]);
                toast.success('Grupo asignado correctamente.');
            } else {
                await removeGroupFromUser(selectedUser.idUsuario, groupId);
                setUserGroups(userGroups.filter(id => id !== groupId));
                toast.success('Grupo removido correctamente.');
            }
        } catch (error) {
            toast.error('Error al actualizar grupos: ' + error.message);
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Gestión de Usuarios</h2>
                <button
                    onClick={handleAddClick}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar Usuario
                </button>
            </div>

            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grupos</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.idUsuario}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.nombre} {user.apellido}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.nombreUsuario}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.groupNames}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditClick(user)} title="Editar" className="text-blue-600 hover:text-blue-900">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(user.idUsuario)} title="Eliminar" className="text-red-600 hover:text-red-900">
                                            <Trash className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleResetPassword(user.idUsuario)} title="Resetear clave" className="text-gray-600 hover:text-gray-900">
                                            <RotateCcw className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleGroupClick(user)} title="Asignar grupos" className="text-purple-600 hover:text-purple-900">
                                            Grupos
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Usuario */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-lg">
                        <h2 className="text-2xl font-bold mb-4 text-gray-900">{isEditing ? 'Modificar Usuario' : 'Agregar Usuario'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                <input type="text" value={userForm.nombre} onChange={(e) => setUserForm({...userForm, nombre: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Apellido</label>
                                <input type="text" value={userForm.apellido} onChange={(e) => setUserForm({...userForm, apellido: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
                            </div>
                            <div className="flex justify-end space-x-4 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400">
                                    Cancelar
                                </button>
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                                    {isEditing ? 'Guardar Cambios' : 'Agregar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal de Grupos */}
            {isGroupModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Grupos para {selectedUser?.nombre} {selectedUser?.apellido}</h2>
                        <div className="space-y-4">
                            {groups.map(group => (
                                <div key={group.idGrupo} className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id={`group-${group.idGrupo}`}
                                        checked={userGroups.includes(group.idGrupo)}
                                        onChange={(e) => handleGroupChange(group.idGrupo, e.target.checked)}
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                    />
                                    <label htmlFor={`group-${group.idGrupo}`} className="ml-3 text-gray-700 font-medium">{group.nombreGrupo}</label>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={() => setIsGroupModalOpen(false)} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
