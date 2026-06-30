export const runtime = 'edge';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import newMenuData from '../../../data/menu.json';

export async function GET() {
    try {
        const currentMenuData = await redis.get('aspava:menu');
        if (!currentMenuData) return NextResponse.json({ error: 'Menu not found in Redis' });
        
        let m = typeof currentMenuData === 'string' ? JSON.parse(currentMenuData) : currentMenuData;
        const newM = newMenuData as any;
        
        Object.keys(newM).forEach(cat => {
            if (!m[cat]) {
                // Kategori Redis'te yoksa direkt ekle
                m[cat] = newM[cat];
                return;
            }
            
            newM[cat].items.forEach((newItem: any) => {
                const existingIdx = m[cat].items.findIndex((i: any) => i.name === newItem.name);
                
                if (existingIdx !== -1) {
                    // Mevcut ürün: desc, options, allowOneHalf güncelle, fiyatı koru
                    m[cat].items[existingIdx].desc = newItem.desc;
                    if (newItem.options !== undefined) {
                        m[cat].items[existingIdx].options = newItem.options;
                    } else {
                        delete m[cat].items[existingIdx].options;
                    }
                    if (newItem.allowOneHalf !== undefined) {
                        m[cat].items[existingIdx].allowOneHalf = newItem.allowOneHalf;
                    }
                } else {
                    // Yeni ürün: Redis'e ekle (fiyatsız, sonradan eklenebilir)
                    m[cat].items.push({ ...newItem });
                }
            });
        });
        
        await redis.set('aspava:menu', m);
        return NextResponse.json({ success: true, message: 'Menü güncellendi: açıklamalar, seçenekler ve yeni ürünler senkronize edildi. Fiyatlarınız korundu!' });
    } catch(e: any) {
        return NextResponse.json({ error: String(e) });
    }
}
