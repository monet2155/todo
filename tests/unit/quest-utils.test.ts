import { describe, it, expect } from 'vitest'
import { isOverdue, groupQuestsByGrade, STAT_LABELS } from '@/lib/quest-utils'
import type { Quest } from '@/types'

function q(overrides: Partial<Quest>): Quest {
  return {
    id: 'q',
    user_id: 'u',
    title: 't',
    grade: 'daily',
    stat_type: 'strength',
    xp: 5,
    status: 'active',
    due_date: null,
    created_at: '',
    ...overrides,
  }
}

describe('isOverdue', () => {
  it('returns false for quests with no due_date', () => {
    expect(isOverdue(null, new Date('2026-04-15'))).toBe(false)
  })

  it('returns true when due_date is before today', () => {
    expect(isOverdue('2026-04-14', new Date('2026-04-15'))).toBe(true)
  })

  it('returns false when due_date is today', () => {
    expect(isOverdue('2026-04-15', new Date('2026-04-15'))).toBe(false)
  })

  it('returns false when due_date is in the future', () => {
    expect(isOverdue('2026-04-16', new Date('2026-04-15'))).toBe(false)
  })
})

describe('groupQuestsByGrade', () => {
  it('groups quests into daily / weekly / main buckets', () => {
    const quests = [
      q({ id: '1', grade: 'daily' }),
      q({ id: '2', grade: 'weekly' }),
      q({ id: '3', grade: 'main' }),
      q({ id: '4', grade: 'daily' }),
    ]
    const result = groupQuestsByGrade(quests)
    expect(result.daily.map((x) => x.id)).toEqual(['1', '4'])
    expect(result.weekly.map((x) => x.id)).toEqual(['2'])
    expect(result.main.map((x) => x.id)).toEqual(['3'])
  })

  it('returns empty arrays when no quests', () => {
    expect(groupQuestsByGrade([])).toEqual({ daily: [], weekly: [], main: [] })
  })
})

describe('STAT_LABELS', () => {
  it('maps each StatType to a Korean label', () => {
    expect(STAT_LABELS.strength).toBe('체력')
    expect(STAT_LABELS.intelligence).toBe('지력')
    expect(STAT_LABELS.charisma).toBe('카리스마')
  })
})
