'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { NPCType, Quest, Stats } from '@/types'
import { getNPCConfig } from '@/lib/npc-config'
import TypingText from './TypingText'
import CornerOrnament from '@/components/ui/CornerOrnament'

type Props = {
  npcType: NPCType
  quests: Pick<Quest, 'title' | 'stat_type' | 'grade' | 'due_date'>[]
  stats: Pick<Stats, 'strength' | 'intelligence' | 'charisma'>
}

const TODAY_KEY = 'briefing_date'

const NPC_ACCENT: Record<NPCType, string> = {
  knight: '#B8860B',
  rival:  '#9B2D20',
  sage:   '#2E6B5A',
}

function KnightIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <polygon points="14,2 26,8 26,20 14,26 2,20 2,8" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="14" cy="14" r="4" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
    </svg>
  )
}

function RivalIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <line x1="4" y1="4"  x2="24" y2="24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="4" x2="4" y2="24"  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function SageIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden>
      <rect x="6" y="4" width="16" height="22" rx="1" stroke="currentColor" strokeWidth="1.2" />
      <line x1="9"  y1="11" x2="19" y2="11" stroke="currentColor" strokeWidth="0.75" />
      <line x1="9"  y1="15" x2="19" y2="15" stroke="currentColor" strokeWidth="0.75" />
      <line x1="9"  y1="19" x2="15" y2="19" stroke="currentColor" strokeWidth="0.75" />
    </svg>
  )
}

const NPC_ICON: Record<NPCType, React.FC> = {
  knight: KnightIcon,
  rival:  RivalIcon,
  sage:   SageIcon,
}

export default function NPCDialog({ npcType, quests, stats }: Props) {
  const router = useRouter()
  const cfg    = getNPCConfig(npcType)
  const accent = NPC_ACCENT[npcType]
  const Icon   = NPC_ICON[npcType]

  const [phase,      setPhase]    = useState<'checking' | 'loading' | 'typing' | 'done' | 'error'>('checking')
  const [dialogue,   setDialogue] = useState('')
  const [errorMsg,   setErrorMsg] = useState('')
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

      if (!res.ok || !res.body) throw new Error('브리핑 생성에 실패했습니다.')

      setPhase('typing')
      const reader  = res.body.getReader()
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
            if (parsed.text)  accumulated += parsed.text
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

  if (phase === 'checking') return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: 'var(--lacquer)' }}
    >
      <div
        style={{
          width: 32, height: 32,
          borderRadius: '50%',
          background: 'conic-gradient(#B8860B 0%, #9B2D20 25%, #2E6B5A 50%, #5C3580 75%, #B8860B 100%)',
          animation: 'spin 1.2s linear infinite',
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 relative"
      style={{ background: 'var(--lacquer)' }}
    >
      {/* Background watermark */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        aria-hidden
        style={{ opacity: 0.04 }}
      >
        <svg width="300" height="300" viewBox="0 0 120 120" fill="none"
          style={{ color: 'var(--parchment)' }}
        >
          <circle cx="60" cy="60" r="58" stroke="currentColor" strokeWidth="1" />
          <circle cx="60" cy="60" r="40" stroke="currentColor" strokeWidth="0.75" />
          <circle cx="60" cy="60" r="22" stroke="currentColor" strokeWidth="0.5" />
          <line x1="60" y1="2"   x2="60" y2="118"  stroke="currentColor" strokeWidth="0.5" />
          <line x1="2"  y1="60"  x2="118" y2="60"  stroke="currentColor" strokeWidth="0.5" />
          <line x1="18" y1="18"  x2="102" y2="102" stroke="currentColor" strokeWidth="0.5" />
          <line x1="102" y1="18" x2="18"  y2="102" stroke="currentColor" strokeWidth="0.5" />
        </svg>
      </div>

      {/* Dialog box */}
      <div
        className="relative w-full max-w-xl animate-ink-appear"
        style={{
          background: 'var(--panel)',
          border: `1px solid ${accent}40`,
          borderLeft: `3px solid ${accent}60`,
          boxShadow: `0 0 40px color-mix(in srgb, ${accent} 8%, transparent), 0 24px 80px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Corner ornaments */}
        <CornerOrnament
          className="absolute"
          style={{ top: -5, left: -5, color: accent } as React.CSSProperties}
          size={10}
        />
        <CornerOrnament
          className="absolute"
          style={{ top: -5, right: -5, color: accent } as React.CSSProperties}
          size={10}
        />
        <CornerOrnament
          className="absolute"
          style={{ bottom: -5, left: -5, color: accent } as React.CSSProperties}
          size={10}
        />
        <CornerOrnament
          className="absolute"
          style={{ bottom: -5, right: -5, color: accent } as React.CSSProperties}
          size={10}
        />

        {/* Header */}
        <div
          className="flex items-center gap-3 px-6 py-4"
          style={{ borderBottom: `1px solid ${accent}20` }}
        >
          <span style={{ color: accent }}>
            <Icon />
          </span>
          <div>
            <p
              style={{
                fontFamily: 'var(--body-kr)',
                fontWeight: 600,
                fontSize: '1rem',
                color: accent,
                lineHeight: 1.2,
              }}
            >
              {cfg.label}
            </p>
            <p
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.56rem',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: `color-mix(in srgb, ${accent} 60%, transparent)`,
              }}
            >
              Daily Briefing
            </p>
          </div>
        </div>

        {/* Dialogue area */}
        <div className="px-6 py-6 min-h-[160px]">
          {phase === 'loading' && (
            <div className="flex items-center gap-2">
              <div
                className="skeleton"
                style={{ height: '0.75rem', width: '60%', borderRadius: '2px' }}
              />
            </div>
          )}

          {(phase === 'typing' || phase === 'done') && (
            <p
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '0.9375rem',
                color: 'var(--parchment)',
                lineHeight: 1.85,
                whiteSpace: 'pre-wrap',
              }}
            >
              <TypingText
                text={dialogue}
                speedMs={18}
                onComplete={() => setPhase('done')}
              />
            </p>
          )}

          {phase === 'error' && (
            <div className="space-y-3">
              <p
                style={{
                  fontFamily: 'var(--body-kr)',
                  fontSize: '0.875rem',
                  color: '#9B2D20',
                }}
              >
                {errorMsg}
              </p>
              <button
                onClick={() => {
                  setPhase('loading')
                  fetchedRef.current = false
                  streamBriefing()
                }}
                className="btn-ghost"
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '0.62rem',
                  letterSpacing: '0.1em',
                  padding: '6px 16px',
                  color: accent,
                  borderColor: `${accent}40`,
                }}
              >
                다시 시도
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex justify-end"
          style={{ borderTop: `1px solid ${accent}15` }}
        >
          <button
            onClick={goToDashboard}
            disabled={phase === 'loading'}
            className="btn-primary"
            style={{
              padding: '8px 24px',
              borderColor: `color-mix(in srgb, ${accent} 60%, transparent)`,
              color: accent,
            }}
          >
            퀘스트 수행하러 가기 →
          </button>
        </div>
      </div>

      {/* NPC switcher hint */}
      <p
        className="mt-6"
        style={{
          fontFamily: 'var(--display)',
          fontSize: '0.58rem',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'var(--ink-dim)',
        }}
      >
        브리핑은 하루 한 번만 제공됩니다
      </p>
    </div>
  )
}
