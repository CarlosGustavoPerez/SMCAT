import { obtenerReportes } from '@/modulos/reportes/bll/reportBLL';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const filtros = await request.json();
    
    const evaluaciones = await obtenerReportes(filtros);

    return NextResponse.json({ success: true, evaluaciones });
  } catch (error) {
    console.error('Error en reportes:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}