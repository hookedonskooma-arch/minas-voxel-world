'use client';

import { useAvatarStore } from '@/store/avatarStore';

export default function AvatarPreview() {
  const { appearance } = useAvatarStore();
  const { body, face, hair, clothing, accessories } = appearance;

  const scale = body.size === 'tiny' ? 0.75 : body.size === 'medium' ? 1.15 : 1;
  const baseWidth = 400;
  const baseHeight = 520;

  // Derived colors
  const hairHighlight = hair.highlightColor || lightenColor(hair.color, 30);
  const eyeDark = darkenColor(face.eyeColor, 25);
  const clothingSecondary = clothing.secondaryColor || lightenColor(clothing.primaryColor, 20);

  return (
    <div className="bg-gradient-to-b from-[#FFF8F0] to-[#FFE4E1] rounded-2xl shadow-lg border-2 border-[#E5E7EB] p-6 flex items-center justify-center min-h-[460px]">
      <svg
        width={baseWidth * scale}
        height={baseHeight * scale}
        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
        className="drop-shadow-xl"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        <defs>
          {/* Skin gradient */}
          <radialGradient id="skinGrad" cx="0.5" cy="0.4" r="0.6">
            <stop offset="0%" stopColor={lightenColor(body.skinTone, 10)} />
            <stop offset="60%" stopColor={body.skinTone} />
            <stop offset="100%" stopColor={darkenColor(body.skinTone, 8)} />
          </radialGradient>

          {/* Eye iris gradient */}
          <radialGradient id="irisGrad" cx="0.4" cy="0.4" r="0.55">
            <stop offset="0%" stopColor={lightenColor(face.eyeColor, 20)} />
            <stop offset="40%" stopColor={face.eyeColor} />
            <stop offset="85%" stopColor={eyeDark} />
            <stop offset="100%" stopColor={darkenColor(eyeDark, 20)} />
          </radialGradient>

          {/* Hair main gradient */}
          <linearGradient id="hairGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hairHighlight} />
            <stop offset="40%" stopColor={hair.color} />
            <stop offset="100%" stopColor={darkenColor(hair.color, 15)} />
          </linearGradient>

          {/* Hair back gradient (darker) */}
          <linearGradient id="hairBackGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hair.color} />
            <stop offset="100%" stopColor={darkenColor(hair.color, 25)} />
          </linearGradient>

          {/* Clothing gradient */}
          <linearGradient id="clothGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lightenColor(clothing.primaryColor, 15)} />
            <stop offset="50%" stopColor={clothing.primaryColor} />
            <stop offset="100%" stopColor={darkenColor(clothing.primaryColor, 10)} />
          </linearGradient>

          {/* Soft shadow filter */}
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="4" />
            <feOffset dx="0" dy="4" result="offsetblur" />
            <feComponentTransfer>
              <feFuncA type="linear" slope="0.2" />
            </feComponentTransfer>
            <feMerge>
              <feMergeNode />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow filter for sparkles */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g transform={`translate(${baseWidth / 2}, 80) scale(${scale})`}>
          {/* Ground shadow */}
          <ellipse cx="0" cy="380" rx="90" ry="14" fill="#000" opacity="0.08" />

          {/* ===== HAIR BACK ===== */}
          <g transform="translate(0, -10)">
            <HairBack style={hair.style} length={hair.length} color="url(#hairBackGrad)" />
          </g>

          {/* ===== BODY / CLOTHING ===== */}
          <g transform="translate(0, 140)">
            <BodyShape skinTone={body.skinTone} />
            <ClothingRender
              top={clothing.top}
              material={clothing.material}
              primaryColor="url(#clothGrad)"
              secondaryColor={clothingSecondary}
              pattern={clothing.pattern}
              bottom={clothing.bottom}
            />
          </g>

          {/* ===== NECK ===== */}
          <path d="M -18,95 Q 0,105 18,95 L 18,125 Q 0,135 -18,125 Z" fill="url(#skinGrad)" />
          <path d="M -18,105 Q 0,115 18,105" fill="none" stroke={darkenColor(body.skinTone, 12)} strokeWidth="1.5" opacity="0.4" />

          {/* ===== ARMS ===== */}
          <g transform="translate(0, 150)">
            {/* Left arm */}
            <path d="M -55,10 Q -75,40 -70,75 Q -65,90 -55,85 Q -45,80 -50,50 Q -52,25 -45,15 Z" fill="url(#skinGrad)" />
            {/* Right arm */}
            <path d="M 55,10 Q 75,40 70,75 Q 65,90 55,85 Q 45,80 50,50 Q 52,25 45,15 Z" fill="url(#skinGrad)" />
            {/* Hands */}
            <circle cx="-62" cy="82" r="10" fill="url(#skinGrad)" />
            <circle cx="62" cy="82" r="10" fill="url(#skinGrad)" />
          </g>

          {/* ===== HEAD ===== */}
          <g transform="translate(0, 0)">
            {/* Face shape */}
            <path
              d="M -48,-15 Q -55,25 -45,60 Q -30,90 0,95 Q 30,90 45,60 Q 55,25 48,-15 Q 45,-55 0,-60 Q -45,-55 -48,-15 Z"
              fill="url(#skinGrad)"
              filter="url(#softShadow)"
            />

            {/* Blush */}
            {face.blush !== 'none' && (
              <>
                <ellipse cx="-32" cy="45" rx="14" ry="8" fill="#FF8A8A" opacity={blushOpacity(face.blush)} filter="url(#glow)" />
                <ellipse cx="32" cy="45" rx="14" ry="8" fill="#FF8A8A" opacity={blushOpacity(face.blush)} filter="url(#glow)" />
              </>
            )}

            {/* Nose */}
            <path d="M -2,52 Q 0,56 3,53" fill="none" stroke={darkenColor(body.skinTone, 20)} strokeWidth="1.8" strokeLinecap="round" opacity="0.5" />

            {/* Mouth */}
            <path d="M -10,68 Q 0,76 10,68" fill="none" stroke="#D4756B" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M -10,68 Q 0,76 10,68" fill="none" stroke="#FF9999" strokeWidth="1" strokeLinecap="round" opacity="0.6" />

            {/* ===== EYES ===== */}
            <EyeRender
              cx={-26}
              cy={20}
              eyeShape={face.eyeShape}
              eyeColor="url(#irisGrad)"
              scaleX={1}
            />
            <EyeRender
              cx={26}
              cy={20}
              eyeShape={face.eyeShape}
              eyeColor="url(#irisGrad)"
              scaleX={-1}
            />

            {/* Eyebrows */}
            <path d="M -40,-5 Q -26,-12 -14,-6" fill="none" stroke={darkenColor(hair.color, 10)} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
            <path d="M 40,-5 Q 26,-12 14,-6" fill="none" stroke={darkenColor(hair.color, 10)} strokeWidth="3" strokeLinecap="round" opacity="0.7" />
          </g>

          {/* ===== HAIR FRONT / BANGS ===== */}
          <g transform="translate(0, -10)">
            <HairFront style={hair.style} length={hair.length} color="url(#hairGrad)" highlight={hairHighlight} />
          </g>

          {/* ===== ACCESSORIES ===== */}
          <g transform="translate(0, 0)">
            <AccessoriesRender accessories={accessories} />
          </g>
        </g>
      </svg>
    </div>
  );
}

/* ================================================================
   HAIR COMPONENTS
   ================================================================ */

function HairBack({ style, length, color }: { style: string; length: string; color: string }) {
  // Base back hair that frames the head and goes down the back
  const longBack = length === 'long' || length === 'extra_long';
  const extraLong = length === 'extra_long';

  let path = '';
  let path2 = '';

  if (style === 'pigtails') {
    const tailLen = extraLong ? 160 : longBack ? 110 : 70;
    return (
      <g>
        {/* Left pigtail */}
        <path d={`M -55,-40 Q -90,-20 -95,${tailLen - 40} Q -85,${tailLen + 10} -60,${tailLen - 20} Q -70,${tailLen - 60} -55,-40`} fill={color} />
        {/* Right pigtail */}
        <path d={`M 55,-40 Q 90,-20 95,${tailLen - 40} Q 85,${tailLen + 10} 60,${tailLen - 20} Q 70,${tailLen - 60} 55,-40`} fill={color} />
        {/* Back of head fill */}
        <path d="M -50,-50 Q 0,-70 50,-50 Q 55,-20 48,10 Q 0,20 -48,10 Q -55,-20 -50,-50" fill={color} />
      </g>
    );
  }

  if (style === 'curly') {
    const tailLen = extraLong ? 140 : longBack ? 100 : 60;
    path = `M -52,-45 Q -80,-20 -75,${tailLen - 30} Q -60,${tailLen + 10} -40,${tailLen - 20} Q -45,${tailLen - 50} -30,10 Q -25,-20 -52,-45`;
    path2 = `M 52,-45 Q 80,-20 75,${tailLen - 30} Q 60,${tailLen + 10} 40,${tailLen - 20} Q 45,${tailLen - 50} 30,10 Q 25,-20 52,-45`;
  } else if (style === 'spiky') {
    const tailLen = extraLong ? 130 : longBack ? 90 : 55;
    path = `M -48,-55 L -65,-80 L -50,-60 L -35,-95 L -15,-65 L 0,-90 L 15,-65 L 35,-95 L 50,-60 L 65,-80 L 48,-55 Q 58,-15 50,${tailLen / 2} Q 45,${tailLen} 35,${tailLen - 15} Q 25,${tailLen - 30} 30,10 Q 20,-20 -48,-55`;
  } else if (style === 'bob') {
    path = 'M -50,-50 Q -65,10 -50,50 Q -25,65 0,60 Q 25,65 50,50 Q 65,10 50,-50 Q 0,-70 -50,-50';
  } else {
    // straight
    const tailLen = extraLong ? 150 : longBack ? 110 : 65;
    path = `M -50,-50 Q -65,0 -60,${tailLen} Q -45,${tailLen + 15} -30,${tailLen - 10} Q -35,${tailLen - 40} -30,10 Q -25,-20 -50,-50`;
    path2 = `M 50,-50 Q 65,0 60,${tailLen} Q 45,${tailLen + 15} 30,${tailLen - 10} Q 35,${tailLen - 40} 30,10 Q 25,-20 50,-50`;
  }

  return (
    <g>
      {path2 && <path d={path2} fill={color} />}
      <path d={path} fill={color} />
    </g>
  );
}

function HairFront({ style, length, color, highlight }: { style: string; length: string; color: string; highlight: string }) {
  // Bangs and front hair framing the face

  if (style === 'pigtails') {
    return (
      <g>
        {/* Center bangs */}
        <path d="M -35,-55 Q -15,-25 0,-30 Q 15,-25 35,-55 Q 20,-65 0,-68 Q -20,-65 -35,-55" fill={color} />
        {/* Side fringe left */}
        <path d="M -40,-55 Q -55,-30 -48,5 Q -40,-10 -35,-55" fill={color} />
        {/* Side fringe right */}
        <path d="M 40,-55 Q 55,-30 48,5 Q 40,-10 35,-55" fill={color} />
        {/* Highlight */}
        <path d="M -20,-55 Q 0,-45 20,-55" fill="none" stroke={highlight} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      </g>
    );
  }

  if (style === 'curly') {
    return (
      <g>
        <path d="M -45,-55 Q -30,-30 -15,-35 Q 0,-25 15,-35 Q 30,-30 45,-55 Q 25,-65 0,-70 Q -25,-65 -45,-55" fill={color} />
        <path d="M -48,-50 Q -60,-25 -50,0" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M 48,-50 Q 60,-25 50,0" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <path d="M -15,-50 Q 0,-40 15,-50" fill="none" stroke={highlight} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      </g>
    );
  }

  if (style === 'spiky') {
    return (
      <g>
        <path d="M -40,-55 L -55,-75 L -35,-60 L -20,-85 L 0,-65 L 20,-85 L 35,-60 L 55,-75 L 40,-55 Q 25,-65 0,-68 Q -25,-65 -40,-55" fill={color} />
        <path d="M -30,-55 L -45,-70" fill="none" stroke={highlight} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
        <path d="M 30,-55 L 45,-70" fill="none" stroke={highlight} strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      </g>
    );
  }

  if (style === 'bob') {
    return (
      <g>
        <path d="M -48,-50 Q -30,-25 0,-28 Q 30,-25 48,-50 Q 30,-60 0,-62 Q -30,-60 -48,-50" fill={color} />
        <path d="M -50,-45 Q -60,0 -45,30" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        <path d="M 50,-45 Q 60,0 45,30" fill="none" stroke={color} strokeWidth="10" strokeLinecap="round" />
        <path d="M -20,-50 Q 0,-42 20,-50" fill="none" stroke={highlight} strokeWidth="5" strokeLinecap="round" opacity="0.5" />
      </g>
    );
  }

  // straight (default)
  const bangStyle = length === 'short'
    ? 'M -40,-55 Q -20,-30 0,-32 Q 20,-30 40,-55 Q 20,-62 0,-65 Q -20,-62 -40,-55'
    : 'M -42,-55 Q -20,-25 0,-28 Q 20,-25 42,-55 Q 20,-62 0,-65 Q -20,-62 -42,-55';

  return (
    <g>
      <path d={bangStyle} fill={color} />
      {/* Side strands */}
      <path d="M -45,-50 Q -55,-15 -42,15" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      <path d="M 45,-50 Q 55,-15 42,15" fill="none" stroke={color} strokeWidth="14" strokeLinecap="round" />
      {/* Bang highlight */}
      <path d="M -15,-48 Q 0,-38 15,-48" fill="none" stroke={highlight} strokeWidth="5" strokeLinecap="round" opacity="0.55" />
    </g>
  );
}

/* ================================================================
   EYE COMPONENT
   ================================================================ */

function EyeRender({ cx, cy, eyeShape, eyeColor, scaleX }: {
  cx: number; cy: number; eyeShape: string; eyeColor: string; scaleX: number;
}) {
  const isSleepy = eyeShape === 'sleepy';
  const isThin = eyeShape === 'thin';
  const isBig = eyeShape === 'big' || eyeShape === 'sparkly';

  const w = isThin ? 22 : isBig ? 32 : 28;
  const h = isThin ? 10 : isBig ? 30 : 24;

  return (
    <g transform={`translate(${cx}, ${cy}) scale(${scaleX}, 1)`}>
      {/* Eye white */}
      {!isSleepy && (
        <ellipse cx="0" cy="0" rx={w + 2} ry={h + 2} fill="#FFF" />
      )}

      {/* Iris */}
      {!isSleepy && (
        <ellipse cx="0" cy="1" rx={w - 4} ry={h - 4} fill={eyeColor} />
      )}

      {/* Pupil */}
      {!isSleepy && (
        <ellipse cx="0" cy="2" rx={w * 0.35} ry={h * 0.38} fill="#1a1a2e" />
      )}

      {/* Catchlights (big highlight) */}
      {!isSleepy && (
        <circle cx={-w * 0.25} cy={-h * 0.3} r={w * 0.22} fill="white" opacity="0.95" />
      )}

      {/* Small secondary highlight */}
      {!isSleepy && (
        <circle cx={w * 0.25} cy={h * 0.15} r={w * 0.1} fill="white" opacity="0.7" />
      )}

      {/* Sparkle star for sparkly eyes */}
      {eyeShape === 'sparkly' && (
        <g transform={`translate(${-w * 0.2}, ${-h * 0.35})`}>
          <path d="M 0,-6 L 1.5,-1.5 L 6,0 L 1.5,1.5 L 0,6 L -1.5,1.5 L -6,0 L -1.5,-1.5 Z" fill="white" filter="url(#glow)" />
        </g>
      )}

      {/* Upper eyelid shadow */}
      {!isSleepy && (
        <path
          d={`M ${-w - 1},${-h * 0.5} Q 0,${-h - 4} ${w + 1},${-h * 0.5}`}
          fill="none"
          stroke="#000"
          strokeWidth="2.5"
          strokeLinecap="round"
          opacity="0.15"
        />
      )}

      {/* Eyelashes */}
      {!isSleepy && !isThin && (
        <g>
          <path d={`M ${-w - 2},${-h * 0.3} Q ${-w - 8},${-h - 6} ${-w - 12},${-h - 2}`} fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${-w - 1},${-h * 0.1} Q ${-w - 6},${-h - 3} ${-w - 10},${-h + 2}`} fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
          <path d={`M ${w + 2},${-h * 0.3} Q ${w + 8},${-h - 6} ${w + 12},${-h - 2}`} fill="none" stroke="#222" strokeWidth="2" strokeLinecap="round" />
          <path d={`M ${w + 1},${-h * 0.1} Q ${w + 6},${-h - 3} ${w + 10},${-h + 2}`} fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}

      {/* Top eyelid line */}
      {!isSleepy && (
        <path
          d={`M ${-w},${-h + 3} Q 0,${-h - 2} ${w},${-h + 3}`}
          fill="none"
          stroke="#222"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      )}

      {/* Lower lid line */}
      {!isSleepy && !isThin && (
        <path
          d={`M ${-w + 3},${h - 4} Q 0,${h + 2} ${w - 3},${h - 4}`}
          fill="none"
          stroke="#222"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.25"
        />
      )}

      {/* Sleepy eye */}
      {isSleepy && (
        <>
          <path d={`M ${-w + 4},0 Q 0,${-h + 2} ${w - 4},0`} fill="none" stroke="#222" strokeWidth="2.5" strokeLinecap="round" />
          <path d={`M ${-w + 4},1 Q 0,${h - 2} ${w - 4},1`} fill="none" stroke="#222" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        </>
      )}
    </g>
  );
}

/* ================================================================
   BODY & CLOTHING
   ================================================================ */

function BodyShape({ skinTone }: { skinTone: string }) {
  return (
    <g>
      {/* Main torso */}
      <path d="M -40,0 Q -50,40 -45,90 Q -20,100 0,98 Q 20,100 45,90 Q 50,40 40,0 Q 0,-5 -40,0" fill="url(#skinGrad)" />
      {/* Subtle collarbone area */}
      <path d="M -25,12 Q 0,18 25,12" fill="none" stroke={darkenColor(skinTone, 10)} strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
    </g>
  );
}

function ClothingRender({ top, material, primaryColor, secondaryColor, pattern, bottom }: {
  top: string; material: string; primaryColor: string; secondaryColor: string; pattern?: string; bottom?: string;
}) {
  // Pattern fill
  const patternId = pattern && pattern !== 'solid' ? `pattern-${pattern}` : undefined;

  const renderPattern = () => {
    if (!pattern || pattern === 'solid') return null;
    if (pattern === 'stripes') {
      return (
        <pattern id="pattern-stripes" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="12" fill={secondaryColor} opacity="0.3" />
        </pattern>
      );
    }
    if (pattern === 'dots') {
      return (
        <pattern id="pattern-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="7" cy="7" r="3" fill={secondaryColor} opacity="0.35" />
        </pattern>
      );
    }
    if (pattern === 'floral') {
      return (
        <pattern id="pattern-floral" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="4" fill={secondaryColor} opacity="0.25" />
          <circle cx="5" cy="5" r="2" fill={secondaryColor} opacity="0.15" />
          <circle cx="15" cy="15" r="2" fill={secondaryColor} opacity="0.15" />
        </pattern>
      );
    }
    if (pattern === 'checkered') {
      return (
        <pattern id="pattern-checkered" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect x="0" y="0" width="8" height="8" fill={secondaryColor} opacity="0.2" />
          <rect x="8" y="8" width="8" height="8" fill={secondaryColor} opacity="0.2" />
        </pattern>
      );
    }
    return null;
  };

  const fillColor = patternId ? `url(#${patternId})` : primaryColor;

  if (top === 'dress') {
    return (
      <g>
        {renderPattern()}
        {/* Bodice */}
        <path d="M -38,5 Q -45,35 -40,60 Q 0,65 40,60 Q 45,35 38,5 Q 0,-2 -38,5" fill={primaryColor} />
        {/* Skirt */}
        <path d="M -40,58 Q -55,90 -60,130 Q -30,145 0,148 Q 30,145 60,130 Q 55,90 40,58 Q 0,62 -40,58" fill={fillColor} />
        {/* Scalloped hem */}
        <path d="M -60,130 Q -45,138 -30,132 Q -15,140 0,134 Q 15,140 30,132 Q 45,138 60,130" fill="none" stroke={secondaryColor} strokeWidth="2" opacity="0.5" />
        {/* Collar */}
        <path d="M -20,5 Q 0,15 20,5" fill="none" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
        {/* Sleeve cuffs */}
        <ellipse cx="-42" cy="25" rx="6" ry="10" fill={secondaryColor} opacity="0.5" />
        <ellipse cx="42" cy="25" rx="6" ry="10" fill={secondaryColor} opacity="0.5" />
      </g>
    );
  }

  if (top === 'hoodie') {
    return (
      <g>
        {renderPattern()}
        {/* Hood back */}
        <path d="M -45,-5 Q 0,-20 45,-5 Q 48,15 42,35 Q 0,40 -42,35 Q -48,15 -45,-5" fill={darkenColor(primaryColor as string, 8)} />
        {/* Body */}
        <path d="M -42,10 Q -48,50 -42,95 Q -20,105 0,103 Q 20,105 42,95 Q 48,50 42,10 Q 0,3 -42,10" fill={fillColor} />
        {/* Pocket */}
        <path d="M -22,55 Q 0,65 22,55 L 18,80 Q 0,88 -18,80 Z" fill={darkenColor(primaryColor as string, 5)} opacity="0.6" />
        {/* Drawstrings */}
        <path d="M -12,15 Q -14,35 -12,50" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
        <path d="M 12,15 Q 14,35 12,50" fill="none" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
        {/* Cuffs */}
        <rect x="-50" y="30" width="10" height="18" rx="4" fill={darkenColor(primaryColor as string, 10)} />
        <rect x="40" y="30" width="10" height="18" rx="4" fill={darkenColor(primaryColor as string, 10)} />
        {/* Bottom hem */}
        <rect x="-42" y="92" width="84" height="10" rx="3" fill={darkenColor(primaryColor as string, 5)} />
      </g>
    );
  }

  if (top === 'kimono') {
    return (
      <g>
        {renderPattern()}
        {/* Wide sleeves */}
        <path d="M -42,5 Q -80,20 -85,55 Q -75,70 -50,50" fill={fillColor} />
        <path d="M 42,5 Q 80,20 85,55 Q 75,70 50,50" fill={fillColor} />
        {/* Body */}
        <path d="M -38,5 Q -42,50 -40,95 Q -20,105 0,103 Q 20,105 40,95 Q 42,50 38,5 Q 0,-2 -38,5" fill={fillColor} />
        {/* Obi belt */}
        <rect x="-40" y="50" width="80" height="18" rx="3" fill={secondaryColor} />
        {/* Obi knot */}
        <rect x="-8" y="52" width="16" height="14" rx="3" fill={darkenColor(secondaryColor, 10)} />
        {/* Collar V */}
        <path d="M -20,5 L 0,30 L 20,5" fill="none" stroke={secondaryColor} strokeWidth="3" strokeLinecap="round" />
      </g>
    );
  }

  // shirt (default)
  return (
    <g>
      {renderPattern()}
      {/* Torso */}
      <path d="M -40,5 Q -45,40 -42,80 Q -20,88 0,86 Q 20,88 42,80 Q 45,40 40,5 Q 0,-2 -40,5" fill={fillColor} />
      {/* Collar */}
      <path d="M -22,5 Q 0,14 22,5" fill="none" stroke={secondaryColor} strokeWidth="2.5" strokeLinecap="round" />
      {/* Sleeve hems */}
      <ellipse cx="-45" cy="22" rx="7" ry="12" fill={darkenColor(primaryColor as string, 8)} />
      <ellipse cx="45" cy="22" rx="7" ry="12" fill={darkenColor(primaryColor as string, 8)} />
      {/* Bottom hem */}
      <rect x="-42" y="78" width="84" height="8" rx="2" fill={darkenColor(primaryColor as string, 5)} />

      {/* Bottom piece if specified */}
      {bottom && bottom !== 'none' && (
        <BottomPiece type={bottom} color={secondaryColor} />
      )}
    </g>
  );
}

function BottomPiece({ type, color }: { type: string; color: string }) {
  if (type === 'skirt') {
    return (
      <path d="M -42,82 Q -55,115 -60,150 Q -30,160 0,162 Q 30,160 60,150 Q 55,115 42,82 Q 0,86 -42,82" fill={color} />
    );
  }
  if (type === 'pants') {
    return (
      <g>
        <path d="M -40,82 Q -45,115 -42,150 Q -25,155 -12,150 Q -10,115 -8,82 Z" fill={color} />
        <path d="M 40,82 Q 45,115 42,150 Q 25,155 12,150 Q 10,115 8,82 Z" fill={color} />
      </g>
    );
  }
  if (type === 'shorts') {
    return (
      <g>
        <path d="M -42,82 Q -48,105 -45,118 Q -22,122 0,120 Q 22,122 45,118 Q 48,105 42,82 Q 0,86 -42,82" fill={color} />
        {/* Leg holes */}
        <path d="M -42,112 Q -22,116 -8,112" fill="none" stroke={darkenColor(color, 10)} strokeWidth="2" />
        <path d="M 42,112 Q 22,116 8,112" fill="none" stroke={darkenColor(color, 10)} strokeWidth="2" />
      </g>
    );
  }
  return null;
}

/* ================================================================
   ACCESSORIES
   ================================================================ */

function AccessoriesRender({ accessories }: { accessories: string[] }) {
  return (
    <g>
      {accessories.includes('bow') && (
        <g transform="translate(0, -68)">
          <path d="M -18,0 Q -32,-12 -32,0 Q -32,12 -18,0" fill="#FF69B4" />
          <path d="M 18,0 Q 32,-12 32,0 Q 32,12 18,0" fill="#FF69B4" />
          <circle cx="0" cy="0" r="6" fill="#FF1493" />
          <path d="M -15,2 Q -22,8 -18,14" fill="none" stroke="#FF69B4" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 15,2 Q 22,8 18,14" fill="none" stroke="#FF69B4" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )}

      {accessories.includes('glasses') && (
        <g transform="translate(0, 18)">
          <circle cx="-26" cy="0" r="16" fill="none" stroke="#444" strokeWidth="2.5" />
          <circle cx="26" cy="0" r="16" fill="none" stroke="#444" strokeWidth="2.5" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#444" strokeWidth="2.5" />
          {/* Lens shine */}
          <path d="M -34,-6 Q -30,-10 -26,-8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
          <path d="M 18,-6 Q 22,-10 26,-8" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </g>
      )}

      {accessories.includes('wings') && (
        <g transform="translate(0, 70)" opacity="0.85">
          {/* Left wing */}
          <path d="M -35,0 Q -70,-20 -85,-45 Q -70,-40 -50,-25 Q -60,-15 -35,-5" fill="#E8E8E8" />
          <path d="M -35,-5 Q -65,-25 -78,-50 Q -65,-45 -48,-30" fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.5" />
          {/* Right wing */}
          <path d="M 35,0 Q 70,-20 85,-45 Q 70,-40 50,-25 Q 60,-15 35,-5" fill="#E8E8E8" />
          <path d="M 35,-5 Q 65,-25 78,-50 Q 65,-45 48,-30" fill="none" stroke="#FFF" strokeWidth="1.5" opacity="0.5" />
        </g>
      )}

      {accessories.includes('hat') && (
        <g transform="translate(0, -78)">
          <ellipse cx="0" cy="6" rx="44" ry="8" fill="#8B4513" />
          <path d="M -30,6 Q -25,-35 0,-40 Q 25,-35 30,6" fill="#A0522D" />
          <ellipse cx="0" cy="-38" rx="8" ry="6" fill="#F4A460" />
        </g>
      )}

      {accessories.includes('backpack') && (
        <g transform="translate(0, 90)">
          <rect x="-35" y="-20" width="70" height="55" rx="10" fill="#FF6B6B" />
          <rect x="-30" y="-15" width="60" height="20" rx="5" fill="#FF8E8E" />
          <circle cx="0" cy="5" r="8" fill="#FFD93D" />
          <rect x="-40" y="-35" width="8" height="30" rx="3" fill="#CC5555" />
          <rect x="32" y="-35" width="8" height="30" rx="3" fill="#CC5555" />
        </g>
      )}

      {accessories.includes('pet_cat') && (
        <g transform="translate(-55, 100)">
          <ellipse cx="0" cy="0" rx="16" ry="14" fill="#FFA500" />
          <path d="M -12,-10 L -16,-22 L -6,-12 Z" fill="#FFA500" />
          <path d="M 12,-10 L 16,-22 L 6,-12 Z" fill="#FFA500" />
          <circle cx="-5" cy="-2" r="2" fill="#333" />
          <circle cx="5" cy="-2" r="2" fill="#333" />
          <path d="M -3,4 Q 0,6 3,4" fill="none" stroke="#333" strokeWidth="1" />
        </g>
      )}

      {accessories.includes('pet_dog') && (
        <g transform="translate(55, 100)">
          <ellipse cx="0" cy="0" rx="18" ry="15" fill="#D2B48C" />
          <path d="M -16,-5 Q -22,-12 -18,-18" fill="none" stroke="#D2B48C" strokeWidth="6" strokeLinecap="round" />
          <path d="M 16,-5 Q 22,-12 18,-18" fill="none" stroke="#D2B48C" strokeWidth="6" strokeLinecap="round" />
          <circle cx="-6" cy="-2" r="2.5" fill="#333" />
          <circle cx="6" cy="-2" r="2.5" fill="#333" />
          <ellipse cx="0" cy="5" rx="4" ry="3" fill="#333" opacity="0.3" />
          <path d="M -2,8 Q 0,10 2,8" fill="none" stroke="#333" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      )}
    </g>
  );
}

/* ================================================================
   UTILITIES
   ================================================================ */

function blushOpacity(blush: string): number {
  switch (blush) {
    case 'soft': return 0.35;
    case 'rosy': return 0.55;
    case 'dramatic': return 0.75;
    default: return 0;
  }
}

function lightenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.min(255, (num >> 16) + amt);
  const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
  const B = Math.min(255, (num & 0x0000FF) + amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function darkenColor(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, (num >> 16) - amt);
  const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
  const B = Math.max(0, (num & 0x0000FF) - amt);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}
