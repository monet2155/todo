import { describe, it, expect, vi, beforeEach } from 'vitest'

// Shared fake client state that test modules and mocks can read/write
type FakeState = {
  user: { id: string } | null
  quests: Array<{
    id: string
    user_id: string
    title: string
    grade: 'daily' | 'weekly' | 'main'
    stat_type: 'strength' | 'intelligence' | 'charisma'
    xp: number
    status: 'active' | 'completed' | 'failed'
    due_date: string | null
    created_at: string
  }>
  completions: Array<Record<string, unknown>>
  stats: { strength: number; intelligence: number; charisma: number } | null
}

const state: FakeState = {
  user: null,
  quests: [],
  completions: [],
  stats: null,
}

function resetState() {
  state.user = { id: 'user-1' }
  state.quests = []
  state.completions = []
  state.stats = { strength: 0, intelligence: 0, charisma: 0 }
}

// Build a minimal Supabase-like client that the route handlers can use
function fakeClient() {
  return {
    auth: {
      getUser: vi.fn(async () => ({
        data: { user: state.user },
        error: null,
      })),
    },
    from: (table: string) => buildTableBuilder(table),
  }
}

function buildTableBuilder(table: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const chain: any = {}
  let filter: Record<string, unknown> = {}

  chain.insert = (values: Record<string, unknown>) => {
    const row = {
      id: `${table}-${Math.random().toString(36).slice(2, 8)}`,
      ...values,
    }
    if (table === 'quests') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      state.quests.push({ created_at: new Date().toISOString(), ...row } as any)
    } else if (table === 'completions') {
      state.completions.push(row)
    }
    chain.__lastInserted = row
    return {
      select: () => ({
        single: async () => ({ data: chain.__lastInserted, error: null }),
      }),
    }
  }

  chain.select = () => chain
  chain.eq = (col: string, val: unknown) => {
    filter = { ...filter, [col]: val }
    return chain
  }
  chain.in = (col: string, vals: unknown[]) => {
    filter = { ...filter, [`${col}__in`]: vals }
    return chain
  }
  chain.order = () => chain
  chain.single = async () => {
    if (table === 'quests') {
      const q = state.quests.find((q) => q.id === filter['id'])
      return { data: q ?? null, error: q ? null : { code: 'PGRST116' } }
    }
    if (table === 'stats') {
      return { data: state.stats, error: null }
    }
    return { data: null, error: null }
  }
  chain.then = (resolve: (v: unknown) => void) => {
    // Used when `.select().eq(...)` is awaited directly (list queries)
    if (table === 'quests') {
      const list = state.quests.filter((q) => {
        if (filter['user_id'] && q.user_id !== filter['user_id']) return false
        if (filter['status__in'] && !(filter['status__in'] as string[]).includes(q.status)) return false
        return true
      })
      resolve({ data: list, error: null })
      return Promise.resolve({ data: list, error: null })
    }
    resolve({ data: [], error: null })
    return Promise.resolve({ data: [], error: null })
  }
  chain.update = (values: Record<string, unknown>) => {
    return {
      eq: (_col: string, val: unknown) => ({
        select: () => ({
          single: async () => {
            const q = state.quests.find((q) => q.id === val)
            if (!q) return { data: null, error: { message: 'not found' } }
            Object.assign(q, values)
            return { data: q, error: null }
          },
        }),
      }),
    }
  }
  chain.delete = () => ({
    eq: (_col: string, val: unknown) => {
      const before = state.quests.length
      state.quests = state.quests.filter((q) => q.id !== val)
      return Promise.resolve({
        error: state.quests.length === before ? { message: 'not found' } : null,
      })
    },
  })
  chain.upsert = async (values: Record<string, unknown>) => {
    state.stats = {
      strength: (values['strength'] as number) ?? 0,
      intelligence: (values['intelligence'] as number) ?? 0,
      charisma: (values['charisma'] as number) ?? 0,
    }
    return { error: null }
  }
  return chain
}

vi.mock('@/lib/supabase-server', () => ({
  createServerSupabaseClient: () => fakeClient(),
}))

// Import AFTER the mock is set up
import { POST as createQuest, GET as listQuests } from '@/app/api/quests/route'
import { PATCH as completeQuest, DELETE as deleteQuest } from '@/app/api/quests/[id]/route'

function req(body?: unknown, url = 'http://localhost/api/quests') {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('POST /api/quests', () => {
  beforeEach(resetState)

  it('creates a quest with XP auto-calculated from grade', async () => {
    const res = await createQuest(
      req({ title: 'Run 5km', grade: 'daily', stat_type: 'strength' }),
    )
    expect(res.status).toBe(201)
    const json = await res.json()
    expect(json.xp).toBe(5)
    expect(json.title).toBe('Run 5km')
    expect(json.user_id).toBe('user-1')
    expect(state.quests).toHaveLength(1)
  })

  it('calculates 15 XP for weekly, 30 XP for main', async () => {
    const a = await (await createQuest(req({ title: 'A', grade: 'weekly', stat_type: 'intelligence' }))).json()
    expect(a.xp).toBe(15)
    const b = await (await createQuest(req({ title: 'B', grade: 'main', stat_type: 'charisma' }))).json()
    expect(b.xp).toBe(30)
  })

  it('returns 401 when unauthenticated', async () => {
    state.user = null
    const res = await createQuest(req({ title: 'X', grade: 'daily', stat_type: 'strength' }))
    expect(res.status).toBe(401)
  })

  it('returns 400 when required fields missing', async () => {
    const res = await createQuest(req({ title: 'X' }))
    expect(res.status).toBe(400)
  })

  it('returns 400 when grade is invalid', async () => {
    const res = await createQuest(req({ title: 'X', grade: 'bogus', stat_type: 'strength' }))
    expect(res.status).toBe(400)
  })
})

describe('GET /api/quests', () => {
  beforeEach(resetState)

  it('returns only active quests for the current user', async () => {
    state.quests.push(
      { id: 'q1', user_id: 'user-1', title: 'A', grade: 'daily', stat_type: 'strength', xp: 5, status: 'active', due_date: null, created_at: '' },
      { id: 'q2', user_id: 'user-1', title: 'B', grade: 'daily', stat_type: 'strength', xp: 5, status: 'completed', due_date: null, created_at: '' },
      { id: 'q3', user_id: 'user-2', title: 'C', grade: 'daily', stat_type: 'strength', xp: 5, status: 'active', due_date: null, created_at: '' },
    )
    const res = await listQuests()
    expect(res.status).toBe(200)
    const json = await res.json()
    // Active only, current user only
    expect(json.map((q: { id: string }) => q.id).sort()).toEqual(['q1'])
  })

  it('returns 401 when unauthenticated', async () => {
    state.user = null
    const res = await listQuests()
    expect(res.status).toBe(401)
  })
})

describe('PATCH /api/quests/[id] (complete)', () => {
  beforeEach(resetState)

  it('marks quest completed, records completion, and applies stat gain', async () => {
    state.quests.push({
      id: 'q1', user_id: 'user-1', title: 'A', grade: 'weekly', stat_type: 'intelligence',
      xp: 15, status: 'active', due_date: null, created_at: '',
    })
    const res = await completeQuest(
      new Request('http://localhost/api/quests/q1', { method: 'PATCH' }),
      { params: { id: 'q1' } },
    )
    expect(res.status).toBe(200)
    expect(state.quests[0].status).toBe('completed')
    expect(state.completions).toHaveLength(1)
    expect(state.stats?.intelligence).toBe(15)
  })

  it('returns 401 when unauthenticated', async () => {
    state.user = null
    const res = await completeQuest(
      new Request('http://localhost/api/quests/q1', { method: 'PATCH' }),
      { params: { id: 'q1' } },
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 when quest belongs to another user', async () => {
    state.quests.push({
      id: 'q1', user_id: 'user-2', title: 'A', grade: 'daily', stat_type: 'strength',
      xp: 5, status: 'active', due_date: null, created_at: '',
    })
    const res = await completeQuest(
      new Request('http://localhost/api/quests/q1', { method: 'PATCH' }),
      { params: { id: 'q1' } },
    )
    expect(res.status).toBe(404)
  })
})

describe('DELETE /api/quests/[id]', () => {
  beforeEach(resetState)

  it('deletes the quest owned by the user', async () => {
    state.quests.push({
      id: 'q1', user_id: 'user-1', title: 'A', grade: 'daily', stat_type: 'strength',
      xp: 5, status: 'active', due_date: null, created_at: '',
    })
    const res = await deleteQuest(
      new Request('http://localhost/api/quests/q1', { method: 'DELETE' }),
      { params: { id: 'q1' } },
    )
    expect(res.status).toBe(204)
    expect(state.quests).toHaveLength(0)
  })

  it('returns 401 when unauthenticated', async () => {
    state.user = null
    const res = await deleteQuest(
      new Request('http://localhost/api/quests/q1', { method: 'DELETE' }),
      { params: { id: 'q1' } },
    )
    expect(res.status).toBe(401)
  })
})
