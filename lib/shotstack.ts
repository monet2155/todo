// Shotstack video assembly API client
// Docs: https://shotstack.io/docs/api/

export type ShotstackClip = {
  videoUrl: string
  durationSeconds: number
}

export type ShotstackRenderParams = {
  clips: ShotstackClip[]
  audioUrl: string
  outputFps?: number
}

export type ShotstackStatus = {
  id: string
  status: 'queued' | 'fetching' | 'rendering' | 'saving' | 'done' | 'failed'
  url?: string
  error?: string
}

export class ShotstackClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.shotstack.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async render(params: ShotstackRenderParams): Promise<string> {
    let offset = 0

    const tracks = [
      {
        clips: params.clips.map((clip) => {
          const start = offset
          offset += clip.durationSeconds
          return {
            asset: { type: 'video', src: clip.videoUrl },
            start,
            length: clip.durationSeconds,
          }
        }),
      },
      {
        clips: [
          {
            asset: { type: 'audio', src: params.audioUrl },
            start: 0,
            length: offset,
          },
        ],
      },
    ]

    const res = await fetch(`${this.baseUrl}/render`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        timeline: { tracks },
        output: {
          format: 'mp4',
          resolution: 'hd',
          fps: params.outputFps ?? 24,
        },
      }),
    })

    if (!res.ok) {
      throw new Error(`Shotstack render failed: ${res.status} ${await res.text()}`)
    }

    const data = (await res.json()) as { response: { id: string } }
    return data.response.id
  }

  async pollRender(renderId: string, maxAttempts = 60, intervalMs = 10000): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      const res = await fetch(`${this.baseUrl}/render/${renderId}`, {
        headers: { 'x-api-key': this.apiKey },
      })

      if (!res.ok) throw new Error(`Shotstack poll failed: ${res.status}`)

      const data = (await res.json()) as { response: ShotstackStatus }
      const status = data.response

      if (status.status === 'done' && status.url) return status.url
      if (status.status === 'failed') throw new Error(`Shotstack failed: ${status.error ?? 'unknown'}`)

      await new Promise((r) => setTimeout(r, intervalMs))
    }

    throw new Error(`Shotstack render timed out after ${maxAttempts} attempts`)
  }
}

export function createShotstackClient(): ShotstackClient {
  const apiKey = process.env.SHOTSTACK_API_KEY
  if (!apiKey) throw new Error('SHOTSTACK_API_KEY is not set')
  return new ShotstackClient(apiKey)
}
