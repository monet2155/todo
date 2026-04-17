import { requireUser, getProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import QuestBoard from '@/components/quest/QuestBoard'
import CharacterSheet from '@/components/character-sheet/CharacterSheet'
import { calculateStreak } from '@/lib/stats'
import LogoutButton from './LogoutButton'
import type { NPCType, Stats } from '@/types'

// ── NPC config ───────────────────────────────────────────────────────
const NPC_NAME: Record<NPCType, string> = {
  knight: '기사단장',
  rival:  '라이벌',
  sage:   '현자',
}

const NPC_COLOR: Record<NPCType, string> = {
  knight: '#B8860B',
  rival:  '#9B2D20',
  sage:   '#2E6B5A',
}

function getBannerMessage(
  npcType: NPCType,
  stats: Stats | null,
  streakDays: number,
  questCount: number,
): string {
  if (questCount === 0)
    return '오늘은 임무가 없습니다. 새 퀘스트를 등록하시겠습니까?'
  if (streakDays === 0)
    return '오늘 퀘스트를 완수하지 않으면 연속 달성 기록이 끊깁니다.'
  if (stats) {
    const minStat = Math.min(stats.strength, stats.intelligence, stats.charisma)
    if (minStat < 30)
      return '전하, 스탯이 위태롭습니다. 오늘 반드시 임무를 완수하소서.'
  }
  const messages: Record<NPCType, string> = {
    knight: '오늘도 임무가 기다립니다, 전하. 모험을 시작하소서.',
    rival:  '아직 완수하지 못한 퀘스트가 있다. 뒤처질 셈인가?',
    sage:   '오늘의 임무가 내일의 전설이 됩니다. 서두르지 마소서.',
  }
  return messages[npcType]
}

// ── Nav link ─────────────────────────────────────────────────────────
function NavLink({
  href,
  label,
  sub,
  active,
}: {
  href: string
  label: string
  sub?: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className="relative flex items-baseline gap-2 py-2 px-3 transition-colors group"
      style={{
        color: active ? 'var(--parchment)' : 'var(--ink)',
      }}
    >
      {active && (
        <div
          className="absolute left-0 top-1 bottom-1 w-[1.5px]"
          style={{ background: 'var(--gold)' }}
        />
      )}
      <span
        style={{
          fontFamily: 'var(--body-kr)',
          fontSize: '0.875rem',
        }}
      >
        {label}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: 'var(--display)',
            fontSize: '0.58rem',
            letterSpacing: '0.08em',
            color: active ? 'var(--gold)' : 'var(--ink-dim)',
          }}
        >
          {sub}
        </span>
      )}
    </Link>
  )
}

// ── Main ─────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const user    = await requireUser()
  const profile = await getProfile(user.id)

  if (!profile) redirect('/onboarding')

  const supabase = createServerSupabaseClient()

  const [{ data: stats }, { data: quests }, { data: completions }] = await Promise.all([
    supabase.from('stats').select('*').eq('user_id', user.id).single(),
    supabase
      .from('quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
    supabase
      .from('completions')
      .select('completed_at')
      .eq('user_id', user.id),
  ])

  const totalCompleted   = completions?.length ?? 0
  const completionDates  = (completions ?? []).map((c) => c.completed_at.slice(0, 10))
  const streakDays       = calculateStreak(completionDates)
  const activeQuestCount = quests?.length ?? 0

  const bannerMessage = getBannerMessage(
    profile.npc_type,
    stats ?? null,
    streakDays,
    activeQuestCount,
  )

  const npcColor = NPC_COLOR[profile.npc_type]

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--lacquer)' }}>

      {/* ── LEFT PAGE — Character & Navigation (desktop only) ── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[240px] z-20"
        style={{ background: 'var(--panel)' }}
      >
        {/* Binding line (right edge) */}
        <div
          className="binding-line absolute right-0 top-0 bottom-0"
          style={{ zIndex: 1 }}
        />

        {/* Brand */}
        <div className="px-6 pt-7 pb-5">
          <div className="flex items-baseline gap-2 mb-1">
            <h1
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--parchment)',
                letterSpacing: '-0.01em',
                lineHeight: 1,
              }}
            >
              얼담
            </h1>
            <span
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.58rem',
                letterSpacing: '0.1em',
                color: 'var(--gold)',
                fontWeight: 400,
              }}
            >
              {profile.name}
            </span>
          </div>
          <p
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '0.72rem',
              color: 'var(--ink)',
              lineHeight: 1.5,
            }}
          >
            당신의 얼로 쓰는 이야기
          </p>
        </div>

        {/* Gold divider */}
        <div
          className="mx-6 h-px"
          style={{ background: 'linear-gradient(90deg, var(--gold), transparent)', opacity: 0.4 }}
        />

        {/* Character sheet */}
        <div className="px-5 py-5">
          {stats ? (
            <CharacterSheet
              stats={stats}
              totalCompleted={totalCompleted}
              streakDays={streakDays}
            />
          ) : (
            <div className="h-52 skeleton" />
          )}
        </div>

        {/* Divider */}
        <div
          className="mx-6 h-px"
          style={{ background: 'linear-gradient(90deg, var(--border), transparent)', opacity: 0.5 }}
        />

        {/* Navigation */}
        <nav className="px-3 py-4 flex-1 space-y-0.5">
          <NavLink
            href="/dashboard"
            label="퀘스트 보드"
            active
          />
          <NavLink
            href="/briefing"
            label="브리핑"
            sub={NPC_NAME[profile.npc_type]}
          />
          <NavLink
            href="/recap"
            label="회고"
          />
        </nav>

        {/* Logout */}
        <div className="px-6 pb-6">
          <LogoutButton />
        </div>
      </aside>

      {/* ── RIGHT PAGE — Content ────────────────── */}
      <main
        className="flex-1 lg:ml-[240px]"
        style={{ minHeight: '100vh' }}
      >
        {/* Running header (desktop) */}
        <div
          className="hidden lg:flex items-center justify-between px-8 py-3"
          style={{
            borderBottom: '1px solid var(--border)',
            opacity: 0.7,
          }}
        >
          <span className="running-header">얼담&nbsp;&nbsp;·&nbsp;&nbsp;퀘스트 보드</span>
          <span className="running-header">
            {profile.name}의 모험
          </span>
        </div>

        {/* Mobile header */}
        <header
          className="lg:hidden sticky top-0 z-10 px-4 pt-4 pb-3"
          style={{
            background: 'var(--lacquer)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div className="flex items-center justify-between mb-2.5">
            <h1
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--parchment)',
              }}
            >
              얼담
            </h1>
            <LogoutButton />
          </div>

          {/* Mobile compact stats */}
          {stats && (
            <div className="flex items-center gap-4">
              {[
                { label: 'STR', value: stats.strength,     color: '#9B2D20' },
                { label: 'INT', value: stats.intelligence, color: '#2E6B5A' },
                { label: 'CHA', value: stats.charisma,     color: '#5C3580' },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-1">
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '1rem',
                      fontWeight: 500,
                      color: s.color,
                      lineHeight: 1,
                    }}
                  >
                    {s.value}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: '0.52rem',
                      letterSpacing: '0.1em',
                      color: 'var(--ink-dim)',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
              ))}
              <div className="ml-auto flex items-baseline gap-1">
                <span
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.875rem',
                    color: 'var(--gold)',
                  }}
                >
                  {streakDays}일
                </span>
                <span
                  style={{
                    fontFamily: 'var(--body-kr)',
                    fontSize: '0.58rem',
                    color: 'var(--ink-dim)',
                  }}
                >
                  연속
                </span>
              </div>
            </div>
          )}
        </header>

        {/* Content area */}
        <div className="px-6 sm:px-8 pt-7 pb-24 lg:pb-8 max-w-2xl">

          {/* NPC Banner */}
          <div
            className="mb-7 relative"
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderLeft: `3px solid ${npcColor}60`,
            }}
          >
            <div className="flex items-start justify-between gap-4 px-4 py-3.5">
              <div className="flex-1 min-w-0">
                <p
                  style={{
                    fontFamily: 'var(--display)',
                    fontSize: '0.58rem',
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    color: npcColor,
                    marginBottom: '0.35rem',
                  }}
                >
                  {NPC_NAME[profile.npc_type]}
                </p>
                <p
                  style={{
                    fontFamily: 'var(--body-kr)',
                    fontSize: '0.875rem',
                    color: 'var(--parchment)',
                    lineHeight: 1.6,
                    opacity: 0.85,
                  }}
                >
                  {bannerMessage}
                </p>
              </div>
              <Link
                href="/briefing"
                className="shrink-0 transition-colors"
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '0.65rem',
                  letterSpacing: '0.12em',
                  color: npcColor,
                  borderBottom: `1px solid ${npcColor}50`,
                  paddingBottom: '1px',
                  whiteSpace: 'nowrap',
                }}
              >
                브리핑 →
              </Link>
            </div>
          </div>

          {/* Quest Board */}
          <QuestBoard initialQuests={quests ?? []} />
        </div>
      </main>

      {/* ── Mobile bottom navigation ────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex"
        style={{
          background: 'var(--panel)',
          borderTop: '1px solid var(--border)',
          height: '56px',
        }}
      >
        {[
          { href: '/dashboard', label: '퀘스트', active: true },
          { href: '/briefing',  label: '브리핑',  active: false },
          { href: '/recap',     label: '회고',    active: false },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center relative transition-colors"
            style={{ color: tab.active ? 'var(--parchment)' : 'var(--ink-dim)' }}
          >
            {tab.active && (
              <div
                className="absolute top-0 left-4 right-4 h-[1.5px]"
                style={{ background: 'var(--gold)' }}
              />
            )}
            <span
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '0.72rem',
              }}
            >
              {tab.label}
            </span>
          </Link>
        ))}
      </nav>

    </div>
  )
}
