'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  sticker?: string;
  timestamp: string;
}

const PRESET_PHRASES = [
  'Hello! 👋',
  'Your world is so cute! 🌸',
  'I love your avatar! ✨',
  'Let\'s play together! 🎮',
  'This is so fun! 🎀',
  'See you later! ☁️',
  'Thank you! 💕',
  'Wow! 🌟',
];

const STICKERS = ['👋', '❤️', '🌟', '🎀', '🌸', '☁️', '✨', '🎮'];

export default function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'Lulu',
      text: 'Hello! 👋',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [showStickers, setShowStickers] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = (text: string, sticker?: string) => {
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'You',
      text,
      sticker,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    setShowStickers(false);
  };

  return (
    <div
      className="panel"
      style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <div
        ref={scrollRef}
        style={{
          maxHeight: 160,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 6,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              alignSelf: msg.sender === 'You' ? 'flex-end' : 'flex-start',
              background:
                msg.sender === 'You'
                  ? 'color-mix(in oklch, var(--accent), white 60%)'
                  : 'white',
              borderRadius: 14,
              padding: '8px 12px',
              maxWidth: '80%',
              fontSize: 13,
            }}
          >
            <span style={{ fontWeight: 800, fontSize: 11, color: 'var(--muted)' }}>
              {msg.sender}
            </span>
            <div>
              {msg.sticker ? (
                <span style={{ fontSize: 24 }}>{msg.sticker}</span>
              ) : (
                msg.text
              )}
            </div>
          </div>
        ))}
      </div>

      {showStickers ? (
        <div className="grid-2" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {STICKERS.map((s) => (
            <button
              key={s}
              className="swatch"
              style={{ height: 44, fontSize: 22, borderRadius: 14 }}
              onClick={() => sendMessage('', s)}
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="preset-row" style={{ gap: 6 }}>
          {PRESET_PHRASES.slice(0, 3).map((phrase) => (
            <button
              key={phrase}
              className="preset"
              style={{ fontSize: 11, padding: '0 10px', minHeight: 34 }}
              onClick={() => sendMessage(phrase)}
            >
              {phrase}
            </button>
          ))}
          <button
            className="preset"
            style={{ fontSize: 11, padding: '0 10px', minHeight: 34 }}
            onClick={() => setShowStickers(true)}
          >
            🎀 Stickers
          </button>
        </div>
      )}
    </div>
  );
}
