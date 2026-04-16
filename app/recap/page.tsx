import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireUser, getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RecapTrigger from './RecapTrigger'
import type { Recap } from '@/types'

export default async function RecapPage() {
  const user = await requireUser()
  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = createServerSupabaseClient()
  const { data: recaps } = await supabase
    .from('recaps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

  const thisWeekRecap = (recaps ?? []).find(
    (r) => r.week_number === weekNumber && r.year === year,
  ) as Recap | undefined

  return (
    <div className="min-h-screen p-6 sm:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-yellow-400">시네마틱 회고</h1>
        <p className="text-gray-400 text-sm mt-1">당신의 한 주가 전설이 됩니다</p>
      </div>

      {/* 이번 주 회고 생성 */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-100 mb-2">
          {year}년 {weekNumber}주차 전설
        </h2>

        {!thisWeekRecap ? (
          <RecapTrigger weekNumber={weekNumber} year={year} />
        ) : (
          <div className="space-y-3">
            {thisWeekRecap.status === 'pending' && (
              <p className="text-gray-400">전설이 아직 시작되지 않았습니다.</p>
            )}
            {thisWeekRecap.status === 'generating' && (
              <p className="text-yellow-400 animate-pulse">전설을 기록하는 중...</p>
            )}
            {thisWeekRecap.status === 'done' && thisWeekRecap.video_url && (
              <div className="space-y-3">
                <p className="text-green-400 font-semibold">전설 완성!</p>
                <Link
                  href={`/recap/${thisWeekRecap.id}`}
                  className="inline-block px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300"
                >
                  전설 보러 가기 →
                </Link>
              </div>
            )}
            {thisWeekRecap.status === 'failed' && (
              <div className="space-y-2">
                <p className="text-red-400">전설 기록에 실패했습니다.</p>
                <RecapTrigger weekNumber={weekNumber} year={year} existingRecapId={thisWeekRecap.id} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 이전 회고 히스토리 */}
      {recaps && recaps.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
            지난 전설들
          </h2>
          <div className="space-y-3">
            {(recaps as Recap[])
              .filter((r) => r.status === 'done')
              .map((recap) => (
                <Link
                  key={recap.id}
                  href={`/recap/${recap.id}`}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-colors"
                >
                  <div>
                    <span className="text-gray-100 font-medium">
                      {recap.year}년 {recap.week_number}주차
                    </span>
                    <span className="ml-2 text-xs text-green-400">완성</span>
                  </div>
                  <span className="text-gray-500 text-sm">보기 →</span>
                </Link>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}
