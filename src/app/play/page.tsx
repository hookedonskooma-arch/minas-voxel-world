'use client';

import dynamic from 'next/dynamic';

// VoxelCanvas uses Three.js + browser APIs — load client-side only
const VoxelCanvas = dynamic(() => import('@/components/voxel/VoxelCanvas'), {
  ssr: false,
  loading: () => (
    <div style={{
      width: '100%', height: '100vh', display: 'grid', placeItems: 'center',
      background: '#0a0a2a', color: '#fff', fontFamily: 'system-ui',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>🌍</div>
        <p style={{ opacity: 0.7 }}>Generating world…</p>
      </div>
    </div>
  ),
});

export default function PlayPage() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#87ceeb' }}>
      <VoxelCanvas />
    </div>
  );
}