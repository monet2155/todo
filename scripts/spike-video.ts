/**
 * Spike: 영상 파이프라인 검증 스크립트
 *
 * 실행: npx tsx scripts/spike-video.ts
 *
 * 요구사항:
 *   RUNWAY_API_KEY, ELEVENLABS_API_KEY, SHOTSTACK_API_KEY 환경변수
 *
 * 결과를 scripts/spike-results.md 에 기록한다.
 */

import fs from 'fs/promises'
import path from 'path'
import { createRunwayClient } from '../lib/runway'
import { createElevenLabsClient } from '../lib/elevenlabs'
import { createShotstackClient } from '../lib/shotstack'

const SAMPLE_VISUAL_PROMPT =
  'medieval kingdom panorama, golden dawn, epic wide shot, cinematic, fantasy art style'
const SAMPLE_NARRATION =
  '2026년 4월, 한 용사의 전설이 시작되었다.'
const DURATION_SECONDS = 5

async function main() {
  const results: Record<string, unknown> = {}
  const start = Date.now()

  console.log('=== Chronicles 영상 파이프라인 스파이크 ===\n')

  // ── Step 1: Runway 클립 생성 ─────────────────────────────────
  console.log('[1/3] Runway Gen-3 클립 생성 중...')
  const runway = createRunwayClient()
  const clipStart = Date.now()

  const taskId = await runway.generateClip({
    promptText: SAMPLE_VISUAL_PROMPT,
    durationSeconds: DURATION_SECONDS,
  })
  console.log(`  Task ID: ${taskId}`)

  const clipUrl = await runway.pollTask(taskId)
  results.runway = {
    durationMs: Date.now() - clipStart,
    clipUrl,
  }
  console.log(`  완료: ${clipUrl} (${results.runway.durationMs}ms)\n`)

  // ── Step 2: ElevenLabs 나레이션 생성 ────────────────────────
  console.log('[2/3] ElevenLabs 나레이션 생성 중...')
  const el = createElevenLabsClient()
  const ttsStart = Date.now()

  const audioBuffer = await el.synthesize({ text: SAMPLE_NARRATION })
  // 임시 파일에 저장 (Shotstack은 URL 필요 → 실제 사용 시 Storage에 업로드)
  const audioPath = path.join(process.cwd(), 'scripts', 'spike-narration.mp3')
  await fs.writeFile(audioPath, Buffer.from(audioBuffer))
  results.elevenlabs = {
    durationMs: Date.now() - ttsStart,
    sizeBytes: audioBuffer.byteLength,
    localPath: audioPath,
  }
  console.log(`  완료: ${audioBuffer.byteLength} bytes (${results.elevenlabs.durationMs}ms)`)
  console.log(`  저장: ${audioPath}\n`)

  // ── Step 3: Shotstack 영상 조립 ──────────────────────────────
  // 주의: Shotstack은 public URL이 필요. 스파이크에서는 클립 URL만 사용.
  console.log('[3/3] Shotstack 영상 조립 중...')
  const shotstack = createShotstackClient()
  const assembleStart = Date.now()

  // 스파이크: 나레이션 대신 sample public audio로 테스트
  const SAMPLE_AUDIO_URL = 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/music/unminus/berlin.mp3'

  const renderId = await shotstack.render({
    clips: [{ videoUrl: clipUrl, durationSeconds: DURATION_SECONDS }],
    audioUrl: SAMPLE_AUDIO_URL,
  })
  console.log(`  Render ID: ${renderId}`)

  const videoUrl = await shotstack.pollRender(renderId)
  results.shotstack = {
    durationMs: Date.now() - assembleStart,
    videoUrl,
  }
  console.log(`  완료: ${videoUrl} (${results.shotstack.durationMs}ms)\n`)

  // ── 결과 기록 ────────────────────────────────────────────────
  const totalMs = Date.now() - start
  const report = `# Spike Results: 영상 파이프라인

실행일: ${new Date().toISOString()}

## 결과 요약

| 단계 | 소요 시간 |
|---|---|
| Runway 클립 생성 | ${results.runway.durationMs}ms |
| ElevenLabs 나레이션 | ${results.elevenlabs.durationMs}ms |
| Shotstack 조립 | ${results.shotstack.durationMs}ms |
| **총합** | **${totalMs}ms (${(totalMs / 60000).toFixed(1)}분)** |

## 출력

- 클립 URL: ${results.runway.clipUrl}
- 나레이션: ${results.elevenlabs.sizeBytes} bytes
- 최종 영상: ${results.shotstack.videoUrl}

## Go/No-Go 판정

> 영상당 비용 $1 초과 or 생성 10분 초과 시 fallback 전환

총 생성 시간: ${(totalMs / 60000).toFixed(1)}분 → ${totalMs < 600_000 ? '✅ GO' : '❌ NO-GO (시간 초과 → fallback)'}
`

  const reportPath = path.join(process.cwd(), 'scripts', 'spike-results.md')
  await fs.writeFile(reportPath, report)
  console.log(`보고서 저장: ${reportPath}`)
  console.log(`\n총 소요 시간: ${(totalMs / 1000).toFixed(1)}초`)
}

main().catch((err) => {
  console.error('스파이크 실패:', err)
  process.exit(1)
})
