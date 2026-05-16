'use client';

import { useState } from 'react';
import BottomNav from '@/components/BottomNav';

interface QuestStep {
  label: string;
  status: 'done' | 'next' | 'locked';
}

const QUEST_STEPS: QuestStep[] = [
  { label: 'Add soft trees', status: 'done' },
  { label: 'Invite one approved friend', status: 'next' },
  { label: 'Choose a garden name', status: 'locked' },
];

const STATUS_LABEL: Record<QuestStep['status'], string> = {
  done: 'Done',
  next: 'Next',
  locked: 'Locked',
};

export default function QuestsPage() {
  const [progress, setProgress] = useState(66);

  const handleStepClick = (index: number) => {
    if (QUEST_STEPS[index].status === 'next') {
      setProgress((p) => Math.min(100, p + 17));
    }
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
          <div className="progress" style={{ marginTop: 14, ['--value' as string]: `${progress}%` }}>
            <span></span>
          </div>
        </section>

        {/* Steps Panel */}
        <section className="panel">
          <h3>Steps</h3>
          {QUEST_STEPS.map((step, i) => (
            <div
              key={step.label}
              className="quest-row"
              onClick={() => handleStepClick(i)}
              style={{
                cursor: step.status === 'next' ? 'pointer' : 'default',
                opacity: step.status === 'locked' ? 0.5 : 1,
              }}
            >
              <span>{step.label}</span>
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
            <strong>Bow</strong>
            <p>Moon ribbon</p>
          </article>
        </section>

        <BottomNav />
      </main>
    </div>
  );
}
