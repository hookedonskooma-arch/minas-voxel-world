'use client';

import { useState } from 'react';
import { useAvatarStore } from '@/store/avatarStore';
import ChibiAvatar from '@/components/ChibiAvatar';
import BottomNav from '@/components/BottomNav';
import { AVATAR_OPTIONS } from '@/types/avatar';

const TABS = [
  { id: 'hair', label: 'Hair' },
  { id: 'eyes', label: 'Eyes' },
  { id: 'outfit', label: 'Outfit' },
  { id: 'extras', label: 'Extras' },
];

const SWATCHES = [
  { color: '#8B5CF6', label: 'Violet', part: 'hair' },
  { color: '#EC4899', label: 'Pink', part: 'hair' },
  { color: '#10B981', label: 'Mint', part: 'outfit' },
  { color: '#F59E0B', label: 'Star', part: 'outfit' },
];

export default function AvatarStudioPage() {
  const { appearance, name, setName, updatePart } = useAvatarStore();
  const [activeTab, setActiveTab] = useState('hair');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSwatchClick = (swatch: (typeof SWATCHES)[0]) => {
    if (swatch.part === 'hair') {
      updatePart('hair', { ...appearance.hair, color: swatch.color });
    } else {
      updatePart('clothing', { ...appearance.clothing, primaryColor: swatch.color });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/avatars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, appearance, isDefault: true }),
      });
      if (res.ok) setSaved(true);
    } catch {
      // ignore
    } finally {
      setSaving(false);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="phone-screen">
      <div className="ios-status">
        <span>9:41</span>
        <span>5G 100%</span>
      </div>

      <main className="app-shell">
        {/* Top Bar */}
        <nav className="topbar">
          <span className="avatar-chip">Avatar Studio</span>
          <button className="icon-btn" onClick={handleSave} aria-label="Save avatar">
            {saving ? '...' : saved ? '✓' : '✓'}
          </button>
        </nav>

        {/* Panel */}
        <section className="panel">
          {/* Pill Tabs */}
          <div className="pill-tabs" aria-label="Avatar categories">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={activeTab === tab.id ? 'is-active' : ''}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Chibi Stage */}
          <ChibiAvatar />

          {/* Name Input */}
          <div style={{ marginTop: 12 }}>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
              placeholder="Name your avatar..."
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--fg)',
                background: 'white',
              }}
            />
          </div>

          {/* Swatch Palette */}
          <div className="palette-row" aria-label="Color choices" style={{ marginTop: 14 }}>
            {SWATCHES.map((swatch) => (
              <button
                key={swatch.label}
                className="swatch"
                style={{ background: swatch.color }}
                onClick={() => handleSwatchClick(swatch)}
                aria-label={`${swatch.label} ${swatch.part}`}
              />
            ))}
          </div>

          {/* Category-specific options */}
          <div style={{ marginTop: 14 }}>
            {activeTab === 'hair' && (
              <div className="preset-row">
                {AVATAR_OPTIONS.hair.style.map((s) => (
                  <button
                    key={s}
                    className={`preset ${appearance.hair.style === s ? 'is-active' : ''}`}
                    onClick={() => updatePart('hair', { ...appearance.hair, style: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'eyes' && (
              <div className="preset-row">
                {AVATAR_OPTIONS.face.eyeShape.map((s) => (
                  <button
                    key={s}
                    className={`preset ${appearance.face.eyeShape === s ? 'is-active' : ''}`}
                    onClick={() => updatePart('face', { ...appearance.face, eyeShape: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'outfit' && (
              <div className="preset-row">
                {AVATAR_OPTIONS.clothing.top.map((t) => (
                  <button
                    key={t}
                    className={`preset ${appearance.clothing.top === t ? 'is-active' : ''}`}
                    onClick={() => updatePart('clothing', { ...appearance.clothing, top: t })}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
            {activeTab === 'extras' && (
              <div className="preset-row">
                {AVATAR_OPTIONS.accessories.map((a) => {
                  const isActive = appearance.accessories.includes(a);
                  return (
                    <button
                      key={a}
                      className={`preset ${isActive ? 'is-active' : ''}`}
                      onClick={() => {
                        const next = isActive
                          ? appearance.accessories.filter((x) => x !== a)
                          : [...appearance.accessories, a].slice(0, 5);
                        updatePart('accessories', next);
                      }}
                    >
                      {a.replace('_', ' ')}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Safety Panel */}
        <section className="sheet">
          <h3>Safety style rules</h3>
          <div className="safety-row">
            <span>No free text</span>
            <span className="badge">On</span>
          </div>
          <div className="safety-row">
            <span>Preset-only outfits</span>
            <span className="badge">On</span>
          </div>
        </section>

        <BottomNav />
      </main>
    </div>
  );
}
