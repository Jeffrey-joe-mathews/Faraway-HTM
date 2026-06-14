'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { SessionState, GooglyQuestion, OptionState, RevealResult, LifelineType } from '../../lib/game4.types';
import { apiRequest } from '@/lib/auth';

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
  timerSeconds: number;
  winsCount: number;
  consecutiveCorrect: number;
  showLevelUpAnimation: boolean;
  isListening: boolean;
  seenQuestionIds: string[];
  pendingLevelUp: boolean;
  setPendingLevelUp: (pending: boolean) => void;
  setConfidenceBet: (bet: 1 | 2 | 3) => void;
  selectOption: (id: string) => void;
  setOpenAnswer: (text: string) => void;
  setTypewriterDone: (done: boolean) => void;
  useLifeline: (type: LifelineType) => void;
  submitAnswer: () => void;
  startGame: () => void;
  advanceToNextQuestion: () => void;
  abandonGame: () => void;
  startListening: () => void;
  setShowLevelUpAnimation: (show: boolean) => void;
}

const Game4Context = createContext<Game4ContextValue | undefined>(undefined);

export function Game4Provider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<SessionState>('lobby');
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(3);
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
  const [weakCategories, setWeakCategories] = useState<string[]>([]);

  // New gamification / timer states
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [winsCount, setWinsCount] = useState(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
  const [showLevelUpAnimation, setShowLevelUpAnimation] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [seenQuestionIds, setSeenQuestionIds] = useState<string[]>([]);
  const [roundStartTime, setRoundStartTime] = useState<number | null>(null);
  const [under10sCount, setUnder10sCount] = useState(0);
  const [under5sCount, setUnder5sCount] = useState(0);
  const [pendingLevelUp, setPendingLevelUp] = useState(false);

  // Helper to fetch authorization headers
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  // Local Storage Persistence
  useEffect(() => {
    const saved = sessionStorage.getItem('g4_state');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.sessionState !== 'lobby' && parsed.sessionState !== 'game_over') {
          setSessionId(parsed.sessionId);
          setSessionState(parsed.sessionState);
          setCurrentRound(parsed.currentRound);
          setTotalRounds(parsed.totalRounds || 3);
          setGooglyRating(parsed.googlyRating);
          setCurrentQuestion(parsed.currentQuestion);
          setUsedLifelines(parsed.usedLifelines || { '50_50': false, 'hint': false });
          setSeenQuestionIds(parsed.seenQuestionIds || []);
          setWinsCount(parsed.winsCount || 0);
          setConsecutiveCorrect(parsed.consecutiveCorrect || 0);
          setUnder10sCount(parsed.under10sCount || 0);
          setUnder5sCount(parsed.under5sCount || 0);
        }
      } catch (e) { console.error("Failed to parse session", e); }
    }
  }, []);

  useEffect(() => {
    if (sessionId) {
      sessionStorage.setItem('g4_state', JSON.stringify({
        sessionId, sessionState, currentRound, totalRounds, googlyRating, currentQuestion, usedLifelines,
        seenQuestionIds, winsCount, consecutiveCorrect, under10sCount, under5sCount
      }));
    }
  }, [sessionId, sessionState, currentRound, totalRounds, googlyRating, currentQuestion, usedLifelines, seenQuestionIds, winsCount, consecutiveCorrect, under10sCount, under5sCount]);

  // Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sessionState === 'playing' && typewriterDone && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(t => t - 1);
      }, 1000);
    } else if (sessionState === 'playing' && typewriterDone && timerSeconds === 0) {
      // Auto-submit blank/selected option when timer runs out
      submitAnswer();
    }
    return () => clearInterval(interval);
  }, [sessionState, typewriterDone, timerSeconds]);

  // Track round start time when question is ready
  useEffect(() => {
    if (sessionState === 'playing' && typewriterDone) {
      setRoundStartTime(Date.now());
      setTimerSeconds(30);
    }
  }, [sessionState, typewriterDone]);

  // Speech-to-Text handler
  const startListening = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        recognition.onstart = () => {
          setIsListening(true);
        };
        recognition.onresult = (event: any) => {
          const text = event.results[0][0].transcript;
          setOpenAnswer(prev => prev + (prev ? ' ' : '') + text);
        };
        recognition.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          setIsListening(false);
        };
        recognition.onend = () => {
          setIsListening(false);
        };
        recognition.start();
      } else {
        alert("Speech recognition is not supported in this browser.");
      }
    }
  };

  // Record progress to Next.js dashboard backend
  const recordProgress = async (payload: { pointsAwarded: number; summary: string; score: number; focusAreas: string[] }) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) return;

    try {
      await apiRequest('/api/dashboard/activity', {
        method: 'POST',
        token,
        suppressErrors: true,
        body: {
          gameKey: 'game4',
          title: 'GOOGLY MASTER',
          score: payload.score,
          pointsAwarded: payload.pointsAwarded,
          summary: payload.summary,
          focusAreas: payload.focusAreas,
          gameplayMetadata: {
            under10s_count: under10sCount,
            speed_demon_count: under5sCount,
            googly_guru_win: payload.score >= 80,
            three_in_a_row: consecutiveCorrect >= 3
          }
        },
      });
    } catch (error) {
      console.error('Failed to record game4 progress:', error);
    }
  };

  // 1. Fetch Question from Python Backend
  const loadQuestion = async (round: number, customSeenIds?: string[]) => {
    if (round > totalRounds) {
      setSessionState('game_over');
      return;
    }

    try {
      const querySeen = (customSeenIds || seenQuestionIds).join(',');
      const response = await fetch(`http://localhost:5000/api/game4/question/${round}?seen=${querySeen}`, {
        headers: getAuthHeaders()
      });
      const result = await response.json();

      if (result.status === 'success') {
        const question = result.data;
        setCurrentQuestion(question);
        setSeenQuestionIds(prev => Array.from(new Set([...prev, question.id])));
        setConfidenceBet(null);
        setSelectedOptionId(null);
        setOpenAnswer('');
        setHintText(null);
        setRevealResult(null);
        setTypewriterDone(false);
        setTimerSeconds(30);
        
        const initialStates: Record<string, OptionState> = {};
        question.options?.forEach((opt: any) => initialStates[opt.id] = 'default');
        setOptionStates(initialStates);
        
        setSessionState('playing');
      } else if (result.message === "Game Over") {
        setSessionState('game_over');
      }
    } catch (error) {
      console.error("Failed to load question:", error);
    }
  };

  // 2. Start Session from Python Backend
  const startGame = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/game4/start', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setSessionId(`g4_${Date.now()}`);
        setGooglyRating(result.data.startingRating);
        setTotalRounds(result.data.totalRounds);
        setCurrentRound(1);
        setUsedLifelines({ '50_50': false, 'hint': false });
        setSeenQuestionIds([]);
        setWinsCount(0);
        setConsecutiveCorrect(0);
        setUnder10sCount(0);
        setUnder5sCount(0);
        setPendingLevelUp(false);
        await loadQuestion(1, []);
      }
    } catch (error) {
      console.error("Start Game Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectOption = (id: string) => {
    if (sessionState !== 'playing' || !typewriterDone || optionStates[id] === 'eliminated') return;
    
    setSelectedOptionId(id);
    setOptionStates((prev: Record<string, OptionState>) => {
      const next = { ...prev };
      Object.keys(next).forEach(k => {
        if (next[k] !== 'eliminated') next[k] = k === id ? 'selected' : 'default';
      });
      return next;
    });
  };

  // 3. Process Lifelines with Python Backend
  const useLifeline = async (type: LifelineType) => {
    if (!currentQuestion || usedLifelines[type]) return;

    try {
      const response = await fetch('http://localhost:5000/api/game4/lifeline', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ type, questionId: currentQuestion.id })
      });
      
      const result = await response.json();

      if (result.status === 'success') {
        setUsedLifelines((prev: Record<LifelineType, boolean>) => ({ ...prev, [type]: true }));
        
        if (type === '50_50') {
          setOptionStates((prev: Record<string, OptionState>) => {
            const newState = { ...prev };
            result.data.eliminated.forEach((id: string) => { newState[id] = 'eliminated'; });
            return newState;
          });
        } else if (type === 'hint') {
          setHintText(result.data.hintText);
        }
      }
    } catch (error) {
      console.error("Lifeline error:", error);
    }
  };

  // 4. Submit Answer for AI Evaluation to Python Backend
  const submitAnswer = async () => {
    if (!currentQuestion || isSubmitting) return;
    if (currentQuestion.type === 'mcq' && !selectedOptionId && timerSeconds > 0) return;
    if (currentQuestion.type === 'open' && !openAnswer && timerSeconds > 0) return;
    
    setIsSubmitting(true);

    // Calculate response speed
    const now = Date.now();
    const timeTaken = roundStartTime ? (now - roundStartTime) / 1000 : 999;
    
    if (timeTaken < 10) setUnder10sCount(c => c + 1);
    if (timeTaken < 5) setUnder5sCount(c => c + 1);

    try {
      const response = await fetch('http://localhost:5000/api/game4/evaluate', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          questionId: currentQuestion.id,
          selectedOptionId,
          openAnswer,
          confidenceBet: confidenceBet || 1, // Fallback if timer runs out
          currentRating: googlyRating
        })
      });
      
      const result = await response.json();

      if (result.status === 'success') {
        const evalData = result.data;
        
        setRevealResult({
          correctOptionId: evalData.correctOptionId,
          trapOptionId: evalData.trapOptionId,
          isCorrect: evalData.isCorrect,
          isTrap: evalData.isTrap,
          trapExplanation: evalData.trapExplanation,
          playerInsight: evalData.playerInsight,
          ratingDelta: evalData.ratingDelta,
          newRating: evalData.newRating,
          confidenceBonus: evalData.confidenceBonus,
          totalXpAwarded: evalData.totalXpAwarded,
          score: evalData.score,
          idealResponse: evalData.idealResponse
        });
        
        setGooglyRating((prev: number) => Math.max(0, Math.min(100, evalData.newRating)));

        if (!evalData.isCorrect) {
          setWeakCategories((prev: string[]) => Array.from(new Set([...prev, currentQuestion?.category || 'reasoning'])));
          setConsecutiveCorrect(0);
        } else {
          // Increment wins
          const nextWins = winsCount + 1;
          setWinsCount(nextWins);
          setConsecutiveCorrect(c => c + 1);
          
          // If they reached 3 wins (correct answers), flag for level-up animation when advancing!
          if (nextWins === 3) {
            setPendingLevelUp(true);
          }
        }
        
        if (currentQuestion.type === 'mcq') {
          setOptionStates((prev: Record<string, OptionState>) => {
            const res = { ...prev };
            res[evalData.correctOptionId] = 'correct';
            if (evalData.isTrap && selectedOptionId) res[selectedOptionId] = 'trap';
            return res;
          });
        }
        
        setSessionState('revealing');
      }
    } catch (error) {
      console.error("Evaluation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const advanceToNextQuestion = () => {
    if (currentRound >= totalRounds) {
      setSessionState('game_over');
      sessionStorage.removeItem('g4_state');
      void recordProgress({
        pointsAwarded: revealResult?.totalXpAwarded || 0,
        summary: revealResult?.playerInsight || 'GOOGLY MASTER session completed.',
        score: googlyRating,
        focusAreas: Array.from(new Set([...(weakCategories.length > 0 ? weakCategories : []), currentQuestion?.category || 'reasoning'])),
      });
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
      hintText, usedLifelines, revealResult, isSubmitting, timerSeconds, winsCount,
      consecutiveCorrect, showLevelUpAnimation, isListening, seenQuestionIds,
      pendingLevelUp, setPendingLevelUp,
      setConfidenceBet, selectOption, setOpenAnswer, setTypewriterDone,
      useLifeline, submitAnswer, startGame, advanceToNextQuestion, abandonGame,
      startListening, setShowLevelUpAnimation
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