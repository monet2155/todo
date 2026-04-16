'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { NPCType, Quest, Stats } from '@/types'
import { getNPCConfig } from '@/lib/npc-config'
import TypingText from './TypingText'

type Props = {
  npcType: NPCType
  quests: Pick<Quest, 'title' | 'stat_type' | 'grade' | 'due_date'>[]
  stats: Pick<Stats, 'strength' | 'intelligence' | 'charisma'>
}

const TODAY_KEY = 'briefing_date'

export default function NPCDialog({ npcType, quests, stats }: Props) {
  const router = useRouter()
  const cfg = getNPCConfig(npcType)

  const [phase, setPhase] = useState<'checking' | 'loading' | 'typing' | 'done' | 'error'>('checking')
  const [dialogue, setDialogue] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const fetchedRef = useRef(false)

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10)
    if (typeof window !== 'undefined' && localStorage.getItem(TODAY_KEY) === today) {
      router.replace('/dashboard')
      return
    }

    if (fetchedRef.current) return
    fetchedRef.current = true

    setPhase('loading')
    streamBriefing()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function streamBriefing() {
    try {
      const res = await fetch('/api/briefing', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ npc_type: npcType, quests, stats }),
      })

      if (!res.ok || !res.body) {
        throw new Error('브리핑 생성에 실패했습니다.')
      }

      setPhase('typing')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let accumulated = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

        for (const line of lines) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data) as { text?: string; error?: string }
            if (parsed.error) throw new Error(parsed.error)
            if (parsed.text) accumulated += parsed.text
          } catch {
            // skip malformed chunks
          }
        }

        setDialogue(accumulated)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.')
      setPhase('error')
    }
  }

  function goToDashboard() {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem(TODAY_KEY, today)
    router.push('/dashboard')
  }

  if (phase === 'checking') return null

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6">
      <div className={`w-full max-w-xl bg-gray-900 border ${cfg.dialogBorder} rounded-2xl overflow-hidden shadow-2xl`}>
        {/* NPC 헤더 */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800">
          <span className="text-3xl" role="img" aria-label={cfg.label}>
            {cfg.icon}
          </span>
          <span className={`font-bold text-lg ${cfg.nameColor}`}>{cfg.label}</span>
        </div>

        {/* 대사 영역 */}
        <div className="px-6 py-6 min-h-[140px] flex items-start">
          {phase === 'loading' && (
            <p className="text-gray-400 animate-pulse">브리핑 준비 중...</p>
          )}
          {(phase === 'typing' || phase === 'done') && (
            <p className="text-gray-100 leading-relaxed whitespace-pre-wrap">
              <TypingText
                text={dialogue}
                speedMs={20}
                onComplete={() => setPhase('done')}
              />
            </p>
          )}
          {phase === 'error' && (
            <p className="text-red-400">{errorMsg}</p>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="px-6 py-4 border-t border-gray-800 flex justify-end">
          <button
            onClick={goToDashboard}
            disabled={phase === 'loading'}
            className="px-5 py-2.5 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-40 transition-colors"
          >
            퀘스트 수행하러 가기 →
          </button>
        </div>
      </div>
    </div>
  )
}
