/**
 * Multiplayer Session Store
 * 
 * Password-based friend joining system:
 * 1. Mina's game generates a 4-digit room code
 * 2. Parent approves the room code (visible on parent dashboard)
 * 3. Friends go to /join and enter the code
 * 4. Players sync via BroadcastChannel (same-device) — upgradeable to Supabase Realtime
 * 
 * All sync goes through the network guard — only localhost/allowed domains.
 * No Minecraft servers, no external game services.
 */

import { create } from 'zustand';

export interface RemotePlayer {
  id: string;
  name: string;
  color: string;
  position: { x: number; y: number; z: number };
  yaw: number;
  pitch: number;
  lastSeen: number;
  isHost: boolean;
}

export interface BlockEdit {
  id: number;
  x: number;
  y: number;
  z: number;
  blockType: number;
  action: 'place' | 'break';
  byPlayer: string;
  timestamp: number;
}

export type RoomStatus = 'inactive' | 'waiting' | 'active' | 'closed';

interface MultiplayerState {
  // Room
  roomCode: string | null;
  roomStatus: RoomStatus;
  isHost: boolean;
  playerName: string;
  playerColor: string;

  // Players
  players: Map<string, RemotePlayer>;
  playerList: RemotePlayer[]; // for React re-render

  // Block edits (sync log)
  blockEdits: BlockEdit[];

  // Actions
  createRoom: (playerName: string) => string;
  joinRoom: (code: string, playerName: string) => boolean;
  closeRoom: () => void;
  updateLocalPosition: (pos: { x: number; y: number; z: number }, yaw: number, pitch: number) => void;
  sendBlockEdit: (x: number, y: number, z: number, blockType: number, action: 'place' | 'break') => void;
  receiveBlockEdits: () => BlockEdit[];
  clearBlockEdits: () => void;

  // Internal
  _channel: BroadcastChannel | null;
  _playerId: string;
  _heartbeatInterval: ReturnType<typeof setInterval> | null;
}

const PLAYER_COLORS = [
  '#FF6B9D', '#4ECDC4', '#FFE66D', '#A8E6CF',
  '#FF8B94', '#6C5CE7', '#FDA7DF', '#74B9FF',
];

function generateRoomCode(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function randomId(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const useMultiplayer = create<MultiplayerState>((set, get) => ({
  roomCode: null,
  roomStatus: 'inactive',
  isHost: false,
  playerName: 'Mina',
  playerColor: PLAYER_COLORS[0],
  players: new Map(),
  playerList: [],
  blockEdits: [],
  _channel: null,
  _playerId: randomId(),
  _heartbeatInterval: null,

  createRoom: (playerName) => {
    const code = generateRoomCode();
    const playerId = get()._playerId;
    const channel = new BroadcastChannel(`voxel-room-${code}`);

    const hostPlayer: RemotePlayer = {
      id: playerId,
      name: playerName,
      color: PLAYER_COLORS[0],
      position: { x: 0, y: 40, z: 0 },
      yaw: 0,
      pitch: 0,
      lastSeen: Date.now(),
      isHost: true,
    };

    const players = new Map();
    players.set(playerId, hostPlayer);

    // Listen for join requests and position updates
    channel.onmessage = (e) => {
      const msg = e.data;
      handleChannelMessage(msg, set, get);
    };

    // Heartbeat — remove stale players
    const heartbeat = setInterval(() => {
      const now = Date.now();
      const players = get().players;
      let changed = false;
      for (const [id, p] of players) {
        if (id !== get()._playerId && now - p.lastSeen > 5000) {
          players.delete(id);
          changed = true;
        }
      }
      if (changed) {
        set({ playerList: Array.from(players.values()) });
      }
      // Send heartbeat
      channel.postMessage({
        type: 'heartbeat',
        playerId: get()._playerId,
        name: get().playerName,
        color: get().playerColor,
        position: get().players.get(get()._playerId)?.position || { x: 0, y: 40, z: 0 },
        yaw: get().players.get(get()._playerId)?.yaw || 0,
        pitch: get().players.get(get()._playerId)?.pitch || 0,
        isHost: get().isHost,
      });
    }, 1000);

    set({
      roomCode: code,
      roomStatus: 'waiting',
      isHost: true,
      playerName,
      playerColor: PLAYER_COLORS[0],
      players,
      playerList: Array.from(players.values()),
      _channel: channel,
      _heartbeatInterval: heartbeat,
    });

    return code;
  },

  joinRoom: (code, playerName) => {
    const playerId = get()._playerId;
    const channel = new BroadcastChannel(`voxel-room-${code}`);

    const joinPlayer: RemotePlayer = {
      id: playerId,
      name: playerName,
      color: PLAYER_COLORS[get().players.size % PLAYER_COLORS.length],
      position: { x: 2, y: 40, z: 2 },
      yaw: 0,
      pitch: 0,
      lastSeen: Date.now(),
      isHost: false,
    };

    const players = new Map();
    players.set(playerId, joinPlayer);

    channel.onmessage = (e) => {
      const msg = e.data;
      handleChannelMessage(msg, set, get);
    };

    // Send join announcement
    channel.postMessage({
      type: 'join',
      playerId,
      name: playerName,
      color: joinPlayer.color,
      position: joinPlayer.position,
    });

    // Heartbeat
    const heartbeat = setInterval(() => {
      const now = Date.now();
      const players = get().players;
      let changed = false;
      for (const [id, p] of players) {
        if (id !== get()._playerId && now - p.lastSeen > 5000) {
          players.delete(id);
          changed = true;
        }
      }
      if (changed) {
        set({ playerList: Array.from(players.values()) });
      }
      channel.postMessage({
        type: 'heartbeat',
        playerId: get()._playerId,
        name: get().playerName,
        color: get().playerColor,
        position: get().players.get(get()._playerId)?.position || { x: 0, y: 40, z: 0 },
        yaw: get().players.get(get()._playerId)?.yaw || 0,
        pitch: get().players.get(get()._playerId)?.pitch || 0,
        isHost: get().isHost,
      });
    }, 1000);

    set({
      roomCode: code,
      roomStatus: 'active',
      isHost: false,
      playerName,
      playerColor: joinPlayer.color,
      players,
      playerList: Array.from(players.values()),
      _channel: channel,
      _heartbeatInterval: heartbeat,
    });

    return true;
  },

  closeRoom: () => {
    const { _channel, _heartbeatInterval } = get();
    if (_channel) {
      _channel.postMessage({ type: 'leave', playerId: get()._playerId });
      _channel.close();
    }
    if (_heartbeatInterval) clearInterval(_heartbeatInterval);
    set({
      roomCode: null,
      roomStatus: 'closed',
      isHost: false,
      players: new Map(),
      playerList: [],
      _channel: null,
      _heartbeatInterval: null,
    });
  },

  updateLocalPosition: (pos, yaw, pitch) => {
    const { _channel, _playerId, players } = get();
    const me = players.get(_playerId);
    if (!me) return;
    me.position = pos;
    me.yaw = yaw;
    me.pitch = pitch;
    me.lastSeen = Date.now();
    if (_channel) {
      _channel.postMessage({
        type: 'move',
        playerId: _playerId,
        position: pos,
        yaw,
        pitch,
      });
    }
  },

  sendBlockEdit: (x, y, z, blockType, action) => {
    const { _channel, _playerId } = get();
    const edit: BlockEdit = {
      id: Date.now() + Math.random(),
      x, y, z, blockType, action,
      byPlayer: _playerId,
      timestamp: Date.now(),
    };
    // Add to local log
    set((s) => ({ blockEdits: [...s.blockEdits, edit] }));
    // Broadcast to others
    if (_channel) {
      _channel.postMessage({
        type: 'block_edit',
        playerId: _playerId,
        edit,
      });
    }
  },

  receiveBlockEdits: () => get().blockEdits,

  clearBlockEdits: () => set({ blockEdits: [] }),
}));

/**
 * Handle incoming BroadcastChannel messages.
 */
function handleChannelMessage(
  msg: any,
  set: (partial: Partial<MultiplayerState>) => void,
  get: () => MultiplayerState,
) {
  if (!msg || !msg.type) return;
  const players = get().players;
  const myId = get()._playerId;

  switch (msg.type) {
    case 'join': {
      // Someone is joining our room
      const newPlayer: RemotePlayer = {
        id: msg.playerId,
        name: msg.name,
        color: msg.color || PLAYER_COLORS[players.size % PLAYER_COLORS.length],
        position: msg.position || { x: 2, y: 40, z: 2 },
        yaw: 0,
        pitch: 0,
        lastSeen: Date.now(),
        isHost: false,
      };
      players.set(msg.playerId, newPlayer);
      set({ playerList: Array.from(players.values()), roomStatus: 'active' });
      // Respond with our presence so the joiner sees us
      const me = players.get(myId);
      if (me && get()._channel) {
        get()._channel!.postMessage({
          type: 'heartbeat',
          playerId: myId,
          name: get().playerName,
          color: get().playerColor,
          position: me.position,
          yaw: me.yaw,
          pitch: me.pitch,
          isHost: get().isHost,
        });
      }
      break;
    }

    case 'heartbeat':
    case 'move': {
      if (msg.playerId === myId) return;
      const existing = players.get(msg.playerId);
      if (existing) {
        existing.position = msg.position;
        existing.yaw = msg.yaw || 0;
        existing.pitch = msg.pitch || 0;
        existing.lastSeen = Date.now();
        existing.name = msg.name || existing.name;
        existing.color = msg.color || existing.color;
      } else {
        // New player discovered
        players.set(msg.playerId, {
          id: msg.playerId,
          name: msg.name || 'Friend',
          color: msg.color || PLAYER_COLORS[0],
          position: msg.position || { x: 0, y: 40, z: 0 },
          yaw: msg.yaw || 0,
          pitch: msg.pitch || 0,
          lastSeen: Date.now(),
          isHost: msg.isHost || false,
        });
        set({ playerList: Array.from(players.values()) });
      }
      if (msg.type === 'move') {
        set({ playerList: Array.from(players.values()) });
      }
      break;
    }

    case 'block_edit': {
      if (msg.playerId === myId) return;
      const edit = msg.edit as BlockEdit;
      set({ blockEdits: [...get().blockEdits, edit] });
      break;
    }

    case 'leave': {
      if (msg.playerId === myId) return;
      players.delete(msg.playerId);
      set({ playerList: Array.from(players.values()) });
      break;
    }
  }
}