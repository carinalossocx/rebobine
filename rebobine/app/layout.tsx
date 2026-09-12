import type { Metadata } from 'next';
import { Poppins, Nunito, Space_Mono } from 'next/font/google';
import './globals.css';
import ThemeScript from './theme-script';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-nunito',
  display: 'swap',
});

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

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
    <html lang="pt-BR" suppressHydrationWarning className={`${poppins.variable} ${nunito.variable} ${spaceMono.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="bg-bg dark:bg-surface-dark-muted text-text-primary dark:text-text-dark-primary font-body transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
