import { NextResponse } from 'next/server'

interface MoveRequest {
  sessionId: string
  round: number
  moveType: 'counter' | 'justify' | 'trade' | 'walk'
  counterAmount?: number
  history: Array<{
    round: number
    moveType: 'counter' | 'justify' | 'trade' | 'walk'
    counterAmount?: number
    hrResponse: string
    hrCounterOffer: number
  }>
  baseSalary: number
  companyRange: { min: number; max: number }
  marketAverage: number
}

export async function POST(request: Request) {
  try {
    const body: MoveRequest = await request.json()
    const { sessionId, round, moveType, counterAmount, history, baseSalary, companyRange, marketAverage } = body

    if (!sessionId || !round || !moveType || !baseSalary || !companyRange || !marketAverage) {
      return NextResponse.json(
        { error: 'Required fields are missing.' },
        { status: 400 }
      )
    }

    const currentHROffer = history.length > 0 ? history[history.length - 1].hrCounterOffer : baseSalary
    let hrCounterOffer = currentHROffer
    let hrResponse = ''
    let hrMoveType: 'accept' | 'counter' | 'reject' = 'counter'
    let isGameOver = false
    let verdict: 'win' | 'lose' | 'fail' | 'perfect_win' | null = null
    let feedback = ''

    const isLastRound = round >= 4

    switch (moveType) {
      case 'walk':
        isGameOver = true
        hrMoveType = 'reject'
        hrCounterOffer = baseSalary
        hrResponse = "I'm sorry we couldn't reach an agreement. Since you've chosen to walk away, we will have to withdraw the offer and move forward with other candidates."
        verdict = 'fail'
        feedback = "You walked away from the negotiation table. While it protects you from accepting an under-market offer, it resulted in a 'No Deal' scenario. Try to use Justification and Trades in earlier rounds to build a better compromise."
        break
      case 'counter':
        const counterVal = Number(counterAmount)
        if (!counterVal || isNaN(counterVal)) {
          return NextResponse.json({ error: 'Valid counterAmount is required for Counter Offer.' }, { status: 400 })
        }

        if (counterVal > companyRange.max) {
          isGameOver = true
          hrMoveType = 'reject'
          hrCounterOffer = baseSalary
          hrResponse = `Honestly, ${counterVal.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} is way outside our approved budget range for this role. We feel our expectations are too far apart, and we are withdrawing our offer.`
          verdict = 'lose'
          feedback = "You countered with an amount that exceeded the company's maximum salary budget. This is seen as unreasonable and led to the company withdrawing their offer entirely. Always research the salary range before making high counters."
        } else if (counterVal <= currentHROffer) {
          hrCounterOffer = currentHROffer
          hrResponse = 'You countered with an amount equal to or lower than our current offer. We are happy to lock in this offer.'
          hrMoveType = 'accept'
          isGameOver = true
          verdict = 'win'
          feedback = 'You accepted the offer by countering below or equal to the HR proposal. You secured the job, but missed out on potential salary increases.'
        } else {
          const diff = counterVal - currentHROffer
          const gapFiller = diff * 0.45
          hrCounterOffer = Math.round(currentHROffer + gapFiller)

          if (hrCounterOffer >= companyRange.max * 0.95) {
            hrCounterOffer = counterVal
            hrMoveType = 'accept'
            isGameOver = true
            verdict = 'perfect_win'
            hrResponse = `We value your skillset highly and are prepared to meet your request. We accept your counteroffer of ${counterVal.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} base salary.`
            feedback = 'Perfect negotiation! You managed to maximize the company budget and secure a top-tier salary package. Congratulations on a Perfect Win!'
          } else {
            hrResponse = `We understand you are looking for more, but we can't quite do ${counterVal.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}. However, we can meet you partway at ${hrCounterOffer.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}.`
            hrMoveType = 'counter'
          }
        }
        break
      case 'justify':
        const bump = Math.round((companyRange.max - companyRange.min) * 0.08)
        hrCounterOffer = Math.min(companyRange.max, currentHROffer + bump)
        hrMoveType = 'counter'
        hrResponse = `Your experience and market data details are compelling. We've gone back to the compensation committee and successfully increased our base salary offer to ${hrCounterOffer.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}.`
        break
      case 'trade':
        const tradeBump = Math.round((companyRange.max - companyRange.min) * 0.05)
        hrCounterOffer = Math.min(companyRange.max, currentHROffer + tradeBump)
        hrMoveType = 'counter'
        hrResponse = `We can definitely look at alternative benefits. In exchange for the adjusted base salary of ${hrCounterOffer.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}, we will add a $5,000 sign-on bonus and grant an extra 5 days of paid time off.`
        break
    }

    if (isLastRound && !isGameOver) {
      isGameOver = true
      if (hrCounterOffer >= marketAverage) {
        verdict = 'win'
        hrMoveType = 'accept'
        hrResponse = `This is our final offer of ${hrCounterOffer.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}. We hope you'll join us!`
        feedback = 'You successfully closed the negotiation above the market average. You achieved a solid win and secured a very competitive compensation package.'
      } else {
        verdict = 'lose'
        hrMoveType = 'reject'
        hrResponse = `We have reached the limit of our budget. Our final offer remains ${hrCounterOffer.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}. We cannot negotiate any further.`
        feedback = "The negotiation ended below the market average. While you still have the offer, you weren't able to secure a premium rate. Try to use stronger market justifications next time."
      }
    }

    const salaryDelta = hrCounterOffer - baseSalary

    return NextResponse.json({
      hrResponse,
      hrCounterOffer,
      hrMoveType,
      salaryDelta,
      isGameOver,
      verdict,
      feedback
    })
  } catch (error) {
    console.error('Error in /api/game2/move:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
