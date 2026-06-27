'use client';

import { useState, useEffect } from 'react';

export default function Panel() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('orders');
    
    // Menu States
    const [menuData, setMenuData] = useState<any>(null);
    const [menuLoading, setMenuLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');

    // Order/Table States
    const [adminData, setAdminData] = useState<any>(null);

    const checkAuth = async () => {
        try {
            const res = await fetch('/api/auth');
            if (res.ok) {
                const data = await res.json();
                setIsAuthenticated(data.authenticated);
            } else {
                setIsAuthenticated(false);
            }
        } catch (e) {
            setIsAuthenticated(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });
        const data = await res.json();
        if (data.success) {
            setIsAuthenticated(true);
        } else {
            setLoginError(data.error);
        }
    };

    const fetchMenu = () => {
        fetch('/api/menu')
            .then(res => res.json())
            .then(data => {
                setMenuData(data);
                setMenuLoading(false);
            });
    };

    const fetchAdminData = () => {
        fetch('/api/admin')
            .then(res => res.json())
            .then(data => setAdminData(data));
    };

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchMenu();
            fetchAdminData();
            const interval = setInterval(fetchAdminData, 5000); // Poll orders every 5s
            
            // Check saved theme
            if (localStorage.getItem('theme') === 'dark') {
                setDarkMode(true);
            }
            return () => clearInterval(interval);
        }
    }, [isAuthenticated]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handlePriceChange = (categoryKey: string, itemIndex: number, newPrice: string) => {
        const newData = { ...menuData };
        newData[categoryKey].items[itemIndex].price = newPrice;
        setMenuData(newData);
    };

    const handleAddCategory = () => {
        const title = prompt('Yeni kategori adı (Örn: İçecekler)');
        if (!title) return;
        const key = title.toLowerCase().replace(/[^a-z0-9ğüşöçi]/g, '');
        if (menuData[key]) return alert('Bu kategori anahtarı zaten kullanılıyor!');
        setMenuData({ ...menuData, [key]: { title, items: [] } });
    };

    const handleAddItem = (categoryKey: string) => {
        const name = prompt('Yemek adı');
        if (!name) return;
        const desc = prompt('Açıklaması (İsteğe bağlı)');
        const price = prompt('Fiyat (İsteğe bağlı)');
        
        const newData = { ...menuData };
        newData[categoryKey].items.push({ name, desc: desc || '', price: price || '' });
        setMenuData(newData);
    };

    const handleDeleteItem = (categoryKey: string, itemIndex: number) => {
        if (!confirm('Bu yemeği silmek istediğinize emin misiniz?')) return;
        const newData = { ...menuData };
        newData[categoryKey].items.splice(itemIndex, 1);
        setMenuData(newData);
    };

    const handleDeleteCategory = (categoryKey: string) => {
        if (!confirm('Tüm kategoriyi ve içindeki yemekleri silmek istediğinize emin misiniz?')) return;
        const newData = { ...menuData };
        delete newData[categoryKey];
        setMenuData(newData);
    };

    const handleSaveMenu = async () => {
        setSaving(true);
        setMessage('');
        try {
            const res = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(menuData)
            });
            if (res.ok) {
                setMessage('✅ Fiyatlar başarıyla kaydedildi!');
            }
        } catch (error) {
            setMessage('❌ Hata oluştu.');
        }
        setSaving(false);
        setTimeout(() => setMessage(''), 3000);
    };

    const handleAction = async (action: string, data: any) => {
        await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        fetchAdminData();
    };

    if (isAuthenticated === null) return <div className="p-10 text-center text-xl">Kontrol ediliyor...</div>;

    if (isAuthenticated === false) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-brand-red">
                    <h1 className="text-4xl font-logo text-center text-brand-red mb-6 tracking-wide" style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 2px 2px 0 #000', letterSpacing: '1px' }}>SB Aspava Panel</h1>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Yönetici Şifresi</label>
                            <input 
                                type="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-xl p-3 font-bold"
                                placeholder="Şifrenizi giriniz..."
                            />
                        </div>
                        {loginError && <p className="text-brand-red font-bold text-sm">{loginError}</p>}
                        <button type="submit" className="w-full bg-brand-red text-white font-bold py-3 rounded-xl hover:bg-brand-dark transition-colors">
                            Giriş Yap
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    if (menuLoading || !adminData) return <div className="text-center text-xl flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div></div>;

    return (
        <div className={`min-h-screen py-2 px-4 transition-colors duration-300 ${darkMode ? 'midnight-dark' : 'bg-gray-50'}`}>
            <div className="max-w-5xl mx-auto panel-container rounded-2xl shadow-sm border p-6 md:p-8 transition-colors duration-300">
                
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4 gap-4 panel-header">
                    <h1 className="text-3xl sm:text-4xl font-logo text-brand-red tracking-wide" style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 2px 2px 0 #000', letterSpacing: '1px' }}>SB Aspava Panel</h1>
                    <div className="flex gap-4 items-center flex-wrap justify-center">
                        <div className="flex bg-gray-100 p-1 rounded-lg panel-tabs">
                            <button 
                                onClick={() => setActiveTab('orders')}
                                className={`px-4 py-2 font-bold rounded-md transition-colors ${activeTab === 'orders' ? 'bg-white shadow text-brand-red active-tab' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Masalar & Siparişler
                            </button>
                            <button 
                                onClick={() => setActiveTab('menu')}
                                className={`px-4 py-2 font-bold rounded-md transition-colors ${activeTab === 'menu' ? 'bg-white shadow text-brand-red active-tab' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Menü Fiyatları
                            </button>
                        </div>
                        <button onClick={toggleDarkMode} className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-800 text-white hover:bg-gray-700 transition-colors dark-toggle">
                            <i className={`fa-solid ${darkMode ? 'fa-sun text-yellow-400' : 'fa-moon'}`}></i>
                        </button>
                    </div>
                </div>

                {activeTab === 'menu' && (
                    <div className="space-y-8 animate-fade-in">
                        {message && (
                            <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-800 font-medium border border-green-200">
                                {message}
                            </div>
                        )}
                        <div className="flex justify-between items-center mb-4">
                            <button onClick={handleAddCategory} className="bg-gray-800 text-white font-bold py-2 px-6 rounded-lg hover:bg-gray-900 transition-colors">
                                + Yeni Kategori Ekle
                            </button>
                            <button onClick={handleSaveMenu} disabled={saving} className="bg-brand-red text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors">
                                {saving ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
                            </button>
                        </div>
                        {Object.keys(menuData).map((categoryKey) => {
                            const category = menuData[categoryKey];
                            return (
                                <div key={categoryKey} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative">
                                    <button onClick={() => handleDeleteCategory(categoryKey)} className="absolute top-4 right-4 text-red-500 hover:text-red-700 font-bold text-sm">
                                        Kategoriyi Sil
                                    </button>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">{category.title}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {category.items.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative group">
                                                <div className="flex-1 pr-4">
                                                    <h3 className="font-bold text-gray-900">{item.name}</h3>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{item.desc}</p>
                                                </div>
                                                <div className="w-28 flex items-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        value={item.price || ''}
                                                        onChange={(e) => handlePriceChange(categoryKey, index, e.target.value)}
                                                        placeholder="Fiyat"
                                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 text-sm font-bold"
                                                    />
                                                    <button onClick={() => handleDeleteItem(categoryKey, index)} className="text-red-400 hover:text-red-600 text-xl font-bold" title="Sil">×</button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <button onClick={() => handleAddItem(categoryKey)} className="w-full border-2 border-dashed border-gray-300 text-gray-500 font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors">
                                        + Bu Kategoriye Yeni Yemek Ekle
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-8 animate-fade-in">
                        {/* Pending Orders */}
                        <div className="bg-orange-50 p-6 rounded-xl border border-orange-100">
                            <h2 className="text-2xl font-bold text-orange-800 mb-4 flex items-center gap-2">
                                <i className="fa-solid fa-bell"></i>Yeni Siparişler
                            </h2>
                            {adminData.pendingOrders.filter((o:any) => o.status === 'bekliyor').length === 0 ? (
                                <p className="text-orange-600 font-medium">Şu an sipariş yok.</p>
                            ) : (
                                <div className="space-y-4">
                                    {adminData.pendingOrders.filter((o:any) => o.status === 'bekliyor').map((order: any) => (
                                        <div key={order.id} className="bg-white p-4 rounded-lg shadow border-l-4 border-brand-red">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-black text-lg">Masa {order.tableId}</span>
                                                <span className="text-sm text-gray-400">{new Date(order.timestamp).toLocaleTimeString('tr-TR')}</span>
                                            </div>
                                            <ul className="mb-4 space-y-1">
                                                {order.items.map((item:any, idx:number) => (
                                                    <li key={idx} className="font-bold text-gray-700 flex justify-between">
                                                        <span>{item.qty}x {item.name}</span>
                                                        <span className="text-gray-500 font-normal text-sm">₺{((item.price || 0) * item.qty).toFixed(2)}</span>
                                                    </li>
                                                ))}
                                                <div className="flex justify-between font-black text-lg pt-2 mt-2 border-t border-gray-200">
                                                    <span>Toplam:</span>
                                                    <span className="text-brand-red">₺{order.items.reduce((s:number, i:any) => s + (i.price || 0) * i.qty, 0).toFixed(2)}</span>
                                                </div>
                                            </ul>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleAction('approve_order', { orderId: order.id })} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold">Onayla</button>
                                                <button onClick={() => { if(window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) handleAction('cancel_order', { orderId: order.id }) }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-bold">İptal Et</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Active Tables */}
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Açık Masalar</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {Object.keys(adminData.tables).map((tableId) => {
                                    const table = adminData.tables[tableId];
                                    const isActive = !!table.sessionId;
                                    return (
                                        <div key={tableId} className={`p-5 rounded-xl border-2 transition-colors ${isActive ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-xl font-black">Masa {tableId}</h3>
                                                {isActive ? (
                                                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">Dolu</span>
                                                ) : (
                                                    <span className="bg-gray-200 text-gray-600 px-3 py-1 rounded-full text-sm font-bold">Boş</span>
                                                )}
                                            </div>
                                            
                                            {isActive && (
                                                <>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="text-xs font-mono text-gray-400 bg-gray-100 p-1.5 rounded inline-block truncate max-w-[60%]">
                                                            Oturum: {table.sessionId}
                                                        </div>
                                                        <div className="font-black text-brand-red bg-red-50 px-2 py-1 rounded">
                                                            Toplam: ₺{table.orders.reduce((t: number, o: any) => o.status === 'iptal' ? t : t + o.items.reduce((s: number, i: any) => s + (i.price || 0) * i.qty, 0), 0).toFixed(2)}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2 mb-4 bg-white p-3 rounded-lg border border-green-100 min-h-[60px]">
                                                        {table.orders.map((order: any, idx: number) => (
                                                            <div key={idx} className="border-b last:border-0 pb-2 last:pb-0">
                                                                <div className="flex justify-between text-xs mb-1">
                                                                    <span className={order.status === 'bekliyor' ? 'text-orange-500 font-bold' : (order.status === 'iptal' ? 'text-red-500 line-through' : 'text-green-600 font-bold')}>
                                                                        Durum: {order.status.toUpperCase()}
                                                                    </span>
                                                                    <span className="text-gray-400">{new Date(order.timestamp).toLocaleTimeString('tr-TR')}</span>
                                                                </div>
                                                                <div className={order.status === 'iptal' ? 'opacity-50 line-through' : ''}>
                                                                    {order.items.map((i:any, iIdx:number) => (
                                                                        <div key={iIdx} className="font-medium text-sm text-gray-800 flex justify-between">
                                                                            <span>• {i.qty}x {i.name}</span>
                                                                            <span className="text-gray-500 font-normal text-xs">₺{((i.price || 0) * i.qty).toFixed(2)}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {order.status !== 'iptal' && (
                                                                    <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100">
                                                                        {order.status === 'onaylandi' && (
                                                                            <button onClick={() => handleAction('update_table_order', { tableId, orderId: order.id, status: 'hazir' })} className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded font-bold shadow-sm">Hazır</button>
                                                                        )}
                                                                        <button onClick={() => { if(window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) handleAction('update_table_order', { tableId, orderId: order.id, status: 'iptal' }) }} className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded font-bold shadow-sm">İptal Et</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {table.orders.length === 0 && <span className="text-sm text-gray-400">Henüz sipariş yok. Menüye bakıyorlar...</span>}
                                                    </div>
                                                    <button 
                                                        onClick={() => { if(confirm(`Masa ${tableId} adisyonunu kapatmak istediğine emin misin?`)) handleAction('close_table', { tableId }) }}
                                                        className="w-full bg-gray-800 text-white font-bold py-2 rounded-lg hover:bg-gray-900"
                                                    >
                                                        Adisyonu Kapat
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <style dangerouslySetInnerHTML={{__html: `
                .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                
                /* Midnight Blue Dark Mode */
                .midnight-dark { background-color: #0b1120 !important; color: #f8fafc !important; }
                .midnight-dark .panel-container { background-color: #0f172a !important; border-color: #1e293b !important; }
                .midnight-dark .bg-white, .midnight-dark .bg-gray-50, .midnight-dark .bg-gray-100 { background-color: #1e293b !important; border-color: #334155 !important; color: #e2e8f0 !important; }
                .midnight-dark input { background-color: #0f172a !important; color: #f8fafc !important; border-color: #334155 !important; }
                .midnight-dark input::placeholder { color: #64748b !important; }
                .midnight-dark h2, .midnight-dark h3, .midnight-dark .text-gray-900, .midnight-dark .text-gray-800 { color: #f8fafc !important; }
                .midnight-dark h1.text-brand-red { color: #b91c1c !important; }
                .midnight-dark .bg-gray-200, .midnight-dark .panel-tabs { background-color: #0b1120 !important; color: #94a3b8 !important; }
                .midnight-dark .active-tab { background-color: #1e293b !important; color: #f87171 !important; box-shadow: 0 1px 3px rgba(0,0,0,0.3) !important; }
                .midnight-dark .border-gray-200, .midnight-dark .border-gray-100, .midnight-dark .panel-header { border-color: #334155 !important; }
                .midnight-dark .text-gray-500, .midnight-dark .text-gray-400 { color: #94a3b8 !important; }
                .midnight-dark .text-gray-700 { color: #cbd5e1 !important; }
                .midnight-dark .bg-orange-50 { background-color: #431407 !important; border-color: #7c2d12 !important; color: #fed7aa !important; }
                .midnight-dark .text-orange-800, .midnight-dark .text-orange-600 { color: #fdba74 !important; }
                .midnight-dark .bg-green-50 { background-color: #064e3b !important; border-color: #065f46 !important; }
                .midnight-dark .text-green-700 { color: #6ee7b7 !important; }
                .midnight-dark .bg-green-100 { background-color: #047857 !important; color: #a7f3d0 !important; }
                .midnight-dark .border-green-200, .midnight-dark .border-green-100 { border-color: #065f46 !important; }
                .midnight-dark .dark-toggle { background-color: #1e293b !important; border: 1px solid #334155; }
            `}} />
        </div>
    );
}
