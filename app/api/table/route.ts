export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis, cleanInactiveTables } from '@/lib/redis';
import Pusher from 'pusher';

function generateUUID() {
    return Math.random().toString(36).substr(2, 9) + Math.floor(Date.now() / 3).toString(36);
}

export async function POST(request: Request) {
    try {
        const { tableId, sessionId, urlSessionId, locationVerified, pinCode } = await request.json();
        let db: any = await redis.get('aspava:tables');
        
        if (!db || !db.tables) {
            db = { tables: {} };
            for(let i=1; i<=10; i++) db.tables[i.toString()] = { sessionId: null, orders: [], lastActivity: null };
        }
        
        let dbChanged = cleanInactiveTables(db);

        if (!tableId) {
            const targetSession = urlSessionId || sessionId;
            if (!targetSession) {
                if (dbChanged) await redis.set('aspava:tables', db);
                return NextResponse.json({ error: 'Geçersiz oturum.' }, { status: 400 });
            }
            let foundTableId = null;
            for (const tId in db.tables) {
                if (db.tables[tId].sessionId === targetSession) {
                    foundTableId = tId;
                    break;
                }
            }
            if (foundTableId) {
                // Eğer kişinin cookie'si session ile aynıysa (zaten önceden doğrulanmış sahibi)
                if (sessionId === targetSession) {
                    if (dbChanged) await redis.set('aspava:tables', db);
                    return NextResponse.json({ 
                        success: true, 
                        tableId: foundTableId,
                        joinedSessionId: targetSession, 
                        orders: db.tables[foundTableId].orders,
                        isOwner: true
                    });
                }
                
                // Eğer kişi linkten geliyorsa ve sahibi değilse (Sadece İnceleme modu)
                if (dbChanged) await redis.set('aspava:tables', db);
                return NextResponse.json({ success: true, tableId: foundTableId, orders: db.tables[foundTableId].orders, isOwner: false });
            } else {
                if (dbChanged) await redis.set('aspava:tables', db);
                return NextResponse.json({ error: 'Bu oturum kapatılmış veya geçersiz.' }, { status: 404 });
            }
        }

        if (!db.tables[tableId]) {
            if (dbChanged) await redis.set('aspava:tables', db);
            return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
        }

        // Eğer masa boşsa: İlk giren kişi masa sahibi olur
        if (!db.tables[tableId].sessionId) {
            const newSession = generateUUID();
            db.tables[tableId].sessionId = newSession;
            db.tables[tableId].orders = [];
            db.tables[tableId].lastActivity = Date.now();
            await redis.set('aspava:tables', db);
            
            // Masaya ilk giris yapildi, admini bilgilendir
            try {
                const pusher = new Pusher({
                    appId: process.env.PUSHER_APP_ID || "2171468",
                    key: process.env.NEXT_PUBLIC_PUSHER_KEY || "3e97c3f16351fdefca9e",
                    secret: process.env.PUSHER_SECRET || "6a4c9dbea9006d6f755b",
                    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "eu",
                    useTLS: true,
                    useFetch: true
                } as any);
                await pusher.trigger('admin-channel', 'refresh-admin', { action: 'table_opened', tableId });
            } catch(e) { console.error('Pusher error:', e); }

            return NextResponse.json({ success: true, tableId, joinedSessionId: newSession, orders: [], isOwner: true });
        }

        // Eğer masa doluysa ve gelen kişinin çerezi (cookie) eşleşiyorsa (Masa sahibi)
        if (db.tables[tableId].sessionId === sessionId) {
            if (dbChanged) await redis.set('aspava:tables', db);
            return NextResponse.json({ success: true, tableId, joinedSessionId: db.tables[tableId].sessionId, orders: db.tables[tableId].orders, isOwner: true });
        }

        // Eğer masa doluysa ama gelen kişinin çerezi farklıysa/yoksa (Sadece inceleme modu)
        if (dbChanged) await redis.set('aspava:tables', db);
        return NextResponse.json({ success: true, tableId, orders: db.tables[tableId].orders, isOwner: false });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
