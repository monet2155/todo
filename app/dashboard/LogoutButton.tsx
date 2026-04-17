'use client'

import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        fontFamily: 'var(--display)',
        fontSize: '0.6rem',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: 'var(--ink-dim)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        transition: 'color 150ms',
        padding: '4px 0',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--ink-dim)' }}
    >
      로그아웃
    </button>
  )
}
