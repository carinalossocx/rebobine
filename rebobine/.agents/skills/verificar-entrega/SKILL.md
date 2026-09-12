---
name: verificar-entrega
description: Checklist de fechamento de entrega do Rebobine. Use ao FINAL de toda feature/fix/migration, antes de considerar a entrega pronta — materializa o "sem DOC atualizada, a entrega não está pronta".
---

# Verificar entrega — Rebobine

Execute na ordem; TODOS os passos aplicáveis precisam passar. Os comandos exatos de build/lint/teste estão em `DOC/08-OPERACAO.md` (e no `AGENTS.md` §Comandos).

1. Checagem de tipos — limpa.
2. Lint — limpo.
3. Testes automatizados — verdes.
4. Tocou schema/migration/policy de acesso? → a migration é nova (nunca editar uma aplicada), foi aplicada no ambiente de dev e os tipos foram regenerados.
5. Tocou fluxo de UI? → validar no navegador real, 0 erros de console.
6. Diff toca regra inviolável (`DOC/04`)? → confirmar com o usuário antes do commit.
7. DOC atualizada (skill `rebobine-docs` Modo 2) — **função única por fonte**, cada fato em UM lugar:
   - `DOC/99-CHANGELOG.md` (topo) = **história** → **sempre**, **uma** entrada por entrega.
   - capítulo(s) da área = **contrato** → só o capítulo **cujo contrato mudou** (não repetir a história).
   - `DOC/10-PROXIMOS-PASSOS.md` = **fila** → o item entregue **sai**; entram só os que ficaram abertos.
   - `DOC/09-DECISOES.md` = **decisão durável** → só se houve escolha que restringe o futuro.
   - `ROADMAP.md` = **status + "pronto quando"** → tocar **só se o status ⬜/🟨/✅ mudou**; sem parágrafos datados (história é o `99`).
8. Honcho: registrar na sessão da tarefa o **rastro** — comandos executados/resultados, riscos remanescentes e o hash do commit. **Não copiar capítulo nenhum**: memória aponta (link), não replica.
9. Commit (conventional commit em inglês) e **push** da branch — publicar faz parte do fecho.

Qualquer item vermelho → a entrega NÃO está pronta; corrija antes de reportar conclusão.
