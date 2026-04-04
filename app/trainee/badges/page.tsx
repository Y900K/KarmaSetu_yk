'use client';

import React, { useMemo, useState } from 'react';
import TraineeLayout from '@/components/trainee/layout/TraineeLayout';
import { useLanguage } from '@/context/LanguageContext';

type BadgeDef = {
  id: string;
  title: string;
  icon: string;
  description: string;
  unlocked: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  category: 'course' | 'streak' | 'quiz' | 'safety';
  unlockedAt?: string;
  hint: string;
};

const BADGE_DEFINITIONS: BadgeDef[] = [
  // Course badges
  { id: 'first_course', title: 'First Steps', icon: '🎓', description: 'Complete your first course', unlocked: true, tier: 'bronze', category: 'course', unlockedAt: 'Jan 25, 2026', hint: '' },
  { id: 'fire_expert', title: 'Fire Safety Expert', icon: '🔥', description: 'Complete Fire Safety & Emergency Response with 90%+', unlocked: false, tier: 'gold', category: 'course', hint: 'Score 90% or higher on Fire Safety course' },
  { id: 'chemical_pro', title: 'Chemical Handler', icon: '🧪', description: 'Complete Chemical Safety Handbook with 80%+', unlocked: false, tier: 'silver', category: 'course', hint: 'Score 80% or higher on Chemical Safety course' },
  { id: 'forklift_master', title: 'Forklift Operator', icon: '🚜', description: 'Complete Forklift Safety & Operations with 85%+', unlocked: false, tier: 'gold', category: 'course', hint: 'Score 85% or higher on Forklift Safety course' },
  { id: 'course_collector', title: 'Course Collector', icon: '📚', description: 'Complete 5 different courses', unlocked: false, tier: 'platinum', category: 'course', hint: 'Complete 5 courses to unlock' },

  // Streak badges
  { id: 'streak_3', title: '3-Day Streak', icon: '🔥', description: 'Maintain a 3-day learning streak', unlocked: true, tier: 'bronze', category: 'streak', unlockedAt: 'Mar 20, 2026', hint: '' },
  { id: 'streak_7', title: '7-Day Streak', icon: '⚡', description: 'Maintain a 7-day learning streak', unlocked: false, tier: 'silver', category: 'streak', hint: 'Login and study for 7 days in a row' },
  { id: 'streak_30', title: 'Monthly Champion', icon: '🏆', description: 'Maintain a 30-day learning streak', unlocked: false, tier: 'platinum', category: 'streak', hint: 'Login and study for 30 days straight' },

  // Quiz badges
  { id: 'quiz_first', title: 'Quiz Starter', icon: '📝', description: 'Pass your first quiz', unlocked: true, tier: 'bronze', category: 'quiz', unlockedAt: 'Feb 10, 2026', hint: '' },
  { id: 'quiz_10', title: '10 Quizzes Passed', icon: '✅', description: 'Pass 10 quizzes', unlocked: false, tier: 'silver', category: 'quiz', hint: 'Pass 10 different quizzes' },
  { id: 'perfect_score', title: 'Perfect Score', icon: '💯', description: 'Score 100% on any quiz', unlocked: false, tier: 'gold', category: 'quiz', hint: 'Get every question right on any quiz' },

  // Safety badges
  { id: 'safety_champ', title: 'Safety Champion', icon: '🛡️', description: 'Complete all safety-related courses', unlocked: false, tier: 'platinum', category: 'safety', hint: 'Complete all courses in the Safety category' },
  { id: 'compliance_star', title: '100% Compliance', icon: '⭐', description: 'Complete all assigned courses before deadline', unlocked: false, tier: 'gold', category: 'safety', hint: 'Finish every assigned course on time' },
];

const TIER_CONFIG = {
  bronze: { label: 'Bronze', color: 'from-amber-700 to-amber-600', border: 'border-amber-700/40', bg: 'bg-amber-700/10', text: 'text-amber-500' },
  silver: { label: 'Silver', color: 'from-slate-400 to-slate-300', border: 'border-slate-400/40', bg: 'bg-slate-400/10', text: 'text-slate-300' },
  gold: { label: 'Gold', color: 'from-yellow-500 to-amber-400', border: 'border-yellow-500/40', bg: 'bg-yellow-500/10', text: 'text-yellow-400' },
  platinum: { label: 'Platinum', color: 'from-cyan-400 to-blue-400', border: 'border-cyan-400/40', bg: 'bg-cyan-400/10', text: 'text-cyan-300' },
};

const CATEGORY_LABELS: Record<string, { label: string; icon: string }> = {
  course: { label: 'Course Completion', icon: '🎓' },
  streak: { label: 'Learning Streaks', icon: '🔥' },
  quiz: { label: 'Quiz Masters', icon: '📝' },
  safety: { label: 'Safety Excellence', icon: '🛡️' },
};

function BadgesContent() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<string>('all');

  const badges = BADGE_DEFINITIONS;
  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;

  const filteredBadges = useMemo(() => {
    if (filter === 'all') return badges;
    if (filter === 'unlocked') return badges.filter((b) => b.unlocked);
    if (filter === 'locked') return badges.filter((b) => !b.unlocked);
    return badges.filter((b) => b.category === filter);
  }, [badges, filter]);

  const grouped = useMemo(() => {
    const map = new Map<string, BadgeDef[]>();
    for (const b of filteredBadges) {
      const cat = b.category;
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(b);
    }
    return map;
  }, [filteredBadges]);

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">{t('badges.title')}</h1>
        <p className="text-sm text-slate-400 mt-1">Earn badges by completing courses, maintaining streaks, and excelling in quizzes.</p>
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-center gap-4">
        <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 flex items-center justify-center text-3xl shadow-xl shadow-amber-500/20">
          🏆
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="text-2xl font-black text-white">{unlockedCount} <span className="text-sm font-normal text-slate-400">of {totalCount} badges</span></div>
          <progress className="h-2 w-full max-w-xs mt-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-[#020817] [&::-webkit-progress-value]:bg-gradient-to-r [&::-webkit-progress-value]:from-cyan-500 [&::-webkit-progress-value]:to-amber-500 [&::-moz-progress-bar]:bg-cyan-500" value={unlockedCount} max={totalCount} />
        </div>
        <div className="flex gap-3">
          {Object.entries(TIER_CONFIG).map(([key, cfg]) => {
            const count = badges.filter((b) => b.unlocked && b.tier === key).length;
            return (
              <div key={key} className="text-center">
                <div className={`text-lg font-bold ${cfg.text}`}>{count}</div>
                <div className="text-[10px] text-slate-500">{cfg.label}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[
          { key: 'all', label: 'All' },
          { key: 'unlocked', label: '✅ Unlocked' },
          { key: 'locked', label: '🔒 Locked' },
          ...Object.entries(CATEGORY_LABELS).map(([key, val]) => ({ key, label: `${val.icon} ${val.label}` })),
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 text-xs rounded-full border transition-colors cursor-pointer ${filter === f.key ? 'bg-cyan-500 text-slate-900 border-cyan-500 font-semibold' : 'border-[#334155] text-slate-400 hover:text-white'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Badge Grid */}
      {Array.from(grouped.entries()).map(([category, categoryBadges]) => (
        <div key={category} className="mb-8">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            {CATEGORY_LABELS[category]?.icon} {CATEGORY_LABELS[category]?.label}
            <span className="bg-white/5 text-slate-400 px-2 py-0.5 rounded text-[10px]">{categoryBadges.length}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categoryBadges.map((badge) => {
              const tier = TIER_CONFIG[badge.tier];
              return (
                <div
                  key={badge.id}
                  className={`relative group bg-[#1e293b] border rounded-2xl p-5 transition-all ${badge.unlocked ? `${tier.border} hover:shadow-lg` : 'border-[#334155] opacity-60 hover:opacity-80'}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${badge.unlocked ? `bg-gradient-to-br ${tier.color} shadow-lg` : 'bg-[#020817] border border-[#334155]'}`}>
                      {badge.unlocked ? badge.icon : '🔒'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-semibold ${badge.unlocked ? 'text-white' : 'text-slate-500'}`}>{badge.title}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${tier.bg} ${tier.text} font-bold uppercase`}>{tier.label}</span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{badge.description}</p>
                      {badge.unlocked && badge.unlockedAt && (
                        <p className="text-[10px] text-emerald-400 mt-1">✅ Earned {badge.unlockedAt}</p>
                      )}
                      {!badge.unlocked && badge.hint && (
                        <p className="text-[10px] text-slate-500 mt-1 italic">💡 {badge.hint}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </>
  );
}

export default function BadgesPage() {
  return (
    <TraineeLayout>
      <BadgesContent />
    </TraineeLayout>
  );
}
