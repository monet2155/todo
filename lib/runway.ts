// Runway ML Gen-3 Alpha API client
// Docs: https://docs.runwayml.com/

export type RunwayGenerateParams = {
  promptText: string
  durationSeconds: 3 | 5 | 10
  ratio?: '1280:720' | '720:1280' | '1104:832'
}

export type RunwayTask = {
  id: string
  status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED'
  output?: string[]
  failure?: string
}

export class RunwayClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.dev.runwayml.com/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generateClip(params: RunwayGenerateParams): Promise<string> {
    const res = await fetch(`${this.baseUrl}/image_to_video`, {
      method: 'POST',
      headers: {
        'X-Runway-Version': '2024-11-06',
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gen3a_turbo',
        promptText: params.promptText,
        duration: params.durationSeconds,
        ratio: params.ratio ?? '1280:720',
      }),
    })

    if (!res.ok) {
      throw new Error(`Runway generate failed: ${res.status} ${await res.text()}`)
    }

    const data = (await res.json()) as { id: string }
    return data.id
  }

  async pollTask(taskId: string, maxAttempts = 60, intervalMs = 5000): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const res = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        headers: {
          'X-Runway-Version': '2024-11-06',
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!res.ok) throw new Error(`Runway poll failed: ${res.status}`)

      const task = (await res.json()) as RunwayTask

      if (task.status === 'SUCCEEDED' && task.output?.[0]) {
        return task.output[0]
      }
      if (task.status === 'FAILED') {
        throw new Error(`Runway task failed: ${task.failure ?? 'unknown'}`)
      }

      await new Promise((r) => setTimeout(r, intervalMs))
    }

    throw new Error(`Runway task timed out after ${maxAttempts} attempts`)
  }
}

export function createRunwayClient(): RunwayClient {
  const apiKey = process.env.RUNWAY_API_KEY
  if (!apiKey) throw new Error('RUNWAY_API_KEY is not set')
  return new RunwayClient(apiKey)
}
