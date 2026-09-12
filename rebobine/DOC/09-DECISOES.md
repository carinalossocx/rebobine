# 09 — Log de decisões

_Atualizado em 2026-09-12._

> Decisões de arquitetura/produto/UX, com data e motivo. **Não reverter uma decisão sem ler o porquê dela aqui.**
> Formato: `## AAAA-MM-DD — Dn · decisão` + motivo + referência (arquivo/capítulo afetado).

## 2026-09-12 — D1 · Governança da DOC herdada do adari-crm

- **Decisão:** o projeto nasce com a mesma estrutura de documentação e processo do adari-crm (pasta `DOC/`, skills `rebobine-docs` e `verificar-entrega`, `CLAUDE.md` espelhado em `AGENTS.md` para o Codex, função única por fonte).
- **Motivo:** processo já validado em outros projetos; evita retrabalho e mantém agentes com pouco contexto dentro das regras.
- **Referência:** `CLAUDE.md`, `AGENTS.md`, `.claude/skills/`, `.agents/skills/`.
