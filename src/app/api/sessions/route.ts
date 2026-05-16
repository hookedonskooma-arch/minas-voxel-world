import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const DEMO_USER_ID = '3f4c40cb-09d6-4f2b-b9d7-9104e2523ea2';

// GET /api/sessions — list active sessions for a world
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const worldId = searchParams.get('world_id');

  const supabase = createServiceClient();

  let query = (supabase
    .from('game_sessions') as any)
    .select('*')
    .eq('status', 'active');

  if (worldId) {
    query = query.eq('world_id', worldId);
  }

  const { data, error } = await query.order('started_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data || [] });
}

// POST /api/sessions — create or join a session
export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json().catch(() => ({}));
  const { action, world_id, session_id } = body;

  if (action === 'create' && world_id) {
    const { data, error } = await (supabase
      .from('game_sessions') as any)
      .insert({
        world_id,
        host_id: DEMO_USER_ID,
        status: 'active',
        player_count: 1,
        max_players: 8,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Add host as first player
    await (supabase.from('session_players') as any).insert({
      session_id: data.id,
      user_id: DEMO_USER_ID,
      position: { x: 0, y: 0 },
    });

    return NextResponse.json({ session: data }, { status: 201 });
  }

  if (action === 'join' && session_id) {
    const { data: existing } = await (supabase
      .from('session_players') as any)
      .select('*')
      .eq('session_id', session_id)
      .eq('user_id', DEMO_USER_ID)
      .is('left_at', null)
      .single();

    if (!existing) {
      const { error } = await (supabase.from('session_players') as any).insert({
        session_id,
        user_id: DEMO_USER_ID,
        position: { x: 0, y: 0 },
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      // Update player count
      await (supabase.from('game_sessions') as any)
        .update({ player_count: (await (supabase.from('session_players') as any).select('*').eq('session_id', session_id).is('left_at', null)).data?.length || 1 })
        .eq('id', session_id);
    }

    return NextResponse.json({ joined: true });
  }

  if (action === 'leave' && session_id) {
    const { error } = await (supabase.from('session_players') as any)
      .update({ left_at: new Date().toISOString() })
      .eq('session_id', session_id)
      .eq('user_id', DEMO_USER_ID)
      .is('left_at', null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ left: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
