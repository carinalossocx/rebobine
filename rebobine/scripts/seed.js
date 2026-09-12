const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY são obrigatórios');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedFilmes() {
  console.log('📽️  Carregando filmes (2976)...');
  const dataPath = path.join(process.cwd(), 'public', 'dados', 'filmes_locadora_dataset.json');
  const { filmes } = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const prepared = filmes.map((f) => ({
    chave_externa: f.id_tmdb ? `tmdb:${f.id_tmdb}` : `wikidata:${f.id_wikidata}`,
    id_tmdb: f.id_tmdb || f.id_wikidata,
    titulo: f.title || f.titulo,
    titulo_original: f.original_title || f.titulo_original || null,
    sinopse: f.overview || f.sinopse || null,
    data_lancamento: f.release_date || (f.ano_lancamento ? `${f.ano_lancamento}-01-01` : null),
    generos: f.genres || f.generos || [],
    nota_tmdb: f.vote_average || f.classificacao || null,
    votos_tmdb: f.vote_count || null,
    classificacao_adulto: f.adult || false,
    status_tmdb: f.status || null,
    poster_path: f.poster_path || f.imagem_url || null,
    ativo: true,
    dados_origem: f,
  }));

  let inserted = 0;
  for (let i = 0; i < prepared.length; i += 100) {
    const batch = prepared.slice(i, i + 100);
    const { error } = await supabase.from('filmes').insert(batch);
    if (error) {
      console.error(`  Erro no lote ${i}-${i + 100}:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  ✓ ${inserted}/${prepared.length}`);
    }
  }
  console.log(`\n  ✅ ${inserted} filmes inseridos`);
}

async function seedExemplares() {
  console.log('\n📦 Criando exemplares (1 por filme)...');
  const { data: filmes } = await supabase.from('filmes').select('id').limit(1000);

  let totalFilmes = filmes?.length || 0;
  let offset = 1000;

  // Contar total de filmes
  while (true) {
    const { data: batch } = await supabase.from('filmes').select('id').range(offset, offset + 999);
    if (!batch || batch.length === 0) break;
    totalFilmes += batch.length;
    offset += 1000;
  }

  const exemplares = [];
  offset = 0;
  let processed = 0;

  while (processed < totalFilmes) {
    const { data: batch } = await supabase.from('filmes').select('id').range(offset, offset + 999);
    if (!batch || batch.length === 0) break;

    batch.forEach((f, idx) => {
      exemplares.push({
        filme_id: f.id,
        codigo: `EX-${String(offset + idx).padStart(6, '0')}`,
        formato_midia: (offset + idx) % 3 === 0 ? 'DVD' : (offset + idx) % 3 === 1 ? 'Blu-ray' : 'Digital',
        ativo: true,
      });
    });

    processed += batch.length;
    offset += 1000;
  }

  let inserted = 0;
  for (let i = 0; i < exemplares.length; i += 100) {
    const batch = exemplares.slice(i, i + 100);
    const { error } = await supabase.from('exemplares').insert(batch);
    if (error) {
      console.error(`  Erro no lote ${i}-${i + 100}:`, error.message);
    } else {
      inserted += batch.length;
      process.stdout.write(`\r  ✓ ${inserted}/${exemplares.length}`);
    }
  }
  console.log(`\n  ✅ ${inserted} exemplares inseridos`);
}

async function seedClientes() {
  console.log('\n👥 Criando clientes de teste (5)...');
  const clientes = [
    { nome: 'João Silva', email: 'joao@test.com', telefone: '11987654321', ativo: true },
    { nome: 'Maria Santos', email: 'maria@test.com', telefone: '11987654322', ativo: true },
    { nome: 'Pedro Oliveira', email: 'pedro@test.com', telefone: '11987654323', ativo: true },
    { nome: 'Ana Costa', email: 'ana@test.com', telefone: '11987654324', ativo: true },
    { nome: 'Carlos Mendes', email: 'carlos@test.com', telefone: '11987654325', ativo: true },
  ];

  const { error } = await supabase.from('clientes').insert(clientes);
  if (error) {
    console.error('  ❌ Erro:', error.message);
  } else {
    console.log(`  ✅ ${clientes.length} clientes inseridos`);
  }
}

async function main() {
  try {
    await seedFilmes();
    await seedExemplares();
    await seedClientes();
    console.log('\n🎉 Seeding completo!\n');
  } catch (error) {
    console.error('Erro fatal:', error);
    process.exit(1);
  }
}

main();
