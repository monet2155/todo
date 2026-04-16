'use client'

import { buildShareText, buildTwitterShareUrl } from '@/lib/share'

type Props = {
  title: string
  shareUrl: string
}

export default function ShareButtons({ title, shareUrl }: Props) {
  const shareText = buildShareText(title, shareUrl)
  const twitterUrl = buildTwitterShareUrl(shareText)

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl)
    alert('링크가 복사되었습니다!')
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">내 전설 공유하기</h2>
      <div className="flex flex-wrap gap-3">
        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-sky-500 text-white font-semibold rounded-lg hover:bg-sky-400 transition-colors text-sm"
        >
          X(트위터)에 공유
        </a>
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 bg-gray-700 text-gray-100 font-semibold rounded-lg hover:bg-gray-600 transition-colors text-sm"
        >
          링크 복사
        </button>
      </div>
    </div>
  )
}
