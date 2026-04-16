export function buildShareText(title: string, url: string): string {
  return `📜 ${title}\n\n내 일상이 전설이 되었다. 당신의 이번 주는 어떤 모험이었나요?\n\n${url}\n\n#ChroniclesOf나 #RPG일상 #전설의시작`
}

export function buildShareUrl(recapId: string, baseUrl: string): string {
  const base = baseUrl.replace(/\/$/, '')
  return `${base}/recap/${recapId}`
}

export function buildTwitterShareUrl(text: string): string {
  return `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`
}
