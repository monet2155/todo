import { requireUser, getProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { calculateStreak } from '@/lib/stats'
import { getNPCConfig } from '@/lib/npc-config'
import Link from 'next/link'
import QuestBoard from '@/components/quest/QuestBoard'
import AppSidebar from '@/components/layout/AppSidebar'
import MobileNav from '@/components/layout/MobileNav'
import MobileHeader from './MobileHeader'
import type { NPCType, Stats } from '@/types'

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
  const npcCfg           = getNPCConfig(profile.npc_type)

  const bannerMessage = getBannerMessage(
    profile.npc_type,
    stats ?? null,
    streakDays,
    activeQuestCount,
  )

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--lacquer)' }}>

      {/* Shared sidebar — nav first, then stats */}
      <AppSidebar activePage="dashboard" />

      {/* Main */}
      <main className="flex-1 lg:ml-[240px] min-h-screen flex flex-col">

        {/* Mobile header */}
        <MobileHeader
          name={profile.name}
          stats={stats ?? null}
          streakDays={streakDays}
          totalCompleted={totalCompleted}
        />

        {/* Content */}
        <div className="flex-1 px-5 sm:px-8 pt-6 pb-24 lg:pb-10">

          {/* NPC Banner — compact single-line strip */}
          <div
            className="flex items-center gap-3 mb-6 px-4 py-3"
            style={{
              background: 'var(--panel)',
              borderLeft: `3px solid ${npcCfg.color}50`,
              border: '1px solid var(--border)',
              borderLeftWidth: '3px',
              borderLeftColor: `${npcCfg.color}50`,
            }}
          >
            <p
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.6rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: npcCfg.color,
                flexShrink: 0,
              }}
            >
              {npcCfg.label}
            </p>
            <div
              style={{
                width: 1,
                height: '0.875rem',
                background: 'var(--border)',
                flexShrink: 0,
              }}
            />
            <p
              className="flex-1 truncate"
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '0.8125rem',
                color: 'var(--parchment)',
                opacity: 0.8,
              }}
            >
              {bannerMessage}
            </p>
            <Link
              href="/briefing"
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.62rem',
                letterSpacing: '0.1em',
                color: npcCfg.color,
                flexShrink: 0,
                borderBottom: `1px solid ${npcCfg.color}40`,
                paddingBottom: '1px',
              }}
            >
              브리핑 →
            </Link>
          </div>

          {/* Quest Board */}
          <QuestBoard initialQuests={quests ?? []} />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <MobileNav activePage="dashboard" npcLabel={npcCfg.label} />
    </div>
  )
}
