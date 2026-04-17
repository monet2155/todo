'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div
      className="min-h-screen flex"
      style={{ background: 'var(--lacquer)' }}
    >
      {/* Left panel — brand */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] px-14 py-12 relative"
        style={{
          background: 'var(--panel)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Background diamond grid visible here */}
        <div>
          <h1
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '2.5rem',
              fontWeight: 700,
              color: 'var(--parchment)',
              lineHeight: 1,
              marginBottom: '0.75rem',
            }}
          >
            얼담
          </h1>
          <p
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '1rem',
              color: 'var(--ink)',
              lineHeight: 1.7,
            }}
          >
            당신의 얼을 담다
          </p>
        </div>

        {/* Center decorative mark */}
        <div className="flex-1 flex items-center justify-center">
          <svg
            width="120" height="120" viewBox="0 0 120 120"
            fill="none"
            style={{ color: 'var(--gold)', opacity: 0.15 }}
            aria-hidden
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

        <p
          style={{
            fontFamily: 'var(--display)',
            fontSize: '0.68rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: 'var(--ink-dim)',
          }}
        >
          얼 — 한국인의 혼&nbsp;&nbsp;·&nbsp;&nbsp;담 — 이야기
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-6 lg:px-16">
        <div className="w-full max-w-sm animate-page-enter">

          {/* Mobile brand */}
          <div className="lg:hidden mb-8 text-center">
            <h1
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '2rem',
                fontWeight: 700,
                color: 'var(--parchment)',
              }}
            >
              얼담
            </h1>
            <p
              style={{
                fontFamily: 'var(--body-kr)',
                fontSize: '0.82rem',
                color: 'var(--ink)',
                marginTop: '0.25rem',
              }}
            >
              당신의 얼을 담다
            </p>
          </div>

          {/* Form heading */}
          <div className="mb-7">
            <h2
              style={{
                fontFamily: 'var(--display)',
                fontSize: '1.75rem',
                fontWeight: 300,
                color: 'var(--parchment)',
                letterSpacing: '0.02em',
                marginBottom: '0.25rem',
              }}
            >
              모험 재개
            </h2>
            <div
              style={{
                height: 1,
                background: 'linear-gradient(90deg, var(--gold), transparent)',
                opacity: 0.5,
                width: '3rem',
              }}
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  display: 'block',
                  marginBottom: '0.45rem',
                }}
              >
                이메일
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="field-base"
                placeholder="hero@eoldam.app"
              />
            </div>

            <div>
              <label
                style={{
                  fontFamily: 'var(--display)',
                  fontSize: '0.6rem',
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: 'var(--ink)',
                  display: 'block',
                  marginBottom: '0.45rem',
                }}
              >
                비밀번호
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="field-base"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                style={{
                  fontFamily: 'var(--body-kr)',
                  fontSize: '0.8rem',
                  color: '#9B2D20',
                }}
              >
                {error}
              </p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
                style={{ padding: '11px 0', textAlign: 'center' }}
              >
                {loading ? '확인 중...' : '모험 시작'}
              </button>
            </div>
          </form>

          <p
            style={{
              fontFamily: 'var(--body-kr)',
              fontSize: '0.8rem',
              color: 'var(--ink-dim)',
              textAlign: 'center',
              marginTop: '1.5rem',
            }}
          >
            계정이 없으신가요?&nbsp;
            <Link
              href="/signup"
              style={{
                color: 'var(--gold)',
                borderBottom: '1px solid color-mix(in srgb, var(--gold) 40%, transparent)',
                paddingBottom: '1px',
              }}
            >
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
