'use client';

import { useGameStore } from '@/store/gameStore';
import BottomNav from '@/components/BottomNav';

export default function QuestsPage() {
  const { activeQuest, placedObjects } = useGameStore();

  const treeCount = placedObjects.filter((o) => o.type === 'tree').length;
  const progressPercent = Math.min(100, (treeCount / 3) * 100);

  const steps = [
    {
      label: 'Add soft trees',
      status: treeCount >= 3 ? 'done' : treeCount > 0 ? 'next' : 'locked',
      detail: `${treeCount}/3 placed`,
    },
    {
      label: 'Invite one approved friend',
      status: 'next',
      detail: 'Tap a friend in Friends tab',
    },
    {
      label: 'Choose a garden name',
      status: 'locked',
      detail: 'Name your world in Builder',
    },
  ];

  const STATUS_LABEL: Record<string, string> = {
    done: 'Done',
    next: 'Next',
    locked: 'Locked',
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
          <span className="avatar-chip">Quest Map</span>
          <button className="icon-btn" aria-label="Quest rewards">
            ★
          </button>
        </nav>

        {/* Quest Card */}
        <section className="quest-card">
          <p className="kicker">Daily quest</p>
          <h2>Design a cloud garden</h2>
          <p style={{ marginTop: 9 }}>
            Earn a moon bow by placing three cozy objects and naming your garden.
          </p>
          <div className="progress" style={{ marginTop: 14, ['--value' as string]: `${progressPercent}%` }}>
            <span></span>
          </div>
          <p style={{ marginTop: 6, fontSize: 12, fontWeight: 800, color: 'var(--muted)' }}>
            {treeCount >= 3 ? '🎀 Quest complete! Check your inventory.' : `Place ${3 - treeCount} more tree${treeCount === 2 ? '' : 's'}`}
          </p>
        </section>

        {/* Steps Panel */}
        <section className="panel">
          <h3>Steps</h3>
          {steps.map((step) => (
            <div
              key={step.label}
              className="quest-row"
              style={{
                opacity: step.status === 'locked' ? 0.5 : 1,
              }}
            >
              <div>
                <span>{step.label}</span>
                <p style={{ fontSize: 11, marginTop: 2 }}>{step.detail}</p>
              </div>
              <span className="badge">{STATUS_LABEL[step.status]}</span>
            </div>
          ))}
        </section>

        {/* Reward Cards */}
        <section className="grid-2">
          <article
            className="mini-card"
            style={{ background: 'color-mix(in oklch, var(--sky), white 40%)' }}
          >
            <span className="badge">Learn</span>
            <strong>Shapes</strong>
            <p>Match roof patterns</p>
          </article>
          <article
            className="mini-card"
            style={{ background: 'color-mix(in oklch, var(--star), white 40%)' }}
          >
            <span className="badge">Reward</span>
            <strong>Moon Bow</strong>
            <p>🎀 Complete the quest!</p>
          </article>
        </section>

        <BottomNav />
      </main>
    </div>
  );
}
