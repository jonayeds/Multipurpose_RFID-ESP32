"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cardLogin } from '@/Services/card';
import toast, { Toaster } from 'react-hot-toast';
import { readerLogin } from '@/Services/reader';

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'card' | 'reader'>('card');
  const [cardFormData, setCardFormData] = useState({ email: '', cardPassword: '' });
  const [readerFormData, setReaderFormData] = useState({ email: '', readerPassword: '' });

  const handleCardSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
      const response = await cardLogin(cardFormData.email, cardFormData.cardPassword);
      if (response?.success) {
        toast.success(response.message || 'Login successful!');
        router.push('/dashboard/card');
      } else {
        toast.error(response?.message || 'Card login failed');
      }
  };

  const handleReaderSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
      const response = await readerLogin(readerFormData.email, readerFormData.readerPassword);
      if (response?.success) {
        toast.success(response.message || 'Login successful!');
        router.push('/dashboard/reader');
      } else {
        toast.error(response?.message || 'Reader login failed');
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

        <div className="bg-white/50 backdrop-blur-sm border border-brand-secondary/20 rounded-3xl shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-brand-secondary/20">
            <button
              onClick={() => setActiveTab('card')}
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
