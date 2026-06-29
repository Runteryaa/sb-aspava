export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { triggerPusherEdge } from '@/lib/pusherEdge';

export async function POST(request: Request) {
    try {
        const { tableId, sessionId, items, note } = await request.json();
        const db: any = await redis.get('aspava:tables');
        
        if (!db || !db.tables) return NextResponse.json({ error: 'DB error' }, { status: 500 });

        if (!db.tables[tableId] || db.tables[tableId].sessionId !== sessionId) {
            return NextResponse.json({ error: 'Yetkisiz erişim veya masa kapanmış' }, { status: 403 });
        }

        if (typeof db.orderCounter !== 'number') db.orderCounter = 0;
        db.orderCounter++;

        const isAutoApprove = db.settings?.autoApprove === true;
        const newOrder = {
            id: db.orderCounter.toString(),
            tableId,
            items,
            note: note || '',
            status: isAutoApprove ? 'onaylandi' : 'bekliyor', // bekliyor, onaylandi, iptal
            timestamp: new Date().toISOString()
        };

        if (!db.pendingOrders) db.pendingOrders = [];
        
        db.tables[tableId].orders.push(newOrder);
        db.tables[tableId].lastActivity = Date.now();
        if (!isAutoApprove) {
            db.pendingOrders.push(newOrder);
        }

        await redis.set('aspava:tables', db);

        // Trigger real-time push to admin panel
        await triggerPusherEdge("admin-channel", "new-order", {
            orderId: newOrder.id,
            tableId: newOrder.tableId,
            items: newOrder.items,
            note: newOrder.note
        });

        return NextResponse.json({ success: true, orderId: newOrder.id });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
