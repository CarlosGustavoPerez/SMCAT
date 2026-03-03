import { NextResponse } from 'next/server';

export async function PUT() {
    return NextResponse.json(
        { error: 'Funcionalidad no implementada.' },
        { status: 501 }
    );
}

export async function DELETE() {
    return NextResponse.json(
        { error: 'Funcionalidad no implementada.' },
        { status: 501 }
    );
}