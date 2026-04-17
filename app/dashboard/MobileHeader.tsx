'use client'

import LogoutButton from './LogoutButton'

type Props = {
  name: string
  streakDays: number
  totalCompleted: number
  stats: unknown
}

export default function MobileHeader({ name, streakDays }: Props) {
  return (
    <header
      className="lg:hidden sticky top-0 z-10"
      style={{ background: 'var(--lacquer)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--parchment)',
              flexShrink: 0,
            }}
          >
            얼담
          </span>
          <span
            className="truncate"
            style={{
              fontFamily: 'var(--display)',
              fontSize: '0.56rem',
              letterSpacing: '0.1em',
              color: 'var(--gold)',
            }}
          >
            {name}
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {streakDays > 0 && (
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.72rem',
                color: 'var(--gold)',
                border: '1px solid var(--gold)',
                padding: '1px 7px',
                opacity: 0.8,
                whiteSpace: 'nowrap',
              }}
            >
              {streakDays}일 연속
            </span>
          )}
          <LogoutButton />
        </div>
      </div>
    </header>
  )
}
