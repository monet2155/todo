import Link from 'next/link'

type ActivePage = 'dashboard' | 'briefing' | 'recap'

type Props = {
  activePage: ActivePage
  npcLabel?: string
}

const NAV_ITEMS = [
  { page: 'dashboard' as const, href: '/dashboard', label: '퀘스트' },
  { page: 'briefing'  as const, href: '/briefing',  label: '브리핑' },
  { page: 'recap'     as const, href: '/recap',     label: '회고'   },
]

export default function MobileNav({ activePage, npcLabel }: Props) {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-20 flex"
      style={{
        background: 'var(--panel)',
        borderTop: '1px solid var(--border)',
        height: '60px',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = item.page === activePage
        const label  = item.page === 'briefing' && npcLabel ? npcLabel : item.label
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex-1 flex flex-col items-center justify-center relative"
            style={{ color: active ? 'var(--parchment)' : 'var(--ink-dim)' }}
          >
            {active && (
              <div
                className="absolute top-0 left-6 right-6 h-[1.5px]"
                style={{ background: 'var(--gold)' }}
              />
            )}
            <span
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '0.72rem',
                lineHeight: 1,
              }}
            >
              {label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
