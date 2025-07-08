export const calcularPromediosPorOperador = (evaluaciones) => {
  const acumulador = {};

  evaluaciones.forEach((ev) => {
    const nombre = `${ev.nombreEvaluado} ${ev.apellidoEvaluado}`;
    if (!acumulador[nombre]) {
      acumulador[nombre] = { total: 0, cantidad: 0 };
    }
    const promedio = (ev.puntuacionActitud + ev.puntuacionEstructura + ev.puntuacionProtocolos) / 3;
    acumulador[nombre].total += promedio;
    acumulador[nombre].cantidad += 1;
  });

  return Object.entries(acumulador).map(([nombre, datos]) => ({
    operator: nombre,
    avgScore: (datos.total / datos.cantidad).toFixed(1),
  }));
};
