import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
        <h1 className="text-7xl sm:text-9xl font-black text-brand-red mb-2 drop-shadow-sm">404</h1>
        <p className="text-xl sm:text-2xl text-gray-600 font-medium mb-8">Üzgünüz, aradığınız efsane lezzete ulaşamadık.</p>
        <Link href="/" className="bg-brand-gold text-white px-8 py-4 rounded-full font-bold text-lg border-2 border-brand-red shadow-[3px_3px_0px_0px_#b91c1c] hover:-translate-y-1 hover:shadow-[5px_5px_0px_0px_#b91c1c] transition-all">
            Ana Sayfaya Dön
        </Link>
    </div>
  );
}
