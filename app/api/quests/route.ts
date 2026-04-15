import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateXP } from '@/lib/stats'
import type { QuestGrade, StatType } from '@/types'

const GRADES: QuestGrade[] = ['daily', 'weekly', 'main']
const STATS: StatType[] = ['strength', 'intelligence', 'charisma']

// POST /api/quests — 퀘스트 생성
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  if (!body) {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const { title, grade, stat_type, due_date } = body as {
    title?: string
    grade?: QuestGrade
    stat_type?: StatType
    due_date?: string | null
  }

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }
  if (!grade || !GRADES.includes(grade)) {
    return NextResponse.json({ error: 'invalid grade' }, { status: 400 })
  }
  if (!stat_type || !STATS.includes(stat_type)) {
    return NextResponse.json({ error: 'invalid stat_type' }, { status: 400 })
  }

  const xp = calculateXP(grade)

  const { data, error } = await supabase
    .from('quests')
    .insert({
      user_id: user.id,
      title: title.trim(),
      grade,
      stat_type,
      xp,
      status: 'active',
      due_date: due_date ?? null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

// GET /api/quests — 활성 퀘스트 목록
export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('quests')
    .select('*')
    .eq('user_id', user.id)
    .in('status', ['active'])
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
