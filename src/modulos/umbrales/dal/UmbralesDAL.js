import pool from '@/lib/db'; 

// -------------------------------------------------------------------------
// Función para obtener el UMERAL CRÍTICO (usado por PlanesMejoraBLL para filtrar)
// -------------------------------------------------------------------------
export async function getUmbralCritico() {
    // Buscamos el rango_min del nivel 'Precaución', que es el límite superior de 'Crítico'.
    const sql = `
        SELECT 
            rango_min 
        FROM 
            UmbralesDesempeno
        WHERE 
            nombre_nivel = 'Precaución'
        LIMIT 1;
    `;
    const [rows] = await pool.query(sql);
    return rows.length > 0 ? rows[0].rango_min : null; 
}

// -------------------------------------------------------------------------
// Función para obtener los RANGOS COMPLETOS (usado por el ABM)
// -------------------------------------------------------------------------
export async function getUmbralesCompletos() {
    const sql = `
        SELECT 
            nombre_nivel, rango_min, rango_max
        FROM 
            UmbralesDesempeno
        ORDER BY 
            rango_min ASC;
    `;
    const [rows] = await pool.query(sql);
    return rows;
}

// -------------------------------------------------------------------------
// Función para actualizar los umbrales (usado por el ABM, requiere transacción)
// -------------------------------------------------------------------------
export async function actualizarUmbrales(umbralesData) {
    const { precaucion_min, precaucion_max } = umbralesData;

    // CÁLCULOS AUTOMÁTICOS
    const critico_max = (precaucion_min - 0.01).toFixed(2); 
    const optimo_min = (precaucion_max + 0.01).toFixed(2);
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 1. Actualizar el rango de PRECAUCIÓN
        await connection.query(
            `UPDATE UmbralesDesempeno SET rango_min = ?, rango_max = ? WHERE nombre_nivel = 'Precaución'`,
            [precaucion_min, precaucion_max]
        );

        // 2. Actualizar el rango_max de CRÍTICO
        await connection.query(
            `UPDATE UmbralesDesempeno SET rango_max = ? WHERE nombre_nivel = 'Crítico'`,
            [critico_max]
        );
        
        // 3. Actualizar el rango_min de ÓPTIMO
        await connection.query(
            `UPDATE UmbralesDesempeno SET rango_min = ? WHERE nombre_nivel = 'Óptimo'`,
            [optimo_min]
        );

        await connection.commit();
        return { success: true };
    } catch (error) {
        await connection.rollback();
        console.error("Error en actualizarUmbrales:", error);
        throw new Error("Fallo al actualizar la configuración de umbrales.");
    } finally {
        connection.release();
    }
}