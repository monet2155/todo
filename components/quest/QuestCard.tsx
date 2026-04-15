'use client'

import type { Quest } from '@/types'
import { STAT_LABELS, isOverdue } from '@/lib/quest-utils'

type Props = {
  quest: Quest
  onComplete: (id: string) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

const STAT_COLORS: Record<string, string> = {
  strength: 'text-red-400',
  intelligence: 'text-blue-400',
  charisma: 'text-purple-400',
}

export default function QuestCard({ quest, onComplete, onDelete, disabled }: Props) {
  const overdue = isOverdue(quest.due_date)

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-white truncate">{quest.title}</span>
          {overdue && (
            <span className="px-2 py-0.5 text-xs bg-red-500/20 text-red-300 rounded-full border border-red-500/30">
              지연됨
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1 text-sm text-gray-400">
          <span className={STAT_COLORS[quest.stat_type] ?? ''}>
            +{quest.xp} {STAT_LABELS[quest.stat_type]}
          </span>
          {quest.due_date && (
            <span className="text-gray-500">~{quest.due_date}</span>
          )}
        </div>
      </div>

      <button
        onClick={() => onComplete(quest.id)}
        disabled={disabled}
        className="px-3 py-1.5 bg-yellow-400 text-gray-950 text-sm font-semibold rounded hover:bg-yellow-300 disabled:opacity-40 transition-colors"
      >
        완료
      </button>
      <button
        onClick={() => onDelete(quest.id)}
        disabled={disabled}
        aria-label="삭제"
        className="px-2 py-1.5 text-gray-500 hover:text-red-400 transition-colors"
      >
        ✕
      </button>
    </div>
  )
}
