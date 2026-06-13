import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { createElement, type ReactElement, type ReactNode } from 'react'

import { ThemeProvider } from './theme-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Interview Arena | Gamified AI-Powered Interview Prep',
  description: 'Master interviews without the burnout. Interview Arena uses AI agents and gamification to keep you interview-ready while having fun.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>): ReactElement {
  return createElement(
    'html',
    { lang: 'en', className: 'dark bg-canvas' },
    createElement(
      'body',
      { className: 'font-sans antialiased text-ink' },
      createElement(ThemeProvider, null, children),
      process.env.NODE_ENV === 'production' ? createElement(Analytics) : null,
    ),
  )
}
