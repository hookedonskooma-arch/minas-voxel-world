/**
 * Voxel World Persistence
 * 
 * Saves/loads voxel chunk data to Supabase when credentials are configured,
 * falls back to localStorage when they're not (local dev, no Supabase).
 * 
 * Schema (added to supabase/schema.sql):
 *   voxel_worlds (id, owner_id, name, world_data TEXT, seed INT, 
 *                 mode TEXT, created_at, updated_at)
 *   voxel_worlds have RLS: owner can CRUD, friends can SELECT
 */

import { VoxelWorld } from './world';
import { WorldGenerator, WorldGenConfig } from './worldgen';

export interface SavedVoxelWorld {
  id: string;
  name: string;
  ownerName: string;
  seed: number;
  mode: 'mina' | 'lab';
  worldData: string; // serialized chunk JSON
  createdAt: string;
  updatedAt: string;
}

const LOCAL_KEY = 'minas-voxel-saves';

/**
 * Check if Supabase is configured (env vars present).
 */
function hasSupabase(): boolean {
  if (typeof window === 'undefined') return false;
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
}

// --- localStorage fallback ---

function loadLocal(): SavedVoxelWorld[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return [];
}

function saveLocal(saves: SavedVoxelWorld[]): void {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(saves));
  } catch { /* storage full */ }
}

// --- Public API ---

/**
 * Save the current voxel world state.
 * Serializes all loaded chunks and stores them.
 */
export async function saveVoxelWorld(
  world: VoxelWorld,
  meta: { name: string; ownerName: string; seed: number; mode: 'mina' | 'lab'; id?: string },
): Promise<SavedVoxelWorld> {
  const worldData = world.serialize();
  const now = new Date().toISOString();

  const record: SavedVoxelWorld = {
    id: meta.id || `world-${Date.now()}`,
    name: meta.name,
    ownerName: meta.ownerName,
    seed: meta.seed,
    mode: meta.mode,
    worldData,
    createdAt: now,
    updatedAt: now,
  };

  if (hasSupabase()) {
    // Save to Supabase
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { error } = await (supabase
        .from('voxel_worlds') as any)
        .upsert({
          id: record.id,
          name: record.name,
          owner_name: record.ownerName,
          seed: record.seed,
          mode: record.mode,
          world_data: record.worldData,
          updated_at: now,
        });
      if (error) throw error;
    } catch (err) {
      console.warn('[VoxelCanvas] Supabase save failed, falling back to localStorage:', err);
      // Fallback to local
      const saves = loadLocal();
      const idx = saves.findIndex((s) => s.id === record.id);
      if (idx >= 0) saves[idx] = record;
      else saves.unshift(record);
      saveLocal(saves);
    }
  } else {
    // localStorage only
    const saves = loadLocal();
    const idx = saves.findIndex((s) => s.id === record.id);
    if (idx >= 0) saves[idx] = record;
    else saves.unshift(record);
    saveLocal(saves);
  }

  return record;
}

/**
 * Load a saved voxel world and restore it into a VoxelWorld instance.
 */
export async function loadVoxelWorld(
  id: string,
  genConfig: WorldGenConfig,
): Promise<{ world: VoxelWorld; meta: SavedVoxelWorld } | null> {
  let record: SavedVoxelWorld | null = null;

  if (hasSupabase()) {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data, error } = await (supabase
        .from('voxel_worlds') as any)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      if (data) {
        record = {
          id: data.id,
          name: data.name,
          ownerName: data.owner_name,
          seed: data.seed,
          mode: data.mode,
          worldData: data.world_data,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (err) {
      console.warn('[VoxelCanvas] Supabase load failed, trying localStorage:', err);
    }
  }

  if (!record) {
    // Try localStorage
    const saves = loadLocal();
    record = saves.find((s) => s.id === id) || null;
  }

  if (!record) return null;

  // Reconstruct the world
  const gen = new WorldGenerator({ ...genConfig, seed: record.seed });
  const world = new VoxelWorld(gen);
  world.deserialize(record.worldData);

  return { world, meta: record };
}

/**
 * List all saved voxel worlds (for the world picker UI).
 */
export async function listVoxelWorlds(): Promise<SavedVoxelWorld[]> {
  if (hasSupabase()) {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { data, error } = await (supabase
        .from('voxel_worlds') as any)
        .select('id, name, owner_name, seed, mode, created_at, updated_at')
        .order('updated_at', { ascending: false });
      if (error) throw error;
      if (data) {
        return data.map((d: any) => ({
          id: d.id,
          name: d.name,
          ownerName: d.owner_name,
          seed: d.seed,
          mode: d.mode,
          worldData: '', // don't load full data for list view
          createdAt: d.created_at,
          updatedAt: d.updated_at,
        }));
      }
    } catch (err) {
      console.warn('[VoxelCanvas] Supabase list failed, using localStorage:', err);
    }
  }

  return loadLocal();
}

/**
 * Delete a saved voxel world.
 */
export async function deleteVoxelWorld(id: string): Promise<boolean> {
  if (hasSupabase()) {
    try {
      const { createClient } = await import('@/lib/supabase');
      const supabase = createClient();
      const { error } = await (supabase.from('voxel_worlds') as any).delete().eq('id', id);
      if (error) throw error;
      return true;
    } catch (err) {
      console.warn('[VoxelCanvas] Supabase delete failed:', err);
    }
  }

  const saves = loadLocal().filter((s) => s.id !== id);
  saveLocal(saves);
  return true;
}