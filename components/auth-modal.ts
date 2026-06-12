'use client'

import { createElement, useState } from 'react'
import { X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  theme: 'light' | 'dark'
  onAuthSuccess?: (userData: { email: string; name: string }) => void
}

export function AuthModal({ isOpen, onClose, theme, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false)
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [fullName, setFullName] = useState<string>('')

  if (!isOpen) return null

  const bgColor = theme === 'dark' ? '#1a1a1a' : '#fffefb'
  const textColor = theme === 'dark' ? '#f5f5f0' : '#201515'
  const inputBgColor = theme === 'dark' ? '#2a2a2a' : '#f8f4f0'
  const inputBorderColor = theme === 'dark' ? '#6a6a60' : '#c5c0b1'
  const labelColor = theme === 'dark' ? '#d0d0c5' : '#605d52'

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault()
    if (onAuthSuccess) {
      onAuthSuccess({ email: email || 'user@example.com', name: fullName || 'User' })
    }
    onClose()
  }

  const fieldStyle = {
    backgroundColor: inputBgColor,
    borderColor: inputBorderColor,
    color: textColor,
    '--tw-ring-color': '#ff4f00',
  }

  return createElement(
    'div',
    { className: 'fixed inset-0 z-50 flex items-center justify-center bg-black/50', onClick: onClose },
    createElement(
      'div',
      { className: 'relative w-full max-w-md rounded-[16px] p-8 shadow-2xl', style: { backgroundColor: bgColor }, onClick: (e) => { e.stopPropagation() } },
      createElement('button', { onClick: onClose, className: 'absolute right-4 top-4 p-2 transition-colors', style: { color: theme === 'dark' ? '#a0a090' : '#605d52' }, type: 'button', 'aria-label': 'Close modal' }, createElement(X, { size: 24 })),
      createElement('h2', { className: 'mb-6 text-2xl font-semibold', style: { color: textColor } }, isSignUp ? 'Create Account' : 'Sign In'),
      createElement(
        'form',
        { onSubmit: handleSubmit, className: 'space-y-4' },
        isSignUp
          ? createElement('div', null,
            createElement('label', { className: 'mb-2 block text-sm font-medium', style: { color: labelColor } }, 'Full Name'),
            createElement('input', { type: 'text', value: fullName, onChange: (e) => { setFullName(e.currentTarget.value) }, placeholder: 'John Doe', className: 'w-full rounded-[8px] border-2 px-4 py-3 transition-colors focus:outline-none focus:ring-2', style: fieldStyle })
          )
          : null,
        createElement('div', null,
          createElement('label', { className: 'mb-2 block text-sm font-medium', style: { color: labelColor } }, 'Email Address'),
          createElement('input', { type: 'email', value: email, onChange: (e) => { setEmail(e.currentTarget.value) }, placeholder: 'you@example.com', required: true, className: 'w-full rounded-[8px] border-2 px-4 py-3 transition-colors focus:outline-none focus:ring-2', style: fieldStyle })
        ),
        createElement('div', null,
          createElement('label', { className: 'mb-2 block text-sm font-medium', style: { color: labelColor } }, 'Password'),
          createElement('input', { type: 'password', value: password, onChange: (e) => { setPassword(e.currentTarget.value) }, placeholder: '••••••••', required: true, className: 'w-full rounded-[8px] border-2 px-4 py-3 transition-colors focus:outline-none focus:ring-2', style: fieldStyle })
        ),
        createElement('button', { type: 'submit', className: 'mt-6 w-full rounded-[12px] py-3 font-semibold text-white transition-colors', style: { backgroundColor: '#ff4f00' }, onMouseEnter: (e) => { e.currentTarget.style.backgroundColor = '#e64500' }, onMouseLeave: (e) => { e.currentTarget.style.backgroundColor = '#ff4f00' } }, isSignUp ? 'Create Account' : 'Sign In')
      ),
      createElement('div', { className: 'mt-6 text-center text-sm', style: { color: labelColor } },
        isSignUp ? 'Already have an account?' : "Don't have an account?", ' ',
        createElement('button', { onClick: () => { setIsSignUp(!isSignUp) }, className: 'font-semibold transition-colors', style: { color: '#ff4f00' }, onMouseEnter: (e) => { e.currentTarget.style.opacity = '0.8' }, onMouseLeave: (e) => { e.currentTarget.style.opacity = '1' }, type: 'button' }, `Click here to ${isSignUp ? 'sign in' : 'sign up'}`)
      )
    )
  )
}