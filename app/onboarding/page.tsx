'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { NPCType } from '@/types'
import CornerOrnament from '@/components/ui/CornerOrnament'

// NPC seal SVGs — outline style
function KnightSeal({ active }: { active: boolean }) {
  const c = active ? '#B8860B' : '#3A5E4E'
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <polygon points="20,3 37,12 37,28 20,37 3,28 3,12"
        stroke={c} strokeWidth="1.2" />
      <polygon points="20,10 30,15.5 30,24.5 20,30 10,24.5 10,15.5"
        stroke={c} strokeWidth="0.75" opacity="0.5" />
      <circle cx="20" cy="20" r="3.5" stroke={c} strokeWidth="0.75" />
    </svg>
  )
}

function RivalSeal({ active }: { active: boolean }) {
  const c = active ? '#9B2D20' : '#3A5E4E'
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <line x1="6"  y1="6"  x2="34" y2="34" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <line x1="34" y1="6"  x2="6"  y2="34" stroke={c} strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="20" cy="20" r="16" stroke={c} strokeWidth="0.75" opacity="0.4" />
      <circle cx="20" cy="20" r="4"  stroke={c} strokeWidth="0.75" />
    </svg>
  )
}

function SageSeal({ active }: { active: boolean }) {
  const c = active ? '#2E6B5A' : '#3A5E4E'
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" aria-hidden>
      <rect x="8" y="8" width="24" height="30" rx="1" stroke={c} strokeWidth="1.2" />
      <line x1="13" y1="16" x2="27" y2="16" stroke={c} strokeWidth="0.75" />
      <line x1="13" y1="20" x2="27" y2="20" stroke={c} strokeWidth="0.75" />
      <line x1="13" y1="24" x2="22" y2="24" stroke={c} strokeWidth="0.75" />
      <line x1="8" y1="13" x2="32" y2="13" stroke={c} strokeWidth="0.5" opacity="0.4" />
    </svg>
  )
}

const NPC_OPTIONS: {
  type: NPCType
  name: string
  title: string
  desc: string
  color: string
  Seal: React.FC<{ active: boolean }>
}[] = [
  {
    type:  'knight',
    name:  '기사단장',
    title: 'Guardian Knight',
    desc:  '충성스럽고 진지합니다. 전하를 위해 언제나 걱정하며, 스탯이 낮으면 간언을 올립니다.',
    color: '#B8860B',
    Seal:  KnightSeal,
  },
  {
    type:  'rival',
    name:  '츤데레 라이벌',
    title: 'Rival',
    desc:  '도발적이지만 결국 응원합니다. 실패하면 비웃다가도, 성공하면 인정합니다.',
    color: '#9B2D20',
    Seal:  RivalSeal,
  },
  {
    type:  'sage',
    name:  '현자 스승',
    title: 'Sage',
    desc:  '철학적이고 은유적입니다. 모든 여정을 교훈으로 포장하며 큰 그림을 봅니다.',
    color: '#2E6B5A',
    Seal:  SageSeal,
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [name,        setName]        = useState('')
  const [selectedNPC, setSelectedNPC] = useState<NPCType | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [loading,     setLoading]     = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedNPC) return

    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: user.id,
      name,
      npc_type: selectedNPC,
    })

    if (profileError) {
      setError(profileError.message)
      setLoading(false)
      return
    }

    await supabase.from('stats').insert({
      user_id: user.id,
      strength: 0,
      intelligence: 0,
      charisma: 0,
    })

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'var(--lacquer)' }}
    >
      <div className="w-full max-w-2xl animate-page-enter">

        {/* Header */}
        <div className="text-center mb-10">
          <h1
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '2rem',
              fontWeight: 700,
              color: 'var(--parchment)',
              lineHeight: 1,
              marginBottom: '0.5rem',
            }}
          >
            얼담
          </h1>
          <p
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '0.9rem',
              color: 'var(--ink)',
            }}
          >
            모험을 시작하기 전, 영웅의 정보를 입력하세요
          </p>
          <div
            className="mx-auto mt-3"
            style={{
              height: 1,
              width: '4rem',
              background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
              opacity: 0.5,
            }}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Hero name */}
          <div className="max-w-sm mx-auto">
            <label
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                display: 'block',
                marginBottom: '0.5rem',
                textAlign: 'center',
              }}
            >
              영웅의 이름
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="field-base"
              placeholder="홍길동"
              style={{ textAlign: 'center', fontSize: '1rem' }}
            />
          </div>

          {/* NPC selection */}
          <div>
            <label
              style={{
                fontFamily: 'var(--display)',
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'var(--ink)',
                display: 'block',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
            >
              동반자 선택
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {NPC_OPTIONS.map((npc) => {
                const active = selectedNPC === npc.type
                return (
                  <button
                    key={npc.type}
                    type="button"
                    onClick={() => setSelectedNPC(npc.type)}
                    className="relative text-left p-5 transition-all"
                    style={{
                      background: active
                        ? `color-mix(in srgb, ${npc.color} 10%, var(--panel))`
                        : 'var(--panel)',
                      border: `1px solid ${active ? npc.color + '70' : 'var(--border)'}`,
                      cursor: 'pointer',
                    }}
                  >
                    {/* Corner ornaments when active */}
                    {active && (
                      <>
                        <CornerOrnament
                          className="absolute"
                          style={{ top: -5, left: -5, color: npc.color } as React.CSSProperties}
                          size={10}
                        />
                        <CornerOrnament
                          className="absolute"
                          style={{ top: -5, right: -5, color: npc.color } as React.CSSProperties}
                          size={10}
                        />
                        <CornerOrnament
                          className="absolute"
                          style={{ bottom: -5, left: -5, color: npc.color } as React.CSSProperties}
                          size={10}
                        />
                        <CornerOrnament
                          className="absolute"
                          style={{ bottom: -5, right: -5, color: npc.color } as React.CSSProperties}
                          size={10}
                        />
                      </>
                    )}

                    {/* Seal */}
                    <div className="mb-4">
                      <npc.Seal active={active} />
                    </div>

                    {/* Name */}
                    <p
                      style={{
                        fontFamily: 'var(--body-kr)',
                        fontWeight: 600,
                        fontSize: '0.9375rem',
                        color: active ? npc.color : 'var(--parchment)',
                        marginBottom: '0.4rem',
                        lineHeight: 1.3,
                      }}
                    >
                      {npc.name}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--display)',
                        fontSize: '0.58rem',
                        letterSpacing: '0.1em',
                        color: active ? npc.color : 'var(--ink)',
                        textTransform: 'uppercase',
                        marginBottom: '0.75rem',
                        opacity: 0.8,
                      }}
                    >
                      {npc.title}
                    </p>
                    <p
                      style={{
                        fontFamily: 'var(--body-kr)',
                        fontSize: '0.8rem',
                        color: 'var(--ink)',
                        lineHeight: 1.6,
                      }}
                    >
                      {npc.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <p
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '0.8rem',
                color: '#9B2D20',
                textAlign: 'center',
              }}
            >
              {error}
            </p>
          )}

          {/* Submit */}
          <div className="flex justify-center pt-2">
            <button
              type="submit"
              disabled={loading || !selectedNPC || !name.trim()}
              className="btn-primary"
              style={{ padding: '11px 48px' }}
            >
              {loading ? '전설을 시작하는 중...' : '얼담 시작하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
