import type { Metadata } from 'next'
import { Cinzel, Cinzel_Decorative, Inter } from 'next/font/google'
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
    <html lang="ko" className={`${cinzel.variable} ${cinzelDeco.variable} ${inter.variable}`}>
      <head>
        {/* Korean display font: Hahmlet (brush-stroke serif) + Noto Sans KR (body) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@400;600;700&family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          :root {
            --font-hahmlet: 'Hahmlet';
            --font-noto: 'Noto Sans KR';
          }
        `}</style>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
