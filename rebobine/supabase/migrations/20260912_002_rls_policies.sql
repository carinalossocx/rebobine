-- Enable RLS on all tables
alter table filmes enable row level security;
alter table exemplares enable row level security;
alter table administradores enable row level security;
alter table clientes enable row level security;
alter table configuracoes enable row level security;
alter table locacoes enable row level security;
alter table reservas enable row level security;

-- Helper function to check if user is admin
create or replace function is_admin(auth_uid uuid)
returns boolean
language sql
stable
as $$
  select exists (select 1 from administradores where auth_user_id = auth_uid);
$$;

-- filmes: SELECT by admin or authenticated client (if filme.ativo)
create policy "Filmes: admin vê tudo" on filmes
  for select using (is_admin(auth.uid()));

create policy "Filmes: cliente vê ativos" on filmes
  for select using (
    auth.role() = 'authenticated' and ativo = true
  );

-- exemplares: SELECT by admin or authenticated client (if filme.ativo)
create policy "Exemplares: admin vê tudo" on exemplares
  for select using (is_admin(auth.uid()));

create policy "Exemplares: cliente vê ativos" on exemplares
  for select using (
    auth.role() = 'authenticated'
    and ativo = true
    and exists (select 1 from filmes f where f.id = filme_id and f.ativo = true)
  );

-- administradores: cada admin vê só a si mesmo; escrita via migração/service role
create policy "Admin: vê a si mesmo" on administradores
  for select using (auth.uid() = auth_user_id);

create policy "Admin: ninguém insere" on administradores
  for insert with check (false);

create policy "Admin: ninguém deleta" on administradores
  for delete using (false);

create policy "Admin: ninguém atualiza" on administradores
  for update using (false);

-- clientes: admin vê tudo; cliente vê apenas a si mesmo
create policy "Clientes: admin vê tudo" on clientes
  for select using (is_admin(auth.uid()));

create policy "Clientes: cliente vê a si mesmo" on clientes
  for select using (
    auth.role() = 'authenticated'
    and auth.uid() = auth_user_id
  );

-- configuracoes: todos autenticados leem; apenas admin escreve
create policy "Config: autenticados leem" on configuracoes
  for select using (auth.role() = 'authenticated');

create policy "Config: admin escreve" on configuracoes
  for update using (is_admin(auth.uid()));

create policy "Config: admin cria" on configuracoes
  for insert with check (is_admin(auth.uid()));

-- locacoes: admin vê tudo; cliente vê suas próprias
create policy "Locações: admin vê tudo" on locacoes
  for select using (is_admin(auth.uid()));

create policy "Locações: cliente vê suas" on locacoes
  for select using (
    auth.role() = 'authenticated'
    and cliente_id in (
      select id from clientes where auth_user_id = auth.uid()
    )
  );

-- reservas: admin vê tudo; cliente vê suas próprias
create policy "Reservas: admin vê tudo" on reservas
  for select using (is_admin(auth.uid()));

create policy "Reservas: cliente vê suas" on reservas
  for select using (
    auth.role() = 'authenticated'
    and cliente_id in (
      select id from clientes where auth_user_id = auth.uid()
    )
  );

comment on function is_admin(uuid) is
  'Helper para verificar permissões de admin em políticas RLS';
