import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseServiceKey) {
  console.error('SUPABASE_SERVICE_ROLE_KEY não configurada. Adicione em .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigrations() {
  console.log('📋 Aplicando migrações SQL...');
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir).sort();

  for (const file of files) {
    if (!file.endsWith('.sql')) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    console.log(`  → ${file}`);
    const { error } = await supabase.rpc('exec', { sql });
    if (error) {
      console.error(`    ✗ Erro: ${error.message}`);
    } else {
      console.log(`    ✓ OK`);
    }
  }
}

async function seedTestData() {
  console.log('\n🌱 Gerando dados de teste...');

  // 1. Inserir configurações
  console.log('  → Configurações');
  await supabase.from('configuracoes').upsert([
    { chave: 'preco_centavos', valor_int: 1500, descricao: 'Preço padrão de locação (R$ 15,00)' },
    { chave: 'multa_dia_centavos', valor_int: 500, descricao: 'Multa por atraso (R$ 5,00)' },
    { chave: 'prazo_dias', valor_int: 3, descricao: 'Prazo padrão de locação' },
    { chave: 'reserva_horas', valor_int: 24, descricao: 'Validade de reserva em horas' },
  ]);

  // 2. Carregar filmes
  console.log('  → Filmes (2976)');
  const dataPath = path.join(process.cwd(), 'public', 'dados', 'filmes_locadora_dataset.json');
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

  const filmesPrepared = data.filmes.map((f: any) => ({
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
    importado_em: new Date().toISOString(),
  }));

  // Inserir em lotes de 100
  for (let i = 0; i < filmesPrepared.length; i += 100) {
    const batch = filmesPrepared.slice(i, i + 100);
    const { error } = await supabase.from('filmes').insert(batch);
    if (error) {
      console.error(`    ✗ Lote ${i}-${i + 100}: ${error.message}`);
    }
  }
  console.log(`    ✓ ${filmesPrepared.length} filmes inseridos`);

  // 3. Inserir exemplares
  console.log('  → Exemplares (1 por filme)');
  const exemplares: any[] = [];
  const filmesFromDB = await supabase.from('filmes').select('id');
  filmesFromDB.data?.forEach((f: any, idx: number) => {
    exemplares.push({
      filme_id: f.id,
      codigo: `EX-${String(idx).padStart(6, '0')}`,
      formato_midia: idx % 3 === 0 ? 'DVD' : idx % 3 === 1 ? 'Blu-ray' : 'Digital',
      formato_simulado: idx % 20 === 0,
      ativo: true,
    });
  });

  for (let i = 0; i < exemplares.length; i += 100) {
    const batch = exemplares.slice(i, i + 100);
    await supabase.from('exemplares').insert(batch);
  }
  console.log(`    ✓ ${exemplares.length} exemplares inseridos`);

  // 4. Inserir clientes de teste
  console.log('  → Clientes de teste');
  const clientes = [
    { nome: 'João Silva', email: 'joao@test.com', telefone: '11987654321', ativo: true },
    { nome: 'Maria Santos', email: 'maria@test.com', telefone: '11987654322', ativo: true },
    { nome: 'Pedro Oliveira', email: 'pedro@test.com', telefone: '11987654323', ativo: true },
    { nome: 'Ana Costa', email: 'ana@test.com', telefone: '11987654324', ativo: true },
    { nome: 'Carlos Mendes', email: 'carlos@test.com', telefone: '11987654325', ativo: true },
  ];
  await supabase.from('clientes').insert(clientes);
  console.log(`    ✓ ${clientes.length} clientes inseridos`);

  console.log('\n✅ Dados de teste gerados com sucesso!');
}

async function main() {
  try {
    await runMigrations();
    await seedTestData();
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

main();
