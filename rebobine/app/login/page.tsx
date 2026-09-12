'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    try {
      // TODO: Integrar com Supabase Auth
      // Por enquanto, simular login
      if (email === 'admin@rebobine.com' && senha === 'admin123') {
        // Armazenar token (futuramente do Supabase)
        localStorage.setItem('isAdmin', 'true');
        router.push('/admin/clientes');
      } else if (email && senha) {
        // Cliente comum
        localStorage.setItem('userEmail', email);
        router.push('/catalogo');
      } else {
        setErro('Email e senha são obrigatórios');
      }
    } catch (err) {
      setErro('Erro ao fazer login. Tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
            <span className="text-4xl">🎬</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Rebobine</h1>
          <p className="text-slate-400">Sistema de Locadora de Filmes</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Faça Login</h2>

          {erro && (
            <div className="bg-red-600/20 border border-red-600 text-red-300 px-4 py-3 rounded-lg mb-6">
              {erro}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Senha
              </label>
              <input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg font-bold transition"
            >
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">ou</span>
            </div>
          </div>

          {/* Demo Links */}
          <div className="space-y-3 text-sm">
            <button
              type="button"
              onClick={() => {
                setEmail('admin@rebobine.com');
                setSenha('admin123');
              }}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
            >
              Demo Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('ana@exemplo.com');
                setSenha('cliente123');
              }}
              className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition"
            >
              Demo Cliente
            </button>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-600 text-center">
            <p className="text-slate-400 text-sm mb-4">
              Não tem conta?{' '}
              <Link href="/cadastro" className="text-red-500 hover:text-red-400 font-semibold">
                Criar uma nova conta
              </Link>
            </p>
          </div>
        </div>

        {/* Debug Info */}
        <div className="mt-6 bg-slate-800/50 rounded-lg p-4 text-xs text-slate-400">
          <p className="font-semibold mb-2">🔑 Contas de Teste:</p>
          <p>Admin: admin@rebobine.com / admin123</p>
          <p>Cliente: ana@exemplo.com / cliente123</p>
        </div>
      </div>
    </div>
  );
}
