import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createOpenAIClient } from '@/lib/openai'
import { buildCinematicPrompt } from '@/lib/prompts/cinematic'
import type { RecapScript } from '@/types'

// POST /api/recap/script
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const { week_number, year } = (body ?? {}) as { week_number?: unknown; year?: unknown }

  if (typeof week_number !== 'number' || typeof year !== 'number') {
    return NextResponse.json({ error: 'week_number and year are required numbers' }, { status: 400 })
  }

  // 유저 이름 조회
  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const userName = profile?.name ?? '용사'

  // 해당 주차 완료 퀘스트 조회
  const { data: completions } = await supabase
    .from('completions')
    .select('quest_id, title, grade, stat_type, completed_at')
    .eq('user_id', user.id)
    .eq('week_number', week_number)

  const completionList = (completions ?? []) as Array<{
    title: string
    grade: 'daily' | 'weekly' | 'main'
    stat_type: 'strength' | 'intelligence' | 'charisma'
    completed_at: string
  }>

  const { systemPrompt, userMessage } = buildCinematicPrompt(
    userName,
    completionList,
    [],
    week_number,
    year,
  )

  const openai = createOpenAIClient()
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
  })

  const raw = completion.choices[0]?.message?.content ?? '{}'

  let script: RecapScript
  try {
    script = JSON.parse(raw) as RecapScript
  } catch {
    return NextResponse.json({ error: 'failed to parse script from AI' }, { status: 500 })
  }

  if (!Array.isArray(script.scenes) || script.scenes.length === 0) {
    return NextResponse.json({ error: 'AI returned empty scenes' }, { status: 500 })
  }

  return NextResponse.json(script)
}
