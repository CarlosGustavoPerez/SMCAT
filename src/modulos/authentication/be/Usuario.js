export class Usuario {
    constructor(data) {
        if (!data.idUsuario || !data.nombreUsuario || !data.grupos) {
            throw new Error("Datos de usuario incompletos");
        }
        this.idUsuario = data.idUsuario;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.nombreUsuario = data.nombreUsuario;
        this.grupos = data.grupos;
    }

    esAnalista() {
        return this.grupos.some(grupo => grupo.nombreGrupo === 'Analista');
    }
}