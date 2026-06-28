export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import menuData from '../../../data/menu.json';
import tablesData from '../../../data/tables.json';

export async function GET() {
    try {
        await redis.set('aspava:menu', menuData);
        await redis.set('aspava:tables', tablesData);

        return NextResponse.json({ success: true, message: 'Veriler başarıyla Redis e aktarıldı!' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
