'use client'

import { useState } from 'react'
import type { QuestGrade, StatType } from '@/types'
import { STAT_LABELS, GRADE_LABELS } from '@/lib/quest-utils'
import CornerOrnament from '@/components/ui/CornerOrnament'

type Props = {
  onClose: () => void
  onCreate: (quest: {
    title: string
    grade: QuestGrade
    stat_type: StatType
    due_date: string | null
  }) => Promise<void>
}

const GRADES: QuestGrade[]  = ['daily', 'weekly', 'main']
const STATS:  StatType[]    = ['strength', 'intelligence', 'charisma']

const GRADE_ACCENT: Record<QuestGrade, string> = {
  daily:  '#2E6B5A',
  weekly: '#5C3580',
  main:   '#9B2D20',
}

const STAT_ACCENT: Record<StatType, string> = {
  strength:     '#9B2D20',
  intelligence: '#2E6B5A',
  charisma:     '#5C3580',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--display)',
  fontSize: '0.6rem',
  letterSpacing: '0.18em',
  textTransform: 'uppercase',
  color: 'var(--ink)',
  marginBottom: '0.5rem',
}

export default function AddQuestModal({ onClose, onCreate }: Props) {
  const [title,      setTitle]      = useState('')
  const [grade,      setGrade]      = useState<QuestGrade>('daily')
  const [statType,   setStatType]   = useState<StatType>('strength')
  const [dueDate,    setDueDate]    = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,      setError]      = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onCreate({ title: title.trim(), grade, stat_type: statType, due_date: dueDate || null })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 px-4"
      style={{ background: 'rgba(14,12,9,0.88)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md animate-modal-enter overflow-hidden"
        style={{
          background: 'var(--modal)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Corner ornaments */}
        <CornerOrnament
          className="absolute text-[color:var(--gold)]"
          style={{ top: -5, left: -5 } as React.CSSProperties}
          size={10}
        />
        <CornerOrnament
          className="absolute text-[color:var(--gold)]"
          style={{ top: -5, right: -5 } as React.CSSProperties}
          size={10}
        />
        <CornerOrnament
          className="absolute text-[color:var(--gold)]"
          style={{ bottom: -5, left: -5 } as React.CSSProperties}
          size={10}
        />
        <CornerOrnament
          className="absolute text-[color:var(--gold)]"
          style={{ bottom: -5, right: -5 } as React.CSSProperties}
          size={10}
        />

        {/* Top accent line */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
            opacity: 0.6,
          }}
        />

        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2
              style={{
                fontFamily: 'var(--display)',
                fontSize: '1.125rem',
                fontWeight: 300,
                color: 'var(--parchment)',
                letterSpacing: '0.04em',
              }}
            >
              새 퀘스트
            </h2>
            <button
              onClick={onClose}
              style={{
                color: 'var(--ink-dim)',
                fontSize: '0.75rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-dim)' }}
              aria-label="닫기"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label style={labelStyle}>임무 제목</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="field-base"
                placeholder="보고서 마왕 처치"
                autoFocus
              />
            </div>

            {/* Grade */}
            <div>
              <label style={labelStyle}>등급</label>
              <div className="grid grid-cols-3 gap-2">
                {GRADES.map((g) => {
                  const active = grade === g
                  const accent = GRADE_ACCENT[g]
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      style={{
                        fontFamily: 'var(--display)',
                        fontSize: '0.65rem',
                        letterSpacing: '0.12em',
                        textTransform: 'uppercase',
                        padding: '8px 0',
                        background: active ? `color-mix(in srgb, ${accent} 15%, transparent)` : 'transparent',
                        color:      active ? accent : 'var(--ink)',
                        border:     `1px solid ${active ? accent + '80' : 'var(--border)'}`,
                        cursor: 'pointer',
                        transition: 'all 120ms',
                      }}
                    >
                      {GRADE_LABELS[g]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Stat type */}
            <div>
              <label style={labelStyle}>성장 스탯</label>
              <div className="grid grid-cols-3 gap-2">
                {STATS.map((s) => {
                  const active = statType === s
                  const accent = STAT_ACCENT[s]
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatType(s)}
                      style={{
                        fontFamily: 'var(--body-kr)',
                        fontSize: '0.8125rem',
                        padding: '8px 0',
                        background: active ? `color-mix(in srgb, ${accent} 15%, transparent)` : 'transparent',
                        color:      active ? accent : 'var(--ink)',
                        border:     `1px solid ${active ? accent + '80' : 'var(--border)'}`,
                        cursor: 'pointer',
                        transition: 'all 120ms',
                      }}
                    >
                      {STAT_LABELS[s]}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Due date */}
            <div>
              <label style={labelStyle}>마감일 (선택)</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="field-base"
              />
            </div>

            {error && (
              <p
                style={{
                  fontFamily: 'var(--body-kr)',
                  fontSize: '0.8rem',
                  color: '#9B2D20',
                }}
              >
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost flex-1"
                style={{ padding: '9px 0' }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="btn-primary flex-1"
                style={{ padding: '9px 0' }}
              >
                {submitting ? '등록 중...' : '퀘스트 등록'}
              </button>
            </div>
          </form>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg, transparent, var(--border), transparent)',
          }}
        />
      </div>
    </div>
  )
}
