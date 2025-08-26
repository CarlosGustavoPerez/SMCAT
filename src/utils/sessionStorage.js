const USER_KEY = 'usuarioActual';

export const getSessionUser = () => {
    console.log('Obteniendo usuario de la sesión...');
    try {
        const userData = localStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error("Error al obtener el usuario de la sesión", e);
        return null;
    }
};

export const saveSessionUser = (user) => {
    try {
        localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
        console.error("Error al guardar el usuario en la sesión", e);
    }
};

export const clearSession = () => {
    try {
        localStorage.removeItem(USER_KEY);
    } catch (e) {
        console.error("Error al limpiar la sesión", e);
    }
};