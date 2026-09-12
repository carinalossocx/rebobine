# PRD: Rebobine — Sistema de Locadora de Filmes

**Status:** Rascunho
**Fonte das regras:** `REGRAS.md` (Codrix) — todas as regras de negócio abaixo derivam desse arquivo. Onde este PRD propõe algo que o arquivo não define, o trecho está marcado como **[proposta]**.

---

## 1. Problema

A Rebobine é uma locadora de filmes que precisa controlar o dia a dia do balcão: saber quais filmes existem no acervo, quem são os clientes, quem está com qual exemplar, quando vence, quanto deve de multa e o que está reservado.

**Quem sofre o problema**

| Pessoa | O que precisa fazer | Sem sistema |
|---|---|---|
| Administrador do balcão | Localizar filme, alugar, devolver, reservar, consultar atrasos | Planilha/caderno; erros de exemplar alugado duas vezes, multa calculada na mão |
| Cliente (portal opcional) | Ver o catálogo, suas locações, reservar | Ligar ou ir até a loja |
| Responsável pelo projeto | Acompanhar acervo, atrasos e movimento do período | Nenhuma visão consolidada |

**Por que importa:** o exemplar é único (um por filme) e a regra de disponibilidade envolve três estados ao mesmo tempo (ativo, alugado, reservado com validade). Feito à mão, isso gera conflito de reserva, dupla locação e multa errada. O sistema centraliza essa regra em um único lugar.

**Contexto de uso:** o sistema é construído em etapas durante uma aula da Codrix. O repositório começa vazio e as atividades são liberadas pelo professor. O PRD, portanto, precisa ser fatiado em entregas verificáveis e independentes.

---

## 2. Princípios de Design

| Estamos otimizando para | Em troca de | Por quê |
|---|---|---|
| **Uma única regra de disponibilidade**, aplicada no banco e reutilizada por todas as telas | Flexibilidade de cada tela ter sua própria lógica | `REGRAS.md`: "Todo o sistema deve usar essa mesma regra". Divergência entre painel, busca e balcão é o bug mais comum nesse domínio |
| **Integridade transacional** (locação + consumo de reserva em uma transação) | Simplicidade de código no cliente | "Se qualquer parte falhar, a operação inteira deve ser desfeita" |
| **Histórico imutável** (locações e devoluções nunca são apagadas) | Tabelas menores | Relatório por período e pendências de clientes desativados dependem disso |
| **Valores congelados na locação** (preço e multa diária copiados na retirada) | Normalização perfeita | Alterar a configuração não pode mudar locações antigas |
| **Entregas pequenas e verificáveis** | Velocidade de um "big bang" | Cada folha da aula tem um pedido principal e uma correção; saldo de IA é limitado |
| **Dados do TMDB preservados como vieram** (nulos ficam nulos) | Telas "mais bonitas" com valores inventados | Não transformar `classificacao_adulto=false` em "Livre"; não mostrar "Nota IMDb" |
| **Segurança por padrão** (RLS, chave da IA só no servidor, nada de `.env.local` no Git) | Configuração inicial mais trabalhosa | Clientes veem só seus dados; visitantes não veem nada |

**Trade-off assumido:** a lógica de disponibilidade e de multa vive **no Postgres (Supabase)** — funções e views — e não no Next.js. Isso deixa a aplicação mais fina e garante que balcão, portal e relatório leem a mesma verdade. O custo é que os alunos escrevem um pouco de SQL.

---

## 3. O que Estamos Construindo

### 3.1 Stack e infraestrutura

| Camada | Escolha | Observação |
|---|---|---|
| Frontend + backend | **Next.js (App Router) + TypeScript** | Server Actions / Route Handlers para operações do balcão |
| Estilo | **Tailwind CSS** | Componentes próprios; sem biblioteca de UI obrigatória |
| Banco, Auth, RLS | **Supabase** (Postgres + Supabase Auth) | Regras de negócio críticas em funções SQL |
| Código | **GitHub** | `main` protegida; `.env.local` no `.gitignore` |
| Publicação | **Vercel** | Preview por PR; produção a partir de `main` |
| IA (opcional) | API OpenAI chamada pelo servidor | Chave em variável de ambiente privada |

Versões travadas no `package.json` + lockfile (`pnpm-lock.yaml` ou `package-lock.json`) commitados.

**Estrutura de pastas [proposta]**

```
rebobine/
├── app/
│   ├── (auth)/login/
│   ├── (admin)/                 ← balcão: exige administrador
│   │   ├── catalogo/
│   │   ├── clientes/
│   │   ├── locacoes/
│   │   ├── reservas/
│   │   ├── painel/
│   │   └── relatorio/
│   ├── (cliente)/portal/        ← opcional
│   └── api/assistente/          ← opcional, server-only
├── features/                    ← verticais (uma pasta por domínio)
│   ├── catalogo/
│   ├── clientes/
│   ├── locacoes/
│   ├── reservas/
│   ├── painel/
│   └── relatorio/
├── lib/                         ← horizontais
│   ├── supabase/                (client server/browser, tipos gerados)
│   ├── dinheiro.ts              (centavos ↔ R$)
│   ├── datas.ts                 (fuso America/Sao_Paulo)
│   └── disponibilidade.ts       (wrapper da função SQL)
├── supabase/
│   ├── migrations/
│   └── seed/
├── dados/
│   ├── filmes_locadora_tmdb.json
│   └── clientes.exemplo.json
├── scripts/importar-filmes.ts
└── docs/
    ├── STATUS.md
    └── CONTRATO-DADOS.md
```

### 3.2 Modelo de domínio

```
┌──────────┐ 1   1 ┌───────────┐ 1   * ┌───────────┐ *   1 ┌──────────┐
│  filmes  │───────│ exemplares│───────│ locacoes  │───────│ clientes │
└──────────┘       └───────────┘       └───────────┘       └──────────┘
                         │ 1                                    │ 1
                         │ *                                    │ *
                   ┌───────────┐                          ┌───────────┐
                   │ reservas  │──────────────────────────│ reservas  │
                   └───────────┘                          └───────────┘
┌────────────────┐     ┌──────────────┐
│ administradores│     │ configuracoes│  (preço, multa diária, prazo, validade da reserva)
└────────────────┘     └──────────────┘
```

**Tabelas [proposta de esboço — detalhar em `docs/CONTRATO-DADOS.md`]**

```sql
-- Catálogo (origem TMDB) + dados da Rebobine
filmes (
  id uuid pk,
  chave_externa text unique,          -- 'tmdb:597'
  id_tmdb int unique not null,
  titulo, titulo_original, sinopse text null,
  data_lancamento date null,
  generos text[] default '{}',
  nota_tmdb numeric null, votos_tmdb int null,
  classificacao_adulto boolean,       -- NÃO é classificação indicativa
  status_tmdb text,                   -- produção/lançamento, não estoque
  poster_path text null,
  ativo boolean default false,        -- fica inativo até revisão
  dados_origem jsonb,                 -- registro bruto preservado
  importado_em timestamptz
)

exemplares (
  id uuid pk,
  filme_id uuid fk unique,            -- exatamente 1 exemplar por filme (aula)
  codigo text unique,                 -- ex.: 'EX-000597'
  formato_midia text null,            -- 'Não informado' na tela
  formato_simulado boolean default false,
  ativo boolean default true
)

clientes (
  id uuid pk,
  nome, email unique, telefone null,
  ativo boolean default true,
  auth_user_id uuid null unique       -- só o admin vincula
)

administradores ( auth_user_id uuid pk )   -- primeiro admin inserido pelo responsável

configuracoes (
  chave text pk, valor_int int        -- preco_centavos=1000, multa_dia_centavos=200,
)                                     -- prazo_dias=3, reserva_horas=24

locacoes (
  id uuid pk,
  cliente_id, exemplar_id fk,
  retirada_em timestamptz,
  vencimento date,                    -- data local retirada + 3
  preco_centavos int,                 -- cópia da config na retirada
  multa_dia_centavos int,             -- cópia da config na retirada
  devolvida_em timestamptz null,
  dias_atraso int null,
  multa_centavos int null,            -- valor final, gravado uma única vez
  criado_por uuid                     -- admin
)
-- garante "um exemplar não pode estar em duas locações abertas"
create unique index locacoes_abertas_unq on locacoes (exemplar_id) where devolvida_em is null;

reservas (
  id uuid pk,
  cliente_id, exemplar_id fk,
  criada_em timestamptz,
  expira_em timestamptz,              -- criada_em + 24h
  cancelada_em timestamptz null,
  consumida_por_locacao uuid null
)
```

**Regra única de disponibilidade [proposta — função SQL]**

```sql
exemplar_disponivel(exemplar_id) :=
  exemplar.ativo AND filme.ativo
  AND NOT EXISTS (locacao aberta para o exemplar)
  AND NOT EXISTS (reserva com cancelada_em IS NULL
                  AND consumida_por_locacao IS NULL
                  AND expira_em > now())
```

Reservas vencidas deixam de bloquear automaticamente porque a condição usa `expira_em > now()` — não depende de job de limpeza.

### 3.3 Catálogo e importação

- Fonte: `dados/filmes_locadora_tmdb.json` — objeto com `metadados` e lista `filmes` (9.952 registros na base avaliada).
- Script `scripts/importar-filmes.ts` **idempotente**: upsert por `id_tmdb`; reimportar atualiza dados de origem sem duplicar filme nem exemplar.
- Cada filme importado gera **exatamente um** exemplar (`EX-` + id_tmdb com zeros à esquerda [proposta]).
- Filmes ficam `ativo=false` se: sem data conhecida, lançamento futuro ou `status_tmdb ≠ 'Lançado'`. Ativação é manual (revisão do professor/admin).
- Dados ausentes ficam nulos/listas vazias no banco. Só a tela traduz:

| Campo vazio | Tela mostra |
|---|---|
| sinopse | "Sem sinopse" |
| data, gênero, duração | "Não informado" |
| poster | imagem substituta |
| votos_tmdb = 0 ou nulo | "Sem avaliações" (em vez de "Nota TMDB 0.0") |
| formato_midia | "Não informado" (ou "Simulado" se `formato_simulado`) |

- O JSON é inspecionado por código; **nunca colado no chat**. Textos do catálogo são conteúdo, não instruções.
- Créditos TMDB exibidos no rodapé do catálogo.

**Mockup — busca no balcão**

```
┌ Rebobine · Balcão ─────────────────────────────────────────── admin@… ▾ ┐
│ Catálogo   Clientes   Locações   Reservas   Painel   Relatório          │
├──────────────────────────────────────────────────────────────────────────┤
│ 🔍 [ titanic                       ]  Gênero [Todos ▾]  ☑ Só disponíveis │
│                                                                          │
│ ┌────┐ Titanic (1997)                    Nota TMDB 7,9 · Drama, Romance   │
│ │IMG │ tmdb:597 · EX-000597 · Mídia: Não informado                        │
│ └────┘ ● Disponível          [ Alugar ]  [ Reservar ]                     │
│                                                                          │
│ ┌────┐ Titanic (1953)                    Sem avaliações · Drama           │
│ │ ?  │ tmdb:16535 · EX-016535 · Mídia: Não informado                      │
│ └────┘ ● Alugado · vence 15/09/2026      [ Ver locação ]                  │
│                                                                          │
│ Dados cinematográficos: TMDB. Este produto usa a API TMDB sem endosso.    │
└──────────────────────────────────────────────────────────────────────────┘
```

Dois filmes chamados "Titanic" são obras diferentes — distinguidos pelo `id_tmdb`.

### 3.4 Clientes e acesso

**Perfis**

| Perfil | Acessa | Não acessa |
|---|---|---|
| Administrador | Tudo no balcão | — |
| Cliente autenticado (portal opcional) | Próprias locações/reservas, catálogo permitido | Dados de outros clientes, balcão |
| Visitante | Página de login | Catálogo (nesta versão) |

- Cadastro: nome, e-mail, telefone (opcional), ativo/inativo. Seed a partir de `dados/clientes.exemplo.json`.
- Um cadastro pode existir sem login. **Só o administrador** vincula `clientes.auth_user_id`.
- Primeiro administrador é inserido pelo responsável pelo projeto (migração/seed). Nenhuma rota permite um usuário promover a si mesmo.
- Desativar cliente: preserva histórico; bloqueia nova locação e nova reserva; **devolução continua permitida**.

**RLS [proposta]**

```
filmes/exemplares  → SELECT: admin OU cliente autenticado (filme.ativo)
clientes           → admin: tudo; cliente: apenas própria linha (auth_user_id = auth.uid())
locacoes/reservas  → admin: tudo; cliente: apenas onde cliente_id ∈ seus cadastros
administradores    → apenas leitura pelo próprio; escrita só por migração/service role
configuracoes      → SELECT: autenticados; escrita: admin
```

Operações de escrita do balcão passam por **Server Actions** que verificam `administradores` antes de chamar as funções SQL.

### 3.5 Preço, prazo e multa

| Regra | Valor inicial | Onde vive |
|---|---|---|
| Preço da locação | R$ 10,00 → `1000` | `configuracoes.preco_centavos` |
| Prazo | 3 dias corridos | `configuracoes.prazo_dias` |
| Multa | R$ 2,00/dia → `200` | `configuracoes.multa_dia_centavos` |
| Validade da reserva | 24 h | `configuracoes.reserva_horas` |
| Fuso | `America/Sao_Paulo` | função SQL / `lib/datas.ts` |

- Dinheiro sempre em **centavos inteiros**. Formatação `R$ 10,00` só na tela.
- Na retirada, a locação **copia** preço e multa diária. Alterar a configuração depois não afeta locações existentes.
- `vencimento = (retirada_em AT TIME ZONE 'America/Sao_Paulo')::date + prazo_dias`
- `dias_atraso = max(0, data_devolucao_local − vencimento)`
- `multa_centavos = dias_atraso × multa_dia_centavos`

**Cenários (retirada 12/09/2026, vencimento 15/09/2026)**

| Devolução | dias_atraso | multa |
|---|---|---|
| 15/09 23:59 | 0 | R$ 0,00 |
| 16/09 00:01 | 1 | R$ 2,00 |
| 17/09 | 2 | R$ 4,00 |
| 21/09 (passa fim de semana) | 6 | R$ 12,00 |

Fins de semana e feriados contam normalmente.

### 3.6 Locação

**Pré-condições (todas verificadas dentro da função SQL, na mesma transação):**

1. Chamador é administrador
2. Cliente existe e está ativo
3. Filme e exemplar ativos
4. Exemplar sem locação aberta
5. Nenhuma reserva válida **de outro cliente** para o exemplar
6. Se existir reserva válida **do próprio cliente**, ela é marcada como consumida

**Concorrência:** o índice único parcial `locacoes_abertas_unq` garante que duas abas confirmando ao mesmo tempo resultem em um sucesso e um erro claro ("Exemplar já alugado"). Nenhuma verificação só no frontend.

Alugar N filmes = N registros de locação. Cada um copia o preço vigente.

**Mockup — nova locação**

```
┌ Nova locação ──────────────────────────────────────────┐
│ Cliente   [ Ana Souza (ana@exemplo.com) ▾ ]  ● ativa   │
│ Exemplar  [ EX-000597 · Titanic (1997) ▾ ]  ● disponível│
│                                                        │
│ Retirada    12/09/2026            Preço   R$ 10,00     │
│ Vencimento  15/09/2026            Multa   R$ 2,00/dia  │
│ ℹ Reserva #R-0042 desta cliente será consumida.        │
│                                    [ Cancelar ] [ Confirmar ] │
└────────────────────────────────────────────────────────┘
```

### 3.7 Devolução

- Registra `devolvida_em`, `dias_atraso`, `multa_centavos` e libera o exemplar (a liberação é implícita: locação deixa de estar aberta).
- **Idempotente:** confirmar duas vezes retorna o resultado já salvo; não recalcula, não cria segunda devolução.
- Devolução permitida mesmo com cliente desativado.
- Histórico nunca apagado.

```
┌ Devolução · Locação #L-1087 ───────────────────────────┐
│ Ana Souza · Titanic (1997) · EX-000597                 │
│ Retirada 12/09  Vencimento 15/09  Hoje 17/09/2026      │
│ Dias de atraso: 2       Multa devida: R$ 4,00          │
│ ⚠ Valor devido. O sistema não registra pagamento.      │
│                                      [ Confirmar devolução ] │
└────────────────────────────────────────────────────────┘
```

### 3.8 Reservas e disponibilidade

- Reserva segura um exemplar **disponível** por 24 h. Sem fila de espera para filme alugado.
- Uma reserva válida por exemplar; **duas reservas válidas por cliente** (limite aplicado também no balcão).
- Expiração é lógica (`expira_em > now()`); não exige job agendado. Limpeza de registros é opcional e cosmética.
- Balcão: admin cria/cancela qualquer reserva. Portal: cliente cria/cancela só as suas.
- Estados: `válida` · `expirada` · `cancelada` · `consumida`.

### 3.9 Painel e relatório

**Painel**

```
┌ Painel ─────────────────────────────────────────────────────────┐
│ Exemplares ativos   9.412 │ Disponíveis  8.890 │ Reservados   61 │
│ Alugados              461 │   └ dos quais atrasados: 37          │
├─────────────────────────────────────────────────────────────────┤
│ Atrasados (37)                                                  │
│ Cliente        Filme              Venc.     Dias  Multa est.    │
│ Ana Souza      Titanic (1997)     15/09     2     R$ 4,00       │
│ Carlos Lima ⊘  Matrix (1999)      10/09     7     R$ 14,00      │  ⊘ = cliente desativado
└─────────────────────────────────────────────────────────────────┘
```

Invariante: `ativos = disponíveis + alugados + reservados`; atrasados ⊂ alugados.

**Relatório por período**

- Filtro: data inicial/final (por retirada [proposta]).
- Colunas: cliente, filme, retirada, vencimento, devolução, preço, multa.
- Locação aberta → multa marcada como **"estimativa até dd/mm/aaaa"**. Encerrada → valor final salvo.
- Exportar CSV compatível com Excel pt-BR [proposta]: separador `;`, BOM UTF-8, valores `10,00`.
- Rodapé/aviso: "Valores devidos. Não representam receita recebida."

### 3.10 Opcionais (atividades liberadas pelo professor)

**Portal do cliente:** login, catálogo (filmes ativos), minhas locações, minhas reservas (criar/cancelar dentro do limite de 2). Cliente sem `auth_user_id` vinculado não consegue acessar.

**Assistente de recomendação:**
- Até 3 perguntas de preferência → até 3 filmes **do acervo**, escolhidos por gênero/sinopse.
- Modelo só recebe candidatos vindos do banco (filtro prévio por disponibilidade); não inventa título nem promete disponibilidade.
- Chamada OpenAI **exclusivamente no servidor** (`app/api/assistente`); chave em `OPENAI_API_KEY` (nunca no browser, chat ou Git).
- Limites: 5 chamadas/usuário/dia + teto global configurável; modelo definido pelo professor.
- Testes usam respostas simuladas (mock).
- A reserva final passa pelo fluxo normal.

### 3.11 Fluxo de trabalho em aula

- Ler `docs/STATUS.md` antes de continuar; consultar `docs/CONTRATO-DADOS.md` ao mexer em banco/import/permissões.
- Cada etapa: planejar brevemente → implementar → conferência da folha → atualizar `STATUS.md` com o que foi **realmente** feito e verificado.
- Antes do push: conferir arquivos e testes; preservar `.git`, `.gitignore`, histórico, migrações; nunca enviar segredos.
- Uma correção por etapa; se persistir, registrar o erro e pedir orientação ao professor.

---

## 4. O que NÃO Estamos Construindo

| Fora do escopo | Por quê |
|---|---|
| Pagamentos, caixa, notas fiscais, compras, envio de mensagens (e-mail/WhatsApp) | `REGRAS.md`: não controla nesta versão. Multa = valor devido, não recebido |
| Múltiplos exemplares por filme | Acervo simulado com exatamente um exemplar |
| Fila de espera para filme alugado | Reserva só segura exemplar disponível |
| Catálogo público para visitantes | Requer login nesta primeira versão |
| Autopromoção a administrador / cadastro aberto de admin | Primeiro admin definido pelo responsável |
| Classificação indicativa brasileira | O arquivo não a contém; `classificacao_adulto` não a substitui |
| Nota IMDb | Não existe no arquivo |
| Preço por filme obtido do TMDB | Preço é configuração da aula |
| Job agendado obrigatório para expirar reservas | Expiração é lógica na consulta |
| Edição/exclusão de locações e devoluções | Histórico imutável |
| IA no cliente (browser chamando OpenAI) | Chave privada só no servidor |

**Cenário DENTRO do escopo:** admin busca "Titanic", vê o de 1997 disponível, aluga para Ana; três dias depois Ana devolve com 2 dias de atraso; sistema registra multa de R$ 4,00; relatório do mês mostra a linha.

**Cenário FORA do escopo:** Ana paga os R$ 4,00 no balcão e quer recibo → o sistema não registra pagamento nem emite recibo; continua mostrando R$ 4,00 como valor devido.

---

## 5. Critérios de Sucesso

| # | Critério | Como medir |
|---|---|---|
| S1 | Importação idempotente | Rodar o script 2× → mesmo `count(filmes)` e `count(exemplares)`; nenhum duplicado por `id_tmdb` |
| S2 | Nulos preservados | Filme sem sinopse no JSON → `sinopse IS NULL` no banco e "Sem sinopse" na tela |
| S3 | Dupla locação impossível | Teste com duas transações concorrentes no mesmo exemplar → exatamente uma sucede |
| S4 | Multa correta | Os 4 cenários da seção 3.5 passam em teste automatizado com relógio fixo em `America/Sao_Paulo` |
| S5 | Devolução idempotente | Confirmar 2× retorna o mesmo `multa_centavos` e `count(devoluções)=1` |
| S6 | Reserva expira sem job | Reserva com `expira_em` no passado → `exemplar_disponivel()=true` sem nenhuma limpeza |
| S7 | Limite de reservas | 3ª reserva válida do mesmo cliente é recusada, no balcão e no portal |
| S8 | Painel consistente | `ativos = disponíveis + alugados + reservados` em todos os testes; atrasados ≤ alugados |
| S9 | Isolamento de cliente | Cliente autenticado consultando `locacoes` recebe apenas as suas (teste de RLS) |
| S10 | Segredos fora do Git | `.env.local` ausente do histórico; `OPENAI_API_KEY` nunca no bundle do browser |
| S11 | Publicado | Preview na Vercel a cada PR; produção em `main` |
| S12 | Rastreabilidade da aula | `docs/STATUS.md` atualizado ao fim de cada etapa liberada |

---

## 6. Questões Abertas (com respostas propostas)

### Q1 — Onde vive a regra de disponibilidade?

**Opção A — Só no Next.js (TypeScript)**
```ts
const disponivel = ex.ativo && filme.ativo && !locacaoAberta && !reservaValida;
```
Prós: familiar aos alunos. Contras: painel (agregado SQL), busca (filtro SQL) e balcão precisam repetir a regra → diverge.

**Opção B — Função SQL + view `exemplares_com_status`** ← **recomendada**
```sql
create view exemplares_com_status as
select e.*, case when locacao_aberta then 'alugado'
                 when reserva_valida then 'reservado'
                 when e.ativo and f.ativo then 'disponivel'
                 else 'inativo' end as situacao ...
```
Prós: uma verdade; painel é `count(*) group by situacao`. Contras: alunos escrevem SQL.

**Opção C — Edge Function do Supabase**
Prós: TypeScript. Contras: mais uma peça de infra na aula; não resolve o painel.

### Q2 — Como garantir "não alugar duas vezes com duas abas abertas"?

**Opção A — Verificar antes de inserir (SELECT depois INSERT)** → condição de corrida; rejeitada.

**Opção B — Índice único parcial** ← **recomendada**
```sql
create unique index locacoes_abertas_unq on locacoes(exemplar_id) where devolvida_em is null;
```
Segunda inserção falha com `23505`; a Server Action traduz para "Exemplar já alugado".

**Opção C — `SELECT … FOR UPDATE` no exemplar dentro da função de locação** — complementar à B, útil para também bloquear reservas concorrentes. Proposta: B obrigatória, C dentro da função `alugar()`.

### Q3 — Locação e reserva: uma função `alugar()` ou passos separados?

**Recomendado: uma função SQL `alugar(cliente_id, exemplar_id)`** que valida tudo, consome a reserva e insere a locação em uma transação. Retorna a locação ou lança erro nomeado (`CLIENTE_INATIVO`, `EXEMPLAR_INDISPONIVEL`, `RESERVA_DE_OUTRO_CLIENTE`). Atende "se qualquer parte falhar, desfazer tudo" sem lógica de compensação no app.

### Q4 — Devolução idempotente: como?

**Recomendado:** `devolver(locacao_id)` faz `UPDATE … WHERE devolvida_em IS NULL RETURNING *`; se afetar 0 linhas, faz `SELECT` e retorna o registro já encerrado. Nunca recalcula.

### Q5 — Formato de exportação CSV

| Opção | Abre direto no Excel pt-BR? | Observação |
|---|---|---|
| `,` + UTF-8 sem BOM | Não (vira coluna única, acentos quebrados) | padrão "internacional" |
| **`;` + BOM UTF-8 + decimal `,`** ← recomendada | Sim | padrão Excel Brasil |
| XLSX | Sim | dependência extra; fora do pedido ("CSV") |

### Q6 — Cliente com login: quem cria a conta Auth?

**Recomendado:** admin convida pelo painel do Supabase (ou `inviteUserByEmail` via service role no servidor) e depois vincula o `auth_user_id` ao cadastro. Não existe auto-cadastro público, o que respeita "visitantes não acessam".

### Q7 — Provedor de IA do assistente

`REGRAS.md` fixa **OpenAI**. Como a chamada é server-side e isolada em `lib/ia/`, trocar de provedor depois é uma mudança local. **Proposta:** manter OpenAI conforme a regra e encapsular atrás de uma interface `recomendar(preferencias, candidatos)` para facilitar demonstrar outro modelo em sala.

### Q8 — Seleção menor para a aula

**Proposta:** script aceita `--limite=200` e `--somente-ativos`; a seleção inicial é revisada pelo professor quanto à adequação de conteúdo (`classificacao_adulto=true` fica sempre inativo por padrão).

---

## 7. Milestones (proposta preliminar — consolidar ao passar para Planejamento)

Cada milestone corresponde a uma ou mais folhas de atividade liberadas pelo professor.

### M0: Repositório publicado na Vercel
Next.js + Tailwind + TypeScript rodando; Supabase conectado; deploy de preview funcionando.
- **E0.1** Projeto inicial com lockfile, `.gitignore` (inclui `.env.local`), `docs/STATUS.md` e `docs/CONTRATO-DADOS.md` criados. *Verificação:* `git log` sem segredos; página inicial no preview da Vercel.
- **E0.2** Cliente Supabase (server/browser) e tipos gerados. *Verificação:* query de teste em `configuracoes` retorna os 4 valores iniciais.

### M1: Catálogo importado e pesquisável
- **E1.1** Migração `filmes`, `exemplares`, `configuracoes`. *Verificação:* migração aplicada; `CONTRATO-DADOS.md` atualizado.
- **E1.2** Script de importação idempotente com regra de inativação. *Cenários:* JSON com campos nulos; reimportação; título duplicado com `id_tmdb` diferente. *Verificação:* S1, S2.
- **E1.3** Tela de catálogo com busca, filtro e rótulos de dados ausentes. *Verificação:* "Sem avaliações" quando `votos_tmdb=0`; créditos TMDB visíveis.

### M2: Administrador faz login e gerencia clientes
- **E2.1** Login Supabase Auth + tabela `administradores` + primeiro admin via seed. *Cenário de erro:* usuário autenticado sem registro em `administradores` é barrado do balcão.
- **E2.2** CRUD de clientes com seed de `clientes.exemplo.json`, ativar/desativar, vínculo manual de `auth_user_id`. *Verificação:* cliente inativo não aparece como selecionável em "Nova locação".
- **E2.3** Políticas RLS iniciais. *Verificação:* S9.

### M3: Balcão aluga e devolve
- **E3.1** Função `alugar()` + índice único parcial + Server Action. *Cenários:* cliente inativo; exemplar alugado; reserva de outro cliente; duas abas. *Verificação:* S3.
- **E3.2** Função `devolver()` idempotente com cálculo de multa no fuso. *Verificação:* S4, S5.
- **E3.3** Telas de nova locação, lista de locações abertas e devolução.

### M4: Reservas seguram exemplares por 24 h
- **E4.1** Tabela/função `reservar()` e `cancelar_reserva()`, limite de 2 por cliente, consumo automático na locação. *Verificação:* S6, S7.
- **E4.2** View `exemplares_com_status` como regra única; catálogo passa a usar a view. *Entrega de arquitetura:* registrar decisão em `CONTRATO-DADOS.md`.

### M5: Painel e relatório do período
- **E5.1** Painel com contadores e lista de atrasados (inclui clientes desativados). *Verificação:* S8.
- **E5.2** Relatório por período + CSV Excel pt-BR + rótulo "estimativa" para abertas.

### M6 (opcional): Portal do cliente
- **E6.1** Login de cliente, minhas locações/reservas, reservar/cancelar com limite.

### M7 (opcional): Assistente recomenda filmes do acervo
- **E7.1** Route Handler server-only, limite 5/usuário/dia + teto global, mock em testes. *Verificação:* S10; nenhum título fora do acervo nas respostas de teste.

---

## 8. Paralelização (proposta)

```yaml
tracks:
  - id: A
    name: Banco e regras de negócio (SQL, migrações, RLS)
    deliverables:
      - E0.2
      - E1.1
      - E1.2
      - E2.3
      - E3.1
      - E3.2
      - E4.1
      - E4.2
  - id: B
    name: Telas do balcão (Next.js + Tailwind)
    deliverables:
      - E0.1
      - E1.3
      - E2.1
      - E2.2
      - E3.3
      - E5.1
      - E5.2
  - id: C
    name: Opcionais (portal e assistente)
    deliverables:
      - E6.1
      - E7.1
```

Dependências entre trilhas: B/E1.3 depende de A/E1.2; B/E3.3 depende de A/E3.1–E3.2; C depende de M4 concluído.

---

## 9. Arquitetura

*(Adicionada durante a revisão de arquitetura, após aprovação do Planejamento.)*
