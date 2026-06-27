import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redis } from '@/lib/redis';

export async function GET() {
    const cookieStore = await cookies();
    const auth = cookieStore.get('admin_auth');
    if (!auth || auth.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        let db: any = await redis.get('aspava:tables');
        if (!db) db = { tables: {}, pendingOrders: [] };
        if (!db.pendingOrders) db.pendingOrders = [];
        return NextResponse.json(db);
    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const auth = cookieStore.get('admin_auth');
    if (!auth || auth.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { action, tableId, orderId, status } = await request.json();
        let db: any = await redis.get('aspava:tables');
        if (!db) return NextResponse.json({ error: 'DB error' }, { status: 500 });
        if (!db.pendingOrders) db.pendingOrders = [];

        if (action === 'close_table' && tableId) {
            db.tables[tableId].sessionId = null;
            db.tables[tableId].orders = [];
            // Remove pending orders for this table
            db.pendingOrders = db.pendingOrders.filter((o: any) => o.tableId !== tableId);
        } else if (action === 'approve_order' && orderId) {
            const po = db.pendingOrders.find((o: any) => o.id === orderId);
            if (po) po.status = 'onaylandi';
            
            // Also update in table orders
            for (const tId in db.tables) {
                const to = db.tables[tId].orders.find((o: any) => o.id === orderId);
                if (to) to.status = 'onaylandi';
            }
            // Remove from pending
            db.pendingOrders = db.pendingOrders.filter((o: any) => o.id !== orderId);
        } else if (action === 'cancel_order' && orderId) {
            const po = db.pendingOrders.find((o: any) => o.id === orderId);
            if (po) po.status = 'iptal';
            
            for (const tId in db.tables) {
                const to = db.tables[tId].orders.find((o: any) => o.id === orderId);
                if (to) to.status = 'iptal';
            }
            }
            db.pendingOrders = db.pendingOrders.filter((o: any) => o.id !== orderId);
        } else if (action === 'update_table_order' && tableId && orderId && status) {
            if (db.tables[tableId]) {
                const to = db.tables[tableId].orders.find((o: any) => o.id === orderId);
                if (to) to.status = status;
            }
        }

        await redis.set('aspava:tables', db);
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
