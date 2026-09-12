const fs = require('fs');
const path = require('path');

// Gera arquivos .sql em lotes a partir de scripts/ratings-out/notas.json,
// prontos para rodar via mcp execute_sql (não usa client anon, pois a
// tabela filmes não tem policy de UPDATE para anon/authenticated).

const notasPath = path.join(process.cwd(), 'scripts', 'ratings-out', 'notas.json');
const notas = JSON.parse(fs.readFileSync(notasPath, 'utf-8'));

const BATCH = 500;
const outDir = path.join(process.cwd(), 'scripts', 'ratings-out');

for (let i = 0; i < notas.length; i += BATCH) {
  const lote = notas.slice(i, i + BATCH);
  const values = lote.map((n) => `('${n.id}', ${n.nota})`).join(',\n  ');
  const sql = `update filmes as f set nota_tmdb = v.nota, atualizado_em = now()\nfrom (values\n  ${values}\n) as v(id, nota)\nwhere f.id = v.id::uuid;`;
  const fileName = path.join(outDir, `update-${String(i / BATCH + 1).padStart(2, '0')}.sql`);
  fs.writeFileSync(fileName, sql);
  console.log(`Gerado ${fileName} (${lote.length} registros)`);
}
