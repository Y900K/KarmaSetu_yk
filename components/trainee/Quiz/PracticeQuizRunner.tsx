'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useChatbot } from '@/context/ChatbotContext';

export type GeneratedQuestion = {
  q: string;
  options: string[];
  correct: number;
  explanation: string;
};

interface PracticeQuizRunnerProps {
  topic: string;
  quiz: GeneratedQuestion[];
  totalQuestions: number;
  isGenerating: boolean;
  generationError: string | null;
  onRetry: () => void;
  onNewTopic: () => void;
}

export default function PracticeQuizRunner({
  topic,
  quiz,
  totalQuestions,
  isGenerating,
  generationError,
  onRetry,
  onNewTopic,
}: PracticeQuizRunnerProps) {
  const { language } = useLanguage();
  const { setIsBuddyVisible, setIsQuizActive } = useChatbot();
  const isHi = language === 'HINGLISH';

  const [currentQ, setCurrentQ] = useState(0);
  
  // Use lazy initializer to size answers array based on totalQuestions
  const [answers, setAnswers] = useState<(number | null)[]>(() => {
    if (totalQuestions <= 0) return [];
    return new Array(totalQuestions).fill(null);
  });
  const [showAnswer, setShowAnswer] = useState(false);
  const [finished, setFinished] = useState(false);

  // Auto-hide Buddy AI during quiz to prevent cheating and save space
  useEffect(() => {
    if (!finished) {
      setIsBuddyVisible(false);
      setIsQuizActive(true);
    } else {
      setIsBuddyVisible(true);
      setIsQuizActive(false);
    }

    return () => {
      setIsBuddyVisible(true);
      setIsQuizActive(false);
    };
  }, [finished, setIsBuddyVisible, setIsQuizActive]);

  // totalQuestions is expected to remain stable for a quiz run; if it does change,
  // the parent typically remounts this component. We derive normalized values instead
  // of setting state inside effects.
  const normalizedTotalQuestions = Math.max(1, totalQuestions);
  const safeCurrentQ = Math.min(currentQ, normalizedTotalQuestions - 1);

  const normalizedAnswers = answers.length === normalizedTotalQuestions
    ? answers
    : answers.slice(0, normalizedTotalQuestions).concat(new Array(Math.max(0, normalizedTotalQuestions - answers.length)).fill(null));

  const question = quiz[safeCurrentQ];
  const generatedCount = quiz.length;
  const answeredCount = normalizedAnswers.filter((answer) => answer !== null).length;
  const correctCount = quiz.reduce((count, item, index) => count + (normalizedAnswers[index] === item.correct ? 1 : 0), 0);
  const score = useMemo(() => Math.round((correctCount / normalizedTotalQuestions) * 100), [correctCount, normalizedTotalQuestions]);
  const isCorrect = question ? normalizedAnswers[safeCurrentQ] === question.correct : false;

  const selectAnswer = (index: number) => {
    if (!question || showAnswer) return;
    const nextAnswers = [...normalizedAnswers];
    nextAnswers[safeCurrentQ] = index;
    setAnswers(nextAnswers);
    setShowAnswer(true);
  };

  const nextQuestion = () => {
    setShowAnswer(false);

    if (safeCurrentQ < normalizedTotalQuestions - 1) {
      setCurrentQ((prev) => prev + 1);
      return;
    }

    if (generatedCount === totalQuestions) {
      setFinished(true);
    }
  };

  if (finished) {
    const passed = score >= 80;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-xl py-10 text-center">
        <div
          className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full border-4 text-5xl shadow-xl ${
            passed
              ? 'border-emerald-500/40 bg-emerald-500/20 text-emerald-400'
              : 'border-amber-500/40 bg-amber-500/20 text-amber-400'
          }`}
        >
          {passed ? '🏆' : '📚'}
        </div>

        <h2 className="mb-1 text-2xl font-black tracking-tight text-white">
          {passed ? (isHi ? 'बहुत बढ़िया!' : 'Excellent Work!') : (isHi ? 'और अभ्यास करें' : 'Keep Practicing')}
        </h2>
        <p className="mb-6 px-8 text-sm text-slate-400">
          {isHi ? 'आपने इस विषय का टेस्ट पूरा कर लिया है:' : 'You completed the AI-generated assessment for'}{' '}
          <strong className="text-slate-200">&ldquo;{topic}&rdquo;</strong>.
        </p>

        <div className="relative mb-8 overflow-hidden rounded-3xl border border-[#334155] bg-[#1e293b]/80 p-6 shadow-2xl backdrop-blur-sm">
          <div
            className={`pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl opacity-20 ${
              passed ? 'bg-emerald-500' : 'bg-amber-500'
            }`}
          />

          <div className={`relative z-10 mb-1 text-5xl font-black ${passed ? 'text-emerald-500' : 'text-amber-500'}`}>{score}%</div>
          <div className="relative z-10 mb-4 border-b border-[#334155] pb-4 text-sm font-medium tracking-wide text-slate-400">
            {correctCount} {isHi ? 'सही उत्तर' : 'out of'} {totalQuestions} {isHi ? 'में से' : 'correct'}
          </div>
          <div className="relative z-10 h-3 overflow-hidden rounded-full bg-[#0f172a] shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
              className={`h-full rounded-full ${passed ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-amber-600 to-amber-400'}`}
            />
          </div>
        </div>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={onRetry}
            className="flex items-center justify-center gap-2 rounded-xl border border-[#334155] bg-[#1e293b] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:border-cyan-500/40 hover:bg-[#273549] active:scale-95"
          >
            <span>🔄</span> {isHi ? 'फिर से 10 प्रश्न बनाएं' : 'Generate 10 Fresh Questions'}
          </button>
          <button
            onClick={onNewTopic}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-6 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:brightness-110 active:scale-95"
          >
            <span>✨</span> {isHi ? 'नया विषय चुनें' : 'Generate New Topic'}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="mx-auto mt-2 max-w-4xl px-2 sm:px-0">
      <div className="mb-4 rounded-2xl border border-[#334155] bg-[#1e293b]/50 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <button
              onClick={onNewTopic}
              className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-400 drop-shadow-sm transition-colors hover:text-cyan-400"
            >
              <span>←</span> {isHi ? 'अभ्यास रद्द करें' : 'Cancel Practice'}
            </button>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">🤖</span>
              <h2 className="max-w-[200px] break-words text-sm font-bold tracking-tight text-white line-clamp-1 sm:max-w-md sm:text-base">
                {topic}
              </h2>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
              {generatedCount}/{totalQuestions} {isHi ? 'ready' : 'ready'}
            </span>
            <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300">
              {correctCount} {isHi ? 'correct' : 'correct'}
            </span>
            <div className="text-right">
              <div className="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                {isHi ? 'प्रगति' : 'Progress'}
              </div>
              <div className="flex items-baseline justify-end gap-1">
                <span className="text-base font-black text-white sm:text-lg">{Math.min(currentQ + 1, totalQuestions)}</span>
                <span className="text-xs text-slate-500 sm:text-sm">/ {totalQuestions}</span>
              </div>
            </div>
          </div>
        </div>

        {generationError && (
          <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-bold text-amber-300">{isHi ? 'Question generation रुक गई' : 'Question generation paused'}</div>
              <p className="text-xs leading-relaxed text-amber-100">{generationError}</p>
            </div>
            <button
              onClick={onRetry}
              className="rounded-xl border border-amber-400/30 bg-[#0f172a] px-4 py-2 text-xs font-semibold text-amber-200 transition-colors hover:bg-[#172033]"
            >
              {isHi ? 'फिर से generate करें' : 'Retry Generation'}
            </button>
          </div>
        )}
      </div>

      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-[#1e293b] shadow-inner">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
          initial={{ width: `${(currentQ / totalQuestions) * 100}%` }}
          animate={{ width: `${((Math.min(currentQ, totalQuestions - 1) + 1) / totalQuestions) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {!question ? (
        <motion.div
          key={`waiting-${currentQ}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#334155] bg-[#1e293b] p-6 shadow-2xl sm:p-8"
        >
          <div className="mb-4 text-7xl opacity-[0.04]">🧠</div>
          <h3 className="mb-3 text-xl font-bold text-white">
            {generationError
              ? isHi
                ? `प्रश्न ${currentQ + 1} तैयार नहीं हो पाया`
                : `Question ${currentQ + 1} could not be prepared`
              : isHi
              ? `प्रश्न ${currentQ + 1} तैयार हो रहा है`
              : `Question ${currentQ + 1} is being generated`}
          </h3>
          <p className="mb-6 max-w-xl text-sm leading-relaxed text-slate-400">
            {generationError
              ? isHi
                ? 'अब तक बने प्रश्न सुरक्षित हैं, लेकिन इस slot के बिना quiz पूरा नहीं हो सकता. आप retry करके generation फिर से शुरू कर सकते हैं.'
                : 'The questions generated so far are safe, but the quiz cannot finish without this slot. Retry to generate a fresh 10-question set.'
              : isHi
              ? 'आपने पिछले प्रश्न का answer दे दिया है. Buddy AI अगला प्रश्न background में तैयार कर रहा है, इसलिए session जारी रखें.'
              : 'You already answered the previous question. Buddy AI is preparing the next one in the background, so the session will continue automatically.'}
          </p>

          {isGenerating && !generationError && (
            <div className="mb-6 flex items-center gap-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
              <div className="relative h-10 w-10 shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-500/30" />
                <div className="absolute inset-0 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
              </div>
              <div>
                <div className="text-sm font-semibold text-cyan-200">
                  {isHi ? 'Background generation चालू है' : 'Background generation is running'}
                </div>
                <div className="text-xs text-cyan-100/80">
                  {isHi
                    ? `${generatedCount} of ${totalQuestions} प्रश्न ready हैं.`
                    : `${generatedCount} of ${totalQuestions} questions are ready.`}
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onRetry}
              className="rounded-xl border border-[#334155] bg-[#0f172a] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#172033]"
            >
              {isHi ? '10 नए प्रश्न बनाएं' : 'Generate 10 Fresh Questions'}
            </button>
            <button
              onClick={onNewTopic}
              className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-3 text-sm font-bold text-cyan-300 transition-colors hover:bg-cyan-500/20"
            >
              {isHi ? 'दूसरा topic चुनें' : 'Pick Another Topic'}
            </button>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="relative rounded-3xl border border-[#334155] bg-[#1e293b] p-5 shadow-2xl sm:p-8"
          >
            <div className="pointer-events-none absolute right-6 top-6 select-none text-7xl opacity-[0.02]">🧠</div>

            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#334155] bg-[#0f172a] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {isHi ? `${answeredCount}/${totalQuestions} answered` : `${answeredCount}/${totalQuestions} answered`}
              </span>
              {isGenerating && (
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-cyan-300">
                  {isHi ? 'बाकी प्रश्न generate हो रहे हैं' : 'More questions are generating'}
                </span>
              )}
            </div>

            <h3 className="relative z-10 mb-5 w-[90%] text-lg font-bold leading-snug text-white sm:text-xl">{question.q}</h3>

            <div className="relative z-10 space-y-2.5">
              {question.options.map((option, index) => {
                let buttonClass = 'border-[#334155] text-slate-300 hover:border-cyan-500/40 hover:bg-[#273549]';
                let iconClass = 'border-slate-600 text-slate-400 group-hover:border-cyan-500/50 group-hover:text-cyan-400';

                if (showAnswer) {
                  if (index === question.correct) {
                    buttonClass = 'border-emerald-500 bg-emerald-500/10 text-white shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                    iconClass = 'border-emerald-500 bg-emerald-500 text-white';
                  } else if (index === normalizedAnswers[safeCurrentQ]) {
                    iconClass = 'border-[#334155] text-slate-500';
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => selectAnswer(index)}
                    disabled={showAnswer}
                    className={`group flex w-full cursor-pointer items-center gap-4 rounded-xl border px-4 py-3 text-left text-sm transition-all duration-200 disabled:cursor-default sm:py-4 sm:text-base ${buttonClass}`}
                  >
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-colors ${iconClass}`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 font-medium leading-relaxed">{option}</span>
                    {showAnswer && index === question.correct && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">
                        ✅
                      </motion.span>
                    )}
                    {showAnswer && index === normalizedAnswers[safeCurrentQ] && index !== question.correct && (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">
                        ❌
                      </motion.span>
                    )}
                  </button>
                );
              })}
            </div>

            <AnimatePresence>
              {showAnswer && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  className="overflow-hidden"
                >
                  <div className={`rounded-2xl p-4 sm:p-5 ${isCorrect ? 'border border-emerald-500/20 bg-emerald-500/10' : 'border border-red-500/20 bg-red-500/10'}`}>
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 text-xl">🤖</span>
                      <div>
                        <h4 className={`mb-1 text-sm font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                          {isCorrect
                            ? isHi
                              ? 'सही उत्तर!'
                              : 'Correct!'
                            : isHi
                            ? `गलत - सही उत्तर ${String.fromCharCode(65 + question.correct)} था।`
                            : `Incorrect — The right answer was ${String.fromCharCode(65 + question.correct)}.`}
                        </h4>
                        <p className="text-sm font-medium leading-relaxed text-slate-300">{question.explanation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={nextQuestion}
                      className="group flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-bold text-[#0f172a] shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all hover:bg-cyan-400 active:scale-95"
                    >
                      {currentQ < totalQuestions - 1
                        ? isHi
                          ? 'अगला प्रश्न'
                          : 'Next Question'
                        : isHi
                        ? 'परिणाम देखें'
                        : 'View Results'}
                      <span className="transition-transform group-hover:translate-x-1">→</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
