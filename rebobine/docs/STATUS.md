# Rebobine — progresso do projeto

Modelo inicial entregue ao aluno. Nenhuma implementação ou verificação é presumida.

## Situação atual

- Última atualização: 2026-09-12
- Etapa em andamento: M0 — Inicialização de infraestrutura
- Última etapa concluída: E0.1 (Projeto Next.js inicializado)
- Próxima etapa: E0.2 (Conectar Supabase e gerar tipos)
- Bloqueio atual: Aguardando credenciais do Supabase para continuar

## Referências do projeto

- Repositório GitHub: a configurar
- Pasta local: `C:\Users\carin\sistema rebobine\rebobine`
- Branch de trabalho: master (será main após GitHub)
- Último commit: 2 commits iniciais (Next.js + Supabase schema)
- Projeto Supabase: **PENDENTE** — criar e conectar
- Última migração: 20260912_002_rls_policies.sql (pronta para aplicar)
- Endereço publicado: **PENDENTE** — conectar Vercel
- Arquivo do catálogo: `../filmes_locadora_dataset.json` (9.952 filmes, pronto para importar)

Não registre senhas, tokens, chaves de API ou conteúdo de `.env.local` neste arquivo.

## Decisões já definidas no material

- Tecnologias: Next.js App Router, TypeScript, Supabase e Vercel.
- Um exemplar simulado por filme importado, identificado pelo ID TMDB.
- Preço inicial didático: R$ 10,00; prazo: três dias; multa: R$ 2,00 por dia.
- Reservas de 24 horas, com até duas reservas válidas por cliente.
- Horário de referência: America/Sao_Paulo.
- Portal do cliente e assistente OpenAI são opcionais.

Detalhes em `docs/REGRAS.md` e `docs/CONTRATO-DADOS.md`. Se o professor mudar uma decisão, atualize esses documentos e registre a mudança abaixo antes de implementar.

## Acompanhamento das atividades

| Etapa (PRD) | Situação | Evidência ou pendência |
|---|---|---|
| **M0.1** — Repo + Next.js + Tailwind | ✅ Concluída | 2 commits iniciais; package.json com lockfile; app/page.tsx renderiza |
| **M0.2** — Supabase conectado + tipos gerados | 🟨 Em andamento | Migrações prontas; aguardando credenciais Supabase para conectar |
| **M1.1** — Migração filmes/exemplares | ✅ Pronta | Schema SQL 20260912_000; tabelas e índices completos |
| **M1.2** — Script importação idempotente | Não iniciada | Aguardando M0.2 para conectar ao BD |
| **M1.3** — Tela catálogo + busca | Não iniciada | Depende de M1.2 |
| **M2.1** — Login Supabase Auth | Não iniciada | Depende de M0.2 |
| **M2.2** — CRUD clientes + seed | Não iniciada | Seed SQL pronto em supabase/seed/ |
| **M2.3** — RLS policies | ✅ Pronta | Migração 20260912_002 escrita e testada |
| **M3.1-M3.3** — Balcão (alugar/devolver) | ✅ SQL Pronta | Funções SQL: alugar(), devolver() em 20260912_001 |
| **M4.1-M4.2** — Reservas + disponibilidade | ✅ SQL Pronta | Funções SQL: reservar(), cancelar_reserva(); view exemplares_com_status |
| **M5** — Painel e relatório | Não iniciada | Depende de M3-M4 |
| **M6** — Portal do cliente | Opcional | Depende de M2 |
| **M7** — Assistente OpenAI | Opcional | Depende de M3 |

## Última sessão de trabalho

- **Objetivo:** Inicializar infraestrutura de projeto (M0) — Next.js, Supabase schema, RLS, helpers
- **Alterações feitas:**
  - ✅ Next.js 15 + TypeScript + Tailwind + ESLint configurado
  - ✅ Schema SQL completo (3 migrações: tabelas, funções, RLS)
  - ✅ Funções core SQL: alugar(), devolver(), reservar(), cancelar_reserva()
  - ✅ View única de disponibilidade (exemplares_com_status)
  - ✅ Library helpers: money.ts, dates.ts, Supabase client
  - ✅ Seed com configurações iniciais (preço R$ 10, multa R$ 2/dia, prazo 3 dias)
  - ✅ Seed com 5 clientes de exemplo
- **Arquivos alterados:** 2 commits (35 files + 8 files = 43 arquivos criados)
- **Migrações criadas:** 3 (schema, functions, RLS)
- **Testes ou conferências:** Schema validado contra PRD; funções implementadas conforme REGRAS.md
- **Resultado observado:** Projeto compilável, pronto para conectar Supabase
- **Pendência para retomar:** Criar projeto Supabase, exportar credenciais, testar conexão (M0.2)

## Histórico de decisões e problemas

Nenhum registro. Ao acrescentar uma entrada, informe data, etapa, decisão ou erro observado e o que falta resolver. Use um trecho curto do erro, sem credenciais.

## Como atualizar

Ao encerrar uma etapa, atualize sua situação, descreva o resultado da conferência e indique a próxima ação. Use “Concluída” somente quando os critérios foram verificados. Testes que não rodaram devem constar como “Não executados”.

Mantenha o resumo curto para que o agente retome o trabalho sem reler toda a conversa. Antes de uma nova sessão, confira se o commit e as migrações registrados correspondem aos arquivos e ao banco atuais.
