"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { logout } from '@/Services/card';
import { getReaderEntries } from '@/Services/reader';
import toast from 'react-hot-toast';

interface ReaderData {
  _id: string;
  email: string;
  readerPassword?: string;
  mode?: string;
  doorcode?: string;
  deductionAmount?: number | null;
  cardIds?: string[] | null;
  readerId: string;
}

interface CardDetails {
  fullname?: string;
  phoneNumber?: string;
  email?: string;
  cardUID?: string;
}

interface CardEntry {
  _id: string;
  cardUID: string;
  readerId: string;
  mode: string;
  createdAt: string;
  cardDetails?: CardDetails;
}

function formatEntryDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown date';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

export default function ReaderDashboardView({
  reader,
  entries,
}: {
  reader: ReaderData;
  entries: CardEntry[];
}) {
  const router = useRouter();
  const [currentEntries, setCurrentEntries] = useState(entries);
  const [isReaderPasswordVisible, setIsReaderPasswordVisible] = useState(false);
  const [isRefreshingEntries, setIsRefreshingEntries] = useState(false);
  const sortedEntries = [...currentEntries].sort((firstEntry, secondEntry) => {
    const firstTime = new Date(firstEntry.createdAt).getTime();
    const secondTime = new Date(secondEntry.createdAt).getTime();

    if (Number.isNaN(firstTime)) return 1;
    if (Number.isNaN(secondTime)) return -1;
    return secondTime - firstTime;
  });

  const handleRefreshEntries = async () => {
    setIsRefreshingEntries(true);
    const response = await getReaderEntries();

    if (response.success && Array.isArray(response.data)) {
      setCurrentEntries(response.data);
    } else {
      toast.error(response?.message || response?.error || 'Unable to refresh card entries');
    }

    setIsRefreshingEntries(false);
  };

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
                    <p className="font-mono text-sm opacity-90">{reader.readerId.toUpperCase()}</p>
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
                    <span className="font-mono text-xl tracking-widest font-bold" aria-live="polite">
                      {isReaderPasswordVisible ? reader.readerPassword || '----' : '********'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsReaderPasswordVisible((visible) => !visible)}
                      className="text-[10px] uppercase opacity-60 hover:opacity-100 transition-opacity"
                      aria-label={isReaderPasswordVisible ? 'Hide reader password' : 'Show reader password'}
                    >
                      {isReaderPasswordVisible ? 'Hide' : 'Show'}
                    </button>
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

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 overflow-hidden rounded-3xl border border-brand-secondary/30 bg-white/60 shadow-sm backdrop-blur-sm"
        >
          <div className="flex flex-col gap-2 border-b border-brand-secondary/20 px-6 py-6 md:flex-row md:items-center md:justify-between md:px-8">
            <div>
              <h2 className="font-brand-serif text-2xl font-medium">Card Activity</h2>
              <p className="mt-1 text-sm opacity-60">Recent card entries recorded by this reader.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-fit rounded-full bg-brand-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-widest text-brand-primary">
                {currentEntries.length} {currentEntries.length === 1 ? 'entry' : 'entries'}
              </span>
              <button
                type="button"
                onClick={handleRefreshEntries}
                disabled={isRefreshingEntries}
                className="inline-flex items-center gap-2 rounded-full border border-brand-secondary/30 px-3 py-1.5 text-xs font-medium uppercase tracking-widest transition-colors hover:bg-brand-secondary/10 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Reload card entries"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={isRefreshingEntries ? 'animate-spin' : ''}
                  aria-hidden="true"
                >
                  <path d="M3 12a9 9 0 0 1 15.36-6.36L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-15.36 6.36L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
                {isRefreshingEntries ? 'Loading' : 'Reload'}
              </button>
            </div>
          </div>

          {currentEntries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-225 border-collapse text-left">
                <thead className="bg-brand-bg/70 text-[10px] uppercase tracking-widest opacity-70">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-medium">Date &amp; time (local)</th>
                    <th scope="col" className="px-6 py-4 font-medium">Card</th>
                    <th scope="col" className="px-6 py-4 font-medium">Cardholder</th>
                    <th scope="col" className="px-6 py-4 font-medium">Contact</th>
                    <th scope="col" className="px-6 py-4 font-medium">Reader</th>
                    <th scope="col" className="px-6 py-4 font-medium">Mode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-secondary/15">
                  {sortedEntries.map((entry) => (
                    <tr key={entry._id} className="transition-colors hover:bg-brand-primary/5">
                      <td className="whitespace-nowrap px-6 py-5 text-sm font-medium">
                        {formatEntryDate(entry.createdAt)}
                      </td>
                      <td className="px-6 py-5">
                        <p className="font-mono text-sm font-bold tracking-wide">{entry.cardUID}</p>
                        <p className="mt-1 max-w-32 truncate font-mono text-[10px] opacity-40" title={entry._id}>
                          ID {entry._id}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm font-medium">{entry.cardDetails?.fullname || 'Unknown cardholder'}</p>
                        <p className="mt-1 text-xs opacity-50">{entry.cardDetails?.cardUID || entry.cardUID}</p>
                      </td>
                      <td className="px-6 py-5 text-sm">
                        <p>{entry.cardDetails?.email || 'No email'}</p>
                        <p className="mt-1 text-xs opacity-50">{entry.cardDetails?.phoneNumber || 'No phone'}</p>
                      </td>
                      <td className="px-6 py-5 font-mono text-xs opacity-70">{entry.readerId}</td>
                      <td className="px-6 py-5">
                        <span className="inline-flex rounded-full border border-brand-primary/25 bg-brand-primary/10 px-3 py-1 text-xs font-medium capitalize text-brand-primary">
                          {entry.mode}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-6 py-12 text-center md:px-8">
              <p className="font-brand-serif text-xl">No card activity yet</p>
              <p className="mt-2 text-sm opacity-55">Entries recorded by this reader will appear here.</p>
            </div>
          )}
        </motion.section>
      </div>
    </main>
  );
}
