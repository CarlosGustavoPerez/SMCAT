import { obtenerOperadores } from '@/modulos/reportes/bll/reportBLL';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const filtros = await request.json();
    
    const operadores = await obtenerOperadores(filtros);

    return NextResponse.json({ success: true, operadores });
  } catch (error) {
    console.error('Error al obtener operadores:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}