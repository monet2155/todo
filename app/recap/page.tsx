import { createServerSupabaseClient } from '@/lib/supabase-server'
import { requireUser, getProfile } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RecapTrigger from './RecapTrigger'
import type { Recap } from '@/types'

function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export default async function RecapPage() {
  const user    = await requireUser()
  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = createServerSupabaseClient()
  const { data: recaps } = await supabase
    .from('recaps')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const now        = new Date()
  const weekNumber = getWeekNumber(now)
  const year       = now.getFullYear()

  const thisWeekRecap = (recaps ?? []).find(
    (r) => r.week_number === weekNumber && r.year === year,
  ) as Recap | undefined

  const pastRecaps = (recaps ?? [] as Recap[]).filter(
    (r) => r.status === 'done' && !(r.week_number === weekNumber && r.year === year),
  ) as Recap[]

  return (
    <div
      className="min-h-screen"
      style={{ background: 'var(--lacquer)' }}
    >
      {/* Running header */}
      <div
        className="px-8 py-3"
        style={{ borderBottom: '1px solid var(--border)', opacity: 0.7 }}
      >
        <span className="running-header">얼담&nbsp;&nbsp;·&nbsp;&nbsp;회고</span>
      </div>

      <div className="px-6 sm:px-8 pt-8 pb-16 max-w-2xl mx-auto">

        {/* Page title */}
        <div className="mb-8">
          <h1
            style={{
              fontFamily: 'var(--display)',
              fontSize: '2rem',
              fontWeight: 300,
              color: 'var(--parchment)',
              letterSpacing: '0.02em',
              marginBottom: '0.25rem',
            }}
          >
            시네마틱 회고
          </h1>
          <div
            style={{
              height: 1,
              width: '3rem',
              background: 'linear-gradient(90deg, var(--gold), transparent)',
              opacity: 0.5,
            }}
          />
          <p
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '0.82rem',
              color: 'var(--ink)',
              marginTop: '0.5rem',
            }}
          >
            당신의 한 주가 하나의 전설이 됩니다
          </p>
        </div>

        {/* This week */}
        <div
          className="mb-8 p-6 relative"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--display)',
              fontSize: '0.58rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              marginBottom: '0.6rem',
            }}
          >
            이번 주 기록
          </p>
          <h2
            style={{
              fontFamily: 'var(--body-kr)',
              fontWeight: 600,
              fontSize: '1.125rem',
              color: 'var(--parchment)',
              marginBottom: '1.25rem',
            }}
          >
            {year}년 {weekNumber}주차
          </h2>

          {!thisWeekRecap ? (
            <RecapTrigger weekNumber={weekNumber} year={year} />
          ) : (
            <div className="space-y-3">
              {thisWeekRecap.status === 'pending' && (
                <p
                  style={{
                    fontFamily: 'var(--body-kr)',
                    fontSize: '0.875rem',
                    color: 'var(--ink)',
                  }}
                >
                  전설이 아직 시작되지 않았습니다.
                </p>
              )}
              {thisWeekRecap.status === 'generating' && (
                <div className="flex items-center gap-3">
                  {/* Obangsaek spinner */}
                  <div
                    style={{
                      width: 24, height: 24,
                      borderRadius: '50%',
                      background: 'conic-gradient(#B8860B 0%, #9B2D20 25%, #2E6B5A 50%, #5C3580 75%, #B8860B 100%)',
                      animation: 'spin 1.2s linear infinite',
                    }}
                  />
                  <p
                    style={{
                      fontFamily: 'var(--body-kr)',
                      fontSize: '0.875rem',
                      color: 'var(--gold)',
                    }}
                  >
                    전설을 기록하는 중...
                  </p>
                </div>
              )}
              {thisWeekRecap.status === 'done' && thisWeekRecap.video_url && (
                <div className="space-y-3">
                  <p
                    style={{
                      fontFamily: 'var(--body-kr)',
                      fontSize: '0.875rem',
                      color: '#2E6B5A',
                      fontWeight: 600,
                    }}
                  >
                    전설 완성!
                  </p>
                  <Link
                    href={`/recap/${thisWeekRecap.id}`}
                    className="btn-primary inline-block"
                    style={{ padding: '8px 24px' }}
                  >
                    전설 보러 가기 →
                  </Link>
                </div>
              )}
              {thisWeekRecap.status === 'failed' && (
                <div className="space-y-2">
                  <p
                    style={{
                      fontFamily: 'var(--body-kr)',
                      fontSize: '0.875rem',
                      color: '#9B2D20',
                    }}
                  >
                    전설 기록에 실패했습니다.
                  </p>
                  <RecapTrigger
                    weekNumber={weekNumber}
                    year={year}
                    existingRecapId={thisWeekRecap.id}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Past recaps */}
        {pastRecaps.length > 0 && (
          <div>
            <p
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                marginBottom: '1rem',
              }}
            >
              지난 전설들
            </p>
            <div className="space-y-2">
              {pastRecaps.map((recap) => (
                <Link
                  key={recap.id}
                  href={`/recap/${recap.id}`}
                  className="flex items-center justify-between px-4 py-3.5 transition-all"
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'color-mix(in srgb, var(--gold) 40%, transparent)'
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontFamily: 'var(--body-kr)',
                        fontSize: '0.875rem',
                        color: 'var(--parchment)',
                      }}
                    >
                      {recap.year}년 {recap.week_number}주차
                    </span>
                    <span
                      style={{
                        fontFamily: 'var(--display)',
                        fontSize: '0.58rem',
                        letterSpacing: '0.1em',
                        color: '#2E6B5A',
                        marginLeft: '0.75rem',
                        textTransform: 'uppercase',
                      }}
                    >
                      완성
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: '0.68rem',
                      letterSpacing: '0.08em',
                      color: 'var(--ink)',
                    }}
                  >
                    보기 →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Back to dashboard */}
        <div className="mt-8">
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--display)',
              fontSize: '0.65rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--ink)',
              borderBottom: '1px solid var(--border)',
              paddingBottom: '1px',
            }}
          >
            ← 퀘스트 보드로 돌아가기
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
