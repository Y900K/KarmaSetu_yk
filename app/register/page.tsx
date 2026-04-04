'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';

type RegisterStep = 'identity' | 'profile';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>('identity');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    employeeId: '',
    department: '',
    role: 'trainee',
    company: '',
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    try {
      setError('');
      setIsLoading(true);

      const payload = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department,
        company: formData.company,
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('traineeName', data.user?.fullName || formData.fullName || 'New User');
      router.push('/trainee/dashboard');
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err instanceof Error ? err.message : 'Registration failed.');
      }
    } finally {
      clearTimeout(timeoutId);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
             <Image src="/logo.png" alt="Logo" width={48} height={48} className="h-12 w-12" />
             <h1 className="text-xl font-bold tracking-tight text-white uppercase">Create Account</h1>
             <p className="text-slate-400 text-xs">Join KarmaSetu Industrial Training Platform</p>
          </Link>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 'identity' && (
              <motion.div key="identity" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Link href="/login" className="text-slate-500 hover:text-white text-xs mb-6 inline-block">← Back to Login</Link>
                <h2 className="text-xl font-bold text-white mb-6">Email Setup</h2>
                
                <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); setStep('profile'); }}>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Full Name</label>
                    <input 
                      type="text" required
                      value={formData.fullName}
                      onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                      placeholder="e.g. Rajesh Kumar"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Company Email</label>
                    <input 
                      type="email" required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="name@company.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Create Password</label>
                    <div className="relative group">
                      <input 
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        placeholder="Minimum 8 characters"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white outline-none focus:border-cyan-500/50 pr-12 transition-all focus:bg-white/[0.08]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <button className="w-full py-4 bg-cyan-500 text-slate-900 font-bold rounded-xl active:scale-95 transition-all">
                    Continue to Profile →
                  </button>
                </form>
                <div className="mt-6 text-center pt-4 border-t border-white/5">
                   <p className="text-sm text-slate-400">Already have an account? <Link href="/login" className="text-cyan-400 font-bold hover:underline">Sign In</Link></p>
                </div>
              </motion.div>
            )}

            {step === 'profile' && (
              <motion.div key="profile" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
                <div className="border-l-4 border-cyan-500 pl-4 py-1">
                  <h2 className="text-xl font-black text-white uppercase tracking-tighter">Industrial Profile</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Step 2 of 2: Job Classification</p>
                </div>

                {error && (
                  <div className="-mt-2 mb-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-semibold">
                    {error}
                  </div>
                )}

                <form className="flex flex-col gap-10" onSubmit={handleRegister}>
                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/80 mb-3 block ml-1 transition-colors group-focus-within:text-cyan-400">Primary Department</label>
                    <div className="relative">
                      <select 
                        required
                        title="Primary Department"
                        aria-label="Primary Department"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-5 px-6 text-white outline-none focus:border-cyan-500/50 appearance-none cursor-pointer hover:bg-[#2d3a4f] transition-all shadow-inner"
                      >
                        <option value="" className="bg-[#0f172a]">-- Select Department --</option>
                        <option value="Mechanical" className="bg-[#0f172a]">Mechanical Engineering</option>
                        <option value="Electrical" className="bg-[#0f172a]">Electrical Maintenance</option>
                        <option value="Chemical" className="bg-[#0f172a]">Chemical & Process Control</option>
                        <option value="Safety" className="bg-[#0f172a]">HSE & Safety Guard</option>
                        <option value="Maintenance" className="bg-[#0f172a]">General Maintenance</option>
                      </select>
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs">▼</span>
                    </div>
                  </div>

                  <div className="group">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/80 mb-3 block ml-1 transition-colors group-focus-within:text-cyan-400">Designated Role</label>
                    <div className="relative">
                      <select 
                        required
                        title="Designated Role"
                        aria-label="Designated Role"
                        value={formData.role}
                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                        className="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-5 px-6 text-white outline-none focus:border-cyan-500/50 appearance-none cursor-pointer hover:bg-[#2d3a4f] transition-all shadow-inner"
                      >
                        <option value="trainee" className="bg-[#0f172a]">Worker / New Trainee</option>
                        <option value="operator" className="bg-[#0f172a]">Certified Plant Operator</option>
                        <option value="contractor" className="bg-[#0f172a]">External Contractor</option>
                        <option value="hse" className="bg-[#0f172a]">Field Safety Officer</option>
                        <option value="manager" className="bg-[#0f172a]">Shift Manager</option>
                      </select>
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-xs">▼</span>
                    </div>
                  </div>

                  <div className="group">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/80 mb-3 block ml-1 transition-colors group-focus-within:text-cyan-400">Company / Facility Name</label>
                     <input 
                       type="text" required
                       value={formData.company}
                       onChange={(e) => setFormData({...formData, company: e.target.value})}
                       placeholder="e.g. Mathura Refinery Unit 4"
                       className="w-full bg-[#1e293b] border border-white/10 rounded-2xl py-5 px-6 text-white outline-none focus:border-cyan-500/50 hover:bg-[#2d3a4f] transition-all shadow-inner"
                     />
                  </div>

                  <div className="pt-4">
                    <button 
                      disabled={isLoading}
                      className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black uppercase tracking-[0.2em] text-xs rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_-5px_rgba(6,182,212,0.4)]"
                    >
                      {isLoading ? (
                         <span className="h-5 w-5 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                      ) : (
                         <>Initialize Dashboard ➞</>
                      )}
                    </button>
                    <p className="text-center text-[9px] text-slate-500 font-bold uppercase mt-6 tracking-widest">Secured by KarmaSetu Enterprise Protocol</p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
