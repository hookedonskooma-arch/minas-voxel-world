// Lightweight persistence layer.
// Falls back to localStorage when Supabase credentials are not configured.
// When you add real Supabase credentials to .env.local, swap this to use the Supabase client.

const STORAGE_KEY = 'minas-world-data';

interface StoredData {
  avatars: AvatarRecord[];
  worlds: WorldRecord[];
}

interface AvatarRecord {
  id: string;
  name: string;
  appearance: unknown;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface WorldRecord {
  id: string;
  name: string;
  biome: string;
  theme: unknown;
  tile_map: unknown;
  buildings: unknown;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

function load(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StoredData;
  } catch {
    // ignore parse errors
  }
  return { avatars: [], worlds: [] };
}

function save(data: StoredData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function listAvatars(): AvatarRecord[] {
  return load().avatars.filter((a) => !a.id.startsWith('deleted-'));
}

export function createAvatar(payload: {
  name: string;
  appearance: unknown;
  is_default: boolean;
}): AvatarRecord {
  const data = load();
  const record: AvatarRecord = {
    id: `avatar-${Date.now()}`,
    name: payload.name,
    appearance: payload.appearance,
    is_default: payload.is_default,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.avatars.unshift(record);
  save(data);
  return record;
}

export function updateAvatar(
  id: string,
  payload: Partial<{ name: string; appearance: unknown; is_default: boolean }>
): AvatarRecord | null {
  const data = load();
  const idx = data.avatars.findIndex((a) => a.id === id);
  if (idx === -1) return null;
  data.avatars[idx] = { ...data.avatars[idx], ...payload, updated_at: new Date().toISOString() };
  save(data);
  return data.avatars[idx];
}

export function deleteAvatar(id: string): boolean {
  const data = load();
  const idx = data.avatars.findIndex((a) => a.id === id);
  if (idx === -1) return false;
  data.avatars[idx].id = `deleted-${id}`;
  save(data);
  return true;
}

export function listWorlds(): WorldRecord[] {
  return load().worlds.filter((w) => !w.id.startsWith('deleted-'));
}

export function createWorld(payload: {
  name: string;
  biome: string;
  theme: unknown;
  tile_map: unknown;
  buildings: unknown;
  is_public: boolean;
}): WorldRecord {
  const data = load();
  const record: WorldRecord = {
    id: `world-${Date.now()}`,
    name: payload.name,
    biome: payload.biome,
    theme: payload.theme,
    tile_map: payload.tile_map,
    buildings: payload.buildings,
    is_public: payload.is_public,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  data.worlds.unshift(record);
  save(data);
  return record;
}

export function updateWorld(
  id: string,
  payload: Partial<{
    name: string;
    biome: string;
    theme: unknown;
    tile_map: unknown;
    buildings: unknown;
    is_public: boolean;
  }>
): WorldRecord | null {
  const data = load();
  const idx = data.worlds.findIndex((w) => w.id === id);
  if (idx === -1) return null;
  data.worlds[idx] = { ...data.worlds[idx], ...payload, updated_at: new Date().toISOString() };
  save(data);
  return data.worlds[idx];
}

export function deleteWorld(id: string): boolean {
  const data = load();
  const idx = data.worlds.findIndex((w) => w.id === id);
  if (idx === -1) return false;
  data.worlds[idx].id = `deleted-${id}`;
  save(data);
  return true;
}
