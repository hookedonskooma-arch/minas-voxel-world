'use client';

import { useGameStore } from '@/store/gameStore';
import BottomNav from '@/components/BottomNav';

const RARITY_COLORS: Record<string, string> = {
  common: 'var(--muted)',
  rare: 'var(--sky)',
  epic: 'var(--violet)',
  legendary: 'var(--star)',
};

const TYPE_LABELS: Record<string, string> = {
  outfit: '👗',
  object: '📦',
  sticker: '🎀',
  badge: '🏆',
  tile: '⬜',
};

export default function InventoryPage() {
  const { inventory, coins, equipItem } = useGameStore();

  const grouped = inventory.reduce((acc, item) => {
    if (!acc[item.type]) acc[item.type] = [];
    acc[item.type].push(item);
    return acc;
  }, {} as Record<string, typeof inventory>);

  return (
    <div className="phone-screen">
      <div className="ios-status">
        <span>9:41</span>
        <span>5G 100%</span>
      </div>

      <main className="app-shell">
        {/* Top Bar */}
        <nav className="topbar">
          <span className="avatar-chip">My Bag</span>
          <span className="badge">⭐ {coins}</span>
        </nav>

        {/* Inventory Grid */}
        {Object.entries(grouped).map(([type, items]) => (
          <section className="panel" key={type}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 20 }}>{TYPE_LABELS[type] || '📦'}</span>
              <h3 style={{ textTransform: 'capitalize' }}>{type}s</h3>
              <span className="badge" style={{ marginLeft: 'auto' }}>{items.length}</span>
            </div>
            <div className="grid-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {items.map((item) => (
                <button
                  key={item.id}
                  className="mini-card"
                  onClick={() => equipItem(item.id)}
                  style={{
                    minHeight: 80,
                    padding: 8,
                    alignItems: 'center',
                    gap: 4,
                    border: item.equipped
                      ? '2px solid var(--accent)'
                      : '1px solid var(--border)',
                    background: item.equipped
                      ? 'color-mix(in oklch, white, var(--accent) 8%)'
                      : 'white',
                  }}
                >
                  <span style={{ fontSize: 28 }}>{item.emoji}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, textAlign: 'center' }}>
                    {item.name}
                  </span>
                  {item.equipped && (
                    <span
                      className="badge"
                      style={{
                        fontSize: 9,
                        padding: '2px 6px',
                        position: 'absolute',
                        top: 4,
                        right: 4,
                      }}
                    >
                      On
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 9,
                      color: RARITY_COLORS[item.rarity] || 'var(--muted)',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}
                  >
                    {item.rarity}
                  </span>
                  {item.quantity > 1 && (
                    <span style={{ fontSize: 10, color: 'var(--muted)' }}>
                      x{item.quantity}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>
        ))}

        <BottomNav />
      </main>
    </div>
  );
}
