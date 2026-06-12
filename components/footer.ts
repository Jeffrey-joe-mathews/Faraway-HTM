'use client'

import { createElement } from 'react'
import { Zap } from 'lucide-react'

import { useTheme } from '@/app/theme-provider'

export function Footer() {
  const { theme } = useTheme()

  const linkStyle = { color: theme === 'dark' ? '#a0a090' : '#939084' }
  const hoverColor = theme === 'dark' ? '#d0d0c5' : '#c5c0b1'

  const link = (label: string) => createElement('a', { href: '#', className: 'transition', style: linkStyle, onMouseEnter: (e) => { e.currentTarget.style.color = hoverColor }, onMouseLeave: (e) => { e.currentTarget.style.color = linkStyle.color } }, label)

  return createElement(
    'footer',
    { className: 'px-4 py-16 transition-colors', style: { backgroundColor: theme === 'dark' ? '#1a1a1a' : '#201515' } },
    createElement('div', { className: 'mx-auto max-w-6xl' },
      createElement('div', { className: 'mb-16 grid grid-cols-1 gap-12 md:grid-cols-4' },
        createElement('div', null,
          createElement('div', { className: 'mb-4 flex items-center gap-2' },
            createElement('div', { className: 'flex h-6 w-6 items-center justify-center rounded-md font-bold text-sm', style: { backgroundColor: '#ff4f00', color: '#fffefb' } }, createElement(Zap, { size: 14 })),
            createElement('span', { className: 'font-semibold transition-colors', style: { color: theme === 'dark' ? '#f5f5f0' : '#fffefb' } }, 'Interview Arena')
          ),
          createElement('p', { className: 'text-sm transition-colors', style: { color: theme === 'dark' ? '#a0a090' : '#939084' } }, 'Gamified AI-powered interview preparation.')
        ),
        createElement('div', null, createElement('h4', { className: 'mb-4 font-semibold transition-colors', style: { color: theme === 'dark' ? '#f5f5f0' : '#fffefb' } }, 'Product'), createElement('ul', { className: 'space-y-2 text-sm' }, createElement('li', null, link('Features')), createElement('li', null, link('Pricing')), createElement('li', null, link('Blog')))),
        createElement('div', null, createElement('h4', { className: 'mb-4 font-semibold transition-colors', style: { color: theme === 'dark' ? '#f5f5f0' : '#fffefb' } }, 'Company'), createElement('ul', { className: 'space-y-2 text-sm' }, createElement('li', null, link('About')), createElement('li', null, link('Careers')), createElement('li', null, link('Contact')))),
        createElement('div', null, createElement('h4', { className: 'mb-4 font-semibold transition-colors', style: { color: theme === 'dark' ? '#f5f5f0' : '#fffefb' } }, 'Legal'), createElement('ul', { className: 'space-y-2 text-sm' }, createElement('li', null, link('Privacy')), createElement('li', null, link('Terms')), createElement('li', null, link('Cookies'))))
      ),
      createElement('div', { className: 'flex flex-col items-center justify-between border-t pt-8 text-sm transition-colors sm:flex-row', style: { color: theme === 'dark' ? '#a0a090' : '#939084', borderTop: `1px solid ${theme === 'dark' ? '#2a2a2a' : '#2f2a26'}` } }, createElement('p', null, '© 2026 Interview Arena. All rights reserved.'), createElement('div', { className: 'mt-6 flex gap-6 sm:mt-0' }, link('𝕏'), link('LinkedIn'), link('Discord')))
    )
  )
}