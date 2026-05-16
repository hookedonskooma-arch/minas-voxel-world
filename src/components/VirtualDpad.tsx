'use client';

import { useGameStore } from '@/store/gameStore';

export default function VirtualDpad() {
  const { moveAvatar } = useGameStore();

  const btnStyle: React.CSSProperties = {
    width: 56,
    height: 56,
    borderRadius: 18,
    border: '2px solid color-mix(in oklch, var(--border), white 30%)',
    background: 'white',
    display: 'grid',
    placeItems: 'center',
    fontSize: 24,
    cursor: 'pointer',
    userSelect: 'none',
    touchAction: 'manipulation',
    boxShadow: '0 4px 12px color-mix(in oklch, var(--sky), black 8%)',
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 100,
        left: 18,
        zIndex: 50,
        display: 'grid',
        gridTemplateColumns: '56px 56px 56px',
        gridTemplateRows: '56px 56px 56px',
        gap: 4,
      }}
    >
      <div />
      <button
        style={btnStyle}
        onClick={() => moveAvatar(0, -1)}
        aria-label="Move up"
      >
        🔼
      </button>
      <div />

      <button
        style={btnStyle}
        onClick={() => moveAvatar(-1, 0)}
        aria-label="Move left"
      >
        ◀️
      </button>
      <button
        style={{
          ...btnStyle,
          background: 'linear-gradient(135deg, var(--accent), var(--violet))',
          color: 'white',
          border: 'none',
        }}
        onClick={() => {}}
        aria-label="Action"
      >
        ✨
      </button>
      <button
        style={btnStyle}
        onClick={() => moveAvatar(1, 0)}
        aria-label="Move right"
      >
        ▶️
      </button>

      <div />
      <button
        style={btnStyle}
        onClick={() => moveAvatar(0, 1)}
        aria-label="Move down"
      >
        🔽
      </button>
      <div />
    </div>
  );
}
