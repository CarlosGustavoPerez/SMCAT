
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

export const resetPassword = async (id) => {
    const response = await fetch(`/api/admin/users/${id}/reset-password`, {
        method: 'PUT',
    });
    if (!response.ok) {
        throw new Error('Error al resetear la clave.');
    }
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