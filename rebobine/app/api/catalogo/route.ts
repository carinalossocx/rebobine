import { createClient } from '@/lib/supabase-server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const filmes: any[] = [];
    const pageSize = 1000;
    let offset = 0;

    while (true) {
      const { data, error } = await supabase
        .from('filmes')
        .select('*')
        .eq('ativo', true)
        .order('titulo', { ascending: true })
        .range(offset, offset + pageSize - 1);

      if (error) throw error;
      if (!data || data.length === 0) break;

      filmes.push(...data);
      if (data.length < pageSize) break;
      offset += pageSize;
    }

    return NextResponse.json({ filmes });
  } catch (error) {
    console.error('API /catalogo erro:', error);
    return NextResponse.json({ error: 'Erro ao carregar catálogo' }, { status: 500 });
  }
}
