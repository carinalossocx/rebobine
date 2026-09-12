'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Cliente } from '@/lib/types';

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([
    {
      id: '1',
      nome: 'Ana Souza',
      email: 'ana@exemplo.com',
      telefone: '(11) 98765-4321',
      ativo: true,
      auth_user_id: null,
    },
    {
      id: '2',
      nome: 'Carlos Lima',
      email: 'carlos@exemplo.com',
      telefone: '(21) 99876-5432',
      ativo: true,
      auth_user_id: null,
    },
  ]);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Cliente | null>(null);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
  });

  const handleAbrirModal = (cliente?: Cliente) => {
    if (cliente) {
      setEditando(cliente);
      setFormData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone || '',
      });
    } else {
      setEditando(null);
      setFormData({ nome: '', email: '', telefone: '' });
    }
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setEditando(null);
    setFormData({ nome: '', email: '', telefone: '' });
  };

  const handleSalvar = (e: React.FormEvent) => {
    e.preventDefault();
    if (editando) {
      setClientes(
        clientes.map((c) =>
          c.id === editando.id
            ? { ...c, nome: formData.nome, email: formData.email, telefone: formData.telefone }
            : c
        )
      );
    } else {
      const novoCliente: Cliente = {
        id: Date.now().toString(),
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        ativo: true,
        auth_user_id: null,
      };
      setClientes([...clientes, novoCliente]);
    }
    handleFecharModal();
  };

  const handleToggleAtivo = (id: string) => {
    setClientes(
      clientes.map((c) => (c.id === id ? { ...c, ativo: !c.ativo } : c))
    );
  };

  const handleDeletar = (id: string) => {
    if (confirm('Tem certeza que deseja deletar este cliente?')) {
      setClientes(clientes.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Header isAdmin={true} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">Gerenciar Clientes</h1>
          <button
            onClick={() => handleAbrirModal()}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition"
          >
            + Novo Cliente
          </button>
        </div>

        {/* Tabela */}
        <div className="bg-slate-800 rounded-lg overflow-hidden shadow-lg">
          <table className="w-full">
            <thead className="bg-slate-900">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Nome
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-300">
                  Telefone
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
              {clientes.map((cliente) => (
                <tr
                  key={cliente.id}
                  className="hover:bg-slate-700/50 transition"
                >
                  <td className="px-6 py-4 text-white">{cliente.nome}</td>
                  <td className="px-6 py-4 text-slate-300">{cliente.email}</td>
                  <td className="px-6 py-4 text-slate-300">
                    {cliente.telefone || '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cliente.ativo
                          ? 'bg-green-600/20 text-green-400'
                          : 'bg-red-600/20 text-red-400'
                      }`}
                    >
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleAbrirModal(cliente)}
                      className="text-blue-400 hover:text-blue-300 mr-4 transition"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleToggleAtivo(cliente.id)}
                      className="text-yellow-400 hover:text-yellow-300 mr-4 transition"
                    >
                      {cliente.ativo ? '🔒' : '🔓'}
                    </button>
                    <button
                      onClick={() => handleDeletar(cliente.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {clientes.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            Nenhum cliente cadastrado.
          </div>
        )}
      </main>

      {/* Modal */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editando ? 'Editar Cliente' : 'Novo Cliente'}
                </h2>
                <button
                  onClick={handleFecharModal}
                  className="text-2xl text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSalvar} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Nome
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nome}
                    onChange={(e) =>
                      setFormData({ ...formData, nome: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) =>
                      setFormData({ ...formData, telefone: e.target.value })
                    }
                    placeholder="(11) 98765-4321"
                    className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleFecharModal}
                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-semibold transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                  >
                    Salvar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
