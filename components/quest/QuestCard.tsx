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

// Grade seal — outline SVG, no fill
const GRADE_SEAL = {
  main: (color: string) => (
    <svg width="22" height="24" viewBox="0 0 22 24" fill="none" aria-hidden>
      <polygon
        points="11,1.5 20.5,6.5 20.5,17.5 11,22.5 1.5,17.5 1.5,6.5"
        stroke={color} strokeWidth="1" />
      <line x1="11" y1="1.5"  x2="11" y2="22.5"  stroke={color} strokeWidth="0.5" opacity="0.4" />
      <line x1="1.5" y1="6.5" x2="20.5" y2="17.5" stroke={color} strokeWidth="0.5" opacity="0.4" />
      <line x1="1.5" y1="17.5" x2="20.5" y2="6.5" stroke={color} strokeWidth="0.5" opacity="0.4" />
    </svg>
  ),
  weekly: (color: string) => (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <polygon
        points="11,1.5 20.5,8 17,19.5 5,19.5 1.5,8"
        stroke={color} strokeWidth="1" />
      <circle cx="11" cy="11" r="3" stroke={color} strokeWidth="0.5" opacity="0.5" />
    </svg>
  ),
  daily: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="8.5" stroke={color} strokeWidth="1" />
      <circle cx="10" cy="10" r="3.5" stroke={color} strokeWidth="0.5" opacity="0.5" />
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

function formatDueLabel(due: string, overdue: boolean, daysLeft: number): string {
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
        border: `1px solid ${accentColor}30`,
        borderLeft: `1px solid ${accentColor}60`,
        transition: 'background 150ms, border-color 150ms',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--card-hi)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'var(--card)'
      }}
    >
      {/* Completion seal overlay */}
      {showSeal && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="animate-ink-stamp flex items-center justify-center"
            style={{
              width: 56, height: 56,
              borderRadius: '50%',
              background: '#9B2D20',
              border: '2px solid #C0392B',
              color: '#E8DBBE',
              fontFamily: 'var(--body-kr)',
              fontSize: '1.125rem',
              fontWeight: 600,
            }}
          >
            완
          </div>
        </div>
      )}

      <div className="flex">
        {/* Left margin — grade seal */}
        <div
          className="flex items-center justify-center shrink-0"
          style={{
            width: 48,
            borderRight: `1px solid ${accentColor}20`,
            padding: '14px 0',
          }}
        >
          {SealSvg(accentColor)}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 px-4 py-3">
          <div className="flex items-start justify-between gap-2">
            <p
              style={{
                fontFamily: 'var(--body-kr)',
                fontWeight: 600,
                fontSize: '0.9375rem',
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
              onClick={() => onDelete(quest.id)}
              disabled={disabled || completing}
              aria-label="퀘스트 삭제"
              className="shrink-0 mt-0.5 transition-colors"
              style={{
                color: 'var(--ink-dim)',
                fontSize: '0.7rem',
                lineHeight: 1,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = '#9B2D20' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-dim)' }}
            >
              ✕
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-1.5">
            <span
              style={{
                fontFamily: 'var(--mono)',
                fontSize: '0.72rem',
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
                        ? 'color-mix(in srgb, #C0682B 60%, var(--ink))'
                        : 'var(--ink-dim)',
                }}
              >
                {formatDueLabel(quest.due_date, overdue, daysLeft ?? 0)}
              </span>
            )}
          </div>

          {/* Action row */}
          <div
            className="flex justify-end mt-3 pt-2.5"
            style={{ borderTop: `1px solid ${accentColor}15` }}
          >
            <button
              onClick={handleComplete}
              disabled={disabled || completing}
              className="btn-primary"
              style={{
                padding: '5px 18px',
                borderColor: completing
                  ? 'var(--border)'
                  : `color-mix(in srgb, ${accentColor} 60%, transparent)`,
                color: completing ? 'var(--ink)' : accentColor,
              }}
            >
              {completing ? '・・・' : '완료하기'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
