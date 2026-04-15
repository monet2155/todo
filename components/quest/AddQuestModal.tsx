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

const GRADES: QuestGrade[] = ['daily', 'weekly', 'main']
const STATS: StatType[] = ['strength', 'intelligence', 'charisma']

export default function AddQuestModal({ onClose, onCreate }: Props) {
  const [title, setTitle] = useState('')
  const [grade, setGrade] = useState<QuestGrade>('daily')
  const [statType, setStatType] = useState<StatType>('strength')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await onCreate({
        title: title.trim(),
        grade,
        stat_type: statType,
        due_date: dueDate || null,
      })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : '생성 실패')
      setSubmitting(false)
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold text-yellow-400 mb-4">새 퀘스트</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">제목</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              placeholder="보고서 마왕 처치"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">등급</label>
            <div className="grid grid-cols-3 gap-2">
              {GRADES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`py-2 rounded-lg text-sm transition-colors ${
                    grade === g
                      ? 'bg-yellow-400 text-gray-950 font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {GRADE_LABELS[g]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">스탯</label>
            <div className="grid grid-cols-3 gap-2">
              {STATS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatType(s)}
                  className={`py-2 rounded-lg text-sm transition-colors ${
                    statType === s
                      ? 'bg-yellow-400 text-gray-950 font-semibold'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {STAT_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">마감일 (선택)</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-400"
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="flex-1 py-2 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-40 transition-colors"
            >
              {submitting ? '생성 중...' : '퀘스트 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
