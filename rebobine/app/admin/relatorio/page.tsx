'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { formatarReais } from '@/lib/money';
import { formatarData } from '@/lib/dates';

interface ItemRelatorio {
  id: string;
  cliente: string;
  filme: string;
  retirada: string;
  vencimento: string;
  devolucao: string | null;
  preco: number;
  multa: number;
}

export default function RelatorioPage() {
  const [dataInicio, setDataInicio] = useState('2026-09-01');
  const [dataFim, setDataFim] = useState('2026-09-30');
  const [formato, setFormato] = useState<'tabela' | 'csv'>('tabela');

  // Dados de exemplo
  const relatorio: ItemRelatorio[] = [
    {
      id: '1',
      cliente: 'Ana Souza',
      filme: 'Titanic (1997)',
      retirada: '2026-09-05',
      vencimento: '2026-09-08',
      devolucao: '2026-09-10',
      preco: 1000,
      multa: 400,
    },
    {
      id: '2',
      cliente: 'Carlos Lima',
      filme: 'Matrix (1999)',
      retirada: '2026-09-08',
      vencimento: '2026-09-11',
      devolucao: '2026-09-11',
      preco: 1000,
      multa: 0,
    },
    {
      id: '3',
      cliente: 'Marina Costa',
      filme: 'Inception (2010)',
      retirada: '2026-09-10',
      vencimento: '2026-09-13',
      devolucao: null,
      preco: 1000,
      multa: -1,
    },
  ];

  const totalPreco = relatorio.reduce((acc, item) => acc + item.preco, 0);
  const totalMulta = relatorio.reduce((acc, item) => acc + (item.multa > 0 ? item.multa : 0), 0);
  const totalLocacoes = relatorio.length;
  const locacoesEncerradas = relatorio.filter((r) => r.devolucao).length;

  const exportarCSV = () => {
    const header = ['Cliente', 'Filme', 'Retirada', 'Vencimento', 'Devolução', 'Preço', 'Multa'];
    const rows = relatorio.map((r) => [
      r.cliente,
      r.filme,
      r.retirada,
      r.vencimento,
      r.devolucao || 'Em aberto',
      `"${formatarReais(r.preco).replace('R$', '').trim()}"`,
      `"${formatarReais(r.multa > 0 ? r.multa : 0).replace('R$', '').trim()}"`,
    ]);

    const csv = [
      header.join(';'),
      ...rows.map((r) => r.join(';')),
      '',
      `Total de locações;${totalLocacoes};;;;`,
      `Encerradas;${locacoesEncerradas};;;;`,
      `Preço total;;;;;;${formatarReais(totalPreco)}`,
      `Multas devidas;;;;;;${formatarReais(totalMulta)}`,
      '',
      'Nota: Valores devidos. Não representam receita recebida.',
    ].join('\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${dataInicio}_a_${dataFim}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header isAdmin={true} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Relatório de Locações</h1>

        {/* Filtros */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Data Início
              </label>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Data Fim
              </label>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Formato
              </label>
              <select
                value={formato}
                onChange={(e) => setFormato(e.target.value as 'tabela' | 'csv')}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
              >
                <option value="tabela">Tabela</option>
                <option value="csv">CSV</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition">
              🔍 Gerar
            </button>
            <button
              onClick={exportarCSV}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
            >
              📥 Exportar CSV
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Total de Locações</p>
            <p className="text-2xl font-bold text-white">{totalLocacoes}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Encerradas</p>
            <p className="text-2xl font-bold text-green-400">{locacoesEncerradas}</p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Faturamento</p>
            <p className="text-2xl font-bold text-white">
              {formatarReais(totalPreco)}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Multas Devidas</p>
            <p className="text-2xl font-bold text-red-400">
              {formatarReais(totalMulta)}
            </p>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Filme
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Retirada
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Vencimento
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Devolução
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                    Multa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {relatorio.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 text-white">{item.cliente}</td>
                    <td className="px-6 py-4 text-slate-300">{item.filme}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatarData(item.retirada)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatarData(item.vencimento)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {item.devolucao ? (
                        formatarData(item.devolucao)
                      ) : (
                        <span className="text-yellow-400">
                          Estimativa até {formatarData(item.vencimento)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {formatarReais(item.preco)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold">
                      {item.multa > 0 ? (
                        <span className="text-red-400">
                          {formatarReais(item.multa)}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Rodapé */}
          <div className="bg-slate-900 px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-400">Total Locações</p>
                <p className="text-xl font-bold text-white">{totalLocacoes}</p>
              </div>
              <div>
                <p className="text-slate-400">Faturamento</p>
                <p className="text-xl font-bold text-white">
                  {formatarReais(totalPreco)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Multas Devidas</p>
                <p className="text-xl font-bold text-red-400">
                  {formatarReais(totalMulta)}
                </p>
              </div>
              <div>
                <p className="text-slate-400">Status</p>
                <p className="text-xl font-bold text-yellow-400">Estimativa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nota */}
        <div className="mt-8 bg-yellow-600/20 border border-yellow-600 rounded-lg p-6">
          <p className="text-sm text-yellow-300">
            <span className="font-semibold">⚠️ Aviso:</span> Valores devidos.
            Não representam receita recebida. Multas com estimativa são para
            locações ainda abertas e podem mudar se a devolução ocorrer antes
            da data estimada.
          </p>
        </div>
      </main>
    </div>
  );
}
