import { createClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, nome, telefone } = await request.json();
    const supabase = await createClient();

    if (action === 'signup') {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            telefone,
          },
        },
      });

      if (authError) throw authError;

      // Criar cliente
      const { error: clientError } = await supabase
        .from('clientes')
        .insert({
          nome,
          email,
          telefone,
          auth_user_id: data.user?.id,
          ativo: true,
        });

      if (clientError) throw clientError;

      return NextResponse.json({ user: data.user });
    } else if (action === 'signin') {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return NextResponse.json({ user: data.user, session: data.session });
    } else if (action === 'signout') {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Ação não válida' }, { status: 400 });
  } catch (error: any) {
    console.error('Auth error:', error);
    return NextResponse.json(
      { error: error.message || 'Erro de autenticação' },
      { status: 400 }
    );
  }
}
