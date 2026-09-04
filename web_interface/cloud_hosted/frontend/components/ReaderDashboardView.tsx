"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { logout } from '@/Services/card';
import toast from 'react-hot-toast';

interface ReaderData {
  _id: string;
  email: string;
  readerPassword?: string;
  mode?: string;
  doorcode?: string;
  deductionAmount?: number | null;
  cardIds?: string[] | null;
}

export default function ReaderDashboardView({ reader }: { reader: ReaderData }) {
  const router = useRouter();

  const handleSignOut = async() => {
    const result= await logout();
    if(result.success){
      toast.success(result.message || 'Logout successful!');    
      router.push('/login');
    } else {
      toast.error('Logout failed: ' + result.message);
    }
  }
  return (
    <main className="font-brand-sans bg-brand-bg text-brand-text min-h-screen p-6 md:p-12 selection:bg-brand-primary/20 selection:text-brand-primary">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-2">
            <h1 className="font-brand-serif text-4xl md:text-6xl font-medium leading-tight">
              Reader <span className="font-brand-cursive text-brand-primary text-5xl md:text-7xl italic">Console</span>
            </h1>
            <p className="opacity-60 font-light text-lg">Hardware Management & Configuration</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 border border-brand-secondary text-brand-text hover:bg-brand-secondary/10 rounded-full text-xs uppercase tracking-widest transition-all"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Reader Status & Mode */}
          <div className="lg:col-span-2 space-y-8">

            {/* Hardware Status Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative group overflow-hidden p-8 rounded-3xl bg-brand-text text-white shadow-xl transition-transform hover:scale-[1.01] duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-12">
                  <div className="flex items-center gap-4">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs uppercase tracking-widest opacity-70">System Status: Online</span>
                  </div>
                  <div className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-[10px] uppercase tracking-tighter font-medium">
                    ESP32-RC522
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:justify-between items-end gap-6">
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Current Operating Mode</p>
                    <h2 className="text-4xl font-brand-serif font-medium capitalize">
                      {reader.mode || 'Not Defined'}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Reader ID</p>
                    <p className="font-mono text-sm opacity-90">{reader._id.slice(-12).toUpperCase()}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="p-6 bg-white/40 border border-brand-secondary/20 rounded-2xl backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-widest text-brand-secondary font-medium mb-2">Management Email</p>
                <p className="text-lg font-medium opacity-80">{reader.email}</p>
              </motion.div>
              {reader.mode === 'payment' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="p-6 bg-white/40 border border-brand-secondary/20 rounded-2xl backdrop-blur-sm"
                >
                  <p className="text-xs uppercase tracking-widest text-brand-secondary font-medium mb-2">Deduction Amount</p>
                  <p className="text-lg font-medium opacity-80">
                    {reader.deductionAmount !== null ? `$${reader.deductionAmount}` : 'No deduction enabled'}
                  </p>
                </motion.div>
              )}
            </div>
          </div>

          {/* Right Column: Access Configuration */}
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="p-8 bg-white/60 border border-brand-secondary/30 rounded-3xl shadow-sm relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
              </div>

              <h3 className="font-brand-serif text-2xl font-medium mb-6">Hardware Config</h3>

              <div className="space-y-6">
                {reader.mode === 'doorlock' && (
                  <div className="group">
                    <p className="text-xs uppercase tracking-widest text-brand-secondary font-medium mb-2 group-hover:text-brand-primary transition-colors">Door Access Code</p>
                    <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-secondary/20">
                      <span className="font-mono text-xl tracking-widest font-bold">{reader.doorcode || '----'}</span>
                      <span className="text-[10px] uppercase opacity-40">Active</span>
                    </div>
                  </div>
                )}

                <div className="group">
                  <p className="text-xs uppercase tracking-widest text-brand-secondary font-medium mb-2 group-hover:text-brand-primary transition-colors">Reader Password</p>
                  <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-secondary/20">
                    <span className="font-mono text-xl tracking-widest font-bold">{reader.readerPassword || '----'}</span>
                    <span className="text-[10px] uppercase opacity-40">Secure</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-brand-secondary/20">
                <p className="text-xs italic opacity-50 text-center leading-relaxed">
                  Configuration is synced with the physical ESP32 module.
                </p>
              </div>
            </motion.div>

            {/* Linked Cards / Logs */}
            {reader.mode === 'identification' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl"
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium">Authorized Cards</p>
                  <span className="text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full">
                    {reader.cardIds ? reader.cardIds.length : 0}
                  </span>
                </div>
                <div className="space-y-2">
                  {reader.cardIds && reader.cardIds.length > 0 ? (
                    reader.cardIds.map((id: string, i: number) => (
                      <div key={i} className="text-xs font-mono opacity-60 p-2 bg-white/30 rounded-md truncate">
                        {id}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs opacity-50 italic text-center py-2">No authorized cards linked to this reader.</p>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </div>
    </main>
  );
}
