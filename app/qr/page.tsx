'use client';

import { useState, useEffect } from 'react';

const categoryConfig: Record<string, { id: string, color: string, icon: string }> = {
    kahvalti: { id: 'corbalar', color: 'bg-amber-400', icon: 'fa-mug-hot' },
    pideler: { id: 'pideler', color: 'bg-orange-500', icon: 'fa-pizza-slice' },
    kebaplar: { id: 'kebaplar', color: 'bg-brand-red', icon: 'fa-utensils' },
    kiremitler: { id: 'kiremit', color: 'bg-orange-700', icon: 'fa-bowl-food' },
    tatlilar: { id: 'tatlilar', color: 'bg-pink-500', icon: 'fa-stroopwafel' },
    icecekler: { id: 'icecekler', color: 'bg-sky-400', icon: 'fa-bottle-water' }
};

export default function QRMenu() {
    const [menuData, setMenuData] = useState<any>(null);
    const [tableId, setTableId] = useState<string | null>(null);
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [cart, setCart] = useState<{name: string, price: number, qty: number}[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [ordering, setOrdering] = useState(false);
    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(false);
    
    // API'den durumu kontrol eden fonksiyon
    const checkTableSession = (tId: string | null, sId: string | null, urlSession: string | null = null) => {
        fetch('/api/table', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tableId: tId, sessionId: sId, urlSessionId: urlSession })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                setErrorMsg(data.error);
            } else if (data.success) {
                if (data.isOwner) {
                    // Masayı ilk açan kişi
                    setIsReadOnly(false);
                    // Set cookie for 12 hours
                    document.cookie = `aspava_session=${data.joinedSessionId}; max-age=${12 * 60 * 60}; path=/`;
                    setSessionId(data.joinedSessionId);
                    
                    // Update URL to /qr?s=joinedSessionId (Masa querysini kaldırıyoruz)
                    const currentUrl = new URL(window.location.href);
                    if (currentUrl.searchParams.has('masa') || currentUrl.searchParams.get('s') !== data.joinedSessionId) {
                        currentUrl.searchParams.delete('masa');
                        currentUrl.searchParams.set('s', data.joinedSessionId);
                        window.history.replaceState({}, '', currentUrl.toString());
                    }
                } else {
                    // Masaya sonradan giren kişi
                    setIsReadOnly(true);
                }

                if (data.tableId) {
                    setTableId(data.tableId);
                }

                if (data.orders) {
                    setMyOrders(data.orders);
                }
            }
        })
        .catch(() => setErrorMsg("Sunucuya bağlanılamadı."));
    };

    useEffect(() => {
        // İlk yüklemede menüyü çek
        fetch('/api/menu')
            .then(res => res.json())
            .then(data => setMenuData(data))
            .catch(err => console.error(err));

        // Validate table session
        const searchParams = new URLSearchParams(window.location.search);
        const t = searchParams.get('masa');
        const s = searchParams.get('s');

        if (!t && !s) {
            // Sadece menüyü görüntüleme modu
            return;
        }

        if (t) setTableId(t);

        // Get session from cookie if it exists
        const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
        };
        const localSession = getCookie('aspava_session');

        // İlk yükleme (masa varsa masa id'si ile, yoksa null göndererek sadece session id ile kontrol et)
        checkTableSession(t || null, localSession, s);
        
        // Polling (Her 15 saniyede bir sipariş durumunu güncelle - Sadece başarılı giriş yaptıysa)
        const interval = setInterval(() => {
            const currentSession = getCookie('aspava_session');
            const currentS = new URLSearchParams(window.location.search).get('s');
            
            // Eğer session yoksa (henüz girmediyse veya konum onaylamadıysa) poll yapma
            if (currentSession || currentS) {
                // Polling sırasında masa ID göndermiyoruz ki backend sadece session ID'den masayı bulsun
                checkTableSession(null, currentSession, currentS);
            }
        }, 15000);
        
        return () => clearInterval(interval);
    }, []);

    const addToCart = (item: any) => {
        if (!item.price) return; // Cannot add items without price
        setCart(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (existing) {
                return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { name: item.name, price: Number(item.price), qty: 1 }];
        });
    };

    const removeFromCart = (item: any) => {
        setCart(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (!existing) return prev;
            if (existing.qty === 1) {
                return prev.filter(i => i.name !== item.name);
            }
            return prev.map(i => i.name === item.name ? { ...i, qty: i.qty - 1 } : i);
        });
    };

    const placeOrder = async () => {
        if (cart.length === 0 || !sessionId || !tableId) return;
        setOrdering(true);
        try {
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId, sessionId, items: cart })
            });
            const data = await res.json();
            if (data.error) {
                alert("Hata: " + data.error);
            } else {
                alert("Siparişiniz başarıyla alındı! Afiyet olsun.");
                setCart([]);
                setCartOpen(false);
                checkTableSession(tableId, sessionId);
            }
        } catch (e) {
            alert("Bağlantı hatası.");
        }
        setOrdering(false);
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-brand-red">
                    <i className="fa-solid fa-triangle-exclamation text-4xl text-brand-red mb-4"></i>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Hata</h2>
                    <p className="text-gray-600">{errorMsg}</p>
                </div>
            </div>
        );
    }

    if (!menuData || (tableId && !sessionId)) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-light">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-red"></div>
            </div>
        );
    }

    return (
        <div className="bg-brand-light text-gray-800 antialiased font-sans min-h-screen pb-32">
            {/* Header */}
            <header className="sticky top-0 bg-white border-b-4 border-brand-red z-40 shadow-md">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex-shrink-0 flex items-center">
                        <a href="/" className="inline-block hover:scale-105 transition-transform">
                            <h1 className="text-4xl font-logo text-brand-red tracking-wide drop-shadow-md" style={{ textShadow: '-1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 2px 2px 0 #000' }}>
                                 SB Aspava
                            </h1>
                        </a>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="text-sm font-bold bg-gray-100 text-gray-800 px-4 py-2 rounded-full">
                            {isReadOnly ? (tableId ? `Masa ${tableId} (Sadece İnceleme)` : 'Sadece İnceleme') : (tableId ? `Masa ${tableId}` : 'Sadece İnceleme')}
                        </div>
                    </div>
                </div>
                
                {/* Category Navigation */}
                <nav className="bg-brand-red overflow-x-auto no-scrollbar shadow-inner" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                    <ul className="flex items-center px-2 py-2 max-w-3xl mx-auto w-max sm:w-full space-x-1">
                        {Object.keys(menuData).map((key) => {
                            const config = categoryConfig[key];
                            if (!config) return null;
                            return (
                                <li key={key}>
                                    <a href={`#${config.id}`} className="px-4 py-2 block text-sm font-bold text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors whitespace-nowrap">
                                        {menuData[key].title}
                                    </a>
                                </li>
                            );
                        })}
                    </ul>
                </nav>
            </header>

            {/* Menu Content */}
            <main className="max-w-3xl mx-auto px-4 py-6 space-y-10">
                
                {/* Siparişlerim */}
                {myOrders.length > 0 && (
                    <section className="bg-white border-2 border-brand-red rounded-2xl p-4 shadow-sm mb-8">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
                            <div className="flex items-center gap-3">
                                <i className="fa-solid fa-receipt text-brand-red text-xl"></i>
                                <h2 className="text-xl font-black text-gray-900 tracking-tight">Siparişlerim & Durumları</h2>
                            </div>
                            <div className="text-brand-red font-black text-lg bg-red-50 px-3 py-1 rounded-lg">
                                ₺{myOrders.reduce((total, order) => {
                                    if (order.status === 'iptal') return total;
                                    return total + order.items.reduce((sum: number, item: any) => sum + ((item.price || 0) * item.qty), 0);
                                }, 0).toFixed(2)}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {myOrders.map((order, idx) => (
                                <div key={idx} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-sm font-bold text-gray-500">
                                            {new Date(order.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div className={`text-xs font-black px-2 py-1 rounded-full ${
                                            order.status === 'bekliyor' ? 'bg-orange-100 text-orange-600' :
                                            order.status === 'iptal' ? 'bg-red-100 text-red-600' :
                                            order.status === 'hazir' ? 'bg-blue-100 text-blue-600' :
                                            'bg-green-100 text-green-600'
                                        }`}>
                                            {order.status === 'bekliyor' ? 'MUTFAKTA BEKLİYOR' :
                                             order.status === 'iptal' ? 'İPTAL EDİLDİ' :
                                             order.status === 'hazir' ? 'AFİYET OLSUN (Servis Edildi)' :
                                             'HAZIRLANIYOR'}
                                        </div>
                                    </div>
                                    <ul className={`space-y-1 ${order.status === 'iptal' ? 'opacity-50 line-through' : ''}`}>
                                        {order.items.map((item: any, iIdx: number) => (
                                            <li key={iIdx} className="text-sm font-bold text-gray-800">
                                                <span className="text-brand-red mr-1">{item.qty}x</span> {item.name}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {Object.keys(menuData).map((categoryKey) => {
                    const category = menuData[categoryKey];
                    const config = categoryConfig[categoryKey] || { id: categoryKey, color: 'bg-gray-500', icon: 'fa-utensils' };
                    
                    return (
                        <section id={config.id} className="scroll-mt-32" key={categoryKey}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-10 h-10 ${config.color} rounded-full flex items-center justify-center text-white shrink-0 shadow-md`}>
                                    <i className={`fa-solid ${config.icon}`}></i>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{category.title}</h2>
                            </div>
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden p-2">
                                {category.items.map((item: any, index: number) => (
                                    <div key={index} className="menu-item p-3 sm:p-4 flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors rounded-xl border-b border-dashed border-gray-200 last:border-b-0">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                            {item.desc && <p className="text-sm text-gray-500 leading-tight mt-0.5">{item.desc}</p>}
                                        </div>
                                        {item.price && (
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="font-black text-brand-red text-lg whitespace-nowrap">{item.price} TL</div>
                                                {tableId && !isReadOnly && (() => {
                                                    const cartItem = cart.find(c => c.name === item.name);
                                                    if (cartItem) {
                                                        return (
                                                            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1 shadow-inner">
                                                                <button 
                                                                    onClick={() => removeFromCart(item)}
                                                                    className="w-8 h-8 bg-white text-brand-red rounded shadow-sm flex items-center justify-center font-bold active:scale-95"
                                                                >
                                                                    <i className="fa-solid fa-minus"></i>
                                                                </button>
                                                                <span className="font-black text-gray-800 min-w-[1.5rem] text-center">{cartItem.qty}</span>
                                                                <button 
                                                                    onClick={() => addToCart(item)}
                                                                    className="w-8 h-8 bg-brand-red text-white rounded shadow-sm flex items-center justify-center font-bold active:scale-95"
                                                                >
                                                                    <i className="fa-solid fa-plus"></i>
                                                                </button>
                                                            </div>
                                                        );
                                                    }
                                                    return (
                                                        <button 
                                                            onClick={() => addToCart(item)}
                                                            className="bg-brand-red text-white text-sm font-bold px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-transform flex items-center gap-2"
                                                        >
                                                            <i className="fa-solid fa-plus"></i> Ekle
                                                        </button>
                                                    );
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    );
                })}
            </main>

            {/* Floating Cart Button */}
            {cartCount > 0 && !cartOpen && !isReadOnly && (
                <div className="fixed bottom-6 left-0 right-0 px-4 z-40 flex justify-center animate-bounce-short">
                    <button 
                        onClick={() => setCartOpen(true)}
                        className="bg-brand-red text-white font-bold w-full max-w-md py-4 rounded-2xl shadow-[0_10px_25px_-5px_rgba(185,28,28,0.5)] flex items-center justify-between px-6"
                    >
                        <div className="flex items-center gap-3">
                            <div className="bg-white text-brand-red w-8 h-8 rounded-full flex items-center justify-center font-black">
                                {cartCount}
                            </div>
                            <span className="text-lg">Sepetim</span>
                        </div>
                        <span className="text-xl font-black">{cartTotal} TL</span>
                    </button>
                </div>
            )}

            {/* Cart Modal */}
            {cartOpen && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
                    <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-slide-up">
                        <div className="p-5 border-b flex justify-between items-center bg-gray-50">
                            <h2 className="text-xl font-black text-gray-900">Sipariş Sepeti</h2>
                            <button onClick={() => setCartOpen(false)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {cart.map((c, i) => (
                                <div key={i} className="flex justify-between items-center border-b pb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                                            <button onClick={() => removeFromCart(c)} className="w-6 h-6 bg-white text-brand-red rounded shadow-sm flex items-center justify-center font-bold active:scale-95"><i className="fa-solid fa-minus text-xs"></i></button>
                                            <span className="font-black text-gray-800 w-5 text-center text-sm">{c.qty}</span>
                                            <button onClick={() => addToCart(c)} className="w-6 h-6 bg-brand-red text-white rounded shadow-sm flex items-center justify-center font-bold active:scale-95"><i className="fa-solid fa-plus text-xs"></i></button>
                                        </div>
                                        <span className="font-bold text-gray-800">{c.name}</span>
                                    </div>
                                    <span className="font-bold text-gray-600">{c.price * c.qty} TL</span>
                                </div>
                            ))}
                        </div>

                        <div className="p-5 bg-gray-50 border-t">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold text-gray-600">Toplam Tutar</span>
                                <span className="text-2xl font-black text-brand-red">{cartTotal} TL</span>
                            </div>
                            <button 
                                onClick={placeOrder}
                                disabled={ordering}
                                className="w-full bg-brand-red text-white font-bold py-4 rounded-xl text-lg shadow-md disabled:opacity-50"
                            >
                                {ordering ? 'Sipariş İletiliyor...' : 'Siparişi Onayla'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{__html: `
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .animate-slide-up { animation: slideUp 0.3s ease-out forwards; }
                .animate-bounce-short { animation: bounceShort 0.5s ease-out 1; }
                @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
                @keyframes bounceShort { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
            `}} />
        </div>
    );
}
