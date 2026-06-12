'use client'

import { createElement } from 'react'
import { Rocket, Sparkles } from 'lucide-react'

import { useTheme } from '@/app/theme-provider'

export function Hero() {
  const { theme } = useTheme()

  return createElement(
    'section',
    {
      className: 'relative flex min-h-screen items-center justify-center overflow-hidden pt-32 transition-colors',
      style: { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fffefb' },
    },
    createElement(
      'div',
      { className: 'relative z-10 mx-auto max-w-4xl px-4 text-center sm:px-6' },
      createElement(
        'div',
        {
          className: 'mb-8 inline-flex items-center gap-2 rounded-full px-4 py-2 transition-colors',
          style: { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f8f4f0' },
        },
        createElement('span', { className: 'text-sm font-medium transition-colors', style: { color: theme === 'dark' ? '#a0a090' : '#605d52' } }, 'AI-Powered Interview Mastery')
      ),
      createElement(
        'h1',
        { className: 'mb-6 text-5xl font-semibold leading-tight transition-colors sm:text-6xl', style: { color: theme === 'dark' ? '#f5f5f0' : '#201515' } },
        'Master Interviews Without Burnout'
      ),
      createElement(
        'p',
        { className: 'mx-auto mb-12 max-w-3xl text-xl leading-relaxed transition-colors sm:text-2xl', style: { color: theme === 'dark' ? '#d0d0c5' : '#605d52' } },
        'Unlike overwhelming mock interview apps, Interview Arena uses multi-agent AI and gamification to keep you interview-ready while actually having fun.'
      ),
      createElement(
        'div',
        { className: 'mb-12 flex flex-col justify-center gap-4 sm:flex-row' },
        createElement(
          'button',
          {
            className: 'rounded-[12px] px-8 py-4 text-lg font-semibold transition-colors',
            style: { backgroundColor: '#ff4f00', color: '#fffefb' },
            onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#e64500' },
            onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#ff4f00' },
            type: 'button',
          },
          'Start Free Trial'
        ),
        createElement(
          'button',
          {
            className: 'rounded-[12px] border-2 px-8 py-4 text-lg font-semibold transition-colors',
            style: {
              borderColor: theme === 'dark' ? '#d0d0c5' : '#201515',
              color: theme === 'dark' ? '#d0d0c5' : '#201515',
              backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fffefb',
            },
            onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = theme === 'dark' ? '#36342e' : '#f8f4f0' },
            onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#fffefb' },
            type: 'button',
          },
          'Watch Demo'
        )
      ),
      createElement(
        'div',
        { className: 'flex items-center justify-center gap-4 text-base transition-colors', style: { color: theme === 'dark' ? '#939084' : '#939084' } },
        createElement('div', { className: 'flex items-center gap-1' }, createElement(Sparkles, { size: 16 }), createElement('span', null, 'No credit card required')),
        createElement('span', null, '•'),
        createElement('div', { className: 'flex items-center gap-1' }, createElement(Rocket, { size: 16 }), createElement('span', null, 'Get started in seconds'))
      )
    )
  )
}