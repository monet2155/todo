import { describe, it, expect, vi, beforeEach } from 'vitest'

type FakeState = { user: { id: string } | null; completions: unknown[]; recaps: unknown[] }
const state: FakeState = { user: { id: 'user-1' }, completions: [], recaps: [] }

function resetState() {
  state.user = { id: 'user-1' }
  // Supabase select('completed_at, quests(...)') returns nested shape
  state.completions = [
    {
      completed_at: '2026-04-14T10:00:00Z',
      quests: { title: '운동', grade: 'daily', stat_type: 'strength' },
    },
  ]
  state.recaps = []
}

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: state.user }, error: null })),
    },
    from: (table: string) => ({
      select: () => ({
        eq: (_col: string, _val: unknown) => ({
          eq: () => ({
            then: (resolve: (v: unknown) => void) => {
              if (table === 'completions') resolve({ data: state.completions, error: null })
              else resolve({ data: [], error: null })
              return Promise.resolve()
            },
          }),
          single: async () => ({ data: { name: '홍길동' }, error: null }),
        }),
      }),
      upsert: async () => ({
        select: () => ({
          single: async () => ({ data: { id: 'recap-1', status: 'pending' }, error: null }),
        }),
      }),
    }),
  }),
}))

// Mock Anthropic — messages.create returns content blocks
vi.mock('@/lib/anthropic', () => ({
  DEFAULT_MODEL: 'claude-sonnet-4-6',
  createAnthropicClient: () => ({
    messages: {
      create: vi.fn(async () => ({
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              title: 'CHRONICLES OF 홍길동',
              scenes: [
                { narration: '전설이 시작되다', visual_prompt: 'epic dawn', duration: 4 },
              ],
            }),
          },
        ],
      })),
    },
  }),
}))

import { POST as createScript } from '@/app/api/recap/script/route'

function req(body?: unknown) {
  return new Request('http://localhost/api/recap/script', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/recap/script', () => {
  beforeEach(resetState)

  it('returns 401 when unauthenticated', async () => {
    state.user = null
    const res = await createScript(req({ week_number: 16, year: 2026 }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when week_number is missing', async () => {
    const res = await createScript(req({ year: 2026 }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when year is missing', async () => {
    const res = await createScript(req({ week_number: 16 }))
    expect(res.status).toBe(400)
  })

  it('returns 200 with scenes array for valid request', async () => {
    const res = await createScript(req({ week_number: 16, year: 2026 }))
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(Array.isArray(json.scenes)).toBe(true)
    expect(json.title).toBeTruthy()
  })
})
