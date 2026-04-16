import { describe, it, expect, vi, beforeEach } from 'vitest'

// ── Mocks ─────────────────────────────────────────────────────

type FakeState = {
  user: { id: string } | null
}

const state: FakeState = { user: { id: 'user-1' } }

function resetState() {
  state.user = { id: 'user-1' }
}

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: state.user }, error: null })),
    },
  }),
}))

// Mock OpenAI so tests don't hit the network
vi.mock('@/lib/openai', () => ({
  createOpenAIClient: () => ({
    chat: {
      completions: {
        create: vi.fn(async () => ({
          [Symbol.asyncIterator]: async function* () {
            yield { choices: [{ delta: { content: '안녕하세요, 용사여!' } }] }
          },
        })),
      },
    },
  }),
}))

import { POST as briefing } from '@/app/api/briefing/route'

function req(body?: unknown) {
  return new Request('http://localhost/api/briefing', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

const validBody = {
  npc_type: 'knight',
  quests: [{ title: '보고서 제출', stat_type: 'intelligence', grade: 'daily', due_date: null }],
  stats: { strength: 50, intelligence: 20, charisma: 50 },
}

describe('POST /api/briefing', () => {
  beforeEach(resetState)

  it('returns 401 when unauthenticated', async () => {
    state.user = null
    const res = await briefing(req(validBody))
    expect(res.status).toBe(401)
  })

  it('returns 400 when npc_type is missing', async () => {
    const res = await briefing(req({ ...validBody, npc_type: undefined }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when npc_type is invalid', async () => {
    const res = await briefing(req({ ...validBody, npc_type: 'wizard' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when stats is missing', async () => {
    const res = await briefing(req({ ...validBody, stats: undefined }))
    expect(res.status).toBe(400)
  })

  it('returns streaming response (text/event-stream) for valid request', async () => {
    const res = await briefing(req(validBody))
    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toContain('text/event-stream')
  })
})
