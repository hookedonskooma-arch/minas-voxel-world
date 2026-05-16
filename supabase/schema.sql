-- Mina's World Database Schema
-- Created: May 15, 2026
-- Platform: Mina's World - Chibi Avatar & World Builder

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Users (bridged from Stiki SSO)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stiki_id TEXT UNIQUE NOT NULL,
  email TEXT,
  display_name TEXT NOT NULL,
  date_of_birth DATE,
  avatar_id UUID,
  role TEXT DEFAULT 'player',
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Avatars (Chibi Characters)
CREATE TABLE avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  appearance JSONB NOT NULL DEFAULT '{}',
  is_default BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add foreign key from users to avatars after avatars table exists
ALTER TABLE users ADD CONSTRAINT fk_users_avatar 
  FOREIGN KEY (avatar_id) REFERENCES avatars(id) ON DELETE SET NULL;

-- Worlds (Player-Created Environments)
CREATE TABLE worlds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  description TEXT,
  biome TEXT DEFAULT 'meadow',
  theme JSONB DEFAULT '{}',
  tile_map JSONB DEFAULT '{}',
  buildings JSONB DEFAULT '[]',
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
  status TEXT DEFAULT 'pending',
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester_id, addressee_id)
);

-- Inventory (Items Owned by Player)
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  item_type TEXT NOT NULL,
  item_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  equipped BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Catalog (Available Items in Shop)
CREATE TABLE catalog_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  item_type TEXT NOT NULL,
  category TEXT NOT NULL,
  rarity TEXT DEFAULT 'common',
  price INTEGER DEFAULT 0,
  asset_url TEXT,
  metadata JSONB DEFAULT '{}',
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Game Sessions (Active Play Instances)
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  world_id UUID NOT NULL REFERENCES worlds(id),
  host_id UUID NOT NULL REFERENCES users(id),
  status TEXT DEFAULT 'active',
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
  position JSONB DEFAULT '{"x": 0, "y": 0}',
  joined_at TIMESTAMPTZ DEFAULT now(),
  left_at TIMESTAMPTZ NULL
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

-- Activity Events (Audit Trail)
CREATE TABLE activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

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
    id = current_setting('app.current_user_id', true)::UUID
    OR id IN (
      SELECT addressee_id FROM friendships 
      WHERE requester_id = current_setting('app.current_user_id', true)::UUID AND status = 'accepted'
      UNION
      SELECT requester_id FROM friendships 
      WHERE addressee_id = current_setting('app.current_user_id', true)::UUID AND status = 'accepted'
    )
  );

CREATE POLICY users_insert_own ON users
  FOR INSERT WITH CHECK (id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY users_update_own ON users
  FOR UPDATE USING (id = current_setting('app.current_user_id', true)::UUID);

-- Avatars: Owner only
CREATE POLICY avatars_owner_select ON avatars
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY avatars_owner_insert ON avatars
  FOR INSERT WITH CHECK (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY avatars_owner_update ON avatars
  FOR UPDATE USING (user_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY avatars_owner_delete ON avatars
  FOR DELETE USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- Worlds: Owner + public worlds + friends' public worlds
CREATE POLICY worlds_access_select ON worlds
  FOR SELECT USING (
    owner_id = current_setting('app.current_user_id', true)::UUID
    OR is_public = true
    OR owner_id IN (
      SELECT addressee_id FROM friendships 
      WHERE requester_id = current_setting('app.current_user_id', true)::UUID AND status = 'accepted'
      UNION
      SELECT requester_id FROM friendships 
      WHERE addressee_id = current_setting('app.current_user_id', true)::UUID AND status = 'accepted'
    )
  );

CREATE POLICY worlds_owner_insert ON worlds
  FOR INSERT WITH CHECK (owner_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY worlds_owner_update ON worlds
  FOR UPDATE USING (owner_id = current_setting('app.current_user_id', true)::UUID);

CREATE POLICY worlds_owner_delete ON worlds
  FOR DELETE USING (owner_id = current_setting('app.current_user_id', true)::UUID);

-- Friendships: Involved parties only
CREATE POLICY friendships_involved ON friendships
  FOR ALL USING (
    requester_id = current_setting('app.current_user_id', true)::UUID
    OR addressee_id = current_setting('app.current_user_id', true)::UUID
  );

-- Inventory: Owner only
CREATE POLICY inventory_owner ON inventory_items
  FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- Game Sessions: Participants only
CREATE POLICY sessions_participants ON game_sessions
  FOR SELECT USING (
    id IN (
      SELECT session_id FROM session_players 
      WHERE user_id = current_setting('app.current_user_id', true)::UUID
    )
  );

-- Session Players: Self only
CREATE POLICY session_players_self ON session_players
  FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- NPCs: Visible in accessible worlds
CREATE POLICY npcs_world_access ON npcs
  FOR SELECT USING (
    world_id IN (
      SELECT id FROM worlds WHERE 
        owner_id = current_setting('app.current_user_id', true)::UUID
        OR is_public = true
    )
  );

-- Activity Events: Self only
CREATE POLICY activity_events_self ON activity_events
  FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX idx_users_stiki_id ON users(stiki_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_avatars_user_id ON avatars(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_worlds_owner_id ON worlds(owner_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_worlds_public ON worlds(is_public) WHERE is_public = true AND deleted_at IS NULL;
CREATE INDEX idx_friendships_status ON friendships(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_inventory_user_type ON inventory_items(user_id, item_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_sessions_world ON game_sessions(world_id, status) WHERE status = 'active';
CREATE INDEX idx_activity_events_user ON activity_events(user_id, created_at);
CREATE INDEX idx_world_visits_world ON world_visits(world_id, visited_at);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_avatars_updated_at BEFORE UPDATE ON avatars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worlds_updated_at BEFORE UPDATE ON worlds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Activity event logging trigger for avatars
CREATE OR REPLACE FUNCTION log_avatar_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_events (user_id, entity_type, entity_id, action, metadata)
    VALUES (NEW.user_id, 'avatar', NEW.id, 'created', jsonb_build_object('name', NEW.name));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_events (user_id, entity_type, entity_id, action, metadata)
    VALUES (NEW.user_id, 'avatar', NEW.id, 'updated', jsonb_build_object('name', NEW.name));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER avatar_activity AFTER INSERT OR UPDATE ON avatars
  FOR EACH ROW EXECUTE FUNCTION log_avatar_activity();

-- Activity event logging trigger for worlds
CREATE OR REPLACE FUNCTION log_world_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO activity_events (user_id, entity_type, entity_id, action, metadata)
    VALUES (NEW.owner_id, 'world', NEW.id, 'created', jsonb_build_object('name', NEW.name, 'biome', NEW.biome));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO activity_events (user_id, entity_type, entity_id, action, metadata)
    VALUES (NEW.owner_id, 'world', NEW.id, 'updated', jsonb_build_object('name', NEW.name));
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER world_activity AFTER INSERT OR UPDATE ON worlds
  FOR EACH ROW EXECUTE FUNCTION log_world_activity();

-- ============================================
-- SEED DATA
-- ============================================

-- Seed catalog items (starter content)
INSERT INTO catalog_items (name, item_type, category, rarity, price, metadata) VALUES
  ('Pink Pigtails', 'clothing', 'hair', 'common', 0, '{"color": "#FF1493", "style": "pigtails"}'),
  ('Blue Spiky Hair', 'clothing', 'hair', 'common', 0, '{"color": "#004F71", "style": "spiky"}'),
  ('Golden Bob', 'clothing', 'hair', 'rare', 50, '{"color": "#FFD700", "style": "bob"}'),
  ('Lace Dress', 'clothing', 'top', 'common', 0, '{"material": "lace", "type": "dress"}'),
  ('Denim Jacket', 'clothing', 'top', 'common', 25, '{"material": "denim", "type": "jacket"}'),
  ('Silk Kimono', 'clothing', 'top', 'epic', 100, '{"material": "silk", "type": "kimono"}'),
  ('Round Glasses', 'accessory', 'face', 'common', 10, '{"style": "round"}'),
  ('Angel Wings', 'accessory', 'back', 'legendary', 200, '{"style": "angel"}'),
  ('Cute Bow', 'accessory', 'head', 'common', 0, '{"style": "bow"}'),
  ('Backpack Puppy', 'accessory', 'back', 'rare', 75, '{"style": "pet", "animal": "dog"}');

-- Seed default tilesets
INSERT INTO catalog_items (name, item_type, category, rarity, price, metadata) VALUES
  ('Meadow Grass', 'tileset', 'ground', 'common', 0, '{"biome": "meadow", "tile_type": "ground"}'),
  ('City Pavement', 'tileset', 'ground', 'common', 0, '{"biome": "city", "tile_type": "ground"}'),
  ('Beach Sand', 'tileset', 'ground', 'common', 0, '{"biome": "beach", "tile_type": "ground"}'),
  ('Candy Floor', 'tileset', 'ground', 'rare', 50, '{"biome": "candy", "tile_type": "ground"}'),
  ('Space Tiles', 'tileset', 'ground', 'epic', 100, '{"biome": "space", "tile_type": "ground"}');
