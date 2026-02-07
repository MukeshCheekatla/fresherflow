import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
    return NextResponse.json(
        {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        },
        { status: 200 }
    );
}
