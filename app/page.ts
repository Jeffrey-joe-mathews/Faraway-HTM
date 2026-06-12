'use client'

import { createElement, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { HowItWorks } from '@/components/how-it-works'
import { Stats } from '@/components/stats'
import { CTA } from '@/components/cta'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/auth-modal'
import { OnboardingFlow, type OnboardingData } from '@/components/onboarding-flow'
import { useTheme } from '@/app/theme-provider'

export default function Home() {
  const router = useRouter()
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const [userName, setUserName] = useState<string>('')
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignInClick = (): void => setIsAuthModalOpen(true)
  const handleCloseAuthModal = (): void => setIsAuthModalOpen(false)
  const handleAuthSuccess = (userData: { email: string; name: string }): void => {
    setUserName(userData.name)
    setIsOnboardingOpen(true)
  }

  const handleOnboardingComplete = (data: OnboardingData): void => {
    const userOnboardingData = { name: userName, goal: data.goal, userType: data.userType, problems: data.problems }
    localStorage.setItem('userOnboardingData', JSON.stringify(userOnboardingData))
    setIsOnboardingOpen(false)
    router.push('/dashboard')
  }

  const handleOnboardingSkip = (): void => {
    setIsOnboardingOpen(false)
    const userOnboardingData = { name: userName, goal: 'Not specified', userType: 'Not specified', problems: [] }
    localStorage.setItem('userOnboardingData', JSON.stringify(userOnboardingData))
    router.push('/dashboard')
  }

  const shell = createElement(
    'main',
    { className: 'min-h-screen bg-gradient-to-b from-background via-background to-primary/5' },
    createElement(Navbar, { onSignInClick: handleSignInClick }),
    createElement(Hero, null),
    createElement(Stats, null),
    createElement(Features, null),
    createElement(HowItWorks, null),
    createElement(CTA, null),
    createElement(Footer, null),
    createElement(AuthModal, { isOpen: isAuthModalOpen, onClose: handleCloseAuthModal, theme, onAuthSuccess: handleAuthSuccess }),
    createElement(OnboardingFlow, { isOpen: isOnboardingOpen, onComplete: handleOnboardingComplete, onSkip: handleOnboardingSkip }),
  )

  if (!mounted) return shell
  return shell
}