export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redis, cleanInactiveTables } from '@/lib/redis';
import { triggerPusherEdge } from '@/lib/pusherEdge';

export async function GET() {
    const cookieStore = await cookies();
    const auth = cookieStore.get('admin_auth');
    if (!auth || auth.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        let db: any = await redis.get('aspava:tables');
        if (!db) db = { tables: {}, pendingOrders: [], settings: { autoApprove: false } };
        if (!db.pendingOrders) db.pendingOrders = [];
        if (!db.settings) db.settings = { autoApprove: false };
        
        if (cleanInactiveTables(db)) {
            await redis.set('aspava:tables', db);
        }

        const rawLog: any = await redis.get('aspava:orderLog');
        db.orderLog = Array.isArray(rawLog) ? rawLog : [];

        const rawFeedbacks: any = await redis.get('aspava:feedbacks');
        db.feedbacks = Array.isArray(rawFeedbacks) ? rawFeedbacks : [];
        
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
        const { action, tableId, orderId, status, fromTableId, toTableId, items, settings } = await request.json();
        let db: any = await redis.get('aspava:tables');
        if (!db) return NextResponse.json({ error: 'DB error' }, { status: 500 });
        if (!db.pendingOrders) db.pendingOrders = [];
        if (!db.settings) db.settings = { autoApprove: false };

        if (action === 'open_table' && tableId) {
            if (db.tables[tableId] && !db.tables[tableId].sessionId) {
                db.tables[tableId].sessionId = 'panel_' + Math.random().toString(36).substring(2, 9);
                db.tables[tableId].lastActivity = Date.now();
            }
        } else if (action === 'close_table' && tableId) {
            db.tables[tableId].sessionId = null;
            db.tables[tableId].orders = [];
            // Remove pending orders for this table
            db.pendingOrders = db.pendingOrders.filter((o: any) => o.tableId !== tableId);
        } else if (action === 'move_table' && fromTableId && toTableId) {
            if (db.tables[fromTableId] && db.tables[toTableId]) {
                if (db.tables[toTableId].sessionId) {
                    return NextResponse.json({ error: 'Hedef masa şu anda dolu! Önce hedef masayı kapatın.' }, { status: 400 });
                }
                // Copy session and orders
                db.tables[toTableId].sessionId = db.tables[fromTableId].sessionId;
                db.tables[toTableId].orders = db.tables[fromTableId].orders;
                
                // Clear old table
                db.tables[fromTableId].sessionId = null;
                db.tables[fromTableId].orders = [];
                
                // Update pending orders tableId
                db.pendingOrders = db.pendingOrders.map((o: any) => {
                    if (o.tableId === fromTableId) {
                        return { ...o, tableId: toTableId };
                    }
                    return o;
                });
            } else {
                return NextResponse.json({ error: 'Geçersiz masa numarası.' }, { status: 400 });
            }
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
            db.pendingOrders = db.pendingOrders.filter((o: any) => o.id !== orderId);
        } else if (action === 'update_table_order' && tableId && orderId && status) {
            if (db.tables[tableId]) {
                const to = db.tables[tableId].orders.find((o: any) => o.id === orderId);
                if (to) to.status = status;
            }
        } else if (action === 'add_to_table' && tableId && items) {
            if (db.tables[tableId]) {
                if (typeof db.orderCounter !== 'number') db.orderCounter = 0;
                db.orderCounter++;
                const newOrder = {
                    id: db.orderCounter.toString(),
                    tableId,
                    items,
                    status: 'hazir', // Direct addition by admin implies it's already approved/ready
                    timestamp: new Date().toISOString()
                };
                db.tables[tableId].orders.push(newOrder);
                db.tables[tableId].lastActivity = Date.now();
                
                const rawLog: any = await redis.get('aspava:orderLog');
                const orderLog: any[] = Array.isArray(rawLog) ? rawLog : [];
                orderLog.push({
                    id: newOrder.id,
                    tableId: newOrder.tableId,
                    items: newOrder.items,
                    timestamp: newOrder.timestamp
                });
                const ninetyDaysAgo = Date.now() - (90 * 24 * 60 * 60 * 1000);
                const cleanedLog = orderLog.filter((e: any) => new Date(e.timestamp).getTime() > ninetyDaysAgo);
                await redis.set('aspava:orderLog', cleanedLog);
            }
        } else if (action === 'update_settings' && settings) {
            db.settings = { ...db.settings, ...settings };
        }

        await redis.set('aspava:tables', db);

        // Notify clients about table updates via Pusher
        if (action !== 'update_settings') {
            await triggerPusherEdge('qr-channel', 'update-table', {
                tableId: tableId || fromTableId || toTableId,
                action: action
            });
            
            // Also notify admin panel to refresh if needed
            await triggerPusherEdge('admin-channel', 'refresh-admin', {
                action: action
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
