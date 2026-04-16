import { describe, it, expect } from 'vitest'
import { getNPCConfig, NPC_TYPES } from '@/lib/npc-config'
import type { NPCType } from '@/types'

describe('getNPCConfig', () => {
  it('returns config for knight', () => {
    const cfg = getNPCConfig('knight')
    expect(cfg.label).toBe('기사단장')
    expect(cfg.icon).toBeTruthy()
  })

  it('returns config for rival', () => {
    const cfg = getNPCConfig('rival')
    expect(cfg.label).toBe('라이벌')
    expect(cfg.icon).toBeTruthy()
  })

  it('returns config for sage', () => {
    const cfg = getNPCConfig('sage')
    expect(cfg.label).toBe('현자')
    expect(cfg.icon).toBeTruthy()
  })

  it('covers all NPCType values', () => {
    const types: NPCType[] = ['knight', 'rival', 'sage']
    for (const t of types) {
      expect(() => getNPCConfig(t)).not.toThrow()
      expect(getNPCConfig(t).label.length).toBeGreaterThan(0)
    }
  })

  it('NPC_TYPES contains all three types', () => {
    expect(NPC_TYPES).toContain('knight')
    expect(NPC_TYPES).toContain('rival')
    expect(NPC_TYPES).toContain('sage')
    expect(NPC_TYPES).toHaveLength(3)
  })
})
