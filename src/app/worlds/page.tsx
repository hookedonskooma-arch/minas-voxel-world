'use client';

import { useState } from 'react';
import { useWorldBuilderStore } from '@/store/worldBuilderStore';
import { useGameStore } from '@/store/gameStore';
import BottomNav from '@/components/BottomNav';
import GameWorld from '@/components/GameWorld';
import VirtualDpad from '@/components/VirtualDpad';
import ChatPanel from '@/components/ChatPanel';
import { BIOME_OPTIONS, TILESET_COLORS } from '@/types/world';

const PIECES = [
  { emoji: '🌳', label: 'Tree', type: 'tree', color: '#10B981' },
  { emoji: '🏠', label: 'House', type: 'house', color: '#8B5CF6' },
  { emoji: '🌸', label: 'Flower', type: 'flower', color: '#EC4899' },
  { emoji: '🍰', label: 'Cafe', type: 'cafe', color: '#F59E0B' },
  { emoji: '☁️', label: 'Cloud', type: 'cloud', color: '#60A5FA' },
  { emoji: '⭐', label: 'Star', type: 'star', color: '#FBBF24' },
];

export default function WorldBuilderPage() {
  const { currentWorld, selectedBiome, createNewWorld } = useWorldBuilderStore();
  const { placedObjects, coins, activeQuest } = useGameStore();

  const [selectedPiece, setSelectedPiece] = useState(PIECES[0]);
  const [worldName, setWorldName] = useState('Cloud Plaza');
  const [showNewWorld, setShowNewWorld] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleCreate = () => {
    if (!worldName.trim()) return;
    createNewWorld(worldName.trim(), selectedBiome);
    setShowNewWorld(false);
  };

  const handleSave = async () => {
    if (!currentWorld) return;
    setSaving(true);
    try {
      const res = await fetch('/api/worlds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentWorld.name || 'Unnamed',
          biome: currentWorld.biome || 'meadow',
          theme: currentWorld.theme,
          tile_map: currentWorld.tileMap,
          buildings: currentWorld.buildings || [],
          is_public: currentWorld.isPublic || false,
        }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const treeCount = placedObjects.filter((o) => o.type === 'tree').length;
  const progressPercent = Math.min(100, (treeCount / 3) * 100);

  return (
    <div className="phone-screen">
      <div className="ios-status">
        <span>9:41</span>
        <span>5G 100%</span>
      </div>

      <main className="app-shell">
        {/* Top Bar */}
        <nav className="topbar">
          <span className="avatar-chip">{currentWorld?.name || 'New World'}</span>
          <div className="button-row" style={{ alignItems: 'center', gap: 8 }}>
            <span className="badge" style={{ fontSize: 11 }}>
              ⭐ {coins}
            </span>
            <button className="icon-btn" onClick={() => setShowNewWorld(true)} aria-label="New world">
              +
            </button>
            <button className="icon-btn" onClick={handleSave} aria-label="Save world">
              {saving ? '...' : saved ? '✓' : '✓'}
            </button>
          </div>
        </nav>

        {/* Quest Progress Mini */}
        {activeQuest && !activeQuest.completed && (
          <section className="mini-card" style={{ padding: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 800 }}>🎯 Place {Math.max(0, 3 - treeCount)} more tree{treeCount === 2 ? '' : 's'}</span>
              <span style={{ fontSize: 11, color: 'var(--muted)' }}>{treeCount}/3</span>
            </div>
            <div className="progress" style={{ marginTop: 6, ['--value' as string]: `${progressPercent}%` }}>
              <span></span>
            </div>
          </section>
        )}

        {/* Game World */}
        <section className="world-card" style={{ padding: 12 }}>
          <div className="topbar" style={{ marginBottom: 8 }}>
            <div>
              <p className="kicker">Builder</p>
              <h2>Walk and decorate</h2>
            </div>
            <span className="badge">{placedObjects.length} objects</span>
          </div>

          <GameWorld selectedEmoji={selectedPiece.emoji} selectedType={selectedPiece.type} />
        </section>

        {/* Piece Picker */}
        <section className="panel">
          <h3>Place a piece</h3>
          <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>
            Tap tiles next to your avatar to place
          </p>
          <div className="preset-row" style={{ marginTop: 10 }}>
            {PIECES.map((piece) => (
              <button
                key={piece.label}
                className={`preset ${selectedPiece.label === piece.label ? 'is-active' : ''}`}
                onClick={() => setSelectedPiece(piece)}
              >
                {piece.emoji} {piece.label}
              </button>
            ))}
          </div>
        </section>

        {/* Chat */}
        <ChatPanel />

        <BottomNav />
      </main>

      <VirtualDpad />

      {/* New World Modal */}
      {showNewWorld && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: 'color-mix(in oklch, black, transparent 60%)', backdropFilter: 'blur(4px)' }}
        >
          <div className="panel" style={{ width: 320, padding: 24 }}>
            <h3 style={{ marginBottom: 16 }}>Create New World</h3>
            <input
              type="text"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="World name..."
              autoFocus
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 16,
                border: '1px solid var(--border)',
                fontSize: 15,
                fontWeight: 700,
                marginBottom: 16,
              }}
            />
            <div className="grid-2" style={{ marginBottom: 16 }}>
              {BIOME_OPTIONS.slice(0, 4).map((biome) => (
                <button
                  key={biome.id}
                  className="preset"
                  style={{ fontSize: 12 }}
                >
                  {biome.icon} {biome.label}
                </button>
              ))}
            </div>
            <div className="button-row">
              <button className="secondary-btn" style={{ flex: 1 }} onClick={() => setShowNewWorld(false)}>
                Cancel
              </button>
              <button className="primary-btn" style={{ flex: 1 }} onClick={handleCreate}>
                Create!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
