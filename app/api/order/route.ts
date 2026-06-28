export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import Pusher from 'pusher';

export async function POST(request: Request) {
    try {
        const { tableId, sessionId, items } = await request.json();
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
        try {
            const pusher = new Pusher({
                appId: process.env.PUSHER_APP_ID || "2171468",
                key: process.env.NEXT_PUBLIC_PUSHER_KEY || "3e97c3f16351fdefca9e",
                secret: process.env.PUSHER_SECRET || "6a4c9dbea9006d6f755b",
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
                useTLS: true,
                useFetch: true
            });
            await pusher.trigger("admin-channel", "new-order", {
                orderId: newOrder.id,
                tableId: newOrder.tableId,
                items: newOrder.items
            });
        } catch(e) { console.error('Pusher error:', e); }

        return NextResponse.json({ success: true, orderId: newOrder.id });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
