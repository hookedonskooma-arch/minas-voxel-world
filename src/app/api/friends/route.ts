import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const DEMO_USER_ID = '3f4c40cb-09d6-4f2b-b9d7-9104e2523ea2';

// GET /api/friends — list friends for the current user
export async function GET() {
  const supabase = createServiceClient();

  const { data: friendships, error } = await supabase
    .from('friendships')
    .select('*')
    .or(`requester_id.eq.${DEMO_USER_ID},addressee_id.eq.${DEMO_USER_ID}`)
    .eq('status', 'accepted')
    .is('deleted_at', null);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ friends: friendships || [] });
}

// POST /api/friends — request or respond to a friendship
export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json().catch(() => ({}));
  const { action, friend_id, friendship_id } = body;

  if (action === 'request' && friend_id) {
    const { data, error } = await supabase
      .from('friendships')
      .insert({
        requester_id: DEMO_USER_ID,
        addressee_id: friend_id,
        status: 'pending',
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ friendship: data }, { status: 201 });
  }

  if (action === 'approve' && friendship_id) {
    const { data, error } = await (supabase
      .from('friendships') as any)
      .update({ status: 'accepted' })
      .eq('id', friendship_id)
      .eq('addressee_id', DEMO_USER_ID)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ friendship: data });
  }

  if (action === 'reject' && friendship_id) {
    const { data, error } = await (supabase
      .from('friendships') as any)
      .update({ status: 'rejected', deleted_at: new Date().toISOString() })
      .eq('id', friendship_id)
      .eq('addressee_id', DEMO_USER_ID)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ friendship: data });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
