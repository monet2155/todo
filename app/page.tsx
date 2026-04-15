import { redirect } from 'next/navigation'

// 루트 "/" → /dashboard (미들웨어가 미인증 시 /login으로 처리)
export default function Home() {
  redirect('/dashboard')
}
