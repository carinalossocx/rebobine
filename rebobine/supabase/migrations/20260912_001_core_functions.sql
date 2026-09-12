-- View: exemplares com status (disponibilidade única)
create view exemplares_com_status as
select
  e.id,
  e.filme_id,
  e.codigo,
  e.formato_midia,
  e.formato_simulado,
  e.ativo,
  f.ativo as filme_ativo,
  case
    when not e.ativo or not f.ativo then 'inativo'
    when exists (
      select 1 from locacoes l
      where l.exemplar_id = e.id and l.devolvida_em is null
    ) then 'alugado'
    when exists (
      select 1 from reservas r
      where r.exemplar_id = e.id
        and r.cancelada_em is null
        and r.consumida_por_locacao is null
        and r.expira_em > now()
    ) then 'reservado'
    else 'disponivel'
  end as situacao
from exemplares e
join filmes f on e.filme_id = f.id;

comment on view exemplares_com_status is
  'Visão única de disponibilidade: reutilizada por balcão, busca e painel';

-- Function: exemplar_disponivel(exemplar_id)
create or replace function exemplar_disponivel(ex_id uuid)
returns boolean
language sql
stable
as $$
  select situacao = 'disponivel' from exemplares_com_status where id = ex_id;
$$;

comment on function exemplar_disponivel(uuid) is
  'Verifica se um exemplar está disponível para locação';

-- Function: alugar(cliente_id, exemplar_id)
-- Valida tudo, consome reserva, insere locação em transação
create or replace function alugar(
  p_cliente_id uuid,
  p_exemplar_id uuid,
  p_admin_id uuid
)
returns table (
  locacao_id uuid,
  preco_centavos int,
  multa_dia_centavos int,
  vencimento date,
  erro text
)
language plpgsql
as $$
declare
  v_preco int;
  v_multa_dia int;
  v_prazo int;
  v_vencimento date;
  v_reserva_id uuid;
  v_locacao_id uuid;
begin
  -- 1. Admin é administrador?
  if not exists (select 1 from administradores where id = p_admin_id) then
    return query select null, null, null, null, 'ADMIN_NAO_AUTORIZADO'::text;
    return;
  end if;

  -- 2. Cliente existe e ativo?
  if not exists (select 1 from clientes where id = p_cliente_id and ativo = true) then
    return query select null, null, null, null, 'CLIENTE_INATIVO_OU_INEXISTENTE'::text;
    return;
  end if;

  -- 3. Filme e exemplar ativos?
  if not exists (
    select 1 from exemplares e
    join filmes f on e.filme_id = f.id
    where e.id = p_exemplar_id and e.ativo = true and f.ativo = true
  ) then
    return query select null, null, null, null, 'EXEMPLAR_INATIVO'::text;
    return;
  end if;

  -- 4. Exemplar disponível? (sem locação aberta nem reserva válida de outro)
  if not exemplar_disponivel(p_exemplar_id) then
    return query select null, null, null, null, 'EXEMPLAR_INDISPONIVEL'::text;
    return;
  end if;

  -- Obter configurações
  select valor_int into v_preco from configuracoes where chave = 'preco_centavos';
  select valor_int into v_multa_dia from configuracoes where chave = 'multa_dia_centavos';
  select valor_int into v_prazo from configuracoes where chave = 'prazo_dias';

  -- Calcular vencimento (data local em America/Sao_Paulo)
  v_vencimento := (now() at time zone 'America/Sao_Paulo')::date + v_prazo;

  -- 5. Consumir reserva do próprio cliente se existir
  select id into v_reserva_id
  from reservas
  where cliente_id = p_cliente_id
    and exemplar_id = p_exemplar_id
    and cancelada_em is null
    and consumida_por_locacao is null
    and expira_em > now()
  limit 1;

  -- Inserir locação
  insert into locacoes (
    cliente_id, exemplar_id, vencimento,
    preco_centavos, multa_dia_centavos,
    criado_por
  )
  values (p_cliente_id, p_exemplar_id, v_vencimento, v_preco, v_multa_dia, p_admin_id)
  returning locacoes.id into v_locacao_id;

  -- Marcar reserva como consumida se existia
  if v_reserva_id is not null then
    update reservas
    set consumida_por_locacao = v_locacao_id
    where id = v_reserva_id;
  end if;

  -- Retornar sucesso
  return query select v_locacao_id, v_preco, v_multa_dia, v_vencimento, null::text;
end;
$$;

comment on function alugar(uuid, uuid, uuid) is
  'Autentica admin, valida cliente/exemplar, consome reserva e cria locação em transação';

-- Function: devolver(locacao_id)
-- Idempotente: retorna resultado já salvo se já devolvida
create or replace function devolver(p_locacao_id uuid)
returns table (
  locacao_id uuid,
  dias_atraso int,
  multa_centavos int,
  erro text
)
language plpgsql
as $$
declare
  v_dias_atraso int;
  v_multa int;
  v_vencimento date;
  v_multa_dia int;
  v_local_today date;
begin
  -- Buscar locação (para verificar se já está encerrada)
  select l.vencimento, l.multa_dia_centavos, l.devolvida_em, l.dias_atraso, l.multa_centavos
  into v_vencimento, v_multa_dia, (select devolvida_em), v_dias_atraso, v_multa
  from locacoes l where l.id = p_locacao_id;

  if not found then
    return query select null, null, null, 'LOCACAO_NAO_ENCONTRADA'::text;
    return;
  end if;

  -- Se já devolvida, retornar resultado salvo
  if (select devolvida_em from locacoes where id = p_locacao_id) is not null then
    return query
    select p_locacao_id, v_dias_atraso, v_multa, null::text;
    return;
  end if;

  -- Calcular atraso
  v_local_today := (now() at time zone 'America/Sao_Paulo')::date;
  v_dias_atraso := greatest(0, v_local_today - v_vencimento);
  v_multa := v_dias_atraso * v_multa_dia;

  -- Atualizar locação
  update locacoes
  set
    devolvida_em = now(),
    dias_atraso = v_dias_atraso,
    multa_centavos = v_multa,
    atualizado_em = now()
  where id = p_locacao_id;

  return query select p_locacao_id, v_dias_atraso, v_multa, null::text;
end;
$$;

comment on function devolver(uuid) is
  'Registra devolução com cálculo de atraso e multa; idempotente';

-- Function: reservar(cliente_id, exemplar_id)
create or replace function reservar(
  p_cliente_id uuid,
  p_exemplar_id uuid
)
returns table (
  reserva_id uuid,
  expira_em timestamptz,
  erro text
)
language plpgsql
as $$
declare
  v_reserva_horas int;
  v_expira_em timestamptz;
  v_reserva_id uuid;
  v_count_ativas int;
begin
  -- Cliente existe e ativo?
  if not exists (select 1 from clientes where id = p_cliente_id and ativo = true) then
    return query select null, null, 'CLIENTE_INATIVO_OU_INEXISTENTE'::text;
    return;
  end if;

  -- Exemplar disponível?
  if not exemplar_disponivel(p_exemplar_id) then
    return query select null, null, 'EXEMPLAR_INDISPONIVEL'::text;
    return;
  end if;

  -- Contar reservas ativas do cliente
  select count(*) into v_count_ativas
  from reservas r
  where r.cliente_id = p_cliente_id
    and r.cancelada_em is null
    and r.consumida_por_locacao is null
    and r.expira_em > now();

  if v_count_ativas >= 2 then
    return query select null, null, 'LIMITE_RESERVAS_ATINGIDO'::text;
    return;
  end if;

  -- Obter horas de validade
  select valor_int into v_reserva_horas from configuracoes where chave = 'reserva_horas';
  v_expira_em := now() + (v_reserva_horas || ' hours')::interval;

  -- Criar reserva
  insert into reservas (cliente_id, exemplar_id, expira_em)
  values (p_cliente_id, p_exemplar_id, v_expira_em)
  returning reservas.id into v_reserva_id;

  return query select v_reserva_id, v_expira_em, null::text;
end;
$$;

comment on function reservar(uuid, uuid) is
  'Cria reserva se cliente ativo, exemplar disponível e limite de 2 não atingido';

-- Function: cancelar_reserva(reserva_id)
create or replace function cancelar_reserva(p_reserva_id uuid)
returns table (
  reserva_id uuid,
  erro text
)
language plpgsql
as $$
begin
  if not exists (select 1 from reservas where id = p_reserva_id) then
    return query select null, 'RESERVA_NAO_ENCONTRADA'::text;
    return;
  end if;

  update reservas
  set cancelada_em = now(), atualizado_em = now()
  where id = p_reserva_id and cancelada_em is null;

  return query select p_reserva_id, null::text;
end;
$$;

comment on function cancelar_reserva(uuid) is
  'Cancela uma reserva ativa';
