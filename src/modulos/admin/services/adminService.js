
export const getUsers = async () => {
    const response = await fetch('/api/admin/users');
    if (!response.ok) {
        throw new Error('Error al obtener la lista de usuarios.');
    }
    return response.json();
};

export const addUser = async (userData) => {
    const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        throw new Error('Error al agregar el usuario.');
    }
    return response.json();
};

export const updateUser = async (id, userData) => {
    const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });
    if (!response.ok) {
        throw new Error('Error al modificar el usuario.');
    }
};

export const deleteUser = async (id) => {
    const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Error al eliminar el usuario.');
    }
};

import { getSessionUser } from '@/lib/utils/sessionStorage';

export const resetPassword = async (user) => {
    const userId = user.idUsuario;
    const sessionUser = getSessionUser();

    const headers = {
        'Content-Type': 'application/json',
    };

    if (sessionUser) {
        // Enviar info del usuario que realiza la acción para auditoría en el backend
        headers['X-User-JSON'] = JSON.stringify({ idUsuario: sessionUser.idUsuario, nombreUsuario: sessionUser.nombreUsuario });
        // También enviar los grupos para que el middleware pueda autorizarel si fuese necesario
        headers['X-User-Groups-JSON'] = JSON.stringify(sessionUser.grupos || []);
    }

    const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST', 
        headers,
        body: JSON.stringify({}), 
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al resetear la clave.');
    }
    
    return await response.json();
};

export const getGroups = async () => {
    const response = await fetch('/api/admin/groups');
    if (!response.ok) {
        throw new Error('Error al obtener la lista de grupos.');
    }
    return response.json();
};

export const addGroup = async (groupName) => {
    const response = await fetch('/api/admin/groups', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nombreGrupo: groupName }),
    });
    if (!response.ok) {
        throw new Error('Error al agregar el grupo.');
    }
    return response.json();
};

export const updateGroup = async (id, groupData) => {
    const response = await fetch(`/api/admin/groups/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(groupData),
    });
    if (!response.ok) {
        throw new Error('Error al modificar el grupo.');
    }
};

export const deleteGroup = async (id) => {
    const response = await fetch(`/api/admin/groups/${id}`, {
        method: 'DELETE',
    });
    if (!response.ok) {
        throw new Error('Error al eliminar el grupo.');
    }
};

export const getGroupsByUserId = async (idUsuario) => {
    try {
        const response = await fetch(`/api/admin/users/${idUsuario}/groups`);
        if (response.status === 404) {
            // No se encontraron grupos, retornamos un array vacío sin lanzar un error.
            return [];
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al obtener grupos del usuario');
        }

        const grupos = await response.json();
        return grupos;

    } catch (error) {
        console.error('Error en el servicio getGroupsByUserId:', error);
        throw error;
    }
};

export const assignGroupToUser = async (idUsuario, idGrupo) => {
    const response = await fetch(`/api/admin/users/${idUsuario}/groups`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idGrupo }),
    });
    if (!response.ok) {
        throw new Error('Error al asignar el grupo al usuario.');
    }
};

export const removeGroupFromUser = async (idUsuario, idGrupo) => {
    const response = await fetch(`/api/admin/users/${idUsuario}/groups`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idGrupo }),
    });
    if (!response.ok) {
        throw new Error('Error al remover el grupo del usuario.');
    }
};

export const getTeamLeaders = async () => {
    const response = await fetch('/api/admin/team-leaders');
    if (!response.ok) {
        throw new Error('Error al obtener los Team Leaders.');
    }
    return response.json();
};
export const getTeamLeaderByUserId = async (idUsuario) => {
    // Necesitas una API route /api/admin/users/[id]/teamleader
    const response = await fetch(`/api/admin/users/${idUsuario}/teamleader`); 
    if (!response.ok) {
        throw new Error('Error al obtener Team Leader del usuario.');
    }
    return response.json(); // Esperamos { idTeamLeader: '...' } o { idTeamLeader: null }
};