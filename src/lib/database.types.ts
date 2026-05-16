export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          stiki_id: string
          email: string | null
          display_name: string
          date_of_birth: string | null
          avatar_id: string | null
          role: string
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          stiki_id: string
          email?: string | null
          display_name: string
          date_of_birth?: string | null
          avatar_id?: string | null
          role?: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          stiki_id?: string
          email?: string | null
          display_name?: string
          date_of_birth?: string | null
          avatar_id?: string | null
          role?: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      avatars: {
        Row: {
          id: string
          user_id: string
          name: string
          appearance: Json
          is_default: boolean
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          appearance?: Json
          is_default?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          appearance?: Json
          is_default?: boolean
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      worlds: {
        Row: {
          id: string
          owner_id: string
          name: string
          description: string | null
          biome: string
          theme: Json
          tile_map: Json
          buildings: Json
          is_public: boolean
          visit_count: number
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          description?: string | null
          biome?: string
          theme?: Json
          tile_map?: Json
          buildings?: Json
          is_public?: boolean
          visit_count?: number
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          description?: string | null
          biome?: string
          theme?: Json
          tile_map?: Json
          buildings?: Json
          is_public?: boolean
          visit_count?: number
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      friendships: {
        Row: {
          id: string
          requester_id: string
          addressee_id: string
          status: string
          deleted_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          requester_id: string
          addressee_id: string
          status?: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          requester_id?: string
          addressee_id?: string
          status?: string
          deleted_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      inventory_items: {
        Row: {
          id: string
          user_id: string
          item_type: string
          item_id: string
          quantity: number
          equipped: boolean
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          item_type: string
          item_id: string
          quantity?: number
          equipped?: boolean
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          item_type?: string
          item_id?: string
          quantity?: number
          equipped?: boolean
          deleted_at?: string | null
          created_at?: string
        }
      }
      catalog_items: {
        Row: {
          id: string
          name: string
          item_type: string
          category: string
          rarity: string
          price: number
          asset_url: string | null
          metadata: Json
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          item_type: string
          category: string
          rarity?: string
          price?: number
          asset_url?: string | null
          metadata?: Json
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          item_type?: string
          category?: string
          rarity?: string
          price?: number
          asset_url?: string | null
          metadata?: Json
          deleted_at?: string | null
          created_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          world_id: string
          host_id: string
          status: string
          player_count: number
          max_players: number
          started_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          world_id: string
          host_id: string
          status?: string
          player_count?: number
          max_players?: number
          started_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          world_id?: string
          host_id?: string
          status?: string
          player_count?: number
          max_players?: number
          started_at?: string
          ended_at?: string | null
        }
      }
      session_players: {
        Row: {
          id: string
          session_id: string
          user_id: string
          avatar_id: string | null
          position: Json
          joined_at: string
          left_at: string | null
        }
        Insert: {
          id?: string
          session_id: string
          user_id: string
          avatar_id?: string | null
          position?: Json
          joined_at?: string
          left_at?: string | null
        }
        Update: {
          id?: string
          session_id?: string
          user_id?: string
          avatar_id?: string | null
          position?: Json
          joined_at?: string
          left_at?: string | null
        }
      }
      npcs: {
        Row: {
          id: string
          world_id: string
          name: string
          appearance: Json
          position: Json
          dialogue_tree: Json
          quests: Json
          is_active: boolean
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          world_id: string
          name: string
          appearance?: Json
          position?: Json
          dialogue_tree?: Json
          quests?: Json
          is_active?: boolean
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          world_id?: string
          name?: string
          appearance?: Json
          position?: Json
          dialogue_tree?: Json
          quests?: Json
          is_active?: boolean
          deleted_at?: string | null
          created_at?: string
        }
      }
      activity_events: {
        Row: {
          id: string
          user_id: string | null
          entity_type: string
          entity_id: string
          action: string
          metadata: Json
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          entity_type: string
          entity_id: string
          action: string
          metadata?: Json
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          entity_type?: string
          entity_id?: string
          action?: string
          metadata?: Json
          created_at?: string
        }
      }
    }
  }
}
