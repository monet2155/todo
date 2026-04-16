'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  weekNumber: number
  year: number
  existingRecapId?: string
}

export default function RecapTrigger({ weekNumber, year, existingRecapId }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')

    try {
      let recapId = existingRecapId

      if (!recapId) {
        // 새 recap 레코드 생성 (스크립트 먼저)
        const scriptRes = await fetch('/api/recap/script', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ week_number: weekNumber, year }),
        })

        if (!scriptRes.ok) {
          const { error: err } = await scriptRes.json().catch(() => ({ error: '스크립트 생성 실패' }))
          throw new Error(err)
        }

        const script = await scriptRes.json()

        // recap row 생성
        const recapRes = await fetch('/api/recap', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ week_number: weekNumber, year, script }),
        })

        if (!recapRes.ok) throw new Error('회고 생성 실패')
        const recap = await recapRes.json()
        recapId = recap.id
      }

      // 영상 생성 트리거
      const genRes = await fetch('/api/recap/generate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ recap_id: recapId }),
      })

      if (!genRes.ok) throw new Error('영상 생성 시작 실패')

      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleCreate}
        disabled={loading}
        className="px-5 py-2.5 bg-yellow-400 text-gray-950 font-semibold rounded-lg hover:bg-yellow-300 disabled:opacity-40 transition-colors"
      >
        {loading ? '전설을 소환하는 중...' : '이번 주 전설 만들기'}
      </button>
      {error && <p className="text-red-400 text-sm">{error}</p>}
    </div>
  )
}
