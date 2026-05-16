# Mina's World — Platform Architecture & Design Document

> **Vision:** A chibi anime character creation and world-building platform where players design their own avatars, build personalized worlds, and play together in a safe, creative environment.
> **Founder:** Mina (Age 7)
> **Date:** May 15, 2026

---

## 1. Executive Summary

**Mina's World** is a creative sandbox platform centered around **chibi anime avatars** — small, cute, customizable characters — that players use to explore, build, and play in **self-designed worlds**. The platform combines:

- **Avatar Studio**: Deep customization of chibi characters (hair, eyes, clothing, accessories)
- **World Builder**: Create towns, cities, houses, parks, and environments with personalized themes
- **Life Simulator**: Go to school, play in the park, build houses, design interiors, and live out stories
- **Social Play**: Visit friends' worlds, play together, and share creations

The platform targets children and young teens (ages 6–14) with a focus on **creativity, safety, and self-expression**.

---

## 2. Core Game Concepts & Mechanics

### 2.1 Avatar Studio — "Chibi Maker"
Players create and customize their chibi anime avatar through a guided, option-based system:

| Category | Options |
|----------|---------|
| **Body** | Size (tiny / small / medium), skin tone |
| **Face** | Eye shape (thin / big / sparkly / sleepy), eye color, blush style |
| **Hair** | Length (short / medium / long / extra long), style (straight / curly / pigtails / spiky), color (pink / blue / green / black / blonde / custom) |
| **Clothing** | Style (dress / shirt+skirt / shirt+pants / hoodie / kimono), material (lace / leather / cotton / silk), color, pattern |
| **Accessories** | Glasses, hats, wings, tails, pets, backpacks |
| **Personality** | Walk style, idle animation, voice pitch (for TTS) |

**Design Pattern**: Each choice is a **layered SVG or 3D mesh part** that composites in real-time. The avatar is stored as a **JSON configuration object** that can be re-rendered anywhere.

### 2.2 World Builder — "My World"
Players create and name their own worlds (e.g., "Amina Town", "Mina City"):

- **Biome Selection**: Meadow, city, beach, forest, space, candy land, underwater
- **Building System**: Place pre-made structures (houses, schools, parks, shops) or build custom ones block-by-block
- **Interior Design**: Furnish and decorate inside buildings with furniture, wallpaper, flooring
- **Theming**: Apply color palettes (pink world, blue world, rainbow world) and weather effects
- **NPCs**: Populate worlds with friendly characters that give quests or tell stories

**Design Pattern**: Worlds are **procedurally generated + player-edited tile maps** stored as JSON. Each world has a unique ID and an owner (the creator).

### 2.3 Life Simulator — "Play Mode"
Once inside a world, the avatar can:

- **Walk / Run / Jump** in 2.5D or 3D environments
- **Interact** with objects (sit on chairs, sleep in beds, eat at tables)
- **Go to School**: Mini-games for math, spelling, art, music
- **Visit the Park**: Swings, slides, sandbox, multiplayer games
- **Build a House**: Place walls, doors, windows, furniture in real-time
- **Shop**: Buy new clothing, furniture, and decorations with in-game currency
- **Quests**: Complete tasks from NPCs to earn rewards

### 2.4 Social Features
- **Friend System**: Send friend requests, visit each other's worlds
- **Play Together**: Real-time multiplayer in the same world (up to 8 players)
- **Showcase**: Share screenshots and world tours
- **Safe Chat**: Pre-approved phrases + emoji-only mode for younger players

---

## 3. Technical Architecture

### 3.1 High-Level Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 14 (App Router) + React 18 | Full-stack, SSR for SEO, dynamic world rendering |
| **Game Engine** | Phaser 3 (2D) or Three.js (3D) | Browser-based, WebGL-accelerated, large community |
| **Styling** | Tailwind CSS + `@chibitek/ui` | Brand consistency, design tokens |
| **Database** | Supabase Postgres | Managed Postgres, RLS, Realtime, Auth bridge |
| **ORM** | Prisma | Type-safe migrations, complex relational model |
| **State Management** | Zustand | Minimal boilerplate for game state |
| **Multiplayer** | Supabase Realtime + Colyseus (if needed) | Real-time presence, state sync |
| **Asset Storage** | Supabase Storage | Avatar parts, world tilesets, user-generated content |
| **AI / NPCs** | Paperclip Agent Integration | Smart NPCs via MCP, quest generation |
| **Auth** | Stiki SSO (`auth.chibitek.com`) | Chibitek standard, child-safe identity |

### 3.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Next.js App  │  │  Phaser/3.js │  │  Avatar Studio  │  │
│  │   (React)     │  │  (Game Canvas)│  │   (SVG/WebGL)   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS / WSS
┌────────────────────▼────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)            │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  World API    │  │  Avatar API   │  │  Social API     │  │
│  │  /api/worlds  │  │  /api/avatars │  │  /api/friends   │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Game State   │  │  Asset API    │  │  MCP Gateway    │  │
│  │  /api/sessions│  │  /api/assets  │  │  /api/mcp       │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Data & Services Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │  Supabase     │  │  Redis        │  │  Paperclip      │  │
│  │  Postgres     │  │  (Sessions)   │  │  (AI NPCs)      │  │
│  │  + RLS        │  │  + Rate Limit │  │  + MCP          │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐                        │
│  │  Supabase     │  │  Event Bus    │                        │
│  │  Storage      │  │  (Cross-Platform)│                       │
│  │  (Assets)     │  │               │                        │
│  └──────────────┘  └──────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

### 3.3 Key Services

| Service | Responsibility |
|---------|---------------|
| **Avatar Service** | CRUD avatar configurations, validate part combinations, render composite images |
| **World Service** | CRUD world definitions, tile maps, building placements, theming |
| **Game Session Service** | Manage active play sessions, player positions, interactions |
| **Asset Service** | Upload, validate, and serve avatar parts, tilesets, furniture, UGC |
| **Social Service** | Friend requests, world sharing, safe chat, moderation |
| **NPC Service** | AI-driven NPC dialogue, quest generation via Paperclip MCP |

---

## 4. Database Schema

### 4.1 Core Tables

```sql
-- Users (bridged from Stiki SSO)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stiki_id TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT NOT NULL,
  date_of_birth DATE,           -- For COPPA compliance / age gating
  avatar_id UUID REFERENCES avatars(id),
  role TEXT DEFAULT 'player',   -- player | parent | moderator
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Avatars (Chibi Characters)
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,           -- e.g., "Amina"
  
  -- Appearance JSON (flexible, versioned)
  appearance JSONB NOT NULL DEFAULT '{}',
  -- Example structure:
  -- {
  --   "version": 1,
  --   "body": { "size": "small", "skin_tone": "#FFDBAC" },
  --   "face": { "eye_shape": "big", "eye_color": "#00B398", "blush": "soft" },
  --   "hair": { "length": "long", "style": "pigtails", "color": "#F2A900" },
  --   "clothing": { "top": "dress", "material": "lace", "color": "#FFFFFF", "pattern": "dots" },
  --   "accessories": ["glasses", "wings"]
  -- }
  
  is_default BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Worlds (Player-Created Environments)
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,           -- e.g., "Amina Town"
  description TEXT,
  
  -- World Configuration
  biome TEXT DEFAULT 'meadow',  -- meadow | city | beach | forest | space | candy | underwater
  theme JSONB DEFAULT '{}',     -- { "primary_color": "#F2A900", "sky": "sunset", "weather": "clear" }
  
  -- World Data (Tile Map + Objects)
  tile_map JSONB DEFAULT '{}',  -- { "width": 64, "height": 64, "layers": [...], "tileset": "default" }
  buildings JSONB DEFAULT '[]', -- [ { "id": "house_1", "type": "house", "x": 10, "y": 20, "interior": {...} } ]
  
  is_public BOOLEAN DEFAULT false,
  visit_count INTEGER DEFAULT 0,
  
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- World Visits (Social / Analytics)
CREATE TABLE world_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES worlds(id),
  visitor_id UUID NOT NULL REFERENCES users(id),
  visited_at TIMESTAMPTZ DEFAULT now()
);

-- Friends (Social Graph)
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id),
  addressee_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'pending', -- pending | accepted | blocked
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Inventory (Items Owned by Player)
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  item_type TEXT NOT NULL,      -- clothing | furniture | accessory | tileset | emote
  item_id TEXT NOT NULL,        -- Reference to catalog item
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT false, -- For clothing/accessories
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Catalog (Available Items in Shop)
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  item_type TEXT NOT NULL,      -- clothing | furniture | accessory | tileset | emote
  category TEXT NOT NULL,       -- hair | eyes | top | bottom | shoes | hat | etc.
  rarity TEXT DEFAULT 'common', -- common | rare | epic | legendary
  price INTEGER DEFAULT 0,      -- In-game currency
  asset_url TEXT,               -- SVG / PNG / GLB reference
  metadata JSONB DEFAULT '{}',  -- { "color_options": [...], "animated": true }
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Game Sessions (Active Play Instances)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES worlds(id),
  host_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'active', -- active | paused | ended
  player_count INTEGER DEFAULT 1,
  max_players INTEGER DEFAULT 8,
  started_at TIMESTAMPTZ DEFAULT now(),
  ended_at TIMESTAMPTZ NULL
);

-- Session Players (Who's in the session)
CREATE TABLE session_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES game_sessions(id),
  user_id UUID NOT NULL REFERENCES users(id),
  avatar_id UUID REFERENCES avatars(id),
  position JSONB DEFAULT '{"x": 0, "y": 0}', -- Last known position
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ NULL
);

-- Activity Events (Audit Trail)
CREATE TABLE activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,    -- avatar | world | friendship | inventory | session
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,         -- created | updated | deleted | visited | played | purchased
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- NPCs (Non-Player Characters in Worlds)
CREATE TABLE npcs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES worlds(id),
  name TEXT NOT NULL,
  appearance JSONB DEFAULT '{}',
  position JSONB DEFAULT '{"x": 0, "y": 0}',
  dialogue_tree JSONB DEFAULT '{}',
  quests JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 Row-Level Security (RLS) Policies

```sql
-- Enable RLS on all tenant-scoped tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;

-- Users: Can only see own profile + public profiles of friends
CREATE POLICY users_self_or_friend ON users
  FOR SELECT USING (
    id = current_setting('app.current_user_id')::UUID
    OR id IN (
      SELECT addressee_id FROM friendships 
      WHERE requester_id = current_setting('app.current_user_id')::UUID AND status = 'accepted'
      UNION
      SELECT requester_id FROM friendships 
      WHERE addressee_id = current_setting('app.current_user_id')::UUID AND status = 'accepted'
    )
  );

-- Avatars: Owner only
CREATE POLICY avatars_owner ON avatars
  FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- Worlds: Owner + public worlds + friends' public worlds
CREATE POLICY worlds_access ON worlds
  FOR SELECT USING (
    owner_id = current_setting('app.current_user_id')::UUID
    OR is_public = true
    OR owner_id IN (
      SELECT addressee_id FROM friendships 
      WHERE requester_id = current_setting('app.current_user_id')::UUID AND status = 'accepted'
      UNION
      SELECT requester_id FROM friendships 
      WHERE addressee_id = current_setting('app.current_user_id')::UUID AND status = 'accepted'
    )
  );

-- Worlds: Only owner can modify
CREATE POLICY worlds_owner_modify ON worlds
  FOR UPDATE USING (owner_id = current_setting('app.current_user_id')::UUID);

-- Friendships: Involved parties only
CREATE POLICY friendships_involved ON friendships
  FOR ALL USING (
    requester_id = current_setting('app.current_user_id')::UUID
    OR addressee_id = current_setting('app.current_user_id')::UUID
  );

-- Inventory: Owner only
CREATE POLICY inventory_owner ON inventory_items
  FOR ALL USING (user_id = current_setting('app.current_user_id')::UUID);

-- Game Sessions: Participants only
CREATE POLICY sessions_participants ON game_sessions
  FOR SELECT USING (
    id IN (
      SELECT session_id FROM session_players 
      WHERE user_id = current_setting('app.current_user_id')::UUID
    )
  );

-- NPCs: Visible in accessible worlds
CREATE POLICY npcs_world_access ON npcs
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE 
        owner_id = current_setting('app.current_user_id')::UUID
        OR is_public = true
    )
  );
```

### 4.3 Indexes

```sql
CREATE INDEX idx_avatars_user_id ON avatars(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_worlds_owner_id ON worlds(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_worlds_public ON worlds(is_public) WHERE is_public = true AND deleted_at IS NULL;
CREATE INDEX idx_friendships_status ON friendships(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_user_type ON inventory_items(user_id, item_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_world ON game_sessions(world_id, status) WHERE status = 'active';
CREATE INDEX idx_activity_events_user ON activity_events(user_id, created_at);
```

---

## 5. Avatar Customization System

### 5.1 Asset Pipeline

Avatar parts are **modular SVG assets** stored in Supabase Storage:

```
assets/
  avatar-parts/
    body/
      small_base.svg
      medium_base.svg
    eyes/
      big_#{color}.svg      -- Color variants generated at runtime
      thin_#{color}.svg
      sparkly_#{color}.svg
    hair/
      short_#{color}.svg
      long_pigtails_#{color}.svg
      curly_#{color}.svg
    clothing/
      dress_lace_#{color}.svg
      hoodie_cotton_#{color}.svg
    accessories/
      glasses_round.svg
      wings_pink.svg
```

**Rendering Strategy**:
1. Client requests avatar configuration
2. Server returns JSON with part IDs and colors
3. Client composites SVG layers in a `<svg>` element (or WebGL texture atlas for 3D)
4. Colors applied via CSS `fill` or shader uniforms

### 5.2 Avatar Configuration Schema (Zod)

```typescript
const AvatarAppearanceSchema = z.object({
  version: z.number().default(1),
  body: z.object({
    size: z.enum(['tiny', 'small', 'medium']),
    skinTone: z.string().regex(/^#[0-9A-F]{6}$/i)
  }),
  face: z.object({
    eyeShape: z.enum(['thin', 'big', 'sparkly', 'sleepy']),
    eyeColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    blush: z.enum(['none', 'soft', 'rosy', 'dramatic'])
  }),
  hair: z.object({
    length: z.enum(['short', 'medium', 'long', 'extra_long']),
    style: z.enum(['straight', 'curly', 'pigtails', 'spiky', 'bob']),
    color: z.string().regex(/^#[0-9A-F]{6}$/i),
    highlightColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional()
  }),
  clothing: z.object({
    top: z.enum(['dress', 'shirt', 'hoodie', 'kimono']),
    bottom: z.enum(['skirt', 'pants', 'shorts', 'none']).optional(),
    material: z.enum(['lace', 'leather', 'cotton', 'silk', 'denim']),
    primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i),
    secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
    pattern: z.enum(['solid', 'stripes', 'dots', 'floral', 'checkered']).optional()
  }),
  accessories: z.array(z.enum([
    'glasses', 'hat', 'wings', 'tail', 'backpack', 'pet_cat', 'pet_dog', 'bow'
  ])).max(5)
});
```

### 5.3 Avatar API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/avatars` | Create new avatar |
| `GET` | `/api/avatars/:id` | Get avatar configuration + rendered image URL |
| `PATCH` | `/api/avatars/:id` | Update avatar parts |
| `DELETE` | `/api/avatars/:id` | Soft delete avatar |
| `POST` | `/api/avatars/:id/render` | Generate PNG/WebP render of avatar |
| `GET` | `/api/avatars/:id/preview.svg` | Real-time SVG preview (composited server-side or client-side) |

---

## 6. World Builder Architecture

### 6.1 World Data Model

A world is a **tile-based map** with object placement:

```typescript
interface WorldData {
  id: string;
  name: string;
  biome: BiomeType;
  dimensions: { width: number; height: number };
  tileSize: number; // e.g., 32px
  layers: TileLayer[];
  buildings: Building[];
  npcs: NPC[];
  theme: WorldTheme;
}

interface TileLayer {
  id: string;
  name: string; // "ground", "vegetation", "objects", "collision"
  tiles: (number | null)[][]; // Tile index or null
  tileset: string; // Reference to asset
}

interface Building {
  id: string;
  type: string; // "house", "school", "shop", "park"
  position: { x: number; y: number };
  rotation: number;
  interior?: InteriorData;
}

interface WorldTheme {
  primaryColor: string;
  secondaryColor: string;
  skyGradient: [string, string];
  ambientLight: number;
  weather: 'clear' | 'rain' | 'snow' | 'sunny';
}
```

### 6.2 World Builder UI

The builder is a **drag-and-drop canvas**:

1. **Toolbar**: Select biome, theme, brush size
2. **Tile Palette**: Choose ground tiles (grass, pavement, water, sand)
3. **Object Palette**: Place buildings, trees, furniture, decorations
4. **Layer Panel**: Toggle between ground, objects, collision layers
5. **Interior Mode**: Click a building to edit inside
6. **Play Test**: Instantly switch to Play Mode to walk around

### 6.3 World API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/worlds` | Create new world |
| `GET` | `/api/worlds` | List user's worlds + public worlds |
| `GET` | `/api/worlds/:id` | Get full world data |
| `PATCH` | `/api/worlds/:id` | Update world (tile map, buildings, theme) |
| `DELETE` | `/api/worlds/:id` | Soft delete world |
| `POST` | `/api/worlds/:id/visit` | Record a visit |
| `POST` | `/api/worlds/:id/fork` | Copy a public world as template |

---

## 7. Social & Multiplayer Architecture

### 7.1 Friend System

```typescript
// Friend request flow
async function sendFriendRequest(fromUserId: string, toUserId: string) {
  // 1. Check if already friends or pending
  // 2. Create friendship record with status 'pending'
  // 3. Send notification via Event Bus
  // 4. Log activity event
}

async function acceptFriendRequest(friendshipId: string) {
  // 1. Update status to 'accepted'
  // 2. Enable mutual world access
  // 3. Publish event: friendship.accepted
}
```

### 7.2 Real-Time Multiplayer

Using **Supabase Realtime** for lightweight sync:

```typescript
// Subscribe to player positions in a world
const channel = supabase
  .channel(`world:${worldId}`)
  .on('presence', { event: 'sync' }, () => {
    const state = channel.presenceState();
    updatePlayerPositions(state);
  })
  .on('broadcast', { event: 'player_move' }, (payload) => {
    updateRemotePlayerPosition(payload.userId, payload.position);
  })
  .subscribe();

// Broadcast own position
channel.send({
  type: 'broadcast',
  event: 'player_move',
  payload: { userId, position: { x, y } }
});
```

For **8+ player sessions** or complex physics, upgrade to **Colyseus** with authoritative server.

### 7.3 Safe Chat System

| Age Group | Chat Mode |
|-----------|-----------|
| Under 8 | Emoji + pre-approved phrases only |
| 8–12 | Quick chat menu + filtered free text |
| 13+ | Free text with AI moderation + report system |

**Moderation Pipeline**:
1. Client sends message
2. Server validates against banned word list
3. AI moderation service (Azure Content Safety) scans
4. Message published to Realtime channel
5. Players can report → triggers human review queue

---

## 8. AI Integration (Paperclip / MCP)

### 8.1 Smart NPCs

NPCs powered by Paperclip agents via MCP:

```typescript
// MCP Tool: npc_dialogue
{
  name: 'npc_dialogue',
  description: 'Generate NPC dialogue response based on context',
  inputSchema: {
    type: 'object',
    properties: {
      npcId: { type: 'string' },
      playerMessage: { type: 'string' },
      worldContext: { type: 'object' },
      npcPersonality: { type: 'string' } // "friendly", "grumpy", "mysterious"
    }
  }
}
```

**Example Interaction**:
- Player: "What should I do today?"
- NPC (via Paperclip): "The park is lovely today! Maybe you could plant some flowers near the fountain. I heard pink tulips are in season!"

### 8.2 Quest Generation

```typescript
// MCP Tool: generate_quest
{
  name: 'generate_quest',
  description: 'Create a kid-friendly quest for a world',
  inputSchema: {
    type: 'object',
    properties: {
      worldId: { type: 'string' },
      difficulty: { type: 'string', enum: ['easy', 'medium', 'hard'] },
      theme: { type: 'string' } // "exploration", "building", "social", "learning"
    }
  }
}
```

---

## 9. Security & Safety

### 9.1 COPPA / GDPR-K Compliance

- **Age Verification**: Collect date of birth at registration
- **Parental Consent**: Email verification required for under-13 accounts
- **Data Minimization**: Only store necessary data; purge inactive accounts after 2 years
- **Right to Deletion**: Full account deletion (hard delete after 30-day grace period)

### 9.2 Content Safety

- **UGC Moderation**: All uploaded images reviewed by AI + human queue
- **Avatar Appropriateness**: Block adult-themed clothing combinations
- **World Content Scan**: Detect and block inappropriate building names or NPC dialogue
- **Report System**: Players can report worlds, avatars, or messages

### 9.3 Chibitek Security Standards

- ✅ Stiki SSO auth (RS256 JWT)
- ✅ RLS on all tables
- ✅ Soft deletes everywhere
- ✅ Rate limiting per user (prevent world spam)
- ✅ Input validation with Zod
- ✅ API keys hashed with bcrypt (for external integrations)
- ✅ Activity audit trail

---

## 10. Implementation Roadmap

### Phase 1: Foundation (Weeks 1–4)
- [ ] Scaffold Next.js project with Tailwind + `@chibitek/ui`
- [ ] Set up Supabase project with schema + RLS policies
- [ ] Implement Stiki auth bridge
- [ ] Create avatar configuration API + basic SVG renderer
- [ ] Build avatar studio UI (option picker + live preview)

### Phase 2: World Builder (Weeks 5–8)
- [ ] Implement tile map data model + storage
- [ ] Build drag-and-drop world builder canvas
- [ ] Create tileset asset pipeline (biome-themed tiles)
- [ ] Add building placement + interior editing
- [ ] World save/load + list view

### Phase 3: Play Mode (Weeks 9–12)
- [ ] Integrate Phaser 3 game engine
- [ ] Avatar movement + animation in world
- [ ] Object interaction system (sit, sleep, eat)
- [ ] Mini-games (school subjects, park games)
- [ ] Inventory + shop system

### Phase 4: Social (Weeks 13–16)
- [ ] Friend system + friend requests
- [ ] Real-time multiplayer (Supabase Realtime)
- [ ] World sharing + public/private settings
- [ ] Safe chat system
- [ ] Visit tracking + world discovery page

### Phase 5: AI & Polish (Weeks 17–20)
- [ ] Paperclip MCP integration for NPCs
- [ ] Quest generation system
- [ ] Parent dashboard (screen time, friend list, activity)
- [ ] Performance optimization (asset lazy loading, world streaming)
- [ ] Mobile responsiveness + touch controls

### Phase 6: Launch Prep (Weeks 21–24)
- [ ] Beta testing with Mina's friends
- [ ] Content moderation tuning
- [ ] Marketing page + onboarding flow
- [ ] Deploy to production (Azure / Vercel)

---

## 11. Branding & UI Direction

### Visual Style
- **Chibi Aesthetic**: Round, soft, big-headed characters with expressive eyes
- **Color Palette**: Pastel primary colors with Chibitek brand accents
  - Background: Soft cream `#FFF8F0`
  - Primary UI: Deep Teal `#004F71`
  - Accent: Bright Teal `#00B398`
  - Fun pops: Vibrant Orange `#F2A900`, Burnt Orange `#CF4520`
  - Pastel pinks, blues, greens for world theming
- **Typography**: Inter for UI, rounded display font for headers
- **Animations**: Bouncy, playful transitions (spring physics)

### Key Screens
1. **Login / Sign Up** — Stiki-branded, kid-friendly
2. **Home Dashboard** — Avatar showcase, world list, friend activity
3. **Avatar Studio** — Split-pane: options left, preview right
4. **World Builder** — Full-screen canvas with floating toolbars
5. **Play Mode** — Game canvas with chat overlay, inventory hotbar
6. **Shop** — Grid of items with try-before-buy preview

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| Avatar creations per user | ≥ 3 |
| Worlds created per user | ≥ 2 |
| Average session duration | ≥ 20 minutes |
| Friend connections per user | ≥ 2 |
| World visits (social) | ≥ 5 per user |
| Parent approval rating | ≥ 4.5 / 5 |
| UGC reports / 1000 users | < 5 |

---

*Document Version: 1.0*
*Author: Chibitek Senior SaaS Architect*
*For: Mina's World — Mina's First Platform*
