'use client'

import { useState } from 'react'
import LogoutButton from './LogoutButton'
import type { Stats } from '@/types'

type Props = {
  name: string
  stats: Stats | null
  streakDays: number
  totalCompleted: number
}

const STAT_CONFIG = [
  { key: 'strength'     as const, label: 'STR', color: '#9B2D20' },
  { key: 'intelligence' as const, label: 'INT', color: '#2E6B5A' },
  { key: 'charisma'     as const, label: 'CHA', color: '#5C3580' },
]

export default function MobileHeader({ name, stats, streakDays }: Props) {
  const [expanded, setExpanded] = useState(false)

  return (
    <header
      className="lg:hidden sticky top-0 z-10"
      style={{ background: 'var(--lacquer)', borderBottom: '1px solid var(--border)' }}
    >
      {/* Main header row */}
      <div className="flex items-center justify-between px-4 pt-3.5 pb-3">
        <div className="flex items-baseline gap-2">
          <span
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--parchment)',
            }}
          >
            얼담
          </span>
          <span
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

        <div className="flex items-center gap-3">
          {/* Streak pill */}
          {streakDays > 0 && (
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.72rem',
                color: 'var(--gold)',
                border: '1px solid var(--gold)',
                borderRadius: '0',
                padding: '1px 7px',
                opacity: 0.8,
              }}
            >
              {streakDays}일 연속
            </span>
          )}

          {/* Stats toggle */}
          {stats && (
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              aria-label="스탯 펼치기"
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.58rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: expanded ? 'var(--gold)' : 'var(--ink)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '2px 0',
              }}
            >
              STATUS {expanded ? '▲' : '▼'}
            </button>
          )}

          <LogoutButton />
        </div>
      </div>

      {/* Collapsible stat strip */}
      {expanded && stats && (
        <div
          className="flex items-center gap-5 px-4 pb-3"
          style={{ borderTop: '1px solid var(--border)', paddingTop: '0.625rem' }}
        >
          {STAT_CONFIG.map((s) => (
            <div key={s.key} className="flex items-baseline gap-1.5">
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '1.125rem',
                  fontWeight: 500,
                  color: s.color,
                  lineHeight: 1,
                }}
              >
                {stats[s.key]}
              </span>
              <span
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '0.52rem',
                  letterSpacing: '0.12em',
                  color: 'var(--ink-dim)',
                  textTransform: 'uppercase',
                }}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </header>
  )
}
