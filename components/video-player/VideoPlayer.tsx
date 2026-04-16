'use client'

import { useRef, useState } from 'react'

type Props = {
  url: string
  title: string
}

export default function VideoPlayer({ url, title }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <div className="relative w-full aspect-video bg-gray-950 rounded-xl overflow-hidden group">
      <video
        ref={videoRef}
        src={url}
        className="w-full h-full object-cover"
        playsInline
        onEnded={() => setPlaying(false)}
        title={title}
      />

      {/* 재생 버튼 오버레이 */}
      {!playing && (
        <button
          onClick={togglePlay}
          aria-label="재생"
          className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/20 transition-colors"
        >
          <span className="text-6xl text-white/90 drop-shadow-lg">▶</span>
        </button>
      )}

      {/* 일시정지 버튼 (재생 중) */}
      {playing && (
        <button
          onClick={togglePlay}
          aria-label="일시정지"
          className="absolute inset-0 opacity-0 group-hover:opacity-100 flex items-center justify-center bg-black/20 transition-opacity"
        >
          <span className="text-6xl text-white/90 drop-shadow-lg">⏸</span>
        </button>
      )}
    </div>
  )
}
