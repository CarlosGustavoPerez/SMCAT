import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';
import { updatePassword } from '@/modulos/admin/dal/adminDAL';

export async function POST(request) {
    try {
        const { idUsuario, oldPassword, newPassword } = await request.json();
        if (!idUsuario || !newPassword) {
            return NextResponse.json({ message: 'Faltan datos' }, { status: 400 });
        }
    const query = 'SELECT idUsuario, nombreUsuario, contrasena FROM Usuario WHERE idUsuario = ?';
    const [rows] = await pool.query(query, [idUsuario]);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
        }

        const usuarioDB = rows[0];

        if (oldPassword) {
            const isMatch = await bcrypt.compare(oldPassword, usuarioDB.contrasena);
            if (!isMatch) {
                return NextResponse.json({ message: 'Contraseña actual incorrecta' }, { status: 401 });
            }
        }

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
