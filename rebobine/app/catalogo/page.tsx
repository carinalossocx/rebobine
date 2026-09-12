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
          <div className="animate-spin text-6xl mb-6">🎬</div>
          <p className="text-text-secondary font-body text-lg">Carregando catálogo...</p>
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
    <div className="min-h-screen bg-bg dark:bg-surface-dark-muted transition-colors duration-300">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <section className="mb-16">
          <div className="mb-8">
            <h1 className="text-display-lg font-display font-bold text-text-primary dark:text-text-dark-primary mb-3">
              Catálogo Rebobine
            </h1>
            <p className="text-body-lg text-text-secondary dark:text-text-dark-secondary font-body">
              Descubra {filmesAtivos.length} filmes incríveis para alugar
              {filtrados.length !== filmesAtivos.length && ` (${filtrados.length} exibidos)`}
            </p>
          </div>

          {/* Busca + Filtro */}
          <div className="relative" ref={filtroRef}>
            <div className="flex gap-3 items-stretch">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Buscar por título..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onFocus={() => setFiltroAberto(true)}
                  className="w-full h-12 pl-5 pr-12 bg-surface dark:bg-surface-dark text-text-primary dark:text-text-dark-primary rounded-sm border border-border dark:border-border-dark focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/15 transition font-body placeholder:text-text-tertiary dark:placeholder:text-text-dark-tertiary"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary dark:text-text-dark-tertiary pointer-events-none text-lg">
                  🔍
                </span>
              </div>

              <button
                onClick={() => setFiltroAberto((v) => !v)}
                aria-expanded={filtroAberto}
                className={`px-6 py-3 rounded-sm border font-body font-bold text-sm transition whitespace-nowrap flex items-center gap-2 ${
                  filtroAtivo
                    ? 'bg-primary dark:bg-primary-dark border-primary text-white hover:bg-primary-hover dark:hover:bg-primary'
                    : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark text-text-primary dark:text-text-dark-primary hover:bg-surface-light dark:hover:bg-surface-dark-light'
                }`}
              >
                Filtros
                {filtroAtivo && (
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                )}
              </button>
            </div>

            {/* Filter Panel - Dropdown */}
            {filtroAberto && (
              <div className="absolute left-0 right-0 mt-3 z-30 bg-surface border border-border rounded-sm shadow-large p-6 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-body-sm font-body font-bold text-text-primary">
                    Filtrar por gênero
                  </label>
                  {generoSelecionado !== 'Todos' && (
                    <button
                      onClick={() => setGeneroSelecionado('Todos')}
                      className="text-caption font-body font-bold text-primary hover:text-primary-hover transition"
                    >
                      Limpar filtro
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {generos.map((genero) => (
                    <button
                      key={genero}
                      onClick={() => {
                        setGeneroSelecionado(genero);
                        setFiltroAberto(false);
                      }}
                      className={`px-4 py-2.5 rounded-full text-caption font-body font-bold transition border ${
                        generoSelecionado === genero
                          ? 'bg-primary border-primary text-white'
                          : 'bg-surface-light border-border text-text-secondary hover:bg-surface-muted'
                      }`}
                    >
                      {genero}
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-3 text-text-primary font-body text-body-sm border-t border-border pt-4">
                  <input
                    type="checkbox"
                    checked={soDisponivel}
                    onChange={(e) => setSoDisponivel(e.target.checked)}
                    className="w-5 h-5 accent-primary rounded-xs cursor-pointer"
                  />
                  <span className="font-medium">Apenas disponíveis</span>
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

        {/* Search Results Grid */}
        {(busca || generoSelecionado !== 'Todos') && (
          <section className="mb-16">
            <h2 className="text-subhead font-display font-bold text-text-primary mb-8">
              Resultados
              {filtrados.length > 0 && (
                <span className="text-body-lg font-body text-text-secondary ml-2">
                  ({filtrados.length} {filtrados.length === 1 ? 'filme' : 'filmes'})
                </span>
              )}
            </h2>
            {filtrados.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
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
              <div className="text-center py-20">
                <p className="text-body-lg text-text-secondary font-body">
                  Nenhum filme encontrado. Tente ajustar seus filtros.
                </p>
              </div>
            )}
          </section>
        )}
      </main>

      {/* Movie Detail Modal */}
      {modalFilme && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={fecharModal}
        >
          <div
            className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-overlay border border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-surface border-b border-border p-4 flex justify-between items-center">
              <h2 className="text-headline font-display font-bold text-text-primary">
                Detalhes do Filme
              </h2>
              <button
                onClick={fecharModal}
                className="text-2xl text-text-tertiary hover:text-text-secondary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="flex gap-6 mb-6">
                {/* Poster */}
                <div className="flex-shrink-0 w-40 h-56 bg-surface-muted rounded-md overflow-hidden flex items-center justify-center shadow-medium">
                  {getPosterUrl(modalFilme.poster_path) ? (
                    <img
                      src={getPosterUrl(modalFilme.poster_path)!}
                      alt={modalFilme.titulo}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-text-tertiary text-xs text-center px-2 font-body">Sem imagem</span>
                  )}
                </div>

                {/* Film Info */}
                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-headline font-display font-bold text-text-primary mb-1">
                      {modalFilme.titulo}
                    </h3>
                    {modalFilme.titulo_original && (
                      <p className="text-body-sm text-text-secondary font-body italic">{modalFilme.titulo_original}</p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-3 mb-6 border-b border-border pb-6">
                    {modalFilme.data_lancamento && (
                      <div>
                        <p className="text-caption font-body font-bold text-text-tertiary mb-1">
                          LANÇAMENTO
                        </p>
                        <p className="text-body-sm font-body text-text-primary">
                          {new Date(modalFilme.data_lancamento).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    )}
                    {modalFilme.nota_tmdb && (
                      <div>
                        <p className="text-caption font-body font-bold text-text-tertiary mb-1">
                          AVALIAÇÃO
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-tertiary text-lg">⭐</span>
                          <span className="text-body-md font-body font-bold text-text-primary">
                            {modalFilme.nota_tmdb.toFixed(1)}/10
                          </span>
                        </div>
                      </div>
                    )}
                    {modalFilme.generos.length > 0 && (
                      <div>
                        <p className="text-caption font-body font-bold text-text-tertiary mb-2">
                          GÊNEROS
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {modalFilme.generos.map((g) => (
                            <span key={g} className="bg-surface-light text-text-primary px-3 py-1.5 rounded-full text-caption font-body font-medium">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Synopsis */}
                  {modalFilme.sinopse && (
                    <div className="mb-6">
                      <p className="text-caption font-body font-bold text-text-tertiary mb-2">
                        SINOPSE
                      </p>
                      <p className="text-body-md text-text-secondary leading-relaxed font-body">
                        {modalFilme.sinopse}
                      </p>
                    </div>
                  )}

                  {/* Feedback Message */}
                  {feedback && (
                    <div
                      className={`mb-6 px-4 py-3 rounded-sm text-sm font-body border ${
                        feedback.tipo === 'sucesso'
                          ? 'bg-success/10 border-success text-success'
                          : feedback.tipo === 'erro'
                          ? 'bg-error/10 border-error text-error'
                          : 'bg-info/10 border-info text-info'
                      }`}
                    >
                      {feedback.texto}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleAlugar}
                      className="px-6 py-3 bg-primary hover:bg-primary-hover active:bg-primary-active text-white rounded-full font-body font-bold text-body-sm transition-colors shadow-subtle hover:shadow-medium"
                    >
                      🎬 Alugar
                    </button>
                    <button
                      onClick={handleReservar}
                      disabled={reservando}
                      className="px-6 py-3 bg-transparent border-2 border-primary text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed rounded-full font-body font-bold text-body-sm transition-colors"
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

      {/* Footer */}
      <footer className="border-t border-border dark:border-border-dark mt-20 py-12 bg-surface dark:bg-surface-dark transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4">
          <p className="text-center text-text-tertiary dark:text-text-dark-tertiary text-caption font-body">
            Dados cinematográficos fornecidos por TMDB. Este produto usa a API TMDB sem endosso oficial.
          </p>
        </div>
      </footer>
    </div>
  );
}
