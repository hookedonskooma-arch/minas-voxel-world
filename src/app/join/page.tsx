'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useMultiplayer } from '@/lib/voxel/multiplayer';

export default function JoinPage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);
  const joinRoom = useMultiplayer((s) => s.joinRoom);

  const handleJoin = () => {
    if (code.length !== 4) {
      setError('Room code must be 4 digits');
      return;
    }
    if (!name.trim()) {
      setError('Enter your name');
      return;
    }
    setError('');
    setJoining(true);
    joinRoom(code, name.trim());
    setTimeout(() => {
      router.push('/play');
    }, 500);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'grid', placeItems: 'center',
      background: 'linear-gradient(180deg, oklch(97% 0.025 236), oklch(99% 0.018 350))',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{
        background: 'white', borderRadius: 24, padding: 32, maxWidth: 380, width: '90%',
        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
      }}>
        <Link href="/" style={{ fontSize: 12, color: '#9CA3AF', textDecoration: 'none' }}>← Back home</Link>

        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎮</div>
          <h1 style={{ fontSize: 22, color: '#004F71', margin: 0 }}>Join a World</h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 8 }}>
            Enter the 4-digit code your friend shared to play together.
          </p>
        </div>

        {/* Name input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 6 }}>
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lulu"
            maxLength={12}
            style={{
              width: '100%', padding: '12px 16px', borderRadius: 12, fontSize: 16,
              border: '2px solid #E5E7EB', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00B398')}
            onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
          />
        </div>

        {/* Code input */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: 6 }}>
            Room code
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="••••"
            inputMode="numeric"
            maxLength={4}
            style={{
              width: '100%', padding: '16px', borderRadius: 12, fontSize: 28,
              textAlign: 'center', fontWeight: 800, letterSpacing: 8,
              border: '2px solid #E5E7EB', outline: 'none', color: '#004F71',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#00B398')}
            onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
          />
        </div>

        {error && (
          <p style={{ color: '#EF4444', fontSize: 12, marginBottom: 12, textAlign: 'center' }}>{error}</p>
        )}

        <button
          onClick={handleJoin}
          disabled={joining || code.length !== 4 || !name.trim()}
          style={{
            width: '100%', padding: '14px', borderRadius: 14, fontSize: 15, fontWeight: 700,
            background: code.length === 4 && name.trim() ? '#00B398' : '#E5E7EB',
            color: code.length === 4 && name.trim() ? '#fff' : '#9CA3AF',
            border: 'none', cursor: code.length === 4 && name.trim() ? 'pointer' : 'default',
            transition: 'all 0.2s',
          }}
        >
          {joining ? 'Joining…' : 'Join World'}
        </button>

        {/* Safety note */}
        <div style={{
          marginTop: 24, padding: 12, borderRadius: 12,
          background: 'color-mix(in oklch, #00B398, white 92%)',
          fontSize: 11, color: '#004F71', textAlign: 'center', lineHeight: 1.5,
        }}>
          🔒 Safe play: No Minecraft servers, parent-approved friends only, sticker chat.
        </div>
      </div>
    </div>
  );
}