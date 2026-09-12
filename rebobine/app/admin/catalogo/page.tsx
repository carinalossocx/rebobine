'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import FilmeCard from '@/components/FilmeCard';
import { Filme } from '@/lib/types';
import {
  carregarCatalogo,
  filtrarPorBusca,
  obterGenerosCatalogo,
} from '@/lib/catalog-loader';

export default function CatalogoAdminPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [filtrados, setFiltrados] = useState<Filme[]>([]);
  const [busca, setBusca] = useState('');
  const [soAtivos, setSoAtivos] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [modalFilme, setModalFilme] = useState<Filme | null>(null);

  useEffect(() => {
    const carregar = async () => {
      try {
        const dados = await carregarCatalogo();
        setFilmes(dados);
        setFiltrados(dados);
      } catch (erro) {
        console.error('Erro ao carregar catálogo:', erro);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  useEffect(() => {
    let resultado = filmes;
    resultado = filtrarPorBusca(resultado, busca);
    if (soAtivos) {
      resultado = resultado.filter((f) => f.ativo);
    }
    setFiltrados(resultado);
  }, [busca, soAtivos, filmes]);

  const handleToggleAtivo = (id: string) => {
    setFilmes(
      filmes.map((f) => (f.id === id ? { ...f, ativo: !f.ativo } : f))
    );
    setFiltrados(
      filtrados.map((f) => (f.id === id ? { ...f, ativo: !f.ativo } : f))
    );
  };

  if (carregando) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎬</div>
          <p className="text-slate-300">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <Header isAdmin={true} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">Gerenciar Catálogo</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Total de Filmes</p>
            <p className="text-2xl font-bold text-white">{filmes.length}</p>
          </div>
          <div className="bg-green-600/20 rounded-lg p-4 border border-green-600">
            <p className="text-green-300 text-sm">Ativos</p>
            <p className="text-2xl font-bold text-green-400">
              {filmes.filter((f) => f.ativo).length}
            </p>
          </div>
          <div className="bg-yellow-600/20 rounded-lg p-4 border border-yellow-600">
            <p className="text-yellow-300 text-sm">Inativos</p>
            <p className="text-2xl font-bold text-yellow-400">
              {filmes.filter((f) => !f.ativo).length}
            </p>
          </div>
          <div className="bg-slate-800 rounded-lg p-4">
            <p className="text-slate-300 text-sm">Exibindo</p>
            <p className="text-2xl font-bold text-white">{filtrados.length}</p>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-slate-800 rounded-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Buscar por Título
              </label>
              <input
                type="text"
                placeholder="Buscar..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 text-white rounded border border-slate-600 focus:border-red-500 focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-slate-300">
              <input
                type="checkbox"
                checked={soAtivos}
                onChange={(e) => setSoAtivos(e.target.checked)}
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold">Apenas Ativos</span>
            </label>
          </div>
        </div>

        {/* Grid */}
        {filtrados.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filtrados.map((filme) => (
              <div key={filme.id} className="relative group">
                <FilmeCard
                  filme={filme}
                  onClique={setModalFilme}
                  disponivel={filme.ativo}
                />
                <button
                  onClick={() => handleToggleAtivo(filme.id)}
                  className="absolute top-2 left-2 bg-black/70 hover:bg-black text-white px-2 py-1 rounded text-xs font-semibold opacity-0 group-hover:opacity-100 transition"
                >
                  {filme.ativo ? '🔓 Desativar' : '🔒 Ativar'}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-400">
            Nenhum filme encontrado.
          </div>
        )}
      </main>

      {/* Modal */}
      {modalFilme && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setModalFilme(null)}
        >
          <div
            className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex gap-6">
                {modalFilme.poster_path && (
                  <div className="flex-shrink-0 w-32 h-48 bg-slate-700 rounded overflow-hidden">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${modalFilme.poster_path}`}
                      alt={modalFilme.titulo}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-white">
                        {modalFilme.titulo}
                      </h2>
                      {modalFilme.titulo_original && (
                        <p className="text-slate-400">{modalFilme.titulo_original}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setModalFilme(null)}
                      className="text-2xl text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <p className="text-slate-300">
                      <span className="font-semibold">TMDB ID:</span>{' '}
                      {modalFilme.id_tmdb}
                    </p>
                    {modalFilme.data_lancamento && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Lançamento:</span>{' '}
                        {new Date(modalFilme.data_lancamento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {modalFilme.nota_tmdb && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Nota:</span> ⭐{' '}
                        {modalFilme.nota_tmdb.toFixed(1)}/10
                      </p>
                    )}
                    <p className="text-slate-300">
                      <span className="font-semibold">Status:</span>{' '}
                      <span
                        className={
                          modalFilme.ativo
                            ? 'text-green-400'
                            : 'text-red-400'
                        }
                      >
                        {modalFilme.ativo ? '✓ Ativo' : '✕ Inativo'}
                      </span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      handleToggleAtivo(modalFilme.id);
                      setModalFilme(null);
                    }}
                    className={`w-full px-4 py-2 rounded font-semibold transition ${
                      modalFilme.ativo
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    {modalFilme.ativo ? '🔓 Desativar' : '🔒 Ativar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
