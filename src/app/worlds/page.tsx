'use client';

import { useState, useCallback, useRef } from 'react';
import { useWorldBuilderStore } from '@/store/worldBuilderStore';
import {
  BIOME_OPTIONS,
  BUILDING_TYPES,
  TILESET_COLORS,
  createDefaultTileMap,
  createDefaultTheme,
} from '@/types/world';
import {
  Globe,
  Paintbrush,
  Eraser,
  Building2,
  MousePointer2,
  Plus,
  Save,
  ZoomIn,
  ZoomOut,
  Trash2,
} from 'lucide-react';

export default function WorldBuilderPage() {
  const {
    currentWorld,
    selectedTool,
    selectedBiome,
    selectedBuildingType,
    selectedColor,
    brushSize,
    zoom,
    createNewWorld,
    setSelectedTool,
    setSelectedBiome,
    setSelectedBuildingType,
    setSelectedColor,
    setBrushSize,
    setZoom,
    updateTile,
    addBuilding,
    removeBuilding,
  } = useWorldBuilderStore();

  const [worldName, setWorldName] = useState('Amina Town');
  const [showNewWorldModal, setShowNewWorldModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  const tileColors = selectedBiome ? TILESET_COLORS[selectedBiome] : TILESET_COLORS.meadow;

  const handleCreateWorld = () => {
    if (!worldName.trim()) return;
    createNewWorld(worldName.trim(), selectedBiome);
    setShowNewWorldModal(false);
  };

  const handleTileClick = useCallback(
    (layerId: string, x: number, y: number) => {
      if (!currentWorld?.tileMap) return;

      if (selectedTool === 'brush') {
        const colorIndex = tileColors.indexOf(selectedColor);
        updateTile(layerId, x, y, colorIndex >= 0 ? colorIndex : 0);
      } else if (selectedTool === 'eraser') {
        updateTile(layerId, x, y, null);
      } else if (selectedTool === 'building' && selectedBuildingType) {
        const buildingDef = BUILDING_TYPES.find((b) => b.id === selectedBuildingType);
        if (!buildingDef) return;
        addBuilding({
          id: `building-${Date.now()}`,
          type: selectedBuildingType as any,
          x,
          y,
          width: buildingDef.width,
          height: buildingDef.height,
          rotation: 0,
          color: buildingDef.color,
        });
      }
    },
    [currentWorld, selectedTool, selectedBuildingType, selectedColor, tileColors, updateTile, addBuilding]
  );

  const handleSave = async () => {
    if (!currentWorld) return;
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch('/api/worlds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: currentWorld.name || 'Unnamed World',
          biome: currentWorld.biome || 'meadow',
          theme: currentWorld.theme,
          tile_map: currentWorld.tileMap,
          buildings: currentWorld.buildings || [],
          is_public: currentWorld.isPublic || false,
        }),
      });

      if (res.ok) {
        setSaved(true);
      }
    } catch {
      // ignore
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  const renderGrid = () => {
    if (!currentWorld?.tileMap) {
      return (
        <div className="flex items-center justify-center h-full text-[#004F71]/40 text-sm">
          Click "New World" to start building!
        </div>
      );
    }

    const { layers, tileSize, width, height } = currentWorld.tileMap;
    const groundLayer = layers.find((l) => l.id === 'ground');
    if (!groundLayer) return null;

    const tiles = groundLayer.tiles;
    const buildings = currentWorld.buildings || [];
    const effectiveTileSize = tileSize * zoom;

    return (
      <div
        ref={canvasRef}
        className="relative overflow-auto bg-[#e8e4dc] rounded-xl border-2 border-[#E5E7EB] shadow-inner"
        style={{ width: '100%', height: '100%' }}
        onMouseDown={() => setIsDragging(true)}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        <div
          className="relative inline-block"
          style={{
            width: width * effectiveTileSize,
            height: height * effectiveTileSize,
            minWidth: width * effectiveTileSize,
            minHeight: height * effectiveTileSize,
          }}
        >
          {/* Tile grid */}
          {tiles.map((row, y) =>
            row.map((tileIndex, x) => {
              const color = tileIndex !== null ? tileColors[tileIndex % tileColors.length] : 'transparent';
              return (
                <div
                  key={`${x}-${y}`}
                  className="absolute cursor-pointer hover:brightness-110 transition-all"
                  style={{
                    left: x * effectiveTileSize,
                    top: y * effectiveTileSize,
                    width: effectiveTileSize,
                    height: effectiveTileSize,
                    backgroundColor: color,
                    border: zoom > 1.2 ? '1px solid rgba(0,0,0,0.06)' : 'none',
                  }}
                  onClick={() => handleTileClick('ground', x, y)}
                  onMouseEnter={() => {
                    if (isDragging && selectedTool === 'brush') {
                      handleTileClick('ground', x, y);
                    }
                  }}
                />
              );
            })
          )}

          {/* Buildings */}
          {buildings.map((building) => {
            const def = BUILDING_TYPES.find((b) => b.id === building.type);
            return (
              <div
                key={building.id}
                className="absolute flex items-center justify-center rounded-lg shadow-md cursor-pointer hover:scale-105 transition-transform"
                style={{
                  left: building.x * effectiveTileSize,
                  top: building.y * effectiveTileSize,
                  width: building.width * effectiveTileSize,
                  height: building.height * effectiveTileSize,
                  backgroundColor: building.color || def?.color || '#ccc',
                  fontSize: effectiveTileSize * 0.6,
                }}
                title={def?.label || building.type}
                onClick={(e) => {
                  e.stopPropagation();
                  removeBuilding(building.id);
                }}
              >
                {def?.icon}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0FDFA] via-[#FFF8F0] to-[#FFE4E1] flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-[#E5E7EB] z-50">
        <div className="max-w-full mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-[#00B398] to-[#004F71] rounded-lg flex items-center justify-center shadow-md">
              <Globe className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#004F71]">Mina&apos;s World</h1>
              <p className="text-[10px] text-[#00B398] font-medium">World Builder</p>
            </div>
            {currentWorld && (
              <span className="ml-4 px-3 py-1 bg-[#F0FDFA] text-[#004F71] text-xs font-semibold rounded-full border border-[#00B398]/20">
                {currentWorld.name}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewWorldModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#004F71] bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#00B398] transition-all"
            >
              <Plus size={16} />
              New World
            </button>
            <button
              onClick={handleSave}
              disabled={!currentWorld || saving}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all ${
                saved
                  ? 'bg-[#00B398]'
                  : 'bg-gradient-to-r from-[#00B398] to-[#004F71] hover:shadow-lg'
              } ${!currentWorld || saving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Save size={16} />
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white/80 backdrop-blur-md border-r-2 border-[#E5E7EB] p-4 overflow-y-auto flex flex-col gap-4">
          {/* Tools */}
          <div>
            <p className="text-xs font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">Tools</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'brush', icon: Paintbrush, label: 'Paint' },
                { id: 'eraser', icon: Eraser, label: 'Erase' },
                { id: 'building', icon: Building2, label: 'Build' },
                { id: 'select', icon: MousePointer2, label: 'Select' },
              ].map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id as any)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-medium transition-all ${
                    selectedTool === tool.id
                      ? 'bg-[#00B398] text-white shadow-md'
                      : 'bg-[#F9FAFB] text-[#6B7280] hover:bg-[#F0FDFA] hover:text-[#00B398]'
                  }`}
                >
                  <tool.icon size={18} />
                  {tool.label}
                </button>
              ))}
            </div>
          </div>

          {/* Biome */}
          <div>
            <p className="text-xs font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">Biome</p>
            <div className="grid grid-cols-3 gap-1">
              {BIOME_OPTIONS.map((biome) => (
                <button
                  key={biome.id}
                  onClick={() => {
                    setSelectedBiome(biome.id);
                    if (currentWorld) {
                      // regenerate ground with new biome colors
                      const newMap = createDefaultTileMap(biome.id);
                      newMap.layers[0].tiles = currentWorld.tileMap!.layers[0].tiles;
                      // Replace with new biome colors for each tile index
                      // This is a simplified approach
                    }
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    selectedBiome === biome.id
                      ? 'bg-[#00B398]/10 ring-2 ring-[#00B398]'
                      : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <span className="text-lg">{biome.icon}</span>
                  <span className="text-[10px] text-[#6B7280]">{biome.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Colors */}
          {selectedTool === 'brush' && (
            <div>
              <p className="text-xs font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">Colors</p>
              <div className="grid grid-cols-5 gap-1">
                {tileColors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      selectedColor === color ? 'ring-2 ring-[#004F71] scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Buildings */}
          {selectedTool === 'building' && (
            <div>
              <p className="text-xs font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">Buildings</p>
              <div className="grid grid-cols-2 gap-2">
                {BUILDING_TYPES.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => setSelectedBuildingType(b.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-xs font-medium transition-all ${
                      selectedBuildingType === b.id
                        ? 'bg-[#F2A900]/10 ring-2 ring-[#F2A900]'
                        : 'bg-[#F9FAFB] hover:bg-[#FFF8F0]'
                    }`}
                  >
                    <span className="text-base">{b.icon}</span>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Brush size */}
          {selectedTool === 'brush' && (
            <div>
              <p className="text-xs font-bold tracking-wider text-[#9CA3AF] uppercase mb-2">Brush Size: {brushSize}</p>
              <input
                type="range"
                min={1}
                max={5}
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-full accent-[#00B398]"
              />
            </div>
          )}

          {/* Zoom */}
          <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[#E5E7EB]">
            <button
              onClick={() => setZoom(zoom - 0.25)}
              className="p-2 rounded-lg bg-[#F9FAFB] hover:bg-[#F0FDFA] text-[#004F71]"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-xs font-medium text-[#6B7280] flex-1 text-center">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(zoom + 0.25)}
              className="p-2 rounded-lg bg-[#F9FAFB] hover:bg-[#F0FDFA] text-[#004F71]"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Clear buildings */}
          {currentWorld && (currentWorld.buildings || []).length > 0 && (
            <button
              onClick={() => {
                if (confirm('Remove all buildings?')) {
                  (currentWorld.buildings || []).forEach((b) => removeBuilding(b.id));
                }
              }}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#CF4520] bg-[#FFF0EE] rounded-lg hover:bg-[#FFE4E1] transition-all"
            >
              <Trash2 size={14} />
              Clear Buildings
            </button>
          )}
        </aside>

        {/* Canvas Area */}
        <main className="flex-1 p-4 overflow-hidden">
          {renderGrid()}
        </main>
      </div>

      {/* New World Modal */}
      {showNewWorldModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 border-2 border-[#E5E7EB]">
            <h3 className="text-lg font-bold text-[#004F71] mb-4">Create New World</h3>
            <label className="text-sm font-medium text-[#004F71] mb-2 block">World Name</label>
            <input
              type="text"
              value={worldName}
              onChange={(e) => setWorldName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateWorld()}
              maxLength={50}
              className="w-full px-4 py-2 rounded-lg border-2 border-[#E5E7EB] focus:border-[#00B398] focus:outline-none text-[#004F71] font-medium mb-4"
              placeholder="e.g., Amina Town"
              autoFocus
            />

            <label className="text-sm font-medium text-[#004F71] mb-2 block">Biome</label>
            <div className="grid grid-cols-3 gap-2 mb-6">
              {BIOME_OPTIONS.map((biome) => (
                <button
                  key={biome.id}
                  onClick={() => setSelectedBiome(biome.id)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-xs transition-all ${
                    selectedBiome === biome.id
                      ? 'bg-[#00B398]/10 ring-2 ring-[#00B398]'
                      : 'hover:bg-[#F9FAFB]'
                  }`}
                >
                  <span className="text-xl">{biome.icon}</span>
                  <span className="text-[10px]">{biome.label}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowNewWorldModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-[#6B7280] bg-[#F9FAFB] rounded-xl hover:bg-[#F3F4F6] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorld}
                disabled={!worldName.trim()}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#00B398] to-[#004F71] rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
              >
                Create!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
