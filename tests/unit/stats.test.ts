import { describe, it, expect, vi, beforeEach } from 'vitest'
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
    const results = grades.map(calculateXP)
    expect(results).toEqual([5, 15, 30])
  })
})

// ── applyStatGain ─────────────────────────────────────────────

// Mock the Supabase client so we test logic, not the network
vi.mock('@/lib/supabase', () => {
  const rpcMock = vi.fn().mockResolvedValue({ error: null })
  const fromMock = vi.fn(() => ({
    upsert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { strength: 10, intelligence: 20, charisma: 5 },
      error: null,
    }),
  }))
  return {
    createClient: () => ({
      rpc: rpcMock,
      from: fromMock,
    }),
  }
})

describe('applyStatGain', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('resolves without throwing for strength', async () => {
    await expect(
      applyStatGain('user-123', 'strength', 5),
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing for intelligence', async () => {
    await expect(
      applyStatGain('user-456', 'intelligence', 15),
    ).resolves.toBeUndefined()
  })

  it('resolves without throwing for charisma', async () => {
    await expect(
      applyStatGain('user-789', 'charisma', 30),
    ).resolves.toBeUndefined()
  })

  it('covers all StatType values', async () => {
    const statTypes: StatType[] = ['strength', 'intelligence', 'charisma']
    for (const statType of statTypes) {
      await expect(
        applyStatGain('user-test', statType, 10),
      ).resolves.toBeUndefined()
    }
  })
})
