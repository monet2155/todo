import { describe, it, expect, vi, beforeEach } from 'vitest'

type FakeState = {
  user: { id: string } | null
  recaps: Array<{ id: string; user_id: string; status: string; video_url: string | null; script: unknown }>
}

const state: FakeState = {
  user: { id: 'user-1' },
  recaps: [],
}

function resetState() {
  state.user = { id: 'user-1' }
  state.recaps = [
    {
      id: 'recap-1',
      user_id: 'user-1',
      status: 'pending',
      video_url: null,
      script: { title: 'Test', scenes: [{ narration: 'test', visual_prompt: 'test', duration: 3 }] },
    },
  ]
}

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: state.user }, error: null })),
    },
    from: (_table: string) => ({
      select: () => ({
        eq: (_col: string, val: unknown) => ({
          eq: (_col2: string, _val2: unknown) => ({
            single: async () => {
              const recap = state.recaps.find((r) => r.id === val && r.user_id === state.user?.id)
              return { data: recap ?? null, error: recap ? null : { message: 'not found' } }
            },
          }),
          single: async () => {
            const recap = state.recaps.find((r) => r.id === val)
            if (recap && recap.user_id !== state.user?.id) return { data: null, error: { message: 'not found' } }
            return { data: recap ?? null, error: recap ? null : { message: 'not found' } }
          },
        }),
      }),
      update: (values: Record<string, unknown>) => ({
        eq: (_col: string, val: unknown) => {
          const recap = state.recaps.find((r) => r.id === val)
          if (recap) Object.assign(recap, values)
          return Promise.resolve({ error: null })
        },
      }),
    }),
  }),
}))

import { POST as generateRecap } from '@/app/api/recap/generate/route'
import { GET as getStatus } from '@/app/api/recap/[id]/status/route'

function req(body?: unknown, url = 'http://localhost/api/recap/generate') {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/recap/generate', () => {
  beforeEach(resetState)

  it('returns 401 when unauthenticated', async () => {
    state.user = null
    const res = await generateRecap(req({ recap_id: 'recap-1' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when recap_id is missing', async () => {
    const res = await generateRecap(req({}))
    expect(res.status).toBe(400)
  })

  it('returns 404 when recap does not belong to user', async () => {
    state.recaps[0].user_id = 'other-user'
    const res = await generateRecap(req({ recap_id: 'recap-1' }))
    expect(res.status).toBe(404)
  })

  it('immediately returns { status: generating } and 202', async () => {
    const res = await generateRecap(req({ recap_id: 'recap-1' }))
    expect(res.status).toBe(202)
    const json = await res.json()
    expect(json.status).toBe('generating')
  })

  it('updates recap status to generating in state', async () => {
    await generateRecap(req({ recap_id: 'recap-1' }))
    expect(state.recaps[0].status).toBe('generating')
  })
})

describe('GET /api/recap/[id]/status', () => {
  beforeEach(resetState)

  it('returns 401 when unauthenticated', async () => {
    state.user = null
    const res = await getStatus(
      new Request('http://localhost/api/recap/recap-1/status'),
      { params: { id: 'recap-1' } },
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 when recap not found', async () => {
    const res = await getStatus(
      new Request('http://localhost/api/recap/nonexistent/status'),
      { params: { id: 'nonexistent' } },
    )
    expect(res.status).toBe(404)
  })

  it('returns recap status for valid request', async () => {
    const res = await getStatus(
      new Request('http://localhost/api/recap/recap-1/status'),
      { params: { id: 'recap-1' } },
    )
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.status).toBe('pending')
    expect('video_url' in json).toBe(true)
  })
})
