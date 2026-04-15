// Generated type shape matching supabase/migrations/001_initial_schema.sql
// Replace with: npx supabase gen types typescript --local > types/database.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          npc_type: 'knight' | 'rival' | 'sage'
          created_at: string
        }
        Insert: {
          id: string
          name: string
          npc_type: 'knight' | 'rival' | 'sage'
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          npc_type?: 'knight' | 'rival' | 'sage'
          created_at?: string
        }
        Relationships: []
      }
      quests: {
        Row: {
          id: string
          user_id: string
          title: string
          grade: 'daily' | 'weekly' | 'main'
          stat_type: 'strength' | 'intelligence' | 'charisma'
          xp: number
          status: 'active' | 'completed' | 'failed'
          due_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          grade: 'daily' | 'weekly' | 'main'
          stat_type: 'strength' | 'intelligence' | 'charisma'
          xp?: number
          status?: 'active' | 'completed' | 'failed'
          due_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          grade?: 'daily' | 'weekly' | 'main'
          stat_type?: 'strength' | 'intelligence' | 'charisma'
          xp?: number
          status?: 'active' | 'completed' | 'failed'
          due_date?: string | null
          created_at?: string
        }
        Relationships: []
      }
      completions: {
        Row: {
          id: string
          quest_id: string
          user_id: string
          completed_at: string
          week_number: number
        }
        Insert: {
          id?: string
          quest_id: string
          user_id: string
          completed_at?: string
          week_number: number
        }
        Update: {
          id?: string
          quest_id?: string
          user_id?: string
          completed_at?: string
          week_number?: number
        }
        Relationships: []
      }
      stats: {
        Row: {
          id: string
          user_id: string
          strength: number
          intelligence: number
          charisma: number
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          strength?: number
          intelligence?: number
          charisma?: number
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          strength?: number
          intelligence?: number
          charisma?: number
          updated_at?: string
        }
        Relationships: []
      }
      recaps: {
        Row: {
          id: string
          user_id: string
          week_number: number
          year: number
          script: RecapScript | null
          video_url: string | null
          status: 'pending' | 'generating' | 'done' | 'failed'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          week_number: number
          year: number
          script?: RecapScript | null
          video_url?: string | null
          status?: 'pending' | 'generating' | 'done' | 'failed'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          week_number?: number
          year?: number
          script?: RecapScript | null
          video_url?: string | null
          status?: 'pending' | 'generating' | 'done' | 'failed'
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

// JSONB shape stored in recaps.script
export type RecapScene = {
  narration: string
  visual_prompt: string
  duration: number
}

export type RecapScript = {
  title: string
  scenes: RecapScene[]
}
