import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import type { RecapScript } from '@/types'

// Vercel Background Functions — Pro 플랜 최대 800초
export const maxDuration = 800

// POST /api/recap/generate
// 즉시 { status: 'generating' } 반환 후 백그라운드 처리
export async function POST(request: Request) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const { recap_id } = (body ?? {}) as { recap_id?: unknown }

  if (!recap_id || typeof recap_id !== 'string') {
    return NextResponse.json({ error: 'recap_id is required' }, { status: 400 })
  }

  // 소유권 확인
  const { data: recap } = await supabase
    .from('recaps')
    .select('id, user_id, script, status')
    .eq('id', recap_id)
    .eq('user_id', user.id)
    .single()

  if (!recap) {
    return NextResponse.json({ error: 'recap not found' }, { status: 404 })
  }

  // 즉시 generating 상태로 업데이트
  await supabase.from('recaps').update({ status: 'generating' }).eq('id', recap_id)

  // 백그라운드 처리 (Vercel Background Functions / Edge Runtime에서 실행)
  // 동기적으로 즉시 응답 반환 후 pipeline이 별도 실행됨
  runPipelineInBackground(recap_id, recap.script as RecapScript | null)

  return NextResponse.json({ status: 'generating', recap_id }, { status: 202 })
}

// 영상 생성 파이프라인 — 202 반환 후 백그라운드 실행
// maxDuration = 900 으로 Vercel Pro Background Functions 활성화됨
async function runPipelineInBackground(recapId: string, script: RecapScript | null) {

  const supabase = createServerSupabaseClient()

  try {
    if (!script?.scenes?.length) {
      throw new Error('script is empty — run /api/recap/script first')
    }

    // 실제 파이프라인: Runway → ElevenLabs → Shotstack → Storage
    // (API 키가 없으면 실패 → status: 'failed' 기록)
    const { createRunwayClient } = await import('@/lib/runway')
    const { createElevenLabsClient } = await import('@/lib/elevenlabs')
    const { createShotstackClient } = await import('@/lib/shotstack')
    const { createClient } = await import('@supabase/supabase-js')

    const runway = createRunwayClient()
    const el = createElevenLabsClient()
    const shotstack = createShotstackClient()

    // 1. 각 scene마다 Runway 클립 생성
    const clipUrls: string[] = []
    for (const scene of script.scenes) {
      const taskId = await runway.generateClip({
        promptText: scene.visual_prompt,
        durationSeconds: (scene.duration <= 5 ? scene.duration : 5) as 3 | 5,
      })
      const url = await runway.pollTask(taskId)
      clipUrls.push(url)
    }

    // 2. ElevenLabs 전체 나레이션 생성
    const fullNarration = script.scenes.map((s) => s.narration).join(' ')
    const audioBuffer = await el.synthesize({ text: fullNarration })

    // 3. Supabase Storage에 오디오 업로드
    const storageClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )
    const audioPath = `recaps/${recapId}/narration.mp3`
    await storageClient.storage.from('recap-assets').upload(audioPath, Buffer.from(audioBuffer), {
      contentType: 'audio/mpeg',
      upsert: true,
    })
    const { data: audioData } = storageClient.storage.from('recap-assets').getPublicUrl(audioPath)

    // 4. Shotstack 조립
    const clips = clipUrls.map((url, i) => ({
      videoUrl: url,
      durationSeconds: script.scenes[i].duration,
    }))
    const renderId = await shotstack.render({ clips, audioUrl: audioData.publicUrl })
    const videoUrl = await shotstack.pollRender(renderId)

    // 5. 완료 저장
    await supabase.from('recaps').update({ status: 'done', video_url: videoUrl }).eq('id', recapId)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'pipeline error'
    await supabase
      .from('recaps')
      .update({ status: 'failed', video_url: message })
      .eq('id', recapId)
  }
}
