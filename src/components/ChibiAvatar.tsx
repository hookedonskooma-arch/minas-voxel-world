'use client';

import { useAvatarStore } from '@/store/avatarStore';

export default function ChibiAvatar() {
  const { appearance } = useAvatarStore();
  const { face, hair, clothing, accessories } = appearance;

  // Map appearance to CSS custom properties
  const chibiStyle: React.CSSProperties = {
    '--hair': hair.color,
    '--eyes': face.eyeColor,
    '--outfit': clothing.primaryColor,
    '--streak': hair.highlightColor || hair.color,
  } as React.CSSProperties;

  const hasBow = accessories.includes('bow');
  const hasStreak = !!hair.highlightColor;

  return (
    <div className="chibi-stage">
      <div className="chibi" style={chibiStyle}>
        <span className="hair-back" />
        <span className="body" />
        <span className="face">
          <span className="eye eye-l" />
          <span className="eye eye-r" />
          <span className="blush blush-l" />
          <span className="blush blush-r" />
          <span className="mouth" />
        </span>
        <span className="bangs" />
        {hasStreak && <span className="streak" />}
        {hasBow && <span className="bow" />}
      </div>
    </div>
  );
}
