import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { QuestGrade, StatType } from '@/types'

type AppSupabaseClient = SupabaseClient<Database>

const XP_MAP: Record<QuestGrade, number> = {
  daily: 5,
  weekly: 15,
  main: 30,
}

export function calculateXP(grade: QuestGrade): number {
  return XP_MAP[grade]
}

export async function applyStatGain(
  supabase: AppSupabaseClient,
  userId: string,
  statType: StatType,
  xp: number,
): Promise<void> {
  const { data: current, error: fetchError } = await supabase
    .from('stats')
    .select('strength, intelligence, charisma')
    .eq('user_id', userId)
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch stats: ${fetchError.message}`)
  }

  const base = current ?? { strength: 0, intelligence: 0, charisma: 0 }

  const updated = {
    strength: base.strength,
    intelligence: base.intelligence,
    charisma: base.charisma,
    updated_at: new Date().toISOString(),
  }
  updated[statType] = base[statType] + xp

  const { error: upsertError } = await supabase
    .from('stats')
    .upsert({ user_id: userId, ...updated }, { onConflict: 'user_id' })

  if (upsertError) {
    throw new Error(`Failed to update stats: ${upsertError.message}`)
  }
}
