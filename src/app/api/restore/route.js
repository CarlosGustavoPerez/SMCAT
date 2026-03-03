// src/app/api/restore/route.js
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request) {
    const { sql } = await request.json();
    if (!sql) {
        return NextResponse.json({ error: 'No se recibió contenido SQL' }, { status: 400 });
    }
    const connection = await pool.getConnection();
    try {
        await connection.query('SET FOREIGN_KEY_CHECKS = 0');
        await connection.query('SET SQL_MODE = ""');
        const [tablas] = await connection.query(`
            SELECT TABLE_NAME FROM information_schema.tables 
            WHERE table_schema = DATABASE()
        `);
        for (const tabla of tablas) {
            await connection.query(`TRUNCATE TABLE \`${tabla.TABLE_NAME}\``);
        }
        const statements = sql
            .split(';')
            .map(s => s.trim())
            .map(s => s.replace(/^INSERT INTO/i, 'INSERT IGNORE INTO'))
            .filter(s =>
                s.length > 0 &&
                !s.startsWith('--') &&
                !s.startsWith('/*') &&
                !s.startsWith('#')
            );
        for (const statement of statements) {
            await connection.query(statement);
        }
        const resumen = {};
for (const tabla of tablas) {
    const [rows] = await connection.query(
        `SELECT COUNT(*) as total FROM \`${tabla.TABLE_NAME}\``
    );
    resumen[tabla.TABLE_NAME] = rows[0].total;
}
await connection.query('SET FOREIGN_KEY_CHECKS = 1');
return NextResponse.json({ 
    ok: true, 
    mensaje: 'Restauración completada',
    resumen  // { Usuario: 10, Evaluacion: 45, ... }
});
        
    } catch (error) {
        return NextResponse.json(
            { error: 'Error durante la restauración: ' + error.message },
            { status: 500 }
        );
    } finally {
        connection.release();
    }
}