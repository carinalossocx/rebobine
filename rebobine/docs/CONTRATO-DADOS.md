# Rebobine — contrato de dados

Este documento orienta a criação do banco e a integração dos módulos. As tabelas e operações serão implementadas nas atividades; este arquivo não executa migrações.

As regras de funcionamento estão em `docs/REGRAS.md`. Use Postgres e Supabase Auth. Versione alterações de banco em `supabase/migrations` e mantenha a aplicação e o banco na mesma versão.

## 1. Entrada do catálogo

Arquivo oficial da turma: `dados/filmes_locadora_tmdb.json`.

A raiz contém `metadados` e `filmes`. Percorra a lista `filmes`. O arquivo avaliado contém 9.952 registros, com 29 campos distintos; `sinopse_idioma` é opcional. Identificadores TMDB são únicos, mas títulos podem se repetir.

Use `external_id = "tmdb:" + id_tmdb`. Exemplo: `id_tmdb = 597` corresponde a `external_id = "tmdb:597"`. Não gere uma chave nova a cada importação nem una filmes por título.

### Mapeamento dos campos

| Campo no JSON | Destino na tabela filmes | Tratamento |
|---|---|---|
| `id_tmdb` | `id_tmdb` e `external_id` | Inteiro positivo, único; formar chave externa com prefixo `tmdb:`. |
| `imdb_id` | `imdb_id` | Texto opcional; string vazia vira nulo. Não fornece nota IMDb. |
| `titulo` | `titulo` | Texto obrigatório, sem espaços sobrando nas extremidades. |
| `titulo_original` | `titulo_original` | Texto opcional. |
| `slogan` | `slogan` | Texto opcional. |
| `sinopse` | `sinopse` | Texto opcional, exibido como texto simples. |
| `ano_lancamento` | `ano` | Inteiro opcional. |
| `data_lancamento` | `data_lancamento` | Data ISO opcional; conferir coerência com o ano. |
| `duracao_minutos` | `duracao_minutos` | Inteiro positivo ou nulo. |
| `status` | `status_lancamento` | Texto de produção/lançamento; separado do estoque. |
| `generos` | `generos` | Lista de textos. |
| `pais_origem` | `paises_origem` | Lista de textos. |
| `idioma_original` | `idioma_original` | Texto. |
| `idiomas_falados` | `idiomas_falados` | Lista de textos. |
| `diretor` | `diretores` | Lista de textos, mesmo que haja apenas um nome. |
| `roteirista` | `roteiristas` | Lista de textos. |
| `elenco_principal` | `elenco_principal` | JSONB: lista de objetos com `ator` e `personagem`. |
| `elenco_total_creditado` | `elenco_total_creditado` | Inteiro não negativo. |
| `nota_media` | `nota_tmdb` | Decimal entre 0 e 10. Mostrar com o número de avaliações. |
| `numero_avaliacoes` | `numero_avaliacoes_tmdb` | Inteiro não negativo; zero significa “Sem avaliações”. |
| `popularidade` | `popularidade_tmdb` | Decimal não negativo. |
| `orcamento_usd` | `orcamento_usd` | Inteiro grande opcional; orçamento do filme em dólares. |
| `receita_usd` | `receita_usd` | Inteiro grande opcional; receita do filme em dólares. |
| `classificacao_adulto` | `adulto_tmdb` | Booleano; não converter em faixa etária brasileira. |
| `colecao` | `colecao` | Texto opcional. |
| `imagem_poster_url` | `poster_url` | URL HTTPS opcional. |
| `imagem_capa_url` | `capa_url` | URL HTTPS opcional. |
| `fonte` | `fonte_url` | URL de referência do filme. |
| `sinopse_idioma` | `sinopse_idioma` | Texto opcional. Ausência vira nulo, não `pt-BR` presumido. |

Preserve os metadados de origem em um manifesto de importação versionado, sem duplicá-los em cada filme. Mantenha nos créditos da aplicação a atribuição exigida pelo TMDB. Não baixe imagens durante a importação; use URLs validadas e uma imagem substituta para ausência ou falha.

## 2. Tabelas do núcleo

Use UUID como chave primária interna. Instantes usam `timestamptz`; vencimento usa `date`. Valores monetários da locadora usam centavos inteiros. Adicione `criado_em` e `atualizado_em` aos cadastros, com atualização controlada no servidor/banco.

### filmes

Além dos campos de origem mapeados acima:

- `id`: UUID, chave primária.
- `external_id`: texto obrigatório e único.
- `id_tmdb`: inteiro grande, positivo, obrigatório e único para esta base.
- `formato`: texto opcional, limitado a VHS, DVD ou Blu-ray quando preenchido.
- `formato_origem`: `nao_informado`, `simulado` ou `cadastro`.
- `classificacao_etaria`: texto opcional; permitido Livre, 10, 12, 14, 16 ou 18 quando conhecido.
- `preco_locacao_centavos`: inteiro não negativo; inicial didático de 1000.
- `preco_origem`: `padrao_didatico` ou `cadastro`.
- `ativo`: booleano; filme fora da seleção liberada permanece inativo.

Listas de texto usam `text[]` e vazio como padrão. Campos opcionais ausentes ficam nulos. Orçamento e receita do filme nunca são usados como preço ou custo da locadora.

### exemplares

- `id`: UUID.
- `filme_id`: referência obrigatória a filmes, com unicidade.
- `codigo`: texto obrigatório e único, por exemplo `REB-TMDB-597`.
- `ativo`: booleano.

A importação cria um exemplar simulado por filme. A unicidade de `filme_id` impede um segundo exemplar. Não persista uma flag independente de disponibilidade; ela é calculada a partir de atividade, locações e reservas.

### clientes

- `id`: UUID.
- `external_id`: texto opcional e único, utilizado no seed.
- `nome`: texto obrigatório e não vazio.
- `email`: texto obrigatório, com formato validado.
- `telefone`: texto opcional.
- `ativo`: booleano, inicialmente verdadeiro.
- `auth_user_id`: UUID opcional e único, com referência a `auth.users`.

O e-mail cadastrado não concede acesso e não vincula automaticamente uma conta Auth. Desativar mantém os registros relacionados. Exclusão de uma conta Auth pode remover o vínculo, mas deve preservar o cadastro e o histórico operacional.

### perfis

- `id`: UUID que referencia `auth.users.id`.
- `papel`: `admin` ou `cliente`, com padrão `cliente`.

Garanta um perfil ao criar a conta Auth e trate também contas já existentes. O primeiro administrador é promovido por UID através de uma operação administrativa do responsável pelo projeto. Nunca derive esse papel de e-mail, formulário ou `user_metadata` editável.

### locacoes

- `id`: UUID.
- `cliente_id` e `exemplar_id`: referências obrigatórias.
- `retirada_em`: instante definido pelo servidor.
- `vencimento`: data local da retirada mais três dias.
- `devolvida_em`: instante opcional.
- `preco_centavos` e `multa_diaria_centavos`: valores não negativos copiados na retirada.
- `dias_atraso_final` e `multa_final_centavos`: inteiros não negativos, nulos até a devolução.
- `idempotency_key`: UUID obrigatório e único para identificar a confirmação de locação.
- `criada_por`: UID do administrador responsável; preserve o histórico ao remover a conta.

Crie índice único parcial em `exemplar_id` onde `devolvida_em IS NULL`. Na devolução, preencha os três campos finais juntos. A data de devolução não pode anteceder a retirada. Preserve referências a clientes e exemplares com histórico, sem exclusão em cascata das locações.

### reservas

- `id`: UUID.
- `cliente_id` e `exemplar_id`: referências obrigatórias.
- `criada_em` e `expira_em`: instantes definidos no servidor; diferença de 24 horas.
- `status`: `ativa`, `consumida`, `cancelada` ou `expirada`.
- `idempotency_key`: UUID obrigatório e único para identificar a confirmação de reserva.
- `criada_por`: UID de quem fez a operação.

Crie índice único parcial por `exemplar_id` para `status = 'ativa'`. Antes de inserir, expire uma reserva vencida sob o mesmo bloqueio. Não inclua `now()` na condição desse índice. Consulta de disponibilidade exige também `expira_em > agora`.

## 3. Importação e seed

Implemente uma rotina administrativa que leia o arquivo local em lotes. Ela pode ser executada no ambiente de desenvolvimento; não dependa de enviar todo o arquivo a uma função HTTP da Vercel. Qualquer credencial privilegiada usada nessa rotina fica somente no ambiente local/servidor.

Valide a raiz, os tipos, o ID e o título antes de gravar. Registre inseridos, atualizados e rejeitados com motivo e ID, evitando imprimir o acervo inteiro. Documente o mapeamento aplicado em `docs/MAPEAMENTO.md` a partir deste contrato.

No primeiro import, crie filme e exemplar na mesma transação por registro ou lote. Ative apenas a seleção liberada e os filmes com status “Lançado”, data conhecida e não futura. Demais casos aguardam revisão. O formato e a classificação indicativa permanecem nulos quando desconhecidos.

Em um novo import, atualize somente campos provenientes do TMDB. Preserve preço, formato, classificação indicativa, situação ativa, exemplar, locações e reservas ajustados pela aplicação. Não apague filmes que tenham desaparecido do arquivo. Repita a carga para conferir que as contagens não aumentam.

O seed de `dados/clientes.exemplo.json` usa `external_id` estável, nomes fictícios, e-mails `example.com` e telefone nulo. Ele cria cadastros, sem senhas, contas Auth ou envio de e-mails. Repetir o seed não duplica clientes nem desfaz vínculos ou alterações operacionais.

## 4. Acesso e autorização

Habilite RLS nas tabelas de `public` desde a criação, com acesso negado até as políticas da etapa de autenticação. Verifique a sessão no servidor e as permissões no banco.

| Identidade | Permissões |
|---|---|
| Sem login | Sem acesso aos dados do sistema nesta versão. |
| Administrador | Gerenciar catálogo e clientes; operar locações, devoluções e reservas; consultar painel e relatório. |
| Cliente autenticado | Ler catálogo permitido e seus próprios dados; no portal opcional, reservar e cancelar as próprias reservas. |

O cliente não escreve papel, vínculo Auth, preços, multas, datas ou operações de balcão. Restrinja colunas e operações, pois uma política por linha não protege esses campos sozinha. Defina explicitamente as colunas de catálogo expostas aos clientes, excluindo dados de outros usuários.

As funções que consultam o papel não podem causar recursão de RLS. Caso use `SECURITY DEFINER`, fixe um `search_path` seguro, qualifique schemas, valide sessão/papel/propriedade e revogue execução de `public` e `anon`. Conceda apenas o necessário. Não aceite SQL arbitrário do cliente.

Views devem respeitar as permissões de quem consulta. Chaves `secret`/`service_role` nunca vão para o navegador e não substituem a sessão do usuário nas operações comuns. Não grave senhas nas tabelas da aplicação.

## 5. Operações indivisíveis

Locar, devolver, reservar e cancelar devem ocorrer em transações. Use bloqueio de linha do exemplar em todas elas. Quando houver bloqueio do cliente, padronize a ordem: cliente antes de exemplar. Isso também protege a cota de duas reservas por cliente em requisições simultâneas para filmes diferentes.

- **Locar:** validar administrador, cliente ativo, filme/exemplar ativos e disponibilidade; consumir reserva do mesmo cliente; gravar a locação com valores e datas definidos no servidor.
- **Devolver:** validar administrador; se já devolvido, retornar o resultado salvo; caso contrário, calcular a multa pelas datas locais de São Paulo e gravar a devolução uma única vez.
- **Reservar:** validar a identidade e o cliente; expirar reservas vencidas relevantes; conferir a cota e a disponibilidade; inserir reserva de 24 horas.
- **Cancelar:** permitir administrador ou dono da reserva; encerrar a reserva sem alterar histórico nem cancelar locações.

Repetir uma chave de idempotência deve devolver a operação original apenas ao solicitante autorizado e com os mesmos parâmetros. Reutilizar a chave com outros dados deve falhar. Cancelamento e devolução repetidos também não podem duplicar efeitos.

Todo módulo usa a mesma consulta de disponibilidade. Relatórios não contam reservas vencidas e diferenciam multa estimada de multa final. Proteja células CSV contra fórmulas ao exportar textos para Excel.

## 6. Extensão opcional: recomendações

Somente na etapa 13, adicione os registros de consumo necessários. Use contadores persistentes por usuário/data local e por aplicação/data local, com chaves únicas e atualização atômica na mesma transação. Reserve a cota antes da chamada externa.

O limite é de cinco chamadas por usuário/dia e do teto global em `OPENAI_DAILY_REQUEST_LIMIT`. Configure `OPENAI_MODEL` e `OPENAI_API_KEY` apenas no servidor. Envie no máximo 20 candidatos do acervo e aceite até três IDs válidos de recomendação. Limite entrada, saída (referência didática: 600 tokens), duração e tentativas.

Valide a sessão, não envie dados pessoais desnecessários e não dê ao modelo operações de banco ou reserva. Sem configuração ou cota, use filtros locais. Testes usam respostas simuladas; uma chamada paga de demonstração depende da liberação do professor.

## 7. Conferência antes de avançar

- Duas importações preservam a contagem e os dados operacionais.
- Duas confirmações simultâneas não alugam nem reservam o mesmo exemplar.
- Um cliente não acessa dados de outro nem promove a própria conta.
- Multas de zero, um e dois dias correspondem a 0, 200 e 400 centavos.
- Devolver novamente mantém o resultado salvo.
- Reserva vencida libera disponibilidade sem depender de rotina agendada.
- Na etapa opcional, chamadas simultâneas respeitam os limites da API.

Registre resultados reais em `docs/STATUS.md`. Estes critérios orientam os testes; a presença deste documento não significa que foram executados.
