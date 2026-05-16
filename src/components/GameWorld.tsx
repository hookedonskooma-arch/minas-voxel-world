'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useSounds } from '@/components/SoundEffects';

const GRID_SIZE = 10;
const TILE_SIZE = 48; // px

interface GameWorldProps {
  selectedEmoji: string;
  selectedType: string;
}

export default function GameWorld({ selectedEmoji, selectedType }: GameWorldProps) {
  const {
    avatarPosition,
    facing,
    isWalking,
    placedObjects,
    moveAvatar,
    placeObject,
  } = useGameStore();

  const { step, pop } = useSounds();

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Keyboard controls
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (['ArrowUp', 'w', 'W'].includes(e.key)) {
        e.preventDefault();
        step();
        moveAvatar(0, -1);
      }
      if (['ArrowDown', 's', 'S'].includes(e.key)) {
        e.preventDefault();
        step();
        moveAvatar(0, 1);
      }
      if (['ArrowLeft', 'a', 'A'].includes(e.key)) {
        e.preventDefault();
        step();
        moveAvatar(-1, 0);
      }
      if (['ArrowRight', 'd', 'D'].includes(e.key)) {
        e.preventDefault();
        step();
        moveAvatar(1, 0);
      }
    },
    [moveAvatar, step]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Touch swipe controls
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minSwipe = 30;

    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
      step();
      moveAvatar(dx > 0 ? 1 : -1, 0);
    } else if (Math.abs(dy) > minSwipe) {
      step();
      moveAvatar(0, dy > 0 ? 1 : -1);
    }

    touchStartRef.current = null;
  };

  const handleTileClick = (x: number, y: number) => {
    // Only place if tile is adjacent to avatar
    const dx = Math.abs(x - avatarPosition.x);
    const dy = Math.abs(y - avatarPosition.y);
    if (dx + dy === 1) {
      pop();
      placeObject(x, y, selectedType, selectedEmoji, 'Mina');
    }
  };

  // Camera follow — center avatar in viewport
  const cameraX = avatarPosition.x * TILE_SIZE;
  const cameraY = avatarPosition.y * TILE_SIZE;

  // Avatar visual based on facing direction
  const avatarVisual = (
    <div
      style={{
        position: 'absolute',
        width: TILE_SIZE,
        height: TILE_SIZE,
        display: 'grid',
        placeItems: 'center',
        fontSize: 28,
        zIndex: 10,
        transform: isWalking ? 'scale(0.9) translateY(-2px)' : 'scale(1)',
        transition: 'transform 0.15s ease',
        filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))',
      }}
    >
      {facing === 'left' ? '◀️' : facing === 'right' ? '▶️' : facing === 'up' ? '🔼' : '🔽'}
    </div>
  );

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: 340,
        overflow: 'hidden',
        position: 'relative',
        borderRadius: 20,
        background: 'color-mix(in oklch, var(--mint), white 46%)',
        touchAction: 'none',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Camera wrapper */}
      <div
        style={{
          position: 'absolute',
          width: GRID_SIZE * TILE_SIZE,
          height: GRID_SIZE * TILE_SIZE,
          left: '50%',
          top: '50%',
          transform: `translate(calc(-50% + ${-cameraX}px), calc(-50% + ${-cameraY}px))`,
          transition: 'transform 0.15s ease-out',
        }}
      >
        {Array.from({ length: GRID_SIZE }).map((_, y) =>
          Array.from({ length: GRID_SIZE }).map((_, x) => {
            const object = placedObjects.find((o) => o.x === x && o.y === y);
            const isAvatar = avatarPosition.x === x && avatarPosition.y === y;
            const isAdjacent =
              Math.abs(x - avatarPosition.x) + Math.abs(y - avatarPosition.y) === 1;

            return (
              <button
                key={`${x}-${y}`}
                className="tile"
                onClick={() => handleTileClick(x, y)}
                style={{
                  position: 'absolute',
                  left: x * TILE_SIZE,
                  top: y * TILE_SIZE,
                  width: TILE_SIZE,
                  height: TILE_SIZE,
                  borderRadius: 10,
                  background: object
                    ? 'color-mix(in oklch, var(--mint), white 32%)'
                    : isAdjacent
                    ? 'color-mix(in oklch, white, var(--accent) 10%)'
                    : 'white',
                  border: isAvatar
                    ? '2px solid var(--accent)'
                    : isAdjacent
                    ? '2px dashed color-mix(in oklch, var(--accent), white 50%)'
                    : '1px solid color-mix(in oklch, var(--border), var(--accent) 15%)',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: 22,
                  cursor: isAdjacent ? 'pointer' : 'default',
                  zIndex: isAvatar ? 10 : 1,
                }}
              >
                {isAvatar && avatarVisual}
                {object && !isAvatar && object.emoji}
                {!object && !isAvatar && isAdjacent && '+'}
              </button>
            );
          })
        )}
      </div>

      {/* Avatar indicator */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          background: 'white',
          borderRadius: 14,
          padding: '6px 12px',
          fontSize: 12,
          fontWeight: 800,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          zIndex: 20,
        }}
      >
        {avatarPosition.x},{avatarPosition.y}
      </div>
    </div>
  );
}
