import { Filme } from './types';

/**
 * Carrega catálogo do Supabase. Fallback para JSON local se Supabase falhar.
 */

let cachedCatalog: Filme[] | null = null;

export async function carregarCatalogo(): Promise<Filme[]> {
  if (cachedCatalog) return cachedCatalog;

  try {
    const res = await fetch('/api/catalogo');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    cachedCatalog = data.filmes || [];
    return cachedCatalog!;
  } catch (erro) {
    console.error('Erro ao carregar catálogo do Supabase, usando fallback JSON:', erro);
    return carregarCatalogoFallback();
  }
}

async function carregarCatalogoFallback(): Promise<Filme[]> {
  try {
    if (typeof window !== 'undefined') {
      const res = await fetch('/dados/filmes_locadora_dataset.json');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      cachedCatalog = transformarDadosTMDB(data.filmes || []);
    } else {
      const fs = await import('fs/promises');
      const path = await import('path');
      const caminhoJSON = path.join(process.cwd(), 'public', 'dados', 'filmes_locadora_dataset.json');
      const conteudo = await fs.readFile(caminhoJSON, 'utf-8');
      const data = JSON.parse(conteudo);
      cachedCatalog = transformarDadosTMDB(data.filmes || []);
    }
    return cachedCatalog!;
  } catch (erro) {
    console.error('Erro ao carregar catálogo (fallback):', erro);
    return [];
  }
}

function transformarDadosTMDB(filmes: any[]): Filme[] {
  return filmes
    .filter((f) => (f.id_tmdb || f.id_wikidata) && (f.title || f.titulo))
    .map((f) => {
      const id_base = f.id_tmdb || f.id_wikidata || '';
      const titulo = f.title || f.titulo || '';
      const ano = f.release_date ? new Date(f.release_date).getFullYear() : f.ano_lancamento;
      return {
        id: `${f.id_tmdb ? 'tmdb' : 'wikidata'}-${id_base}`,
        chave_externa: `${f.id_tmdb ? 'tmdb' : 'wikidata'}:${id_base}`,
        id_tmdb: f.id_tmdb || id_base,
        titulo,
        titulo_original: f.original_title || f.titulo_original || null,
        sinopse: f.overview || f.sinopse || null,
        data_lancamento: f.release_date || (ano ? `${ano}-01-01` : null),
        generos: f.genres || f.generos || [],
        nota_tmdb: f.vote_average || f.classificacao || null,
        votos_tmdb: f.vote_count || null,
        classificacao_adulto: f.adult || false,
        status_tmdb: f.status || null,
        poster_path: f.poster_path || f.imagem_url || null,  // Pode ser URL completa ou ID TMDB
        ativo: Boolean((f.release_date || f.ano_lancamento) && !f.adult),
        dados_origem: f,
        importado_em: new Date().toISOString(),
      };
    });
}

export function filtrarPorGenero(filmes: Filme[], genero: string): Filme[] {
  if (!genero || genero === 'Todos') return filmes;
  return filmes.filter((f) =>
    f.generos.some((g) => g.toLowerCase() === genero.toLowerCase())
  );
}

export function filtrarPorBusca(filmes: Filme[], termo: string): Filme[] {
  if (!termo) return filmes;
  const t = termo.toLowerCase();
  return filmes.filter(
    (f) =>
      f.titulo.toLowerCase().includes(t) ||
      f.titulo_original?.toLowerCase().includes(t)
  );
}

export function obterGenerosCatalogo(filmes: Filme[]): string[] {
  const generos = new Set<string>();
  filmes.forEach((f) => f.generos.forEach((g) => generos.add(g)));
  return Array.from(generos).sort();
}

export function obterFilmesAtivos(filmes: Filme[]): Filme[] {
  return filmes.filter((f) => f.ativo);
}
