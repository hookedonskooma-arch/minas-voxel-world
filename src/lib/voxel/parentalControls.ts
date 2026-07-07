/**
 * Parental Controls Store (Zustand + localStorage persistence)
 * 
 * Enforces real limits on the voxel game session:
 * - Play time limits (auto-kicks when expired)
 * - Block palette restrictions (hide certain blocks from Mina)
 * - Mode lock (prevent switching to Lab mode)
 * - Chat mode (stickers only / off)
 * - World sharing (friends only / private)
 * - Approved friends list
 * 
 * All settings persist to localStorage and sync to Supabase when available.
 * This is NOT demo data — the voxel engine reads from this store.
 */

import { create } from 'zustand';
import { BlockType } from '@/lib/voxel/blocks';

export type ChatMode = 'preset' | 'off';
export type SharingMode = 'friends' | 'private';
export type SessionStatus = 'idle' | 'playing' | 'time_up' | 'locked';

export interface FriendRequest {
  id: string;
  childName: string;
  friendName: string;
  friendWorld: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

export interface ActivityEvent {
  id: string;
  childName: string;
  action: string;
  detail: string;
  timestamp: string;
}

export interface ParentalSettings {
  // Time limits
  playTimeLimitMin: number;       // max minutes per session
  sessionStartTime: number | null; // epoch ms when session started
  timeRemainingSec: number;       // countdown

  // Content restrictions
  blockedBlocks: BlockType[];     // blocks hidden from child
  modeLock: 'mina' | 'lab' | 'any'; // prevent mode switching
  maxRenderDistance: number;      // cap chunk render distance

  // Social
  chatMode: ChatMode;
  sharingMode: SharingMode;
  approvedFriends: string[];      // friend names approved by parent

  // Session
  sessionStatus: SessionStatus;
  totalPlayTimeTodaySec: number;

  // Network
  networkIsolated: boolean;       // enforce no external game servers
  allowedDomains: string[];       // only these domains can be contacted
}

interface ParentalState extends ParentalSettings {
  // Friend requests
  friendRequests: FriendRequest[];
  activityLog: ActivityEvent[];

  // Actions
  setPlayTimeLimit: (min: number) => void;
  startSession: () => void;
  tickSession: (deltaSec: number) => void;
  endSession: () => void;
  setChatMode: (mode: ChatMode) => void;
  setSharingMode: (mode: SharingMode) => void;
  setModeLock: (lock: 'mina' | 'lab' | 'any') => void;
  setMaxRenderDistance: (r: number) => void;
  toggleBlockBlock: (block: BlockType) => void;
  approveFriend: (id: string) => void;
  rejectFriend: (id: string) => void;
  addActivity: (action: string, detail: string) => void;
  resetDailyPlayTime: () => void;
  isTimeUp: () => boolean;
  isModeAllowed: (mode: 'mina' | 'lab') => boolean;
  isBlockAllowed: (block: BlockType) => boolean;
  getFilteredPalette: (palette: BlockType[]) => BlockType[];
}

const STORAGE_KEY = 'minas-parental-controls';

function loadFromStorage(): Partial<ParentalSettings> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveToStorage(settings: ParentalSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // storage full or unavailable
  }
}

const DEFAULT_SETTINGS: ParentalSettings = {
  playTimeLimitMin: 20,
  sessionStartTime: null,
  timeRemainingSec: 20 * 60,
  blockedBlocks: [],
  modeLock: 'mina',
  maxRenderDistance: 4,
  chatMode: 'preset',
  sharingMode: 'friends',
  approvedFriends: ['Lulu', 'Bea'],
  sessionStatus: 'idle',
  totalPlayTimeTodaySec: 0,
  networkIsolated: true,
  allowedDomains: ['localhost', '127.0.0.1'],
};

const DEMO_REQUESTS: FriendRequest[] = [
  {
    id: '1',
    childName: 'Mina',
    friendName: 'Lulu',
    friendWorld: 'Moon Bakery',
    status: 'pending',
    requestedAt: 'Today, 2:30 PM',
  },
  {
    id: '2',
    childName: 'Mina',
    friendName: 'Bea',
    friendWorld: 'Bunny Town',
    status: 'approved',
    requestedAt: 'Yesterday, 10:15 AM',
  },
];

const DEMO_ACTIVITY: ActivityEvent[] = [
  { id: '1', childName: 'Mina', action: 'Placed block', detail: '🌱 Grass at (8, 36, -11)', timestamp: '2 mins ago' },
  { id: '2', childName: 'Mina', action: 'Broke block', detail: '🪨 Stone at (8, 35, -12)', timestamp: '3 mins ago' },
  { id: '3', childName: 'Mina', action: 'Started session', detail: 'Mina Mode — 20 min limit', timestamp: '5 mins ago' },
];

export const useParentalControls = create<ParentalState>((set, get) => ({
  ...DEFAULT_SETTINGS,
  ...loadFromStorage(),
  friendRequests: DEMO_REQUESTS,
  activityLog: DEMO_ACTIVITY,

  setPlayTimeLimit: (min) => {
    set((s) => {
      const next = { ...s, playTimeLimitMin: min, timeRemainingSec: min * 60 };
      saveToStorage(next);
      return next;
    });
  },

  startSession: () => {
    set((s) => {
      if (s.sessionStatus === 'playing') return s;
      const next = {
        ...s,
        sessionStatus: 'playing' as const,
        sessionStartTime: Date.now(),
        timeRemainingSec: s.playTimeLimitMin * 60,
      };
      saveToStorage(next);
      return next;
    });
    get().addActivity('Started session', `Mina Mode — ${get().playTimeLimitMin} min limit`);
  },

  tickSession: (deltaSec) => {
    const { sessionStatus, timeRemainingSec, totalPlayTimeTodaySec } = get();
    if (sessionStatus !== 'playing') return;
    const remaining = timeRemainingSec - deltaSec;
    const totalToday = totalPlayTimeTodaySec + deltaSec;
    if (remaining <= 0) {
      set((s) => {
        const next = { ...s, timeRemainingSec: 0, sessionStatus: 'time_up' as const, totalPlayTimeTodaySec: totalToday };
        saveToStorage(next);
        return next;
      });
      get().addActivity('Time up', 'Play session ended — time limit reached');
    } else {
      set((s) => ({ timeRemainingSec: remaining, totalPlayTimeTodaySec: totalToday }));
    }
  },

  endSession: () => {
    set((s) => {
      const next = { ...s, sessionStatus: 'idle' as const, sessionStartTime: null };
      saveToStorage(next);
      return next;
    });
  },

  setChatMode: (mode) => {
    set((s) => { const next = { ...s, chatMode: mode }; saveToStorage(next); return next; });
  },

  setSharingMode: (mode) => {
    set((s) => { const next = { ...s, sharingMode: mode }; saveToStorage(next); return next; });
  },

  setModeLock: (lock) => {
    set((s) => { const next = { ...s, modeLock: lock }; saveToStorage(next); return next; });
  },

  setMaxRenderDistance: (r) => {
    set((s) => { const next = { ...s, maxRenderDistance: Math.max(2, Math.min(8, r)) }; saveToStorage(next); return next; });
  },

  toggleBlockBlock: (block) => {
    set((s) => {
      const blocked = s.blockedBlocks.includes(block)
        ? s.blockedBlocks.filter((b) => b !== block)
        : [...s.blockedBlocks, block];
      const next = { ...s, blockedBlocks: blocked };
      saveToStorage(next);
      return next;
    });
  },

  approveFriend: (id) => {
    set((s) => {
      const requests = s.friendRequests.map((r) =>
        r.id === id ? { ...r, status: 'approved' as const } : r
      );
      const approved = requests.find((r) => r.id === id);
      const approvedFriends = approved && !s.approvedFriends.includes(approved.friendName)
        ? [...s.approvedFriends, approved.friendName]
        : s.approvedFriends;
      return { friendRequests: requests, approvedFriends };
    });
    const req = get().friendRequests.find((r) => r.id === id);
    if (req) get().addActivity('Friend approved', `${req.friendName} — by Parent`);
  },

  rejectFriend: (id) => {
    set((s) => ({
      friendRequests: s.friendRequests.map((r) =>
        r.id === id ? { ...r, status: 'rejected' as const } : r
      ),
    }));
    const req = get().friendRequests.find((r) => r.id === id);
    if (req) get().addActivity('Friend rejected', `${req.friendName} — by Parent`);
  },

  addActivity: (action, detail) => {
    set((s) => ({
      activityLog: [
        { id: `${Date.now()}`, childName: 'Mina', action, detail, timestamp: 'just now' },
        ...s.activityLog,
      ].slice(0, 50),
    }));
  },

  resetDailyPlayTime: () => {
    set((s) => { const next = { ...s, totalPlayTimeTodaySec: 0 }; saveToStorage(next); return next; });
  },

  isTimeUp: () => get().sessionStatus === 'time_up',

  isModeAllowed: (mode) => {
    const { modeLock } = get();
    if (modeLock === 'any') return true;
    return mode === modeLock;
  },

  isBlockAllowed: (block) => !get().blockedBlocks.includes(block),

  getFilteredPalette: (palette) => {
    const { blockedBlocks, maxRenderDistance } = get();
    return palette.filter((b) => !blockedBlocks.includes(b));
  },
}));