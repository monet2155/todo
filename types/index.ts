import type { Database, RecapScene, RecapScript } from './database'

// ── Row aliases ──────────────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Quest = Database['public']['Tables']['quests']['Row']
export type Completion = Database['public']['Tables']['completions']['Row']
export type Stats = Database['public']['Tables']['stats']['Row']
export type Recap = Database['public']['Tables']['recaps']['Row']

// ── Domain enums ─────────────────────────────────────────────
export type NPCType = Profile['npc_type']           // 'knight' | 'rival' | 'sage'
export type QuestGrade = Quest['grade']             // 'daily' | 'weekly' | 'main'
export type StatType = Quest['stat_type']           // 'strength' | 'intelligence' | 'charisma'
export type QuestStatus = Quest['status']           // 'active' | 'completed' | 'failed'
export type RecapStatus = Recap['status']           // 'pending' | 'generating' | 'done' | 'failed'

// ── JSONB shapes ─────────────────────────────────────────────
export type { RecapScene, RecapScript }

// ── Insert helpers ────────────────────────────────────────────
export type QuestInsert = Database['public']['Tables']['quests']['Insert']
export type QuestUpdate = Database['public']['Tables']['quests']['Update']
export type RecapInsert = Database['public']['Tables']['recaps']['Insert']
export type RecapUpdate = Database['public']['Tables']['recaps']['Update']

// ── UI types ─────────────────────────────────────────────────
export type QuestWithStatus = Quest & {
  isOverdue: boolean
}

export type StatsDisplay = {
  strength: number
  intelligence: number
  charisma: number
  totalCompleted: number
  streakDays: number
}
