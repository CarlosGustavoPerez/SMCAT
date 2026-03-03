// src/app/api/backup/route.js
import { NextResponse } from 'next/server';
import mysqldump from 'mysqldump';

export async function POST() {
    try {
        const result = await mysqldump({
            connection: {
                host: process.env.DB_HOST,
                port: Number(process.env.DB_PORT),
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_NAME,
            },
        });

        const sqlContent = result.dump.schema + '\n' + result.dump.data;

        return new NextResponse(sqlContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/octet-stream',
                'Content-Disposition': `attachment; filename="smcat_backup.sql"`,
            },
        });
    } catch (error) {
        return NextResponse.json(
            { error: 'Error al generar el backup: ' + error.message },
            { status: 500 }
        );
    }
}