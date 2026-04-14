'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Course } from '@/data/coursePlayerDummyData';

interface QuizViewProps {
  course: Course;
  onComplete: (score: number, passed: boolean, reason: 'manual' | 'auto_timeout', userAnswers: Record<number, number>) => void;
  onExit: () => void;
}

export default function QuizView({ course, onComplete, onExit }: QuizViewProps) {
  const quiz = course.quiz;
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(course.quizTimeLimit * 60);
  const [showError, setShowError] = useState(false);

  const submitQuiz = useCallback((reason: 'manual' | 'auto_timeout' = 'manual') => {
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct) score += 1;
    });
    const percent = Math.round((score / quiz.questions.length) * 100);
    const passed = percent >= course.passingScore;
    onComplete(score, passed, reason, answers);
  }, [answers, course.passingScore, onComplete, quiz.questions]);

  // Timer loop
  useEffect(() => {
    if (timeLeft <= 0) {
      submitQuiz('auto_timeout'); // Auto submit
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [submitQuiz, timeLeft]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSelect = (qIndex: number, optIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optIndex });
    setShowError(false);
  };

  const handleNext = () => {
    if (answers[currentQ] === undefined) {
      setShowError(true);
      setTimeout(() => setShowError(false), 500); // For shake animation
      return;
    }
    
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      submitQuiz();
    }
  };

  const q = quiz.questions[currentQ];

  return (
    <div className="fixed inset-0 top-[52px] z-[60] bg-[#0a1520] flex flex-col overflow-y-auto">
      {/* Quiz Top Bar */}
      <div className="h-16 border-b border-[#1e2d3d] flex items-center justify-between px-4 sm:px-8 bg-[#0d1b2a] shrink-0 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <span className="text-xl">📝</span>
          <span className="text-white font-bold hidden sm:inline">Final Assessment</span>
        </div>
        
        <div className="text-slate-300 font-medium text-sm">
          Question {currentQ + 1} of {quiz.questions.length}
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 120 ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`}>
            <span>⏱</span> {formatTime(timeLeft)}
          </div>
          <button onClick={onExit} className="text-slate-500 hover:text-white px-2 cursor-pointer text-sm">✕ Exit</button>
        </div>
      </div>

      <progress
        className="w-full h-1 [&::-webkit-progress-bar]:bg-[#1e2d3d] [&::-webkit-progress-value]:bg-cyan-500 [&::-moz-progress-bar]:bg-cyan-500"
        value={currentQ + 1}
        max={quiz.questions.length}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col items-center p-4 sm:p-8 mt-4 sm:mt-10">
        <div className={`w-full max-w-3xl bg-[#0d1b2a] border border-[#1e2d3d] rounded-2xl p-6 sm:p-10 shadow-2xl ${showError ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
          
          <h2 className="text-[18px] sm:text-[22px] font-bold text-white leading-relaxed mb-8">
            {q.text}
          </h2>

          <div className="flex flex-col gap-3 sm:gap-4">
            {q.options.map((opt, idx) => {
              const isSelected = answers[currentQ] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(currentQ, idx)}
                  className={`w-full text-left p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center justify-between group cursor-pointer ${
                    isSelected 
                      ? 'bg-[#00c8ff] border-[#00c8ff] text-[#0d1b2a] shadow-[0_4px_16px_rgba(0,200,255,0.4)] scale-[1.01]' 
                      : 'bg-[#1e2d3d] border-[#334155] text-slate-200 hover:border-[#00c8ff]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border-2 transition-colors ${
                      isSelected ? 'border-[#0d1b2a]/30 bg-[#0d1b2a] text-[#00c8ff]' : 'border-[#334155] bg-[#0d1b2a] text-slate-400 group-hover:text-cyan-400 group-hover:border-cyan-400/50'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className={`text-[15px] sm:text-[16px] font-medium leading-snug ${isSelected ? 'text-[#0d1b2a]' : 'text-slate-200'}`}>
                      {opt}
                    </span>
                  </div>
                  {isSelected && <span className="text-xl font-bold ml-2">✓</span>}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-10 pt-6 border-t border-[#1e2d3d]">
            <button
              onClick={() => setCurrentQ((q) => Math.max(0, q - 1))}
              disabled={currentQ === 0}
              className="px-6 py-3 rounded-xl font-medium text-slate-400 border border-[#334155] disabled:opacity-30 disabled:border-transparent cursor-pointer hover:bg-white/5 transition-colors"
            >
              ← Previous
            </button>
            
            <button
              onClick={handleNext}
              className="px-8 py-3 rounded-xl font-bold bg-[#00c8ff] text-[#0d1b2a] hover:bg-[#33d4ff] hover:scale-[1.02] transition-all shadow-lg cursor-pointer"
            >
              {currentQ < quiz.questions.length - 1 ? 'Next Question →' : 'Submit Answer →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
