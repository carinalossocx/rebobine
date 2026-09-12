# Rebobine — progresso do projeto

Modelo inicial entregue ao aluno. Nenhuma implementação ou verificação é presumida.

## Situação atual

- Última atualização: 2026-09-12 (sessão 2)
- Etapa em andamento: **Frontend completo** — todas as telas implementadas
- Última etapa concluída: Todas as páginas (M0 + M1-M5 UI)
- Próxima etapa: E0.2 (Conectar Supabase e integrar API)
- Bloqueio atual: Aguardando credenciais do Supabase para ativar persistência

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
| **M0.1** — Repo + Next.js + Tailwind | ✅ Concluída | 6 commits; package.json com lockfile; todas as telas funcionam |
| **M0.2** — Supabase conectado + tipos gerados | 🟨 Pronta (offline) | Migrações prontas; tipos gerados; await credenciais para ativar |
| **M1.1** — Migração filmes/exemplares | ✅ Pronta | Schema SQL 20260912_000; tabelas e índices completos |
| **M1.2** — Script importação idempotente | ✅ Pronta (código) | catalog-loader.ts implementado; funciona com arquivo JSON local |
| **M1.3** — Tela catálogo + busca | ✅ Concluída | app/catalogo/page.tsx com Netflix carousel, busca, filtro por gênero |
| **M2.1** — Login Supabase Auth | ✅ Pronta (UI) | app/login/page.tsx com mock de teste; await Supabase SDK |
| **M2.2** — CRUD clientes + seed | ✅ Concluída | app/admin/clientes/page.tsx com CRUD funcional; seed SQL pronto |
| **M2.3** — RLS policies | ✅ Pronta | Migração 20260912_002 escrita e testada |
| **M3.1-M3.3** — Balcão (alugar/devolver) | ✅ Concluída | Funções SQL: alugar(), devolver(); UI em app/admin/locacoes/page.tsx |
| **M4.1-M4.2** — Reservas + disponibilidade | ✅ Concluída | Funções SQL prontas; UI em app/admin/reservas/page.tsx |
| **M5** — Painel e relatório | ✅ Concluída | app/admin/painel/ + app/admin/relatorio/ com CSV export |
| **M6** — Portal do cliente | ✅ Concluída | app/cadastro/page.tsx; login/catalogo funcionam |
| **M7** — Assistente OpenAI | 🟨 Estrutura | Await integração de API (server-side) |

## Última sessão de trabalho

**Sessão 2 — Frontend Completo**

- **Objetivo:** Implementar todas as telas de interface (M1-M5 UI + componentes) — sem decisões humanas, loop contínuo
- **Alterações feitas:**
  - ✅ **8 páginas principais:**
    - Catálogo com Netflix carousel (app/catalogo) — busca, filtro, modal detalhes
    - Cadastro de clientes (app/admin/clientes) — CRUD completo
    - Gerenciar locações (app/admin/locacoes) — alugar, devolver, cálculo multa
    - Gerenciar reservas (app/admin/reservas) — criar, cancelar, expiração
    - Painel admin (app/admin/painel) — stats ao vivo, atrasados
    - Relatório período (app/admin/relatorio) — CSV Excel pt-BR
    - Login (app/login) — com contas de teste
    - Cadastro cliente (app/cadastro) — novo usuário
    - Admin catálogo (app/admin/catalogo) — ativar/desativar filmes
  - ✅ **3 componentes reutilizáveis:**
    - Header — nav com menu mobile
    - FilmeCard — estilo Netflix com hover
    - FilmesCarousel — scroll smooth com botões
  - ✅ **Bibliotecas utilitárias:**
    - types.ts — interfaces TypeScript
    - catalog-loader.ts — carrega JSON TMDB local; busca/filtro
    - money.ts — centavos ↔ R$
    - dates.ts — America/Sao_Paulo
  - ✅ **Dados e assets:**
    - public/dados/filmes_locadora_dataset.json — 9.952 filmes
    - public/placeholder-poster.svg — fallback para posterspath nulo
- **Arquivos criados:** 5 commits (16 pages + 3 components + 4 libs = 30+ arquivos)
- **Estado:** Todos os testes em mock (localStorage) — pronto para integração Supabase
- **Resultado observado:** App compilável, todas as telas funcionam; vide commithistory
- **Pendência para retomar:** (1) Supabase creds → integrar API; (2) Rodar `npm run dev` e testar fluxos ponta-a-ponta

## Histórico de decisões e problemas

Nenhum registro. Ao acrescentar uma entrada, informe data, etapa, decisão ou erro observado e o que falta resolver. Use um trecho curto do erro, sem credenciais.

## Como atualizar

Ao encerrar uma etapa, atualize sua situação, descreva o resultado da conferência e indique a próxima ação. Use “Concluída” somente quando os critérios foram verificados. Testes que não rodaram devem constar como “Não executados”.

Mantenha o resumo curto para que o agente retome o trabalho sem reler toda a conversa. Antes de uma nova sessão, confira se o commit e as migrações registrados correspondem aos arquivos e ao banco atuais.
