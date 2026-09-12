'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Locacao } from '@/lib/types';
import { formatarReais } from '@/lib/money';
import { formatarData } from '@/lib/dates';

interface LocacaoComDetalhes extends Locacao {
  cliente_nome: string;
  filme_titulo: string;
}

export default function LocacoesPage() {
  const [locacoes, setLocacoes] = useState<LocacaoComDetalhes[]>([
    {
      id: '1',
      cliente_id: '1',
      exemplar_id: '1',
      retirada_em: new Date('2026-09-10').toISOString(),
      vencimento: '2026-09-13',
      preco_centavos: 1000,
      multa_dia_centavos: 200,
      devolvida_em: null,
      dias_atraso: null,
      multa_centavos: null,
      cliente_nome: 'Ana Souza',
      filme_titulo: 'Titanic (1997)',
    },
    {
      id: '2',
      cliente_id: '2',
      exemplar_id: '2',
      retirada_em: new Date('2026-09-11').toISOString(),
      vencimento: '2026-09-14',
      preco_centavos: 1000,
      multa_dia_centavos: 200,
      devolvida_em: new Date('2026-09-16').toISOString(),
      dias_atraso: 2,
      multa_centavos: 400,
      cliente_nome: 'Carlos Lima',
      filme_titulo: 'Matrix (1999)',
    },
  ]);

  const [filtro, setFiltro] = useState<'todas' | 'abertas' | 'devolvidas'>('todas');
  const [modalAberto, setModalAberto] = useState(false);
  const [devolvendoId, setDevolvendoId] = useState<string | null>(null);

  const filtradas = locacoes.filter((l) => {
    if (filtro === 'abertas') return l.devolvida_em === null;
    if (filtro === 'devolvidas') return l.devolvida_em !== null;
    return true;
  });

  const handleDevolucao = (id: string) => {
    setLocacoes(
      locacoes.map((l) => {
        if (l.id === id && l.devolvida_em === null) {
          const venc = new Date(l.vencimento);
          const hoje = new Date();
          const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
          const multa = diasAtraso * l.multa_dia_centavos;
          return {
            ...l,
            devolvida_em: new Date().toISOString(),
            dias_atraso: diasAtraso,
            multa_centavos: multa,
          };
        }
        return l;
      })
    );
    setDevolvendoId(null);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header isAdmin={true} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Gerenciar Locações</h1>

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          {(['todas', 'abertas', 'devolvidas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filtro === f
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f === 'todas' && `Todas (${locacoes.length})`}
              {f === 'abertas' && `Abertas (${locacoes.filter((l) => !l.devolvida_em).length})`}
              {f === 'devolvidas' && `Devolvidas (${locacoes.filter((l) => l.devolvida_em).length})`}
            </button>
          ))}
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
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                    Preço
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-slate-300">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-300">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filtradas.map((locacao) => (
                  <tr key={locacao.id} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 text-white">{locacao.cliente_nome}</td>
                    <td className="px-6 py-4 text-slate-300">{locacao.filme_titulo}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatarData(locacao.retirada_em)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {locacao.vencimento}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-semibold">
                      {formatarReais(locacao.preco_centavos)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          locacao.devolvida_em
                            ? 'bg-slate-600/50 text-slate-300'
                            : 'bg-green-600/20 text-green-400'
                        }`}
                      >
                        {locacao.devolvida_em ? '✓ Devolvida' : '● Aberta'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!locacao.devolvida_em && (
                        <button
                          onClick={() => setDevolvendoId(locacao.id)}
                          className="text-blue-400 hover:text-blue-300 transition"
                        >
                          📦 Devolver
                        </button>
                      )}
                      {locacao.devolvida_em && locacao.multa_centavos && locacao.multa_centavos > 0 && (
                        <span className="text-red-400 font-semibold">
                          Multa: {formatarReais(locacao.multa_centavos)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtradas.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Nenhuma locação encontrada.
          </div>
        )}
      </main>

      {/* Modal Devolução */}
      {devolvendoId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Registrar Devolução</h2>

              {(() => {
                const locacao = locacoes.find((l) => l.id === devolvendoId);
                if (!locacao) return null;

                const venc = new Date(locacao.vencimento);
                const hoje = new Date();
                const diasAtraso = Math.max(0, Math.floor((hoje.getTime() - venc.getTime()) / (1000 * 60 * 60 * 24)));
                const multa = diasAtraso * locacao.multa_dia_centavos;

                return (
                  <div className="space-y-4">
                    <div>
                      <p className="text-slate-300">
                        <span className="font-semibold">Cliente:</span> {locacao.cliente_nome}
                      </p>
                      <p className="text-slate-300">
                        <span className="font-semibold">Filme:</span> {locacao.filme_titulo}
                      </p>
                    </div>

                    <div className="border-t border-slate-700 pt-4">
                      <p className="text-slate-300 mb-2">
                        <span className="font-semibold">Vencimento:</span> {locacao.vencimento}
                      </p>
                      <p className="text-slate-300 mb-2">
                        <span className="font-semibold">Dias de atraso:</span>{' '}
                        <span className={diasAtraso > 0 ? 'text-red-400' : 'text-green-400'}>
                          {diasAtraso} dias
                        </span>
                      </p>
                      {multa > 0 && (
                        <p className="text-red-400 font-semibold text-lg">
                          Multa: {formatarReais(multa)}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setDevolvendoId(null)}
                        className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold transition"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDevolucao(locacao.id)}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded font-semibold transition"
                      >
                        Confirmar Devolução
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
