import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { applyStatGain } from '@/lib/stats'

// PATCH /api/quests/[id] — 퀘스트 완료
export async function PATCH(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // 본인 퀘스트 확인 (RLS도 걸려있지만 명확한 404를 위해)
  const { data: quest, error: fetchError } = await supabase
    .from('quests')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !quest || quest.user_id !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  if (quest.status === 'completed') {
    return NextResponse.json({ error: 'already completed' }, { status: 409 })
  }

  // 1) 퀘스트 상태 업데이트
  const { data: updated, error: updateError } = await supabase
    .from('quests')
    .update({ status: 'completed' })
    .eq('id', params.id)
    .select()
    .single()

  if (updateError || !updated) {
    return NextResponse.json({ error: updateError?.message ?? 'failed' }, { status: 500 })
  }

  // 2) completions 기록
  const now = new Date()
  const weekNumber = getISOWeekNumber(now)
  const { error: completionError } = await supabase.from('completions').insert({
    quest_id: quest.id,
    user_id: user.id,
    completed_at: now.toISOString(),
    week_number: weekNumber,
  })
  if (completionError) {
    console.error('[complete quest] completion insert failed:', completionError)
    return NextResponse.json({ error: completionError.message }, { status: 500 })
  }

  // 3) 스탯 증가
  try {
    await applyStatGain(supabase, user.id, quest.stat_type, quest.xp)
  } catch (e) {
    console.error('[complete quest] applyStatGain failed:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'stat update failed' },
      { status: 500 },
    )
  }

  return NextResponse.json(updated)
}

// DELETE /api/quests/[id] — 퀘스트 삭제
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  // 본인 퀘스트 확인
  const { data: quest } = await supabase
    .from('quests')
    .select('user_id')
    .eq('id', params.id)
    .single()

  if (!quest || quest.user_id !== user.id) {
    return NextResponse.json({ error: 'not found' }, { status: 404 })
  }

  const { error } = await supabase.from('quests').delete().eq('id', params.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}

// ISO 8601 week number (월~일 기준)
function getISOWeekNumber(date: Date): number {
  const target = new Date(date.valueOf())
  const dayNr = (date.getUTCDay() + 6) % 7
  target.setUTCDate(target.getUTCDate() - dayNr + 3)
  const firstThursday = new Date(Date.UTC(target.getUTCFullYear(), 0, 4))
  const diff = (target.getTime() - firstThursday.getTime()) / 86400000
  return 1 + Math.floor(diff / 7)
}
