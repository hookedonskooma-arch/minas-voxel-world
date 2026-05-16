'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';

interface PresenceUser {
  id: string;
  name: string;
  avatar?: string;
  x: number;
  y: number;
}

export function useRealtimePresence(worldId: string) {
  const [visitors, setVisitors] = useState<PresenceUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!worldId) return;

    const supabase = createClient();

    const channel = supabase.channel(`world:${worldId}`, {
      config: {
        presence: {
          key: 'visitor',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: PresenceUser[] = Object.values(state)
          .flat()
          .map((p: any) => ({
            id: p.user_id || 'unknown',
            name: p.user_name || 'Friend',
            avatar: p.avatar,
            x: p.x || 0,
            y: p.y || 0,
          }));
        setVisitors(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('join', key, newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('leave', key, leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({
            user_id: '3f4c40cb-09d6-4f2b-b9d7-9104e2523ea2',
            user_name: 'Mina',
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [worldId]);

  return { visitors, isConnected };
}
