import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

function generateUUID() {
    return Math.random().toString(36).substr(2, 9) + '_' + Math.floor(Date.now() / 3).toString(36);
}

export async function POST(request: Request) {
    try {
        const { tableId, sessionId } = await request.json();
        let db: any = await redis.get('aspava:tables');
        
        if (!db || !db.tables) {
            db = { tables: {} };
            for(let i=1; i<=10; i++) db.tables[i.toString()] = { sessionId: null, orders: [] };
        }

        if (!db.tables[tableId]) {
            return NextResponse.json({ error: 'Masa bulunamadı' }, { status: 404 });
        }

        // Eğer masa boşsa: Daima sunucuda yeni bir UUID üret (eski çerezi kullanma)
        if (!db.tables[tableId].sessionId) {
            const newSession = generateUUID();
            db.tables[tableId].sessionId = newSession;
            db.tables[tableId].orders = [];
            await redis.set('aspava:tables', db);
            return NextResponse.json({ success: true, joinedSessionId: newSession, orders: [] });
        }

        // Eğer masa doluysa ve gelen kişinin çerezi (cookie) eşleşiyorsa (masayı açan kişiyse):
        if (db.tables[tableId].sessionId === sessionId) {
            return NextResponse.json({ success: true, joinedSessionId: db.tables[tableId].sessionId, orders: db.tables[tableId].orders });
        }

        // Eğer masa doluysa ama gelen kişinin çerezi farklıysa/yoksa (troll veya başka bir telefon):
        return NextResponse.json({ error: 'Bu masa şu an dolu. Lütfen siparişi masayı ilk okutan telefondan veriniz.' }, { status: 403 });

    } catch (error) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
