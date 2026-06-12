'use client'

import { createElement } from 'react'
import { Gift } from 'lucide-react'

import { useTheme } from '@/app/theme-provider'

export function CTA() {
  const { theme } = useTheme()

  return createElement(
    'section',
    { className: 'px-4 py-24 transition-colors', style: { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#201515' } },
    createElement('div', { className: 'mx-auto max-w-4xl' },
      createElement('div', { className: 'relative overflow-hidden rounded-[12px] p-12 text-center md:p-16' },
        createElement('div', { className: 'relative z-10' },
          createElement('h2', { className: 'mb-6 text-4xl font-semibold transition-colors sm:text-5xl', style: { color: theme === 'dark' ? '#f5f5f0' : '#fffefb' } }, 'Ready to Ace Your Interview?'),
          createElement('p', { className: 'mx-auto mb-10 max-w-2xl text-lg transition-colors', style: { color: theme === 'dark' ? '#d0d0c5' : '#c5c0b1' } }, 'Join thousands of candidates who have transformed their interview preparation experience with Interview Arena.'),
          createElement('div', { className: 'flex flex-col justify-center gap-4 sm:flex-row' },
            createElement('button', { className: 'rounded-[12px] px-8 py-4 text-lg font-semibold transition-colors', style: { backgroundColor: '#ff4f00', color: '#fffefb' }, onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#e64500' }, onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#ff4f00' }, type: 'button' }, 'Get Started Free'),
            createElement('button', { className: 'rounded-[12px] border-2 px-8 py-4 text-lg font-semibold transition-colors', style: { borderColor: '#ff4f00', color: '#ff4f00', backgroundColor: theme === 'dark' ? '#1a1a1a' : '#201515' }, onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = theme === 'dark' ? '#2a2a2a' : '#2a2620' }, onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1a1a1a' : '#201515' }, type: 'button' }, 'Schedule Demo')
          ),
          createElement('div', { className: 'mt-8 flex items-center justify-center gap-2 text-base transition-colors', style: { color: theme === 'dark' ? '#939084' : '#939084' } }, createElement(Gift, { size: 18 }), createElement('span', null, 'First 7 days free. No credit card required.'))
        )
      )
    )
  )
}