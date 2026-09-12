// Tipos gerados do Supabase (para usar enquanto não conectar)

export interface Filme {
  id: string;
  chave_externa: string;
  id_tmdb: number;
  titulo: string;
  titulo_original: string | null;
  sinopse: string | null;
  data_lancamento: string | null;
  generos: string[];
  nota_tmdb: number | null;
  votos_tmdb: number | null;
  classificacao_adulto: boolean;
  status_tmdb: string | null;
  poster_path: string | null;
  ativo: boolean;
  dados_origem: Record<string, any>;
  importado_em: string;
}

export interface Exemplar {
  id: string;
  filme_id: string;
  codigo: string;
  formato_midia: string | null;
  formato_simulado: boolean;
  ativo: boolean;
}

export interface Cliente {
  id: string;
  nome: string;
  email: string;
  telefone: string | null;
  ativo: boolean;
  auth_user_id: string | null;
}

export interface Locacao {
  id: string;
  cliente_id: string;
  exemplar_id: string;
  retirada_em: string;
  vencimento: string;
  preco_centavos: number;
  multa_dia_centavos: number;
  devolvida_em: string | null;
  dias_atraso: number | null;
  multa_centavos: number | null;
}

export interface Reserva {
  id: string;
  cliente_id: string;
  exemplar_id: string;
  criada_em: string;
  expira_em: string;
  cancelada_em: string | null;
  consumida_por_locacao: string | null;
}

export interface Usuario {
  id: string;
  email: string;
  email_confirmed_at: string | null;
}

export interface Administrador {
  id: string;
  auth_user_id: string;
}
