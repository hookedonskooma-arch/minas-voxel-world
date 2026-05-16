'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield } from 'lucide-react';
import Logo from '@/components/Logo';
import BottomNav from '@/components/BottomNav';
import { useWorldBuilderStore } from '@/store/worldBuilderStore';
import type { BiomeType } from '@/types/world';

const STARTER_WORLDS: { label: string; biome: BiomeType }[] = [
  { label: 'Cloud Park', biome: 'meadow' },
  { label: 'Moon Bakery', biome: 'candy' },
  { label: 'Bunny Town', biome: 'forest' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { createNewWorld } = useWorldBuilderStore();
  const [selectedWorld, setSelectedWorld] = useState(STARTER_WORLDS[0].label);
  const [showParentModal, setShowParentModal] = useState(false);

  const handleStarterClick = (world: { label: string; biome: BiomeType }) => {
    setSelectedWorld(world.label);
    createNewWorld(world.label, world.biome);
    router.push('/worlds');
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
          <span className="avatar-chip">Mina</span>
          <button
            className="icon-btn"
            onClick={() => setShowParentModal(true)}
            aria-label="Parent safety"
          >
            <Shield size={18} />
          </button>
        </nav>

        {/* Hero Card */}
        <section className="hero-card">
          <div style={{ position: 'relative', zIndex: 1 }}>
            <Logo />
            <p className="kicker" style={{ textAlign: 'center' }}>Welcome home</p>
            <h1 style={{ margin: '0 auto' }}>Make your tiny world sparkle.</h1>
            <p style={{ marginTop: 12, textAlign: 'center' }}>
              Pick a starter world, design your cutie, and invite only parent-approved friends.
            </p>
            <div className="button-row" style={{ marginTop: 18, justifyContent: 'center' }}>
              <Link href="/studio" className="primary-btn">Start creating</Link>
              <button
                className="secondary-btn"
                onClick={() => setShowParentModal(true)}
              >
                Parent setup
              </button>
            </div>
          </div>
        </section>

        {/* Feature Mini-Cards */}
        <section className="grid-2">
          <article
            className="mini-card"
            style={{ background: 'color-mix(in oklch, var(--bubble), white 54%)' }}
          >
            <span className="badge">Cute</span>
            <strong>Avatar</strong>
            <p>Hair, eyes, outfit</p>
          </article>
          <article
            className="mini-card"
            style={{ background: 'color-mix(in oklch, var(--mint), white 48%)' }}
          >
            <span className="badge">Safe</span>
            <strong>Friends</strong>
            <p>Approved visits only</p>
          </article>
        </section>

        {/* Starter World Selector */}
        <section className="panel">
          <h3>Choose a starter world</h3>
          <div className="preset-row" style={{ marginTop: 12 }}>
            {STARTER_WORLDS.map((world) => (
              <button
                key={world.label}
                className={`preset ${selectedWorld === world.label ? 'is-active' : ''}`}
                onClick={() => handleStarterClick(world)}
              >
                {world.label}
              </button>
            ))}
          </div>
        </section>

        <BottomNav />
      </main>

      {/* Parent Setup Modal */}
      {showParentModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{
            background: 'color-mix(in oklch, black, transparent 60%)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <div className="panel" style={{ width: 320, padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Parent Setup</h3>
            <ul style={{ paddingLeft: 20, marginBottom: 16, color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>
              <li>All chats are preset phrases only</li>
              <li>Friends require parent approval</li>
              <li>Worlds stay private until you share</li>
              <li>No ads, no external links</li>
            </ul>
            <button
              className="primary-btn"
              style={{ width: '100%' }}
              onClick={() => setShowParentModal(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
