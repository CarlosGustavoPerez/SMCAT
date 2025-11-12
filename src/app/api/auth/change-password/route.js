import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { updatePassword } from '@/modulos/admin/dal/adminDAL';

export async function POST(request) {
    try {
        console.log('Received change-password request');

        const { idUsuario, oldPassword, newPassword } = await request.json();
        console.log('Parsed request body:', { idUsuario, oldPassword, newPassword });
        if (!idUsuario || !newPassword) {
            return NextResponse.json({ message: 'Faltan datos' }, { status: 400 });
        }

        // Obtener usuario por id no existe función directa, pero podemos buscar por username si es necesario.
        // Para validar la contraseña actual necesitamos el hash. Vamos a consultar la tabla Usuario por id.
    const query = 'SELECT idUsuario, nombreUsuario, contrasena FROM Usuario WHERE idUsuario = ?';
    const [rows] = await pool.query(query, [idUsuario]);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        const usuarioDB = rows[0];

        // Si se envió oldPassword, verificarla
        if (oldPassword) {
            const isMatch = await bcrypt.compare(oldPassword, usuarioDB.contrasena);
            if (!isMatch) {
                return NextResponse.json({ message: 'Contraseña actual incorrecta' }, { status: 401 });
            }
        }

        // Hash y actualizar contraseña
        const salt = await bcrypt.genSalt(12);
        const hashed = await bcrypt.hash(newPassword, salt);
        const result = await updatePassword(idUsuario, hashed);

        if (!result || !result.success) {
            return NextResponse.json({ message: 'Fallo al actualizar contraseña' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Contraseña actualizada' }, { status: 200 });
    } catch (error) {
        console.error('Error en change-password route:', error);
        return NextResponse.json({ message: 'Error interno' }, { status: 500 });
    }
}
