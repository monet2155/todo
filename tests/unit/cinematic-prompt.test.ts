import { describe, it, expect } from 'vitest'
import { buildCinematicPrompt } from '@/lib/prompts/cinematic'

const baseCompletions = [
  { title: '보고서 제출', grade: 'main' as const, stat_type: 'intelligence' as const, completed_at: '2026-04-14T10:00:00Z' },
  { title: '헬스장 가기', grade: 'daily' as const, stat_type: 'strength' as const, completed_at: '2026-04-15T09:00:00Z' },
]

const failedQuests = [
  { title: '독서 30분', grade: 'weekly' as const },
]

describe('buildCinematicPrompt', () => {
  it('includes week and year in user message', () => {
    const { userMessage } = buildCinematicPrompt('홍길동', baseCompletions, [], 16, 2026)
    expect(userMessage).toContain('16')
    expect(userMessage).toContain('2026')
  })

  it('includes user name in user message', () => {
    const { userMessage } = buildCinematicPrompt('홍길동', baseCompletions, [], 16, 2026)
    expect(userMessage).toContain('홍길동')
  })

  it('includes completed quest titles', () => {
    const { userMessage } = buildCinematicPrompt('홍길동', baseCompletions, [], 16, 2026)
    expect(userMessage).toContain('보고서 제출')
    expect(userMessage).toContain('헬스장 가기')
  })

  it('includes failed/overdue quests when provided', () => {
    const { userMessage } = buildCinematicPrompt('홍길동', baseCompletions, failedQuests, 16, 2026)
    expect(userMessage).toContain('독서 30분')
  })

  it('handles empty completions gracefully', () => {
    const { userMessage } = buildCinematicPrompt('홍길동', [], [], 16, 2026)
    expect(typeof userMessage).toBe('string')
    expect(userMessage.length).toBeGreaterThan(0)
  })

  it('system prompt contains scene structure instructions', () => {
    const { systemPrompt } = buildCinematicPrompt('홍길동', baseCompletions, [], 16, 2026)
    expect(systemPrompt).toMatch(/scenes|narration|visual_prompt|duration/i)
  })

  it('system prompt requests JSON output', () => {
    const { systemPrompt } = buildCinematicPrompt('홍길동', baseCompletions, [], 16, 2026)
    expect(systemPrompt).toMatch(/JSON/i)
  })
})
