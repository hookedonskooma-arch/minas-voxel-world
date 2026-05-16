'use client';

import { useState } from 'react';
import { useWorldBuilderStore } from '@/store/worldBuilderStore';
import BottomNav from '@/components/BottomNav';
import { BIOME_OPTIONS, TILESET_COLORS } from '@/types/world';
import ChatPanel from '@/components/ChatPanel';
import { useRealtimePresence } from '@/hooks/useRealtimePresence';

const PIECES = [
  { emoji: '🌳', label: 'Tree', color: '#10B981' },
  { emoji: '🏠', label: 'House', color: '#8B5CF6' },
  { emoji: '🌸', label: 'Flower', color: '#EC4899' },
  { emoji: '🍰', label: 'Cafe', color: '#F59E0B' },
];

export default function WorldBuilderPage() {
  const {
    currentWorld,
    selectedBiome,
    createNewWorld,
    updateTile,
  } = useWorldBuilderStore();

  const [selectedPiece, setSelectedPiece] = useState(PIECES[0]);
  const [worldName, setWorldName] = useState('Cloud Plaza');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showNewWorld, setShowNewWorld] = useState(false);

  const tileColors = TILESET_COLORS[selectedBiome];

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

  const handleTileClick = (x: number, y: number) => {
    if (!currentWorld?.tileMap) return;
    const colorIndex = tileColors.indexOf(selectedPiece.color);
    updateTile('ground', x, y, colorIndex >= 0 ? colorIndex : 0);
  };

  const tiles = currentWorld?.tileMap?.layers.find((l) => l.id === 'ground')?.tiles || [];
  const { visitors, isConnected } = useRealtimePresence(currentWorld?.id || 'default');

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
            {visitors.length > 0 && (
              <span className="badge" style={{ fontSize: 11 }}>
                {visitors.length} visiting
              </span>
            )}
            <button className="icon-btn" onClick={() => setShowNewWorld(true)} aria-label="New world">
              +
            </button>
            <button className="icon-btn" onClick={handleSave} aria-label="Save world">
              {saving ? '...' : saved ? '✓' : '✓'}
            </button>
          </div>
        </nav>

        {/* World Card */}
        <section className="world-card">
          <div className="topbar">
            <div>
              <p className="kicker">Builder</p>
              <h2>Decorate the park</h2>
            </div>
            <span className="badge">68%</span>
          </div>

          {/* Tile Grid */}
          {currentWorld ? (
            <div className="world-grid" style={{ marginTop: 14 }}>
              {tiles.flatMap((row, y) =>
                row.map((tileIndex, x) => {
                  const color = tileIndex !== null ? tileColors[tileIndex % tileColors.length] : 'white';
                  return (
                    <button
                      key={`${x}-${y}`}
                      className="tile"
                      style={{ '--tile': color } as React.CSSProperties}
                      onClick={() => handleTileClick(x, y)}
                    >
                      {tileIndex !== null ? selectedPiece.emoji : '+'}
                    </button>
                  );
                })
              )}
            </div>
          ) : (
            <div
              className="world-grid"
              style={{ marginTop: 14, minHeight: 200, display: 'grid', placeItems: 'center' }}
            >
              <p style={{ gridColumn: '1 / -1' }}>Tap + to create a world</p>
            </div>
          )}
        </section>

        {/* Piece Picker */}
        <section className="panel">
          <h3>Place a piece</h3>
          <div className="preset-row" style={{ marginTop: 12 }}>
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

        {/* Parent Note */}
        <section className="mini-card">
          <span className="badge">Parent note</span>
          <p style={{ marginTop: 8 }}>Worlds are private until a parent approves sharing.</p>
        </section>

        <ChatPanel />

        <BottomNav />
      </main>

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
                  onClick={() => {
                    // biome selection handled by store on create
                  }}
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
