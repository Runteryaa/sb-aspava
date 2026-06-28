export const runtime = 'edge';
import { NextResponse } from 'next/server';
import { redis, cleanInactiveTables } from '@/lib/redis';

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
                // Eğer kişinin cookie'si session ile aynıysa (zaten önceden doğrulanmışsa)
                if (sessionId === targetSession) {
                    if (dbChanged) await redis.set('aspava:tables', db);
                    return NextResponse.json({ 
                        success: true, 
                        tableId: foundTableId,
                        joinedSessionId: targetSession, 
                        orders: db.tables[foundTableId].orders 
                    });
                }
                // Eğer PIN Kodu varsa
                if (pinCode && db.tables[foundTableId].joinCode === pinCode) {
                    if (dbChanged) await redis.set('aspava:tables', db);
                    return NextResponse.json({ success: true, tableId: foundTableId, joinedSessionId: targetSession, orders: db.tables[foundTableId].orders, joinCode: db.tables[foundTableId].joinCode });
                }

                // Eğer cookie'si yoksa ama linkten geliyorsa (başkasının linkiyle girmeye çalışıyorsa)
                if (locationVerified) {
                    if (dbChanged) await redis.set('aspava:tables', db);
                    return NextResponse.json({ success: true, tableId: foundTableId, joinedSessionId: targetSession, orders: db.tables[foundTableId].orders, joinCode: db.tables[foundTableId].joinCode });
                } else {
                    if (dbChanged) await redis.set('aspava:tables', db);
                    return NextResponse.json({ requireLocation: true });
                }
            } else {
                if (dbChanged) await redis.set('aspava:tables', db);
                return NextResponse.json({ error: 'Bu oturum kapatılmış veya geçersiz.' }, { status: 404 });
            }
        }

        if (!db.tables[tableId]) {
            if (dbChanged) await redis.set('aspava:tables', db);
            return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
        }

        // Eğer masa boşsa: İlk giren kişi, konum gerekmez
        if (!db.tables[tableId].sessionId) {
            const newSession = generateUUID();
            const joinCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
            db.tables[tableId].sessionId = newSession;
            db.tables[tableId].joinCode = joinCode;
            db.tables[tableId].orders = [];
            db.tables[tableId].lastActivity = Date.now();
            await redis.set('aspava:tables', db);
            return NextResponse.json({ success: true, tableId, joinedSessionId: newSession, orders: [], joinCode });
        }

        // Eğer PIN kodu ile giriliyorsa
        if (pinCode && db.tables[tableId].joinCode === pinCode) {
            if (dbChanged) await redis.set('aspava:tables', db);
            return NextResponse.json({ success: true, tableId, joinedSessionId: db.tables[tableId].sessionId, orders: db.tables[tableId].orders, joinCode: db.tables[tableId].joinCode });
        }

        // Eğer masa doluysa ve gelen kişinin çerezi (cookie) eşleşiyorsa
        if (db.tables[tableId].sessionId === sessionId) {
            if (dbChanged) await redis.set('aspava:tables', db);
            return NextResponse.json({ success: true, tableId, joinedSessionId: db.tables[tableId].sessionId, orders: db.tables[tableId].orders, joinCode: db.tables[tableId].joinCode });
        }

        // Eğer masa doluysa ama gelen kişinin çerezi farklıysa/yoksa (Masaya sonradan dahil olan kişi veya link ile giren)
        if (locationVerified) {
            if (dbChanged) await redis.set('aspava:tables', db);
            return NextResponse.json({ success: true, tableId, joinedSessionId: db.tables[tableId].sessionId, orders: db.tables[tableId].orders, joinCode: db.tables[tableId].joinCode });
        } else {
            if (dbChanged) await redis.set('aspava:tables', db);
            return NextResponse.json({ requireLocation: true });
        }

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
