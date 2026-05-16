import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

const DEMO_USER_ID = '3f4c40cb-09d6-4f2b-b9d7-9104e2523ea2';

// Demo quest data — in production this would come from a quests table
const DAILY_QUEST = {
  id: 'quest-001',
  title: 'Design a cloud garden',
  description: 'Earn a moon bow by placing three cozy objects and naming your garden.',
  kicker: 'Daily quest',
  steps: [
    { label: 'Add soft trees', status: 'done' as const },
    { label: 'Invite one approved friend', status: 'next' as const },
    { label: 'Choose a garden name', status: 'locked' as const },
  ],
  rewards: [
    { type: 'learn' as const, title: 'Shapes', description: 'Match roof patterns' },
    { type: 'reward' as const, title: 'Bow', description: 'Moon ribbon' },
  ],
};

// GET /api/quests — get current daily quest
export async function GET() {
  const supabase = createServiceClient();

  // Check if user has quest progress stored in activity_events
  const { data: events } = await (supabase
    .from('activity_events') as any)
    .select('*')
    .eq('user_id', DEMO_USER_ID)
    .eq('entity_type', 'quest')
    .eq('action', 'progress')
    .order('created_at', { ascending: false })
    .limit(1);

  const progress = events?.[0]?.metadata?.progress ?? 66;

  return NextResponse.json({
    quest: DAILY_QUEST,
    progress,
  });
}

// POST /api/quests — update quest progress
export async function POST(req: NextRequest) {
  const supabase = createServiceClient();
  const body = await req.json().catch(() => ({}));
  const { progress, step_index } = body;

  const { data, error } = await (supabase
    .from('activity_events') as any)
    .insert({
      user_id: DEMO_USER_ID,
      entity_type: 'quest',
      entity_id: DAILY_QUEST.id,
      action: 'progress',
      metadata: { progress, step_index },
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}
