'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Quest, QuestGrade, StatType } from '@/types'
import { groupQuestsByGrade, STAT_LABELS, GRADE_LABELS } from '@/lib/quest-utils'
import QuestCard from './QuestCard'
import AddQuestModal from './AddQuestModal'

type Props = {
  initialQuests: Quest[]
}

type XPPopup = {
  id: number
  text: string
  color: string
}

const STAT_COLORS: Record<StatType, string> = {
  strength:     '#9B2D20',
  intelligence: '#2E6B5A',
  charisma:     '#5C3580',
}

const GRADE_ORDER: QuestGrade[] = ['main', 'weekly', 'daily']

const GRADE_ACCENT: Record<QuestGrade, string> = {
  main:   '#9B2D20',
  weekly: '#5C3580',
  daily:  '#2E6B5A',
}

export default function QuestBoard({ initialQuests }: Props) {
  const router = useRouter()
  const [quests,    setQuests]    = useState<Quest[]>(initialQuests)
  const [modalOpen, setModalOpen] = useState(false)
  const [popups,    setPopups]    = useState<XPPopup[]>([])

  const grouped = groupQuestsByGrade(quests)

  const showPopup = useCallback((text: string, color: string) => {
    const id = Date.now() + Math.random()
    setPopups((p) => [...p, { id, text, color }])
    setTimeout(() => setPopups((p) => p.filter((x) => x.id !== id)), 1800)
  }, [])

  async function handleCreate(input: {
    title: string
    grade: QuestGrade
    stat_type: StatType
    due_date: string | null
  }) {
    const res = await fetch('/api/quests', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'failed' }))
      throw new Error(error)
    }
    const newQuest = (await res.json()) as Quest
    setQuests((qs) => [newQuest, ...qs])
  }

  async function handleComplete(id: string) {
    const target = quests.find((q) => q.id === id)
    if (!target) return
    setQuests((qs) => qs.filter((q) => q.id !== id))
    showPopup(`+${target.xp} ${STAT_LABELS[target.stat_type]}`, STAT_COLORS[target.stat_type])
    const res = await fetch(`/api/quests/${id}`, { method: 'PATCH' })
    if (!res.ok) {
      setQuests((qs) => [target, ...qs])
      showPopup('완료 실패', '#9B2D20')
      return
    }
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('이 퀘스트를 삭제하시겠습니까?')) return
    const target = quests.find((q) => q.id === id)
    if (!target) return
    setQuests((qs) => qs.filter((q) => q.id !== id))
    const res = await fetch(`/api/quests/${id}`, { method: 'DELETE' })
    if (!res.ok) setQuests((qs) => [target, ...qs])
  }

  return (
    <div className="relative">
      {/* Board header */}
      <div className="flex items-center justify-between mb-6">
        <h2
          style={{
            fontFamily: 'var(--display)',
            fontSize: '0.75rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'var(--ink)',
            fontWeight: 400,
          }}
        >
          퀘스트 보드
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary"
          style={{ padding: '6px 18px', fontSize: '0.7rem' }}
        >
          + 새 퀘스트
        </button>
      </div>

      {/* Empty state */}
      {quests.length === 0 ? (
        <div
          className="text-center py-16 px-8"
          style={{
            background: 'var(--panel)',
            border: '1px solid var(--border)',
          }}
        >
          {/* Haechi mark — stylized SVG */}
          <div className="flex justify-center mb-5">
            <svg
              width="64" height="64" viewBox="0 0 64 64"
              fill="none" aria-hidden
              style={{ color: 'var(--gold)', opacity: 0.5 }}
            >
              <circle cx="32" cy="32" r="30" stroke="currentColor" strokeWidth="1" />
              <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
              <circle cx="32" cy="32" r="10" stroke="currentColor" strokeWidth="0.5" opacity="0.4" />
              <line x1="32" y1="2"  x2="32" y2="62" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <line x1="2"  y1="32" x2="62" y2="32" stroke="currentColor" strokeWidth="0.5" opacity="0.3" />
              <line x1="11" y1="11" x2="53" y2="53" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
              <line x1="53" y1="11" x2="11" y2="53" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
            </svg>
          </div>
          <p
            style={{
              fontFamily: 'var(--body-kr)',
              fontWeight: 600,
              fontSize: '1rem',
              color: 'var(--ink)',
              marginBottom: '0.5rem',
            }}
          >
            아직 기록되지 않은 모험
          </p>
          <p
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '0.82rem',
              color: 'var(--ink-dim)',
              marginBottom: '1.75rem',
            }}
          >
            첫 번째 임무를 등록하고 얼담을 시작하세요.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="btn-primary"
            style={{ padding: '9px 28px' }}
          >
            + 첫 퀘스트 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {GRADE_ORDER.map((grade) => {
            const items  = grouped[grade]
            if (items.length === 0) return null
            const accent = GRADE_ACCENT[grade]
            return (
              <section key={grade}>
                {/* Section header — editorial chapter marker */}
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="h-px flex-1"
                    style={{
                      background: `linear-gradient(90deg, ${accent}50, transparent)`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: 'var(--display)',
                      fontSize: '0.6rem',
                      letterSpacing: '0.22em',
                      textTransform: 'uppercase',
                      color: accent,
                      fontWeight: 400,
                    }}
                  >
                    {GRADE_LABELS[grade]}
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: '0.6rem',
                      color: 'var(--ink-dim)',
                    }}
                  >
                    {items.length}
                  </span>
                  <div
                    className="h-px flex-1"
                    style={{
                      background: `linear-gradient(270deg, ${accent}50, transparent)`,
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  {items.map((quest) => (
                    <QuestCard
                      key={quest.id}
                      quest={quest}
                      onComplete={handleComplete}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <AddQuestModal onClose={() => setModalOpen(false)} onCreate={handleCreate} />
      )}

      {/* XP float popups */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-40">
        {popups.map((p) => (
          <div
            key={p.id}
            className="animate-xp-float text-center"
            style={{
              fontFamily: 'var(--mono)',
              fontWeight: 500,
              fontSize: '1.5rem',
              color: p.color,
              letterSpacing: '0.04em',
            }}
          >
            {p.text}
          </div>
        ))}
      </div>
    </div>
  )
}
