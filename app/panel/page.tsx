'use client';

import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

const normalizeText = (text: string) => {
    return text.toLocaleLowerCase('tr-TR')
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c');
};
export default function Panel() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [password, setPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [darkMode, setDarkMode] = useState(false);
    const [volume, setVolume] = useState(1);
    const [audioEnabled, setAudioEnabled] = useState(false);

    const [activeTab, setActiveTab] = useState<'menu' | 'orders' | 'settings'>('orders');
    
    // Menu States
    const [menuData, setMenuData] = useState<any>(null);
    const [menuLoading, setMenuLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [addingToTable, setAddingToTable] = useState<string | null>(null);
    const [adminCart, setAdminCart] = useState<{name: string, price: number, qty: number}[]>([]);
    const [adminSearchQuery, setAdminSearchQuery] = useState('');
    const [adminModalTab, setAdminModalTab] = useState<'all' | 'popular'>('popular');

    const [adminData, setAdminData] = useState<any>(null);
    const audioUnlockedRef = useRef(false);
    const initialLoadRef = useRef(true);
    const prevOrdersRef = useRef<Set<string>>(new Set());

    const unlockAudio = () => {
        setAudioEnabled(true);
        if (audioUnlockedRef.current) return;
        const el = document.getElementById('notificationSound') as HTMLAudioElement;
        if (el) {
            el.volume = 0;
            el.play().then(() => {
                el.pause();
                el.currentTime = 0;
                audioUnlockedRef.current = true;
            }).catch(()=>{});
        }
    };

    useEffect(() => {
        // Herhangi bir tıklamada sesi unlock et
        document.addEventListener('click', unlockAudio, { once: true });
        
        if (adminData && adminData.tables) {
            let allOrders: any[] = [];
            if (adminData.pendingOrders) {
                allOrders = [...adminData.pendingOrders];
            }
            for (const tId in adminData.tables) {
                const tableOrders = adminData.tables[tId].orders || [];
                allOrders = [...allOrders, ...tableOrders];
            }
            
            if (!initialLoadRef.current) {
                const newOrders = allOrders.filter(o => !prevOrdersRef.current.has(o.id));
                
                if (newOrders.length > 0) {
                    // Sesi çal
                    const vol = parseFloat(localStorage.getItem('volume') || '1');
                    if (vol > 0) {
                        const el = document.getElementById('notificationSound') as HTMLAudioElement;
                        if (el) {
                            if (!el.paused) el.currentTime = 0;
                            else {
                                el.volume = vol;
                                el.currentTime = 0;
                                el.play().catch(()=>{});
                            }
                        }
                    }

                    // Otomatik onay açıksa yazdır
                    if (adminData.settings?.autoApprove) {
                        newOrders.forEach(order => {
                            fetch('http://localhost:8181/print', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ tableId: order.tableId, items: order.items, orderId: order.id })
                            }).catch(() => {});
                        });
                    }
                }
            } else {
                initialLoadRef.current = false;
            }
            
            const currentPending = adminData.pendingOrders?.filter((o:any) => o.status === 'bekliyor') || [];
            const pendingCount = currentPending.length;
            if (pendingCount > 0) {
                document.title = `(${pendingCount}) Yeni Sipariş! - Aspava`;
            } else {
                document.title = 'SB Aspava Panel';
            }
            
            prevOrdersRef.current = new Set(allOrders.map((o:any) => o.id));
        }
    }, [adminData]);

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
            
            // Pusher WebSocket Entegrasyonu
            const pusher = new Pusher('3e97c3f16351fdefca9e', {
                cluster: 'eu'
            });

            const channel = pusher.subscribe('admin-channel');
            channel.bind('new-order', function(data: any) {
                fetch('/api/admin')
                    .then(res => res.json())
                    .then(db => {
                        setAdminData(db);
                        // Eğer canlı sunucu main branch'ta kaldıysa, gelen siparişleri bekleyende (pending)
                        // tutacaktır. Biz front-end'den otomatik onaylamak zorundayız.
                        if (db.settings?.autoApprove && data?.orderId) {
                            fetch('/api/admin', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ action: 'approve_order', orderId: data.orderId })
                            }).then(() => fetchAdminData());
                        }
                    });
            });

            // 'refresh-admin' kanalini dinleyip listeyi guncelle
            channel.bind('refresh-admin', function() {
                fetchAdminData();
            });

            // Check saved theme
            if (localStorage.getItem('theme') === 'dark') {
                setDarkMode(true);
            }
            if (localStorage.getItem('volume') !== null) {
                setVolume(parseFloat(localStorage.getItem('volume')!));
            }
            
            // Pusher Edge Runtime'da tetiklenmezse diye 3 saniyede bir manuel kontrol edelim (Polling)
            const fallbackInterval = setInterval(() => {
                fetchAdminData();
            }, 3000);

            return () => {
                clearInterval(fallbackInterval);
                pusher.unsubscribe('admin-channel');
            };
        }
    }, [isAuthenticated]);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');
    };

    const handleCategoryTitleChange = (categoryKey: string, newTitle: string) => {
        const newData = { ...menuData };
        newData[categoryKey].title = newTitle;
        setMenuData(newData);
    };

    const handleItemNameChange = (categoryKey: string, itemIndex: number, newName: string) => {
        const newData = { ...menuData };
        newData[categoryKey].items[itemIndex].name = newName;
        setMenuData(newData);
    };

    const handleItemDescChange = (categoryKey: string, itemIndex: number, newDesc: string) => {
        const newData = { ...menuData };
        newData[categoryKey].items[itemIndex].desc = newDesc;
        setMenuData(newData);
    };

    const handlePriceChange = (categoryKey: string, itemIndex: number, newPrice: string) => {
        const newData = { ...menuData };
        newData[categoryKey].items[itemIndex].price = newPrice;
        setMenuData(newData);
    };

    const handleToggleOneHalf = (categoryKey: string, itemIndex: number, newValue: boolean) => {
        const newData = { ...menuData };
        newData[categoryKey].items[itemIndex].allowOneHalf = newValue;
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
        newData[categoryKey].items.push({ name, desc: desc || '', price: price || '', allowOneHalf: false });
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

    const moveItem = (categoryKey: string, index: number, direction: number) => {
        const newData = { ...menuData };
        const items = newData[categoryKey].items;
        if (index + direction >= 0 && index + direction < items.length) {
            const temp = items[index];
            items[index] = items[index + direction];
            items[index + direction] = temp;
            setMenuData(newData);
        }
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
        const res = await fetch('/api/admin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, ...data })
        });
        const json = await res.json();
        if (json.error) {
            alert(json.error);
        }
        fetchAdminData();
    };

    const printToLocalServer = async (tableId: string, items: any, orderId: string) => {
        try {
            await fetch('http://localhost:8181/print', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId, items, orderId })
            });
        } catch (e) {
            console.error("Lokal yazdırma sunucusuna ulaşılamadı. Sunucunun açık olduğundan emin olun.");
        }
    };

    if (isAuthenticated === null) return <div className="p-10 text-center text-xl">Kontrol ediliyor...</div>;

    if (isAuthenticated === false) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-4 border-brand-red">
                    <a href="/" className="inline-block hover:scale-105 transition-transform">
                        <h1 className="text-4xl font-logo text-center text-brand-red mb-6 tracking-wide" style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 2px 2px 0 #000', letterSpacing: '1px' }}>SB Aspava Panel</h1>
                    </a>
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
                    <a href="/" className="inline-block hover:scale-105 transition-transform">
                        <h1 className="text-3xl sm:text-4xl font-logo text-brand-red tracking-wide" style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 2px 2px 0 #000', letterSpacing: '1px' }}>SB Aspava Panel</h1>
                    </a>
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
                        <div onClick={unlockAudio} className={`flex items-center gap-2 rounded-lg p-2 panel-tabs h-10 shadow-inner cursor-pointer transition-colors ${!audioEnabled ? 'bg-red-100 animate-pulse border border-red-200' : 'bg-gray-100'}`} title="Sipariş Bildirim Sesi">
                            <i className={`fa-solid ${!audioEnabled || volume === 0 ? 'fa-volume-xmark text-brand-red' : 'fa-volume-high text-gray-500'} w-4 text-center`}></i>
                            {audioEnabled ? (
                                <input 
                                    type="range" 
                                    min="0" max="1" step="0.1" 
                                    value={volume} 
                                    onChange={(e) => {
                                        const v = parseFloat(e.target.value);
                                        setVolume(v);
                                        localStorage.setItem('volume', v.toString());
                                        if (v > 0) {
                                            const el = document.getElementById('notificationSound') as HTMLAudioElement;
                                            if (el) {
                                                el.volume = v;
                                                el.currentTime = 0;
                                                el.play().catch(()=>{});
                                            }
                                        }
                                    }}
                                    className="w-20 sm:w-24 accent-brand-red cursor-pointer"
                                />
                            ) : (
                                <span className="text-xs font-bold text-brand-red px-2 select-none">Ses Kapalı (Açmak için tıkla)</span>
                            )}
                        </div>
                        <button onClick={() => setActiveTab('settings')} className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors shadow-sm ${activeTab === 'settings' ? 'bg-brand-red text-white' : 'bg-gray-800 text-white hover:bg-gray-700'}`} title="Ayarlar">
                            <i className="fa-solid fa-gear"></i>
                        </button>
                    </div>
                </div>

                {activeTab === 'settings' && (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <i className="fa-solid fa-cog"></i> Genel Ayarlar
                            </h2>
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Siparişleri Otomatik Onayla & Yazdır</h3>
                                        <p className="text-sm text-gray-500">QR menüden gelen siparişler manuel onaya düşmeden direkt mutfak fişine gönderilir.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={adminData.settings?.autoApprove || false}
                                            onChange={(e) => handleAction('update_settings', { settings: { autoApprove: e.target.checked } })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                    </label>
                                </div>
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg">Karanlık Mod (Dark Mode)</h3>
                                        <p className="text-sm text-gray-500">Panelin görünümünü koyu temaya geçirir.</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={darkMode}
                                            onChange={toggleDarkMode}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

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
                                    <div className="mb-6 border-b pb-2">
                                        <input 
                                            type="text" 
                                            value={category.title} 
                                            onChange={(e) => handleCategoryTitleChange(categoryKey, e.target.value)}
                                            className="text-2xl font-bold text-gray-800 bg-transparent border border-transparent hover:border-gray-200 focus:border-brand-red outline-none w-full rounded px-2 -ml-2 focus:ring-0"
                                            placeholder="Kategori Adı"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        {category.items.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-start bg-white p-4 rounded-lg shadow-sm border border-gray-100 relative group">
                                                <div className="flex-1 pr-4 flex flex-col gap-1">
                                                    <input 
                                                        type="text"
                                                        value={item.name}
                                                        onChange={(e) => handleItemNameChange(categoryKey, index, e.target.value)}
                                                        className="font-bold text-gray-900 bg-transparent border border-transparent hover:border-gray-200 focus:border-brand-red outline-none w-full rounded px-1 -ml-1"
                                                        placeholder="Ürün Adı"
                                                    />
                                                    <textarea 
                                                        value={item.desc}
                                                        onChange={(e) => handleItemDescChange(categoryKey, index, e.target.value)}
                                                        className="text-xs text-gray-500 bg-transparent border border-transparent hover:border-gray-200 focus:border-brand-red outline-none w-full rounded px-1 -ml-1 resize-y min-h-[40px] leading-tight"
                                                        placeholder="Açıklama / İçindekiler"
                                                    />
                                                    <label className="flex items-center gap-2 mt-2 text-xs font-bold text-gray-700 cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={!!item.allowOneHalf} 
                                                            onChange={(e) => handleToggleOneHalf(categoryKey, index, e.target.checked)}
                                                            className="w-4 h-4 text-brand-red rounded border-gray-300 focus:ring-brand-red"
                                                        />
                                                        1.5 Porsiyon Aktif
                                                    </label>
                                                </div>
                                                <div className="w-36 flex items-center gap-2">
                                                    <input 
                                                        type="number" 
                                                        value={item.price || ''}
                                                        onChange={(e) => handlePriceChange(categoryKey, index, e.target.value)}
                                                        placeholder="Fiyat"
                                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg p-2 text-sm font-bold"
                                                    />
                                                    <button onClick={() => handleDeleteItem(categoryKey, index)} className="text-red-400 hover:text-red-600 text-xl font-bold" title="Sil">×</button>
                                                    <div className="flex flex-col border-l pl-2 border-gray-200 justify-center h-full gap-1">
                                                        <button onClick={() => moveItem(categoryKey, index, -1)} disabled={index === 0} className="text-gray-400 hover:text-gray-800 disabled:opacity-20 leading-none" title="Yukarı Taşı"><i className="fa-solid fa-chevron-up text-xs"></i></button>
                                                        <button onClick={() => moveItem(categoryKey, index, 1)} disabled={index === category.items.length - 1} className="text-gray-400 hover:text-gray-800 disabled:opacity-20 leading-none" title="Aşağı Taşı"><i className="fa-solid fa-chevron-down text-xs"></i></button>
                                                    </div>
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
                                                {order.note && (
                                                    <div className="mt-3 bg-yellow-50 border border-yellow-200 p-2 rounded text-sm text-yellow-800 font-medium leading-tight">
                                                        <span className="font-black text-yellow-900">Not:</span> {order.note}
                                                    </div>
                                                )}
                                                <div className="flex justify-between font-black text-lg pt-2 mt-2 border-t border-gray-200">
                                                    <span>Toplam:</span>
                                                    <span className="text-brand-red">₺{order.items.reduce((s:number, i:any) => s + (i.price || 0) * i.qty, 0).toFixed(2)}</span>
                                                </div>
                                            </ul>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => {
                                                        handleAction('approve_order', { orderId: order.id });
                                                        printToLocalServer(order.tableId, order.items, order.id);
                                                    }} 
                                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
                                                >
                                                    Onayla
                                                </button>
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
                                            
                                            {!isActive && (
                                                <div className="mt-4">
                                                    <button 
                                                        onClick={() => handleAction('open_table', { tableId })}
                                                        className="w-full bg-brand-red text-white text-sm font-bold px-4 py-3 rounded-lg hover:bg-brand-dark transition-colors shadow-sm flex items-center justify-center gap-2"
                                                    >
                                                        <i className="fa-solid fa-play"></i> Masayı Aç
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {isActive && (
                                                <>
                                                    <div className="flex justify-between items-center mb-2">
                                                        <div className="text-[12px] font-mono text-gray-400 rounded inline-block">
                                                            {table.sessionId}
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
                                                                    {order.note && (
                                                                        <div className="mt-2 bg-yellow-50 border border-yellow-200 p-1.5 rounded text-xs text-yellow-800 font-medium leading-tight">
                                                                            <span className="font-black text-yellow-900">Not:</span> {order.note}
                                                                        </div>
                                                                    )}
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
                                                    <div className="flex gap-2 flex-wrap">
                                                        <button 
                                                            onClick={() => setAddingToTable(tableId)}
                                                            className="bg-brand-red text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors shadow-sm flex items-center gap-2"
                                                        >
                                                            <i className="fa-solid fa-plus"></i> Ürün Ekle
                                                        </button>
                                                        <button 
                                                            onClick={() => {
                                                                const target = prompt(`Masa ${tableId} hangi masaya taşınsın? (1-10 arası bir masa numarası giriniz)`);
                                                                if(target && target !== tableId) {
                                                                    handleAction('move_table', { fromTableId: tableId, toTableId: target });
                                                                }
                                                            }}
                                                            className="bg-blue-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center gap-2"
                                                        >
                                                            <i className="fa-solid fa-arrow-right-arrow-left"></i> Taşı
                                                        </button>
                                                        <button 
                                                            onClick={() => { if(confirm(`Masa ${tableId} adisyonunu kapatmak istediğine emin misin?`)) handleAction('close_table', { tableId }) }}
                                                            className="flex-1 bg-gray-800 text-white font-bold py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-sm"
                                                        >
                                                            Adisyonu Kapat
                                                        </button>
                                                    </div>
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
            
            {/* Add to Table Modal */}
            {addingToTable && menuData && (() => {
                // Son 7 günün popüler ürünleri — global sipariş logundan (iptal edilenler yok)
                const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
                const itemCounts: Record<string, { name: string; price: number; count: number }> = {};
                const log: any[] = Array.isArray(adminData?.orderLog) ? adminData.orderLog : [];
                log.forEach((entry: any) => {
                    if (!entry.timestamp || new Date(entry.timestamp).getTime() < sevenDaysAgo) return;
                    (entry.items || []).forEach((item: any) => {
                        const key = item.name;
                        if (!itemCounts[key]) itemCounts[key] = { name: item.name, price: item.price || 0, count: 0 };
                        itemCounts[key].count += item.qty || 1;
                    });
                });
                const popularItems = Object.values(itemCounts).sort((a, b) => b.count - a.count).slice(0, 20);

                return (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in">
                        <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-2xl">
                            <h2 className="text-xl font-black text-gray-800">Masa {addingToTable} - Ürün Ekle</h2>
                            <button onClick={() => { setAddingToTable(null); setAdminCart([]); setAdminSearchQuery(''); setAdminModalTab('popular'); }} className="text-gray-500 hover:text-gray-700 w-8 h-8 flex items-center justify-center bg-gray-200 rounded-full transition-colors">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="px-5 pt-3 pb-2 border-b border-gray-100 bg-white space-y-2">
                            {/* Sekmeler */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setAdminModalTab('popular')}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                                        adminModalTab === 'popular' ? 'bg-brand-red text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <i className="fa-solid fa-fire"></i> Popüler
                                </button>
                                <button
                                    onClick={() => setAdminModalTab('all')}
                                    className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-colors ${
                                        adminModalTab === 'all' ? 'bg-brand-red text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                >
                                    <i className="fa-solid fa-list"></i> Tüm Menü
                                </button>
                            </div>
                            {/* Arama — sadece Tüm Menü sekmesinde göster */}
                            {adminModalTab === 'all' && (
                                <div className="relative">
                                    <i className="fa-solid fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                    <input 
                                        type="text" 
                                        placeholder="Ürün ara..." 
                                        value={adminSearchQuery}
                                        onChange={(e) => setAdminSearchQuery(e.target.value)}
                                        autoFocus
                                        className="w-full bg-gray-100 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 focus:ring-2 focus:ring-brand-red text-gray-800 font-medium outline-none transition-all"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 overflow-y-auto p-5 space-y-6">
                            {adminModalTab === 'popular' ? (
                                popularItems.length === 0 ? (
                                    <div className="text-center text-gray-400 py-12">
                                        <i className="fa-solid fa-fire text-4xl mb-3 block opacity-30"></i>
                                        <p className="font-bold">Henüz sipariş verisi yok.</p>
                                        <p className="text-sm">Siparişler geldikçe popüler ürünler burada görünecek.</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-xs text-gray-400 font-medium mb-3">Tüm zamanların en çok tercih edilen ürünleri</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {popularItems.map((item, idx) => {
                                                const cartItem = adminCart.find(c => c.name === item.name);
                                                return (
                                                    <div key={idx} className="flex justify-between items-center bg-orange-50 border border-orange-200 p-3 rounded-lg shadow-sm">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                                                <span className="bg-brand-red text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">🔥 Popüler</span>
                                                                {item.name}
                                                            </div>
                                                            <div className="text-brand-red font-black text-xs mt-0.5">{item.price > 0 ? `${item.price} TL` : '—'}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-white rounded shadow-sm p-1">
                                                            <button 
                                                                onClick={() => {
                                                                    if(cartItem && cartItem.qty > 1) {
                                                                        setAdminCart(adminCart.map(c => c.name === item.name ? {...c, qty: c.qty - 1} : c));
                                                                    } else {
                                                                        setAdminCart(adminCart.filter(c => c.name !== item.name));
                                                                    }
                                                                }}
                                                                className="w-7 h-7 flex items-center justify-center bg-gray-100 text-brand-red rounded active:scale-95"
                                                            ><i className="fa-solid fa-minus text-xs"></i></button>
                                                            <span className="w-5 text-center font-bold text-gray-800 text-sm">{cartItem ? cartItem.qty : 0}</span>
                                                            <button 
                                                                onClick={() => {
                                                                    if(cartItem) {
                                                                        setAdminCart(adminCart.map(c => c.name === item.name ? {...c, qty: c.qty + 1} : c));
                                                                    } else {
                                                                        setAdminCart([...adminCart, { name: item.name, price: item.price, qty: 1 }]);
                                                                    }
                                                                }}
                                                                className="w-7 h-7 flex items-center justify-center bg-brand-red text-white rounded active:scale-95"
                                                            ><i className="fa-solid fa-plus text-xs"></i></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )
                            ) : (
                                Object.keys(menuData).map((catKey) => {
                                    const category = menuData[catKey];
                                    const filteredItems = category.items.filter((item: any) => 
                                        normalizeText(item.name).includes(normalizeText(adminSearchQuery))
                                    );
                                    if (filteredItems.length === 0) return null;

                                    return (
                                    <div key={catKey}>
                                        <h3 className="font-bold text-gray-700 text-lg mb-3 border-b pb-1">{category.title}</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {filteredItems.map((item: any, idx: number) => {
                                                const cartItem = adminCart.find(c => c.name === item.name);
                                                return (
                                                    <div key={idx} className="flex justify-between items-center bg-gray-50 border border-gray-200 p-3 rounded-lg shadow-sm">
                                                        <div className="flex-1">
                                                            <div className="font-bold text-gray-800 text-sm">{item.name}</div>
                                                            <div className="text-brand-red font-black text-xs">{item.price} TL</div>
                                                        </div>
                                                        <div className="flex items-center gap-2 bg-white rounded shadow-sm p-1">
                                                            <button 
                                                                onClick={() => {
                                                                    if(cartItem && cartItem.qty > 1) {
                                                                        setAdminCart(adminCart.map(c => c.name === item.name ? {...c, qty: c.qty - 1} : c));
                                                                    } else {
                                                                        setAdminCart(adminCart.filter(c => c.name !== item.name));
                                                                    }
                                                                }}
                                                                className="w-7 h-7 flex items-center justify-center bg-gray-100 text-brand-red rounded active:scale-95"
                                                            ><i className="fa-solid fa-minus text-xs"></i></button>
                                                            <span className="w-5 text-center font-bold text-gray-800 text-sm">{cartItem ? cartItem.qty : 0}</span>
                                                            <button 
                                                                onClick={() => {
                                                                    if(cartItem) {
                                                                        setAdminCart(adminCart.map(c => c.name === item.name ? {...c, qty: c.qty + 1} : c));
                                                                    } else {
                                                                        setAdminCart([...adminCart, { name: item.name, price: parseFloat(item.price || '0'), qty: 1 }]);
                                                                    }
                                                                }}
                                                                className="w-7 h-7 flex items-center justify-center bg-brand-red text-white rounded active:scale-95"
                                                            ><i className="fa-solid fa-plus text-xs"></i></button>
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    );
                                })
                            )}
                        </div>
                        <div className="p-5 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-gray-600">Toplam Tutarı:</span>
                                <span className="text-2xl font-black text-brand-red">{adminCart.reduce((s, c) => s + (c.price * c.qty), 0)} TL</span>
                            </div>
                            <button 
                                onClick={() => {
                                    if(adminCart.length > 0) {
                                        handleAction('add_to_table', { tableId: addingToTable, items: adminCart });
                                        printToLocalServer(addingToTable, adminCart, 'MANUEL');
                                        setAddingToTable(null);
                                        setAdminCart([]);
                                        setAdminSearchQuery('');
                                    }
                                }}
                                disabled={adminCart.length === 0}
                                className="w-full bg-brand-red text-white font-bold py-3 rounded-xl shadow-md hover:bg-brand-dark transition-colors disabled:opacity-50"
                            >
                                Masaya Ekle
                            </button>
                        </div>
                    </div>
                </div>
                );
            })()}
            
            <audio id="notificationSound" src="/notification.mp3" preload="auto"></audio>
            
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
