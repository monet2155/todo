'use client'

import { useState } from 'react'
import type { Quest } from '@/types'
import { STAT_LABELS, isOverdue } from '@/lib/quest-utils'

type Props = {
  quest: Quest
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

const GRADE_SEAL = {
  main: (color: string) => (
    <svg width="20" height="22" viewBox="0 0 20 22" fill="none" aria-hidden>
      <polygon points="10,1 19,5.5 19,16.5 10,21 1,16.5 1,5.5"
        stroke={color} strokeWidth="1" />
      <line x1="10" y1="1"  x2="10" y2="21"   stroke={color} strokeWidth="0.5" opacity="0.35" />
      <line x1="1"  y1="5.5" x2="19" y2="16.5" stroke={color} strokeWidth="0.5" opacity="0.35" />
      <line x1="1"  y1="16.5" x2="19" y2="5.5" stroke={color} strokeWidth="0.5" opacity="0.35" />
    </svg>
  ),
  weekly: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <polygon points="10,1 19,7.5 15.5,18 4.5,18 1,7.5"
        stroke={color} strokeWidth="1" />
      <circle cx="10" cy="10" r="3" stroke={color} strokeWidth="0.5" opacity="0.45" />
    </svg>
  ),
  daily: (color: string) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
      <circle cx="9" cy="9" r="7.5" stroke={color} strokeWidth="1" />
      <circle cx="9" cy="9" r="3"   stroke={color} strokeWidth="0.5" opacity="0.45" />
    </svg>
  ),
}

const GRADE_COLOR: Record<string, string> = {
  main:   '#9B2D20',
  weekly: '#5C3580',
  daily:  '#2E6B5A',
}

const STAT_COLORS: Record<string, string> = {
  strength:     '#9B2D20',
  intelligence: '#2E6B5A',
  charisma:     '#5C3580',
}

function getDaysUntil(due: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(due)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

function formatDueLabel(overdue: boolean, daysLeft: number): string {
  if (overdue)        return '기한 초과'
  if (daysLeft === 0) return '오늘 마감'
  if (daysLeft === 1) return '내일 마감'
  return `D-${daysLeft}`
}

export default function QuestCard({ quest, onComplete, onDelete, disabled }: Props) {
  const [completing, setCompleting] = useState(false)
  const [showSeal,   setShowSeal]   = useState(false)

  const overdue  = isOverdue(quest.due_date)
  const daysLeft = quest.due_date ? getDaysUntil(quest.due_date) : null
  const isUrgent = daysLeft !== null && daysLeft === 0 && !overdue
  const isNear   = daysLeft !== null && daysLeft <= 2 && daysLeft > 0

  const gradeColor  = GRADE_COLOR[quest.grade] ?? GRADE_COLOR.daily
  const accentColor = overdue ? '#9B2D20' : isUrgent ? '#C0682B' : gradeColor

  const SealSvg = GRADE_SEAL[quest.grade as keyof typeof GRADE_SEAL] ?? GRADE_SEAL.daily

  async function handleComplete() {
    setCompleting(true)
    setShowSeal(true)
    setTimeout(() => setShowSeal(false), 800)
    setTimeout(() => onComplete(quest.id), 600)
  }

  return (
    <div
      className="relative overflow-hidden group"
      style={{
        background: 'var(--card)',
        border: `1px solid ${accentColor}25`,
        borderLeft: `2px solid ${accentColor}55`,
        transition: 'background 150ms',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--card-hi)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--card)' }}
    >
      {/* Completion seal */}
      {showSeal && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="animate-ink-stamp flex items-center justify-center"
            style={{
              width: 52, height: 52,
              borderRadius: '50%',
              background: '#9B2D20',
              border: '1.5px solid #C0392B',
              color: '#E8DBBE',
              fontFamily: 'var(--body-kr)',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            완
          </div>
        </div>
      )}

      <div className="flex">
        {/* Seal column */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 44,
            paddingTop: 14,
            paddingBottom: 14,
            borderRight: `1px solid ${accentColor}15`,
          }}
        >
          {SealSvg(accentColor)}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 px-3.5 py-3">

          {/* Row 1: Title + Complete button — both visible at first glance */}
          <div className="flex items-start gap-2">
            <p
              className="flex-1 min-w-0"
              style={{
                fontFamily: 'var(--body-kr)',
                fontWeight: 600,
                fontSize: '0.9rem',
                lineHeight: 1.45,
                color: overdue
                  ? '#C05040'
                  : isUrgent
                    ? '#D07840'
                    : 'var(--parchment)',
              }}
            >
              {quest.title}
            </p>

            <button
              onClick={handleComplete}
              disabled={disabled || completing}
              className="shrink-0 transition-all"
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                color: completing ? 'var(--ink-dim)' : accentColor,
                border: `1px solid ${completing ? 'var(--border)' : accentColor + '55'}`,
                background: 'transparent',
                padding: '3px 12px',
                cursor: completing ? 'default' : 'pointer',
                whiteSpace: 'nowrap',
                marginTop: '1px',
              }}
              onMouseEnter={(e) => {
                if (completing || disabled) return
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = accentColor
                el.style.color = 'var(--lacquer)'
                el.style.borderColor = accentColor
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.background = 'transparent'
                el.style.color = completing ? 'var(--ink-dim)' : accentColor
                el.style.borderColor = completing ? 'var(--border)' : accentColor + '55'
              }}
            >
              {completing ? '・・・' : '완료'}
            </button>
          </div>

          {/* Row 2: Meta info + Delete */}
          <div className="flex items-center gap-3 mt-1.5">
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.7rem',
                color: STAT_COLORS[quest.stat_type] ?? 'var(--ink)',
                fontWeight: 500,
              }}
            >
              +{quest.xp} {STAT_LABELS[quest.stat_type]}
            </span>

            {quest.due_date && (
              <span
                style={{
                  fontFamily: 'var(--mono)',
                  fontSize: '0.68rem',
                  color: overdue
                    ? '#9B2D20'
                    : isUrgent
                      ? '#C0682B'
                      : isNear
                        ? '#8B5030'
                        : 'var(--ink-dim)',
                }}
              >
                {formatDueLabel(overdue, daysLeft ?? 0)}
              </span>
            )}

            <button
              onClick={() => onDelete(quest.id)}
              disabled={disabled || completing}
              className="ml-auto transition-colors"
              aria-label="퀘스트 삭제"
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '0.65rem',
                color: 'var(--ink-dim)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                opacity: 0,
                padding: '1px 2px',
              }}
              // Show delete on hover via parent group
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.opacity = '1'
                el.style.color = '#9B2D20'
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement
                el.style.opacity = '0'
                el.style.color = 'var(--ink-dim)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
