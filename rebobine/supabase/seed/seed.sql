-- Seed: configurações iniciais
insert into configuracoes (chave, valor_int, descricao)
values
  ('preco_centavos', 1000, 'Preço da locação em centavos (R$ 10,00)'),
  ('multa_dia_centavos', 200, 'Multa diária em centavos (R$ 2,00/dia)'),
  ('prazo_dias', 3, 'Prazo de locação em dias'),
  ('reserva_horas', 24, 'Validade da reserva em horas')
on conflict (chave) do update
set valor_int = excluded.valor_int;

-- Seed: clientes de exemplo
insert into clientes (nome, email, telefone, ativo)
values
  ('Ana Souza', 'ana@exemplo.com', '(11) 98765-4321', true),
  ('Carlos Lima', 'carlos@exemplo.com', '(21) 99876-5432', true),
  ('Marina Costa', 'marina@exemplo.com', '(31) 98765-4322', true),
  ('Roberto Silva', 'roberto@exemplo.com', '(41) 97654-3210', true),
  ('Fernanda Oliveira', 'fernanda@exemplo.com', '(51) 96543-2109', true)
on conflict (email) do nothing;

-- Nota: Primeiro administrador é inserido durante a migração inicial do projeto,
-- não via seed. Use Supabase console ou CLI para criar o primeiro admin.
