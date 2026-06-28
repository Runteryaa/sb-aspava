export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';


export async function POST(request: Request) {
    try {
        const { tableId, sessionId, items } = await request.json();
        const db: any = await redis.get('aspava:tables');
        
        if (!db || !db.tables) return NextResponse.json({ error: 'DB error' }, { status: 500 });

        if (!db.tables[tableId] || db.tables[tableId].sessionId !== sessionId) {
            return NextResponse.json({ error: 'Yetkisiz erişim veya masa kapanmış' }, { status: 403 });
        }

        const newOrder = {
            id: Date.now().toString(),
            tableId,
            items,
            status: 'bekliyor', // bekliyor, onaylandi, iptal
            timestamp: new Date().toISOString()
        };

        if (!db.pendingOrders) db.pendingOrders = [];
        
        db.tables[tableId].orders.push(newOrder);
        db.tables[tableId].lastActivity = Date.now();
        db.pendingOrders.push(newOrder);

        await redis.set('aspava:tables', db);

        // Trigger real-time push to admin panel
        try {
            const Pusher = require('pusher');
            const pusher = new Pusher({
                appId: "2171329",
                key: "02d39ab666eca7e30f1c",
                secret: "f101cb1063445ab39be8",
                cluster: "eu",
                useTLS: true
            });
            await pusher.trigger("admin-channel", "new-order", {
                orderId: newOrder.id
            });
        } catch (err) {
            console.error("Pusher error:", err);
        }

        return NextResponse.json({ success: true, orderId: newOrder.id });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
