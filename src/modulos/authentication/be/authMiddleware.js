import { NextResponse } from 'next/server';

/**
 * Middleware de Autorización. Verifica si el usuario (a través de los grupos 
 * enviados en el header) tiene alguno de los roles requeridos.
 * @param {Request} request - Objeto de la solicitud (contiene los headers).
 * @param {string[]} requiredGroups - Array de nombres de grupos necesarios (ej: ['Supervisor', 'Analista']).
 * @returns {NextResponse | null} Retorna una respuesta de error si no está autorizado, o null si la autorización es exitosa.
 */
export function requireRole(request, requiredGroups) {
    const userGroupsJsonHeader = request.headers.get('X-User-Groups-JSON'); 
    
    if (!userGroupsJsonHeader) {
        return NextResponse.json({ 
            success: false, 
            error: 'Acceso denegado. Se requiere información de sesión.' 
        }, { status: 401 }); // 401: No Autorizado
    }

    let userGroups = [];
    try {
        // Parsear el JSON del header. userGroups será: 
        // [{idGrupo: 1, nombreGrupo: 'Administrador'}, ...]
        userGroups = JSON.parse(userGroupsJsonHeader);
    } catch (e) {
        // En caso de un JSON mal formado
        return NextResponse.json({ 
            success: false, 
            error: 'Formato de autorización inválido.' 
        }, { status: 400 }); 
    }

    // SOLUCIÓN FINAL: Mapear el array de OBJETOS a un array de solo los NOMBRES (strings).
    const userGroupNames = userGroups.map(g => g.nombreGrupo);

    // Verificar si el usuario tiene al menos un rol requerido
    // isAuthorized ahora compara un array de strings (ej: ["Admin", "Analista"]) con requiredGroups.
    const isAuthorized = requiredGroups.some(reqGroup => userGroupNames.includes(reqGroup));

    if (!isAuthorized) {
        return NextResponse.json({ 
            success: false, 
            error: 'No tiene el rol requerido (Supervisor/Analista) para esta gestión.' 
        }, { status: 403 }); // 403: Prohibido
    }

    return null; // Autorización exitosa: permite continuar la ejecución de la API Route
}