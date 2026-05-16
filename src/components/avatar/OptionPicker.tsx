'use client';

import { useAvatarStore } from '@/store/avatarStore';
import { AVATAR_OPTIONS } from '@/types/avatar';
import { Palette, User, Eye, Scissors, Shirt, Sparkles } from 'lucide-react';

const CATEGORIES = [
  { id: 'body', label: 'Body', icon: User },
  { id: 'face', label: 'Face', icon: Eye },
  { id: 'hair', label: 'Hair', icon: Scissors },
  { id: 'clothing', label: 'Clothes', icon: Shirt },
  { id: 'accessories', label: 'Extras', icon: Sparkles },
];

export default function OptionPicker() {
  const { appearance, selectedCategory, updatePart, setSelectedCategory } = useAvatarStore();

  const renderOptions = () => {
    switch (selectedCategory) {
      case 'body':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Size</label>
              <div className="flex gap-2">
                {AVATAR_OPTIONS.body.size.map((size) => (
                  <button
                    key={size}
                    onClick={() => updatePart('body', { ...appearance.body, size })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appearance.body.size === size
                        ? 'bg-[#00B398] text-white shadow-md'
                        : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#00B398]'
                    }`}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Skin Tone</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.body.skinTones.map((tone) => (
                  <button
                    key={tone}
                    onClick={() => updatePart('body', { ...appearance.body, skinTone: tone })}
                    className={`w-10 h-10 rounded-full border-3 transition-all ${
                      appearance.body.skinTone === tone
                        ? 'border-[#00B398] scale-110 shadow-md'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: tone }}
                    title={tone}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'face':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Eye Shape</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.face.eyeShape.map((shape) => (
                  <button
                    key={shape}
                    onClick={() => updatePart('face', { ...appearance.face, eyeShape: shape })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appearance.face.eyeShape === shape
                        ? 'bg-[#00B398] text-white shadow-md'
                        : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#00B398]'
                    }`}
                  >
                    {shape.charAt(0).toUpperCase() + shape.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Eye Color</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.face.eyeColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updatePart('face', { ...appearance.face, eyeColor: color })}
                    className={`w-10 h-10 rounded-full border-3 transition-all ${
                      appearance.face.eyeColor === color
                        ? 'border-[#00B398] scale-110 shadow-md'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Blush</label>
              <div className="flex gap-2">
                {AVATAR_OPTIONS.face.blush.map((blush) => (
                  <button
                    key={blush}
                    onClick={() => updatePart('face', { ...appearance.face, blush })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appearance.face.blush === blush
                        ? 'bg-[#00B398] text-white shadow-md'
                        : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#00B398]'
                    }`}
                  >
                    {blush.charAt(0).toUpperCase() + blush.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'hair':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Length</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.hair.length.map((length) => (
                  <button
                    key={length}
                    onClick={() => updatePart('hair', { ...appearance.hair, length })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appearance.hair.length === length
                        ? 'bg-[#00B398] text-white shadow-md'
                        : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#00B398]'
                    }`}
                  >
                    {length.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Style</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.hair.style.map((style) => (
                  <button
                    key={style}
                    onClick={() => updatePart('hair', { ...appearance.hair, style })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appearance.hair.style === style
                        ? 'bg-[#00B398] text-white shadow-md'
                        : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#00B398]'
                    }`}
                  >
                    {style.charAt(0).toUpperCase() + style.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Hair Color</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.hair.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updatePart('hair', { ...appearance.hair, color })}
                    className={`w-10 h-10 rounded-full border-3 transition-all ${
                      appearance.hair.color === color
                        ? 'border-[#00B398] scale-110 shadow-md'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case 'clothing':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Top</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.clothing.top.map((top) => (
                  <button
                    key={top}
                    onClick={() => updatePart('clothing', { ...appearance.clothing, top })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appearance.clothing.top === top
                        ? 'bg-[#00B398] text-white shadow-md'
                        : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#00B398]'
                    }`}
                  >
                    {top.charAt(0).toUpperCase() + top.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Material</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.clothing.material.map((material) => (
                  <button
                    key={material}
                    onClick={() => updatePart('clothing', { ...appearance.clothing, material })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appearance.clothing.material === material
                        ? 'bg-[#00B398] text-white shadow-md'
                        : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#00B398]'
                    }`}
                  >
                    {material.charAt(0).toUpperCase() + material.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.clothing.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => updatePart('clothing', { ...appearance.clothing, primaryColor: color })}
                    className={`w-10 h-10 rounded-full border-3 transition-all ${
                      appearance.clothing.primaryColor === color
                        ? 'border-[#00B398] scale-110 shadow-md'
                        : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Pattern</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.clothing.pattern.map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => updatePart('clothing', { ...appearance.clothing, pattern })}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      appearance.clothing.pattern === pattern
                        ? 'bg-[#00B398] text-white shadow-md'
                        : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#00B398]'
                    }`}
                  >
                    {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'accessories':
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Accessories (Max 5)</label>
              <div className="flex gap-2 flex-wrap">
                {AVATAR_OPTIONS.accessories.map((accessory) => {
                  const isSelected = appearance.accessories.includes(accessory);
                  return (
                    <button
                      key={accessory}
                      onClick={() => {
                        const newAccessories = isSelected
                          ? appearance.accessories.filter((a) => a !== accessory)
                          : [...appearance.accessories, accessory].slice(0, 5);
                        updatePart('accessories', newAccessories);
                      }}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-[#F2A900] text-white shadow-md'
                          : 'bg-white text-[#004F71] border-2 border-[#E5E7EB] hover:border-[#F2A900]'
                      }`}
                    >
                      {accessory.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border-2 border-[#E5E7EB] overflow-hidden">
      {/* Category Tabs */}
      <div className="flex border-b-2 border-[#E5E7EB]">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#00B398] text-white'
                  : 'text-[#004F71] hover:bg-[#F0FDFA]'
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Options Area */}
      <div className="p-6 max-h-[400px] overflow-y-auto">
        {renderOptions()}
      </div>
    </div>
  );
}
