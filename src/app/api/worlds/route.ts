import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';

const ThemeSchema = z.object({
  primaryColor: z.string(),
  secondaryColor: z.string(),
  skyGradient: z.tuple([z.string(), z.string()]),
  ambientLight: z.number(),
  weather: z.enum(['clear', 'rain', 'snow', 'sunny', 'sunset']),
});

const TileMapSchema = z.object({
  width: z.number(),
  height: z.number(),
  tileSize: z.number(),
  layers: z.array(z.any()),
});

const CreateWorldSchema = z.object({
  name: z.string().min(1).max(100),
  biome: z.string(),
  theme: ThemeSchema,
  tile_map: TileMapSchema,
  buildings: z.array(z.any()).default([]),
  is_public: z.boolean().default(false),
});

const DEMO_USER_ID = '3f4c40cb-09d6-4f2b-b9d7-9104e2523ea2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateWorldSchema.parse(body);

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('worlds')
      .insert({
        owner_id: DEMO_USER_ID,
        name: validated.name,
        biome: validated.biome,
        theme: validated.theme as any,
        tile_map: validated.tile_map as any,
        buildings: validated.buildings as any,
        is_public: validated.is_public,
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ world: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('worlds')
      .select('*')
      .eq('owner_id', DEMO_USER_ID)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ worlds: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
