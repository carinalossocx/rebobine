'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para catálogo (públco) ou admin conforme necessário
    const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin');
    if (isAdmin) {
      router.push('/admin/painel');
    } else {
      router.push('/catalogo');
    }
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg">
      <div className="text-center">
        <div className="animate-spin text-6xl mb-4">🎬</div>
        <h1 className="text-5xl font-display font-bold text-white mb-4">Rebobine</h1>
        <p className="text-xl font-body text-white/60">Carregando...</p>
      </div>
    </main>
  );
}
