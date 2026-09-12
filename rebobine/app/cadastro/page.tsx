'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CadastroPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    senha: '',
    confirmaSenha: '',
  });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');

    // Validações
    if (!formData.nome || !formData.email || !formData.senha) {
      setErro('Preencha todos os campos obrigatórios');
      return;
    }

    if (formData.senha !== formData.confirmaSenha) {
      setErro('As senhas não conferem');
      return;
    }

    if (formData.senha.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (!formData.email.includes('@')) {
      setErro('Email inválido');
      return;
    }

    setCarregando(true);

    try {
      // TODO: Integrar com Supabase Auth
      // Por enquanto, simular cadastro
      console.log('Cadastro:', formData);

      // Armazenar dados (futuramente no Supabase)
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('userName', formData.nome);

      // Redirecionar
      router.push('/catalogo?cadastro=sucesso');
    } catch (err) {
      setErro('Erro ao criar conta. Tente novamente.');
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
          <p className="text-slate-400">Crie sua conta</p>
        </div>

        {/* Card */}
        <div className="bg-slate-800 rounded-lg shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Novo Cliente</h2>

          {erro && (
            <div className="bg-red-600/20 border border-red-600 text-red-300 px-4 py-3 rounded-lg mb-6">
              {erro}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Nome Completo *
              </label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                placeholder="Seu nome"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Telefone
              </label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone}
                onChange={handleChange}
                placeholder="(11) 98765-4321"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Senha *
              </label>
              <input
                type="password"
                name="senha"
                value={formData.senha}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none transition"
              />
              <p className="text-xs text-slate-400 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Confirmar Senha *
              </label>
              <input
                type="password"
                name="confirmaSenha"
                value={formData.confirmaSenha}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-slate-700 text-white rounded-lg border border-slate-600 focus:border-red-500 focus:outline-none transition"
              />
            </div>

            <button
              type="submit"
              disabled={carregando}
              className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-slate-600 text-white rounded-lg font-bold transition"
            >
              {carregando ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-600 text-center">
            <p className="text-slate-400 text-sm">
              Já tem conta?{' '}
              <Link href="/login" className="text-red-500 hover:text-red-400 font-semibold">
                Fazer login
              </Link>
            </p>
          </div>
        </div>

        {/* Termos */}
        <p className="mt-6 text-xs text-slate-400 text-center">
          Ao criar uma conta, você concorda com nossos{' '}
          <Link href="#" className="text-slate-300 hover:text-slate-200">
            Termos de Serviço
          </Link>
        </p>
      </div>
    </div>
  );
}
