import { requireUser, getProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import QuestBoard from '@/components/quest/QuestBoard'
import CharacterSheet from '@/components/character-sheet/CharacterSheet'
import { calculateStreak } from '@/lib/stats'
import LogoutButton from './LogoutButton'
import type { NPCType, Stats } from '@/types'

// ── NPC Banner message (template-based, no AI) ──────────────────────
const NPC_ICON: Record<NPCType, string> = {
  knight: '⚔',
  rival:  '🗡',
  sage:   '📜',
}

const NPC_NAME: Record<NPCType, string> = {
  knight: '기사단장',
  rival:  '라이벌',
  sage:   '현자',
}

const NPC_GLOW: Record<NPCType, string> = {
  knight: '#D4A017',
  rival:  '#C0392B',
  sage:   '#1A5F7A',
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

// ── Nav item ────────────────────────────────────────────────────────
function NavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string
  icon: string
  label: string
  active?: boolean
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-3 py-2.5 rounded-sm transition-colors group relative"
      style={{
        color: active ? '#D4A017' : '#6A6560',
        background: active ? '#D4A01710' : 'transparent',
      }}
    >
      {/* Active indicator */}
      {active && (
        <div
          className="absolute left-0 top-1 bottom-1 w-[2px] rounded-full"
          style={{ background: '#D4A017', boxShadow: '0 0 6px #D4A01780' }}
        />
      )}
      <span className="text-base leading-none">{icon}</span>
      <span className="font-cinzel text-[0.78rem] tracking-wider font-bold">{label}</span>
    </Link>
  )
}

// ── Main page ────────────────────────────────────────────────────────
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

  const npcGlow = NPC_GLOW[profile.npc_type]

  return (
    <div className="min-h-screen flex">

      {/* ── Sidebar (desktop only) ──────────────── */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-60 z-20"
        style={{
          background: '#141210',
          borderRight: '1px solid #1A2E27',
        }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <p
            className="font-cinzel font-bold leading-tight"
            style={{ color: '#D4A017', fontSize: '0.9rem', letterSpacing: '0.08em' }}
          >
            ◈ Chronicles
          </p>
          <p
            className="font-hahmlet font-bold"
            style={{ color: '#F0EAD6', fontSize: '1.1rem' }}
          >
            of [{profile.name}]
          </p>
        </div>

        {/* Gold divider */}
        <div className="mx-5 h-px" style={{ background: 'linear-gradient(90deg, #D4A01740, transparent)' }} />

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <NavItem href="/dashboard"  icon="⚔" label="QUEST BOARD" active />
          <NavItem href="/briefing"   icon={NPC_ICON[profile.npc_type]} label="BRIEFING" />
          <NavItem href="/recap"      icon="🎬" label="RECAP" />
        </nav>

        {/* Divider */}
        <div className="mx-5 h-px" style={{ background: 'linear-gradient(90deg, #2A4A3E, transparent)' }} />

        {/* Character sheet */}
        <div className="p-4 pb-5">
          {stats ? (
            <CharacterSheet
              stats={stats}
              totalCompleted={totalCompleted}
              streakDays={streakDays}
            />
          ) : (
            <div className="h-48 skeleton rounded" />
          )}
        </div>

        {/* Logout */}
        <div className="px-5 pb-5">
          <LogoutButton />
        </div>
      </aside>

      {/* ── Main content ────────────────────────── */}
      <main className="flex-1 lg:ml-60 pb-20 lg:pb-0">

        {/* Mobile header */}
        <header
          className="lg:hidden sticky top-0 z-10 px-4 pt-4 pb-3"
          style={{ background: '#0F0E0C', borderBottom: '1px solid #1A2E27' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <p
                className="font-cinzel font-bold"
                style={{ color: '#D4A017', fontSize: '0.85rem', letterSpacing: '0.08em' }}
              >
                ◈ Chronicles of [{profile.name}]
              </p>
            </div>
            <LogoutButton />
          </div>

          {/* Mobile compact stat bar */}
          {stats && (
            <div className="flex items-center gap-4">
              {[
                { label: 'STR', value: stats.strength,     color: '#C0392B' },
                { label: 'INT', value: stats.intelligence, color: '#1A5F7A' },
                { label: 'CHA', value: stats.charisma,     color: '#6B3FA0' },
              ].map((s) => (
                <div key={s.label} className="flex items-baseline gap-1">
                  <span className="font-cinzel-deco font-bold" style={{ color: s.color, fontSize: '1.1rem' }}>
                    {s.value}
                  </span>
                  <span className="font-inter text-[0.55rem] tracking-wider" style={{ color: '#4A4540' }}>
                    {s.label}
                  </span>
                </div>
              ))}
              <div className="ml-auto flex items-baseline gap-1">
                <span className="font-cinzel-deco font-bold" style={{ color: '#D4A017', fontSize: '1.1rem' }}>
                  {streakDays}
                </span>
                <span className="font-inter text-[0.55rem] tracking-wider" style={{ color: '#4A4540' }}>
                  DAYS
                </span>
              </div>
            </div>
          )}
        </header>

        <div className="px-4 sm:px-6 pt-6 max-w-3xl">

          {/* NPC Banner */}
          <div
            className="mb-6 relative overflow-hidden"
            style={{
              background: '#1C1A18',
              borderTop:    `1px solid ${npcGlow}30`,
              borderLeft:   `1px solid ${npcGlow}20`,
              borderRight:  '1px solid #1A2E27',
              borderBottom: '1px solid #151F1B',
              borderRadius: '4px',
              boxShadow: `0 0 20px ${npcGlow}10`,
            }}
          >
            <div className="dancheong-stripe" />
            <div className="flex items-center justify-between px-4 py-3 pl-5">
              <div className="flex items-center gap-2.5">
                <span className="text-base">{NPC_ICON[profile.npc_type]}</span>
                <div>
                  <p
                    className="font-inter text-[0.65rem] tracking-wider uppercase mb-0.5"
                    style={{ color: npcGlow + '90' }}
                  >
                    {NPC_NAME[profile.npc_type]}
                  </p>
                  <p
                    className="font-hahmlet text-[0.875rem]"
                    style={{ color: '#C8C0B0' }}
                  >
                    {bannerMessage}
                  </p>
                </div>
              </div>
              <Link
                href="/briefing"
                className="shrink-0 font-cinzel text-[0.7rem] tracking-wider font-bold transition-colors ml-4"
                style={{ color: npcGlow, borderBottom: `1px solid ${npcGlow}50` }}
              >
                브리핑 →
              </Link>
            </div>
          </div>

          {/* Quest Board */}
          <QuestBoard initialQuests={quests ?? []} />
        </div>
      </main>

      {/* ── Mobile bottom tab bar ──────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex"
        style={{
          background: '#141210',
          borderTop: '1px solid #2A4A3E',
          height: '60px',
        }}
      >
        {[
          { href: '/dashboard', icon: '⚔', label: '퀘스트', active: true },
          { href: '/briefing',  icon: NPC_ICON[profile.npc_type], label: '브리핑', active: false },
          { href: '/recap',     icon: '🎬', label: '리캡',   active: false },
        ].map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors"
            style={{ color: tab.active ? '#D4A017' : '#5A5550' }}
          >
            {tab.active && (
              <div
                className="absolute top-0 left-4 right-4 h-[2px]"
                style={{ background: '#D4A017', boxShadow: '0 0 8px #D4A01780' }}
              />
            )}
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="font-cinzel text-[0.58rem] tracking-wider font-bold">{tab.label}</span>
          </Link>
        ))}
      </nav>

    </div>
  )
}
