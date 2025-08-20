export class Usuario {
    constructor(data) {
        if (!data.idUsuario || !data.nombreUsuario || !data.rol) {
            throw new Error("Datos de usuario incompletos");
        }
        this.idUsuario = data.idUsuario;
        this.nombre = data.nombre;
        this.apellido = data.apellido;
        this.nombreUsuario = data.nombreUsuario;
        this.rol = data.rol;
    }

    esAnalista() {
        return this.rol === 'Analista';
    }
}