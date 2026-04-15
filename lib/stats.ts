import { createClient } from '@/lib/supabase'
import type { QuestGrade, StatType } from '@/types'

const XP_MAP: Record<QuestGrade, number> = {
  daily: 5,
  weekly: 15,
  main: 30,
}

export function calculateXP(grade: QuestGrade): number {
  return XP_MAP[grade]
}

export async function applyStatGain(
  userId: string,
  statType: StatType,
  xp: number,
): Promise<void> {
  const supabase = createClient()

  // Fetch current stats row (or default to 0 if first time)
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

  const { error: upsertError } = await supabase.from('stats').upsert({
    user_id: userId,
    ...updated,
  })

  if (upsertError) {
    throw new Error(`Failed to update stats: ${upsertError.message}`)
  }
}
