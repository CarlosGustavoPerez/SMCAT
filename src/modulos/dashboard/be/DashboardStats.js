export class DashboardStats {
  constructor(data) {
    this.evaluacionesHoy = data.evaluacionesHoy || 0;
    this.promedioHoy = data.promedioHoy || 0;
    this.recientes = data.recientes || [];
  }
}