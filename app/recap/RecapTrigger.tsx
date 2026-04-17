'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  weekNumber: number
  year: number
  existingRecapId?: string
}

export default function RecapTrigger({ weekNumber, year, existingRecapId }: Props) {
  const router  = useRouter()
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleCreate() {
    setLoading(true)
    setError('')

    try {
      let recapId = existingRecapId

      if (!recapId) {
        const scriptRes = await fetch('/api/recap/script', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ week_number: weekNumber, year }),
        })

        if (!scriptRes.ok) {
          const { error: err } = await scriptRes.json().catch(() => ({ error: '스크립트 생성 실패' }))
          throw new Error(err)
        }

        const script    = await scriptRes.json()
        const recapRes  = await fetch('/api/recap', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ week_number: weekNumber, year, script }),
        })

        if (!recapRes.ok) throw new Error('회고 생성 실패')
        const recap = await recapRes.json()
        recapId = recap.id
      }

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
        className="btn-primary"
        style={{ padding: '9px 24px' }}
      >
        {loading ? '전설을 소환하는 중...' : '이번 주 전설 만들기'}
      </button>
      {error && (
        <p style={{ fontFamily: 'var(--body-kr)', fontSize: '0.8rem', color: '#9B2D20' }}>
          {error}
        </p>
      )}
    </div>
  )
}
