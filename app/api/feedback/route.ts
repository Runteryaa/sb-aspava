export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const { rating, comment, tableId } = await request.json();
        if (!rating) return NextResponse.json({ error: 'Rating required' }, { status: 400 });

        const rawLog: any = await redis.get('aspava:feedbacks');
        const feedbacks: any[] = Array.isArray(rawLog) ? rawLog : [];
        
        feedbacks.unshift({
            rating,
            comment,
            tableId: tableId || 'Bilinmiyor',
            timestamp: new Date().toISOString()
        });

        // Keep last 100 feedbacks
        if (feedbacks.length > 100) feedbacks.length = 100;
        
        await redis.set('aspava:feedbacks', feedbacks);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
