import { describe, it, expect } from 'vitest'
import { buildNPCPrompt, LOW_STAT_THRESHOLD } from '@/lib/prompts/npc'
import type { NPCType } from '@/types'

const baseStats = { strength: 50, intelligence: 50, charisma: 50 }
const baseQuests = [
  { title: '보고서 제출', stat_type: 'intelligence' as const, grade: 'daily' as const, due_date: null },
  { title: '헬스장 가기', stat_type: 'strength' as const, grade: 'weekly' as const, due_date: null },
]

// ── NPC 타입별 톤 ──────────────────────────────────────────────

describe('buildNPCPrompt — knight', () => {
  it('system prompt contains knight persona keywords', () => {
    const { systemPrompt } = buildNPCPrompt('knight', baseQuests, baseStats, 0)
    expect(systemPrompt).toMatch(/기사단장|충성|경어/)
  })

  it('system prompt does NOT contain rival/sage keywords', () => {
    const { systemPrompt } = buildNPCPrompt('knight', baseQuests, baseStats, 0)
    expect(systemPrompt).not.toMatch(/츤데레|라이벌/)
    expect(systemPrompt).not.toMatch(/현자|철학/)
  })
})

describe('buildNPCPrompt — rival', () => {
  it('system prompt contains rival persona keywords', () => {
    const { systemPrompt } = buildNPCPrompt('rival', baseQuests, baseStats, 0)
    expect(systemPrompt).toMatch(/라이벌|반말|도발/)
  })
})

describe('buildNPCPrompt — sage', () => {
  it('system prompt contains sage persona keywords', () => {
    const { systemPrompt } = buildNPCPrompt('sage', baseQuests, baseStats, 0)
    expect(systemPrompt).toMatch(/현자|철학|은유/)
  })
})

// ── 퀘스트 목록 반영 ──────────────────────────────────────────

describe('buildNPCPrompt — quests in user message', () => {
  it('includes quest titles in user message', () => {
    const { userMessage } = buildNPCPrompt('knight', baseQuests, baseStats, 0)
    expect(userMessage).toContain('보고서 제출')
    expect(userMessage).toContain('헬스장 가기')
  })

  it('handles empty quest list gracefully', () => {
    const { userMessage } = buildNPCPrompt('knight', [], baseStats, 0)
    expect(typeof userMessage).toBe('string')
    expect(userMessage.length).toBeGreaterThan(0)
  })
})

// ── 스탯 낮을 때 반영 ─────────────────────────────────────────

describe('buildNPCPrompt — low stats', () => {
  it('mentions low strength when below threshold', () => {
    const lowStats = { ...baseStats, strength: LOW_STAT_THRESHOLD - 1 }
    const { userMessage } = buildNPCPrompt('knight', baseQuests, lowStats, 0)
    expect(userMessage).toMatch(/체력/)
  })

  it('mentions low intelligence when below threshold', () => {
    const lowStats = { ...baseStats, intelligence: LOW_STAT_THRESHOLD - 1 }
    const { userMessage } = buildNPCPrompt('knight', baseQuests, lowStats, 0)
    expect(userMessage).toMatch(/지력/)
  })

  it('mentions low charisma when below threshold', () => {
    const lowStats = { ...baseStats, charisma: LOW_STAT_THRESHOLD - 1 }
    const { userMessage } = buildNPCPrompt('knight', baseQuests, lowStats, 0)
    expect(userMessage).toMatch(/카리스마/)
  })

  it('does not flag stats above threshold as low', () => {
    const { userMessage } = buildNPCPrompt('knight', baseQuests, baseStats, 0)
    // All stats are 50 (above LOW_STAT_THRESHOLD), should not call them low
    expect(userMessage).not.toMatch(/낮/)
  })
})

// ── 지연 퀘스트 반영 ──────────────────────────────────────────

describe('buildNPCPrompt — overdue quests', () => {
  it('mentions overdue count when > 0', () => {
    const { userMessage } = buildNPCPrompt('knight', baseQuests, baseStats, 3)
    expect(userMessage).toMatch(/지연|미완료/)
  })

  it('does not mention overdue when count is 0', () => {
    const { userMessage } = buildNPCPrompt('knight', baseQuests, baseStats, 0)
    expect(userMessage).not.toMatch(/지연된 퀘스트/)
  })
})

// ── 모든 NPC 타입 커버리지 ────────────────────────────────────

describe('buildNPCPrompt — all NPC types return valid shape', () => {
  const types: NPCType[] = ['knight', 'rival', 'sage']
  for (const t of types) {
    it(`returns systemPrompt and userMessage for ${t}`, () => {
      const result = buildNPCPrompt(t, baseQuests, baseStats, 0)
      expect(typeof result.systemPrompt).toBe('string')
      expect(result.systemPrompt.length).toBeGreaterThan(0)
      expect(typeof result.userMessage).toBe('string')
      expect(result.userMessage.length).toBeGreaterThan(0)
    })
  }
})
