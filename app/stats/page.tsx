import { requireUser, getProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { calculateStreak } from '@/lib/stats'
import { getStatPercent } from '@/lib/stats'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import StatBar from '@/components/ui/StatBar'
import CornerOrnament from '@/components/ui/CornerOrnament'

const STAT_CONFIG = [
  { key: 'strength'     as const, label: '체력', labelEn: 'STR', color: '#9B2D20' },
  { key: 'intelligence' as const, label: '지력', labelEn: 'INT', color: '#2E6B5A' },
  { key: 'charisma'     as const, label: '매력', labelEn: 'CHA', color: '#5C3580' },
]

export default async function StatsPage() {
  const user    = await requireUser()
  const profile = await getProfile(user.id)
  if (!profile) redirect('/onboarding')

  const supabase = createServerSupabaseClient()
  const [{ data: stats }, { data: completions }] = await Promise.all([
    supabase.from('stats').select('*').eq('user_id', user.id).single(),
    supabase.from('completions').select('completed_at').eq('user_id', user.id),
  ])

  const totalCompleted  = completions?.length ?? 0
  const completionDates = (completions ?? []).map((c: { completed_at: string }) => c.completed_at.slice(0, 10))
  const streakDays      = calculateStreak(completionDates)

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--lacquer)' }}>

      <AppSidebar activePage="stats" />

      <main className="flex-1 lg:ml-[240px] min-h-screen flex flex-col">
        <div className="flex-1 px-5 sm:px-8 pt-8 pb-24 lg:pb-10 max-w-xl">

          {/* Page header */}
          <div className="mb-8">
            <p
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.58rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                marginBottom: '0.5rem',
              }}
            >
              Character
            </p>
            <h1
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--parchment)',
                lineHeight: 1.2,
                marginBottom: '0.375rem',
              }}
            >
              {profile.name}
            </h1>
            <div
              style={{
                height: 1,
                width: '3rem',
                background: 'linear-gradient(90deg, var(--gold), transparent)',
                opacity: 0.5,
              }}
            />
          </div>

          {/* Stats panel */}
          {stats ? (
            <div
              className="relative p-6 mb-6"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <CornerOrnament
                className="absolute text-[color:var(--gold)]"
                style={{ top: -5, left: -5 } as React.CSSProperties}
                size={10}
              />
              <CornerOrnament
                className="absolute text-[color:var(--gold)]"
                style={{ top: -5, right: -5 } as React.CSSProperties}
                size={10}
              />
              <CornerOrnament
                className="absolute text-[color:var(--gold)]"
                style={{ bottom: -5, left: -5 } as React.CSSProperties}
                size={10}
              />
              <CornerOrnament
                className="absolute text-[color:var(--gold)]"
                style={{ bottom: -5, right: -5 } as React.CSSProperties}
                size={10}
              />

              <p
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '0.58rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  marginBottom: '1.5rem',
                }}
              >
                S&nbsp;&nbsp;T&nbsp;&nbsp;A&nbsp;&nbsp;T&nbsp;&nbsp;U&nbsp;&nbsp;S
              </p>

              <div className="space-y-6">
                {STAT_CONFIG.map(({ key, label, labelEn, color }) => {
                  const value   = stats[key]
                  const percent = getStatPercent(value)
                  return (
                    <div key={key}>
                      <div className="flex items-baseline justify-between mb-2">
                        <span
                          style={{
                            fontFamily: 'var(--display)',
                            fontSize: '0.58rem',
                            letterSpacing: '0.16em',
                            textTransform: 'uppercase',
                            color: 'var(--ink-dim)',
                          }}
                        >
                          {labelEn}&nbsp;&nbsp;{label}
                        </span>
                        <span
                          style={{
                            fontFamily: 'var(--mono)',
                            fontSize: '1.75rem',
                            color,
                            lineHeight: 1,
                            fontWeight: 400,
                            letterSpacing: '-0.02em',
                          }}
                        >
                          {value}
                        </span>
                      </div>
                      <StatBar value={percent} color={color} label={`${label} ${value}`} segments={16} />
                    </div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="h-48 skeleton mb-6" />
          )}

          {/* Records panel */}
          <div
            className="grid grid-cols-2 gap-4"
          >
            <div
              className="p-5"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <p
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '2.25rem',
                  color: 'var(--gold)',
                  lineHeight: 1,
                  fontWeight: 400,
                }}
              >
                {totalCompleted}
              </p>
              <p
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '0.56rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-dim)',
                  marginTop: '0.5rem',
                }}
              >
                Quests Done
              </p>
              <p
                style={{
                  fontFamily: 'var(--body-kr)',
                  fontSize: '0.68rem',
                  color: 'var(--ink)',
                  marginTop: '0.2rem',
                }}
              >
                완수한 퀘스트
              </p>
            </div>

            <div
              className="p-5"
              style={{ background: 'var(--panel)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-baseline gap-1">
                <p
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '2.25rem',
                    color: 'var(--gold)',
                    lineHeight: 1,
                    fontWeight: 400,
                  }}
                >
                  {streakDays}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--body-kr)',
                    fontSize: '0.75rem',
                    color: 'var(--ink)',
                  }}
                >
                  일
                </span>
              </div>
              <p
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '0.56rem',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  color: 'var(--ink-dim)',
                  marginTop: '0.5rem',
                }}
              >
                Streak
              </p>
              <p
                style={{
                  fontFamily: 'var(--body-kr)',
                  fontSize: '0.68rem',
                  color: 'var(--ink)',
                  marginTop: '0.2rem',
                }}
              >
                연속 달성
              </p>
            </div>
          </div>

        </div>
      </main>

      <MobileNav activePage="stats" />
    </div>
  )
}
