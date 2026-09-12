import { Filme } from './types';

/**
 * Carrega catálogo do arquivo JSON.
 * Futuramente virá do Supabase.
 */

let cachedCatalog: Filme[] | null = null;

export async function carregarCatalogo(): Promise<Filme[]> {
  if (cachedCatalog) return cachedCatalog;

  try {
    // No cliente, usar fetch; no servidor, usar readFile
    if (typeof window !== 'undefined') {
      const res = await fetch('/dados/filmes_locadora_dataset.json');
      const data = await res.json();
      cachedCatalog = transformarDadosTMDB(data.filmes || []);
    } else {
      // Servidor: ler do filesystem
      const fs = await import('fs/promises');
      const path = await import('path');
      const caminhoJSON = path.join(process.cwd(), '..', 'filmes_locadora_dataset.json');
      const conteudo = await fs.readFile(caminhoJSON, 'utf-8');
      const data = JSON.parse(conteudo);
      cachedCatalog = transformarDadosTMDB(data.filmes || []);
    }
    return cachedCatalog;
  } catch (erro) {
    console.error('Erro ao carregar catálogo:', erro);
    return [];
  }
}

function transformarDadosTMDB(filmes: any[]): Filme[] {
  return filmes
    .filter((f) => f.id_tmdb && f.title)
    .map((f) => ({
      id: `tmdb-${f.id_tmdb}`,
      chave_externa: `tmdb:${f.id_tmdb}`,
      id_tmdb: f.id_tmdb,
      titulo: f.title || '',
      titulo_original: f.original_title || null,
      sinopse: f.overview || null,
      data_lancamento: f.release_date || null,
      generos: f.genres || [],
      nota_tmdb: f.vote_average || null,
      votos_tmdb: f.vote_count || null,
      classificacao_adulto: f.adult || false,
      status_tmdb: f.status || null,
      poster_path: f.poster_path || null,
      ativo: Boolean(f.release_date && !f.adult),
      dados_origem: f,
      importado_em: new Date().toISOString(),
    }));
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
