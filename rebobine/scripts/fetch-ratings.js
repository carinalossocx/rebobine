const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const SPARQL_ENDPOINT = 'https://query.wikidata.org/sparql';
const BATCH_SIZE = 150;
const OUT_DIR = path.join(process.cwd(), 'scripts', 'ratings-out');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function carregarFilmes() {
  const filmes = [];
  let offset = 0;
  while (true) {
    const { data, error } = await supabase
      .from('filmes')
      .select('id, id_tmdb, chave_externa')
      .like('chave_externa', 'wikidata:%')
      .range(offset, offset + 999);
    if (error) throw error;
    if (!data || data.length === 0) break;
    filmes.push(...data);
    if (data.length < 1000) break;
    offset += 1000;
  }
  return filmes;
}

function normalizarNota(valor) {
  // "7.6/10" -> 7.6 | "85%" -> 8.5 | "76/100" -> 7.6
  const m10 = valor.match(/^([\d.]+)\s*\/\s*10$/);
  if (m10) return parseFloat(m10[1]);
  const m100 = valor.match(/^([\d.]+)\s*\/\s*100$/);
  if (m100) return parseFloat(m100[1]) / 10;
  const pct = valor.match(/^([\d.]+)\s*%$/);
  if (pct) return parseFloat(pct[1]) / 10;
  return null;
}

async function buscarNotasBatch(qids) {
  const values = qids.map((q) => `wd:${q}`).join(' ');
  const query = `
    SELECT ?film ?score WHERE {
      VALUES ?film { ${values} }
      ?film p:P444 ?statement.
      ?statement ps:P444 ?score.
    }
  `;

  const res = await fetch(SPARQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/sparql-results+json',
      'User-Agent': 'rebobine-locadora/1.0 (dados publicos Wikidata)',
    },
    body: 'query=' + encodeURIComponent(query),
  });

  if (!res.ok) {
    throw new Error(`SPARQL HTTP ${res.status}: ${await res.text()}`);
  }

  const json = await res.json();
  const porFilme = {};
  for (const b of json.results.bindings) {
    const qid = b.film.value.split('/').pop();
    const nota = normalizarNota(b.score.value);
    if (nota === null) continue;
    if (!porFilme[qid]) porFilme[qid] = [];
    porFilme[qid].push(nota);
  }
  // Média das notas encontradas por filme (várias fontes: IMDb, RT, Metacritic)
  const resultado = {};
  for (const qid in porFilme) {
    const notas = porFilme[qid];
    resultado[qid] = notas.reduce((a, b) => a + b, 0) / notas.length;
  }
  return resultado;
}

async function main() {
  console.log('Carregando filmes com id_wikidata do Supabase...');
  const filmes = await carregarFilmes();
  console.log(`  ${filmes.length} filmes encontrados`);

  const qidParaId = {};
  filmes.forEach((f) => {
    qidParaId[f.id_tmdb] = f.id;
  });

  const qids = filmes.map((f) => f.id_tmdb);
  const lotes = [];
  for (let i = 0; i < qids.length; i += BATCH_SIZE) {
    lotes.push(qids.slice(i, i + BATCH_SIZE));
  }
  console.log(`Consultando Wikidata em ${lotes.length} lotes de até ${BATCH_SIZE}...`);

  const todasAsNotas = {};
  for (let i = 0; i < lotes.length; i++) {
    try {
      const notas = await buscarNotasBatch(lotes[i]);
      Object.assign(todasAsNotas, notas);
      process.stdout.write(`\r  Lote ${i + 1}/${lotes.length} - ${Object.keys(todasAsNotas).length} notas até agora`);
    } catch (err) {
      console.error(`\n  Erro no lote ${i + 1}:`, err.message);
    }
    // Respeitar limites de uso do endpoint público
    await new Promise((r) => setTimeout(r, 1000));
  }
  console.log(`\n\nTotal de filmes com nota real encontrada: ${Object.keys(todasAsNotas).length}`);

  // Gerar arquivo de saída: id (uuid do supabase) + nota
  const linhas = Object.entries(todasAsNotas)
    .map(([qid, nota]) => {
      const id = qidParaId[qid];
      if (!id) return null;
      return { id, nota: Math.round(nota * 10) / 10 };
    })
    .filter(Boolean);

  fs.writeFileSync(
    path.join(OUT_DIR, 'notas.json'),
    JSON.stringify(linhas, null, 2)
  );
  console.log(`\nSalvo em scripts/ratings-out/notas.json (${linhas.length} registros)`);
}

main().catch((err) => {
  console.error('Erro fatal:', err);
  process.exit(1);
});
