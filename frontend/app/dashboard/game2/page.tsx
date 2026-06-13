'use client'

import { createElement, useEffect, useState, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Play,
  RotateCcw,
  Trophy,
  Sparkles,
  Coins,
  Loader2,
  Info,
} from 'lucide-react'

import { useTheme } from '@/app/theme-provider'
import { Button } from '@/components/ui/button'
import { apiRequest } from '@/lib/auth'
import './game2-animations.css'

interface RoundHistory {
  round: number
  moveType: 'counter' | 'justify' | 'trade' | 'walk'
  counterAmount?: number
  hrResponse: string
  hrCounterOffer: number
}

interface PokerCardProps {
  face: 'up' | 'down'
  rank: string
  suit: 'â™¦' | 'â™£' | 'â™¥' | 'â™ ' | 'â˜…' | string
  label: string
  sublabel?: string
  selected?: boolean
  disabled?: boolean
  dealClass?: string
  playClass?: string
  onClick?: () => void
}

function PokerCard({
  face,
  rank,
  suit,
  label,
  sublabel,
  selected = false,
  disabled = false,
  dealClass = '',
  playClass = '',
  onClick
}: PokerCardProps) {
  const isRed = suit === 'â™¦' || suit === 'â™¥' || suit === 'â˜…'
  const textColor = isRed ? '#ef4444' : '#1f2937'

  const ariaLabel = face === 'up'
    ? `${label} card, rank ${rank}, suit ${suit} ${sublabel ? `, value ${sublabel}` : ''}`
    : 'Face-down card'

  if (face === 'down') {
    return createElement(
      'div',
      {
        onClick,
        'aria-label': ariaLabel,
        role: onClick ? 'button' : 'img',
        tabIndex: onClick ? 0 : undefined,
        className: `w-[130px] h-[190px] rounded-[12px] shadow-lg border-2 cursor-pointer border-[#c5c0b1] select-none ${dealClass} ${playClass}`,
        style: {
          background: 'repeating-linear-gradient(45deg, #2a2018, #2a2018 10px, #ff4f00 10px, #ff4f00 20px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
        }
      },
      createElement('div', { className: 'w-full h-full flex items-center justify-center' },
        createElement('div', { className: 'w-10 h-10 rounded-full bg-[#2a2018] flex items-center justify-center border border-[#ff4f00]' },
          createElement('span', { className: 'text-orange-500 font-bold text-lg' }, 'J')
        )
      )
    )
  }

  return createElement(
    'div',
    {
      onClick,
      'aria-label': ariaLabel,
      role: onClick ? 'button' : 'img',
      tabIndex: onClick ? 0 : undefined,
      className: `w-[130px] h-[190px] rounded-[12px] bg-[#fffefb] border-2 shadow-lg flex flex-col justify-between p-3 select-none transition-all duration-300 ${dealClass} ${playClass} ${selected ? '-translate-y-4' : ''}`,
      style: {
        borderColor: selected ? '#ffb45b' : '#c5c0b1',
        boxShadow: selected ? '0 12px 24px rgba(255, 180, 91, 0.45)' : '0 8px 16px rgba(0,0,0,0.15)',
        opacity: disabled ? 0.45 : 1,
        cursor: onClick ? 'pointer' : 'default'
      }
    },
    createElement('div', { className: 'flex justify-between items-start' },
      createElement('div', { className: 'flex flex-col items-center' },
        createElement('span', { className: 'text-sm font-bold', style: { fontFamily: 'Georgia, serif', color: textColor } }, rank),
        createElement('span', { className: 'text-sm leading-none', style: { fontFamily: 'Georgia, serif', color: textColor } }, suit)
      ),
      createElement('span', { className: 'text-[9px] font-semibold uppercase tracking-wider text-gray-400' }, 'Arena')
    ),
    createElement('div', { className: 'flex flex-col items-center justify-center flex-1' },
      createElement('span', { className: 'text-3xl leading-none my-1', style: { fontFamily: 'Georgia, serif', color: textColor } }, suit)
    ),
    createElement('div', { className: 'text-center border-t pt-2', style: { borderColor: 'rgba(0,0,0,0.06)' } },
      createElement('p', { className: 'text-[10px] font-bold uppercase tracking-wider text-gray-800' }, label),
      sublabel && createElement('p', { className: 'text-[9px] font-extrabold text-orange-600 mt-0.5' }, sublabel)
    )
  )
}

function ChipStack({ amount }: { amount: number }) {
  const chipCount = Math.min(20, Math.max(1, Math.round(Math.abs(amount) / 5000)))
  const colorLight = amount >= 0 ? '#4ade80' : '#f87171'
  const colorDark = amount >= 0 ? '#16a34a' : '#dc2626'
  const viewBoxHeight = 10 + chipCount * 5

  return createElement('div', { className: 'flex flex-col items-center gap-1.5' },
    createElement('svg', {
      width: 60,
      height: viewBoxHeight * 1.5,
      viewBox: `0 0 50 ${viewBoxHeight}`,
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg'
    },
      Array.from({ length: chipCount }).map((_, idx) => {
        const y = viewBoxHeight - 8 - idx * 4
        return createElement('g', { key: idx },
          createElement('ellipse', { cx: 25, cy: y + 2, rx: 20, ry: 5, fill: colorDark }),
          createElement('rect', { x: 5, y, width: 40, height: 2, fill: colorDark }),
          createElement('ellipse', { cx: 25, cy: y, rx: 20, ry: 5, fill: colorLight })
        )
      })
    ),
    createElement('span', { className: 'text-xs font-bold px-2.5 py-0.5 rounded-full', style: { backgroundColor: amount >= 0 ? 'rgba(34, 197, 94, 0.16)' : 'rgba(239, 68, 68, 0.16)', color: amount >= 0 ? '#22c55e' : '#ef4444' } },
      `${amount >= 0 ? '+' : ''}${amount.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`
    )
  )
}

function DecorativeCardFan() {
  return createElement('div', { 'aria-hidden': 'true', className: 'relative h-28 w-48 mx-auto opacity-30 select-none' },
    createElement('div', { className: 'absolute left-2 top-0 w-16 h-24 bg-gray-700 rounded-lg shadow-md transform -rotate-12 border border-gray-600' }),
    createElement('div', { className: 'absolute left-12 top-0 w-16 h-24 bg-orange-700 rounded-lg shadow-md transform rotate-0 border border-orange-600' }),
    createElement('div', { className: 'absolute left-22 top-0 w-16 h-24 bg-gray-800 rounded-lg shadow-md transform rotate-12 border border-gray-700' })
  )
}

function buildGame2Points(verdict: 'win' | 'lose' | 'fail' | 'perfect_win' | null, salaryDelta: number): number {
  const base = verdict === 'perfect_win' ? 220 : verdict === 'win' ? 160 : verdict === 'lose' ? 40 : verdict === 'fail' ? 20 : 0
  return base + Math.max(0, Math.round(salaryDelta / 1000))
}

export default function Game2Page() {
  const router = useRouter()
  const { theme } = useTheme()

  const [phase, setPhase] = useState<'setup' | 'gameplay' | 'post-session'>('setup')
  const [loading, setLoading] = useState<boolean>(false)
  const [companyName, setCompanyName] = useState<string>('')
  const [role, setRole] = useState<string>('')
  const [currentOffer, setCurrentOffer] = useState<string>('')
  const [sessionId, setSessionId] = useState<string>('')
  const [companyRange, setCompanyRange] = useState<{ min: number; max: number }>({ min: 0, max: 0 })
  const [fundingStatus, setFundingStatus] = useState<string>('')
  const [hiringFreezeInfo, setHiringFreezeInfo] = useState<string>('')
  const [marketAverage, setMarketAverage] = useState<number>(0)
  const [baseSalary, setBaseSalary] = useState<number>(0)
  const [round, setRound] = useState<number>(1)
  const [history, setHistory] = useState<RoundHistory[]>([])
  const [selectedCardType, setSelectedCardType] = useState<'counter' | 'justify' | 'trade' | 'walk' | null>(null)
  const [counterAmountInput, setCounterAmountInput] = useState<string>('')
  const [hrCardFlipped, setHrCardFlipped] = useState<boolean>(false)
  const [playingCard, setPlayingCard] = useState<boolean>(false)
  const [verdict, setVerdict] = useState<'win' | 'lose' | 'fail' | 'perfect_win' | null>(null)
  const [feedback, setFeedback] = useState<string>('')
  const [salaryDelta, setSalaryDelta] = useState<number>(0)
  const [finalSalary, setFinalSalary] = useState<number>(0)

  const playSound = (soundType: 'click' | 'deal' | 'success' | 'fail') => {
    try {
      let src = ''
      if (soundType === 'click') src = '/sounds/click.mp3'
      else if (soundType === 'deal') src = '/sounds/fahhh.mp3'
      else if (soundType === 'success') src = '/sounds/success.mp3'
      else if (soundType === 'fail') src = '/sounds/fail.mp3'

      const audio = new Audio(src)
      audio.volume = 0.5
      audio.play().catch(() => {})
    } catch {}
  }

  const colors = useMemo(() => {
    const isDark = theme === 'dark'
    return {
      background: isDark
        ? 'radial-gradient(circle at top left, rgba(255, 106, 42, 0.2), transparent 30%), linear-gradient(135deg, #140f0b 0%, #1d1712 52%, #120d0a 100%)'
        : 'radial-gradient(circle at top left, rgba(255, 142, 82, 0.18), transparent 30%), linear-gradient(135deg, #fffaf3 0%, #fff4ea 50%, #ffe6cf 100%)',
      panel: isDark ? 'rgba(42, 32, 24, 0.78)' : 'rgba(255, 250, 244, 0.82)',
      panelStrong: isDark ? '#2a2018' : '#fffaf4',
      soft: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 106, 42, 0.08)',
      border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(150, 111, 81, 0.16)',
      text: isDark ? '#f5f0e8' : '#241710',
      muted: isDark ? '#d3c8bc' : '#6e6257',
      subtle: isDark ? '#a99c90' : '#8b7a6b',
      primary: '#ff4f00',
      primarySoft: isDark ? 'rgba(255, 106, 42, 0.14)' : 'rgba(255, 106, 42, 0.12)',
    }
  }, [theme])

  const moveSuitMap = (type: 'counter' | 'justify' | 'trade' | 'walk') => {
    switch (type) {
      case 'counter': return { suit: 'â™¦', rank: 'C', label: 'Counter' }
      case 'justify': return { suit: 'â™£', rank: 'J', label: 'Justify' }
      case 'trade': return { suit: 'â™¥', rank: 'T', label: 'Trade' }
      case 'walk': return { suit: 'â™ ', rank: 'W', label: 'Walk' }
    }
  }

  const handleStartGame = async () => {
    const offerNum = Number(currentOffer)
    if (!companyName.trim() || !role.trim() || isNaN(offerNum) || offerNum <= 0) return

    setLoading(true)
    try {
      const res = await fetch('/api/game2/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: companyName.trim(),
          role: role.trim(),
          currentOffer: offerNum
        })
      })

      if (!res.ok) throw new Error('Failed to initialize session')

      const data = await res.json()
      setSessionId(data.sessionId)
      setCompanyRange(data.companyRange)
      setFundingStatus(data.fundingStatus)
      setHiringFreezeInfo(data.hiringFreezeInfo)
      setMarketAverage(data.marketAverage)
      setBaseSalary(data.baseSalary)
      setRound(1)
      setHistory([])
      setSelectedCardType(null)
      setCounterAmountInput('')
      setHrCardFlipped(false)
      setPhase('gameplay')
      playSound('deal')
    } catch (err) {
      console.error(err)
      alert('Error initiating the session. Please check inputs.')
    } finally {
      setLoading(false)
    }
  }

  const handlePlayCard = async () => {
    if (!selectedCardType || loading) return

    const numVal = selectedCardType === 'counter' ? Number(counterAmountInput) : undefined
    if (selectedCardType === 'counter' && (!numVal || isNaN(numVal) || numVal <= 0)) {
      alert('Please enter a valid counter amount.')
      return
    }

    setPlayingCard(true)
    playSound('click')

    setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/game2/move', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            round,
            moveType: selectedCardType,
            counterAmount: numVal,
            history,
            baseSalary,
            companyRange,
            marketAverage
          })
        })

        if (!res.ok) throw new Error('Failed to make move')

        const data = await res.json()
        const newRound: RoundHistory = {
          round,
          moveType: selectedCardType,
          counterAmount: numVal,
          hrResponse: data.hrResponse,
          hrCounterOffer: data.hrCounterOffer
        }

        const updatedHistory = [...history, newRound]
        setHistory(updatedHistory)
        setSalaryDelta(data.salaryDelta)
        setFinalSalary(data.hrCounterOffer)
        setHrCardFlipped(true)
        playSound('deal')

        if (data.isGameOver) {
          setVerdict(data.verdict)
          setFeedback(data.feedback)
          if (data.verdict === 'win' || data.verdict === 'perfect_win') {
            setTimeout(() => playSound('success'), 600)
          } else {
            setTimeout(() => playSound('fail'), 600)
          }

          const token = localStorage.getItem('authToken')
          if (token) {
            try {
              await apiRequest('/api/dashboard/activity', {
                method: 'POST',
                token,
                body: {
                  gameKey: 'game2',
                  title: 'Salary Negotiator Poker',
                  score: data.hrCounterOffer,
                  pointsAwarded: buildGame2Points(data.verdict, data.salaryDelta),
                  summary: data.feedback || 'Negotiation session completed.',
                  focusAreas: data.verdict === 'perfect_win' || data.verdict === 'win'
                    ? ['negotiation']
                    : ['salary-strategy', 'market-research'],
                },
              })
            } catch (activityError) {
              console.error('Failed to record game2 progress:', activityError)
            }
          }
        }
      } catch (err) {
        console.error(err)
        alert('An error occurred while negotiating. Please try again.')
      } finally {
        setLoading(false)
        setPlayingCard(false)
      }
    }, 500)
  }

  const handleNextRound = () => {
    setSelectedCardType(null)
    setCounterAmountInput('')
    setHrCardFlipped(false)

    if (round < 4) {
      setRound(round + 1)
      playSound('deal')
    } else {
      setPhase('post-session')
    }
  }

  const handleFinishGame = () => {
    setPhase('post-session')
  }

  const handleTryAgain = () => {
    setCompanyName('')
    setRole('')
    setCurrentOffer('')
    setSessionId('')
    setRound(1)
    setHistory([])
    setSelectedCardType(null)
    setCounterAmountInput('')
    setHrCardFlipped(false)
    setVerdict(null)
    setFeedback('')
    setSalaryDelta(0)
    setFinalSalary(0)
    setPhase('setup')
  }

  const renderSetup = () => {
    const isFormValid = companyName.trim() && role.trim() && currentOffer.trim() && !isNaN(Number(currentOffer))

    return createElement('div', { className: 'max-w-md mx-auto mt-6' },
      createElement('section', { className: 'rounded-[1.5rem] border p-6 backdrop-blur-xl lg:p-8', style: { backgroundColor: colors.panel, borderColor: colors.border } },
        createElement('div', { className: 'space-y-6' },
          createElement('div', { className: 'text-center' },
            createElement('div', { className: 'mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold', style: { backgroundColor: colors.primarySoft, color: colors.primary } },
              createElement(Sparkles, { size: 16 }),
              createElement('span', null, 'Negotiator Poker Setup')
            ),
            createElement('h2', { className: 'text-2xl font-bold', style: { color: colors.text } }, 'Start Negotiation Hand'),
            createElement('p', { className: 'text-xs mt-2', style: { color: colors.muted } }, 'Configure your initial company offer. Standard poker mechanics will represent your moves.')
          ),

          createElement(DecorativeCardFan, null),

          createElement('div', { className: 'space-y-4 pt-2' },
            createElement('div', null,
              createElement('label', { className: 'block text-xs font-semibold uppercase tracking-wider mb-2', style: { color: colors.subtle } }, 'Target Company Name'),
              createElement('input', {
                type: 'text',
                value: companyName,
                onChange: (e) => setCompanyName((e.target as HTMLInputElement).value),
                placeholder: 'e.g. Google',
                className: 'h-11 w-full rounded-[0.9rem] border px-4 text-sm outline-none bg-transparent',
                style: { borderColor: colors.border, color: colors.text }
              })
            ),
            createElement('div', null,
              createElement('label', { className: 'block text-xs font-semibold uppercase tracking-wider mb-2', style: { color: colors.subtle } }, 'Target Role'),
              createElement('input', {
                type: 'text',
                value: role,
                onChange: (e) => setRole((e.target as HTMLInputElement).value),
                placeholder: 'e.g. Senior Software Engineer',
                className: 'h-11 w-full rounded-[0.9rem] border px-4 text-sm outline-none bg-transparent',
                style: { borderColor: colors.border, color: colors.text }
              })
            ),
            createElement('div', null,
              createElement('label', { className: 'block text-xs font-semibold uppercase tracking-wider mb-2', style: { color: colors.subtle } }, 'Initial Base Salary Offer ($)'),
              createElement('input', {
                type: 'number',
                value: currentOffer,
                onChange: (e) => setCurrentOffer((e.target as HTMLInputElement).value),
                placeholder: 'e.g. 120000',
                className: 'h-11 w-full rounded-[0.9rem] border px-4 text-sm outline-none bg-transparent',
                style: { borderColor: colors.border, color: colors.text }
              })
            )
          ),

          createElement('div', { className: 'pt-4' },
            createElement(Button, {
              onClick: handleStartGame,
              disabled: !isFormValid || loading,
              className: 'w-full h-11 rounded-[0.9rem] flex items-center justify-center gap-2',
              style: {
                backgroundColor: isFormValid ? colors.primary : colors.soft,
                color: isFormValid ? '#fffefb' : colors.subtle
              }
            }, 'Deals Hand ->')
          )
        )
      )
    )
  }

  const renderGameplay = () => {
    const currentHROffer = history.length > 0 ? history[history.length - 1].hrCounterOffer : baseSalary
    const isRoundCompleted = history.length >= round
    const isGameOver = verdict !== null

    const moves = [
      { type: 'counter', suit: 'â™¦', rank: 'C', label: 'Counter Offer' },
      { type: 'justify', suit: 'â™£', rank: 'J', label: 'Justify' },
      { type: 'trade', suit: 'â™¥', rank: 'T', label: 'Trade' },
      { type: 'walk', suit: 'â™ ', rank: 'W', label: 'Walk Away' }
    ] as const

    return createElement('div', { className: 'grid gap-6 lg:grid-cols-[280px_1fr]' },
      createElement('aside', { className: 'space-y-4' },
        createElement('div', { className: 'rounded-[1.25rem] border p-5 space-y-4 backdrop-blur-xl', style: { backgroundColor: colors.panel, borderColor: colors.border } },
          createElement('div', null,
            createElement('p', { className: 'text-[10px] font-bold uppercase tracking-wider', style: { color: colors.subtle } }, 'Target Company'),
            createElement('p', { className: 'text-lg font-bold mt-1', style: { color: colors.text } }, companyName)
          ),
          createElement('div', null,
            createElement('p', { className: 'text-[10px] font-bold uppercase tracking-wider', style: { color: colors.subtle } }, 'Target Role'),
            createElement('p', { className: 'text-sm font-semibold mt-1', style: { color: colors.text } }, role)
          ),
          createElement('hr', { style: { borderColor: colors.border } }),
          createElement('div', null,
            createElement('p', { className: 'text-[10px] font-bold uppercase tracking-wider', style: { color: colors.subtle } }, 'Company Range'),
            createElement('p', { className: 'text-sm font-bold mt-1', style: { color: colors.text } },
              `${companyRange.min.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} - ${companyRange.max.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`
            )
          ),
          createElement('div', null,
            createElement('p', { className: 'text-[10px] font-bold uppercase tracking-wider', style: { color: colors.subtle } }, 'Market Average'),
            createElement('p', { className: 'text-sm font-bold mt-1', style: { color: colors.text } },
              marketAverage.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
            )
          ),
          createElement('div', null,
            createElement('p', { className: 'text-[10px] font-bold uppercase tracking-wider', style: { color: colors.subtle } }, 'Funding / Freeze status'),
            createElement('p', { className: 'text-xs font-semibold mt-1 text-orange-500' }, fundingStatus),
            createElement('p', { className: 'text-[11px] mt-0.5', style: { color: colors.muted } }, hiringFreezeInfo)
          )
        ),
        createElement('div', { className: 'rounded-[1.25rem] border p-5 backdrop-blur-xl text-center space-y-3', style: { backgroundColor: colors.panel, borderColor: colors.border } },
          createElement('p', { className: 'text-[10px] font-bold uppercase tracking-wider', style: { color: colors.subtle } }, 'Pot (Salary Delta)'),
          createElement(ChipStack, { amount: salaryDelta })
        )
      ),
      createElement('section', { className: 'space-y-6' },
        createElement('div', { className: 'rounded-[1.5rem] border p-6 backdrop-blur-xl space-y-6', style: { backgroundColor: colors.panel, borderColor: colors.border } },
          createElement('div', { className: 'flex justify-between items-center border-b pb-4', style: { borderColor: colors.border } },
            createElement('span', { className: 'text-sm font-bold', style: { color: colors.text } }, `Betting Round ${round} of 4`),
            createElement('span', { className: 'text-xs font-semibold px-2 py-0.5 rounded bg-orange-600/10 text-orange-500' },
              `Starting Offer: ${baseSalary.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`
            )
          ),
          createElement('div', { className: 'grid gap-6 md:grid-cols-[160px_1fr] items-center p-4 rounded-[1.2rem]', style: { backgroundColor: colors.soft } },
            createElement('div', { className: 'flex justify-center card-flip-container', style: { perspective: '600px' } },
              createElement('div', { className: `card-flip-inner w-[130px] h-[190px] ${hrCardFlipped ? 'is-flipped' : ''}` },
                createElement('div', { className: 'card-flip-back' },
                  createElement(PokerCard, {
                    face: 'down',
                    rank: '',
                    suit: '',
                    label: ''
                  })
                ),
                createElement('div', { className: 'card-flip-front' },
                  createElement(PokerCard, {
                    face: 'up',
                    rank: 'H',
                    suit: 'â™ ',
                    label: 'HR Proposal',
                    sublabel: currentHROffer.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
                  })
                )
              )
            ),
            createElement('div', { className: 'space-y-2' },
              createElement('p', { className: 'text-xs font-bold uppercase tracking-wider text-orange-500' }, 'HR Manager Response'),
              createElement('p', { className: 'text-sm leading-relaxed italic', style: { color: colors.text } },
                isRoundCompleted
                  ? history[history.length - 1].hrResponse
                  : 'The HR Manager is waiting for your move. Select a card from your hand below to play.'
              ),
              isRoundCompleted && createElement('div', { className: 'pt-2 flex items-center gap-2' },
                createElement(Coins, { size: 16, className: 'text-green-500' }),
                createElement('span', { className: 'text-xs font-bold text-green-500' },
                  `Current Offer: ${currentHROffer.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}`
                )
              )
            )
          ),
          history.length > 0 && createElement('div', { className: 'space-y-2' },
            createElement('p', { className: 'text-[10px] font-bold uppercase tracking-wider text-gray-400' }, 'Played Cards / Round Breakdown'),
            createElement('div', { className: 'flex flex-wrap gap-3 items-center' },
              history.map((hist, idx) => {
                const details = moveSuitMap(hist.moveType)
                return createElement('div', { key: idx, className: 'flex items-center gap-1.5' },
                  createElement('div', { className: 'scale-75 origin-left' },
                    createElement(PokerCard, {
                      face: 'up',
                      rank: details.rank,
                      suit: details.suit,
                      label: details.label,
                      sublabel: hist.counterAmount ? `$${hist.counterAmount.toLocaleString()}` : undefined
                    })
                  ),
                  idx < history.length - 1 && createElement('span', { className: 'text-sm text-gray-500 font-bold' }, '->')
                )
              })
            )
          ),
          !isRoundCompleted && createElement('div', { className: 'space-y-6 pt-4 border-t', style: { borderColor: colors.border } },
            createElement('div', { className: 'text-center' },
              createElement('p', { className: 'text-xs font-bold uppercase tracking-wider', style: { color: colors.subtle } }, 'Your Hand (Select a Move Card)'),
              createElement('p', { className: 'text-[10px] mt-0.5', style: { color: colors.muted } }, 'Play a card to respond to the HR Manager')
            ),
            createElement('div', { className: 'flex flex-wrap justify-center gap-4 py-2' },
              moves.map((move, idx) => {
                const isSelected = selectedCardType === move.type
                const isDisabled = selectedCardType !== null && selectedCardType !== move.type

                return createElement(PokerCard, {
                  key: move.type,
                  face: 'up',
                  rank: move.rank,
                  suit: move.suit,
                  label: move.label,
                  sublabel: move.type === 'counter' && counterAmountInput ? `$${Number(counterAmountInput).toLocaleString()}` : undefined,
                  selected: isSelected,
                  disabled: isDisabled,
                  dealClass: `card-deal-${idx + 1}`,
                  playClass: (playingCard && isSelected) ? 'card-played' : '',
                  onClick: () => {
                    if (playingCard) return
                    setSelectedCardType(isSelected ? null : move.type)
                  }
                })
              })
            ),
            selectedCardType === 'counter' && createElement('div', { className: 'max-w-xs mx-auto animate-fade-in space-y-2' },
              createElement('label', { className: 'block text-xs font-semibold text-center uppercase tracking-wider', style: { color: colors.subtle } }, 'Enter Counter Offer Amount ($)'),
              createElement('input', {
                type: 'number',
                value: counterAmountInput,
                onChange: (e) => setCounterAmountInput((e.target as HTMLInputElement).value),
                placeholder: 'e.g. 135000',
                className: 'h-10 w-full text-center rounded-[0.8rem] border px-4 text-sm outline-none bg-transparent',
                style: { borderColor: colors.border, color: colors.text }
              })
            ),
            createElement('div', { className: 'flex justify-center pt-2' },
              createElement(Button, {
                onClick: handlePlayAgainstLoaderCheck,
                disabled: !selectedCardType || loading,
                className: 'h-11 px-8 rounded-[0.9rem] text-sm font-semibold flex items-center gap-2',
                style: {
                  backgroundColor: selectedCardType ? colors.primary : colors.soft,
                  color: selectedCardType ? '#fffefb' : colors.subtle
                }
              },
              loading
                ? createElement(Loader2Component, null)
                : `${selectedCardType ? 'Play Card ->' : 'Select a card'}`
              )
            )
          ),
          isRoundCompleted && createElement('div', { className: 'flex justify-center pt-4 border-t', style: { borderColor: colors.border } },
            isGameOver
              ? createElement(Button, {
                  onClick: handleFinishGame,
                  className: 'h-11 px-8 rounded-[0.9rem] text-sm font-semibold'
                }, 'View Summary & Verdict ->')
              : createElement(Button, {
                  onClick: handleNextRound,
                  className: 'h-11 px-8 rounded-[0.9rem] text-sm font-semibold'
                }, round < 4 ? `Go to Round ${round + 1} ->` : 'Submit Hand ->')
          )
        )
      )
    )
  }

  const Loader2Component = () => createElement(Loader2ComponentInner, null)
  const Loader2ComponentInner = () => {
    return createElement('div', { className: 'flex items-center gap-2' },
      createElement('span', { className: 'h-4 w-4 border-2 border-[#fffefb] border-t-transparent rounded-full animate-spin' }),
      createElement('span', null, 'Negotiating...')
    )
  }

  const handlePlayAgainstLoaderCheck = () => {
    handlePlayCard()
  }

  const renderPostSession = () => {
    if (verdict === null) return null

    let verdictTitle = 'Negotiation Closed'
    let verdictColor = '#eab308'
    let verdictBg = 'rgba(234, 179, 8, 0.1)'
    let verdictBorder = 'rgba(234, 179, 8, 0.3)'

    let cardRank = 'F'
    let cardSuit = 'â™¦'
    let cardLabel = 'Negotiation Stalled'

    if (verdict === 'perfect_win') {
      verdictTitle = 'Perfect Win!'
      verdictColor = '#eab308'
      verdictBg = 'rgba(234, 179, 8, 0.12)'
      verdictBorder = 'rgba(234, 179, 8, 0.45)'
      cardRank = 'â˜…'
      cardSuit = 'â˜…'
      cardLabel = 'Perfect Win'
    } else if (verdict === 'win') {
      verdictTitle = 'Offer Accepted'
      verdictColor = '#22c55e'
      verdictBg = 'rgba(34, 197, 94, 0.1)'
      verdictBorder = 'rgba(34, 197, 94, 0.3)'
      cardRank = 'W'
      cardSuit = 'â™¥'
      cardLabel = 'Accepted'
    } else if (verdict === 'lose') {
      verdictTitle = 'Offer Withdrawn'
      verdictColor = '#ef4444'
      verdictBg = 'rgba(239, 68, 68, 0.1)'
      verdictBorder = 'rgba(239, 68, 68, 0.3)'
      cardRank = 'L'
      cardSuit = 'â™ '
      cardLabel = 'Withdrawn'
    } else if (verdict === 'fail') {
      verdictTitle = 'Negotiation Stalled'
      verdictColor = '#6b7280'
      verdictBg = 'rgba(107, 114, 128, 0.1)'
      verdictBorder = 'rgba(107, 114, 128, 0.3)'
      cardRank = 'F'
      cardSuit = 'â™¦'
      cardLabel = 'Stalled'
    }

    return createElement('div', { className: 'max-w-2xl mx-auto mt-6' },
      createElement('section', { className: 'overflow-hidden rounded-[1.5rem] border p-6 backdrop-blur-xl lg:p-8', style: { backgroundColor: colors.panel, borderColor: colors.border } },
        createElement('div', { className: 'grid gap-8 md:grid-cols-[160px_1fr] items-center' },
          createElement('div', { className: 'flex justify-center' },
            createElement(PokerCard, {
              face: 'up',
              rank: cardRank,
              suit: cardSuit,
              label: cardLabel,
              sublabel: finalSalary > 0 ? `$${finalSalary.toLocaleString()}` : undefined
            })
          ),
          createElement('div', { className: 'space-y-6' },
            createElement('div', {
              className: 'rounded-[1.2rem] border p-4 font-semibold text-lg flex items-center gap-2',
              style: { backgroundColor: verdictBg, borderColor: verdictBorder, color: verdictColor }
            },
              createElement('span', null, verdictTitle)
            ),
            createElement('div', { className: 'p-5 rounded-[1.2rem] border text-sm leading-relaxed', style: { backgroundColor: colors.soft, borderColor: colors.border } },
              createElement('p', { className: 'font-semibold mb-2' }, 'Summary Feedback'),
              createElement('p', { style: { color: colors.text } }, feedback),
              salaryDelta !== 0 && createElement('p', { className: 'mt-3 font-semibold text-green-500' },
                `Total gain: +${salaryDelta.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} / year`
              )
            ),
            createElement('div', { className: 'flex gap-3' },
              createElement(Button, {
                onClick: handleTryAgain,
                className: 'h-11 px-6 rounded-[0.9rem] text-sm font-semibold flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white'
              },
                createElement(RotateCcw, { size: 16 }),
                'Try Again'
              ),
              createElement(Button, {
                onClick: () => router.push('/dashboard'),
                variant: 'outline',
                className: 'h-11 px-6 rounded-[0.9rem] text-sm font-semibold'
              }, 'Back to Dashboard')
            )
          )
        )
      )
    )
  }

  return createElement(
    'main',
    { className: 'min-h-screen', style: { background: colors.background } },
    createElement('div', { className: 'mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8' },
      createElement('header', { className: 'mb-6 rounded-[1.25rem] border p-4 backdrop-blur-xl', style: { backgroundColor: colors.panel, borderColor: colors.border } },
        createElement('div', { className: 'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between' },
          createElement('div', null,
            createElement('p', { className: 'text-xs font-semibold uppercase tracking-wider', style: { color: colors.primary } }, 'Negotiation Game'),
            createElement('h1', { className: 'text-2xl font-semibold', style: { color: colors.text } }, 'Salary Negotiator Poker')
          ),
          createElement('div', { className: 'flex items-center gap-3' },
            createElement(Button, {
              className: 'h-10 rounded-[0.9rem] flex items-center gap-1.5',
              variant: 'outline',
              onClick: () => {
                router.push('/dashboard')
              },
              type: 'button'
            },
              createElement(ArrowLeft, { size: 16 }),
              'Back to Dashboard'
            )
          )
        )
      ),
      phase === 'setup' && renderSetup(),
      phase === 'gameplay' && renderGameplay(),
      phase === 'post-session' && renderPostSession()
    )
  )
}
