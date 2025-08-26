export class Usuario {
    constructor(data) {
        // Valida que los datos esenciales estén presentes.
        if (!data.idUsuario || !data.nombreUsuario || !data.grupos) {
            throw new Error("Datos de usuario incompletos");
        }
        this.idUsuario = data.idUsuario;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.nombreUsuario = data.nombreUsuario;
        this.grupos = data.grupos; // Almacena el array de grupos
    }

    esAnalista() {
        // Itera sobre el array de grupos para verificar si el usuario es un Analista.
        return this.grupos.some(grupo => grupo.nombreGrupo === 'Analista');
    }
}