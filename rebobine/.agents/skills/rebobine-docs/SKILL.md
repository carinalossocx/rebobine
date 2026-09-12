---
name: rebobine-docs
description: Consulta e atualização da documentação técnica do Rebobine (pasta DOC/). Use SEMPRE em duas situações - (1) ANTES de alterar/corrigir/investigar qualquer parte do sistema, para consultar o capítulo certo da DOC, as regras invioláveis e as armadilhas conhecidas; (2) DEPOIS de toda entrega, correção, migration ou decisão, para atualizar os capítulos afetados, o changelog (DOC/99), os próximos passos (DOC/10), as decisões (DOC/09) e o ROADMAP. Uma entrega sem DOC atualizada não está pronta.
---

# rebobine-docs — consultar e manter a documentação do Rebobine

A documentação vive em `DOC/` (índice: `DOC/00-INDICE.md`; manual do agente: `DOC/LEIAME-AGENTE.md`). Esta skill tem dois modos. Identifique qual se aplica e siga o procedimento.

## Modo 1 — CONSULTA (antes de mexer no sistema)

1. Leia `DOC/00-INDICE.md` e abra os capítulos da área afetada (tabela "Leia quando for…").
2. Sempre cheque, além do capítulo da área:
   - `DOC/04-REGRAS-DE-NEGOCIO.md` — sua mudança toca alguma regra inviolável? Se sim, PARE e confirme com o usuário.
   - `DOC/02-ARQUITETURA.md` § Armadilhas — não repita erros já resolvidos.
   - `DOC/09-DECISOES.md` — o comportamento que você quer "corrigir" pode ser decisão consciente.
3. Se a DOC divergir do código, a fonte de verdade é o código: anote para corrigir a DOC no Modo 2.

## Modo 2 — ATUALIZAÇÃO (após toda entrega/alteração)

Execute TODOS os passos aplicáveis, no mesmo commit do trabalho (ou em commit `docs:` imediatamente após):

1. **Capítulo da área** — atualize o(s) arquivo(s) conforme a tabela de mapeamento abaixo. Atualize fatos, tabelas e caminhos; não deixe texto obsoleto. Ao preencher um capítulo que ainda era template, remova os marcadores `TODO:`/_(a definir)_.
2. **`DOC/99-CHANGELOG.md`** — adicione entrada no TOPO: `## AAAA-MM-DD — título curto` + bullets do que mudou (sistema e/ou doc).
3. **`DOC/10-PROXIMOS-PASSOS.md`** — é a **fila viva: só o que está ABERTO** (bloco Agora / Próximo / Bloqueado no topo). **SUBSTITUA o estado, não acrescente:** item concluído **sai** da fila (a história mora no `99`). Ao marcar `[x]` ou escrever "no ar"/"entregue", faça `grep` pelo termo em `DOC/10`, `DOC/00-INDICE.md` e `DOC/LEIAME-AGENTE.md` para **apagar/reescrever a frase contrária**; "frente atual" só existe no bloco **Agora**. Pendência nova entra com ponteiro de implementação.
4. **`/ROADMAP.md`** — se um módulo mudou de estado (⬜/🟨/✅) ou ganhou/perdeu entregas, reflita lá (mudança de escopo exige confirmação do usuário).
5. **`DOC/09-DECISOES.md`** — se houve decisão de arquitetura/produto/UX relevante, adicione entrada (data · decisão · motivo · referência).
6. **`DOC/00-INDICE.md`** — só se criou/renomeou arquivo de DOC.

### Mapeamento: o que mudou → qual capítulo atualizar

| Mudança em… | Atualizar |
|---|---|
| Escopo do produto / fluxo de negócio / atores | `01-VISAO-GERAL.md` |
| Topologia, padrões, middleware/auth, armadilha nova descoberta | `02-ARQUITETURA.md` |
| Schema/migrations/views/constraints/colunas | `03-BANCO-DE-DADOS.md` (tabela de migrations + seção afetada) |
| Lógica que implementa uma regra inviolável | `02-ARQUITETURA.md` (mapa) e `04-REGRAS-DE-NEGOCIO.md` |
| Um módulo/área do sistema | `05-MODULOS.md` (ou o capítulo da área específica, quando houver) |
| Integração externa (API de terceiro, webhook, e-mail) | `06-INTEGRACOES.md` |
| Tokens/temas/fontes/componentes de UI/logos | `07-DESIGN-SYSTEM.md` |
| Env vars, comandos, ambientes, contas demo, git | `08-OPERACAO.md` |

> À medida que um módulo cresce, **promova-o a um capítulo próprio** (ex.: `11-AREA-X.md`), atualize `00-INDICE.md` e esta tabela, e registre a reorganização em `09-DECISOES.md`.
> Capítulos marcados **PLANO** devem ser virados de "plano" para "estado" quando a implementação acontecer — atualizar o texto, não só acrescentar.

### Regras de escrita da DOC

- PT-BR; caminhos em crase relativos à raiz; tabelas > prosa; sem duplicar `AGENTS.md` (referencie).
- Datas absolutas (AAAA-MM-DD ou DD/MM/AAAA), nunca "hoje/ontem".
- Precisão > volume: cada afirmação deve ser verificável no código. Na dúvida, verifique antes de escrever.

### Checklist de saída do Modo 2

- [ ] Capítulo(s) da área atualizado(s) e sem informação obsoleta
- [ ] Entrada nova no `99-CHANGELOG.md`
- [ ] `10-PROXIMOS-PASSOS.md` coerente com a realidade: item concluído SAIU da fila, o bloco Agora/Próximo/Bloqueado está atual e nenhum ponto de entrada (`00-INDICE`, `LEIAME-AGENTE`, `10`) contradiz a entrega
- [ ] ROADMAP coerente (se aplicável)
- [ ] Decisão registrada em `09-DECISOES.md` (se houve)
- [ ] Commit feito (`docs:` ou junto da entrega)
