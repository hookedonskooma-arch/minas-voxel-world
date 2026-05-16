'use client';

import { useState } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';

interface FriendRequest {
  id: string;
  childName: string;
  friendName: string;
  friendWorld: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
}

interface ActivityEvent {
  id: string;
  childName: string;
  action: string;
  detail: string;
  timestamp: string;
}

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
  { id: '1', childName: 'Mina', action: 'Placed object', detail: '🌳 Tree in Cloud Plaza', timestamp: '2 mins ago' },
  { id: '2', childName: 'Mina', action: 'Visited world', detail: "Lulu's Moon Bakery", timestamp: '15 mins ago' },
  { id: '3', childName: 'Mina', action: 'Completed quest', detail: 'Cloud Garden — earned Moon Bow', timestamp: '1 hour ago' },
  { id: '4', childName: 'Mina', action: 'Sent sticker', detail: '❤️ to Lulu', timestamp: '1 hour ago' },
  { id: '5', childName: 'Mina', action: 'Created world', detail: 'Cloud Plaza (Meadow)', timestamp: '2 hours ago' },
];

export default function ParentDashboardPage() {
  const [requests, setRequests] = useState(DEMO_REQUESTS);
  const [playTimer, setPlayTimer] = useState(20);
  const [chatMode, setChatMode] = useState<'preset' | 'off'>('preset');
  const [sharing, setSharing] = useState<'friends' | 'private'>('friends');

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'approved' as const } : r))
    );
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'rejected' as const } : r))
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="launcher">
        {/* Header */}
        <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <Link href="/" className="block">
            <div style={{ height: 48 }}>
              <Logo style={{ height: '100%', width: 'auto' } as React.CSSProperties} />
            </div>
          </Link>
          <span className="badge" style={{ fontSize: 14 }}>👤 Parent Dashboard</span>
        </nav>

        {/* Safety Settings */}
        <section className="hero-card" style={{ marginBottom: 18 }}>
          <p className="kicker">Safety controls</p>
          <h2>Keep play safe and visible.</h2>

          <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
            {/* Play Timer */}
            <div className="safety-row" style={{ padding: 0 }}>
              <div>
                <strong>Play timer</strong>
                <p style={{ fontSize: 13 }}>How long Mina can play per session</p>
              </div>
              <div className="preset-row" style={{ gap: 6 }}>
                {[15, 20, 30, 60].map((min) => (
                  <button
                    key={min}
                    className={`preset ${playTimer === min ? 'is-active' : ''}`}
                    onClick={() => setPlayTimer(min)}
                    style={{ fontSize: 12, padding: '0 10px', minHeight: 32 }}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            {/* Chat Mode */}
            <div className="safety-row" style={{ padding: 0 }}>
              <div>
                <strong>Chat mode</strong>
                <p style={{ fontSize: 13 }}>What Mina can send to friends</p>
              </div>
              <div className="preset-row" style={{ gap: 6 }}>
                {[
                  { id: 'preset' as const, label: 'Stickers only' },
                  { id: 'off' as const, label: 'Off' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    className={`preset ${chatMode === mode.id ? 'is-active' : ''}`}
                    onClick={() => setChatMode(mode.id)}
                    style={{ fontSize: 12, padding: '0 10px', minHeight: 32 }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sharing */}
            <div className="safety-row" style={{ padding: 0 }}>
              <div>
                <strong>World sharing</strong>
                <p style={{ fontSize: 13 }}>Who can visit Mina&apos;s worlds</p>
              </div>
              <div className="preset-row" style={{ gap: 6 }}>
                {[
                  { id: 'friends' as const, label: 'Friends only' },
                  { id: 'private' as const, label: 'Private' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    className={`preset ${sharing === mode.id ? 'is-active' : ''}`}
                    onClick={() => setSharing(mode.id)}
                    style={{ fontSize: 12, padding: '0 10px', minHeight: 32 }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Friend Requests */}
        <section className="panel" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3>Friend requests</h3>
            <span className="badge">{requests.filter((r) => r.status === 'pending').length} pending</span>
          </div>

          {requests.map((req) => (
            <div key={req.id} className="friend-row">
              <span
                className="friend-face"
                style={{
                  background:
                    req.status === 'approved'
                      ? 'linear-gradient(135deg, var(--safe), var(--mint))'
                      : req.status === 'rejected'
                      ? 'linear-gradient(135deg, var(--warn), var(--coral))'
                      : 'linear-gradient(135deg, var(--bubble), var(--star))',
                }}
              >
                {req.friendName.slice(0, 2)}
              </span>
              <div style={{ flex: 1 }}>
                <strong>{req.friendName}</strong>
                <p style={{ fontSize: 12 }}>{req.friendWorld} • {req.requestedAt}</p>
              </div>
              {req.status === 'pending' ? (
                <div className="button-row" style={{ gap: 6 }}>
                  <button
                    className="primary-btn"
                    style={{ minHeight: 34, padding: '0 12px', fontSize: 12 }}
                    onClick={() => handleApprove(req.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="secondary-btn"
                    style={{ minHeight: 34, padding: '0 12px', fontSize: 12 }}
                    onClick={() => handleReject(req.id)}
                  >
                    Reject
                  </button>
                </div>
              ) : (
                <span className="badge">
                  {req.status === 'approved' ? '✓ Approved' : '✗ Rejected'}
                </span>
              )}
            </div>
          ))}
        </section>

        {/* Activity Log */}
        <section className="panel">
          <h3 style={{ marginBottom: 12 }}>Activity log</h3>
          {DEMO_ACTIVITY.map((event) => (
            <div key={event.id} className="safety-row" style={{ padding: '8px 0' }}>
              <div>
                <strong style={{ fontSize: 13 }}>{event.action}</strong>
                <p style={{ fontSize: 12, marginTop: 2 }}>{event.detail}</p>
              </div>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 800, whiteSpace: 'nowrap' }}>
                {event.timestamp}
              </span>
            </div>
          ))}
        </section>

        <footer style={{ marginTop: 40, textAlign: 'center' }}>
          <p style={{ fontSize: 12, color: 'var(--muted)' }}>
            Mina&apos;s World — Parent controls are always visible, never buried in settings.
          </p>
        </footer>
      </div>
    </div>
  );
}
