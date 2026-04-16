import { requireUser, getProfile } from '@/lib/auth'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import NPCDialog from '@/components/npc-dialog/NPCDialog'

export default async function BriefingPage() {
  const user = await requireUser()
  const profile = await getProfile(user.id)

  if (!profile) redirect('/onboarding')

  const supabase = createServerSupabaseClient()

  const [{ data: quests }, { data: stats }] = await Promise.all([
    supabase
      .from('quests')
      .select('title, stat_type, grade, due_date')
      .eq('user_id', user.id)
      .eq('status', 'active'),
    supabase.from('stats').select('strength, intelligence, charisma').eq('user_id', user.id).single(),
  ])

  return (
    <NPCDialog
      npcType={profile.npc_type}
      quests={quests ?? []}
      stats={stats ?? { strength: 0, intelligence: 0, charisma: 0 }}
    />
  )
}
