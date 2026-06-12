'use client'

import Link from 'next/link'
import { Moon, Sun, Zap } from 'lucide-react'
import { useTheme } from '@/app/theme-provider'
import { useEffect, useState } from 'react'

interface NavbarProps {
  onSignInClick?: () => void
}

export function Navbar({ onSignInClick }: NavbarProps) {
  const [mounted, setMounted] = useState<boolean>(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  const navBgColor: string = mounted ? (theme === 'dark' ? '#1a1a1a' : '#fffefb') : '#1a1a1a'
  const navBorderColor: string = mounted ? (theme === 'dark' ? '#6a6a60' : '#c5c0b1') : '#6a6a60'
  const textColor: string = mounted ? (theme === 'dark' ? '#f5f5f0' : '#201515') : '#f5f5f0'
  const linkColor: string = mounted ? (theme === 'dark' ? '#a0a090' : '#605d52') : '#a0a090'
  const linkHoverColor: string = mounted ? (theme === 'dark' ? '#d0d0c5' : '#201515') : '#d0d0c5'
  const themeBgColor: string = mounted ? (theme === 'dark' ? '#2a2a2a' : '#f8f4f0') : '#2a2a2a'

  return (
    <nav className="sticky top-0 z-50 w-full border-b transition-colors" style={{ 
      backgroundColor: navBgColor,
      borderColor: navBorderColor 
    }}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-lg transition-colors" style={{ backgroundColor: '#ff4f00', color: '#fffefb' }}>
            <Zap size={18} />
          </div>
          <span className="text-lg font-semibold transition-colors" style={{ color: textColor }}>Interview Arena</span>
        </div>
        
        <div className="flex items-center gap-8">
          <div className="hidden gap-8 md:flex">
            <Link href="#features" className="text-sm transition-colors" style={{ color: linkColor }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = linkHoverColor)} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = linkColor)}>
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm transition-colors" style={{ color: linkColor }} onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = linkHoverColor)} onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement>) => (e.currentTarget.style.color = linkColor)}>
              How it works
            </Link>
          </div>
          
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-[8px] transition-colors"
            style={{ 
              backgroundColor: themeBgColor,
              color: '#ff4f00'
            }}
            title="Toggle theme"
            type="button"
          >
            {mounted && theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button 
            onClick={onSignInClick}
            className="rounded-[12px] px-6 py-3 text-sm font-semibold transition-colors" 
            style={{ backgroundColor: '#ff4f00', color: '#fffefb' }} 
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#e64500')} 
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => (e.currentTarget.style.backgroundColor = '#ff4f00')}
            type="button"
          >
            Sign In
          </button>
        </div>
      </div>
    </nav>
  )
}
