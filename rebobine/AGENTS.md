# AGENTS.md — Rebobine

Instruções persistentes do projeto para agentes de IA (Codex e outros). Este arquivo **espelha `CLAUDE.md`** — toda alteração lá deve ser replicada aqui, e vice-versa.

> Idioma da documentação: **PT-BR**. Código, comentários e nomes em inglês.

Instruções persistentes do projeto **Rebobine**. Leia antes de qualquer alteração.

> Projeto **em fase inicial**: as seções marcadas _(a definir)_ serão preenchidas conforme o produto, a stack e as regras forem decididos. A **estrutura e o processo de governança da DOC** (abaixo) valem desde o primeiro commit.

## Documentação técnica (OBRIGATÓRIA para manutenção)

- A documentação completa do sistema vive em **`DOC/`** — comece por **`DOC/LEIAME-AGENTE.md`** (fluxo de manutenção) e **`DOC/00-INDICE.md`** (índice).
- Use a skill de projeto **`rebobine-docs`** (`.agents/skills/rebobine-docs/`): **antes** de alterar (consultar o capítulo certo, regras afetadas, armadilhas conhecidas) e **depois de toda entrega**.
- **Função única por fonte** — no fecho, cada fato mora em UM lugar; não replicar:
  - **Capítulo da `DOC/`** = *contrato* (como o sistema funciona hoje). Atualiza **só** o capítulo cujo contrato mudou.
  - **`DOC/99-CHANGELOG.md`** = *história* (o que mudou e quando). **Sempre**, **uma** entrada por entrega.
  - **`DOC/10-PROXIMOS-PASSOS.md`** = *fila* (só o que está aberto). Item concluído **sai** da fila — não vira narrativa.
  - **`ROADMAP.md`** = *status* ⬜/🟨/✅ + "pronto quando". Toca **só se o status do módulo mudou**; sem parágrafos datados (isso é história, mora no `99`).
  - **Honcho** = *rastro da sessão* (comandos, resultados, riscos, hash do commit).
- **Uma entrega sem a DOC atualizada não está pronta.** Checklist de fecho: skill **`verificar-entrega`** (`.agents/skills/verificar-entrega/`).

## Memória viva de sessão (Honcho)

Use o **Honcho como memória viva de sessão** (servidor MCP `honcho`, workspace **`rebobine`**). Complementa a DOC sem duplicá-la: a DOC é a verdade versionada no repositório; **o Honcho guarda o rastro da sessão** — comandos executados e resultados, decisões tomadas no caminho, bugs, riscos abertos, hash do commit.

**No início de cada tarefa:**
- Inspecionar o workspace do Honcho deste projeto (`inspect_workspace`).
- Buscar (`search`) decisões anteriores, bugs, notas de arquitetura e riscos abertos relevantes.
- Criar ou reutilizar uma sessão nomeada conforme a branch, a issue ou a tarefa atual.

**Durante o trabalho:**
- Registrar na sessão atual do Honcho as decisões importantes, restrições, bugs e resultados de verificação.
- **Nunca** armazenar segredos, tokens, credenciais, chaves privadas, PII de clientes ou logs extensos.
- Redigir valores sensíveis como `[REDACTED]`.

**Ao final:**
- Adicionar um resumo conciso do que mudou.
- Adicionar os comandos/testes efetivamente executados e seus resultados.
- Adicionar riscos remanescentes ou próximos passos.
- Criar `conclusions` apenas para fatos duráveis do projeto, com chance de continuarem úteis no futuro.

## O que é este projeto

_(a definir)_ — descrever produto, atores e fluxo ponta a ponta em `DOC/01-VISAO-GERAL.md` e resumir aqui em um parágrafo.

## Arquitetura

_(a definir)_ — topologia, padrões e armadilhas em `DOC/02-ARQUITETURA.md`; resumo aqui.

## Stack — não substituir sem autorização explícita

_(a definir)_ — quando fixada, registrar como decisão em `DOC/09-DECISOES.md` e listar aqui. **Não trocar sem confirmação do usuário.**

## Regras de negócio invioláveis

Estas regras nunca podem ser relaxadas em refactors. Se uma mudança as afetar, **pare e avise o usuário**. Todas devem **falhar fechado** (negar por padrão). Mapa completo regra→código→teste em `DOC/04-REGRAS-DE-NEGOCIO.md`.

- _(a definir)_ — numerar como `RN1`, `RN2`… conforme forem decididas.

## Segurança

- **Segredos só no servidor.** Nunca expor chaves de serviço em variáveis prefixadas para o cliente; `.env*` nunca entra em commit.
- **Logs sem dado sensível;** webhooks validados (assinatura/HMAC) antes de processar; trilha de auditoria para operações sensíveis.
- **LGPD:** dados pessoais com base legal, minimização e retenção definida. Detalhe em `DOC/02-ARQUITETURA.md`.

## Convenções de código

- **UI em português brasileiro; código, comentários e nomes de variáveis em inglês.**
- Erros de negócio retornam mensagens em PT-BR prontas para exibição; erros técnicos vão para log, nunca para o usuário.
- Migrations: nunca editar migration já aplicada — criar nova. Nomes: `NNNN_descricao_curta.sql`.
- Componentes UI consomem **tokens** do design system, nunca cores/espaçamentos hardcoded. Ver `DOC/07`.
- Demais convenções específicas: _(a definir)_.

## Comandos

> Detalhe e env vars em `DOC/08-OPERACAO.md`.

```bash
# (a definir) — install / dev / build / lint / typecheck / test
```

## Fluxo de trabalho

- Commits pequenos e descritivos em inglês (conventional commits: `feat:`, `fix:`, `chore:`, `docs:`).
- **git-flow**: cada novo **módulo/etapa** entra numa _feature_ a partir de `develop`; `develop` integra, _releases_ promovem para `main`. Detalhe em `DOC/08-OPERACAO.md`.
- **Publicar faz parte do fecho:** `git push` da branch integrada ao final da entrega.
- Ambiguidade que **afeta o resultado** (interpretações divergentes, regra inviolável em jogo, mudança difícil de reverter): **pare e exponha/pergunte antes de implementar** (ver Diretrizes de execução §1). Ambiguidade **trivial e reversível**: escolha a opção mais simples que preserva as regras invioláveis, registre em `DOC/09-DECISOES.md` e siga.
- **Documentar é parte da entrega** (skill `rebobine-docs`, Modo 2). Sem DOC atualizada, a entrega não está pronta.

## Diretrizes de execução (reduzir erros comuns de IA)

> Enviesam para **cautela acima de velocidade**; em tarefas triviais, use bom senso. Onde conflitarem com instruções antigas deste arquivo, **estas prevalecem**.

### 1. Pensar antes de codar — não presuma, não esconda a dúvida, exponha tradeoffs

- Declare suas premissas explicitamente; se incerto, pergunte.
- Havendo múltiplas interpretações, apresente-as — não escolha em silêncio.
- Se existe uma abordagem mais simples, diga; discorde quando fizer sentido.
- Se algo não está claro, pare, nomeie o que confunde e pergunte.

### 2. Simplicidade primeiro — código mínimo que resolve o problema, nada especulativo

- Sem features além do que foi pedido; sem abstração para código de uso único.
- Sem "flexibilidade"/"configurabilidade" não solicitada; sem tratamento de erro para cenários impossíveis.
- Se escreveu 200 linhas e caberia em 50, reescreva. Teste: "um engenheiro sênior diria que está complicado demais?" Se sim, simplifique.

### 3. Mudanças cirúrgicas — toque só no necessário, limpe só a sua própria sujeira

- Não "melhore" código, comentário ou formatação adjacentes; não refatore o que não está quebrado; siga o estilo existente mesmo que você faria diferente.
- Código morto **não relacionado**: mencione, não apague. Remova só os órfãos que **as suas mudanças** criaram (imports/variáveis/funções).
- Teste: toda linha alterada deve rastrear diretamente ao pedido.

### 4. Execução orientada a objetivo — defina o critério de sucesso e itere até verificar

- "Adicionar validação" → "escrever testes para entradas inválidas e fazê-los passar".
- "Corrigir o bug" → "escrever um teste que o reproduz e fazê-lo passar".
- "Refatorar X" → "garantir testes verdes antes e depois".
- Em tarefas multi-passo, enuncie um plano curto com verificação por passo (`passo → verifica: [check]`). Critérios fortes permitem iterar sozinho; critérios fracos ("fazer funcionar") geram retrabalho.
