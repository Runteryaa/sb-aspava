'use client';

import { useState, useEffect, useRef } from 'react';
import Pusher from 'pusher-js';

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
    const [cart, setCart] = useState<{name: string, price: number, qty: number, note?: string}[]>([]);
    const [cartOpen, setCartOpen] = useState(false);
    const [ordering, setOrdering] = useState(false);
    const [orderNote, setOrderNote] = useState('');
    const [myOrders, setMyOrders] = useState<any[]>([]);
    const [isReadOnly, setIsReadOnly] = useState<boolean>(true);
    const [hasCheckedSession, setHasCheckedSession] = useState<boolean>(false);
    
    // Feedback states
    const [showFeedback, setShowFeedback] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

    // Options modal state
    const [optionsModal, setOptionsModal] = useState<{item: any} | null>(null);

    // Order success + feedback modal
    const [orderSuccessModal, setOrderSuccessModal] = useState(false);
    
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
                if (data.error === 'Bu oturum kapatılmış veya geçersiz.' && !errorMsg) {
                    setShowFeedback(true);
                } else {
                    setErrorMsg(data.error);
                }
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
                setHasCheckedSession(true);
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
        
        // Pusher üzerinden WebSocket dinleme (Polling yerine)
        const pusher = new Pusher('3e97c3f16351fdefca9e', {
            cluster: 'eu'
        });

        const channel = pusher.subscribe('qr-channel');
        channel.bind('update-table', function(data: any) {
            const currentT = new URLSearchParams(window.location.search).get('masa');
            const currentS = new URLSearchParams(window.location.search).get('s') || getCookie('aspava_session');
            
            // Sadece bu masayla ilgili bir güncelleme ise tabloyu yenile
            if (data.tableId === currentT || data.sessionId === currentS) {
                checkTableSession(currentT, currentS, currentS);
            }
        });

        // Pusher Edge Runtime'da tetiklenmezse diye 3 saniyede bir manuel kontrol edelim (Polling)
        const fallbackInterval = setInterval(() => {
            const currentT = new URLSearchParams(window.location.search).get('masa');
            const currentS = new URLSearchParams(window.location.search).get('s') || getCookie('aspava_session');
            if (currentT || currentS) {
                checkTableSession(currentT, currentS, currentS);
            }
        }, 3000);

        return () => {
            clearInterval(fallbackInterval);
            pusher.unsubscribe('qr-channel');
        };
    }, []);

    const isVariantOf = (variantName: string, baseName: string) => {
        if (variantName === baseName) return true;
        if (!variantName.startsWith(baseName)) return false;
        const suffix = variantName.substring(baseName.length);
        return suffix.startsWith(' (') || suffix.startsWith(' Dürüm');
    };

    const addToCart = (item: any) => {
        if (!item.price) return; // Cannot add items without price
        setCart(prev => {
            const existing = prev.find(i => i.name === item.name);
            if (existing) {
                return prev.map(i => i.name === item.name ? { ...i, qty: i.qty + 1 } : i);
            }
            return [...prev, { name: item.name, price: Number(item.price), qty: 1, note: '' }];
        });
    };

    const updateCartItemNote = (name: string, note: string) => {
        setCart(prev => prev.map(i => i.name === name ? { ...i, note } : i));
    };

    const handleAddToCartOrShowOptions = (item: any) => {
        if (!item.price) return;
        
        let currentOptions = item.options ? [...item.options] : [];
        
        // DeepSeek'in eklediği eski sabit ayarları temizle (çakışmayı önlemek için)
        currentOptions = currentOptions.filter(o => !['Acılı', 'Acısız', 'Tabak', 'Dürüm'].includes(o.label));
        
        let generatedOptions = [{ label: '', suffix: '' }];

        if (item.askDurum) {
            generatedOptions = [
                { label: 'Tabak', suffix: '' },
                { label: 'Dürüm', suffix: ' Dürüm' }
            ];
        }

        if (item.askSpicy) {
            const spicyVariants = [
                { label: 'Acılı', suffix: ' (Acılı)' },
                { label: 'Acısız', suffix: ' (Acısız)' }
            ];
            
            if (generatedOptions.length === 1 && generatedOptions[0].label === '') {
                generatedOptions = spicyVariants;
            } else {
                let combined: { label: string, suffix: string }[] = [];
                for (let base of generatedOptions) {
                    for (let spicy of spicyVariants) {
                        combined.push({
                            label: base.label + ' - ' + spicy.label,
                            suffix: base.suffix + spicy.suffix
                        });
                    }
                }
                generatedOptions = combined;
            }
        }

        if (generatedOptions.length > 1 || (generatedOptions.length === 1 && generatedOptions[0].label !== '')) {
            currentOptions = [...generatedOptions, ...currentOptions];
        }

        if (currentOptions.length > 0) {
            setOptionsModal({ item: { ...item, options: currentOptions } });
        } else {
            addToCart(item);
        }
    };

    const addToCartWithOption = (item: any, option: {label: string, suffix: string}) => {
        const itemWithOption = { ...item, name: item.name + option.suffix };
        addToCart(itemWithOption);
        setOptionsModal(null);
    };

    const removeFromCart = (item: any) => {
        setCart(prev => {
            let existing = prev.find(i => i.name === item.name);
            if (!existing) {
                // If exact match not found, try to find a variant
                const isOneHalf = item.name.includes('(1.5 Porsiyon)');
                existing = [...prev].reverse().find(i => {
                    if (!isVariantOf(i.name, item.name)) return false;
                    if (!isOneHalf && i.name.includes('(1.5 Porsiyon)')) return false;
                    return true;
                });
            }
            if (!existing) return prev;
            if (existing.qty === 1) {
                return prev.filter(i => i.name !== existing.name);
            }
            return prev.map(i => i.name === existing.name ? { ...i, qty: i.qty - 1 } : i);
        });
    };

    const placeOrder = async () => {
        if (cart.length === 0 || !sessionId || !tableId) return;
        setOrdering(true);
        try {
            const res = await fetch('/api/order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tableId, sessionId, items: cart, note: orderNote })
            });
            const data = await res.json();
            if (data.error) {
                alert("Hata: " + data.error);
            } else {
                setCart([]);
                setOrderNote('');
                setCartOpen(false);
                setRating(0);
                setComment('');
                setFeedbackSubmitted(false);
                setOrderSuccessModal(true);
                checkTableSession(tableId, sessionId);
            }
        } catch (e) {
            alert("Bağlantı hatası.");
        } finally {
            setOrdering(false);
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

    const submitFeedback = async () => {
        try {
            await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rating, comment, tableId })
            });
            setFeedbackSubmitted(true);
        } catch (e) {
            console.error(e);
        }
    };

    if (showFeedback) {
        return (
            <div className="min-h-screen bg-brand-light flex items-center justify-center p-6 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg border-t-4 border-brand-red w-full max-w-md">
                    {feedbackSubmitted ? (
                        <div className="animate-fade-in">
                            <i className="fa-solid fa-circle-check text-5xl text-green-500 mb-4"></i>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Teşekkürler!</h2>
                            <p className="text-gray-600">Değerlendirmeniz başarıyla iletildi. Yine bekleriz!</p>
                        </div>
                    ) : (
                        <div className="animate-fade-in">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">Bizi Değerlendirin</h2>
                            <p className="text-gray-500 text-sm mb-6">Yemeklerimiz nasıldı? Puan vererek bize destek olabilirsiniz.</p>
                            
                            <div className="flex justify-center gap-2 mb-6">
                                {[1,2,3,4,5].map(star => (
                                    <button 
                                        key={star}
                                        onClick={() => setRating(star)}
                                        className={`text-4xl transition-transform hover:scale-110 ${rating >= star ? 'text-brand-gold drop-shadow-md' : 'text-gray-200'}`}
                                    >
                                        <i className="fa-solid fa-star"></i>
                                    </button>
                                ))}
                            </div>
                            
                            <textarea
                                value={comment}
                                onChange={e => setComment(e.target.value)}
                                placeholder="Eklemek istediğiniz bir not var mı? (İsteğe bağlı)"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm mb-4 outline-none focus:border-brand-red transition-colors"
                                rows={3}
                            ></textarea>
                            
                            <button 
                                onClick={submitFeedback}
                                disabled={rating === 0}
                                className="w-full bg-brand-red text-white font-bold py-3 rounded-xl disabled:opacity-50 hover:bg-red-800 transition-colors"
                            >
                                Gönder
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

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

    if (!menuData || (tableId && !hasCheckedSession)) {
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
                                    <div 
                                        key={index} 
                                        onDoubleClick={() => { if (tableId && !isReadOnly && item.price) handleAddToCartOrShowOptions(item); }}
                                        className="menu-item p-3 sm:p-4 flex justify-between items-center gap-4 hover:bg-gray-50 transition-colors rounded-xl border-b border-dashed border-gray-200 last:border-b-0 cursor-pointer select-none"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                            {item.desc && <p className="text-sm text-gray-500 leading-tight mt-0.5">{item.desc}</p>}
                                        </div>
                                        {item.price && (
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="font-black text-brand-red text-lg whitespace-nowrap">{item.price} TL</div>
                                                {tableId && !isReadOnly && (() => {
                                                    const showOneHalf = item.allowOneHalf === true;
                                                    const itemOneHalf = { ...item, name: item.name + ' (1.5 Porsiyon)', price: (parseFloat(item.price) * 1.5).toString() };
                                                    
                                                    const cartItems = cart.filter(c => isVariantOf(c.name, item.name) && !c.name.includes('(1.5 Porsiyon)'));
                                                    const totalQty = cartItems.reduce((acc, c) => acc + c.qty, 0);
                                                    const cartItem = totalQty > 0 ? { qty: totalQty } : null;

                                                    const cartItemsOneHalf = showOneHalf ? cart.filter(c => isVariantOf(c.name, itemOneHalf.name)) : [];
                                                    const totalQtyOneHalf = cartItemsOneHalf.reduce((acc, c) => acc + c.qty, 0);
                                                    const cartItemOneHalf = totalQtyOneHalf > 0 ? { qty: totalQtyOneHalf } : null;
                                                    
                                                    return (
                                                        <div className="flex items-center justify-end gap-2">
                                                            {/* Normal Porsiyon */}
                                                            {cartItem ? (
                                                                <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 rounded-lg p-1 shadow-inner">
                                                                    <button 
                                                                        onClick={() => removeFromCart(item)}
                                                                        className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-brand-red rounded shadow-sm flex items-center justify-center font-bold active:scale-95"
                                                                    >
                                                                        <i className="fa-solid fa-minus text-xs sm:text-base"></i>
                                                                    </button>
                                                                    <span className="font-black text-gray-800 min-w-[1rem] sm:min-w-[1.5rem] text-center text-sm sm:text-base">{cartItem.qty}</span>
                                                                    <button 
                                                                        onClick={() => handleAddToCartOrShowOptions(item)}
                                                                        className="w-7 h-7 sm:w-8 sm:h-8 bg-brand-red text-white rounded shadow-sm flex items-center justify-center font-bold active:scale-95"
                                                                    >
                                                                        <i className="fa-solid fa-plus text-xs sm:text-base"></i>
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <button 
                                                                    onClick={() => handleAddToCartOrShowOptions(item)}
                                                                    className="bg-brand-red text-white text-sm font-bold px-3 sm:px-4 py-2 rounded-lg shadow-sm active:scale-95 transition-transform flex items-center gap-1 sm:gap-2 whitespace-nowrap"
                                                                >
                                                                    <i className="fa-solid fa-plus"></i> Ekle
                                                                    {item.options && item.options.length > 0 && <i className="fa-solid fa-chevron-down text-xs opacity-75"></i>}
                                                                </button>
                                                            )}
                                                            
                                                            {/* 1.5 Porsiyon */}
                                                            {showOneHalf && (
                                                                cartItemOneHalf ? (
                                                                    <div className="flex items-center gap-1 sm:gap-2 bg-orange-100 rounded-lg p-1 shadow-inner">
                                                                        <button 
                                                                            onClick={() => removeFromCart(itemOneHalf)}
                                                                            className="w-7 h-7 sm:w-8 sm:h-8 bg-white text-orange-600 rounded shadow-sm flex items-center justify-center font-bold active:scale-95"
                                                                        >
                                                                            <i className="fa-solid fa-minus text-xs sm:text-base"></i>
                                                                        </button>
                                                                        <span className="font-black text-orange-800 min-w-[1rem] sm:min-w-[1.5rem] text-center text-sm sm:text-base" title="1.5 Porsiyon"><span className="text-[10px] text-orange-600 mr-0.5">1.5</span>{cartItemOneHalf.qty}</span>
                                                                        <button 
                                                                            onClick={() => handleAddToCartOrShowOptions(itemOneHalf)}
                                                                            className="w-7 h-7 sm:w-8 sm:h-8 bg-orange-500 text-white rounded shadow-sm flex items-center justify-center font-bold active:scale-95"
                                                                        >
                                                                            <i className="fa-solid fa-plus text-xs sm:text-base"></i>
                                                                        </button>
                                                                    </div>
                                                                ) : (
                                                                    <button 
                                                                        onClick={() => handleAddToCartOrShowOptions(itemOneHalf)}
                                                                        className="bg-orange-500 text-white text-sm font-bold px-3 py-2 rounded-lg shadow-sm active:scale-95 transition-transform whitespace-nowrap flex items-center justify-center"
                                                                    >
                                                                        1.5
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
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
                        
                        <div className="flex-1 overflow-y-auto p-5 space-y-3">
                            {cart.map((c, i) => (
                                <div key={i} className="border-b pb-3 last:border-0 last:pb-0">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-lg">
                                                <button onClick={() => removeFromCart(c)} className="w-6 h-6 bg-white text-brand-red rounded shadow-sm flex items-center justify-center font-bold active:scale-95"><i className="fa-solid fa-minus text-xs"></i></button>
                                                <span className="font-black text-gray-800 w-5 text-center text-sm">{c.qty}</span>
                                                <button onClick={() => addToCart(c)} className="w-6 h-6 bg-brand-red text-white rounded shadow-sm flex items-center justify-center font-bold active:scale-95"><i className="fa-solid fa-plus text-xs"></i></button>
                                            </div>
                                            <span className="font-bold text-gray-800">{c.name}</span>
                                        </div>
                                        <span className="font-bold text-gray-600 flex-shrink-0 ml-2">{c.price * c.qty} TL</span>
                                    </div>
                                    <div className="mt-1.5 ml-1">
                                        <input
                                            type="text"
                                            value={c.note || ''}
                                            onChange={(e) => updateCartItemNote(c.name, e.target.value)}
                                            placeholder={`${c.name} için not... (örn: az acılı)`}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-700 focus:ring-1 focus:ring-brand-red outline-none placeholder-gray-400"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="px-5 pb-3">
                            <textarea 
                                value={orderNote}
                                onChange={(e) => setOrderNote(e.target.value)}
                                placeholder="Sipariş notunuz (Örn: Acılı olsun, limon bol olsun...)"
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-brand-red outline-none resize-none h-16 text-gray-800"
                            />
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

            {/* Options Modal */}
            {optionsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setOptionsModal(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
                            <div>
                                <h3 className="text-lg font-black text-gray-900">{optionsModal.item.name}</h3>
                                <p className="text-sm text-gray-500">Nasıl olsun?</p>
                            </div>
                            <button onClick={() => setOptionsModal(null)} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                                <i className="fa-solid fa-xmark"></i>
                            </button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-3">
                            {optionsModal.item.options.map((opt: any, i: number) => (
                                <button
                                    key={i}
                                    onClick={() => addToCartWithOption(optionsModal.item, opt)}
                                    className="bg-brand-red text-white font-bold py-4 rounded-xl text-base active:scale-95 transition-transform shadow-md hover:bg-red-800"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Order Success + Quick Feedback Modal */}
            {orderSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up">
                        {/* Success Header */}
                        <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-6 text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i className="fa-solid fa-check text-3xl"></i>
                            </div>
                            <h3 className="text-xl font-black">Siparişiniz Alındı!</h3>
                            <p className="text-green-100 text-sm mt-1">Mutfağa iletildi, en kısa sürede hazırlanacak.</p>
                        </div>

                        {/* Feedback */}
                        <div className="p-5">
                            {feedbackSubmitted ? (
                                <div className="text-center py-4">
                                    <p className="font-bold text-gray-700">Teşekkürler! 🙏</p>
                                    <p className="text-sm text-gray-500 mt-1">Değerlendirmeniz iletildi.</p>
                                    <button
                                        onClick={() => setOrderSuccessModal(false)}
                                        className="mt-4 w-full bg-brand-red text-white font-bold py-3 rounded-xl hover:bg-red-800 transition-colors"
                                    >
                                        Kapat
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <p className="text-center text-sm font-bold text-gray-600 mb-4">Bu sistemi beğendiniz mi?</p>
                                    <div className="flex justify-center gap-3 mb-5">
                                        {[1,2,3,4,5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setRating(star)}
                                                className={`text-4xl transition-transform active:scale-90 hover:scale-110 ${rating >= star ? 'text-yellow-400 drop-shadow' : 'text-gray-200'}`}
                                            >
                                                <i className="fa-solid fa-star"></i>
                                            </button>
                                        ))}
                                    </div>

                                    {rating > 0 && (
                                        <textarea
                                            value={comment}
                                            onChange={e => setComment(e.target.value)}
                                            placeholder="İsteğe bağlı bir yorum bırakabilirsiniz..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm mb-3 outline-none focus:border-brand-red transition-colors resize-none"
                                            rows={2}
                                        ></textarea>
                                    )}

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setOrderSuccessModal(false)}
                                            className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                                        >
                                            Geç
                                        </button>
                                        <button
                                            onClick={submitFeedback}
                                            disabled={rating === 0}
                                            className="flex-1 bg-brand-red text-white font-bold py-3 rounded-xl disabled:opacity-40 hover:bg-red-800 transition-colors text-sm"
                                        >
                                            Gönder
                                        </button>
                                    </div>
                                </>
                            )}
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
