'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Logo from '@/components/Logo';
import { useParentalControls } from '@/lib/voxel/parentalControls';
import { getIsolationReport, verifyIsolation, getBlockedDomains, type IsolationReport } from '@/lib/voxel/networkGuard';
import { BlockType, BLOCK_DEFS, MINA_PALETTE, LAB_PALETTE } from '@/lib/voxel/blocks';

export default function ParentDashboardPage() {
  const parental = useParentalControls();
  const [mounted, setMounted] = useState(false);
  const [isolationReport, setIsolationReport] = useState<IsolationReport | null>(null);
  const [verification, setVerification] = useState<{ verified: boolean; message: string } | null>(null);
  const [blockedDomains] = useState<string[]>([]);

  // Avoid hydration mismatch — only show client-only state after mount
  useEffect(() => {
    setMounted(true);
    setIsolationReport(getIsolationReport());
    setVerification(verifyIsolation());
    // Refresh isolation report every 3 seconds
    const interval = setInterval(() => {
      setIsolationReport(getIsolationReport());
      setVerification(verifyIsolation());
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
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

        {/* Network Isolation Panel */}
        {mounted && verification && isolationReport ? (
          <section className="hero-card" style={{ marginBottom: 18, borderColor: verification.verified ? 'var(--safe)' : 'var(--coral)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{verification.verified ? '🔒' : '⚠️'}</span>
              <p className="kicker">Network Isolation</p>
            </div>
            <h2 style={{ color: verification.verified ? 'var(--safe)' : 'var(--coral)' }}>
              {verification.verified ? 'Verified: No Minecraft Servers' : 'Warning: Isolation Issue'}
            </h2>
            <p style={{ fontSize: 13, marginTop: 8, opacity: 0.8 }}>{verification.message}</p>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 16 }}>
              <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <strong style={{ fontSize: 24, color: 'var(--safe)' }}>{isolationReport.totalAttempts}</strong>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>Total Requests</p>
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <strong style={{ fontSize: 24, color: 'var(--coral)' }}>{isolationReport.blockedAttempts}</strong>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>Blocked</p>
              </div>
              <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 12, textAlign: 'center' }}>
                <strong style={{ fontSize: 24, color: 'var(--accent)' }}>{isolationReport.allowedDomains.length}</strong>
                <p style={{ fontSize: 10, color: 'var(--muted)' }}>Allowed Domains</p>
              </div>
            </div>

            {/* Blocked domains list */}
            <details style={{ marginTop: 12 }}>
              <summary style={{ fontSize: 12, cursor: 'pointer', color: 'var(--muted)', fontWeight: 700 }}>
                Blocked Minecraft/Mojang domains ({blockedDomains.length})
              </summary>
              <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {blockedDomains.map((d) => (
                  <span key={d} style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 6,
                    background: 'color-mix(in oklch, var(--coral), white 85%)',
                    color: 'var(--coral)', fontWeight: 600,
                  }}>
                    🚫 {d}
                  </span>
                ))}
              </div>
            </details>

            {/* Recent attempts */}
            {isolationReport.attempts.length > 0 && (
              <details style={{ marginTop: 12 }}>
                <summary style={{ fontSize: 12, cursor: 'pointer', color: 'var(--muted)', fontWeight: 700 }}>
                  Recent network attempts ({isolationReport.attempts.length})
                </summary>
                <div style={{ marginTop: 8, maxHeight: 200, overflow: 'auto' }}>
                  {isolationReport.attempts.slice(0, 10).map((a) => (
                    <div key={a.id} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '4px 0', fontSize: 11, fontFamily: 'monospace',
                      borderBottom: '1px solid var(--border)',
                    }}>
                      <span style={{ opacity: 0.7 }}>{a.type} → {a.url.slice(0, 50)}</span>
                      <span style={{ color: a.blocked ? 'var(--coral)' : 'var(--safe)', fontWeight: 700 }}>
                        {a.blocked ? 'BLOCKED' : 'OK'}
                      </span>
                    </div>
                  ))}
                </div>
              </details>
            )}
          </section>
        ) : (
          <section className="hero-card" style={{ marginBottom: 18 }}>
            <p className="kicker">Network Isolation</p>
            <h2>Loading isolation report…</h2>
          </section>
        )}

        {/* Safety Settings */}
        <section className="hero-card" style={{ marginBottom: 18 }}>
          <p className="kicker">Safety controls</p>
          <h2>Keep play safe and visible.</h2>

          <div style={{ marginTop: 18, display: 'grid', gap: 14 }}>
            {/* Play Timer */}
            <div className="safety-row" style={{ padding: 0 }}>
              <div>
                <strong>Play timer</strong>
                <p style={{ fontSize: 13 }}>
                  How long Mina can play per session
                  {mounted && parental.sessionStatus === 'playing' && (
                    <span style={{ color: 'var(--accent)', fontWeight: 700 }}> — {formatTime(parental.timeRemainingSec)} left</span>
                  )}
                </p>
              </div>
              <div className="preset-row" style={{ gap: 6 }}>
                {[15, 20, 30, 60].map((min) => (
                  <button
                    key={min}
                    className={`preset ${parental.playTimeLimitMin === min ? 'is-active' : ''}`}
                    onClick={() => parental.setPlayTimeLimit(min)}
                    style={{ fontSize: 12, padding: '0 10px', minHeight: 32 }}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            {/* Mode Lock */}
            <div className="safety-row" style={{ padding: 0 }}>
              <div>
                <strong>Mode lock</strong>
                <p style={{ fontSize: 13 }}>Which game modes Mina can access</p>
              </div>
              <div className="preset-row" style={{ gap: 6 }}>
                {[
                  { id: 'mina' as const, label: '🌸 Mina only' },
                  { id: 'any' as const, label: 'Both' },
                  { id: 'lab' as const, label: '🛠️ Lab only' },
                ].map((m) => (
                  <button
                    key={m.id}
                    className={`preset ${parental.modeLock === m.id ? 'is-active' : ''}`}
                    onClick={() => parental.setModeLock(m.id)}
                    style={{ fontSize: 12, padding: '0 10px', minHeight: 32 }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Render Distance Cap */}
            <div className="safety-row" style={{ padding: 0 }}>
              <div>
                <strong>Render distance cap</strong>
                <p style={{ fontSize: 13 }}>Max chunks visible (lower = faster on tablets)</p>
              </div>
              <div className="preset-row" style={{ gap: 6 }}>
                {[2, 4, 6, 8].map((r) => (
                  <button
                    key={r}
                    className={`preset ${parental.maxRenderDistance === r ? 'is-active' : ''}`}
                    onClick={() => parental.setMaxRenderDistance(r)}
                    style={{ fontSize: 12, padding: '0 10px', minHeight: 32 }}
                  >
                    {r} chunks
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
                    className={`preset ${parental.chatMode === mode.id ? 'is-active' : ''}`}
                    onClick={() => parental.setChatMode(mode.id)}
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
                    className={`preset ${parental.sharingMode === mode.id ? 'is-active' : ''}`}
                    onClick={() => parental.setSharingMode(mode.id)}
                    style={{ fontSize: 12, padding: '0 10px', minHeight: 32 }}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Block restrictions */}
          <details style={{ marginTop: 16 }}>
            <summary style={{ fontSize: 12, cursor: 'pointer', color: 'var(--muted)', fontWeight: 700 }}>
              Block restrictions ({parental.blockedBlocks.length} blocked)
            </summary>
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {[...MINA_PALETTE, ...LAB_PALETTE].filter((v, i, a) => a.indexOf(v) === i).map((blockId) => {
                const def = BLOCK_DEFS[blockId];
                const blocked = parental.blockedBlocks.includes(blockId);
                return (
                  <button
                    key={blockId}
                    onClick={() => parental.toggleBlockBlock(blockId)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                      background: blocked ? 'color-mix(in oklch, var(--coral), white 80%)' : 'var(--surface)',
                      color: blocked ? 'var(--coral)' : 'var(--fg)',
                      border: blocked ? '1px solid var(--coral)' : '1px solid var(--border)',
                    }}
                  >
                    {blocked ? '🚫' : '✅'} {def.emoji} {def.name}
                  </button>
                );
              })}
            </div>
          </details>
        </section>

        {/* Friend Requests */}
        <section className="panel" style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3>Friend requests</h3>
            <span className="badge">{parental.friendRequests.filter((r) => r.status === 'pending').length} pending</span>
          </div>

          {parental.friendRequests.map((req) => (
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
                    onClick={() => parental.approveFriend(req.id)}
                  >
                    Approve
                  </button>
                  <button
                    className="secondary-btn"
                    style={{ minHeight: 34, padding: '0 12px', fontSize: 12 }}
                    onClick={() => parental.rejectFriend(req.id)}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h3>Activity log</h3>
            <span style={{ fontSize: 11, color: 'var(--muted)' }}>
              {mounted ? `Today: ${formatTime(parental.totalPlayTimeTodaySec)}` : 'Today: 0:00'}
            </span>
          </div>
          {parental.activityLog.map((event) => (
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