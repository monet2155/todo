import { createServerSupabaseClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import type { Recap, RecapScript } from '@/types'
import VideoPlayer from '@/components/video-player/VideoPlayer'
import ShareButtons from './ShareButtons'

type Props = { params: { id: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('recaps')
    .select('script, video_url')
    .eq('id', params.id)
    .single()

  const script = data?.script as RecapScript | null
  const title = script?.title ?? 'Chronicles of 나'

  return {
    title,
    description: '나의 한 주가 전설이 되었다.',
    openGraph: {
      title,
      description: '나의 한 주가 전설이 되었다.',
      type: 'video.other',
      ...(data?.video_url ? { videos: [data.video_url] } : {}),
    },
    twitter: {
      card: 'player',
      title,
      description: '나의 한 주가 전설이 되었다.',
    },
  }
}

export default async function RecapDetailPage({ params }: Props) {
  const supabase = createServerSupabaseClient()

  // 공개 페이지 — RLS 없이 읽기 (미들웨어로 보호 안 함)
  const { data: recap } = await supabase
    .from('recaps')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!recap) notFound()

  const typedRecap = recap as Recap
  const script = typedRecap.script as RecapScript | null
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="min-h-screen bg-gray-950 p-6 sm:p-8 max-w-2xl mx-auto">
      {/* 제목 */}
      <div className="mb-6 text-center">
        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Chronicles of</p>
        <h1 className="text-xl font-bold text-yellow-400">
          {script?.title ?? `${typedRecap.year}년 ${typedRecap.week_number}주차`}
        </h1>
      </div>

      {/* 영상 플레이어 */}
      {typedRecap.status === 'done' && typedRecap.video_url ? (
        <div className="mb-6">
          <VideoPlayer url={typedRecap.video_url} title={script?.title ?? '회고 영상'} />
        </div>
      ) : typedRecap.status === 'generating' ? (
        <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center mb-6">
          <p className="text-yellow-400 animate-pulse">전설을 기록하는 중...</p>
        </div>
      ) : typedRecap.status === 'failed' ? (
        <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center mb-6">
          <p className="text-red-400">전설 기록에 실패했습니다.</p>
        </div>
      ) : (
        <div className="aspect-video bg-gray-900 rounded-xl flex items-center justify-center mb-6">
          <p className="text-gray-500">아직 전설이 시작되지 않았습니다.</p>
        </div>
      )}

      {/* 장면 목록 */}
      {script?.scenes && script.scenes.length > 0 && (
        <div className="mb-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">전설의 장면들</h2>
          {script.scenes.map((scene, i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-4 border border-gray-800">
              <p className="text-gray-200 leading-relaxed">{scene.narration}</p>
              <p className="text-xs text-gray-600 mt-2">{scene.duration}초</p>
            </div>
          ))}
        </div>
      )}

      {/* 공유 버튼 */}
      {typedRecap.status === 'done' && (
        <ShareButtons
          title={script?.title ?? '나의 전설'}
          shareUrl={`${baseUrl}/recap/${typedRecap.id}`}
        />
      )}
    </div>
  )
}
