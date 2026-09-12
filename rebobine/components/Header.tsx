'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="bg-surface/95 backdrop-blur text-white shadow-medium sticky top-0 z-50 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-display font-bold text-xl">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              🎬
            </div>
            <span>Rebobine</span>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex gap-8 font-body">
            <Link href="/catalogo" className="hover:text-primary transition-colors">
              Catálogo
            </Link>
            {isAdmin && (
              <>
                <Link href="/admin/clientes" className="hover:text-primary transition-colors">
                  Clientes
                </Link>
                <Link href="/admin/locacoes" className="hover:text-primary transition-colors">
                  Locações
                </Link>
                <Link href="/admin/painel" className="hover:text-primary transition-colors">
                  Painel
                </Link>
              </>
            )}
            <Link href="/login" className="hover:text-primary transition-colors">
              Login
            </Link>
          </nav>

          {/* Menu Mobile */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden p-2 hover:bg-surface-raised rounded-md transition-colors"
          >
            ☰
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        {menuAberto && (
          <nav className="md:hidden pb-4 space-y-2 font-body">
            <Link
              href="/catalogo"
              className="block py-2 px-3 hover:bg-surface-raised rounded-md transition-colors"
              onClick={() => setMenuAberto(false)}
            >
              Catálogo
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/clientes"
                  className="block py-2 px-3 hover:bg-surface-raised rounded-md transition-colors"
                  onClick={() => setMenuAberto(false)}
                >
                  Clientes
                </Link>
                <Link
                  href="/admin/locacoes"
                  className="block py-2 px-3 hover:bg-surface-raised rounded-md transition-colors"
                  onClick={() => setMenuAberto(false)}
                >
                  Locações
                </Link>
              </>
            )}
            <Link
              href="/login"
              className="block py-2 px-3 hover:bg-surface-raised rounded-md transition-colors"
              onClick={() => setMenuAberto(false)}
            >
              Login
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
