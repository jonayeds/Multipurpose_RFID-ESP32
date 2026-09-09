"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cardLogin } from '@/Services/card';
import toast, { Toaster } from 'react-hot-toast';
import { readerLogin } from '@/Services/reader';

function LoginLoader({ loginType }: { loginType: 'card' | 'reader' }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-brand-bg/80 px-8 backdrop-blur-xl"
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center">
        <motion.svg
          viewBox="0 -1 20 20"
          aria-hidden="true"
          className="h-16 w-16 overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.path
            d="M3,13.5793719 C9.98914658,5.83454059 14.2442185,2.78592627 15.7652158,4.43352892 C18.0467117,6.90493289 7.55581053,16.1455344 9.47834357,17.954063 C11.4008766,19.7625917 16.9959382,11.5719148 19.0578414,12.4109285 C21.1197445,13.2499421 16.1152903,18.1722847 17.4055985,18.9997829 C18.2658039,19.5514483 19.3191667,19.0606734 20.5656867,17.527458"
            stroke="var(--brand-primary)"
            strokeWidth="1.35"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 , opacity:1}}
            animate={{ pathLength: [0, 1] }}
            transition={{
              duration: 1,
              ease: 'easeOut',
              repeat: Infinity,
              repeatType: 'reverse',
              repeatDelay: 0.25,
            }}
          />
        </motion.svg>
        <motion.p
          className="mt-3 max-w-xs font-brand-serif text-lg font-medium leading-relaxed text-brand-text"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
        >
          Checking your {loginType} credentials
        </motion.p>
        <div className="mt-3 flex gap-1.5" aria-hidden="true">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="h-1.5 w-1.5 rounded-full bg-brand-primary"
              animate={{ y: [0, -4, 0], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: dot * 0.14 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'card' | 'reader'>('card');
  const [cardFormData, setCardFormData] = useState({ email: '', cardPassword: '' });
  const [readerFormData, setReaderFormData] = useState({ email: '', readerPassword: '' });
  const [loadingType, setLoadingType] = useState<'card' | 'reader' | null>(null);

  const handleCardSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoadingType('card');
    try {
      const response = await cardLogin(cardFormData.email, cardFormData.cardPassword);
      if (response?.success) {
        toast.success(response.message || 'Login successful!');
        router.push('/dashboard/card');
      } else {
        toast.error(response?.message || 'Card login failed');
      }
    } finally {
      setLoadingType(null);
    }
  };

  const handleReaderSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    setLoadingType('reader');
    try {
      const response = await readerLogin(readerFormData.email, readerFormData.readerPassword);
      if (response?.success) {
        toast.success(response.message || 'Login successful!');
        router.push('/dashboard/reader');
      } else {
        toast.error(response?.message || 'Reader login failed');
      }
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <main className="font-brand-sans bg-brand-bg text-brand-text min-h-screen flex items-center justify-center p-6 selection:bg-brand-primary/20 selection:text-brand-primary">
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'var(--brand-bg)',
            color: 'var(--brand-text)',
            border: '1px solid var(--brand-secondary)',
            fontFamily: 'var(--font-brand-sans)',
          },
          success: {
            iconTheme: {
              primary: 'var(--brand-primary)',
              secondary: 'var(--brand-primary)',
            },
          },
        }}
      />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-12">
          <h1 className="font-brand-serif text-4xl md:text-5xl font-medium mb-4">
            Welcome <span className="font-brand-cursive text-brand-primary text-5xl md:text-6xl italic">Back</span>
          </h1>
          <p className="opacity-60 font-light">Please sign in to access your dashboard</p>
        </div>

        <div className="relative bg-white/50 backdrop-blur-sm border border-brand-secondary/20 rounded-3xl shadow-sm overflow-hidden">
          <AnimatePresence>
            {loadingType && <LoginLoader loginType={loadingType} />}
          </AnimatePresence>
          {/* Tabs */}
          <div className="flex border-b border-brand-secondary/20">
            <button
              onClick={() => setActiveTab('card')}
              disabled={loadingType !== null}
              className={`flex-1 py-4 text-sm font-medium transition-all duration-300 relative ${
                activeTab === 'card' ? 'text-brand-primary' : 'text-brand-text/50 hover:text-brand-text'
              }`}
            >
              Card Login
              {activeTab === 'card' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reader')}
              disabled={loadingType !== null}
              className={`flex-1 py-4 text-sm font-medium transition-all duration-300 relative ${
                activeTab === 'reader' ? 'text-brand-primary' : 'text-brand-text/50 hover:text-brand-text'
              }`}
            >
              Reader Login
              {activeTab === 'reader' && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-primary"
                />
              )}
            </button>
          </div>

          {/* Form Area */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'card' ? (
                <motion.form
                  key="card-form"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleCardSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-medium text-brand-secondary mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={cardFormData.email}
                      onChange={(e) => setCardFormData({ ...cardFormData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-brand-secondary/30 rounded-xl focus:outline-none focus:border-brand-primary transition-colors font-light"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-medium text-brand-secondary mb-2">Card Password</label>
                    <input
                      type="password"
                      required
                      value={cardFormData.cardPassword}
                      onChange={(e) => setCardFormData({ ...cardFormData, cardPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-brand-secondary/30 rounded-xl focus:outline-none focus:border-brand-primary transition-colors font-light"
                      placeholder="••••••••"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-brand-primary text-white rounded-full text-sm font-medium tracking-wide hover:bg-opacity-90 transition-colors shadow-md"
                  >
                    Sign In as Card User
                  </motion.button>
                </motion.form>
              ) : (
                <motion.form
                  key="reader-form"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleReaderSubmit}
                  className="space-y-6"
                >
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-medium text-brand-secondary mb-2">Email Address</label>
                    <input
                      type="email"
                      required
                      value={readerFormData.email}
                      onChange={(e) => setReaderFormData({ ...readerFormData, email: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-brand-secondary/30 rounded-xl focus:outline-none focus:border-brand-primary transition-colors font-light"
                      placeholder="name@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-medium text-brand-secondary mb-2">Reader Password</label>
                    <input
                      type="password"
                      required
                      value={readerFormData.readerPassword}
                      onChange={(e) => setReaderFormData({ ...readerFormData, readerPassword: e.target.value })}
                      className="w-full px-4 py-3 bg-white border border-brand-secondary/30 rounded-xl focus:outline-none focus:border-brand-primary transition-colors font-light"
                      placeholder="••••••••"
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-3 bg-brand-primary text-white rounded-full text-sm font-medium tracking-wide hover:bg-opacity-90 transition-colors shadow-md"
                  >
                    Sign In as Reader
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center mt-8">
          <Link
            href="/"
            className="text-xs uppercase tracking-widest font-medium text-brand-secondary hover:text-brand-primary transition-colors"
          >
            &larr; Back to Home
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
