'use client'

import { createElement } from 'react'

import { useTheme } from '@/app/theme-provider'

export function HowItWorks() {
  const steps = [
    { number: '01', title: 'Choose Your Path', description: 'Select your interview role and experience level to get personalized preparation.' },
    { number: '02', title: 'Face AI Interviews', description: 'Practice with AI agents that challenge you with realistic interview scenarios.' },
    { number: '03', title: 'Get Instant Feedback', description: 'Receive detailed AI-powered analysis of your performance and areas to improve.' },
    { number: '04', title: 'Level Up & Unlock', description: 'Earn rewards, unlock achievements, and progress through increasingly challenging interviews.' },
  ]

  const { theme } = useTheme()

  return createElement(
    'section',
    { className: 'relative overflow-hidden px-4 py-24 transition-colors', style: { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fffefb' } },
    createElement(
      'div',
      { className: 'mx-auto max-w-6xl' },
      createElement('div', { className: 'mb-20 text-center' },
        createElement('h2', { className: 'mb-6 text-4xl font-semibold transition-colors sm:text-5xl', style: { color: theme === 'dark' ? '#f5f5f0' : '#201515' } }, 'How Interview Arena Works'),
        createElement('p', { className: 'mx-auto max-w-2xl text-lg transition-colors', style: { color: theme === 'dark' ? '#d0d0c5' : '#605d52' } }, 'A streamlined approach to interview preparation that keeps you engaged without burning you out.')
      ),
      createElement(
        'div',
        { className: 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4' },
        ...steps.map((step, index) =>
          createElement(
            'div',
            { key: index, className: 'relative' },
            index < steps.length - 1 ? createElement('div', { className: 'absolute top-24 left-full hidden h-1 w-6 transition-colors lg:block', style: { backgroundColor: theme === 'dark' ? '#6a6a60' : '#c5c0b1' } }) : null,
            createElement('div', { className: 'relative h-full rounded-[12px] p-8 transition-colors', style: { backgroundColor: theme === 'dark' ? '#2a2a2a' : '#f8f4f0' } },
              createElement('div', { className: 'mb-4 text-4xl font-semibold transition-colors', style: { color: theme === 'dark' ? '#939084' : '#c5c0b1' } }, step.number),
              createElement('h3', { className: 'mb-3 text-xl font-semibold transition-colors', style: { color: theme === 'dark' ? '#f5f5f0' : '#201515' } }, step.title),
              createElement('p', { className: 'leading-relaxed transition-colors', style: { color: theme === 'dark' ? '#d0d0c5' : '#605d52' } }, step.description)
            )
          )
        )
      )
    )
  )
}