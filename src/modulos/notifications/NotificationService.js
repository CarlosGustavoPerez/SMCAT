export async function notificarTeamLeader(teamLeaderId, mensaje) {
    console.log(`[NOTIFICACIÓN SIMULADA]`);
    console.log(`Destinatario (Team Leader ID): ${teamLeaderId}`);
    console.log(`Mensaje: ${mensaje}`);
    console.log(`-------------------------------------`);

    // En un entorno real, aquí iría la lógica para interactuar con un servicio de email/mensajería.
    
    // Simulación de una operación asíncrona (si enviara un email, por ejemplo)
    return Promise.resolve(); 
}