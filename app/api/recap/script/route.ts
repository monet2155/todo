import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAnthropicClient, DEFAULT_MODEL } from '@/lib/anthropic'
import { buildCinematicPrompt } from '@/lib/prompts/cinematic'
import type { RecapScript } from '@/types'

// POST /api/recap/script — generates cinematic scenes[] JSON via Claude
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const { week_number, year } = (body ?? {}) as { week_number?: unknown; year?: unknown }

  if (typeof week_number !== 'number' || typeof year !== 'number') {
    return NextResponse.json(
      { error: 'week_number and year are required numbers' },
      { status: 400 },
    )
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('name')
    .eq('id', user.id)
    .single()

  const userName = profile?.name ?? '용사'

  type CompletionRow = {
    completed_at: string
    quests: { title: string; grade: string; stat_type: string } | null
  }

  const { data: completions } = await supabase
    .from('completions')
    .select('completed_at, quests(title, grade, stat_type)')
    .eq('user_id', user.id)
    .eq('week_number', week_number) as { data: CompletionRow[] | null; error: unknown }

  const completionList = (completions ?? [])
    .filter((c) => c.quests !== null)
    .map((c) => ({
      title:        c.quests!.title,
      grade:        c.quests!.grade as 'daily' | 'weekly' | 'main',
      stat_type:    c.quests!.stat_type as 'strength' | 'intelligence' | 'charisma',
      completed_at: c.completed_at,
    }))

  const { systemPrompt, userMessage } = buildCinematicPrompt(
    userName,
    completionList,
    [],
    week_number,
    year,
  )

  const anthropic = createAnthropicClient()
  const message = await anthropic.messages.create({
    model: DEFAULT_MODEL,
    max_tokens: 2048,
    // System prompt includes the JSON schema & rules — stable across users → cache.
    system: [
      {
        type: 'text',
        text: systemPrompt,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw = message.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('')
    .trim()

  // Claude may wrap JSON in ```json ... ``` fences — strip if present
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')

  let script: RecapScript
  try {
    script = JSON.parse(cleaned) as RecapScript
  } catch {
    return NextResponse.json(
      { error: 'failed to parse script from AI', raw: cleaned.slice(0, 200) },
      { status: 500 },
    )
  }

  if (!Array.isArray(script.scenes) || script.scenes.length === 0) {
    return NextResponse.json({ error: 'AI returned empty scenes' }, { status: 500 })
  }

  return NextResponse.json(script)
}
