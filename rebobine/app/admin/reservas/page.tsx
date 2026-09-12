'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Reserva } from '@/lib/types';
import { formatarData } from '@/lib/dates';

interface ReservaComDetalhes extends Reserva {
  cliente_nome: string;
  filme_titulo: string;
  status: 'ativa' | 'expirada' | 'cancelada' | 'consumida';
}

export default function ReservasPage() {
  const [reservas, setReservas] = useState<ReservaComDetalhes[]>([
    {
      id: '1',
      cliente_id: '1',
      exemplar_id: '1',
      criada_em: new Date('2026-09-12T10:00:00').toISOString(),
      expira_em: new Date('2026-09-13T10:00:00').toISOString(),
      cancelada_em: null,
      consumida_por_locacao: null,
      cliente_nome: 'Ana Souza',
      filme_titulo: 'Titanic (1997)',
      status: 'ativa',
    },
    {
      id: '2',
      cliente_id: '3',
      exemplar_id: '2',
      criada_em: new Date('2026-09-11T15:00:00').toISOString(),
      expira_em: new Date('2026-09-12T15:00:00').toISOString(),
      cancelada_em: null,
      consumida_por_locacao: null,
      cliente_nome: 'Marina Costa',
      filme_titulo: 'Inception (2010)',
      status: 'ativa',
    },
    {
      id: '3',
      cliente_id: '2',
      exemplar_id: '3',
      criada_em: new Date('2026-09-10T12:00:00').toISOString(),
      expira_em: new Date('2026-09-11T12:00:00').toISOString(),
      cancelada_em: null,
      consumida_por_locacao: null,
      cliente_nome: 'Carlos Lima',
      filme_titulo: 'Matrix (1999)',
      status: 'expirada',
    },
  ]);

  const [filtro, setFiltro] = useState<'todas' | 'ativas' | 'expiradas' | 'canceladas'>('todas');

  const filtradas = reservas.filter((r) => {
    if (filtro === 'ativas') return r.status === 'ativa';
    if (filtro === 'expiradas') return r.status === 'expirada';
    if (filtro === 'canceladas') return r.status === 'cancelada';
    return true;
  });

  const handleCancelar = (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta reserva?')) {
      setReservas(
        reservas.map((r) =>
          r.id === id
            ? {
                ...r,
                cancelada_em: new Date().toISOString(),
                status: 'cancelada' as const,
              }
            : r
        )
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativa':
        return 'bg-green-600/20 text-green-400';
      case 'expirada':
        return 'bg-yellow-600/20 text-yellow-400';
      case 'cancelada':
        return 'bg-red-600/20 text-red-400';
      case 'consumida':
        return 'bg-slate-600/20 text-slate-400';
      default:
        return 'bg-slate-600/20 text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header isAdmin={true} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Gerenciar Reservas</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Total</p>
            <p className="text-2xl font-bold text-white">{reservas.length}</p>
          </div>
          <div className="bg-green-600/20 rounded-lg p-4 border border-green-600">
            <p className="text-green-300 text-sm">Ativas</p>
            <p className="text-2xl font-bold text-green-400">
              {reservas.filter((r) => r.status === 'ativa').length}
            </p>
          </div>
          <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-600">
            <p className="text-yellow-300 text-sm">Expiradas</p>
            <p className="text-2xl font-bold text-yellow-400">
              {reservas.filter((r) => r.status === 'expirada').length}
            </p>
          </div>
          <div className="bg-red-600/20 rounded-lg p-4 border border-red-600">
            <p className="text-red-300 text-sm">Canceladas</p>
            <p className="text-2xl font-bold text-red-400">
              {reservas.filter((r) => r.status === 'cancelada').length}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-3 mb-6">
          {(['todas', 'ativas', 'expiradas', 'canceladas'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filtro === f
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {f === 'todas' && 'Todas'}
              {f === 'ativas' && 'Ativas'}
              {f === 'expiradas' && 'Expiradas'}
              {f === 'canceladas' && 'Canceladas'}
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
                    Criada em
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                    Expira em
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
                {filtradas.map((reserva) => (
                  <tr key={reserva.id} className="hover:bg-slate-700/50 transition">
                    <td className="px-6 py-4 text-white">{reserva.cliente_nome}</td>
                    <td className="px-6 py-4 text-slate-300">
                      {reserva.filme_titulo}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatarData(reserva.criada_em)}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {formatarData(reserva.expira_em)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          reserva.status
                        )}`}
                      >
                        {reserva.status === 'ativa' && '● Ativa'}
                        {reserva.status === 'expirada' && '○ Expirada'}
                        {reserva.status === 'cancelada' && '✕ Cancelada'}
                        {reserva.status === 'consumida' && '✓ Consumida'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {reserva.status === 'ativa' && (
                        <button
                          onClick={() => handleCancelar(reserva.id)}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          ✕ Cancelar
                        </button>
                      )}
                      {reserva.status !== 'ativa' && (
                        <span className="text-slate-400 text-sm">-</span>
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
            Nenhuma reserva encontrada.
          </div>
        )}

        {/* Info */}
        <div className="mt-8 bg-blue-600/20 border border-blue-600 rounded-lg p-6">
          <p className="text-sm text-blue-300">
            <span className="font-semibold">ℹ️ Nota:</span> Reservas são
            automaticamente expiradas após 24 horas sem serem consumidas. Não é
            necessário limpar manualmente.
          </p>
        </div>
      </main>
    </div>
  );
}
