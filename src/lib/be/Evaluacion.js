export class Evaluacion {
  constructor(id, fechaHora, duracion, actitud, estructura, protocolos, observaciones, idEvaluador, idEvaluado, idCampaña) {
    if (!idEvaluado) throw new Error("Seleccione Operador");
    if (!fechaHora) throw new Error("Ingrese Fecha");
    if (!duracion) throw new Error("Ingrese Duración de Llamada");
    if (!idCampaña) throw new Error("Seleccione Campaña");
    if (!actitud) throw new Error("Seleccione Actitud");
    if (!estructura) throw new Error("Seleccione Estructura");
    if (!protocolos) throw new Error("Seleccione Protocolo");
    // Asignación y/o transformación de datos
    this.id = id;
    this.fechaHora = fechaHora;
    this.duracion = `00:${duracion}`; // Aquí podrías hacer la transformación
    this.actitud = actitud;
    this.estructura = estructura;
    this.protocolos = protocolos;
    this.observaciones = observaciones;
    this.idEvaluador = idEvaluador;
    this.idEvaluado = idEvaluado;
    this.idCampaña = idCampaña;
  }
}
