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

const GRADE_CONFIG = {
  main: {
    badge: (
      <svg width="18" height="20" viewBox="0 0 18 20" aria-hidden>
        <polygon
          points="9,0 18,5 18,15 9,20 0,15 0,5"
          fill="#C0392B"
          style={{ filter: 'drop-shadow(0 0 4px #C0392B80)' }}
        />
      </svg>
    ),
    accent: '#C0392B',
  },
  weekly: {
    badge: (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <polygon
          points="5,0 13,0 18,5 18,13 13,18 5,18 0,13 0,5"
          fill="#6B3FA0"
          style={{ filter: 'drop-shadow(0 0 4px #6B3FA080)' }}
        />
      </svg>
    ),
    accent: '#6B3FA0',
  },
  daily: {
    badge: (
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <circle
          cx="8" cy="8" r="7"
          fill="#1A5F7A"
          style={{ filter: 'drop-shadow(0 0 4px #1A5F7A80)' }}
        />
      </svg>
    ),
    accent: '#1A5F7A',
  },
}

const STAT_COLORS: Record<string, string> = {
  strength:     '#C0392B',
  intelligence: '#1A5F7A',
  charisma:     '#6B3FA0',
}

function formatDueDate(due: string): string {
  const d = new Date(due)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function getDaysUntil(due: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(due)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / 86400000)
}

export default function QuestCard({ quest, onComplete, onDelete, disabled }: Props) {
  const [completing, setCompleting] = useState(false)
  const [showSeal, setShowSeal] = useState(false)

  const overdue   = isOverdue(quest.due_date)
  const cfg       = GRADE_CONFIG[quest.grade as keyof typeof GRADE_CONFIG] ?? GRADE_CONFIG.daily
  const daysLeft  = quest.due_date ? getDaysUntil(quest.due_date) : null
  const isUrgent  = daysLeft !== null && daysLeft === 0 && !overdue
  const isNear    = daysLeft !== null && daysLeft <= 2 && daysLeft > 0

  // Accent color: overdue → jeok, today → ember, else grade color
  const accentColor = overdue ? '#C0392B' : (isUrgent ? '#E07B39' : cfg.accent)
  const cardGlow    = overdue
    ? '0 0 12px #C0392B20'
    : isUrgent
      ? '0 0 10px #E07B3920'
      : 'none'

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
        background: '#252220',
        borderTop:    `1px solid ${accentColor}40`,
        borderLeft:   `1px solid ${accentColor}25`,
        borderRight:  '1px solid #1A2E27',
        borderBottom: '1px solid #151F1B',
        borderRadius: '4px',
        boxShadow: cardGlow,
        transition: 'transform 200ms ease-out, box-shadow 200ms ease-out',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.transform = 'rotateX(0.8deg) rotateY(-0.4deg) translateY(-2px)'
        el.style.boxShadow = `0 0 0 1px ${accentColor}25, 0 6px 24px #00000060`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.transform = ''
        el.style.boxShadow = cardGlow
      }}
    >
      {/* Dancheong stripe */}
      <div className="dancheong-stripe" />

      {/* Left accent strip */}
      <div
        className="absolute left-0 bottom-0 w-[2px]"
        style={{ top: '3px', background: accentColor }}
      />

      {/* Seal stamp overlay */}
      {showSeal && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div
            className="animate-seal-stamp"
            style={{
              width: 64, height: 64,
              borderRadius: '50%',
              border: '2px solid #D4A017',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#D4A017', fontSize: '1.5rem',
              background: 'rgba(15,14,12,0.7)',
            }}
          >
            ✓
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-3 pl-5">
        <div className="flex items-start gap-3">
          {/* Grade badge */}
          <div className="mt-0.5 shrink-0">{cfg.badge}</div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p
                className="font-hahmlet font-semibold leading-snug"
                style={{
                  color: overdue ? '#C0392B' : isUrgent ? '#E07B39' : '#F0EAD6',
                  fontSize: '0.9375rem',
                }}
              >
                {quest.title}
              </p>
              {/* Delete */}
              <button
                onClick={() => onDelete(quest.id)}
                disabled={disabled || completing}
                aria-label="퀘스트 삭제"
                className="shrink-0 text-[#3A3530] hover:text-jeok transition-colors mt-0.5 leading-none"
                style={{ fontSize: '0.75rem' }}
              >
                ✕
              </button>
            </div>

            {/* Meta row */}
            <div className="flex items-center gap-3 mt-1.5">
              <span
                className="text-[0.75rem] font-inter font-medium"
                style={{ color: STAT_COLORS[quest.stat_type] ?? '#6A6560' }}
              >
                +{quest.xp} {STAT_LABELS[quest.stat_type]}
              </span>

              {quest.due_date && (
                <span
                  className="text-[0.72rem] font-inter"
                  style={{ color: overdue ? '#C0392B' : isUrgent ? '#E07B39' : isNear ? '#E07B3990' : '#6A6560' }}
                >
                  {overdue
                    ? '지연됨'
                    : isUrgent
                      ? '오늘 마감'
                      : `~${formatDueDate(quest.due_date)}`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-3">
          <button
            onClick={handleComplete}
            disabled={disabled || completing}
            className="text-[0.78rem] font-cinzel font-bold tracking-wider transition-all disabled:opacity-40"
            style={{
              background: '#D4A017',
              color: '#0F0E0C',
              padding: '5px 16px',
              clipPath: 'polygon(0 4px, 4px 0, calc(100% - 4px) 0, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 0 calc(100% - 4px))',
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.background = '#F5C518'
              el.style.boxShadow = '0 0 16px #D4A01760'
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement
              el.style.background = '#D4A017'
              el.style.boxShadow = 'none'
            }}
            onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.96)' }}
            onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = '' }}
          >
            {completing ? '...' : '완료하기'}
          </button>
        </div>
      </div>
    </div>
  )
}
