'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import PracticeQuizRunner, { GeneratedQuestion } from '@/components/trainee/Quiz/PracticeQuizRunner';
import TraineeLayout from '@/components/trainee/layout/TraineeLayout';
import { useLanguage } from '@/context/LanguageContext';

const TOTAL_QUESTIONS = 10;

type PracticeQuizSession = {
  topic: string;
  questions: GeneratedQuestion[];
  totalQuestions: number;
  isGenerating: boolean;
  generationError: string | null;
};

function PracticeQuizContent() {
  const { language } = useLanguage();
  const isHi = language === 'HINGLISH';

  const [topic, setTopic] = useState('');
  const [isStartingQuiz, setIsStartingQuiz] = useState(false);
  const [quizData, setQuizData] = useState<PracticeQuizSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const generationRequestIdRef = useRef(0);

  useEffect(() => {
    return () => {
      generationRequestIdRef.current += 1;
    };
  }, []);

  const fetchNextQuestion = useCallback(
    async (normalizedTopic: string, existingQuestions: string[]) => {
      const res = await fetch('/api/trainee/practice-quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: normalizedTopic,
          language,
          count: 1,
          existingQuestions,
          questionNumber: existingQuestions.length + 1,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate quiz.');
      }

      const nextQuestion = Array.isArray(data.quiz) ? data.quiz[0] : null;
      if (!nextQuestion) {
        throw new Error('No question was returned by the AI generator.');
      }

      return nextQuestion as GeneratedQuestion;
    },
    [language]
  );

  const startProgressiveQuiz = useCallback(
    async (rawTopic: string) => {
      const normalizedTopic = rawTopic.trim();
      if (!normalizedTopic) return;

      generationRequestIdRef.current += 1;
      const requestId = generationRequestIdRef.current;
      const collectedQuestions: GeneratedQuestion[] = [];

      setError(null);
      setQuizData(null);
      setIsStartingQuiz(true);

      for (let index = 0; index < TOTAL_QUESTIONS; index += 1) {
        try {
          const nextQuestion = await fetchNextQuestion(
            normalizedTopic,
            collectedQuestions.map((question) => question.q)
          );

          if (generationRequestIdRef.current !== requestId) {
            return;
          }

          collectedQuestions.push(nextQuestion);

          setQuizData({
            topic: normalizedTopic,
            questions: [...collectedQuestions],
            totalQuestions: TOTAL_QUESTIONS,
            isGenerating: index < TOTAL_QUESTIONS - 1,
            generationError: null,
          });

          if (index === 0) {
            setIsStartingQuiz(false);
            setTopic('');
          }
        } catch (err: unknown) {
          if (generationRequestIdRef.current !== requestId) {
            return;
          }

          const message =
            err instanceof Error
              ? err.message
              : 'An error occurred during AI generation. Sarvam AI may be restructuring the response.';

          if (collectedQuestions.length === 0) {
            setError(message);
            setQuizData(null);
          } else {
            setQuizData({
              topic: normalizedTopic,
              questions: [...collectedQuestions],
              totalQuestions: TOTAL_QUESTIONS,
              isGenerating: false,
              generationError: message,
            });
          }

          setIsStartingQuiz(false);
          return;
        }
      }

      if (generationRequestIdRef.current !== requestId) {
        return;
      }

      setQuizData({
        topic: normalizedTopic,
        questions: [...collectedQuestions],
        totalQuestions: TOTAL_QUESTIONS,
        isGenerating: false,
        generationError: null,
      });
      setIsStartingQuiz(false);
    },
    [fetchNextQuestion]
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    await startProgressiveQuiz(topic);
  };

  const handleRetry = useCallback(() => {
    if (!quizData) return;
    void startProgressiveQuiz(quizData.topic);
  }, [quizData, startProgressiveQuiz]);

  const handleNewTopic = useCallback(() => {
    generationRequestIdRef.current += 1;
    setIsStartingQuiz(false);
    setQuizData(null);
    setError(null);
  }, []);

  if (quizData) {
    return (
      <PracticeQuizRunner
        topic={quizData.topic}
        quiz={quizData.questions}
        totalQuestions={quizData.totalQuestions}
        isGenerating={quizData.isGenerating}
        generationError={quizData.generationError}
        onRetry={handleRetry}
        onNewTopic={handleNewTopic}
      />
    );
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-16 xl:max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-12 text-center">
        <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl border border-cyan-400/50 bg-gradient-to-br from-cyan-400/30 to-blue-500/30 shadow-[0_0_40px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/20">
          <span className="text-4xl filter drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]">🤖</span>
        </div>
        <h1 className="mb-4 text-3xl font-black tracking-tight text-white sm:text-4xl md:text-5xl">
          {isHi ? 'AI अभ्यास ' : 'AI Practice '}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            {isHi ? 'क्विज़' : 'Quizzes'}
          </span>
        </h1>
        <p className="mx-auto max-w-xl text-sm leading-relaxed text-slate-400 sm:text-base">
          {isHi
            ? 'नीचे कोई भी औद्योगिक सुरक्षा विषय टाइप करें। Buddy AI आपके लिए 10 प्रश्नों का क्विज़ बनाएगा, और पहला प्रश्न तैयार होते ही quiz शुरू हो जाएगा।'
            : 'Type any industrial safety topic below. Buddy AI will build a 10-question quiz, and the session will start as soon as the first question is ready.'}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-[#1e293b]/90 via-[#172338]/85 to-[#101a2a]/90 p-6 shadow-[0_28px_80px_rgba(2,6,23,0.65),0_0_50px_rgba(6,182,212,0.12)] backdrop-blur-md ring-1 ring-cyan-400/10 sm:p-10"
      >
        <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -right-20 bottom-6 h-44 w-44 rounded-full bg-blue-500/10 blur-3xl" />

        {isStartingQuiz && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-[#020817]/80 backdrop-blur-sm">
            <div className="relative mb-6 h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30" />
              <div className="absolute inset-0 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-xl animate-pulse">⚙️</div>
            </div>
            <h3 className="mb-1 flex items-center gap-2 text-lg font-bold tracking-wide text-white">
              {isHi ? 'पहला प्रश्न तैयार हो रहा है' : 'Preparing Your First Question'}
              <span className="flex gap-1">
                <span className="animate-bounce delay-100">.</span>
                <span className="animate-bounce delay-200">.</span>
                <span className="animate-bounce delay-300">.</span>
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {isHi ? 'पहला प्रश्न आते ही quiz शुरू हो जाएगा, बाकी प्रश्न background में बनते रहेंगे।' : 'The quiz will open as soon as question 1 is ready, while the rest keep generating in the background.'}
            </p>
          </div>
        )}

        <form onSubmit={handleGenerate} className="relative z-10">
          <div className="relative mb-6">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-lg text-slate-400">💡</div>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              disabled={isStartingQuiz}
              placeholder={
                isHi
                  ? 'जैसे: फायर सेफ्टी, LOTO, या एर्गोनॉमिक्स...'
                  : 'e.g. Hazardous Waste Disposal, Forklift Operation, Fire Safety...'
              }
              className="w-full rounded-2xl border border-cyan-500/20 bg-[#0b1424]/95 py-4 pl-14 pr-6 text-sm font-medium text-white shadow-[inset_0_0_0_1px_rgba(56,189,248,0.06),0_0_0_0_rgba(6,182,212,0)] transition-all placeholder:text-slate-500 focus:border-cyan-400/70 focus:outline-none focus:ring-4 focus:ring-cyan-500/20 focus:shadow-[inset_0_0_0_1px_rgba(34,211,238,0.24),0_0_28px_rgba(6,182,212,0.18)] disabled:opacity-50 sm:py-5 sm:text-base"
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 overflow-hidden"
              >
                <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                  <span className="shrink-0 text-red-400">⚠️</span>
                  <p className="text-sm font-medium leading-relaxed text-red-200">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isStartingQuiz || !topic.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-cyan-400 to-sky-500 py-4 text-sm font-black tracking-wide text-[#071426] shadow-[0_14px_32px_rgba(6,182,212,0.28),0_0_36px_rgba(56,189,248,0.28)] transition-all hover:from-cyan-400 hover:via-sky-400 hover:to-blue-400 hover:shadow-[0_18px_40px_rgba(6,182,212,0.38),0_0_44px_rgba(56,189,248,0.36)] disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98] sm:py-5 sm:text-base"
          >
            <span>✨</span>
            {isHi ? '10-प्रश्न AI क्विज़ शुरू करें' : 'Start 10-Question AI Quiz'}
          </button>
        </form>

        <div className="mt-10 border-t border-cyan-500/15 pt-10">
          <span className="mb-6 block text-center text-xs font-bold uppercase tracking-widest text-[#06b6d4]">
            {isHi ? 'सुझाए गए औद्योगिक विषय' : 'Suggested Industrial Topics'}
          </span>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-2">
              <h4 className="mb-1 px-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                {isHi ? 'स्वास्थ्य व सुरक्षा' : 'Health & Safety'}
              </h4>
              {(isHi
                ? ['फायर एक्सटिंग्विशर प्रकार', 'कार्यस्थल एर्गोनॉमिक्स', 'कन्फाइंड स्पेस एंट्री']
                : ['Fire Extinguisher Types', 'Ergonomics on the Floor', 'Confined Space Entry']
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isStartingQuiz}
                  onClick={() => setTopic(suggestion)}
                  className="rounded-xl border border-[#273549] bg-gradient-to-br from-[#131c2d] to-[#0f1a2d] px-4 py-3 text-left text-xs font-medium leading-relaxed text-slate-300 shadow-[0_0_0_rgba(56,189,248,0)] transition-all hover:border-cyan-400/45 hover:bg-[#1e293b] hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.12)] disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="mb-1 px-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                {isHi ? 'आपकी प्लांट' : 'Your Plant'}
              </h4>
              {(isHi
                ? ['केमिकल मिक्सिंग SOP', 'रेज़िन हैंडलिंग', 'वेंटिलेशन प्रक्रियाएं']
                : ['Chemical Mixing SOP', 'Safe Resin Handling', 'Venting Procedures']
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isStartingQuiz}
                  onClick={() => setTopic(suggestion)}
                  className="rounded-xl border border-[#273549] bg-gradient-to-br from-[#131c2d] to-[#0f1a2d] px-4 py-3 text-left text-xs font-medium leading-relaxed text-slate-300 shadow-[0_0_0_rgba(56,189,248,0)] transition-all hover:border-cyan-400/45 hover:bg-[#1e293b] hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.12)] disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="mb-1 px-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                {isHi ? 'निर्माण इकाइयाँ' : 'Manufacturing'}
              </h4>
              {(isHi
                ? ['खतरनाक अपशिष्ट निपटान', 'LOTO सुरक्षा', 'मशीन गार्डिंग']
                : ['Hazardous Waste Disposal', 'Lockout/Tagout (LOTO)', 'Machine Guarding Safety']
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isStartingQuiz}
                  onClick={() => setTopic(suggestion)}
                  className="rounded-xl border border-[#273549] bg-gradient-to-br from-[#131c2d] to-[#0f1a2d] px-4 py-3 text-left text-xs font-medium leading-relaxed text-slate-300 shadow-[0_0_0_rgba(56,189,248,0)] transition-all hover:border-cyan-400/45 hover:bg-[#1e293b] hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.12)] disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="mb-1 px-1 text-[11px] font-black uppercase tracking-wider text-slate-500">
                {isHi ? 'बुनियादी ट्रेनिंग' : 'Apprenticeship'}
              </h4>
              {(isHi
                ? ['फैक्ट्री नेविगेशन', 'बुनियादी उपकरण सुरक्षा', 'PPE मानक']
                : ['Factory Floor Navigation', 'Basic Hand Tool Safety', 'PPE Standards']
              ).map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isStartingQuiz}
                  onClick={() => setTopic(suggestion)}
                  className="rounded-xl border border-[#273549] bg-gradient-to-br from-[#131c2d] to-[#0f1a2d] px-4 py-3 text-left text-xs font-medium leading-relaxed text-slate-300 shadow-[0_0_0_rgba(56,189,248,0)] transition-all hover:border-cyan-400/45 hover:bg-[#1e293b] hover:text-cyan-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.12)] disabled:opacity-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function PracticeQuizPage() {
  return (
    <TraineeLayout>
      <PracticeQuizContent />
    </TraineeLayout>
  );
}
