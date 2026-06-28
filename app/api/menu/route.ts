import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { redis } from '@/lib/redis';

export async function GET() {
    try {
        let menuData = await redis.get('aspava:menu');
        if (!menuData) menuData = {}; // Varsayılan boş veya seed data kullanabiliriz
        return NextResponse.json(menuData);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to read menu data' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const auth = cookieStore.get('admin_auth');
    if (!auth || auth.value !== 'true') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const newMenuData = await request.json();
        await redis.set('aspava:menu', newMenuData);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to write menu data' }, { status: 500 });
    }
}
