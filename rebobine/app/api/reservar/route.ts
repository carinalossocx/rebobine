import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { filme_id, cliente_email } = await request.json();

    if (!filme_id || !cliente_email) {
      return NextResponse.json(
        { erro: 'DADOS_INCOMPLETOS' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc('reservar_publico', {
        p_filme_id: filme_id,
        p_cliente_email: cliente_email,
      })
      .single();

    if (error) throw error;

    const resultado = data as { reserva_id: string | null; expira_em: string | null; erro: string | null };

    if (resultado.erro) {
      return NextResponse.json({ erro: resultado.erro }, { status: 400 });
    }

    return NextResponse.json({
      reserva_id: resultado.reserva_id,
      expira_em: resultado.expira_em,
    });
  } catch (error) {
    console.error('API /reservar erro:', error);
    return NextResponse.json({ erro: 'ERRO_INTERNO' }, { status: 500 });
  }
}
