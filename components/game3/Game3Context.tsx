'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { Game3Config, SessionState, ConceptCard, InputMode, EvaluationResult, FullResults, CardResult } from '../../lib/game3.types';

interface Game3ContextValue {
  sessionConfig: Game3Config | null;
  sessionId: string | null;
  sessionState: SessionState | null;
  currentCard: ConceptCard | null;
  currentRound: number;
  inputMode: InputMode;
  answer: string;
  audioBlob: Blob | null;
  timeRemaining: number;
  timerActive: boolean;
  evaluationResult: EvaluationResult | null;
  isEvaluating: boolean;
  results: FullResults | null;
  streak: number;
  livesRemaining: number;
  
  setInputMode: (mode: InputMode) => void;
  setAnswer: (text: string) => void;
  setAudioBlob: (blob: Blob | null) => void;
  submitAnswer: () => Promise<void>;
  startGame: () => Promise<void>;
  advanceToNextCard: () => void;
  abandonGame: () => Promise<void>;
}

const Game3Context = createContext<Game3ContextValue | undefined>(undefined);

export function Game3Provider({ children }: { children: React.ReactNode }) {
  const [sessionConfig, setSessionConfig] = useState<Game3Config | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('lobby');
  const [currentCard, setCurrentCard] = useState<ConceptCard | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [inputMode, setInputMode] = useState<InputMode>('text');
  const [answer, setAnswer] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(90);
  const [timerActive, setTimerActive] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<FullResults | null>(null);
  const [streak, setStreak] = useState(0);
  const [livesRemaining, setLivesRemaining] = useState(3);
  const [cardHistory, setCardHistory] = useState<CardResult[]>([]);

  // Timer Effect
  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;
    const interval = setInterval(() => setTimeRemaining((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive, timeRemaining]);

  // Auto-submit on 0
  useEffect(() => {
    if (timeRemaining === 0 && timerActive) {
      setTimerActive(false);
      submitAnswer();
    }
  }, [timeRemaining, timerActive]);

  // Initial Config Fetch
  useEffect(() => {
    setTimeout(() => {
      setSessionConfig({ timePerRound: 90, totalLives: 3, totalRounds: 5 });
    }, 800);
  }, []);

  const startGame = async () => {
    setSessionState('playing');
    setSessionId(`sess_${Math.random().toString(36).substring(2, 11)}`);
    setLivesRemaining(sessionConfig?.totalLives || 3);
    setCurrentRound(1);
    setStreak(0);
    setCardHistory([]);
    fetchNextCard();
  };

  const fetchNextCard = () => {
    setCurrentCard({
      id: 'c1',
      title: 'Vision Transformers vs. Convolutional Neural Networks',
      category: 'Machine Learning Architecture',
      difficulty: 'hard'
    });
    setTimeRemaining(sessionConfig?.timePerRound || 90);
    setTimerActive(true);
    setAnswer('');
    setAudioBlob(null);
    setEvaluationResult(null);
  };

  const submitAnswer = async () => {
    setTimerActive(false);
    setIsEvaluating(true);
    setSessionState('evaluating');

    // Simulate Backend AI Agent Evaluation
    setTimeout(() => {
      const isGood = answer.length > 50 || audioBlob;
      const score = isGood ? 82 : 25;
      const lifeLost = score < 30;
      
      const newEvaluation: EvaluationResult = {
        clarity: isGood ? 22 : 5,
        structure: isGood ? 20 : 10,
        depth: isGood ? 18 : 5,
        brevity: isGood ? 22 : 5,
        totalScore: score,
        feedback: isGood 
          ? 'Excellent articulation. You hit the key architectural differences clearly.' 
          : 'Too brief. Try to outline the spatial vs sequential processing differences.',
        xpAwarded: isGood ? 150 : 10,
        lifeConsumed: lifeLost,
        livesRemaining: livesRemaining - (lifeLost ? 1 : 0),
        streak: isGood && !lifeLost ? streak + 1 : 0
      };

      setStreak(newEvaluation.streak);
      setLivesRemaining(newEvaluation.livesRemaining);
      setEvaluationResult(newEvaluation);
      setIsEvaluating(false);
      
      setCardHistory(prev => [...prev, { ...newEvaluation, card: currentCard! }]);

      if (newEvaluation.livesRemaining <= 0) {
        generateFinalResults('eliminated');
      } else if (lifeLost) {
        setSessionState('life_lost');
      } else {
        setSessionState('score_reveal');
      }
    }, 2000);
  };

  const advanceToNextCard = () => {
    if (currentRound >= (sessionConfig?.totalRounds || 5)) {
      generateFinalResults('completed');
    } else {
      setCurrentRound(prev => prev + 1);
      setSessionState('playing');
      fetchNextCard();
    }
  };

  const generateFinalResults = (outcome: 'completed' | 'eliminated') => {
    setResults({
      outcome,
      totalXp: cardHistory.reduce((acc, curr) => acc + curr.xpAwarded, 0),
      finalScore: Math.round(cardHistory.reduce((acc, curr) => acc + curr.totalScore, 0) / Math.max(cardHistory.length, 1)),
      cardBreakdown: cardHistory,
      agentSummary: {
        clarity: "You generally speak clearly, but occasionally use filler words.",
        structure: "Good start, but try to use the STAR method when explaining tradeoffs.",
        depth: "Strong technical depth shown.",
        brevity: "You kept answers concise and respected the time limits.",
        overall: "Solid performance. Work on reducing 'ums' to sound more authoritative."
      }
    });
    setSessionState('game_over');
  };

  const abandonGame = async () => {
    setSessionState('lobby');
  };

  return (
    <Game3Context.Provider value={{
      sessionConfig, sessionId, sessionState, currentCard, currentRound,
      inputMode, answer, audioBlob, timeRemaining, timerActive,
      evaluationResult, isEvaluating, results, streak, livesRemaining,
      setInputMode, setAnswer, setAudioBlob, submitAnswer, startGame, advanceToNextCard, abandonGame
    }}>
      {children}
    </Game3Context.Provider>
  );
}

export const useGame3 = () => {
  const context = useContext(Game3Context);
  if (!context) throw new Error('useGame3 must be used within Game3Provider');
  return context;
};