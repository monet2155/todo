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
  strength:     '#C0392B',
  intelligence: '#1A5F7A',
  charisma:     '#6B3FA0',
}

const GRADE_ORDER: QuestGrade[] = ['main', 'weekly', 'daily']

const SECTION_ACCENT: Record<QuestGrade, string> = {
  main:   '#C0392B',
  weekly: '#6B3FA0',
  daily:  '#1A5F7A',
}

export default function QuestBoard({ initialQuests }: Props) {
  const router = useRouter()
  const [quests, setQuests]     = useState<Quest[]>(initialQuests)
  const [modalOpen, setModalOpen] = useState(false)
  const [popups, setPopups]     = useState<XPPopup[]>([])

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
      showPopup('완료 실패', '#C0392B')
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
          className="font-cinzel font-bold tracking-wide"
          style={{ color: '#D4A017', fontSize: '1rem', letterSpacing: '0.12em' }}
        >
          QUEST BOARD
        </h2>
        <button
          onClick={() => setModalOpen(true)}
          className="font-cinzel font-bold text-[0.78rem] tracking-wider transition-all"
          style={{
            background: '#D4A017',
            color: '#0F0E0C',
            padding: '7px 20px',
            clipPath: 'polygon(0 5px, 5px 0, calc(100% - 5px) 0, 100% 5px, 100% calc(100% - 5px), calc(100% - 5px) 100%, 5px 100%, 0 calc(100% - 5px))',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget
            el.style.background = '#F5C518'
            el.style.boxShadow = '0 0 20px #D4A01760'
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget
            el.style.background = '#D4A017'
            el.style.boxShadow = 'none'
          }}
        >
          + 새 퀘스트
        </button>
      </div>

      {/* Empty state */}
      {quests.length === 0 ? (
        <div
          className="text-center py-16 px-8"
          style={{
            background: '#1C1A18',
            borderTop:    '1px solid #2A4A3E',
            borderLeft:   '1px solid #243D33',
            borderRight:  '1px solid #1A2E27',
            borderBottom: '1px solid #151F1B',
            borderRadius: '4px',
          }}
        >
          <div
            className="text-5xl mb-4 select-none"
            style={{ filter: 'grayscale(0.3) drop-shadow(0 0 12px #D4A01730)' }}
          >
            🦁
          </div>
          <p
            className="font-hahmlet font-semibold mb-2"
            style={{ color: '#8A8580', fontSize: '1rem' }}
          >
            모험이 아직 시작되지 않았습니다
          </p>
          <p
            className="font-noto text-[0.8rem] mb-6"
            style={{ color: '#5A5550' }}
          >
            첫 번째 임무를 등록하고 전설을 시작하세요.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="font-cinzel font-bold text-[0.78rem] tracking-wider"
            style={{
              background: 'transparent',
              color: '#D4A017',
              border: '1px solid #D4A01750',
              padding: '8px 24px',
              borderRadius: '2px',
            }}
          >
            + 첫 퀘스트 등록하기
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {GRADE_ORDER.map((grade) => {
            const items = grouped[grade]
            if (items.length === 0) return null
            const accent = SECTION_ACCENT[grade]
            return (
              <section key={grade}>
                {/* Section header */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${accent}60, transparent)` }} />
                  <div className="flex items-center gap-1.5">
                    <div
                      style={{
                        width: 6, height: 6,
                        background: accent,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        boxShadow: `0 0 6px ${accent}`,
                      }}
                    />
                    <span
                      className="font-cinzel font-bold text-[0.68rem] tracking-[0.18em] uppercase"
                      style={{ color: accent }}
                    >
                      {GRADE_LABELS[grade]}
                    </span>
                    <span
                      className="font-inter text-[0.65rem]"
                      style={{ color: '#4A4540' }}
                    >
                      ({items.length})
                    </span>
                    <div
                      style={{
                        width: 6, height: 6,
                        background: accent,
                        clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                        boxShadow: `0 0 6px ${accent}`,
                      }}
                    />
                  </div>
                  <div className="h-px flex-1" style={{ background: `linear-gradient(270deg, ${accent}60, transparent)` }} />
                </div>

                <div className="space-y-2">
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

      {/* XP 획득 팝업 */}
      <div className="fixed top-1/3 left-1/2 -translate-x-1/2 pointer-events-none z-40">
        {popups.map((p) => (
          <div
            key={p.id}
            className="font-cinzel-deco font-bold text-3xl animate-xp-popup"
            style={{ color: p.color, textShadow: `0 0 20px ${p.color}` }}
          >
            {p.text}
          </div>
        ))}
      </div>
    </div>
  )
}
