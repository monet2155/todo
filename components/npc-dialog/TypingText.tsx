'use client'

import { useState, useEffect, useRef } from 'react'

type Props = {
  text: string
  speedMs?: number
  onComplete?: () => void
}

export default function TypingText({ text, speedMs = 30, onComplete }: Props) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0

    if (!text) return

    const timer = setInterval(() => {
      if (indexRef.current >= text.length) {
        clearInterval(timer)
        onCompleteRef.current?.()
        return
      }
      indexRef.current++
      setDisplayed(text.slice(0, indexRef.current))
    }, speedMs)

    return () => clearInterval(timer)
  }, [text, speedMs])

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 bg-current animate-pulse ml-0.5 align-middle" />
      )}
    </span>
  )
}
