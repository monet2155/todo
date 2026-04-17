import type { Metadata } from 'next'
import {
  Cormorant_Garamond,
  DM_Mono,
  Lora,
  Hahmlet,
  Gowun_Batang,
} from 'next/font/google'
import './globals.css'

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})

const lora = Lora({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-lora',
  display: 'swap',
})

const hahmlet = Hahmlet({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-hahmlet',
  display: 'swap',
})

const gowunBatang = Gowun_Batang({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-gowun',
  display: 'swap',
})

export const metadata: Metadata = {
  title: '얼담',
  description: '당신의 얼로 쓰는 이야기',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`
        ${cormorant.variable}
        ${dmMono.variable}
        ${lora.variable}
        ${hahmlet.variable}
        ${gowunBatang.variable}
      `}
    >
      <body className="antialiased">{children}</body>
    </html>
  )
}
