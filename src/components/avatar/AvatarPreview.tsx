'use client';

import { useAvatarStore } from '@/store/avatarStore';

export default function AvatarPreview() {
  const { appearance } = useAvatarStore();

  const { body, face, hair, clothing, accessories } = appearance;

  // Calculate dimensions based on body size
  const scale = body.size === 'tiny' ? 0.7 : body.size === 'medium' ? 1.3 : 1;
  const baseWidth = 200;
  const baseHeight = 280;

  // Eye path based on shape
  const getEyePath = () => {
    switch (face.eyeShape) {
      case 'big':
        return 'M -25,-5 Q -25,-20 -10,-20 Q 5,-20 5,-5 Q 5,10 -10,10 Q -25,10 -25,-5 Z';
      case 'thin':
        return 'M -20,-2 Q -10,-8 0,-2 Q -10,4 -20,-2 Z';
      case 'sparkly':
        return 'M -22,-5 Q -22,-18 -8,-18 Q 6,-18 6,-5 Q 6,8 -8,8 Q -22,8 -22,-5 Z';
      case 'sleepy':
        return 'M -20,0 Q -10,-5 0,0';
      default:
        return 'M -25,-5 Q -25,-20 -10,-20 Q 5,-20 5,-5 Q 5,10 -10,10 Q -25,10 -25,-5 Z';
    }
  };

  // Hair path based on style and length
  const getHairPath = () => {
    const length = hair.length;
    const style = hair.style;
    
    if (style === 'pigtails') {
      return length === 'short'
        ? 'M -50,-60 Q -70,-40 -60,-20 M 50,-60 Q 70,-40 60,-20 M -40,-70 Q 0,-90 40,-70 Q 50,-50 40,-30 Q 0,-40 -40,-30 Q -50,-50 -40,-70'
        : length === 'long'
        ? 'M -50,-60 Q -80,-20 -70,40 M 50,-60 Q 80,-20 70,40 M -40,-70 Q 0,-90 40,-70 Q 50,-50 40,-30 Q 0,-40 -40,-30 Q -50,-50 -40,-70'
        : 'M -50,-60 Q -70,-40 -60,-20 M 50,-60 Q 70,-40 60,-20 M -40,-70 Q 0,-90 40,-70 Q 50,-50 40,-30 Q 0,-40 -40,-30 Q -50,-50 -40,-70';
    }
    
    if (style === 'curly') {
      return 'M -45,-65 Q -55,-45 -45,-25 Q -35,-45 -45,-65 M 45,-65 Q 55,-45 45,-25 Q 35,-45 45,-65 M -40,-70 Q 0,-95 40,-70 Q 55,-50 35,-30 Q 0,-45 -35,-30 Q -55,-50 -40,-70';
    }
    
    if (style === 'spiky') {
      return 'M -40,-70 L -50,-90 L -30,-75 L -20,-100 L 0,-80 L 20,-100 L 30,-75 L 50,-90 L 40,-70 Q 50,-50 30,-30 Q 0,-40 -30,-30 Q -50,-50 -40,-70';
    }
    
    if (style === 'bob') {
      return 'M -45,-70 Q -55,-30 -40,0 Q 0,10 40,0 Q 55,-30 45,-70 Q 0,-90 -45,-70';
    }
    
    // straight (default)
    return length === 'short'
      ? 'M -40,-70 Q -50,-40 -35,-20 Q 0,-30 35,-20 Q 50,-40 40,-70 Q 0,-85 -40,-70'
      : length === 'long'
      ? 'M -40,-70 Q -55,20 -45,60 Q 0,50 45,60 Q 55,20 40,-70 Q 0,-85 -40,-70'
      : length === 'extra_long'
      ? 'M -40,-70 Q -60,40 -50,100 Q 0,90 50,100 Q 60,40 40,-70 Q 0,-85 -40,-70'
      : 'M -40,-70 Q -50,-20 -35,0 Q 0,-10 35,0 Q 50,-20 40,-70 Q 0,-85 -40,-70';
  };

  // Clothing path
  const getClothingPath = () => {
    const top = clothing.top;
    if (top === 'dress') {
      return 'M -30,50 Q -40,100 -50,140 Q 0,150 50,140 Q 40,100 30,50 Q 0,55 -30,50';
    }
    if (top === 'hoodie') {
      return 'M -35,50 Q -45,80 -40,110 Q -20,115 0,110 Q 20,115 40,110 Q 45,80 35,50 Q 0,55 -35,50 M -35,50 Q -45,30 -40,20 M 35,50 Q 45,30 40,20';
    }
    if (top === 'kimono') {
      return 'M -30,50 Q -50,90 -55,130 Q 0,140 55,130 Q 50,90 30,50 Q 0,55 -30,50 M -5,50 L 0,80 L 5,50';
    }
    // shirt (default)
    return 'M -30,50 Q -35,90 -30,120 Q 0,125 30,120 Q 35,90 30,50 Q 0,55 -30,50';
  };

  // Accessory paths
  const getAccessoryElements = () => {
    return accessories.map((acc) => {
      switch (acc) {
        case 'bow':
          return (
            <g key={acc} transform="translate(0, -75)">
              <path d="M -15,0 Q -25,-10 -15,-20 Q -5,-10 -15,0 M 15,0 Q 25,-10 15,-20 Q 5,-10 15,0" fill="#FF69B4" />
              <circle cx="0" cy="-10" r="5" fill="#FF1493" />
            </g>
          );
        case 'glasses':
          return (
            <g key={acc} transform="translate(0, -5)">
              <circle cx="-18" cy="0" r="12" fill="none" stroke="#333" strokeWidth="2" />
              <circle cx="18" cy="0" r="12" fill="none" stroke="#333" strokeWidth="2" />
              <line x1="-6" y1="0" x2="6" y2="0" stroke="#333" strokeWidth="2" />
            </g>
          );
        case 'wings':
          return (
            <g key={acc} transform="translate(0, 20)">
              <path d="M -30,0 Q -60,-20 -70,-40 Q -50,-30 -30,-20 Q -40,-10 -30,0" fill="#E0E0E0" opacity="0.8" />
              <path d="M 30,0 Q 60,-20 70,-40 Q 50,-30 30,-20 Q 40,-10 30,0" fill="#E0E0E0" opacity="0.8" />
            </g>
          );
        case 'hat':
          return (
            <g key={acc} transform="translate(0, -80)">
              <ellipse cx="0" cy="0" rx="35" ry="8" fill="#8B4513" />
              <path d="M -25,0 Q -20,-25 0,-30 Q 20,-25 25,0" fill="#A0522D" />
            </g>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="bg-gradient-to-b from-[#FFF8F0] to-[#FFE4E1] rounded-2xl shadow-lg border-2 border-[#E5E7EB] p-8 flex items-center justify-center min-h-[400px]">
      <svg
        width={baseWidth * scale}
        height={baseHeight * scale}
        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
        className="drop-shadow-xl"
      >
        <g transform={`translate(${baseWidth / 2}, ${baseHeight / 2 + 20}) scale(${scale})`}>
          {/* Shadow */}
          <ellipse cx="0" cy="130" rx="50" ry="10" fill="#000" opacity="0.1" />
          
          {/* Body */}
          <path
            d="M -35,50 Q -40,100 -30,130 Q 0,140 30,130 Q 40,100 35,50 Q 0,45 -35,50"
            fill={body.skinTone}
          />
          
          {/* Clothing */}
          <path
            d={getClothingPath()}
            fill={clothing.primaryColor}
            stroke={clothing.secondaryColor || 'none'}
            strokeWidth="2"
          />
          
          {/* Arms */}
          <ellipse cx="-45" cy="70" rx="12" ry="25" fill={body.skinTone} transform="rotate(20 -45 70)" />
          <ellipse cx="45" cy="70" rx="12" ry="25" fill={body.skinTone} transform="rotate(-20 45 70)" />
          
          {/* Head */}
          <ellipse cx="0" cy="-30" rx="55" ry="50" fill={body.skinTone} />
          
          {/* Hair (back) */}
          <path
            d={getHairPath()}
            fill={hair.color}
            opacity="0.9"
          />
          
          {/* Face */}
          {/* Eyes */}
          <g transform="translate(-18, -35)">
            <path d={getEyePath()} fill={face.eyeColor} />
            {face.eyeShape !== 'sleepy' && (
              <>
                <circle cx="-5" cy="-8" r="4" fill="white" />
                <circle cx="3" cy="-5" r="2" fill="white" />
              </>
            )}
          </g>
          <g transform="translate(18, -35) scale(-1, 1)">
            <path d={getEyePath()} fill={face.eyeColor} />
            {face.eyeShape !== 'sleepy' && (
              <>
                <circle cx="-5" cy="-8" r="4" fill="white" />
                <circle cx="3" cy="-5" r="2" fill="white" />
              </>
            )}
          </g>
          
          {/* Blush */}
          {face.blush !== 'none' && (
            <>
              <ellipse cx="-30" cy="-15" rx="10" ry="6" fill="#FFB6C1" opacity={face.blush === 'soft' ? 0.3 : face.blush === 'rosy' ? 0.5 : 0.7} />
              <ellipse cx="30" cy="-15" rx="10" ry="6" fill="#FFB6C1" opacity={face.blush === 'soft' ? 0.3 : face.blush === 'rosy' ? 0.5 : 0.7} />
            </>
          )}
          
          {/* Mouth */}
          <path d="M -8,-5 Q 0,5 8,-5" fill="none" stroke="#D2691E" strokeWidth="2" strokeLinecap="round" />
          
          {/* Hair (front/bangs) */}
          <path
            d="M -40,-70 Q -30,-50 -20,-60 Q 0,-45 20,-60 Q 30,-50 40,-70 Q 0,-80 -40,-70"
            fill={hair.color}
            opacity="0.95"
          />
          
          {/* Accessories */}
          {getAccessoryElements()}
          
          {/* Legs */}
          <rect x="-20" y="125" width="12" height="30" rx="6" fill={body.skinTone} />
          <rect x="8" y="125" width="12" height="30" rx="6" fill={body.skinTone} />
        </g>
      </svg>
    </div>
  );
}
