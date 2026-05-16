'use client';

import { useState } from 'react';
import { useAvatarStore } from '@/store/avatarStore';
import AvatarPreview from '@/components/avatar/AvatarPreview';
import OptionPicker from '@/components/avatar/OptionPicker';
import { Sparkles, RotateCcw, Save, Heart } from 'lucide-react';

export default function AvatarStudioPage() {
  const { appearance, name, setName, resetToDefault } = useAvatarStore();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      // Try API save first
      const res = await fetch('/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          appearance,
          isDefault: true,
        }),
      });

      if (res.ok) {
        setSaved(true);
      } else {
        // Fallback to localStorage
        localStorage.setItem('mina-avatar', JSON.stringify({ name, appearance, savedAt: new Date().toISOString() }));
        setSaved(true);
      }
    } catch {
      // Fallback to localStorage on network error
      localStorage.setItem('mina-avatar', JSON.stringify({ name, appearance, savedAt: new Date().toISOString() }));
      setSaved(true);
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-[#F0FDFA] to-[#FFE4E1]">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b-2 border-[#E5E7EB] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00B398] to-[#004F71] rounded-xl flex items-center justify-center shadow-md">
              <Sparkles className="text-white" size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#004F71]">Mina&apos;s World</h1>
              <p className="text-xs text-[#00B398] font-medium">Avatar Studio</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#004F71] bg-white border-2 border-[#E5E7EB] rounded-xl hover:border-[#00B398] hover:text-[#00B398] transition-all"
            >
              <RotateCcw size={16} />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-xl transition-all ${
                saved
                  ? 'bg-[#00B398]'
                  : 'bg-gradient-to-r from-[#00B398] to-[#004F71] hover:shadow-lg hover:scale-105'
              }`}
            >
              <Save size={16} />
              <span className="hidden sm:inline">{saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-[#004F71]">Create Your Kawaii Avatar</h2>
          <p className="text-[#004F71]/60 mt-1">Design your character — pick hair, eyes, clothes, and more!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Panel */}
          <div className="order-1 lg:order-2 space-y-4">
            <div className="bg-white rounded-xl border-2 border-[#E5E7EB] p-4">
              <label className="text-sm font-medium text-[#004F71] mb-2 block">Avatar Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                className="w-full px-4 py-2 rounded-lg border-2 border-[#E5E7EB] focus:border-[#00B398] focus:outline-none text-[#004F71] font-medium transition-colors"
                placeholder="Name your avatar..."
              />
            </div>

            <AvatarPreview />

            {/* Quick Stats */}
            <div className="bg-white rounded-xl border-2 border-[#E5E7EB] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#004F71]/60">Accessories</span>
                <span className="font-medium text-[#004F71]">{appearance.accessories.length} / 5</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {appearance.accessories.map((acc) => (
                  <span
                    key={acc}
                    className="px-2 py-1 bg-[#F0FDFA] text-[#00B398] text-xs rounded-lg font-medium"
                  >
                    {acc.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <div className="mt-3 pt-3 border-t border-[#E5E7EB] flex items-center gap-2 text-xs text-[#004F71]/50">
                <Heart size={12} className="text-[#EF4444]" />
                <span>Made with love for Mina</span>
              </div>
            </div>
          </div>

          {/* Options Panel */}
          <div className="order-2 lg:order-1">
            <OptionPicker />
          </div>
        </div>
      </main>
    </div>
  );
}
