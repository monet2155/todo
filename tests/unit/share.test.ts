import { describe, it, expect } from 'vitest'
import { buildShareText, buildShareUrl } from '@/lib/share'

describe('buildShareText', () => {
  it('includes the recap title', () => {
    const text = buildShareText('CHRONICLES OF 홍길동 — 2026년 16주차', 'https://example.com/recap/123')
    expect(text).toContain('홍길동')
    expect(text).toContain('16주차')
  })

  it('includes the share URL', () => {
    const url = 'https://example.com/recap/abc'
    const text = buildShareText('Test', url)
    expect(text).toContain(url)
  })

  it('returns a non-empty string', () => {
    const text = buildShareText('Test Title', 'https://example.com')
    expect(text.length).toBeGreaterThan(0)
  })
})

describe('buildShareUrl', () => {
  it('builds correct URL for a recap ID', () => {
    const url = buildShareUrl('recap-123', 'https://myapp.com')
    expect(url).toBe('https://myapp.com/recap/recap-123')
  })

  it('handles base URL with trailing slash — no double slash in path', () => {
    const url = buildShareUrl('abc', 'https://example.com/')
    expect(url).not.toContain('//recap')
    expect(url).toContain('/recap/abc')
  })
})
