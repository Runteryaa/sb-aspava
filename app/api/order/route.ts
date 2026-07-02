export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { triggerPusherEdge } from '@/lib/pusherEdge';

export async function POST(request: Request) {
    try {
        const { tableId, sessionId, items, note } = await request.json();
        const db: any = await redis.get('aspava:tables');
        
        if (!db || !db.tables) return NextResponse.json({ error: 'DB error' }, { status: 500 });

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Sipariş boş olamaz' }, { status: 400 });
        }

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

        // Global sipariş loguna ekle (popüler ürün hesabı için)
        const logEntry = {
            id: newOrder.id,
            items: newOrder.items,
            timestamp: newOrder.timestamp
        };
        const rawLog: any = await redis.get('aspava:orderLog');
        const orderLog: any[] = Array.isArray(rawLog) ? rawLog : [];
        orderLog.push(logEntry);
        // 90 günden eski kayıtları temizle
        const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
        const cleanedLog = orderLog.filter((e: any) => new Date(e.timestamp).getTime() > ninetyDaysAgo);
        await redis.set('aspava:orderLog', cleanedLog);

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
