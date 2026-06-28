import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import fs from 'fs';
import path from 'path';

export async function GET() {
    try {
        const menuPath = path.join(process.cwd(), 'data', 'menu.json');
        const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));
        await redis.set('aspava:menu', menuData);

        const tablesPath = path.join(process.cwd(), 'data', 'tables.json');
        const tablesData = JSON.parse(fs.readFileSync(tablesPath, 'utf8'));
        await redis.set('aspava:tables', tablesData);

        return NextResponse.json({ success: true, message: 'Veriler başarıyla Redis e aktarıldı!' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
