import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { RecapScript } from '@/types'

// POST /api/recap — recap 레코드 생성 (script 포함)
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const { week_number, year, script } = (body ?? {}) as {
    week_number?: unknown
    year?: unknown
    script?: unknown
  }

  if (typeof week_number !== 'number' || typeof year !== 'number') {
    return NextResponse.json({ error: 'week_number and year are required numbers' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('recaps')
    .upsert(
      {
        user_id: user.id,
        week_number,
        year,
        script: script as RecapScript ?? null,
        status: 'pending',
      },
      { onConflict: 'user_id,week_number,year' },
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(data, { status: 201 })
}
