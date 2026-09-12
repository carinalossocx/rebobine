'use client';

import Header from '@/components/Header';
import Link from 'next/link';

interface StatCard {
  titulo: string;
  valor: string | number;
  icone: string;
  cor: string;
  link?: string;
}

export default function PainelPage() {
  // TODO: Conectar com Supabase para dados reais
  const stats: StatCard[] = [
    {
      titulo: 'Exemplares Ativos',
      valor: '9.412',
      icone: '📀',
      cor: 'bg-blue-600',
      link: '/admin/catalogo',
    },
    {
      titulo: 'Disponíveis',
      valor: '8.890',
      icone: '✓',
      cor: 'bg-green-600',
    },
    {
      titulo: 'Alugados',
      valor: '461',
      icone: '🎬',
      cor: 'bg-yellow-600',
      link: '/admin/locacoes?filtro=abertas',
    },
    {
      titulo: 'Atrasados',
      valor: '37',
      icone: '⚠️',
      cor: 'bg-red-600',
      link: '/admin/locacoes?filtro=atrasadas',
    },
  ];

  const atrasados = [
    {
      id: 1,
      cliente: 'Ana Souza ⊘',
      filme: 'Titanic (1997)',
      vencimento: '15/09',
      dias: 2,
      multa: 'R$ 4,00',
    },
    {
      id: 2,
      cliente: 'Carlos Lima',
      filme: 'Matrix (1999)',
      vencimento: '10/09',
      dias: 7,
      multa: 'R$ 14,00',
    },
    {
      id: 3,
      cliente: 'Marina Costa',
      filme: 'Inception (2010)',
      vencimento: '12/09',
      dias: 5,
      multa: 'R$ 10,00',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <Header isAdmin={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Painel de Controle</h1>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => (
            <Link
              key={stat.titulo}
              href={stat.link || '#'}
              className={`${stat.cor} rounded-lg p-6 text-white shadow-lg hover:shadow-xl transition transform hover:scale-105 cursor-pointer`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold opacity-80">{stat.titulo}</p>
                  <p className="text-4xl font-bold mt-2">{stat.valor}</p>
                </div>
                <span className="text-5xl opacity-50">{stat.icone}</span>
              </div>
            </Link>
          ))}
        </div>

        {/* Seções */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Atrasados */}
          <div className="lg:col-span-2 bg-slate-800 rounded-lg shadow-lg">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Locações Atrasadas</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300">
                      Filme
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300">
                      Venc.
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-slate-300">
                      Dias
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-slate-300">
                      Multa Est.
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {atrasados.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-700/50 transition"
                    >
                      <td className="px-6 py-4 text-white text-sm">
                        {item.cliente}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {item.filme}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-300 text-sm">
                        {item.vencimento}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-3 py-1 bg-red-600/20 text-red-400 rounded-full text-sm font-semibold">
                          {item.dias}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-white font-semibold text-sm">
                        {item.multa}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {atrasados.length === 0 && (
              <div className="p-6 text-center text-slate-400">
                Nenhuma locação atrasada! 🎉
              </div>
            )}
          </div>

          {/* Menu Rápido */}
          <div className="space-y-4">
            <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">Ações Rápidas</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/clientes"
                  className="block px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition text-center"
                >
                  👥 Gerenciar Clientes
                </Link>
                <Link
                  href="/admin/locacoes"
                  className="block px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition text-center"
                >
                  📦 Registrar Devolução
                </Link>
                <Link
                  href="/admin/reservas"
                  className="block px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition text-center"
                >
                  ⭐ Gerenciar Reservas
                </Link>
                <Link
                  href="/admin/relatorio"
                  className="block px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition text-center"
                >
                  📊 Relatório
                </Link>
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-6">
              <p className="text-sm text-blue-300">
                <span className="font-semibold">ℹ️ Dica:</span> Verifique as
                locações atrasadas e entre em contato com os clientes para
                cobrar as multas devidas.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">
              Invariante do Painel
            </h3>
            <p className="text-xs text-slate-400">
              ativos = disponíveis + alugados + reservados
            </p>
            <p className="text-xl font-bold text-white mt-4">
              {9412} = {8890} + {461} + {61}
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">
              Multas Devidas (Estimativa)
            </h3>
            <p className="text-2xl font-bold text-red-400">R$ 28,00</p>
            <p className="text-xs text-slate-400 mt-2">
              De {atrasados.length} locações atrasadas
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 border border-slate-700">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">
              Taxa de Ocupação
            </h3>
            <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-red-600 h-2 rounded-full"
                style={{ width: '9%' }}
              ></div>
            </div>
            <p className="text-xl font-bold text-white mt-4">4,9%</p>
          </div>
        </div>
      </main>
    </div>
  );
}
