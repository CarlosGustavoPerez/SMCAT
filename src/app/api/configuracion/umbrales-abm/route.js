import { NextResponse } from 'next/server';
import { UmbralesBLL } from '@/modulos/umbrales/bll/UmbralesBLL';

//import { PlanesMejoraBLL } from '@/modulos/planesMejora/bll/PlanesMejoraBLL'; 

const umbralesService = new UmbralesBLL();
// -------------------------------------------------------------
// GET: Obtener la configuración actual para mostrar en el formulario ABM
// -------------------------------------------------------------
export async function GET() {
    // Implementar chequeo de rol (ej: solo Admin/Supervisor) aquí si es necesario
    try {
        const data = await umbralesService.obtenerUmbralesCompletos();
        return NextResponse.json({ success: true, ...data });
    } catch (error) {
        console.error('Umbrales GET Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error al obtener la configuración de umbrales.' }, { status: 500 });
    }
}

// -------------------------------------------------------------
// PUT: Actualizar la configuración de umbrales
// -------------------------------------------------------------
export async function PUT(request) {
    // Implementar chequeo de rol (ej: solo Admin/Supervisor) aquí si es necesario
    try {
        const body = await request.json();
        const { precaucion_min, precaucion_max } = body;

        if (typeof precaucion_min !== 'number' || typeof precaucion_max !== 'number') {
            return NextResponse.json({ success: false, error: 'Valores de umbral inválidos.' }, { status: 400 });
        }

        const umbralesData = { precaucion_min, precaucion_max };

        await umbralesService.guardarUmbrales(umbralesData);
        
        return NextResponse.json({ success: true, message: 'Umbrales actualizados con éxito.' });
    } catch (error) {
        console.error('Umbrales PUT Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error al actualizar la configuración de umbrales.' }, { status: 500 });
    }
}