import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';

const AvatarAppearanceSchema = z.object({
  version: z.number().default(1),
  body: z.object({
    size: z.enum(['tiny', 'small', 'medium']),
    skinTone: z.string().regex(/^#[0-9A-F]{6}$/i),
  }),
  face: z.object({
    eyeShape: z.enum(['thin', 'big', 'sparkly', 'sleepy']),
    eyeColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    blush: z.enum(['none', 'soft', 'rosy', 'dramatic']),
  }),
  hair: z.object({
    length: z.enum(['short', 'medium', 'long', 'extra_long']),
    style: z.enum(['straight', 'curly', 'pigtails', 'spiky', 'bob']),
    color: z.string().regex(/^#[0-9A-F]{6}$/i),
    highlightColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  }),
  clothing: z.object({
    top: z.enum(['dress', 'shirt', 'hoodie', 'kimono']),
    bottom: z.enum(['skirt', 'pants', 'shorts', 'none']).optional(),
    material: z.enum(['lace', 'leather', 'cotton', 'silk', 'denim']),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    pattern: z.enum(['solid', 'stripes', 'dots', 'floral', 'checkered']).optional(),
  }),
  accessories: z.array(z.string()).max(5),
});

const CreateAvatarSchema = z.object({
  name: z.string().min(1).max(50),
  appearance: AvatarAppearanceSchema,
  isDefault: z.boolean().default(false),
});

const DEMO_USER_ID = '3f4c40cb-09d6-4f2b-b9d7-9104e2523ea2';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = CreateAvatarSchema.parse(body);

    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('avatars')
      .insert({
        user_id: DEMO_USER_ID,
        name: validated.name,
        appearance: validated.appearance as any,
        is_default: validated.isDefault,
      } as any)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ avatar: data }, { status: 201 });
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
      .from('avatars')
      .select('*')
      .eq('user_id', DEMO_USER_ID)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ avatars: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
