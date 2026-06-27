
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>SB Aspava | Efsane Lezzetler</title>
        <meta name="description" content="Ankara Türkkonut'ta odun ateşinde efsane lezzetler. SB Aspava ile nefis kebaplar, pideler ve lahmacunlar için hemen sipariş verin." />
        <meta name="keywords" content="SB Aspava, Aspava, Ankara Aspava, Türkkonut Aspava, Ankara kebap, Ankara pide, lahmacun, odun ateşi, yemek siparişi, yemeksepeti, trendyol, ubereats, menu, menü" />
        <meta name="author" content="SB Aspava" />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="SB Aspava | Efsane Lezzetler" />
        <meta property="og:description" content="Ankara Türkkonut'ta odun ateşinde efsane lezzetler. SB Aspava ile nefis kebaplar, pideler ve lahmacunlar için hemen sipariş verin." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://sbaspava.com" />
        <meta property="og:image" content="/favicon.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="SB Aspava | Efsane Lezzetler" />
        <meta name="twitter:description" content="Ankara Türkkonut'ta odun ateşinde efsane lezzetler. SB Aspava ile nefis kebaplar, pideler ve lahmacunlar için hemen sipariş verin." />
        <link rel="canonical" href="https://sbaspava.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
        
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{__html: `
          tailwind.config = {
              theme: {
                  extend: {
                      colors: {
                          brand: {
                              red: '#b91c1c',
                              light: '#fffbf0',
                              gold: '#f59e0b',
                              dark: '#7f1d1d'
                          }
                      },
                      fontFamily: {
                          sans: ['Overpass', 'sans-serif'],
                          serif: ['Overpass', 'sans-serif'],
                          logo: ['Chewy', 'cursive'],
                      }
                  }
              }
          }
        `}} />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Overpass:ital,wght@0,400;0,600;0,700;0,800;0,900;1,400&family=Chewy&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/global.css" />
      </head>
      <body className="font-sans bg-brand-light text-gray-800 antialiased selection:bg-brand-red selection:text-white">
        {children}
        <script src="/main.js"></script>
      </body>
    </html>
  );
}
