export default function Page() {
  return (
    <div dangerouslySetInnerHTML={{__html: `

    <!-- Sipariş Modal -->
    <div id="orderModal" class="modal fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md px-4 z-50">
        <div class="modal-content bg-white rounded-[2rem] shadow-2xl max-w-lg w-full overflow-hidden relative border border-gray-100">
            <button onclick="closeModal('orderModal')" class="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:text-brand-red hover:bg-red-50 transition-colors z-10">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
            <div class="px-4 sm:px-10 pt-6 sm:pt-10 pb-4 sm:pb-6 text-center">
                <div class="w-12 h-12 sm:w-16 sm:h-16 bg-brand-red text-white rounded-xl sm:rounded-2xl flex items-center justify-center text-2xl sm:text-3xl mx-auto mb-3 sm:mb-4 shadow-lg shadow-red-500/30">
                    <i class="fa-solid fa-motorcycle"></i>
                </div>
                <h3 class="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-1 sm:mb-2">Sipariş Platformu</h3>
                <p class="text-sm sm:text-base text-gray-500 leading-tight sm:leading-normal">Lütfen tercih ettiğiniz sipariş platformunu seçin.</p>
            </div>
            <div class="p-6 pt-0 space-y-3">
                <!-- Yemeksepeti -->
                <a href="https://www.yemeksepeti.com/restaurant/bdgl/sb-aspava" target="_blank" rel="noopener noreferrer" class="lokanta-card px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between group overflow-hidden gap-2 sm:gap-4">
                    <div class="flex items-center gap-2 sm:gap-4 shrink-0">
                        <span class="text-sm min-[380px]:text-base sm:text-xl font-black text-brand-red tracking-tight sm:tracking-normal">Yemeksepeti</span>
                    </div>
                    <div class="flex items-center justify-end gap-1 sm:gap-3 min-w-0 shrink">
                        <span class="text-[10px] min-[380px]:text-xs sm:text-sm font-black text-gray-500 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-transparent group-hover:border-brand-red transition-colors inline-flex flex-wrap justify-center items-center gap-x-1 text-center shrink">
                            <span class="whitespace-nowrap">4.9<i class="fa-solid fa-star text-brand-gold ml-0.5"></i></span>
                            <span class="break-all">(4000+)</span>
                        </span>
                        <i class="fa-solid fa-arrow-right text-gray-300 group-hover:text-brand-red transition-colors text-base sm:text-xl shrink-0"></i>
                    </div>
                </a>
                <!-- Trendyol Yemek -->
                <a href="https://tgoyemek.com/restoranlar/420441?utm_source=google_food_ordering&utm_medium=organic&utm_campaign=CM2826747-search-free-nonbrand-google-pas_e-tygo_ios-and-web_acq_Global&utm_term=order#bu-restoranin-en-sevilenleri" target="_blank" rel="noopener noreferrer" class="lokanta-card px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between group overflow-hidden gap-2 sm:gap-4 !border-orange-500 !shadow-[4px_4px_0_0_#f97316] hover:!shadow-[6px_6px_0_0_#f97316]">
                    <div class="flex items-center gap-2 sm:gap-4 shrink">
                        <span class="text-sm min-[380px]:text-base sm:text-xl font-black text-orange-500 tracking-tight sm:tracking-normal">Trendyol Go</span>
                    </div>
                    <div class="flex items-center justify-end gap-1 sm:gap-3 shrink-0">
                        <span class="text-[10px] min-[380px]:text-xs sm:text-sm font-black text-gray-500 bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg border-2 border-transparent group-hover:border-orange-500 transition-colors whitespace-nowrap">4.9 <i class="fa-solid fa-star text-orange-400 ml-1"></i></span>
                        <i class="fa-solid fa-arrow-right text-gray-300 group-hover:text-orange-500 transition-colors text-base sm:text-xl shrink-0"></i>
                    </div>
                </a>

                <div class="my-6 border-t border-gray-200 text-center relative">
                    <span class="bg-white px-3 text-xs font-black text-gray-400 uppercase tracking-widest -top-2">veya telefonla sipariş verin</span>
                </div>

                <div class="flex flex-col gap-3 sm:gap-4">
                    <!-- Sabit Hat -->
                    <a href="tel:+903122393334" class="lokanta-card px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between group !border-brand-dark !shadow-[4px_4px_0_0_#7f1d1d] hover:!shadow-[6px_6px_0_0_#7f1d1d] !bg-brand-red text-white">
                        <div class="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center text-base sm:text-xl shrink-0">
                                <i class="fa-solid fa-phone"></i>
                            </div>
                            <div class="flex flex-col min-w-0 pr-2 overflow-hidden">
                                <span class="text-[9px] sm:text-xs font-bold text-white/70 uppercase truncate whitespace-nowrap">Sabit Hat</span>
                                <span class="text-[clamp(12px,4vw,20px)] sm:text-xl font-black leading-tight whitespace-nowrap tracking-tighter sm:tracking-normal truncate">0 (312) 239 33 34</span>
                            </div>
                        </div>
                        <i class="fa-solid fa-arrow-right text-white/50 group-hover:text-white transition-colors text-base sm:text-xl shrink-0"></i>
                    </a>

                    <!-- Cep / WhatsApp -->
                    <div class="flex gap-2 sm:gap-3">
                        <a href="tel:+905531587333" class="lokanta-card flex-1 px-2 sm:px-4 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 group !border-brand-dark !shadow-[4px_4px_0_0_#7f1d1d] hover:!shadow-[6px_6px_0_0_#7f1d1d] !bg-brand-red text-white overflow-hidden">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center text-base sm:text-xl shrink-0">
                                <i class="fa-solid fa-mobile-screen"></i>
                            </div>
                            <div class="flex flex-col min-w-0 pr-1 overflow-hidden">
                                <span class="text-[9px] sm:text-xs font-bold text-white/70 uppercase truncate whitespace-nowrap">Cep Telefonu</span>
                                <span class="text-[clamp(11px,3.5vw,18px)] sm:text-lg font-black leading-tight whitespace-nowrap tracking-tighter sm:tracking-normal truncate">0 (553) 158 73 33</span>
                            </div>
                        </a>
                        
                        <a href="https://wa.me/905531587333" target="_blank" rel="noopener noreferrer" class="lokanta-card w-14 sm:w-20 flex items-center justify-center group !border-green-700 !shadow-[4px_4px_0_0_#15803d] hover:!shadow-[6px_6px_0_0_#15803d] !bg-green-500 text-white shrink-0" title="WhatsApp Sipariş">
                            <i class="fa-brands fa-whatsapp text-2xl sm:text-4xl transform group-hover:scale-110 transition-transform"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Menü Kategorisi Detay Modalı -->
    <div id="menuModal" class="modal fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md px-4 z-50">
        <div class="modal-content bg-white rounded-[2rem] shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col relative border border-gray-100">
            <button onclick="closeModal('menuModal')" class="absolute top-5 right-5 w-10 h-10 flex items-center justify-center bg-white border border-gray-200 shadow-sm rounded-full text-gray-500 hover:text-brand-red hover:bg-red-50 transition-colors z-10">
                <i class="fa-solid fa-xmark text-xl"></i>
            </button>
            
            <div class="p-8 pb-4 border-b border-gray-100">
                <div class="inline-flex items-center gap-2 text-brand-red text-sm font-bold uppercase tracking-wider mb-2">
                    <i class="fa-solid fa-utensils"></i> Kategori
                </div>
                <h3 id="menuModalTitle" class="text-3xl font-serif font-bold text-gray-900">Kategori Adı</h3>
            </div>
            
            <div class="overflow-y-auto p-8 pt-4 custom-scrollbar flex-1" id="menuModalContent">
                <!-- İçerik JS ile buraya dolacak -->
            </div>
            
            <div class="p-6 border-t border-gray-100 bg-gray-50 rounded-b-[2rem] flex justify-between items-center">
                <span class="text-sm text-gray-500 font-medium hidden sm:block">Paket serviste fiyatlar değişebilir.</span>
                <button onclick="closeModal('menuModal'); openModal('orderModal');" class="bg-brand-red text-white px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg w-full sm:w-auto">
                    Sipariş Ver
                </button>
            </div>
        </div>
    </div>

    <!-- Ev Yapımı Harç Modalı -->
    <div id="evYapimiModal" class="modal fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-md px-4 z-50">
        <div class="modal-content bg-white rounded-3xl shadow-2xl max-w-sm w-full relative overflow-hidden">

            <div class="px-5 pt-5 pb-2 flex items-center justify-between">
                <div>
                    <h3 class="text-base font-black text-gray-900">İçli Pide Harç Oranları</h3>
                </div>
                <button onclick="closeModal('evYapimiModal')" class="w-8 h-8 flex items-center justify-center bg-gray-100 hover:bg-red-50 hover:text-brand-red rounded-full text-gray-500 transition-colors shrink-0">
                    <i class="fa-solid fa-xmark text-sm"></i>
                </button>
            </div>

            <!-- Malzemeler (Hesap Makinesi) -->
            <div class="px-5 py-4 space-y-2.5">

                <div class="bg-brand-red rounded-2xl shadow-[0_4px_14px_0_rgba(185,28,28,0.39)] px-4 py-3 flex items-center justify-between transition-all">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">🥩</span>
                        <span class="font-bold text-white text-sm">Kıyma (gram)</span>
                    </div>
                    <input type="number" id="kiymaInput" class="w-24 text-right bg-white text-brand-red font-bold rounded-full px-3 py-1 outline-none text-sm placeholder-red-300 shadow-inner" placeholder="1000" oninput="calculateIngredients()" min="0">
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">🍅</span>
                        <span class="font-bold text-gray-800 text-sm">Domates</span>
                    </div>
                    <span id="domatesOutput" class="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">Kıyma kadar</span>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">🧅</span>
                        <span class="font-bold text-gray-800 text-sm">Soğan</span>
                    </div>
                    <span id="soganOutput" class="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">Kıymanın yarısı</span>
                </div>

                <div class="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center justify-between">
                    <div class="flex items-center gap-3">
                        <span class="text-lg">🌿</span>
                        <span class="font-bold text-gray-800 text-sm">Maydanoz</span>
                    </div>
                    <span id="maydanozOutput" class="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">Orantılı</span>
                </div>

                <div class="text-[10px] text-gray-400 text-center pt-1 leading-relaxed">
                    <p>Yukarıya kıyma miktarını girerek tarifi hesaplayabilirsiniz.</p>
                    <p>Tüm malzemeleri robotta çekin. İsteğe bağlı biber eklenebilir.</p>
                </div>
            </div>

        </div>
    </div>



    <!-- Navbar -->
    <header class="fixed w-full top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16 sm:h-20">
                <!-- Logo -->
                <div class="flex-shrink-0 flex items-center">
                    <a href="#" class="text-2xl sm:text-4xl font-logo text-brand-red flex items-center gap-1.5 tracking-wide" style="text-shadow: -1px -1px 0 #fff, 1px -1px 0 #fff, -1px 1px 0 #fff, 1px 1px 0 #fff, 2px 2px 0 #000; letter-spacing: 1px;">
                         SB Aspava
                    </a>
                </div>
                
                <!-- Desktop Menu -->
                <div class="hidden md:flex items-center space-x-8">
                    <a href="#menu" class="text-gray-600 font-medium hover:text-brand-red transition-colors">Menü</a>
                    <a href="#yorumlar" class="text-gray-600 font-medium hover:text-brand-red transition-colors">Yorumlar</a>
                    <a href="#iletisim" class="text-gray-600 font-medium hover:text-brand-red transition-colors">İletişim</a>
                    <button onclick="openModal('orderModal')" class="bg-brand-red text-white px-6 py-2.5 rounded-full font-semibold hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/30 flex items-center gap-2">
                        <i class="fa-solid fa-motorcycle"></i> Sipariş Ver
                    </button>
                </div>

                <!-- Mobile Menu Button -->
                <div class="md:hidden flex items-center">
                    <button id="mobile-menu-btn" class="text-gray-600 hover:text-brand-red focus:outline-none p-2 text-2xl relative w-10 h-10 flex items-center justify-center">
                        <i id="burger-icon-bars" class="fa-solid fa-bars absolute transition-all duration-300 transform scale-100 opacity-100 rotate-0"></i>
                        <i id="burger-icon-x" class="fa-solid fa-xmark absolute transition-all duration-300 transform scale-0 opacity-0 -rotate-90"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Menu Panel -->
        <div id="mobile-menu" class="md:hidden bg-white border-gray-100" style="display: grid; grid-template-rows: 0fr; transition: grid-template-rows 0.4s cubic-bezier(0.4, 0, 0.2, 1), border-width 0.4s;">
            <div class="overflow-hidden">
                <div class="px-4 pt-2 pb-6 space-y-2">
                    <a href="#menu" class="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-red hover:bg-gray-50">Menü</a>
                    <a href="#yorumlar" class="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-red hover:bg-gray-50">Yorumlar</a>
                    <a href="#iletisim" class="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-brand-red hover:bg-gray-50">İletişim</a>
                    <button onclick="closeMobileMenu(); openModal('orderModal')" class="w-full mt-4 bg-brand-red text-white px-5 py-3 rounded-xl font-bold text-center flex justify-center items-center gap-2">
                        <i class="fa-solid fa-motorcycle"></i> Hemen Sipariş Ver
                    </button>
                </div>
            </div>
        </div>
    </header>

    <!-- Logo Banner (Hero yerine kompakt başlık) -->
    <div class="hero-bg pt-16 sm:pt-20 border-b-4 border-brand-gold">
        <div class="max-w-7xl mx-auto px-4 py-6 sm:py-10 text-center fade-in relative z-10">
            <a href="/" class="inline-flex flex-col items-center gap-1 hover:scale-105 transition-transform">
                <h1 class="text-5xl sm:text-7xl font-logo text-white drop-shadow-lg" style="text-shadow: 2px 2px 0 #7f1d1d, 4px 4px 0 #000; letter-spacing: 3px;">SB Aspava</h1>
                <h2 class="text-brand-gold font-black text-xs sm:text-sm uppercase tracking-widest mt-1">Odun Ateşinin Efsanesi &bull; Türkkonut, Ankara</h2>
            </a>
            <div class="flex justify-center gap-3 mt-4 sm:mt-5">
                <button onclick="openModal('orderModal')" class="lokanta-btn px-5 py-2 sm:px-7 sm:py-2.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-1.5">
                    <i class="fa-solid fa-motorcycle"></i> Sipariş Ver
                </button>
                <a href="tel:+903122393334" class="lokanta-btn-white px-5 py-2 sm:px-7 sm:py-2.5 rounded-full font-black text-xs sm:text-sm flex items-center gap-1.5">
                    <i class="fa-solid fa-phone"></i> Ara
                </a>
            </div>
        </div>
    </div>

    <!-- Ev Yapımı Harç Banner (silindi, menü içine taşındı) -->

    <!-- Menu Section -->
    <section id="menu" class="py-8 sm:py-16 bg-brand-light">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-7 sm:mb-10 fade-in">
                <h2 class="text-brand-red font-semibold tracking-wider uppercase text-xs sm:text-sm mb-1">Efsane Lezzetler</h2>
                <h3 class="text-xl sm:text-4xl font-serif font-bold text-gray-900">Menümüz</h3>
                <div class="w-12 sm:w-24 h-0.5 sm:h-1 bg-brand-red mx-auto mt-3 rounded-full"></div>
            </div>



            <!-- Menu Categories Grid: 2-col mobile, 3-col desktop -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-8 max-w-5xl mx-auto">
                <div onclick="openCategory('kahvalti')" class="lokanta-card p-5 sm:p-8 cursor-pointer fade-in group flex flex-col items-center text-center">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 bg-yellow-500 border-2 border-brand-red text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 transform group-hover:rotate-12 transition-transform shadow-[2px_2px_0_0_#b91c1c]">
                        <i class="fa-solid fa-mug-hot"></i>
                    </div>
                    <h4 class="text-sm sm:text-xl font-black text-gray-900 leading-tight">Patates & Çorba</h4>
                </div>

                <div onclick="openCategory('pideler')" class="lokanta-card p-5 sm:p-8 cursor-pointer fade-in group flex flex-col items-center text-center delay-100">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 bg-orange-400 border-2 border-brand-red text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 transform group-hover:-rotate-12 transition-transform shadow-[2px_2px_0_0_#b91c1c]">
                        <i class="fa-solid fa-fire-burner"></i>
                    </div>
                    <h4 class="text-sm sm:text-xl font-black text-gray-900 leading-tight">Pideler &amp; Lahmacun</h4>
                </div>

                <div onclick="openCategory('kebaplar')" class="lokanta-card p-5 sm:p-8 cursor-pointer fade-in group flex flex-col items-center text-center delay-200">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 bg-red-500 border-2 border-brand-red text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 transform group-hover:rotate-12 transition-transform shadow-[2px_2px_0_0_#b91c1c]">
                        <i class="fa-solid fa-utensils"></i>
                    </div>
                    <h4 class="text-sm sm:text-xl font-black text-gray-900 leading-tight">Kebaplar</h4>
                </div>

                <div onclick="openCategory('kiremitler')" class="lokanta-card p-5 sm:p-8 cursor-pointer fade-in group flex flex-col items-center text-center">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 bg-amber-600 border-2 border-brand-red text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 transform group-hover:-rotate-12 transition-transform shadow-[2px_2px_0_0_#b91c1c]">
                        <i class="fa-solid fa-bowl-food"></i>
                    </div>
                    <h4 class="text-sm sm:text-xl font-black text-gray-900 leading-tight">Kiremitler</h4>
                </div>

                <div onclick="openCategory('tatlilar')" class="lokanta-card p-5 sm:p-8 cursor-pointer fade-in group flex flex-col items-center text-center delay-100">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 bg-pink-400 border-2 border-brand-red text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 transform group-hover:rotate-12 transition-transform shadow-[2px_2px_0_0_#b91c1c]">
                        <i class="fa-solid fa-stroopwafel"></i>
                    </div>
                    <h4 class="text-sm sm:text-xl font-black text-gray-900 leading-tight">Tatlılar</h4>
                </div>

                <div onclick="openCategory('icecekler')" class="lokanta-card p-5 sm:p-8 cursor-pointer fade-in group flex flex-col items-center text-center delay-200">
                    <div class="w-14 h-14 sm:w-16 sm:h-16 bg-blue-400 border-2 border-brand-red text-white rounded-full flex items-center justify-center text-2xl sm:text-3xl mb-3 sm:mb-4 transform group-hover:-rotate-12 transition-transform shadow-[2px_2px_0_0_#b91c1c]">
                        <i class="fa-solid fa-bottle-water"></i>
                    </div>
                    <h4 class="text-sm sm:text-xl font-black text-gray-900 leading-tight">İçecekler</h4>
                </div>
            </div>

            <div class="mt-4 sm:mt-6 text-center fade-in">
                <button onclick="openModal('evYapimiModal')" class="inline-flex items-center justify-center gap-2 text-brand-red text-[11px] sm:text-xs font-bold border border-brand-red rounded-[2rem] px-5 py-2 hover:bg-brand-red hover:text-white transition-all group max-w-[95%] sm:max-w-full text-center">
                    <span class="leading-snug">
                        <span class="text-gray-900 group-hover:text-white transition-colors">Kendi harcınızla içli pide yaptırabilirsiniz</span><span class="hidden sm:inline text-gray-900 group-hover:text-white transition-colors"> — </span><span class="block sm:inline-block text-brand-red group-hover:text-white underline whitespace-nowrap mt-0.5 sm:mt-0 transition-colors">nasıl hazırlanır?</span>
                    </span>
                </button>
            </div>
            
            <div class="mt-6 sm:mt-10 text-center fade-in">
                <button onclick="openModal('orderModal')" class="inline-flex items-center gap-2 text-brand-red font-semibold hover:text-red-800 transition-colors bg-red-50 px-4 py-2.5 sm:px-8 sm:py-4 rounded-full border border-red-100 text-xs sm:text-lg shadow-sm hover:shadow-lg">
                    <i class="fa-solid fa-motorcycle"></i> Hemen Sipariş Oluştur
                </button>
            </div>
        </div>
    </section>

    <!-- Reviews Section -->
    <section id="yorumlar" class="py-10 sm:py-20 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <!-- Başlık + puan rozetleri -->
            <div class="mb-7 sm:mb-12 fade-in">
                <div class="text-center sm:hidden mb-4">
                    <h2 class="text-brand-red font-bold tracking-wider uppercase text-xs mb-1">Müşteri Yorumları</h2>
                    <h3 class="text-xl font-serif font-bold text-gray-900">Bizi Tercih Edenler</h3>
                </div>
                <!-- Mobil: yan yana küçük rozetler -->
                <div class="flex justify-center gap-3 sm:hidden">
                    <a href="https://www.yemeksepeti.com/restaurant/bdgl/sb-aspava" target="_blank" rel="noopener noreferrer" class="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                        <i class="fa-solid fa-motorcycle text-brand-red text-sm"></i>
                        <div>
                            <div class="text-[9px] text-gray-400 font-bold uppercase">Yemeksepeti</div>
                            <div class="flex items-center gap-0.5">
                                <span class="font-black text-brand-red text-sm">4.9</span>
                                <i class="fa-solid fa-star text-brand-gold text-[10px]"></i>
                                <span class="text-[9px] text-gray-400">(4000+)</span>
                            </div>
                        </div>
                    </a>
                    <a href="#" class="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 shadow-sm">
                        <i class="fa-solid fa-bag-shopping text-orange-500 text-sm"></i>
                        <div>
                            <div class="text-[9px] text-gray-400 font-bold uppercase">Trendyol</div>
                            <div class="flex items-center gap-0.5">
                                <span class="font-black text-orange-500 text-sm">4.9</span>
                                <i class="fa-solid fa-star text-brand-gold text-[10px]"></i>
                            </div>
                        </div>
                    </a>
                </div>
                <!-- Desktop: eski büyük görünüm -->
                <div class="hidden sm:flex flex-col lg:flex-row justify-between items-center gap-6">
                    <div class="text-center lg:text-left">
                        <h2 class="text-brand-red font-bold tracking-wider uppercase text-sm mb-2">Müşteri Yorumları</h2>
                        <h3 class="text-4xl font-serif font-bold text-gray-900">Bizi Tercih Edenler</h3>
                    </div>
                    <div class="flex flex-wrap justify-center gap-4">
                        <a href="https://www.yemeksepeti.com/restaurant/bdgl/sb-aspava" target="_blank" rel="noopener noreferrer" class="lokanta-card px-5 py-3 flex items-center gap-3 bg-white">
                            <div class="w-12 h-12 bg-brand-red border-2 border-brand-red rounded-full flex items-center justify-center text-white text-xl shadow-[2px_2px_0_0_#f59e0b]"><i class="fa-solid fa-motorcycle"></i></div>
                            <div>
                                <div class="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-0.5">Yemeksepeti</div>
                                <div class="flex items-center gap-1"><span class="font-black text-brand-red text-xl">4.9</span><i class="fa-solid fa-star text-brand-gold text-sm"></i><span class="text-[11px] font-bold text-gray-400 ml-1">(4000+)</span></div>
                            </div>
                        </a>
                        <a href="#" class="lokanta-card px-5 py-3 flex items-center gap-3 bg-white">
                            <div class="w-12 h-12 bg-orange-500 border-2 border-orange-600 rounded-full flex items-center justify-center text-white text-xl shadow-[2px_2px_0_0_#f59e0b]"><i class="fa-solid fa-bag-shopping"></i></div>
                            <div>
                                <div class="text-[10px] text-gray-500 font-black uppercase tracking-wider mb-0.5">Trendyol Yemek</div>
                                <div class="flex items-center gap-1"><span class="font-black text-orange-600 text-xl">4.9</span><i class="fa-solid fa-star text-brand-gold text-sm"></i></div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            <div id="reviews-container" class="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            </div>
            
            <div class="mt-6 sm:mt-10 flex flex-wrap justify-center gap-3 sm:gap-4 fade-in">
                <a href="https://maps.app.goo.gl/YzQv6fKe3im39z9A9" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1.5 bg-blue-50 text-blue-600 px-4 py-2 sm:px-6 sm:py-3 rounded-full font-bold hover:bg-blue-100 transition-colors border border-blue-200 text-xs sm:text-base">
                    <i class="fa-brands fa-google"></i> Google'da Değerlendirin
                </a>
                <button onclick="renderRandomReviews()" aria-label="Yorumları Karıştır" title="Yorumları Karıştır" class="flex items-center justify-center bg-gray-50 text-gray-700 w-[38px] h-[38px] sm:w-[46px] sm:h-[46px] rounded-full hover:bg-gray-100 transition-all border border-gray-200 shadow-sm active:scale-95 group">
                    <i class="fa-solid fa-arrows-rotate text-sm sm:text-base group-hover:rotate-180 transition-transform duration-500"></i>
                </button>
            </div>
        </div>
    </section>

    <!-- Contact & Map Section -->
    <section id="iletisim" class="py-10 sm:py-20 bg-stone-100">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            <div class="text-center mb-6 sm:mb-14 fade-in">
                <h2 class="text-brand-red font-semibold tracking-wider uppercase text-xs sm:text-sm mb-1">Bize Ulaşın</h2>
                <h3 class="text-xl sm:text-4xl font-serif font-bold text-gray-900">İletişim &amp; Konum</h3>
                <div class="w-12 sm:w-24 h-0.5 sm:h-1 bg-brand-red mx-auto mt-3 sm:mt-6 rounded-full"></div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-10 items-stretch">
                <!-- Sol: Bilgiler -->
                <div class="flex flex-col gap-3 sm:gap-5 fade-in">

                    <a href="https://maps.app.goo.gl/YzQv6fKe3im39z9A9" target="_blank" rel="noopener noreferrer" class="lokanta-card p-3.5 sm:p-6 flex items-center sm:items-start gap-3 sm:gap-4 group cursor-pointer block">
                        <div class="flex items-center sm:items-start gap-3 sm:gap-4 flex-1">
                            <div class="w-9 h-9 sm:w-12 sm:h-12 bg-brand-red rounded-full flex items-center justify-center text-white text-base sm:text-xl flex-shrink-0 shadow-[2px_2px_0_0_#f59e0b] group-hover:scale-110 transition-transform">
                                <i class="fa-solid fa-location-dot"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-black text-gray-900 text-sm sm:text-lg mb-0.5 sm:mb-1 group-hover:text-brand-red transition-colors">Adresimiz</h4>
                                <p class="text-gray-500 text-xs sm:text-base sm:font-medium leading-snug">Dodurga Mah. Odabaşı Cad. No:13<br><span class="hidden sm:inline">Özseçkinköy Sit. </span>(Bildirici Market Karşısı)<br>Türkkonut / Çankaya, ANKARA</p>
                            </div>
                        </div>
                        <div class="flex items-center h-full self-center sm:self-auto sm:pt-2">
                            <i class="fa-solid fa-arrow-right text-gray-300 group-hover:text-brand-red transition-colors text-lg sm:text-xl"></i>
                        </div>
                    </a>

                    <div class="lokanta-card p-3.5 sm:p-6 flex items-center sm:items-start gap-3 sm:gap-4">
                        <div class="w-9 h-9 sm:w-12 sm:h-12 bg-brand-red rounded-full flex items-center justify-center text-white text-base sm:text-xl flex-shrink-0 shadow-[2px_2px_0_0_#f59e0b]">
                            <i class="fa-solid fa-phone"></i>
                        </div>
                        <div>
                            <h4 class="font-black text-gray-900 text-sm sm:text-lg mb-0.5 sm:mb-1">Alo Paket</h4>
                            <a href="tel:+903122393334" class="text-gray-500 text-xs sm:text-base font-bold hover:text-brand-red transition-colors block">0312 239 33 34</a>
                            <a href="tel:+905531587333" class="text-gray-500 text-xs sm:text-base font-bold hover:text-brand-red transition-colors block">0553 158 73 33</a>
                        </div>
                    </div>

                    <div class="lokanta-card p-3.5 sm:p-6 flex items-center sm:items-start gap-3 sm:gap-4">
                        <div class="w-9 h-9 sm:w-12 sm:h-12 bg-brand-red rounded-full flex items-center justify-center text-white text-base sm:text-xl flex-shrink-0 shadow-[2px_2px_0_0_#f59e0b]">
                            <i class="fa-solid fa-clock"></i>
                        </div>
                        <div>
                            <h4 class="font-black text-gray-900 text-sm sm:text-lg mb-0.5 sm:mb-1">Çalışma Saatleri</h4>
                            <p class="text-gray-500 text-xs sm:text-base sm:font-medium">Hft. içi &amp; Cmt: 09:00 – 20:30</p>
                            <p class="text-brand-red font-bold text-xs sm:text-base">Pazar Kapalı.</p>
                        </div>
                    </div>

                    <a href="https://instagram.com/sbaspava" target="_blank" rel="noopener noreferrer" class="lokanta-card p-3.5 sm:p-6 flex items-center sm:items-start gap-3 sm:gap-4 group cursor-pointer block">
                        <div class="flex items-center sm:items-start gap-3 sm:gap-4 flex-1">
                            <div class="w-9 h-9 sm:w-12 sm:h-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-base sm:text-xl flex-shrink-0 shadow-[2px_2px_0_0_#f59e0b] group-hover:scale-110 transition-transform">
                                <i class="fa-brands fa-instagram"></i>
                            </div>
                            <div class="flex-1">
                                <h4 class="font-black text-gray-900 text-sm sm:text-lg mb-0.5 sm:mb-1 group-hover:text-pink-600 transition-colors">Bizi Takip Edin</h4>
                                <p class="text-gray-500 text-xs sm:text-base font-bold leading-snug">@sbaspava</p>
                            </div>
                        </div>
                        <div class="flex items-center h-full self-center sm:self-auto sm:pt-2">
                            <i class="fa-solid fa-arrow-right text-gray-300 group-hover:text-pink-600 transition-colors text-lg sm:text-xl"></i>
                        </div>
                    </a>

                    <button onclick="openModal('orderModal')" class="lokanta-btn w-full py-3 sm:py-4 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg flex items-center justify-center gap-2 mt-auto">
                        <i class="fa-solid fa-motorcycle"></i> Hemen Sipariş Ver
                    </button>
                </div>

                <!-- Sağ: Harita -->
                <div class="h-52 sm:h-80 md:h-full sm:min-h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-brand-red shadow-[4px_4px_0_0_#f59e0b] sm:shadow-[8px_8px_0_0_#f59e0b] fade-in delay-200">
                    <iframe src="https://maps.google.com/maps?q=Sb+Aspava,+Dodurga,+Odaba%C5%9F%C4%B1+Cd.+No:13,+06810+%C3%87ankaya/Ankara&t=&z=16&ie=UTF8&iwloc=&output=embed" width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
                </div>
            </div>
        </div>
    </section>



    <!-- Interactive Scripts -->
    
`}} />
  );
}
