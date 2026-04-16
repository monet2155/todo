import { describe, it, expect, vi, beforeEach } from 'vitest'

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

// Mock Anthropic SDK — emulate the event-emitter surface used in the route
vi.mock('@/lib/anthropic', () => ({
  DEFAULT_MODEL: 'claude-sonnet-4-6',
  createAnthropicClient: () => ({
    messages: {
      stream: vi.fn(() => {
        const listeners: Record<string, ((v: unknown) => void)[]> = {}
        const api = {
          on(event: string, cb: (v: unknown) => void) {
            ;(listeners[event] ??= []).push(cb)
            return api
          },
          async finalMessage() {
            // Fire a fake text delta, then resolve
            for (const cb of listeners['text'] ?? []) cb('안녕하세요, 용사여!')
            return { content: [{ type: 'text', text: '안녕하세요, 용사여!' }] }
          },
        }
        return api
      }),
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
