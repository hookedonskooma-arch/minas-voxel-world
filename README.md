# Mina's World 🌟

> **Mina's first platform!** A creative sandbox where kids design chibi anime avatars, build personalized worlds, and play together safely.

## 🎮 What Is This?

Mina's World is a web-based game platform where children can:

- **🎨 Design Chibi Avatars** — Customize hair, eyes, clothing, and accessories
- **🏗️ Build Worlds** — Create towns, houses, parks with personalized themes
- **🤝 Play Together** — Visit friends' worlds and explore together
- **🧠 Learn & Quest** — Complete fun quests and mini-games

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 + React 18 + TypeScript |
| Styling | Tailwind CSS |
| Game Engine | Phaser 3 (2D) |
| Database | Supabase Postgres |
| Auth | Stiki SSO (RS256 JWT) |
| State | Zustand |
| Validation | Zod |

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (for database)

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Database Setup

1. Create a new Supabase project
2. Run the schema SQL in `supabase/schema.sql`
3. Update `.env.local` with your project URL and anon key

## 📁 Project Structure

```
minas-world/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── studio/            # Avatar Studio page
│   │   ├── worlds/            # World Builder page
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   └── avatar/            # Avatar components
│   │       ├── AvatarPreview.tsx
│   │       └── OptionPicker.tsx
│   ├── store/
│   │   └── avatarStore.ts     # Zustand state
│   ├── types/
│   │   └── avatar.ts          # TypeScript types
│   └── lib/
│       ├── supabase.ts        # Supabase client
│       └── database.types.ts  # DB types
├── supabase/
│   └── schema.sql             # Database schema
└── .env.local.example         # Environment template
```

## 🎨 Brand Colors

- **Deep Teal**: `#004F71`
- **Bright Teal**: `#00B398`
- **Vibrant Orange**: `#F2A900`
- **Burnt Orange**: `#CF4520`
- **Background**: `#FFF8F0`

## 🛡️ Security

- ✅ Stiki SSO authentication (RS256 JWT)
- ✅ Row-Level Security (RLS) on all tables
- ✅ Soft deletes everywhere
- ✅ Input validation with Zod
- ✅ COPPA/GDPR-K compliant design

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Next.js project scaffold
- [x] Database schema + RLS
- [x] Avatar Studio UI
- [x] SVG chibi renderer

### Phase 2: World Builder
- [ ] Tile map editor
- [ ] Building placement
- [ ] Interior design

### Phase 3: Play Mode
- [ ] Phaser 3 game engine
- [ ] Avatar movement
- [ ] Object interactions

### Phase 4: Social
- [ ] Friend system
- [ ] Real-time multiplayer
- [ ] Safe chat

### Phase 5: AI & Polish
- [ ] Smart NPCs via Paperclip
- [ ] Quest generation
- [ ] Parent dashboard

## 👨‍👧 Credits

- **Founder & Creative Director**: Mina (Age 7)
- **Engineering**: Dad (Chibitek)
- **Platform**: Chibitek Labs

---

*Made with 💖 for Mina*
