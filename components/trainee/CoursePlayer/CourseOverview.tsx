'use client';

import Image from 'next/image';
import React from 'react';
import { Play, Clock, BookOpen, ClipboardCheck, User, ShieldCheck } from 'lucide-react';
import { Course } from '@/data/coursePlayerDummyData';

interface CourseOverviewProps {
  course: Course;
  onBegin: () => void;
  estimatedDuration: string;
  isPreview?: boolean;
}

export default function CourseOverview({ course, onBegin, estimatedDuration, isPreview = false }: CourseOverviewProps) {
  return (
    <div className={isPreview ? "w-full h-full animate-in fade-in duration-700" : "min-h-full bg-[#0a1520] flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in duration-700"}>
      <div className={`w-full flex flex-wrap items-stretch overflow-hidden shadow-2xl ${isPreview ? 'bg-[#0f172a] rounded-2xl border border-white/5' : 'max-w-4xl bg-[#0d1b2a] rounded-3xl border border-white/5'}`}>
        
        {/* Left: Huge Focal Imagery & Stats */}
        <div className="flex-1 basis-[400px] min-w-0 relative h-72 md:h-auto min-h-[400px] flex flex-col justify-end overflow-hidden group">
          <Image unoptimized width={1200} height={600} 
            src={course.thumbnail || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80'} 
            alt={course.title} 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1b2a] via-[#0d1b2a]/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex flex-wrap gap-3">
              <div className="bg-cyan-500/20 backdrop-blur-md border border-cyan-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">{estimatedDuration} Estimate</span>
              </div>
              <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 px-3 py-1.5 rounded-full flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">{course.level} Level</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Content & CTA */}
        <div className={`flex-1 basis-[350px] min-w-0 flex flex-col h-full ${isPreview ? 'p-4' : 'p-6 sm:p-10'}`}>
          <div className="mb-2">
            <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em]">{course.category}</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mt-1 leading-tight">{course.title}</h1>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
            {course.lessons[0]?.description || 'This industrial training unit covers critical safety protocols, compliance standards, and operational procedures essential for workplace excellence.'}
          </p>

          <div className="space-y-6 mb-8">
            {/* Instructor Profile */}
            {course.instructor && (
              <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-none mb-1">Lead Instructor</div>
                  <div className="text-[15px] font-bold text-white leading-none">{course.instructor}</div>
                  {course.instructorRole && (
                    <div className="text-[11px] text-cyan-400 font-medium mt-1">{course.instructorRole}</div>
                  )}
                </div>
              </div>
            )}

            {/* Objectives */}
            {course.objectives && course.objectives.length > 0 && course.objectives.some(o => o.trim()) && (
              <div>
                <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.15em] mb-4">Learning Outcomes</h3>
                <ul className="space-y-3">
                  {course.objectives.filter(o => o.trim()).map((obj, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13px] text-slate-300">
                      <div className="h-4 w-4 rounded-full bg-cyan-500/10 flex items-center justify-center mt-0.5 border border-cyan-500/20">
                        <div className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      </div>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-auto pt-4 flex flex-col gap-4">
            <button 
              onClick={onBegin}
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black py-4 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-[0.98] flex items-center justify-center gap-3 group"
            >
              <Play className="h-5 w-5 fill-current transition-transform group-hover:scale-110" />
              <span>BEGIN TRAINING UNIT</span>
            </button>
            <div className="flex items-center justify-around text-[10px] text-slate-500 font-bold uppercase tracking-widest px-4">
               <div className="flex items-center gap-1.5">
                 <BookOpen className="h-3 w-3" />
                 {course.lessons.length} Modules
               </div>
               <div className="h-1 w-1 bg-slate-700 rounded-full" />
               <div className="flex items-center gap-1.5">
                 <ClipboardCheck className="h-3 w-3" />
                 {course.passingScore}% Pass Mark
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
