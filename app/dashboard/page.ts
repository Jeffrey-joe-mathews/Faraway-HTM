'use client'

import { createElement, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

import { useTheme } from '@/app/theme-provider'

interface DashboardUser {
  name: string
  goal: string
  userType: string
  problems: string[]
}

export default function Dashboard() {
  const router = useRouter()
  const { theme } = useTheme()
  const [userData, setUserData] = useState<DashboardUser | null>(null)

  useEffect(() => {
    const userDataStr = localStorage.getItem('userOnboardingData')

    if (!userDataStr) {
      return
    }

    try {
      setUserData(JSON.parse(userDataStr) as DashboardUser)
    } catch {
      localStorage.removeItem('userOnboardingData')
    }
  }, [])

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#fffefb'
  const cardBgColor = theme === 'dark' ? '#2a2a2a' : '#f8f4f0'
  const textColor = theme === 'dark' ? '#f5f5f0' : '#201515'
  const labelColor = theme === 'dark' ? '#d0d0c5' : '#605d52'

  const handleLogout = (): void => {
    localStorage.removeItem('userOnboardingData')
    router.push('/')
  }

  return createElement(
    'div',
    { className: 'min-h-screen', style: { backgroundColor: bgColor } },
    createElement('div', { className: 'border-b', style: { borderColor: theme === 'dark' ? '#2a2a2a' : '#e0ddd8' } },
      createElement('div', { className: 'mx-auto flex max-w-7xl items-center justify-between px-6 py-6' },
        createElement('h1', { className: 'text-3xl font-bold', style: { color: textColor } }, 'Interview Arena Dashboard'),
        createElement('button', { onClick: handleLogout, className: 'flex items-center gap-2 rounded-lg px-4 py-2 transition-colors', style: { backgroundColor: cardBgColor, color: '#ff4f00' }, type: 'button' }, createElement(LogOut, { size: 18 }), 'Logout')
      )
    ),
    createElement('div', { className: 'mx-auto max-w-7xl px-6 py-12' },
      userData ? createElement('div', { className: 'space-y-8' },
        createElement('div', { className: 'rounded-2xl p-8', style: { backgroundColor: cardBgColor } },
          createElement('h2', { className: 'mb-4 text-2xl font-semibold', style: { color: textColor } }, `Welcome, ${userData.name}! 👋`),
          createElement('p', { className: 'text-lg', style: { color: labelColor } }, "You're all set to start your interview preparation journey.")
        ),
        createElement('div', { className: 'grid grid-cols-1 gap-6 md:grid-cols-2' },
          createElement('div', { className: 'rounded-xl p-6', style: { backgroundColor: cardBgColor } },
            createElement('h3', { className: 'mb-3 text-sm font-semibold uppercase', style: { color: labelColor } }, 'Your Goal'),
            createElement('p', { className: 'text-lg font-medium', style: { color: textColor } }, userData.goal)
          ),
          createElement('div', { className: 'rounded-xl p-6', style: { backgroundColor: cardBgColor } },
            createElement('h3', { className: 'mb-3 text-sm font-semibold uppercase', style: { color: labelColor } }, 'Background'),
            createElement('p', { className: 'text-lg font-medium', style: { color: textColor } }, userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1))
          )
        ),
        createElement('div', { className: 'rounded-xl p-6', style: { backgroundColor: cardBgColor } },
          createElement('h3', { className: 'mb-4 text-sm font-semibold uppercase', style: { color: labelColor } }, 'Areas to Focus On'),
          createElement('div', { className: 'grid grid-cols-2 gap-3 md:grid-cols-4' },
            ...userData.problems.map((problem) =>
              createElement('div', { key: problem, className: 'rounded-lg border px-4 py-3 text-center text-sm font-medium', style: { backgroundColor: '#ff4f0015', color: '#ff4f00', border: '1px solid #ff4f00' } }, problem.charAt(0).toUpperCase() + problem.slice(1).replace('-', ' '))
            )
          )
        ),
        createElement('div', { className: 'rounded-2xl border p-8', style: { backgroundColor: '#ff4f0015', border: '2px solid #ff4f00' } },
          createElement('h3', { className: 'mb-4 text-xl font-semibold', style: { color: textColor } }, 'Next Steps'),
          createElement('ul', { className: 'space-y-3', style: { color: labelColor } },
            createElement('li', { className: 'flex items-start gap-3' }, createElement('span', { className: 'font-bold text-orange-500' }, '1.'), createElement('span', null, 'Take a practice interview based on your goal')),
            createElement('li', { className: 'flex items-start gap-3' }, createElement('span', { className: 'font-bold text-orange-500' }, '2.'), createElement('span', null, 'Get AI-powered feedback on your performance')),
            createElement('li', { className: 'flex items-start gap-3' }, createElement('span', { className: 'font-bold text-orange-500' }, '3.'), createElement('span', null, 'Focus on the areas that need improvement')),
            createElement('li', { className: 'flex items-start gap-3' }, createElement('span', { className: 'font-bold text-orange-500' }, '4.'), createElement('span', null, 'Track your progress and improve over time'))
          )
        ),
        createElement('button', { className: 'w-full rounded-xl py-4 font-semibold text-white transition-colors', style: { backgroundColor: '#ff4f00' }, onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#e64500' }, onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#ff4f00' }, type: 'button' }, 'Start Your First Practice Interview')
      ) : createElement('div', { className: 'py-12 text-center' },
        createElement('p', { className: 'mb-6 text-lg', style: { color: labelColor } }, 'Loading your profile...'),
        createElement('button', { onClick: () => { router.push('/') }, className: 'rounded-lg px-6 py-3 font-semibold', style: { backgroundColor: '#ff4f00', color: '#ffffff' }, type: 'button' }, 'Return to Home')
      )
    )
  )
}
