'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { VoxelWorld } from '@/lib/voxel/world';
import { WorldGenerator } from '@/lib/voxel/worldgen';
import { PlayerController } from '@/lib/voxel/player';
import { VoxelRenderer } from '@/lib/voxel/renderer';
import { useVoxelEngine } from '@/lib/voxel/engineStore';
import { BlockType, getBlock, BLOCK_DEFS } from '@/lib/voxel/blocks';
import { CHUNK_HEIGHT } from '@/lib/voxel/chunk';
import { useParentalControls } from '@/lib/voxel/parentalControls';
import { installNetworkGuard } from '@/lib/voxel/networkGuard';
import { useMultiplayer } from '@/lib/voxel/multiplayer';
import { saveVoxelWorld, listVoxelWorlds, type SavedVoxelWorld } from '@/lib/voxel/persistence';

export default function VoxelCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<VoxelRenderer | null>(null);
  const worldRef = useRef<VoxelWorld | null>(null);
  const playerRef = useRef<PlayerController | null>(null);

  const [hudData, setHudData] = useState({
    fps: 0,
    chunks: 0,
    loadedChunks: 0,
    pos: { x: 0, y: 0, z: 0 },
    targetedBlock: '',
    flyMode: false,
  });
  const [pointerLocked, setPointerLocked] = useState(false);
  const [showHelp, setShowHelp] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [savedWorldId, setSavedWorldId] = useState<string | null>(null);

  const { mode, settings, selectedBlock, palette, setMode, setSelectedBlock, toggleFly, toggleDebug, toggleWireframe, setRenderDistance, setTimeOfDay, setGravity } = useVoxelEngine();
  const parental = useParentalControls();
  const mp = useMultiplayer();

  // Install network guard on mount — blocks Minecraft/Mojang servers
  useEffect(() => {
    installNetworkGuard(parental.allowedDomains);
    // Start play session
    parental.startSession();
    // Auto-create a room if not already joining one
    if (!mp.roomCode) {
      const code = mp.createRoom('Mina');
      useParentalControls.getState().addActivity('Created room', `Room code: ${code}`);
    }
    return () => {
      mp.closeRoom();
      parental.endSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Create world
    const gen = new WorldGenerator(useVoxelEngine.getState().worldGen);
    const world = new VoxelWorld(gen, CHUNK_HEIGHT);
    worldRef.current = world;

    // Create player
    const camera = new THREE.PerspectiveCamera(settings.fov, 1, 0.1, 1000);
    const player = new PlayerController(world, camera, useVoxelEngine.getState().playerConfig);
    playerRef.current = player;

    // Create renderer
    const renderer = new VoxelRenderer(canvas, world, player, settings);
    rendererRef.current = renderer;

    // Spawn player — find the highest point near origin for a good vantage
    let bestX = 0, bestZ = 0, bestH = 0;
    for (let dx = -16; dx <= 16; dx += 4) {
      for (let dz = -16; dz <= 16; dz += 4) {
        const h = world.getSurfaceHeight(dx, dz);
        if (h > bestH) { bestH = h; bestX = dx; bestZ = dz; }
      }
    }
    player.spawn(bestX, bestZ);
    // Look slightly upward to see the horizon
    player.pitch = -0.25;

    // Initial chunk load
    renderer.updateChunks();
    renderer.updateTimeOfDay(settings.timeOfDay);

    // Resize
    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.resize(w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // Tick callback for HUD + parental session timer + multiplayer sync
    renderer.setTickCallback((dt, fps) => {
      const target = player.getTargetedBlock(32);
      // Tick parental session timer
      useParentalControls.getState().tickSession(dt);
      // Sync position to multiplayer
      const mpState = useMultiplayer.getState();
      if (mpState.roomCode) {
        mpState.updateLocalPosition(
          { x: player.position.x, y: player.position.y, z: player.position.z },
          player.yaw,
          player.pitch,
        );
        // Process incoming block edits from other players
        const edits = mpState.receiveBlockEdits();
        for (const edit of edits) {
          if (edit.byPlayer !== mpState._playerId) {
            world.setBlock(edit.x, edit.y, edit.z, edit.action === 'place' ? edit.blockType : 0);
          }
        }
        if (edits.length > 0) mpState.clearBlockEdits();
        // Rebuild dirty chunk meshes
        for (const chunk of world.chunks.values()) {
          if (!chunk.isMeshed) renderer.buildChunkMesh(chunk);
        }
      }
      setHudData({
        fps,
        chunks: renderer.chunkCount,
        loadedChunks: renderer.loadedChunks,
        pos: { x: player.position.x, y: player.position.y, z: player.position.z },
        targetedBlock: target ? getBlock(world.getBlock(...target.block)).name : '',
        flyMode: player.config.flyMode,
      });
    });

    // Debug exposure
    (window as any).__voxelDebug = { world, player, renderer };

    renderer.start();

    // --- Input handlers ---
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      player.setKey(e.code, true);

      // Hotbar number keys
      if (e.code.startsWith('Digit')) {
        const n = parseInt(e.code.slice(5)) - 1;
        if (n >= 0 && n < palette.length) {
          setSelectedBlock(palette[n]);
        }
      }

      // Toggle fly
      if (e.code === 'KeyF' && e.ctrlKey) {
        e.preventDefault();
        player.toggleFly();
      }

      // Esc — release pointer
      if (e.code === 'Escape') {
        (canvas as any).exitPointerLock?.();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      player.setKey(e.code, false);
    };

    const onMouseDown = (e: MouseEvent) => {
      if (!pointerLocked) {
        canvas.requestPointerLock?.();
        return;
      }
      if (e.button === 0) {
        // Left click — break (parental guard: check session is active)
        if (useParentalControls.getState().sessionStatus === 'time_up') return;
        const target = player.getTargetedBlock(32);
        const broke = player.breakBlock(32);
        if (broke && target) {
          useParentalControls.getState().addActivity('Broke block', `${getBlock(world.getBlock(target.block[0], target.block[1] + 1, target.block[2])).emoji || '⬜'} at (${target.block[0]}, ${target.block[1]}, ${target.block[2]})`);
          // Sync to multiplayer
          const mpState = useMultiplayer.getState();
          if (mpState.roomCode) {
            mpState.sendBlockEdit(target.block[0], target.block[1], target.block[2], 0, 'break');
          }
        }
      } else if (e.button === 2) {
        // Right click — place
        if (useParentalControls.getState().sessionStatus === 'time_up') return;
        const targetBefore = player.getTargetedBlock(32);
        const placed = player.placeBlock(selectedBlock, 32);
        if (placed && targetBefore) {
          useParentalControls.getState().addActivity('Placed block', `${BLOCK_DEFS[selectedBlock]?.emoji || '⬜'} ${BLOCK_DEFS[selectedBlock]?.name || 'Block'}`);
          // Sync to multiplayer
          const mpState = useMultiplayer.getState();
          if (mpState.roomCode && targetBefore) {
            const px = targetBefore.block[0] + targetBefore.normal[0];
            const py = targetBefore.block[1] + targetBefore.normal[1];
            const pz = targetBefore.block[2] + targetBefore.normal[2];
            mpState.sendBlockEdit(px, py, pz, selectedBlock, 'place');
          }
        }
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement === canvas) {
        player.addMouseDelta(e.movementX, e.movementY, 0.002);
      }
    };

    const onPointerLockChange = () => {
      const locked = document.pointerLockElement === canvas;
      setPointerLocked(locked);
      setShowHelp(!locked);
    };

    const onContextMenu = (e: Event) => e.preventDefault();

    const onWheel = (e: WheelEvent) => {
      // Cycle hotbar with scroll
      e.preventDefault();
      const idx = palette.indexOf(selectedBlock);
      const next = e.deltaY > 0 ? (idx + 1) % palette.length : (idx - 1 + palette.length) % palette.length;
      setSelectedBlock(palette[next]);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    canvas.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('pointerlockchange', onPointerLockChange);
    canvas.addEventListener('contextmenu', onContextMenu);
    canvas.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      canvas.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      canvas.removeEventListener('contextmenu', onContextMenu);
      canvas.removeEventListener('wheel', onWheel);
      ro.disconnect();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync settings changes to renderer/player
  useEffect(() => {
    const renderer = rendererRef.current;
    const player = playerRef.current;
    if (!renderer || !player) return;
    renderer.updateSettings(settings);
    player.config.flyMode = settings.flyMode;
    player.config.gravity = settings.gravity;
  }, [settings]);

  // Update time of day
  useEffect(() => {
    rendererRef.current?.updateTimeOfDay(settings.timeOfDay);
  }, [settings.timeOfDay]);

  // Mode switch — rebuild world (respects parental mode lock)
  const switchMode = useCallback((newMode: 'mina' | 'lab') => {
    // Parental guard: check if mode is allowed
    if (!useParentalControls.getState().isModeAllowed(newMode)) {
      return; // silently reject — parent locked this mode
    }
    setMode(newMode);
    // Full rebuild
    const state = useVoxelEngine.getState();
    const gen = new WorldGenerator(state.worldGen);
    const world = new VoxelWorld(gen, CHUNK_HEIGHT);
    worldRef.current = world;
    const player = playerRef.current!;
    player.world = world;
    player.config = state.playerConfig;
    // Re-spawn on highest point
    let bX = 0, bZ = 0, bH = 0;
    for (let dx = -16; dx <= 16; dx += 4)
      for (let dz = -16; dz <= 16; dz += 4) {
        const h = world.getSurfaceHeight(dx, dz);
        if (h > bH) { bH = h; bX = dx; bZ = dz; }
      }
    player.spawn(bX, bZ);
    player.pitch = -0.25;
    const renderer = rendererRef.current!;
    renderer.world = world;
    // Clear old meshes
    for (const entry of renderer.chunkMeshes.values()) {
      renderer.scene.remove(entry.mesh);
      renderer.scene.remove(entry.wireframe);
    }
    renderer.chunkMeshes.clear();
    renderer.updateSettings(state.settings);
    renderer.updateChunks();
    useParentalControls.getState().addActivity('Switched mode', `${newMode === 'mina' ? '🌸 Mina' : '🛠️ Lab'} Mode`);
  }, [setMode]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block', cursor: pointerLocked ? 'none' : 'crosshair' }} />

      {/* --- Time Up Overlay (parental guard) --- */}
      {parental.sessionStatus === 'time_up' && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.9)', display: 'grid', placeItems: 'center',
          fontFamily: 'system-ui, sans-serif',
        }}>
          <div style={{ textAlign: 'center', color: '#fff', maxWidth: 400, padding: 32 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏰</div>
            <h2 style={{ fontSize: 24, margin: '0 0 12px' }}>Time&apos;s Up!</h2>
            <p style={{ opacity: 0.7, fontSize: 14, lineHeight: 1.6 }}>
              You&apos;ve used all your play time for now. Ask a parent to add more time or come back tomorrow!
            </p>
            <button
              onClick={() => { parental.endSession(); window.location.href = '/'; }}
              style={{
                marginTop: 20, padding: '12px 28px', borderRadius: 12, fontSize: 14, fontWeight: 700,
                background: '#00B398', color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              Back to Home
            </button>
          </div>
        </div>
      )}

      {/* --- Session Timer (top center) --- */}
      {parental.sessionStatus === 'playing' && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)', zIndex: 15,
          background: 'rgba(0,0,0,0.6)', color: parental.timeRemainingSec < 60 ? '#ff6b6b' : '#fff',
          padding: '6px 16px', borderRadius: 20, fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          ⏱️ {Math.floor(parental.timeRemainingSec / 60)}:{String(Math.floor(parental.timeRemainingSec % 60)).padStart(2, '0')}
        </div>
      )}

      {/* --- Network Isolation Badge --- */}
      <div style={{
        position: 'absolute', bottom: 16, left: 12, zIndex: 15,
        background: 'rgba(0,0,0,0.6)', color: '#00B398',
        padding: '4px 10px', borderRadius: 8, fontFamily: 'system-ui', fontSize: 10, fontWeight: 700,
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        🔒 No Minecraft Servers
      </div>

      {/* --- Multiplayer Room Code --- */}
      {mp.roomCode && (
        <div style={{
          position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 15,
          background: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: '8px 16px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          fontFamily: 'system-ui',
        }}>
          <span style={{ fontSize: 9, color: '#9CA3AF', fontWeight: 600, letterSpacing: 1 }}>
            SHARE CODE
          </span>
          <span style={{
            fontSize: 20, fontWeight: 800, letterSpacing: 4, color: '#00B398',
            fontFamily: 'monospace', cursor: 'pointer',
          }}
            onClick={() => {
              navigator.clipboard?.writeText(mp.roomCode!);
              useParentalControls.getState().addActivity('Shared room code', mp.roomCode!);
            }}
            title="Click to copy"
          >
            {mp.roomCode}
          </span>
          <div style={{ display: 'flex', gap: 6, marginTop: 2 }}>
            {mp.playerList.map((p) => (
              <div key={p.id} style={{
                width: 8, height: 8, borderRadius: '50%',
                background: p.color,
              }} title={p.name} />
            ))}
          </div>
          <span style={{ fontSize: 9, color: '#6B7280' }}>
            {mp.playerList.length} player{mp.playerList.length !== 1 ? 's' : ''} •{' '}
            <a href="/join" target="_blank" style={{ color: '#00B398' }}>join link</a>
          </span>
        </div>
      )}

      {/* Crosshair */}
      {pointerLocked && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: 20, height: 20, pointerEvents: 'none', zIndex: 10,
        }}>
          <div style={{ position: 'absolute', top: 9, left: 0, width: 20, height: 2, background: 'rgba(255,255,255,0.8)' }} />
          <div style={{ position: 'absolute', top: 0, left: 9, width: 2, height: 20, background: 'rgba(255,255,255,0.8)' }} />
        </div>
      )}

      {/* Help overlay (shown when not locked) */}
      {showHelp && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          background: 'rgba(0,0,0,0.85)', color: '#fff', padding: 24, borderRadius: 12,
          textAlign: 'center', zIndex: 20, pointerEvents: 'none',
          fontFamily: 'system-ui, sans-serif', maxWidth: 400,
        }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 18 }}>
            {mode === 'mina' ? '🌸 Mina\'s World' : '🛠️ Concept Lab'}
          </h2>
          <div style={{ fontSize: 13, lineHeight: 1.8, opacity: 0.9 }}>
            <div><b>Click</b> to lock mouse & play</div>
            <div><b>WASD</b> — Move &nbsp; <b>Space</b> — Jump</div>
            <div><b>Mouse</b> — Look &nbsp; <b>Esc</b> — Release</div>
            <div><b>Left Click</b> — Break &nbsp; <b>Right Click</b> — Place</div>
            <div><b>1-9</b> — Select block &nbsp; <b>Scroll</b> — Cycle</div>
            {mode === 'lab' && <div><b>Ctrl+F</b> — Toggle fly</div>}
          </div>
        </div>
      )}

      {/* Hotbar */}
      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 4, zIndex: 15,
        background: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 10,
      }}>
        {parental.getFilteredPalette(palette).map((blockId, i) => {
          const def = BLOCK_DEFS[blockId];
          const isSelected = selectedBlock === blockId;
          return (
            <button
              key={blockId}
              onClick={() => setSelectedBlock(blockId)}
              style={{
                width: 48, height: 48, borderRadius: 8,
                background: isSelected ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                border: isSelected ? '2px solid #fff' : '2px solid transparent',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#fff', fontSize: 20,
                transition: 'all 0.15s',
              }}
              title={def.name}
            >
              <span>{def.emoji || '⬜'}</span>
              <span style={{ fontSize: 8, opacity: 0.6 }}>{i + 1}</span>
            </button>
          );
        })}
      </div>

      {/* Debug HUD (lab mode) */}
      {(settings.showDebug || mode === 'lab') && (
        <div style={{
          position: 'absolute', top: 12, left: 12, zIndex: 15,
          background: 'rgba(0,0,0,0.7)', color: '#0f0', padding: 10, borderRadius: 8,
          fontFamily: 'monospace', fontSize: 11, lineHeight: 1.6, minWidth: 180,
        }}>
          <div>FPS: {hudData.fps}</div>
          <div>Chunks: {hudData.chunks} / {hudData.loadedChunks}</div>
          <div>XYZ: {hudData.pos.x.toFixed(1)}, {hudData.pos.y.toFixed(1)}, {hudData.pos.z.toFixed(1)}</div>
          <div>Target: {hudData.targetedBlock || '—'}</div>
          <div>Fly: {hudData.flyMode ? 'ON' : 'OFF'}</div>
          <div>Mode: {mode.toUpperCase()}</div>
        </div>
      )}

      {/* Control panel (top right) */}
      <div style={{
        position: 'absolute', top: 12, right: 12, zIndex: 15,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        {/* Mode toggle */}
        <div style={{ display: 'flex', gap: 4 }}>
          <button
            onClick={() => switchMode('mina')}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: mode === 'mina' ? '#00B398' : 'rgba(255,255,255,0.15)',
              color: mode === 'mina' ? '#fff' : 'rgba(255,255,255,0.6)',
              border: 'none',
            }}
          >🌸 Mina</button>
          <button
            onClick={() => switchMode('lab')}
            style={{
              padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
              background: mode === 'lab' ? '#CF4520' : 'rgba(255,255,255,0.15)',
              color: mode === 'lab' ? '#fff' : 'rgba(255,255,255,0.6)',
              border: 'none',
            }}
          >🛠️ Lab</button>
        </div>

        {/* Save button */}
        <button
          onClick={async () => {
            const world = worldRef.current;
            if (!world) return;
            setSaveStatus('saving');
            const engineState = useVoxelEngine.getState();
            const record = await saveVoxelWorld(world, {
              name: mode === 'mina' ? "Mina's World" : 'Lab Prototype',
              ownerName: 'Mina',
              seed: engineState.worldGen.seed,
              mode,
              id: savedWorldId || undefined,
            });
            setSavedWorldId(record.id);
            setSaveStatus('saved');
            useParentalControls.getState().addActivity('Saved world', `${record.name} (${record.id})`);
            setTimeout(() => setSaveStatus('idle'), 2000);
          }}
          style={{
            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
            background: saveStatus === 'saved' ? '#00B398' : saveStatus === 'saving' ? '#F2A900' : 'rgba(255,255,255,0.15)',
            color: saveStatus === 'saved' || saveStatus === 'saving' ? '#fff' : 'rgba(255,255,255,0.6)',
            border: 'none', transition: 'all 0.2s',
          }}
        >
          {saveStatus === 'saving' ? '💾 Saving…' : saveStatus === 'saved' ? '✅ Saved!' : '💾 Save World'}
        </button>

        {/* Lab controls */}
        {mode === 'lab' && (
          <div style={{
            background: 'rgba(0,0,0,0.7)', padding: 10, borderRadius: 8,
            display: 'flex', flexDirection: 'column', gap: 6,
            color: '#fff', fontSize: 11, fontFamily: 'system-ui',
          }}>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Fly</span>
              <input type="checkbox" checked={settings.flyMode} onChange={toggleFly} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Debug</span>
              <input type="checkbox" checked={settings.showDebug} onChange={toggleDebug} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Wire</span>
              <input type="checkbox" checked={settings.showWireframe} onChange={toggleWireframe} />
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span>Render</span>
              <input type="range" min={2} max={12} value={settings.renderDistance}
                onChange={(e) => setRenderDistance(Number(e.target.value))} style={{ width: 80 }} />
              <span style={{ minWidth: 20 }}>{settings.renderDistance}</span>
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span>Gravity</span>
              <input type="range" min={0} max={50} value={settings.gravity}
                onChange={(e) => setGravity(Number(e.target.value))} style={{ width: 80 }} />
              <span style={{ minWidth: 20 }}>{settings.gravity}</span>
            </label>
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span>Time</span>
              <input type="range" min={0} max={100} value={Math.round(settings.timeOfDay * 100)}
                onChange={(e) => setTimeOfDay(Number(e.target.value) / 100)} style={{ width: 80 }} />
              <span style={{ minWidth: 20 }}>{Math.round(settings.timeOfDay * 100)}%</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}