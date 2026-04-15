'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { NPCType } from '@/types'

const NPC_OPTIONS: { type: NPCType; name: string; desc: string; icon: string }[] = [
  {
    type: 'knight',
    name: '기사단장',
    desc: '충성스럽고 진지하게 당신을 보좌합니다. 스탯이 낮으면 걱정하고, 높으면 칭찬합니다.',
    icon: '⚔️',
  },
  {
    type: 'rival',
    name: '츤데레 라이벌',
    desc: '도발적이지만 결국 응원합니다. 실패하면 비웃다가... 결국 격려합니다.',
    icon: '🗡️',
  },
  {
    type: 'sage',
    name: '현자 스승',
    desc: '철학적이고 은유적입니다. 모든 걸 교훈으로 포장합니다.',
    icon: '📜',
  },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [selectedNPC, setSelectedNPC] = useState<NPCType | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

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

    // profiles 생성
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

    // stats 초기화
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
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-yellow-400">영웅 등록</h1>
          <p className="text-gray-400 mt-2">당신의 이름과 동료를 선택하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 이름 */}
          <div>
            <label className="block text-sm text-gray-300 mb-1">영웅의 이름</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              placeholder="홍길동"
            />
          </div>

          {/* NPC 선택 */}
          <div>
            <label className="block text-sm text-gray-300 mb-3">동반 NPC 선택</label>
            <div className="space-y-3">
              {NPC_OPTIONS.map((npc) => (
                <button
                  key={npc.type}
                  type="button"
                  onClick={() => setSelectedNPC(npc.type)}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedNPC === npc.type
                      ? 'border-yellow-400 bg-yellow-400/10'
                      : 'border-gray-700 bg-gray-800 hover:border-gray-500'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{npc.icon}</span>
                    <div>
                      <div className="font-semibold text-white">{npc.name}</div>
                      <div className="text-sm text-gray-400 mt-0.5">{npc.desc}</div>
                    </div>
                    {selectedNPC === npc.type && (
                      <span className="ml-auto text-yellow-400">✓</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading || !selectedNPC || !name.trim()}
            className="w-full py-3 bg-yellow-400 text-gray-950 font-bold rounded-lg hover:bg-yellow-300 disabled:opacity-40 transition-colors"
          >
            {loading ? '전설을 시작하는 중...' : '전설 시작하기'}
          </button>
        </form>
      </div>
    </div>
  )
}
