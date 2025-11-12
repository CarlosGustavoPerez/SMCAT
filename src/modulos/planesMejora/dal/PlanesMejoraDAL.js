import pool from '@/lib/db';
import { UmbralesBLL } from '@/modulos/umbrales/bll/UmbralesBLL';

const umbralesBLL = new UmbralesBLL();

    export async function getOperadoresBajoRendimiento(fechaInicio, fechaFin, umbralCritico) {
        if (!fechaInicio || !fechaFin || umbralCritico === undefined || umbralCritico === null) {
        throw new Error("Fechas, y el umbral crítico son requeridos para la consulta de bajo rendimiento.");
    }

        const sql = `
            SELECT 
                u.idUsuario, 
                u.nombre, 
                u.apellido, 
                -- Cálculo del promedio: SUMA DE PUNTUACIONES / 3
                -- CORRECCIÓN: Usamos ROUND() en lugar de CAST(AS DECIMAL) para evitar errores de sintaxis
                ROUND(
                    (AVG(
                        COALESCE(e.puntuacionActitud, 0) + 
                        COALESCE(e.puntuacionEstructura, 0) + 
                        COALESCE(e.puntuacionProtocolos, 0)
                    ) / 3), 
                    2
                ) as promedio
            FROM 
                Evaluacion e
            JOIN 
                Usuario u ON e.idEvaluado = u.idUsuario 
            WHERE 
                e.fechaHora BETWEEN ? AND ?
            GROUP BY 
                u.idUsuario, u.nombre, u.apellido
            HAVING 
                promedio < ? AND COUNT(e.idEvaluacion) >= 1; 
        `;
        const [rows] = await pool.query(sql, [`${fechaInicio} 00:00:00`, `${fechaFin} 23:59:59`,umbralCritico]);
        return rows;
    }
    
    export async function getTeamLeaderIdByOperador(operadorId) {
        const sql = `
            SELECT 
                idTeamLeader
            FROM 
                OperadorTeamLeader
            WHERE 
                idUsuario = ?;
        `;
        const [result] = await pool.query(sql, [operadorId]);
        return result.length > 0 ? result[0].idTeamLeader : null; 
    }

    export async function  crearPlanMejora(planData) {
        const sql = `
            INSERT INTO PlanesMejora 
            (operador_id, supervisor_id, objetivos, acciones_correctivas, fecha_creacion, fecha_finalizacion, estado)
            VALUES (?, ?, ?, ?, NOW(), ?, 'Activo');
        `;
        const { operador_id, supervisor_id, objetivos, acciones_correctivas, fecha_finalizacion } = planData;
        const [result] = await pool.query(sql, [operador_id, supervisor_id, objetivos, acciones_correctivas, fecha_finalizacion]);
        return { insertId: result.insertId }; 
    }
    
    export async function  getPlanesMejoraActivos() {
        const sql = `
            SELECT 
                p.*, 
                u_op.nombre AS nombreOperador, u_op.apellido AS apellidoOperador,
                u_sup.nombre AS nombreSupervisor, u_sup.apellido AS apellidoSupervisor
            FROM 
                PlanesMejora p
            JOIN 
                Usuario u_op ON p.operador_id = u_op.idUsuario -- Uso de operador_id
            LEFT JOIN 
                Usuario u_sup ON p.supervisor_id = u_sup.idUsuario -- Uso de supervisor_id
            WHERE 
                p.estado IN ('Activo', 'PendienteCierre')
            ORDER BY p.fecha_creacion DESC; -- Uso de fecha_creacion
        `;
        const [rows] = await pool.query(sql);
        return rows;
    }
    
    export async function  actualizarEstadoPlan(planId, nuevoEstado, resultado) {
        const sql = `
            UPDATE PlanesMejora 
            SET estado = ?, resultado = ?, fecha_finalizacion = NOW() -- Usamos fecha_finalizacion como fecha de cierre
            WHERE id = ?;
        `;
        const [result] = await pool.query(sql, [nuevoEstado, resultado, planId]);
        return { affectedRows: result.affectedRows }; 
    }
    export async function getUmbralCritico() {
    // Delegamos al UmbralesBLL para obtener el umbral de forma centralizada
    return await umbralesBLL.obtenerUmbralCritico();
}
