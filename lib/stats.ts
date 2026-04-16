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

export function getStatPercent(value: number, max: number = 100): number {
  if (value <= 0) return 0
  return Math.min(Math.round((value / max) * 100), 100)
}

export function calculateStreak(completionDates: string[], now: Date = new Date()): number {
  if (completionDates.length === 0) return 0

  // Deduplicate and sort dates descending
  const uniqueDates = Array.from(new Set(completionDates.map((d) => d.slice(0, 10)))).sort().reverse()

  const toDay = (dateStr: string) => {
    const [y, m, d] = dateStr.split('-').map(Number)
    return new Date(y, m - 1, d).getTime()
  }

  const todayMs = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const ONE_DAY = 86_400_000

  // Streak must start from today or yesterday
  const mostRecent = toDay(uniqueDates[0])
  if (mostRecent < todayMs - ONE_DAY) return 0

  let streak = 0
  let expected = mostRecent

  for (const dateStr of uniqueDates) {
    const ms = toDay(dateStr)
    if (ms === expected) {
      streak++
      expected -= ONE_DAY
    } else if (ms < expected) {
      break
    }
  }

  return streak
}
