'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/navbar'
import { Hero } from '@/components/hero'
import { Features } from '@/components/features'
import { HowItWorks } from '@/components/how-it-works'
import { Stats } from '@/components/stats'
import { CTA } from '@/components/cta'
import { Footer } from '@/components/footer'
import { AuthModal } from '@/components/auth-modal'
import { useTheme } from '@/app/theme-provider'

export default function Home(): JSX.Element {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)
  const [mounted, setMounted] = useState<boolean>(false)
  const { theme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignInClick = (): void => {
    setIsAuthModalOpen(true)
  }

  const handleCloseAuthModal = (): void => {
    setIsAuthModalOpen(false)
  }

  if (!mounted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
        <Navbar onSignInClick={handleSignInClick} />
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <CTA />
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      <Navbar onSignInClick={handleSignInClick} />
      <Hero />
      <Stats />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
      <AuthModal isOpen={isAuthModalOpen} onClose={handleCloseAuthModal} theme={theme} />
    </main>
  )
}
