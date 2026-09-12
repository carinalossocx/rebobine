'use client';

import { useEffect, useRef, useState } from 'react';
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
  const [filtroAberto, setFiltroAberto] = useState(false);
  const filtroRef = useRef<HTMLDivElement>(null);

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
        const dados = await carregarCatalogo();
        setFilmes(dados);
        const ativos = obterFilmesAtivos(dados);
        setFilmesAtivos(ativos);
        setFiltrados(ativos);
        setGeneros(['Todos', ...obterGenerosCatalogo(ativos)]);
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

  // Fechar painel de filtro ao clicar fora
  useEffect(() => {
    const aoClicarFora = (e: MouseEvent) => {
      if (filtroRef.current && !filtroRef.current.contains(e.target as Node)) {
        setFiltroAberto(false);
      }
    };
    document.addEventListener('mousedown', aoClicarFora);
    return () => document.removeEventListener('mousedown', aoClicarFora);
  }, []);

  if (carregando) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎬</div>
          <p className="text-white/60 font-body">Carregando catálogo...</p>
        </div>
      </div>
    );
  }

  // Seções para carousel: primeiro os mais pontuados, depois ação, depois premiados,
  // depois demais gêneros
  const porNotaDesc = (a: Filme, b: Filme) => (b.nota_tmdb ?? 0) - (a.nota_tmdb ?? 0);
  const filmesComNota = filmesAtivos.filter((f) => f.nota_tmdb != null);

  const maisPontuados = [...filmesComNota].sort(porNotaDesc).slice(0, 12);

  const generoAcao = 'filme de ação';
  const filmesAcao = filtrarPorGenero(filmesAtivos, generoAcao)
    .slice()
    .sort(porNotaDesc)
    .slice(0, 12);

  const idsUsados = new Set([...maisPontuados, ...filmesAcao].map((f) => f.id));
  const premiados = [...filmesComNota]
    .filter((f) => !idsUsados.has(f.id))
    .sort(porNotaDesc)
    .slice(0, 12);

  const secoesPrioritarias = [
    { titulo: 'Mais pontuados', filmes: maisPontuados },
    { titulo: 'Ação', filmes: filmesAcao },
    { titulo: 'Premiados', filmes: premiados },
  ].filter((s) => s.filmes.length > 0);

  const todasAsCategorias = obterGenerosCatalogo(filmesAtivos);
  const outrasCategorias = todasAsCategorias.filter((g) => g !== generoAcao).slice(0, 3);
  const outrasSecoes = outrasCategorias.map((genero) => ({
    titulo: genero,
    filmes: filtrarPorGenero(filmesAtivos, genero).slice(0, 12),
  }));

  const carouselSections = [...secoesPrioritarias, ...outrasSecoes];

  const filtroAtivo = generoSelecionado !== 'Todos' || soDisponivel;

  return (
    <div className="min-h-screen bg-bg">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
            Catálogo Rebobine
          </h1>
          <p className="text-white/60 font-body mb-6">
            {filtrados.length} de {filmesAtivos.length} filmes
          </p>

          {/* Busca + Filtro (suspenso, só abre ao clicar) */}
          <div className="relative" ref={filtroRef}>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar por título..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onFocus={() => setFiltroAberto(true)}
                  className="w-full h-11 pl-4 pr-11 bg-surface text-white rounded-md border border-white/10 focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 transition font-body placeholder:text-white/40"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none">
                  🔍
                </span>
              </div>

              <button
                onClick={() => setFiltroAberto((v) => !v)}
                aria-expanded={filtroAberto}
                className={`h-11 px-4 rounded-md border font-body font-semibold text-sm transition whitespace-nowrap flex items-center gap-2 ${
                  filtroAtivo
                    ? 'bg-primary border-primary text-white'
                    : 'bg-surface border-white/10 text-white/70 hover:border-white/30'
                }`}
              >
                Filtros
                {filtroAtivo && (
                  <span className="w-2 h-2 rounded-full bg-white" />
                )}
              </button>
            </div>

            {/* Painel suspenso — só aparece quando aberto */}
            {filtroAberto && (
              <div className="absolute left-0 right-0 mt-2 z-30 bg-surface border border-white/10 rounded-lg shadow-overlay p-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-semibold text-white/70 font-body">
                    Gênero
                  </label>
                  {generoSelecionado !== 'Todos' && (
                    <button
                      onClick={() => setGeneroSelecionado('Todos')}
                      className="text-xs text-primary hover:text-primary-light font-body"
                    >
                      Limpar
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {generos.map((genero) => (
                    <button
                      key={genero}
                      onClick={() => {
                        setGeneroSelecionado(genero);
                        setFiltroAberto(false);
                      }}
                      className={`px-3 py-1.5 rounded-full text-sm font-body font-medium transition border ${
                        generoSelecionado === genero
                          ? 'bg-primary border-primary text-white'
                          : 'bg-transparent border-white/15 text-white/70 hover:bg-white/5'
                      }`}
                    >
                      {genero}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-2 text-white/70 font-body text-sm border-t border-white/10 pt-3">
                  <input
                    type="checkbox"
                    checked={soDisponivel}
                    onChange={(e) => setSoDisponivel(e.target.checked)}
                    className="w-4 h-4 accent-[#D946EF]"
                  />
                  Apenas disponíveis
                </label>
              </div>
            )}
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
            <h2 className="text-2xl font-display font-bold text-white mb-6">
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
                <p className="text-white/50 font-body">Nenhum filme encontrado.</p>
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
            className="bg-surface rounded-lg max-w-2xl w-full max-h-[32rem] overflow-y-auto shadow-overlay"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex gap-6">
                {/* Poster */}
                <div className="flex-shrink-0 w-32 h-48 bg-surface-raised rounded-md overflow-hidden flex items-center justify-center">
                  {getPosterUrl(modalFilme.poster_path) ? (
                    <img
                      src={getPosterUrl(modalFilme.poster_path)!}
                      alt={modalFilme.titulo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white/40 text-xs text-center px-2 font-body">Sem imagem</span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-display font-bold text-white">
                        {modalFilme.titulo}
                      </h2>
                      {modalFilme.titulo_original && (
                        <p className="text-white/50 font-body">{modalFilme.titulo_original}</p>
                      )}
                    </div>
                    <button
                      onClick={fecharModal}
                      className="text-2xl text-white/40 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Meta */}
                  <div className="space-y-2 mb-4 text-sm font-body">
                    {modalFilme.data_lancamento && (
                      <p className="text-white/70">
                        <span className="font-semibold text-white">Lançamento:</span>{' '}
                        {new Date(modalFilme.data_lancamento).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                    {modalFilme.nota_tmdb && (
                      <p className="text-white/70">
                        <span className="font-semibold text-white">Nota TMDB:</span>{' '}
                        <span className="text-tertiary">⭐ {modalFilme.nota_tmdb.toFixed(1)}/10</span>
                      </p>
                    )}
                    {modalFilme.generos.length > 0 && (
                      <p className="text-white/70">
                        <span className="font-semibold text-white">Gêneros:</span>{' '}
                        {modalFilme.generos.join(', ')}
                      </p>
                    )}
                  </div>

                  {/* Sinopse */}
                  {modalFilme.sinopse && (
                    <div className="mb-4">
                      <p className="text-white/70 text-sm leading-relaxed font-body">
                        {modalFilme.sinopse}
                      </p>
                    </div>
                  )}

                  {/* Feedback */}
                  {feedback && (
                    <div
                      className={`mb-4 px-4 py-2 rounded-md text-sm font-body ${
                        feedback.tipo === 'sucesso'
                          ? 'bg-green-600/20 border border-green-600 text-green-300'
                          : feedback.tipo === 'erro'
                          ? 'bg-red-600/20 border border-red-600 text-red-300'
                          : 'bg-secondary/20 border border-secondary text-secondary'
                      }`}
                    >
                      {feedback.texto}
                    </div>
                  )}

                  {/* Ações */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAlugar}
                      className="px-6 py-2.5 bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-full font-body font-bold text-sm transition-colors"
                    >
                      🎬 Alugar
                    </button>
                    <button
                      onClick={handleReservar}
                      disabled={reservando}
                      className="px-6 py-2.5 bg-transparent border-2 border-primary hover:bg-primary/10 disabled:opacity-40 disabled:cursor-not-allowed text-primary rounded-full font-body font-bold text-sm transition-colors"
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
      <footer className="border-t border-white/10 mt-16 py-8 bg-surface">
        <div className="max-w-7xl mx-auto px-4 text-center text-white/40 text-sm font-body">
          <p>Dados cinematográficos: TMDB. Este produto usa a API TMDB sem endosso.</p>
        </div>
      </footer>
    </div>
  );
}
