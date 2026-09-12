import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Rebobine - Sistema de Locadora de Filmes',
  description: 'Gerenciamento de acervo, locações e reservas',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
