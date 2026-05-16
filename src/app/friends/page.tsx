'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';
import ChatPanel from '@/components/ChatPanel';

interface Friend {
  id: string;
  name: string;
  initials: string;
  world: string;
  status: 'online' | 'ask' | 'later';
  gradient: string;
}

const FRIENDS: Friend[] = [
  {
    id: '1',
    name: 'Lulu',
    initials: 'Lu',
    world: 'Moon Bakery',
    status: 'online',
    gradient: 'linear-gradient(135deg, var(--bubble), var(--star))',
  },
  {
    id: '2',
    name: 'Bea',
    initials: 'Be',
    world: 'Bunny Town',
    status: 'ask',
    gradient: 'linear-gradient(135deg, var(--mint), var(--sky))',
  },
  {
    id: '3',
    name: 'Zoe',
    initials: 'Zo',
    world: 'Rainbow Park',
    status: 'later',
    gradient: 'linear-gradient(135deg, var(--star), var(--bubble))',
  },
];

const STATUS_LABEL: Record<Friend['status'], string> = {
  online: 'Online',
  ask: 'Ask',
  later: 'Later',
};

const STICKERS = ['👋', '❤️', '🌟', '🎀', '🌸', '☁️'];

export default function FriendsPage() {
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(FRIENDS[0]);
  const [invited, setInvited] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  const handleInvite = () => {
    setInvited(true);
    setTimeout(() => setInvited(false), 3000);
  };

  return (
    <div className="phone-screen">
      <div className="ios-status">
        <span>9:41</span>
        <span>5G 100%</span>
      </div>

      <main className="app-shell">
        {/* Top Bar */}
        <nav className="topbar">
          <span className="avatar-chip">Friend Visit</span>
          <span className="badge">Safe chat</span>
        </nav>

        {/* Hero Card */}
        <section className="hero-card">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <p className="kicker">Approved now</p>
            <h2>
              {selectedFriend
                ? `${selectedFriend.name} can visit Cloud Plaza.`
                : 'Invite a friend to play.'}
            </h2>
            <p style={{ marginTop: 10 }}>
              Play together for 20 minutes with sticker chat and parent-approved voice off.
            </p>
            <div className="button-row" style={{ marginTop: 16 }}>
              <button className="primary-btn" onClick={handleInvite}>
                {invited ? 'Invite sent!' : `Invite ${selectedFriend?.name || 'friend'}`}
              </button>
              <button
                className="secondary-btn"
                onClick={() => setShowStickers(true)}
              >
                Send sticker
              </button>
            </div>
          </div>
        </section>

        {/* Friends List */}
        <section className="panel">
          <h3>Friends nearby</h3>
          {FRIENDS.map((friend) => (
            <div
              key={friend.id}
              className="friend-row"
              onClick={() => setSelectedFriend(friend)}
              style={{ cursor: 'pointer' }}
            >
              <span
                className="friend-face"
                style={{ background: friend.gradient }}
              >
                {friend.initials}
              </span>
              <div style={{ flex: 1 }}>
                <strong>{friend.name}</strong>
                <p>{friend.world}</p>
              </div>
              <span className="badge">{STATUS_LABEL[friend.status]}</span>
            </div>
          ))}
        </section>

        {/* Safety Sheet */}
        <section className="sheet">
          <div className="safety-row">
            <span>Free text chat</span>
            <strong>Off</strong>
          </div>
          <div className="safety-row">
            <span>Visit timer</span>
            <strong>20 min</strong>
          </div>
        </section>

        <ChatPanel />

        <BottomNav />
      </main>

      {/* Sticker Modal */}
      {showStickers && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: 'color-mix(in oklch, black, transparent 60%)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="panel" style={{ width: 300, padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Send a sticker</h3>
            <div
              className="grid-2"
              style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}
            >
              {STICKERS.map((s) => (
                <button
                  key={s}
                  className="icon-btn"
                  style={{ fontSize: 28, borderRadius: 20 }}
                  onClick={() => setShowStickers(false)}
                >
                  {s}
                </button>
              ))}
            </div>
            <button
              className="secondary-btn"
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => setShowStickers(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
