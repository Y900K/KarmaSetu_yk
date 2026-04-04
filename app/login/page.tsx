'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, HardHat, Info, ChevronRight, Award } from 'lucide-react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'trainee' | 'admin'>('trainee');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const parseApiResponse = async (res: Response) => {
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) {
      throw new Error(data.message || 'Request failed');
    }
    return data;
  };

  useEffect(() => {
    const role = searchParams.get('role');
    if (role === 'admin' || role === 'trainee') {
      setActiveTab(role);
    }
  }, [searchParams]);

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password to proceed.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address (e.g., name@company.com).');
      return;
    }

    try {
      setIsLoading(true);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          identifier: email,
          password,
          role: activeTab,
        }),
      }).finally(() => {
        clearTimeout(timeout);
      });

      const data = await parseApiResponse(res);
      // Success! Clear possible previous local state related to logout or errors
      localStorage.removeItem('loginError');
      const resolvedRole = data?.user?.role === 'admin' ? 'admin' : 'trainee';
      router.push(resolvedRole === 'admin' ? '/admin/dashboard' : '/trainee/dashboard');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Login request timed out. Please check your connection and try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 grid-pattern opacity-10" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo Hub */}
        <div className="text-center mb-6">
          <div className="inline-flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20" />
              <Image src="/logo.png" alt="KarmaSetu" width={64} height={64} className="h-16 w-16 relative z-10 drop-shadow-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">{t('login.title')}</h1>
              <p className="text-[9px] tracking-[0.3em] text-cyan-400 font-bold uppercase mt-1">{t('login.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Portals Toggle */}
        <div className="flex bg-[#0f172a] p-1.5 rounded-2xl mb-6 border border-white/5 w-fit mx-auto shadow-2xl relative z-20">
          {(['trainee', 'admin'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(''); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.14em] transition-all ${
                activeTab === tab 
                  ? (tab === 'trainee' ? 'bg-cyan-500 text-slate-900 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'bg-purple-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]')
                  : 'text-slate-500 hover:text-white'
              }`}
            >
              {tab === 'trainee' ? <HardHat className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              {tab === 'trainee' ? 'Trainee' : 'Supervisor'}
            </button>
          ))}
        </div>

        {/* Main Auth Container */}
        <div className="bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 shadow-2xl relative overflow-hidden z-20">
          <motion.div key={activeTab} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="mb-6 pt-1">
              <h2 className="text-xl font-bold text-white mb-1.5">{activeTab === 'trainee' ? 'Trainee' : 'Supervisor'}</h2>
              <p className="text-slate-400 text-sm">
                {t('login.subtitle')}
              </p>
            </div>

            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-xs animate-in slide-in-from-top-2">
                <Info className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleStep1Submit} className="space-y-6">
              {activeTab === 'admin' && (
                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-center gap-3 text-[9px] text-purple-200 font-black tracking-widest uppercase mb-4">
                  <ShieldCheck className="w-4 h-4 text-purple-400" /> Authorized Personnel Only
                </div>
              )}

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-3 ml-1">
                  {t('login.email')}
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'admin' ? 'admin@karmasetu.com' : 'user@karmasetu.com'}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-4 text-white outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 mb-3 ml-1">
                  {t('login.password')}
                </label>
                <div className="relative group">
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-12 text-white outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                disabled={isLoading}
                className={`w-full py-4 font-bold rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 ${
                  activeTab === 'admin'
                    ? 'bg-purple-500 hover:bg-purple-400 text-white'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-900'
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="h-4 w-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                    <span className="text-xs uppercase tracking-widest font-black">Processing...</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="uppercase tracking-widest font-black">{activeTab === 'admin' ? 'Supervisor Access' : t('login.submit')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </div>
                )}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Professional Trust Footer */}
        <div className="mt-12 mb-6 flex items-center justify-center gap-12 opacity-30 select-none grayscale hover:grayscale-0 transition-all duration-500">
           <div className="flex items-center gap-3">
             <ShieldCheck className="w-6 h-6 text-cyan-400" />
             <div className="text-left text-[8px] font-black text-white uppercase leading-tight">TLS 1.3<br/><span className="text-slate-500">Encrypted</span></div>
           </div>
           <div className="flex items-center gap-3">
             <Award className="w-6 h-6 text-purple-400" />
             <div className="text-left text-[8px] font-black text-white uppercase leading-tight">ISO 27001<br/><span className="text-slate-500">Certified</span></div>
           </div>
        </div>

        <div className="text-center mt-6"><Link href="/" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors cursor-pointer">← Home</Link></div>
        
      </motion.div>

      {/* Robot Mascot Overlay (Faded) */}
      <Image src="/yk_mascot.png" alt="Mascot" width={256} height={256} className="fixed bottom-[-50px] left-[-30px] w-64 h-64 grayscale opacity-[0.03] pointer-events-none -rotate-12" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}
