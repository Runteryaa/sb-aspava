export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import menuData from '../../../data/menu.json';

export async function GET() {
    try {
        await redis.set('aspava:menu', menuData);
        
        let tablesData = { tables: {} as any, pendingOrders: [], settings: { autoApprove: false } };
        for(let i=1; i<=10; i++) tablesData.tables[i.toString()] = { sessionId: null, orders: [], lastActivity: null };
        await redis.set('aspava:tables', tablesData);

        return NextResponse.json({ success: true, message: 'Veriler başarıyla Redis e aktarıldı!' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
