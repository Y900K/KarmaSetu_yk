'use client';

import React from 'react';
import { BookOpen, Play, Lock, CheckCircle2, FileText, ClipboardList, ShieldAlert, CircleSlash } from 'lucide-react';
import { Course } from '@/data/coursePlayerDummyData';
import { useLanguage } from '@/context/LanguageContext';

interface SidebarContentProps {
  course: Course;
  activeTab: 'videos' | 'docs' | 'quiz';
  setActiveTab: (tab: 'videos' | 'docs' | 'quiz') => void;
  activeLessonId: string | null;
  activeDocId: string | null;
  onSelectLesson: (id: string) => void;
  onSelectDoc: (id: string) => void;
  onStartQuiz: () => void;
  completedLessonsCount: number;
  viewedDocIds: string[];
}

export default function SidebarContent({
  course,
  activeTab,
  setActiveTab,
  activeLessonId,
  activeDocId,
  onSelectLesson,
  onSelectDoc,
  onStartQuiz,
  completedLessonsCount,
  viewedDocIds,
}: SidebarContentProps) {
  const { t } = useLanguage();

  const totalItems = course.lessons.length + course.documents.length;
  const completedItems = completedLessonsCount + (course.documents.length === 0 ? 0 : viewedDocIds.length);
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const docsUnlocked = completedLessonsCount === course.lessons.length;
  const hasViewedAllDocs = course.documents.length === 0 || course.documents.every(doc => viewedDocIds.includes(doc.id));
  const quizUnlocked = docsUnlocked && hasViewedAllDocs;

  // SVG Ring Constants
  const radius = 24;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="flex flex-col h-full bg-[#0d1b2a]">
      {/* Premium Header with Progress Ring */}
      <div className="p-5 shrink-0 border-b border-white/5 bg-gradient-to-b from-[#0f1d2e] to-[#0d1b2a]">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative h-14 w-14 shrink-0">
            <svg className="h-14 w-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                className="text-white/5"
              />
              <circle
                cx="28"
                cy="28"
                r={radius}
                stroke="currentColor"
                strokeWidth="4"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="text-cyan-500 ks-progress-ring"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[11px] font-black text-white">{progressPercent}%</span>
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-white font-bold text-[14px] leading-tight line-clamp-2 mb-1">
              {course.title}
            </h2>
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
               {completedItems} / {totalItems} Units Finalized
            </div>
          </div>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex border-b border-white/5 shrink-0 bg-[#0d1b2a]">
        {(['videos', 'docs', 'quiz'] as const).map((tab) => {
          const isTabLocked = (tab === 'docs' && !docsUnlocked) || (tab === 'quiz' && !quizUnlocked);

          return (
            <button
              key={tab}
              onClick={() => {
                if (!isTabLocked) setActiveTab(tab);
              }}
              className={`flex-1 py-4 text-[10px] font-black text-center uppercase tracking-[0.1em] relative transition-all ${
                activeTab === tab ? 'text-white bg-white/5' : isTabLocked ? 'text-slate-700 cursor-not-allowed' : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]'
              }`}
            >
              <div className="flex flex-col items-center gap-1.5">
                {tab === 'videos' && <Play className={`h-3.5 w-3.5 ${activeTab === tab ? 'text-cyan-400' : ''}`} />}
                {tab === 'docs' && (isTabLocked ? <Lock className="h-3.5 w-3.5" /> : <BookOpen className={`h-3.5 w-3.5 ${activeTab === tab ? 'text-cyan-400' : ''}`} />)}
                {tab === 'quiz' && (isTabLocked ? <Lock className="h-3.5 w-3.5" /> : <ShieldAlert className={`h-3.5 w-3.5 ${activeTab === tab ? 'text-cyan-400' : ''}`} />)}
                <span className="hidden sm:inline">
                  {tab === 'videos' ? t('player.tab.lessons') : tab === 'docs' ? t('player.tab.material') : t('player.tab.quiz')}
                </span>
              </div>
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.5)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-10 bg-[#0a1520]">
        
        {/* VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="divide-y divide-white/5">
            {course.lessons.map((lesson) => {
              const isActive = activeLessonId === lesson.id;
              
              return (
                <button
                  key={lesson.id}
                  disabled={lesson.locked}
                  onClick={() => onSelectLesson(lesson.id)}
                  className={`w-full text-left flex items-start px-5 py-5 transition-all group relative ${
                    lesson.locked ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:bg-white/[0.03]'
                  } ${isActive ? 'bg-cyan-500/10' : ''}`}
                >
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]" />}
                  
                  <div className="mr-4 mt-1 shrink-0">
                    {lesson.locked ? (
                      <Lock className="h-4 w-4 text-slate-600" />
                    ) : lesson.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Play className={`h-4 w-4 ${isActive ? 'text-cyan-400 animate-pulse' : 'text-slate-500 group-hover:text-cyan-400'}`} />
                    )}
                  </div>

                  <div className="flex-1 min-w-0 pr-2">
                    <div className="text-[9px] font-black text-slate-500 mb-1 uppercase tracking-widest leading-none">
                      Module {lesson.number < 10 ? `0${lesson.number}` : lesson.number}
                    </div>
                    <div className={`text-[13px] font-bold leading-snug line-clamp-2 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                      {lesson.title}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 shrink-0 mt-1">{lesson.duration}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* DOCS TAB */}
        {activeTab === 'docs' && (
          <div className="flex flex-col p-5 gap-4">
            {!docsUnlocked ? (
               <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 text-center">
                 <Lock className="h-8 w-8 text-amber-500/40 mx-auto mb-3" />
                 <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest">{t('player.material_locked')}</p>
                 <p className="text-[11px] text-amber-500/60 mt-2 leading-relaxed">
                   Finalize all {course.lessons.length} core modules to unlock industrial documentation.
                 </p>
               </div>
            ) : course.documents.length === 0 ? (
              <div className="text-center p-8 bg-white/5 rounded-2xl border border-white/5">
                <CircleSlash className="h-8 w-8 text-slate-700 mx-auto mb-3" />
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No documentation found.</p>
              </div>
            ) : (
              course.documents.map((doc) => {
                const isActive = activeDocId === doc.id;
                return (
                  <div
                    key={doc.id}
                    className={`group border rounded-2xl p-4 transition-all ${
                      isActive ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${isActive ? 'bg-cyan-500 text-slate-900' : 'bg-[#1e2d3d] text-slate-400'}`}>
                        <FileText className="h-4 w-4" />
                      </div>
                      <span className={`text-[13px] font-bold leading-snug ${isActive ? 'text-white' : 'text-slate-300'}`}>
                        {doc.title}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-black text-slate-500 bg-white/5 px-2 py-1 rounded-md uppercase tracking-wider">{doc.type}</span>
                      <button
                        onClick={() => onSelectDoc(doc.id)}
                        className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all ${
                          isActive ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/20' : 'bg-white/5 text-cyan-400 hover:bg-white/10'
                        }`}
                      >
                        {isActive ? t('player.view_doc') : t('player.view_doc')}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* QUIZ TAB */}
        {activeTab === 'quiz' && (
          <div className="p-5">
            {!quizUnlocked ? (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 text-center">
                <Lock className="h-8 w-8 text-amber-500/40 mx-auto mb-3" />
                <p className="text-[11px] font-black text-amber-500 uppercase tracking-widest">{t('player.quiz_locked')}</p>
                <p className="text-[11px] text-amber-500/60 mt-2 leading-relaxed">
                  {docsUnlocked ? 'Review mandatory industrial documentation to authorize assessment access.' : `Finalize modules and review documentation to proceed.`}
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-[#1e2d3d]/60 to-[#0d1b2a] border border-white/5 rounded-3xl p-6 text-center shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <ShieldAlert className="h-20 w-20 transform rotate-12" />
                </div>

                <div className="w-14 h-14 bg-cyan-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-cyan-500/20">
                  <ClipboardList className="h-7 w-7 text-cyan-400" />
                </div>
                
                <h3 className="text-white font-black text-[15px] uppercase tracking-widest mb-1">Final Assessment</h3>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Authorize Competency Check</p>
                
                <div className="grid grid-cols-2 gap-2 mb-6">
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1">Questions</div>
                    <div className="text-xs font-bold text-white">{course.quiz.questions.length}</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <div className="text-[9px] font-black text-slate-600 uppercase tracking-tighter mb-1">Passing Mark</div>
                    <div className="text-xs font-bold text-white">{course.passingScore}%</div>
                  </div>
                </div>
                
                {course.quiz.attempted && course.quiz.score !== null ? (
                  <div className="mb-6 bg-white/5 p-4 border border-white/5 rounded-2xl flex flex-col items-center">
                     <span className={`text-[9px] px-2 py-1 rounded-md uppercase font-black tracking-widest mb-3 ${course.quiz.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-500'}`}>
                       {course.quiz.passed ? 'Status: Qualified' : 'Status: Retake Required'}
                     </span>
                     <div className="text-2xl font-black text-white leading-none mb-1">
                       {Math.round((course.quiz.score / course.quiz.questions.length) * 100)}%
                     </div>
                  </div>
                ) : null}

                <button
                  onClick={onStartQuiz}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-4 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-[0.98] cursor-pointer text-xs"
                >
                  {course.quiz.attempted ? t('player.retake_quiz') : t('player.start_quiz')}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

