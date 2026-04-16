import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// GET /api/recap/[id]/status — 폴링용 상태 조회
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: recap } = await supabase
    .from('recaps')
    .select('id, status, video_url')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!recap) {
    return NextResponse.json({ error: 'recap not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: recap.id,
    status: recap.status,
    video_url: recap.video_url,
  })
}
