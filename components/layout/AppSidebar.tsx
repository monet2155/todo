import { requireUser, getProfile } from '@/lib/auth'
import { getNPCConfig } from '@/lib/npc-config'
import Link from 'next/link'
import LogoutButton from '@/app/dashboard/LogoutButton'

type ActivePage = 'dashboard' | 'briefing' | 'recap' | 'stats'

type Props = {
  activePage: ActivePage
}

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
      className="relative flex items-baseline gap-2 py-2 px-3 transition-colors"
      style={{ color: active ? 'var(--parchment)' : 'var(--ink)' }}
    >
      {active && (
        <div
          className="absolute left-0 top-1 bottom-1 w-[1.5px]"
          style={{ background: 'var(--gold)' }}
        />
      )}
      <span style={{ fontFamily: 'var(--body-kr)', fontSize: '0.875rem' }}>
        {label}
      </span>
      {sub && (
        <span
          style={{
            fontFamily: 'var(--display)',
            fontSize: '0.57rem',
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

export default async function AppSidebar({ activePage }: Props) {
  const user    = await requireUser()
  const profile = await getProfile(user.id)

  if (!profile) return null

  const npcCfg = getNPCConfig(profile.npc_type)

  return (
    <aside
      className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-[240px] z-20"
      style={{ background: 'var(--panel)' }}
    >
      {/* Binding line */}
      <div
        className="binding-line absolute right-0 top-0 bottom-0"
        style={{ zIndex: 1 }}
      />

      {/* Brand */}
      <div className="px-6 pt-7 pb-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '1.375rem',
              fontWeight: 700,
              color: 'var(--parchment)',
              letterSpacing: '-0.01em',
              lineHeight: 1,
            }}
          >
            얼담
          </span>
          <span
            style={{
              fontFamily: 'var(--display)',
              fontSize: '0.57rem',
              letterSpacing: '0.1em',
              color: 'var(--gold)',
            }}
          >
            {profile.name}
          </span>
        </div>
        <p
          style={{
            fontFamily: 'var(--body-kr)',
            fontSize: '0.68rem',
            color: 'var(--ink-dim)',
            lineHeight: 1.5,
          }}
        >
          당신의 얼로 쓰는 이야기
        </p>
      </div>

      {/* Gold divider */}
      <div
        className="mx-6 h-px"
        style={{ background: 'linear-gradient(90deg, var(--gold), transparent)', opacity: 0.35 }}
      />

      {/* Navigation */}
      <nav className="px-3 py-4 space-y-0.5 flex-1">
        <NavLink href="/dashboard" label="퀘스트 보드" active={activePage === 'dashboard'} />
        <NavLink href="/briefing"  label="브리핑" sub={npcCfg.label} active={activePage === 'briefing'} />
        <NavLink href="/recap"     label="회고"  active={activePage === 'recap'} />
        <NavLink href="/stats"     label="스탯"  active={activePage === 'stats'} />
      </nav>

      {/* Logout */}
      <div
        className="px-6 pb-5 pt-3"
        style={{ borderTop: '1px solid var(--border)', opacity: 0.7 }}
      >
        <LogoutButton />
      </div>
    </aside>
  )
}
