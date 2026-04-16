import { describe, it, expect, vi } from 'vitest'
import { calculateXP, applyStatGain, getStatPercent, calculateStreak } from '@/lib/stats'
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

// ── getStatPercent ────────────────────────────────────────────

describe('getStatPercent', () => {
  it('returns 0 when value is 0', () => {
    expect(getStatPercent(0)).toBe(0)
  })

  it('returns 100 when value equals max', () => {
    expect(getStatPercent(100)).toBe(100)
  })

  it('returns 50 when value is half of max', () => {
    expect(getStatPercent(50)).toBe(50)
  })

  it('caps at 100 when value exceeds max', () => {
    expect(getStatPercent(150)).toBe(100)
  })

  it('respects custom max', () => {
    expect(getStatPercent(25, 200)).toBe(13)
  })

  it('returns 0 for negative value', () => {
    expect(getStatPercent(-10)).toBe(0)
  })
})

// ── calculateStreak ───────────────────────────────────────────

describe('calculateStreak', () => {
  it('returns 0 for empty completions', () => {
    expect(calculateStreak([], new Date('2026-04-16'))).toBe(0)
  })

  it('returns 1 when only today has a completion', () => {
    expect(calculateStreak(['2026-04-16'], new Date('2026-04-16'))).toBe(1)
  })

  it('counts consecutive days ending today', () => {
    const dates = ['2026-04-14', '2026-04-15', '2026-04-16']
    expect(calculateStreak(dates, new Date('2026-04-16'))).toBe(3)
  })

  it('breaks streak on gap', () => {
    const dates = ['2026-04-12', '2026-04-14', '2026-04-15', '2026-04-16']
    expect(calculateStreak(dates, new Date('2026-04-16'))).toBe(3)
  })

  it('returns 0 when most recent completion is not today or yesterday', () => {
    expect(calculateStreak(['2026-04-10'], new Date('2026-04-16'))).toBe(0)
  })

  it('handles duplicate dates on same day', () => {
    const dates = ['2026-04-15', '2026-04-15', '2026-04-16', '2026-04-16']
    expect(calculateStreak(dates, new Date('2026-04-16'))).toBe(2)
  })

  it('counts streak starting from yesterday when today has no completion', () => {
    const dates = ['2026-04-13', '2026-04-14', '2026-04-15']
    expect(calculateStreak(dates, new Date('2026-04-16'))).toBe(3)
  })
})
