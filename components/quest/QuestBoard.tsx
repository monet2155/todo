'use client'

import { useState, useCallback } from 'react'
import type { Quest, QuestGrade, StatType } from '@/types'
import { groupQuestsByGrade, STAT_LABELS, GRADE_LABELS } from '@/lib/quest-utils'
import QuestCard from './QuestCard'
import AddQuestModal from './AddQuestModal'

type Props = {
  initialQuests: Quest[]
  onStatsChanged?: () => void
}

type XPPopup = {
  id: number
  text: string
  color: string
}

const STAT_COLORS: Record<StatType, string> = {
  strength: 'text-red-400',
  intelligence: 'text-blue-400',
  charisma: 'text-purple-400',
}

const GRADE_ORDER: QuestGrade[] = ['main', 'weekly', 'daily']

export default function QuestBoard({ initialQuests, onStatsChanged }: Props) {
  const [quests, setQuests] = useState<Quest[]>(initialQuests)
  const [modalOpen, setModalOpen] = useState(false)
  const [popups, setPopups] = useState<XPPopup[]>([])

  const grouped = groupQuestsByGrade(quests)

  const showPopup = useCallback((text: string, color: string) => {
    const id = Date.now() + Math.random()
    setPopups((p) => [...p, { id, text, color }])
    setTimeout(() => {
      setPopups((p) => p.filter((x) => x.id !== id))
    }, 1800)
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

    // Optimistic: remove from list immediately
    setQuests((qs) => qs.filter((q) => q.id !== id))
    showPopup(`+${target.xp} ${STAT_LABELS[target.stat_type]}`, STAT_COLORS[target.stat_type])

    const res = await fetch(`/api/quests/${id}`, { method: 'PATCH' })
    if (!res.ok) {
      // Rollback on failure
      setQuests((qs) => [target, ...qs])
      showPopup('완료 실패', 'text-red-400')
      return
    }
    onStatsChanged?.()
  }

  async function handleDelete(id: string) {
    if (!confirm('이 퀘스트를 삭제하시겠습니까?')) return

    const target = quests.find((q) => q.id === id)
    if (!target) return

    setQuests((qs) => qs.filter((q) => q.id !== id))
    const res = await fetch(`/api/quests/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setQuests((qs) => [target, ...qs])
    }
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-200">퀘스트 보드</h2>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 transition-colors"
        >
          + 새 퀘스트
        </button>
      </div>

      {quests.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center text-gray-500">
          아직 등록된 퀘스트가 없습니다. 첫 모험을 시작해보세요.
        </div>
      ) : (
        <div className="space-y-6">
          {GRADE_ORDER.map((grade) => {
            const items = grouped[grade]
            if (items.length === 0) return null
            return (
              <section key={grade}>
                <h3 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  {GRADE_LABELS[grade]} ({items.length})
                </h3>
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
            className={`text-3xl font-bold ${p.color} animate-xp-popup`}
          >
            {p.text}
          </div>
        ))}
      </div>
    </div>
  )
}
