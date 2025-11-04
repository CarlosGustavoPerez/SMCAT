import { NextResponse } from 'next/server';
import { UmbralesBLL } from '@/modulos/umbrales/bll/UmbralesBLL';

const umbralesService = new UmbralesBLL();
export async function GET() {
    try {
        const data = await umbralesService.obtenerUmbralesCompletos();
        return NextResponse.json({ success: true, ...data });
    } catch (error) {
        console.error('Umbrales GET Error:', error);
        return NextResponse.json({ success: false, error: error.message || 'Error al obtener la configuración de umbrales.' }, { status: 500 });
    }
}
export async function PUT(request) {
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