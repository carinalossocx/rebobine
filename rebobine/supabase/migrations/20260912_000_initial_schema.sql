-- Enable extensions
create extension if not exists "uuid-ossp";

-- Create enum for locacao status
create type locacao_status as enum ('aberta', 'encerrada');
create type reserva_status as enum ('ativa', 'cancelada', 'consumida', 'expirada');

-- Filmes (from TMDB)
create table filmes (
  id uuid primary key default uuid_generate_v4(),
  chave_externa text unique not null, -- 'tmdb:597'
  id_tmdb int unique not null,
  titulo text,
  titulo_original text,
  sinopse text,
  data_lancamento date,
  generos text[] default '{}',
  nota_tmdb numeric,
  votos_tmdb int,
  classificacao_adulto boolean default false,
  status_tmdb text, -- 'Lançado', etc
  poster_path text,
  ativo boolean default false,
  dados_origem jsonb,
  importado_em timestamptz default now(),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Exemplares (1 per filme)
create table exemplares (
  id uuid primary key default uuid_generate_v4(),
  filme_id uuid unique not null references filmes(id) on delete cascade,
  codigo text unique not null, -- 'EX-000597'
  formato_midia text,
  formato_simulado boolean default false,
  ativo boolean default true,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Administradores
create table administradores (
  id uuid primary key,
  auth_user_id uuid unique not null,
  criado_em timestamptz default now()
);

-- Clientes
create table clientes (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text unique not null,
  telefone text,
  ativo boolean default true,
  auth_user_id uuid unique,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- Configurações
create table configuracoes (
  chave text primary key,
  valor_int int not null,
  descricao text,
  atualizado_em timestamptz default now()
);

-- Locações
create table locacoes (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid not null references clientes(id) on delete restrict,
  exemplar_id uuid not null references exemplares(id) on delete restrict,
  retirada_em timestamptz not null default now(),
  vencimento date not null,
  preco_centavos int not null,
  multa_dia_centavos int not null,
  devolvida_em timestamptz,
  dias_atraso int,
  multa_centavos int,
  criado_por uuid references administradores(id),
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now(),

  -- Constraint: um exemplar não pode estar em duas locações abertas
  constraint locacoes_abertas_unq unique (exemplar_id) where devolvida_em is null
);

-- Reservas
create table reservas (
  id uuid primary key default uuid_generate_v4(),
  cliente_id uuid not null references clientes(id) on delete restrict,
  exemplar_id uuid not null references exemplares(id) on delete restrict,
  criada_em timestamptz not null default now(),
  expira_em timestamptz not null,
  cancelada_em timestamptz,
  consumida_por_locacao uuid references locacoes(id),
  atualizado_em timestamptz default now()
);

-- Índices
create index idx_filmes_id_tmdb on filmes(id_tmdb);
create index idx_filmes_ativo on filmes(ativo);
create index idx_exemplares_filme_id on exemplares(filme_id);
create index idx_exemplares_ativo on exemplares(ativo);
create index idx_locacoes_cliente_id on locacoes(cliente_id);
create index idx_locacoes_exemplar_id on locacoes(exemplar_id);
create index idx_locacoes_devolvida_em on locacoes(devolvida_em);
create index idx_reservas_cliente_id on reservas(cliente_id);
create index idx_reservas_exemplar_id on reservas(exemplar_id);
create index idx_reservas_expira_em on reservas(expira_em);

-- Comentários
comment on table filmes is 'Catálogo de filmes importado do TMDB';
comment on table exemplares is 'Exemplares físicos (1 por filme na aula)';
comment on table administradores is 'Administradores do balcão';
comment on table clientes is 'Clientes da locadora';
comment on table configuracoes is 'Configurações de preço, multa, prazo';
comment on table locacoes is 'Histórico imutável de locações e devoluções';
comment on table reservas is 'Reservas de exemplares (24h)';
