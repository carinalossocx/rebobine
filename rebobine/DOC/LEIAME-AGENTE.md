# LEIAME-AGENTE — Manual de manutenção do Rebobine para agentes

_Atualizado em 2026-09-12._

Você é um agente trabalhando no **Rebobine**. Este arquivo é o seu **ponto de partida obrigatório**. Siga o fluxo abaixo à risca — ele existe para que agentes com menos contexto não quebrem regras de negócio nem repitam erros já resolvidos.

> Projeto em fase inicial: capítulos ainda em template trazem marcadores `TODO:`/_(a definir)_. Ao implementar algo, preencha o capítulo correspondente (skill `rebobine-docs`, Modo 2) e remova os marcadores.

---

## 1. Ordem de leitura (antes de QUALQUER alteração)

1. **`/CLAUDE.md`** (ou `/AGENTS.md`, espelho para o Codex) — instruções persistentes e as regras invioláveis. Se a sua tarefa tocar qualquer uma delas, **pare e avise o usuário** antes de prosseguir.
2. **`DOC/00-INDICE.md`** — escolha os capítulos relevantes para a sua tarefa (tabela "Leia quando for…").
3. **`DOC/04-REGRAS-DE-NEGOCIO.md`** — mapa regra→código. Releia sempre que for refatorar.
4. **`DOC/02-ARQUITETURA.md` § "Armadilhas conhecidas"** — erros que já aconteceram e como não repeti-los.
5. **`DOC/09-DECISOES.md`** — se você discordar de algo no código, primeiro veja se foi uma decisão consciente.

## 2. A skill `rebobine-docs` (USO OBRIGATÓRIO)

Existe uma skill de projeto em `.claude/skills/rebobine-docs/SKILL.md` (Claude Code) e `.agents/skills/rebobine-docs/SKILL.md` (Codex), disponível automaticamente para qualquer agente trabalhando neste repositório.

**Quando ela DEVE ser usada:**
- **ANTES** de alterar o sistema → modo *consulta*: localizar na DOC o que você precisa saber (capítulo certo, regras afetadas, armadilhas).
- **DEPOIS de toda entrega/alteração** → modo *atualização*: atualizar o(s) capítulo(s) afetado(s), `99-CHANGELOG.md`, `10-PROXIMOS-PASSOS.md` e o `ROADMAP.md` quando aplicável.

**Regra de ouro: uma entrega sem documentação atualizada NÃO está pronta.** Checklist de fecho: skill `verificar-entrega`.

## 3. Protocolo de manutenção (passo a passo)

```
1. ENTENDER   → ler DOC (skill em modo consulta) + código envolvido
2. PLANEJAR   → se tocar regra inviolável/escopo fora do previsto: confirmar com o usuário
3. IMPLEMENTAR→ seguindo DOC/02 (padrões/armadilhas) e DOC/07 (UI por tokens, PT-BR)
4. VERIFICAR  → build · lint · testes (ver DOC/08)
                schema novo? migration nova + aplicar + regenerar tipos (DOC/03 §como alterar)
5. DOCUMENTAR → skill rebobine-docs (capítulos + changelog + próximos passos + decisões)
6. COMMITAR   → conventional commit em inglês + push
```

### O que NUNCA fazer

- Editar migration já aplicada (criar nova).
- Relaxar regras da `DOC/04` "porque o teste passou" — os testes são o contrato, não o limite.
- Trocar a stack fixada no `CLAUDE.md` sem autorização explícita.
- Entregar sem atualizar a DOC.
- Qualquer coisa vedada em `/CLAUDE.md` (§Convenções de código e §Segurança) — a lista completa mora lá.

## 4. Como trabalhar com o ROADMAP (`/ROADMAP.md`)

O ROADMAP é o plano por módulos com status (⬜/🟨/✅) e critérios de "pronto". Protocolo:

- **Seguir:** a próxima tarefa padrão é o primeiro item de `DOC/10-PROXIMOS-PASSOS.md`. Na dúvida entre tarefas, pergunte ao usuário.
- **Avaliar:** antes de marcar ✅, confira o bloco "Pronto quando" do módulo — todos os critérios precisam estar verdadeiros (não "quase").
- **Alterar:** mudanças de escopo (adicionar/cortar entregas, mover algo para fora do previsto) só com confirmação do usuário; registre em `ROADMAP.md` + `DOC/09-DECISOES.md`.
- **Atualizar:** módulo concluído → ✅ no ROADMAP + entrada no `99-CHANGELOG.md` + limpar o item em `DOC/10`. Necessidade nova descoberta → adicionar na seção do módulo certo e em `DOC/10`.

## 5. Contexto operacional essencial

TODO: preencher quando a stack for definida (banco/ambiente, migrations, comandos, git). Detalhe em `08-OPERACAO.md`.

> Na dúvida sobre qualquer operação destrutiva de ambiente (reset de dados, migration/push no remoto), **consulte o usuário antes** (Diretrizes de execução §1 do `CLAUDE.md`).

## 6. Próximos passos

A lista priorizada e sempre-atual está em **`DOC/10-PROXIMOS-PASSOS.md`**. Não invente prioridades: siga a lista ou pergunte.

## 7. Se a documentação estiver errada

A fonte de verdade é o **código + migrations**. Encontrou divergência? Corrija a DOC no mesmo commit do seu trabalho e registre no changelog ("doc corrigida: X dizia Y, código faz Z"). **Documentação desatualizada é bug.**
