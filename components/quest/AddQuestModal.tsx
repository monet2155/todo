'use client'

import { useState } from 'react'
import type { QuestGrade, StatType } from '@/types'
import { STAT_LABELS, GRADE_LABELS } from '@/lib/quest-utils'

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
  daily:  '#1A5F7A',
  weekly: '#6B3FA0',
  main:   '#C0392B',
}

const STAT_ACCENT: Record<StatType, string> = {
  strength:     '#C0392B',
  intelligence: '#1A5F7A',
  charisma:     '#6B3FA0',
}

const inputStyle: React.CSSProperties = {
  background: '#1C1A18',
  border: '1px solid #2A4A3E',
  borderRadius: '2px',
  color: '#F0EAD6',
  fontSize: '0.875rem',
  padding: '10px 14px',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
}

export default function AddQuestModal({ onClose, onCreate }: Props) {
  const [title,     setTitle]     = useState('')
  const [grade,     setGrade]     = useState<QuestGrade>('daily')
  const [statType,  setStatType]  = useState<StatType>('strength')
  const [dueDate,   setDueDate]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error,     setError]     = useState<string | null>(null)

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
      style={{ background: 'rgba(15,14,12,0.88)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md animate-modal-enter"
        style={{
          background: '#2C2927',
          borderTop:    '1px solid #2A4A3E',
          borderLeft:   '1px solid #243D33',
          borderRight:  '1px solid #1A2E27',
          borderBottom: '1px solid #151F1B',
          borderRadius: '4px',
          boxShadow: '0 24px 80px #00000090',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Dancheong stripe */}
        <div className="dancheong-stripe" />

        <div className="p-6">
          <h2
            className="font-cinzel font-bold tracking-wider mb-5"
            style={{ color: '#D4A017', fontSize: '1rem', letterSpacing: '0.12em' }}
          >
            새 퀘스트
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label
                className="block font-inter text-[0.7rem] tracking-[0.12em] uppercase mb-2"
                style={{ color: '#6A6560' }}
              >
                제목
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                placeholder="보고서 마왕 처치"
                autoFocus
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#D4A01780'
                  e.currentTarget.style.boxShadow = '0 0 0 3px #D4A01715'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#2A4A3E'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Grade */}
            <div>
              <label
                className="block font-inter text-[0.7rem] tracking-[0.12em] uppercase mb-2"
                style={{ color: '#6A6560' }}
              >
                등급
              </label>
              <div className="grid grid-cols-3 gap-2">
                {GRADES.map((g) => {
                  const active = grade === g
                  const accent = GRADE_ACCENT[g]
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGrade(g)}
                      className="py-2 text-[0.78rem] font-cinzel font-bold tracking-wide transition-all"
                      style={{
                        background:   active ? accent : '#1C1A18',
                        color:        active ? '#F0EAD6' : '#6A6560',
                        border:       `1px solid ${active ? accent : '#2A4A3E'}`,
                        borderRadius: '2px',
                        boxShadow:    active ? `0 0 10px ${accent}40` : 'none',
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
              <label
                className="block font-inter text-[0.7rem] tracking-[0.12em] uppercase mb-2"
                style={{ color: '#6A6560' }}
              >
                스탯
              </label>
              <div className="grid grid-cols-3 gap-2">
                {STATS.map((s) => {
                  const active = statType === s
                  const accent = STAT_ACCENT[s]
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setStatType(s)}
                      className="py-2 text-[0.78rem] font-hahmlet font-semibold transition-all"
                      style={{
                        background:   active ? accent + '25' : '#1C1A18',
                        color:        active ? accent : '#6A6560',
                        border:       `1px solid ${active ? accent + '80' : '#2A4A3E'}`,
                        borderRadius: '2px',
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
              <label
                className="block font-inter text-[0.7rem] tracking-[0.12em] uppercase mb-2"
                style={{ color: '#6A6560' }}
              >
                마감일 (선택)
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#D4A01780'
                  e.currentTarget.style.boxShadow = '0 0 0 3px #D4A01715'
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#2A4A3E'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              />
            </div>

            {error && (
              <p className="font-inter text-[0.8rem]" style={{ color: '#C0392B' }}>
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 font-cinzel text-[0.78rem] tracking-wider transition-all"
                style={{
                  background: 'transparent',
                  color: '#6A6560',
                  border: '1px solid #2A4A3E',
                  borderRadius: '2px',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = '#D4A01740'
                  el.style.color = '#D4A01790'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget
                  el.style.borderColor = '#2A4A3E'
                  el.style.color = '#6A6560'
                }}
              >
                취소
              </button>
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="flex-1 font-cinzel font-bold text-[0.78rem] tracking-wider transition-all disabled:opacity-40"
                style={{
                  background: '#D4A017',
                  color: '#0F0E0C',
                  padding: '10px 0',
                  clipPath: 'polygon(0 5px, 5px 0, calc(100% - 5px) 0, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0 calc(100% - 5px))',
                }}
              >
                {submitting ? '등록 중...' : '퀘스트 등록'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
