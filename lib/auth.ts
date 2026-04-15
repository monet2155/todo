import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'

/** 현재 세션 유저 반환. 없으면 /login으로 리다이렉트 */
export async function requireUser() {
  const supabase = createServerSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')
  return user
}

/** profiles 테이블에서 프로필 조회 */
export async function getProfile(userId: string) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  return data
}
