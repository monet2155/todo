import { requireUser, getProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'
import QuestBoard from '@/components/quest/QuestBoard'

export default async function DashboardPage() {
  const user = await requireUser()
  const profile = await getProfile(user.id)

  if (!profile) redirect('/onboarding')

  const supabase = createServerSupabaseClient()

  const [{ data: stats }, { data: quests }] = await Promise.all([
    supabase.from('stats').select('*').eq('user_id', user.id).single(),
    supabase
      .from('quests')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
  ])

  return (
    <div className="min-h-screen p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-yellow-400">
            {profile.name}의 모험
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {profile.npc_type === 'knight' && '⚔️ 기사단장과 함께'}
            {profile.npc_type === 'rival' && '🗡️ 라이벌과 함께'}
            {profile.npc_type === 'sage' && '📜 현자와 함께'}
          </p>
        </div>
        <LogoutButton />
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            { label: '체력', value: stats.strength, color: 'text-red-400' },
            { label: '지력', value: stats.intelligence, color: 'text-blue-400' },
            { label: '카리스마', value: stats.charisma, color: 'text-purple-400' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-800 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-sm mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <QuestBoard initialQuests={quests ?? []} />
    </div>
  )
}
