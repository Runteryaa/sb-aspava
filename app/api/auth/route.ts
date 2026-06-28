import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
    try {
        const { password } = await request.json();
        const correctPassword = process.env.PANEL_PASSWORD || '123456';
        
        if (password === correctPassword) {
            const cookieStore = await cookies();
            cookieStore.set('admin_auth', 'true', { path: '/', maxAge: 86400 * 7 }); // 1 haftalık giriş izni
            return NextResponse.json({ success: true });
        }
        
        return NextResponse.json({ error: 'Yanlış şifre' }, { status: 401 });
    } catch (e) {
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function GET() {
    const cookieStore = await cookies();
    const auth = cookieStore.get('admin_auth');
    if (auth && auth.value === 'true') {
        return NextResponse.json({ authenticated: true });
    }
    return NextResponse.json({ authenticated: false });
}
