'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SessionState, GooglyQuestion, OptionState, RevealResult, LifelineType } from '../../lib/game4.types';

interface Game4ContextValue {
  sessionId: string | null;
  sessionState: SessionState;
  currentQuestion: GooglyQuestion | null;
  currentRound: number;
  totalRounds: number;
  googlyRating: number;
  confidenceBet: 1 | 2 | 3 | null;
  selectedOptionId: string | null;
  openAnswer: string;
  optionStates: Record<string, OptionState>;
  typewriterDone: boolean;
  hintText: string | null;
  usedLifelines: Record<LifelineType, boolean>;
  revealResult: RevealResult | null;
  isSubmitting: boolean;
  setConfidenceBet: (bet: 1 | 2 | 3) => void;
  selectOption: (id: string) => void;
  setOpenAnswer: (text: string) => void;
  setTypewriterDone: (done: boolean) => void;
  useLifeline: (type: LifelineType) => void;
  submitAnswer: () => void;
  startGame: () => void;
  advanceToNextQuestion: () => void;
  abandonGame: () => void;
}

const Game4Context = createContext<Game4ContextValue | undefined>(undefined);

// The Demo Question Queue (3 Rounds)
const mockQuestions: GooglyQuestion[] = [
  {
    id: 'q1', type: 'mcq', category: 'Databases', difficulty: 'medium',
    questionText: "If you have a 10TB database and need to migrate it to a new schema with zero downtime, what is the most critical first step?",
    options: [
      { id: 'a', text: "Take a full backup and lock the tables." },
      { id: 'b', text: "Create a dual-write mechanism." },
      { id: 'c', text: "Setup logical replication to a new instance." },
      { id: 'd', text: "Write a background script to update rows in batches." } // TRAP
    ]
  },
  {
    id: 'q2', type: 'mcq', category: 'Architecture', difficulty: 'hard',
    questionText: "Your microservice is experiencing cascading failures due to downstream timeouts. Which pattern is the most dangerous to implement first?",
    options: [
      { id: 'a', text: "Circuit Breaker" },
      { id: 'b', text: "Automatic Retries with exponential backoff" }, // TRAP
      { id: 'c', text: "Rate Limiting" },
      { id: 'd', text: "Bulkhead Pattern" }
    ]
  },
  {
    id: 'q3', type: 'mcq', category: 'System Design', difficulty: 'boss',
    questionText: "The Final Googly: You are designing a globally distributed counter. A network partition occurs. Do you prioritize Availability or Consistency, and why does your choice actually guarantee neither?",
    options: [
      { id: 'a', text: "Availability, because users need to see a number." },
      { id: 'b', text: "Consistency, because financial data requires it." },
      { id: 'c', text: "Neither, CAP theorem forces a tradeoff that degrades both." },
      { id: 'd', text: "CP systems fall back to AP to preserve uptime." } // TRAP
    ]
  }
];

export function Game4Provider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('lobby');
  const [currentRound, setCurrentRound] = useState(1);
  const [googlyRating, setGooglyRating] = useState(50);
  const [currentQuestion, setCurrentQuestion] = useState<GooglyQuestion | null>(null);
  const [confidenceBet, setConfidenceBet] = useState<1 | 2 | 3 | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [openAnswer, setOpenAnswer] = useState('');
  const [optionStates, setOptionStates] = useState<Record<string, OptionState>>({});
  const [typewriterDone, setTypewriterDone] = useState(false);
  const [hintText, setHintText] = useState<string | null>(null);
  const [usedLifelines, setUsedLifelines] = useState<Record<LifelineType, boolean>>({ '50_50': false, 'hint': false });
  const [revealResult, setRevealResult] = useState<RevealResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalRounds = mockQuestions.length;

  useEffect(() => {
    const saved = sessionStorage.getItem('g4_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sessionState !== 'lobby' && parsed.sessionState !== 'game_over') {
          setSessionId(parsed.sessionId);
          setSessionState(parsed.sessionState);
          setCurrentRound(parsed.currentRound);
          setGooglyRating(parsed.googlyRating);
          setCurrentQuestion(parsed.currentQuestion);
          setUsedLifelines(parsed.usedLifelines || { '50_50': false, 'hint': false });
        }
      } catch (e) { console.error("Failed to parse session", e); }
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('g4_state', JSON.stringify({
        sessionId, sessionState, currentRound, googlyRating, currentQuestion, usedLifelines
      }));
    }
  }, [sessionId, sessionState, currentRound, googlyRating, currentQuestion, usedLifelines]);

  const loadQuestion = (round: number) => {
    if (round > totalRounds) {
      setSessionState('game_over');
      return;
    }

    const nextQuestion = mockQuestions[round - 1];
    
    setCurrentQuestion(nextQuestion);
    setConfidenceBet(null);
    setSelectedOptionId(null);
    setOpenAnswer('');
    setHintText(null);
    setRevealResult(null);
    setTypewriterDone(false);
    
    const initialStates: Record<string, OptionState> = {};
    nextQuestion.options?.forEach(opt => initialStates[opt.id] = 'default');
    setOptionStates(initialStates);
    
    // Always go to playing state, skip the weird boss intro screen
    setSessionState('playing');
  };

  const startGame = () => {
    setSessionId(`g4_${Date.now()}`);
    setGooglyRating(50);
    setCurrentRound(1);
    setUsedLifelines({ '50_50': false, 'hint': false });
    loadQuestion(1);
  };

  const selectOption = (id: string) => {
    if (sessionState !== 'playing' || !typewriterDone || optionStates[id] === 'eliminated') return;
    
    setSelectedOptionId(id);
    setOptionStates(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (next[k] !== 'eliminated') next[k] = k === id ? 'selected' : 'default';
      });
      return next;
    });
  };

  const useLifeline = (type: LifelineType) => {
    if (usedLifelines[type]) return;
    setUsedLifelines(prev => ({ ...prev, [type]: true }));
    
    if (type === '50_50' && currentQuestion?.options) {
      setOptionStates(prev => ({ ...prev, 'a': 'eliminated', 'd': 'eliminated' }));
    } else if (type === 'hint') {
      setHintText("Don't fall for the obvious answer. Think about edge cases under heavy load.");
    }
  };

  const submitAnswer = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const isTrap = selectedOptionId === 'd' || selectedOptionId === 'b';
      const isCorrect = selectedOptionId === 'c';
      const bonus = confidenceBet === 3 && isCorrect ? 50 : 0;
      const delta = isCorrect ? 15 : (isTrap ? -20 : -5);
      
      setRevealResult({
        correctOptionId: 'c',
        trapOptionId: selectedOptionId === 'b' ? 'b' : 'd', 
        isCorrect,
        isTrap,
        trapExplanation: isTrap ? "You fell for the Googly! That choice ignores cascading failures." : "Good eye, you avoided the obvious trap.",
        playerInsight: isCorrect ? "Excellent first-principles reasoning." : "Review distributed systems fallbacks.",
        ratingDelta: delta,
        newRating: Math.max(0, Math.min(100, googlyRating + delta)),
        confidenceBonus: bonus,
        totalXpAwarded: (isCorrect ? 100 : 10) + bonus
      });
      
      setGooglyRating(prev => Math.max(0, Math.min(100, prev + delta)));
      
      if (currentQuestion?.type === 'mcq') {
        setOptionStates(prev => {
          const res = { ...prev };
          res['c'] = 'correct';
          if (isTrap && selectedOptionId) res[selectedOptionId] = 'trap';
          return res;
        });
      }
      
      setIsSubmitting(false);
      setSessionState('revealing');
    }, 1500);
  };

  const advanceToNextQuestion = () => {
    if (currentRound >= totalRounds) {
      setSessionState('game_over');
      sessionStorage.removeItem('g4_state');
    } else {
      setCurrentRound(prev => prev + 1);
      loadQuestion(currentRound + 1);
    }
  };

  const abandonGame = () => {
    sessionStorage.removeItem('g4_state');
  };

  return (
    <Game4Context.Provider value={{
      sessionId, sessionState, currentQuestion, currentRound, totalRounds, googlyRating,
      confidenceBet, selectedOptionId, openAnswer, optionStates, typewriterDone,
      hintText, usedLifelines, revealResult, isSubmitting,
      setConfidenceBet, selectOption, setOpenAnswer, setTypewriterDone,
      useLifeline, submitAnswer, startGame, advanceToNextQuestion, abandonGame
    }}>
      {children}
    </Game4Context.Provider>
  );
}

export const useGame4 = () => {
  const context = useContext(Game4Context);
  if (!context) throw new Error('useGame4 must be used within Game4Provider');
  return context;
};