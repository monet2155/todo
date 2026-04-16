// ElevenLabs TTS API client
// Docs: https://elevenlabs.io/docs/api-reference

export type ElevenLabsParams = {
  text: string
  voiceId?: string
  modelId?: string
}

// Korean-capable multilingual voice (default)
const DEFAULT_VOICE_ID = 'pNInz6obpgDQGcFmaJgB' // Adam (multilingual)
const DEFAULT_MODEL_ID = 'eleven_multilingual_v2'

export class ElevenLabsClient {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.elevenlabs.io/v1'

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async synthesize(params: ElevenLabsParams): Promise<ArrayBuffer> {
    const voiceId = params.voiceId ?? DEFAULT_VOICE_ID

    const res = await fetch(`${this.baseUrl}/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        Accept: 'audio/mpeg',
      },
      body: JSON.stringify({
        text: params.text,
        model_id: params.modelId ?? DEFAULT_MODEL_ID,
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    })

    if (!res.ok) {
      throw new Error(`ElevenLabs TTS failed: ${res.status} ${await res.text()}`)
    }

    return res.arrayBuffer()
  }
}

export function createElevenLabsClient(): ElevenLabsClient {
  const apiKey = process.env.ELEVENLABS_API_KEY
  if (!apiKey) throw new Error('ELEVENLABS_API_KEY is not set')
  return new ElevenLabsClient(apiKey)
}
