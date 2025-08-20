// src/components/admin/GroupManagement.jsx

import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit, Trash } from 'lucide-react';
import { toast } from 'react-toastify';
import { getGroups, addGroup, updateGroup, deleteGroup } from '@/lib/services/adminService';

const GroupManagement = () => {
    const [groups, setGroups] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupForm, setGroupForm] = useState({ nombreGrupo: '' });

    useEffect(() => {
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const groupsData = await getGroups();
            setGroups(groupsData);
        } catch (error) {
            toast.error('Error al cargar grupos: ' + error.message);
        }
    };

    const handleAddClick = () => {
        setIsEditing(false);
        setGroupForm({ nombreGrupo: '' });
        setIsModalOpen(true);
    };

    const handleEditClick = (group) => {
        setIsEditing(true);
        setSelectedGroup(group);
        setGroupForm({ nombreGrupo: group.nombreGrupo });
        setIsModalOpen(true);
    };

    const handleDelete = async (idGrupo) => {
        if (window.confirm('¿Está seguro de que desea eliminar este grupo?')) {
            try {
                await deleteGroup(idGrupo);
                toast.success('Grupo eliminado correctamente.');
                fetchGroups();
            } catch (error) {
                toast.error('Error al eliminar grupo: ' + error.message);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await updateGroup(selectedGroup.idGrupo, groupForm);
                toast.success('Grupo modificado correctamente.');
            } else {
                await addGroup(groupForm);
                toast.success('Grupo agregado correctamente.');
            }
            setIsModalOpen(false);
            fetchGroups();
        } catch (error) {
            toast.error('Error al guardar grupo: ' + error.message);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-700">Gestión de Grupos</h2>
                <button
                    onClick={handleAddClick}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
                >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Agregar Grupo
                </button>
            </div>
            
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre del Grupo</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {groups.map(group => (
                            <tr key={group.idGrupo}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{group.nombreGrupo}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleEditClick(group)} title="Editar" className="text-blue-600 hover:text-blue-900">
                                            <Edit className="h-5 w-5" />
                                        </button>
                                        <button onClick={() => handleDelete(group.idGrupo)} title="Eliminar" className="text-red-600 hover:text-red-900">
                                            <Trash className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal de Grupo */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
                        <h2 className="text-2xl font-bold mb-4">{isEditing ? 'Modificar Grupo' : 'Agregar Grupo'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Nombre del Grupo</label>
                                <input type="text" value={groupForm.nombreGrupo} onChange={(e) => setGroupForm({...groupForm, nombreGrupo: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" required />
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
        </div>
    );
};

export default GroupManagement;
