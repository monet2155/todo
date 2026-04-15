import { describe, it, expect, vi } from 'vitest'
import { calculateXP, applyStatGain } from '@/lib/stats'
import type { QuestGrade, StatType } from '@/types'

// ── calculateXP ───────────────────────────────────────────────

describe('calculateXP', () => {
  it('returns 5 for daily quests', () => {
    expect(calculateXP('daily')).toBe(5)
  })

  it('returns 15 for weekly quests', () => {
    expect(calculateXP('weekly')).toBe(15)
  })

  it('returns 30 for main quests', () => {
    expect(calculateXP('main')).toBe(30)
  })

  it('covers all QuestGrade values', () => {
    const grades: QuestGrade[] = ['daily', 'weekly', 'main']
    expect(grades.map(calculateXP)).toEqual([5, 15, 30])
  })
})

// ── applyStatGain ─────────────────────────────────────────────

// Helper: a minimal fake Supabase client with recorded calls
function makeFakeClient(existingStats: { strength: number; intelligence: number; charisma: number } | null) {
  const upsert = vi.fn().mockResolvedValue({ error: null })
  const single = vi.fn().mockResolvedValue({
    data: existingStats,
    error: existingStats ? null : { code: 'PGRST116', message: 'no rows' },
  })
  const eq = vi.fn().mockReturnValue({ single })
  const select = vi.fn().mockReturnValue({ eq })
  const from = vi.fn().mockImplementation(() => ({ select, upsert }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return { from, __upsert: upsert } as any
}

describe('applyStatGain', () => {
  it('adds xp to strength when given strength statType', async () => {
    const client = makeFakeClient({ strength: 10, intelligence: 20, charisma: 5 })
    await applyStatGain(client, 'user-1', 'strength', 5)
    expect(client.__upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-1', strength: 15, intelligence: 20, charisma: 5 }),
      expect.objectContaining({ onConflict: 'user_id' }),
    )
  })

  it('adds xp to intelligence when given intelligence statType', async () => {
    const client = makeFakeClient({ strength: 0, intelligence: 0, charisma: 0 })
    await applyStatGain(client, 'user-1', 'intelligence', 15)
    expect(client.__upsert).toHaveBeenCalledWith(
      expect.objectContaining({ intelligence: 15 }),
      expect.objectContaining({ onConflict: 'user_id' }),
    )
  })

  it('adds xp to charisma when given charisma statType', async () => {
    const client = makeFakeClient({ strength: 0, intelligence: 0, charisma: 0 })
    await applyStatGain(client, 'user-1', 'charisma', 30)
    expect(client.__upsert).toHaveBeenCalledWith(
      expect.objectContaining({ charisma: 30 }),
      expect.objectContaining({ onConflict: 'user_id' }),
    )
  })

  it('initializes stats to zero when no existing row (PGRST116)', async () => {
    const client = makeFakeClient(null)
    await applyStatGain(client, 'new-user', 'strength', 5)
    expect(client.__upsert).toHaveBeenCalledWith(
      expect.objectContaining({ strength: 5, intelligence: 0, charisma: 0 }),
      expect.objectContaining({ onConflict: 'user_id' }),
    )
  })

  it('covers all StatType values', async () => {
    const statTypes: StatType[] = ['strength', 'intelligence', 'charisma']
    for (const statType of statTypes) {
      const client = makeFakeClient({ strength: 0, intelligence: 0, charisma: 0 })
      await expect(applyStatGain(client, 'u', statType, 10)).resolves.toBeUndefined()
    }
  })
})
