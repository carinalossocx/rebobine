'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header({ isAdmin = false }: { isAdmin?: boolean }) {
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <header className="bg-surface shadow-medium sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 font-display font-bold text-2xl text-text-primary hover:text-primary transition-colors">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white text-lg">
              🎬
            </div>
            <span>Rebobine</span>
          </Link>

          {/* Nav Desktop */}
          <nav className="hidden md:flex gap-8 font-body text-body-md">
            <Link href="/catalogo" className="text-text-primary hover:text-primary font-medium transition-colors">
              Catálogo
            </Link>
            {isAdmin && (
              <>
                <Link href="/admin/clientes" className="text-text-primary hover:text-primary font-medium transition-colors">
                  Clientes
                </Link>
                <Link href="/admin/locacoes" className="text-text-primary hover:text-primary font-medium transition-colors">
                  Locações
                </Link>
                <Link href="/admin/painel" className="text-text-primary hover:text-primary font-medium transition-colors">
                  Painel
                </Link>
              </>
            )}
            <Link href="/login" className="px-6 py-2 bg-primary text-white rounded-full font-body font-bold text-sm hover:bg-primary-hover transition-colors">
              Login
            </Link>
          </nav>

          {/* Menu Mobile */}
          <button
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden p-2 hover:bg-surface-light text-text-primary rounded-md transition-colors"
          >
            ☰
          </button>
        </div>

        {/* Menu Mobile Dropdown */}
        {menuAberto && (
          <nav className="md:hidden pb-4 space-y-2 font-body border-t border-border">
            <Link
              href="/catalogo"
              className="block py-3 px-3 text-text-primary hover:bg-surface-light rounded-md transition-colors"
              onClick={() => setMenuAberto(false)}
            >
              Catálogo
            </Link>
            {isAdmin && (
              <>
                <Link
                  href="/admin/clientes"
                  className="block py-3 px-3 text-text-primary hover:bg-surface-light rounded-md transition-colors"
                  onClick={() => setMenuAberto(false)}
                >
                  Clientes
                </Link>
                <Link
                  href="/admin/locacoes"
                  className="block py-3 px-3 text-text-primary hover:bg-surface-light rounded-md transition-colors"
                  onClick={() => setMenuAberto(false)}
                >
                  Locações
                </Link>
              </>
            )}
            <Link
              href="/login"
              className="block py-3 px-3 text-text-primary hover:bg-surface-light rounded-md transition-colors"
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
