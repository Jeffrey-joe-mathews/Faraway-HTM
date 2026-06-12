'use client'

import { createElement } from 'react'
import { BarChart3, Bot, Gamepad2, Target, Trophy, Zap } from 'lucide-react'

import { useTheme } from '@/app/theme-provider'

export function Features() {
  const { theme } = useTheme()

  const features = [
    { icon: Bot, title: 'Multi-Agent AI System', description: 'Experience interviews with diverse AI personas that simulate real interviewer behaviors and question styles.' },
    { icon: Gamepad2, title: 'Gamified Learning', description: 'Earn points, unlock achievements, and level up your interview skills through engaging gamified challenges.' },
    { icon: Zap, title: 'Adaptive Difficulty', description: 'The system learns your weak areas and adjusts difficulty dynamically to maximize learning without overwhelming you.' },
    { icon: BarChart3, title: 'Real-Time Feedback', description: 'Get instant AI-powered feedback on your answers, body language, and communication to improve continuously.' },
    { icon: Target, title: 'Role-Specific Prep', description: 'Customize your interview prep for software engineering, product, design, and more with targeted question banks.' },
    { icon: Trophy, title: 'Progress Tracking', description: 'Visualize your improvement with detailed analytics and performance metrics across different interview categories.' },
  ]

  return createElement(
    'section',
    { className: 'relative px-4 py-24 transition-colors', style: { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f4f0' } },
    createElement(
      'div',
      { className: 'mx-auto max-w-6xl' },
      createElement(
        'div',
        { className: 'mb-20 text-center' },
        createElement('h2', { className: 'mb-6 text-4xl font-semibold transition-colors sm:text-5xl', style: { color: theme === 'dark' ? '#f5f5f0' : '#201515' } }, 'Designed for Success'),
        createElement('p', { className: 'mx-auto max-w-2xl text-lg transition-colors', style: { color: theme === 'dark' ? '#d0d0c5' : '#605d52' } }, 'Interview Arena combines cutting-edge AI with game psychology to create the ultimate interview preparation experience.')
      ),
      createElement(
        'div',
        { className: 'grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3' },
        ...features.map((feature, index) =>
          createElement(
            'div',
            {
              key: index,
              className: 'group relative overflow-hidden rounded-[12px] p-8 transition-all duration-300',
              style: { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fffefb' },
              onMouseEnter: (e) => { e.currentTarget.style.transform = 'translateY(-4px)' },
              onMouseLeave: (e) => { e.currentTarget.style.transform = 'translateY(0)' },
            },
            createElement('div', { className: 'relative z-10' },
              createElement('div', { className: 'mb-4 transition-colors', style: { color: '#ff4f00' } }, createElement(feature.icon, { size: 32 })),
              createElement('h3', { className: 'mb-3 text-xl font-semibold transition-colors', style: { color: theme === 'dark' ? '#f5f5f0' : '#201515' } }, feature.title),
              createElement('p', { className: 'leading-relaxed transition-colors', style: { color: theme === 'dark' ? '#d0d0c5' : '#605d52' } }, feature.description)
            )
          )
        )
      )
    )
  )
}