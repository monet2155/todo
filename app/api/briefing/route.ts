import { createServerSupabaseClient } from '@/lib/supabase-server'
import { createAnthropicClient, DEFAULT_MODEL } from '@/lib/anthropic'
import { buildNPCPrompt } from '@/lib/prompts/npc'
import type { NPCType, QuestGrade, StatType } from '@/types'

const NPC_TYPES: NPCType[] = ['knight', 'rival', 'sage']

type QuestInput = {
  title: string
  stat_type: StatType
  grade: QuestGrade
  due_date: string | null
}

type StatsInput = {
  strength: number
  intelligence: number
  charisma: number
}

// POST /api/briefing — streams NPC dialogue (text/event-stream)
export async function POST(request: Request): Promise<Response> {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return Response.json({ error: 'unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  if (!body) {
    return Response.json({ error: 'invalid json' }, { status: 400 })
  }

  const { npc_type, quests, stats } = body as {
    npc_type?: unknown
    quests?: unknown
    stats?: unknown
  }

  if (!npc_type || !NPC_TYPES.includes(npc_type as NPCType)) {
    return Response.json({ error: 'invalid npc_type' }, { status: 400 })
  }
  if (!stats || typeof stats !== 'object') {
    return Response.json({ error: 'stats is required' }, { status: 400 })
  }

  const questList: QuestInput[] = Array.isArray(quests) ? quests : []
  const overdueCount = questList.filter(
    (q) => q.due_date && new Date(q.due_date) < new Date(),
  ).length

  const { systemPrompt, userMessage } = buildNPCPrompt(
    npc_type as NPCType,
    questList,
    stats as StatsInput,
    overdueCount,
  )

  const anthropic = createAnthropicClient()

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      try {
        const claudeStream = anthropic.messages.stream({
          model: DEFAULT_MODEL,
          max_tokens: 1024,
          system: [
            {
              type: 'text',
              text: systemPrompt,
              cache_control: { type: 'ephemeral' },
            },
          ],
          messages: [{ role: 'user', content: userMessage }],
        })

        for await (const event of claudeStream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`,
              ),
            )
          }
        }

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      } catch (err) {
        console.error('[briefing] stream error:', err)
        const message = err instanceof Error ? err.message : 'stream error'
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`),
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    status: 200,
    headers: {
      'content-type': 'text/event-stream',
      'cache-control': 'no-cache',
      connection: 'keep-alive',
    },
  })
}
