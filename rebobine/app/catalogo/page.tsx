'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Filme } from '@/lib/types';
import {
  carregarCatalogo,
  filtrarPorGenero,
  filtrarPorBusca,
  obterGenerosCatalogo,
  obterFilmesAtivos,
} from '@/lib/catalog-loader';
import Header from '@/components/Header';
import FilmeCard from '@/components/FilmeCard';
import FilmesCarousel from '@/components/FilmesCarousel';

const MENSAGENS_ERRO: Record<string, string> = {
  CLIENTE_NAO_ENCONTRADO: 'Cliente não encontrado. Faça login novamente.',
  CLIENTE_INATIVO_OU_INEXISTENTE: 'Sua conta está inativa. Fale com o suporte.',
  SEM_EXEMPLAR_DISPONIVEL: 'Não há exemplares disponíveis para este filme agora.',
  EXEMPLAR_INDISPONIVEL: 'Este exemplar acabou de ser reservado por outro cliente.',
  LIMITE_RESERVAS_ATINGIDO: 'Você já tem 2 reservas ativas. Cancele uma para reservar outra.',
  DADOS_INCOMPLETOS: 'Dados incompletos para reservar.',
  ERRO_INTERNO: 'Erro ao processar. Tente novamente.',
};

function getPosterUrl(posterPath: string | null): string | null {
  if (!posterPath) return null;
  if (posterPath.startsWith('http')) return posterPath;
  return `https://image.tmdb.org/t/p/w500${posterPath}`;
}

export default function CatalogPage() {
  const router = useRouter();
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [filmesAtivos, setFilmesAtivos] = useState<Filme[]>([]);
  const [filtrados, setFiltrados] = useState<Filme[]>([]);
  const [generos, setGeneros] = useState<string[]>([]);
  const [busca, setBusca] = useState('');
  const [generoSelecionado, setGeneroSelecionado] = useState('Todos');
  const [carregando, setCarregando] = useState(true);
  const [modalFilme, setModalFilme] = useState<Filme | null>(null);
  const [soDisponivel, setSoDisponivel] = useState(false);
  const [reservando, setReservando] = useState(false);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro' | 'info'; texto: string } | null>(null);

  const fecharModal = () => {
    setModalFilme(null);
    setFeedback(null);
  };

  const handleReservar = async () => {
    if (!modalFilme) return;
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') : null;

    if (!email) {
      router.push('/login');
      return;
    }

    setReservando(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/reservar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filme_id: modalFilme.id, cliente_email: email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ tipo: 'erro', texto: MENSAGENS_ERRO[data.erro] || 'Erro ao reservar.' });
        return;
      }

      const expira = new Date(data.expira_em).toLocaleString('pt-BR');
      setFeedback({ tipo: 'sucesso', texto: `Reservado! Retire até ${expira}.` });
    } catch {
      setFeedback({ tipo: 'erro', texto: 'Erro de conexão. Tente novamente.' });
    } finally {
      setReservando(false);
    }
  };

  const handleAlugar = () => {
    setFeedback({
      tipo: 'info',
      texto: 'O aluguel é finalizado no balcão da loja. Reserve para garantir sua cópia até lá.',
    });
  };

  // Carregar catálogo ao montar
  useEffect(() => {
    const carregar = async () => {
      try {
        console.log('Iniciando carregamento do catálogo...');
        const dados = await carregarCatalogo();
        console.log('Dados recebidos:', dados.length);
        setFilmes(dados);
        const ativos = obterFilmesAtivos(dados);
        console.log('Filmes ativos:', ativos.length);
        setFilmesAtivos(ativos);
        setFiltrados(ativos);
        setGeneros(['Todos', ...obterGenerosCatalogo(ativos)]);
        console.log('Catálogo carregado com sucesso');
      } catch (erro) {
        console.error('Erro ao carregar catálogo:', erro);
      } finally {
        setCarregando(false);
      }
    };
    carregar();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    let resultado = filmesAtivos;
    resultado = filtrarPorGenero(resultado, generoSelecionado);
    resultado = filtrarPorBusca(resultado, busca);
    setFiltrados(resultado);
  }, [busca, generoSelecionado, filmesAtivos]);

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

  // Seções para carousel (primeiras do gênero)
  const todasAsCategorias = obterGenerosCatalogo(filmesAtivos);
  const carouselSections = todasAsCategorias.slice(0, 5).map((genero) => ({
    titulo: genero,
    filmes: filtrarPorGenero(filmesAtivos, genero).slice(0, 12),
  }));

  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Catálogo Rebobine
          </h1>
          <p className="text-slate-300 mb-8">
            {filmesAtivos.length} filmes disponíveis
          </p>

          {/* Busca */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Buscar por título..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full px-6 py-3 bg-slate-800 text-white rounded-lg border border-slate-700 focus:border-red-500 focus:outline-none transition"
            />
            <span className="absolute right-4 top-3 text-slate-400">🔍</span>
          </div>

          {/* Filtros */}
          <div className="space-y-4">
            {/* Gênero */}
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Gênero
              </label>
              <div className="flex flex-wrap gap-2">
                {generos.map((genero) => (
                  <button
                    key={genero}
                    onClick={() => setGeneroSelecionado(genero)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      generoSelecionado === genero
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {genero}
                  </button>
                ))}
              </div>
            </div>

            {/* Apenas Disponíveis */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="soDisponivel"
                checked={soDisponivel}
                onChange={(e) => setSoDisponivel(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="soDisponivel" className="text-slate-300">
                ☑ Apenas disponíveis
              </label>
            </div>
          </div>
        </section>

        {/* Carousels por Gênero */}
        {carouselSections.map((section) => (
          <FilmesCarousel
            key={section.titulo}
            titulo={section.titulo}
            filmes={section.filmes}
            onFilmeClique={setModalFilme}
          />
        ))}

        {/* Grid de Resultados da Busca */}
        {(busca || generoSelecionado !== 'Todos') && (
          <section>
            <h2 className="text-2xl font-bold text-white mb-6">
              Resultados ({filtrados.length})
            </h2>
            {filtrados.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filtrados.map((filme) => (
                  <div key={filme.id}>
                    <FilmeCard
                      filme={filme}
                      onClique={setModalFilme}
                      disponivel={true}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400">Nenhum filme encontrado.</p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Modal Detalhe do Filme */}
      {modalFilme && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={fecharModal}
        >
          <div
            className="bg-slate-800 rounded-lg max-w-2xl w-full max-h-[32rem] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex gap-6">
                {/* Poster */}
                <div className="flex-shrink-0 w-32 h-48 bg-slate-700 rounded overflow-hidden flex items-center justify-center">
                  {getPosterUrl(modalFilme.poster_path) ? (
                    <img
                      src={getPosterUrl(modalFilme.poster_path)!}
                      alt={modalFilme.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-slate-500 text-xs text-center px-2">Sem imagem</span>
                  )}
                </div>

                {/* Info */}
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
                      onClick={fecharModal}
                      className="text-2xl text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 mb-4 text-sm">
                    {modalFilme.data_lancamento && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Lançamento:</span>{' '}
                        {new Date(modalFilme.data_lancamento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {modalFilme.nota_tmdb && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Nota TMDB:</span> ⭐{' '}
                        {modalFilme.nota_tmdb.toFixed(1)}/10
                      </p>
                    )}
                    {modalFilme.generos.length > 0 && (
                      <p className="text-slate-300">
                        <span className="font-semibold">Gêneros:</span>{' '}
                        {modalFilme.generos.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Sinopse */}
                  {modalFilme.sinopse && (
                    <div className="mb-4">
                      <p className="text-slate-300 text-sm leading-relaxed">
                        {modalFilme.sinopse}
                      </p>
                    </div>
                  )}

                  {/* Feedback */}
                  {feedback && (
                    <div
                      className={`mb-4 px-4 py-2 rounded text-sm ${
                        feedback.tipo === 'sucesso'
                          ? 'bg-green-600/20 border border-green-600 text-green-300'
                          : feedback.tipo === 'erro'
                          ? 'bg-red-600/20 border border-red-600 text-red-300'
                          : 'bg-blue-600/20 border border-blue-600 text-blue-300'
                      }`}
                    >
                      {feedback.texto}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAlugar}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-semibold transition"
                    >
                      🎬 Alugar
                    </button>
                    <button
                      onClick={handleReservar}
                      disabled={reservando}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-600 disabled:opacity-60 text-white rounded font-semibold transition"
                    >
                      {reservando ? 'Reservando...' : '⭐ Reservar'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Créditos TMDB */}
      <footer className="border-t border-slate-800 mt-16 py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>Dados cinematográficos: TMDB. Este produto usa a API TMDB sem endosso.</p>
        </div>
      </footer>
    </div>
  );
}
