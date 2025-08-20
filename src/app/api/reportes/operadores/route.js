import { obtenerOperadores } from '@/lib/bll/reportBLL';
import { NextResponse } from 'next/server';

// Ruta de la API - Responsable de la comunicación HTTP.
// Su única función es recibir la solicitud, llamar a la BLL y enviar la respuesta.
// No contiene lógica de negocio ni consultas a la base de datos.

export async function POST(request) {
  try {
    const filtros = await request.json();
    
    // Llama a la función de la capa de lógica de negocio (BLL)
    const operadores = await obtenerOperadores(filtros);

    return NextResponse.json({ success: true, operadores });
  } catch (error) {
    console.error('Error al obtener operadores:', error);
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}