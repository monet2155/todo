import type { Metadata } from 'next'
import { Cinzel, Cinzel_Decorative, Inter, Hahmlet, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const cinzel = Cinzel({
  subsets: ['latin'],
  variable: '--font-cinzel',
  display: 'swap',
})

const cinzelDeco = Cinzel_Decorative({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-cinzel-deco',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const hahmlet = Hahmlet({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-hahmlet',
  display: 'swap',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Chronicles of 나',
  description: '당신의 하루가 전설이 된다',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ko"
      className={`${cinzel.variable} ${cinzelDeco.variable} ${inter.variable} ${hahmlet.variable} ${notoSansKR.variable}`}
    >
      <body className="antialiased">{children}</body>
    </html>
  )
}
