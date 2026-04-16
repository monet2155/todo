import Anthropic from '@anthropic-ai/sdk'

export function createAnthropicClient(): Anthropic {
  return new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
}

// Default model for this app — Sonnet 4.6 balances cost/quality for Korean
// 3~5 sentence briefings and JSON scene generation.
export const DEFAULT_MODEL = 'claude-sonnet-4-6'
