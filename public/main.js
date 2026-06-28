
        // --- 1. MENÜ VERİLERİ VE KATEGORİ MODAL MANTIĞI ---
        const menuData = {
            kahvalti: {
                title: "Patates ve Çorba",
                items: [
                    { name: "Mercimek Çorbası", desc: "Sıcacık, tam kıvamında süzme mercimek çorbası." },
                    { name: "Patates Kızartması", desc: "Özenle dilimlenmiş çıtır patates kızartması." }
                ]
            },
            pideler: {
                title: "Pideler & Lahmacun",
                items: [
                    { name: "Beyaz Peynirli Pide", desc: "Taş fırında özenle pişmiş taze pide." },
                    { name: "Mantarlı Pide", desc: "Taze mantarlı özel harç." },
                    { name: "Sucuklu Pide", desc: "Bol sucuklu odun ateşi lezzeti." },
                    { name: "Kıymalı Pide", desc: "Özel baharatlarla harmanlanmış kıymalı pide." },
                    { name: "Kıymalı Yumurtalı", desc: "Kıymalı pidenin yumurta ile efsane buluşması." },
                    { name: "Kıymalı Kaşarlı", desc: "Eriyen kaşar ile lezzetlenen kıymalı pide." },
                    { name: "Kuşbaşılı Pide", desc: "Özenle seçilmiş etlerden kuşbaşılı pide." },
                    { name: "Kuşbaşılı Kaşarlı", desc: "Bol kaşarlı ve kuşbaşılı spesiyal." },
                    { name: "Kuşbaşılı Yumurtalı", desc: "Yumurtalı zengin kuşbaşılı pide." },
                    { name: "Kaşarlı Pide", desc: "Odun ateşinde kızarmış bol kaşarlı pide." },
                    { name: "Karışık Pide", desc: "Tüm lezzetlerin bir arada olduğu zengin pide." },
                    { name: "Tavuklu Pide", desc: "Özel soslu tavuk etiyle hazırlanan pide." },
                    { name: "Kapalı Karadeniz", desc: "Karadeniz usulü kapalı pide lezzeti." },
                    { name: "Kapalı Kaşarlı", desc: "İçi bol kaşar dolu çıtır kapalı pide." },
                    { name: "Lahmacun Acısız", desc: "İnce hamur, bol malzeme, taş fırın lezzeti." },
                    { name: "Lahmacun Acılı", desc: "Acı sevenler için özel harçlı lahmacun." },
                    { name: "Antep Lahmacun", desc: "Sarımsaklı ve bol malzemeli yöresel lezzet." },
                    { name: "Peymacun", desc: "Peynirli lahmacun." }
                ]
            },
            kebaplar: {
                title: "Kebaplar & Dürümler",
                items: [
                    { name: "Adana Kebap", desc: "Zırh kıymasıyla hazırlanan acılı klasik." },
                    { name: "Adana Dürüm", desc: "Özel lavaşta acılı Adana dürüm." },
                    { name: "Urfa Kebap", desc: "Acısız, tam kıvamında ızgara kebabı." },
                    { name: "Urfa Dürüm", desc: "Özel lavaşta acısız Urfa dürüm." },
                    { name: "Beyti Kebap (Soslu)", desc: "Özel sos ve tereyağı eşliğinde beyti." },
                    { name: "Tavuk Şiş", desc: "Özel terbiye edilmiş tavuk göğsü." },
                    { name: "Tavuk Kanat", desc: "Izgarada nar gibi kızarmış tavuk kanat." },
                    { name: "Karışık Izgara", desc: "Tüm ızgara lezzetlerini tatmak isteyenlere." },
                    { name: "Yoğurtlu Kebap", desc: "Yoğurt, sos ve tereyağı ile lezzetlendirilmiş." },
                    { name: "Sac Kavurma", desc: "Sıcak sacda lokum gibi kavurma." },
                    { name: "Et Şiş", desc: "Terbiyeli dana etinden yumuşacık şiş." }
                ]
            },
            kiremitler: {
                title: "Kiremit Lezzetleri",
                items: [
                    { name: "Kiremitte Kuşbaşı", desc: "Sebzelerle birlikte kiremitte fırınlanmış et." },
                    { name: "Kiremitte Tavuk", desc: "Özel soslu tavuk parçalarının kiremit lezzeti." }
                ]
            },
            tatlilar: {
                title: "Tatlılar",
                items: [
                    { name: "Künefe", desc: "Özel peyniri ve kıvamında şerbetiyle sıcak künefe." },
                ]
            },
            icecekler: {
                title: "İçecekler",
                items: [
                    { name: "Coca Cola / Coca Cola Zero", desc: "Kutu" },
                    { name: "Fanta", desc: "Kutu" },
                    { name: "Fuse Tea", desc: "Kutu" },
                    { name: "Ayran (Büyük Boy)", desc: "Soğuk ve köpüklü" },
                    { name: "Sprite / Soda / Su / Şalgam", desc: "Soğuk İçecekler" },
                    { name: "Çay", desc: "Taze demlenmiş" },
                    { name: "1 Lt. Ayran", desc: "Büyük Boy" },
                    { name: "1 Lt. Coca Cola / Zero / Fanta", desc: "Aile Boyu" },
                    { name: "2.5 Lt. Coca Cola / Fanta", desc: "Ekstra Büyük Boy" }
                ]
            }
        };

        function openCategory(categoryId) {
            const data = menuData[categoryId];
            if(!data) return;

            document.getElementById('menuModalTitle').innerText = data.title;
            
            const contentDiv = document.getElementById('menuModalContent');
            let html = '<div class="space-y-5">';
            
            data.items.forEach(item => {
                const descHtml = item.desc ? `<p class="text-sm text-gray-500 mt-1">${item.desc}</p>` : '';
                html += `
                    <div class="flex justify-between items-start border-b border-gray-100 pb-4 last:border-0 last:pb-0 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                        <div>
                            <h5 class="font-bold text-gray-900 text-lg font-serif">${item.name}</h5>
                            ${descHtml}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            contentDiv.innerHTML = html;

            openModal('menuModal');
        }

        // --- 2. ÇOKLU MODAL YÖNETİM SİSTEMİ ---
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            if(modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden'; 
            }
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if(modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto'; 
            }
        }

        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });

        // --- 3. GOOGLE YORUMLARI RANDOMİZE HAVUZU ---
        // Google Haritalar üzerinden çekilmiş gerçek yorumlar
        const realReviews = [
            { initial: "M", color: "bg-yellow-100 text-yellow-600", name: "Milo Y.", source: "Google Haritalar", text: "Ben küçüklüğümden beri gidiyorum, çok iyi bir yer, lahmacunu mükemmel, kesinlikle öneririm. Eğer Türkkonut'ta yaşıyorsanız gitmeniz gerek, yaşamıyorsanız ama orda uğrasanız bile gidin." },
            { initial: "S", color: "bg-blue-100 text-blue-600", name: "Superstar C.", source: "Google Haritalar", text: "Dört dörtlük olağanüstü lezzet, memnun kaldık. Başarılı. Çayyolu'nun en iyi Aspavası burası. Yeri Çayyolu Dodurga'da. Kaliteli güler yüzlü hizmet için sonsuz teşekkürler." },
            { initial: "V", color: "bg-green-100 text-green-600", name: "Veli K.", source: "Google Haritalar", text: "Bugüne kadar yediğimiz en kaliteli pide ve hizmet, memnuniyetim en üst 5 yıldız ve üzeri. Aile şirketi, süper bir hizmet. Teşekkürler, emeğinize sağlık olsun inşallah. Sağlıcakla." },
            { initial: "A", color: "bg-purple-100 text-purple-600", name: "A. Kadir A.", source: "Google Haritalar", text: "Bir pide en çıtır en güzel şekilde nasıl hazırlanır, nasıl sunulur ve nasıl yenirse burada tecrübe edebilirsiniz. 2016'dan beri Türkkonut'ta yaptıkları işin hakkını fazlasıyla veriyorlar. Emeği geçenlerin emeğine sağlık, hayırlı işler bol kazançlar dilerim." },
            { initial: "S", color: "bg-pink-100 text-pink-600", name: "Sezen O.", source: "Google Haritalar", text: "Kuşbaşılı pidesini Ankara'da tek geçerim. Hamuru eti çok lezzetli, malzemeden çalmıyorlar, taş fırında piştiği için ayrıca mükemmel. Çalışanlar çok ilgili, saygılı ve kibarlar." },
            { initial: "R", color: "bg-red-100 text-red-600", name: "Reyhan Y.", source: "Google Haritalar", text: "Pideleri denemeniz lazım. Lahmacun süper. Etli pide harika. Sıcak, güler yüzlü hizmet. Fiyatlar uygun. Temiz ve lezzetli. Evde hazırlayacağınız pide içini hazırlayıp yaptırabilirsiniz." },
            { initial: "M", color: "bg-teal-100 text-teal-600", name: "Musa U.", source: "Google Haritalar", text: "Yemekler gayet lezzetli. Özellikle lahmacun çok başarılı. Türkkonut civarında oturuyorsanız paketler de oldukça hızlı, sıcak ve dağılmamış bir şekilde geliyor." },
            { initial: "B", color: "bg-orange-100 text-orange-600", name: "BJK K.", source: "Google Haritalar", text: "3 defa iç hazırlayıp pide ve lahmacun yaptırdık ve gayet memnun kaldık. Rahatlıkla alışveriş yapılacak bir işletme..." },
            { initial: "H", color: "bg-indigo-100 text-indigo-600", name: "Hasan A.", source: "Google Haritalar", text: "Güler yüzlü, temiz, kaliteli ve en önemlisi lezzetli ve doyurucu porsiyon yemekleri için teşekkür ederim, bol kazançlar dilerim." },
            { initial: "K", color: "bg-lime-100 text-lime-600", name: "Kuddusi D.", source: "Google Haritalar", text: "Lezzetin üstüne lezzet tanımam, on numara kebap ve pideleri var. Çok güzel yapıyorlar! 🙏" },
            { initial: "İ", color: "bg-cyan-100 text-cyan-600", name: "İbrahim F.", source: "Google Haritalar", text: "Yıllardır değişmeyen lezzet, teşekkürler. Yemeklerimiz çok güzeldi, ellerinize sağlık." },
            { initial: "Ü", color: "bg-violet-100 text-violet-600", name: "Ümit D.", source: "Google Haritalar", text: "Lahmacun ve pidesi enfesti, personel güler yüzlü, hoş bir karşılama ile karşılaştım." },
            { initial: "M", color: "bg-rose-100 text-rose-600", name: "Mehmet Akif B.", source: "Google Haritalar", text: "Odun ateşini lezzetle noktalayan ustalarımıza çok teşekkür ederim. Tavsiye ederim. Sağ olsunlar." },
            { initial: "A", color: "bg-amber-100 text-amber-600", name: "Arda K.", source: "Google Haritalar", text: "Aspavaların en iyisi, en mütevazisi ve en lezzetlisi. Mutlaka öneririm." },
            { initial: "E", color: "bg-emerald-100 text-emerald-600", name: "Enes Saraçoğlu", source: "Google Haritalar", text: "Türkkonut'un tek yemek adresi, gerçekten çok lezzetli." },
            { initial: "E", color: "bg-emerald-100 text-emerald-600", name: "Ekrem Alıcı", source: "Google Haritalar", text: "SB Aspavanın tek adresi." },
            { initial: "D", color: "bg-blue-100 text-blue-600", name: "Dilşad Y.", source: "Google Haritalar", text: "Kuşbaşı kaşarlı pidesi ve adanası mükemmel. Hızlı paket servisi var. Temiz bir işletme. Paket servis için tercih edilebilir." },
            { initial: "E", color: "bg-indigo-100 text-indigo-600", name: "Emre Y.", source: "Google Haritalar", text: "Genelde paket servis tercih ediyorum. Kısa sürede geliyor. Lahmacun tavsiye ederim." },
            { initial: "Ö", color: "bg-yellow-100 text-yellow-600", name: "Ömer O.", source: "Google Haritalar", text: "Temiz lezzetli. Mütevazı bir mekân. Çalışanlar kibar ve güleryüzlü." },
            { initial: "H", color: "bg-orange-100 text-orange-600", name: "Hakan C.", source: "Google Haritalar", text: "Çok lezzetli yemekleri var, uygun fiyatlı bir yer." },
            { initial: "N", color: "bg-green-100 text-green-600", name: "Nail B.", source: "Google Haritalar", text: "Antep lahmacun ve kuşbaşılı kaşarlı pidesi denemeye değer." },
            { initial: "K", color: "bg-purple-100 text-purple-600", name: "Kaan S.", source: "Google Haritalar", text: "Servis hızlı, ikramlar güzel, yemekler leziz." },
            { initial: "B", color: "bg-pink-100 text-pink-600", name: "Bedi D.", source: "Google Haritalar", text: "Temiz ve lezzetli... Kesinlikle tavsiye ederim." },
            { initial: "O", color: "bg-cyan-100 text-cyan-600", name: "Ozan A.", source: "Google Haritalar", text: "Kaliteli, temiz ve hızlı." },
            { initial: "K", color: "bg-emerald-100 text-emerald-600", name: "Karavan T.", source: "Google Haritalar", text: "Türkkonut'ta aç olunca yemek yenebilecek tam bir aile işletmesi. Güzel, temiz ve her şey olan bir yer, tavsiye ederim." },
            { initial: "H", color: "bg-rose-100 text-rose-600", name: "HiraNur S.", source: "Google Haritalar", text: "Çok güzel bir mekan gitmenizi tavsiye ediyorum, pide ve lahmacunları çok güzel ellerine sağlık." }
        ];

        function renderRandomReviews() {
            // Belirtilen kişilerin yorumlarının daha nadir çıkması için filtreleme (%15 şans)
            const filteredReviews = realReviews.filter(r => {
                if (r.name === "Ekrem Alıcı" || r.name === "Enes Saraçoğlu") {
                    return Math.random() < 0.15;
                }
                return true;
            });

            const shuffled = [...filteredReviews].sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 3);
            
            const container = document.getElementById('reviews-container');
            if(!container) return;
            
            const html = selected.map((review, index) => {
                const isEasterEgg = review.name === "Ekrem Alıcı" || review.name === "Enes Saraçoğlu";
                const starCount = isEasterEgg ? 20 : 5;
                const starsHtml = Array(starCount).fill('<i class="fa-solid fa-star"></i>').join('');
                const starsClass = isEasterEgg ? "flex flex-wrap text-brand-gold text-[10px] sm:text-xs mb-3 gap-0.5" : "flex text-brand-gold text-sm mb-3 gap-0.5";

                return `
                <div class="lokanta-card p-6 flex flex-col h-full bg-white fade-in" style="transition-delay: ${index * 100}ms">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-12 h-12 rounded-full border-2 border-brand-red flex items-center justify-center text-xl font-black ${review.color} shadow-[2px_2px_0_0_#b91c1c]">${review.initial}</div>
                        <div>
                            <div class="font-black text-gray-900">${review.name}</div>
                            <div class="text-[10px] font-bold text-gray-500 uppercase tracking-wide">${review.source}</div>
                        </div>
                    </div>
                    <div class="${starsClass}">
                        ${starsHtml}
                    </div>
                    <p class="text-gray-700 text-sm font-medium leading-relaxed">${review.text}</p>
                </div>
                `;
            }).join('');
            container.innerHTML = html;
            
            // Animasyonu tetiklemek için ufak bir bekleme ve ardından class ekleme
            setTimeout(() => {
                const cards = container.querySelectorAll('.lokanta-card');
                cards.forEach(card => card.classList.add('visible'));
            }, 50);
        }

        // --- 4. MOBİL MENÜ ---
        const btn = document.getElementById('mobile-menu-btn');
        const menu = document.getElementById('mobile-menu');
        const iconBars = document.getElementById('burger-icon-bars');
        const iconX = document.getElementById('burger-icon-x');
        
        function toggleMobileMenu() {
            const isOpen = menu.classList.contains('open');
            if (isOpen) {
                // Kapat
                menu.classList.remove('open', 'border-t');
                menu.style.gridTemplateRows = '0fr';
                
                iconX.classList.remove('scale-100', 'opacity-100', 'rotate-0');
                iconX.classList.add('scale-0', 'opacity-0', '-rotate-90');
                
                iconBars.classList.remove('scale-0', 'opacity-0', 'rotate-90');
                iconBars.classList.add('scale-100', 'opacity-100', 'rotate-0');
            } else {
                // Aç
                menu.classList.add('open', 'border-t');
                menu.style.gridTemplateRows = '1fr';
                
                iconBars.classList.remove('scale-100', 'opacity-100', 'rotate-0');
                iconBars.classList.add('scale-0', 'opacity-0', 'rotate-90');
                
                iconX.classList.remove('scale-0', 'opacity-0', '-rotate-90');
                iconX.classList.add('scale-100', 'opacity-100', 'rotate-0');
            }
        }
        
        function closeMobileMenu() {
            if (menu && menu.classList.contains('open')) {
                toggleMobileMenu();
            }
        }

        if (btn && menu) {
            btn.addEventListener('click', toggleMobileMenu);
        }

        // Linklere tıklandığında menüyü kapat
        if (menu) {
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });
        }

        // --- 5. GÖRÜNÜRLÜK (FADE-IN) ANİMASYONU ---
        function setupIntersectionObserver() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
        }
        // --- 6. HESAP MAKİNESİ (HARÇ) ---
        function calculateIngredients() {
            const kiymaVal = document.getElementById('kiymaInput').value;
            const domatesOutput = document.getElementById('domatesOutput');
            const soganOutput = document.getElementById('soganOutput');
            const maydanozOutput = document.getElementById('maydanozOutput');
            
            if (kiymaVal && kiymaVal > 0) {
                const kiyma = parseInt(kiymaVal);
                domatesOutput.innerText = kiyma + " gram";
                soganOutput.innerText = (kiyma / 2) + " gram";
                
                let bag = parseFloat((kiyma / 5000).toFixed(2));
                maydanozOutput.innerText = bag + " bağ";
            } else {
                domatesOutput.innerText = "Kıyma kadar";
                soganOutput.innerText = "Kıymanın yarısı";
                maydanozOutput.innerText = "Orantılı";
            }
        }

        document.addEventListener('DOMContentLoaded', () => {
            renderRandomReviews();
            setupIntersectionObserver();
        });
    