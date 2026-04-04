'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#020817] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20" />
              <Image src="/logo.png" alt="KarmaSetu" width={64} height={64} className="h-16 w-16 relative z-10 drop-shadow-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter text-white">Security Settings</h1>
              <p className="text-[9px] tracking-[0.3em] text-cyan-400 font-bold uppercase mt-1">Server Managed Configuration</p>
            </div>
          </Link>
        </div>

        <div className="bg-[#0f172a]/80 backdrop-blur-3xl border border-white/10 rounded-[32px] p-8 shadow-2xl space-y-6">
          <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
            <h2 className="text-sm font-bold text-cyan-300 mb-2">API Keys Are Server-Side Only</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              For privacy and security, this project now uses environment variables on the server instead of storing API keys in browser storage.
              Configure values in your local .env file and restart the server after changes.
            </p>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Required Environment Variables</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>SARVAM_API_KEY</li>
              <li>MONGODB_URI</li>
              <li>MONGODB_DB_NAME</li>
            </ul>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4">
            <h3 className="text-xs font-bold text-emerald-300 mb-2 uppercase tracking-wider">Connection Checks</h3>
            <ul className="text-xs text-slate-300 space-y-1">
              <li>MongoDB: /api/mongodb/ping</li>
              <li>Sarvam Chat: /api/sarvam/chat (POST)</li>
              <li>Sarvam TTS: /api/sarvam/tts (POST)</li>
              <li>Sarvam ASR: /api/sarvam/asr (POST)</li>
            </ul>
          </div>

          <div className="flex items-center justify-center pt-2">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}