# DOC — Índice da documentação técnica do Rebobine

> **Comece por [`LEIAME-AGENTE.md`](./LEIAME-AGENTE.md)** se você é um agente trabalhando no projeto.
> Regras invioláveis e instruções persistentes estão em [`/CLAUDE.md`](../CLAUDE.md) (espelho: [`/AGENTS.md`](../AGENTS.md)) — leia ANTES de qualquer alteração.

| # | Arquivo | Conteúdo | Leia quando for… |
|---|---|---|---|
| — | [LEIAME-AGENTE.md](./LEIAME-AGENTE.md) | Fluxo de trabalho do agente, skill de docs, protocolo de manutenção e de ROADMAP | **Sempre, primeiro** |
| 01 | [01-VISAO-GERAL.md](./01-VISAO-GERAL.md) | O que é o produto, atores, fluxo ponta a ponta, escopo | Entender o negócio |
| 02 | [02-ARQUITETURA.md](./02-ARQUITETURA.md) | Topologia, decisões estruturais, mapa de rotas/serviços, padrões e armadilhas | Mexer em qualquer código |
| 03 | [03-BANCO-DE-DADOS.md](./03-BANCO-DE-DADOS.md) | Tabelas, constraints, migrations, como alterar schema | Mexer em dados/schema |
| 04 | [04-REGRAS-DE-NEGOCIO.md](./04-REGRAS-DE-NEGOCIO.md) | Regras invioláveis → onde cada uma está implementada e testada | **Antes de qualquer refactor** |
| 05 | [05-MODULOS.md](./05-MODULOS.md) | Módulos/áreas do sistema e o que cada um faz | Mexer em um módulo |
| 06 | [06-INTEGRACOES.md](./06-INTEGRACOES.md) | Integrações externas (APIs de terceiros, webhooks, e-mail) | Mexer numa integração |
| 07 | [07-DESIGN-SYSTEM.md](./07-DESIGN-SYSTEM.md) | Tokens, tema, tipografia, convenções visuais | Mexer em UI |
| 08 | [08-OPERACAO.md](./08-OPERACAO.md) | Env vars, comandos, ambientes, contas demo, checklist de verificação | Rodar/validar/deployar |
| 09 | [09-DECISOES.md](./09-DECISOES.md) | Log de decisões (datas + porquês) — não reverter sem ler | Questionar um padrão existente |
| 10 | [10-PROXIMOS-PASSOS.md](./10-PROXIMOS-PASSOS.md) | **Fila viva**: Agora / Próximo / Bloqueado + só os itens abertos, com ponteiro de implementação | Escolher a próxima tarefa |
| 99 | [99-CHANGELOG.md](./99-CHANGELOG.md) | Histórico datado de entregas/alterações | Saber o que mudou e quando |

## Regras deste pacote de documentação

1. **Fonte de verdade:** o código e as migrations. A documentação descreve; se divergir, conserte a documentação (e registre no changelog).
2. **Toda entrega/alteração atualiza a documentação** — use a skill `rebobine-docs` (ver LEIAME-AGENTE.md). Sem doc atualizada, a entrega não está pronta.
3. Idioma: PT-BR (código e nomes de arquivos em inglês).
4. Caminhos de arquivo sempre relativos à raiz do repo, em crase.
5. Não duplicar o conteúdo de `CLAUDE.md` (regras invioláveis) — referenciar.
