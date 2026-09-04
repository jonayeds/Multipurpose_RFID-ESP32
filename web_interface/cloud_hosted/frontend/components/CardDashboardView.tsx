"use client";

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { logout } from '@/Services/card';
import toast from 'react-hot-toast';

interface UserData {
  _id: string;
  fullname: string;
  phoneNumber: string;
  cardPassword: string;
  doorcode: string;
  email: string;
  balance: number;
}

export default function CardDashboardView({ user }: { user: UserData }) {
  const router = useRouter();

  const handleSignOut = async () => {
    const result = await logout();
    if (result.success) {
      toast.success(result.message || 'Logout successful!');
      router.push('/login');
    } else {
      toast.error('Logout failed: ' + result.message);
    }
  };

  return (
    <main className="font-brand-sans bg-brand-bg text-brand-text min-h-screen p-6 md:p-12 selection:bg-brand-primary/20 selection:text-brand-primary">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-2">
            <h1 className="font-brand-serif text-4xl md:text-6xl font-medium leading-tight">
              Hello, <span className="font-brand-cursive text-brand-primary text-5xl md:text-7xl italic">{user.fullname}</span>
            </h1>
            <p className="opacity-60 font-light text-lg mt-2">Welcome back to your RFID command center.</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-6 py-2 border border-brand-secondary text-brand-text hover:bg-brand-secondary/10 rounded-full text-xs uppercase tracking-widest transition-all"
          >
            Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: User Identity & Balance */}
          <div className="lg:col-span-2 space-y-8">

            {/* Virtual Card Visual */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="relative group overflow-hidden p-8 rounded-3xl bg-brand-primary text-white shadow-xl transition-transform hover:scale-[1.01] duration-500"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />

              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Available Balance</p>
                    <h2 className="text-5xl font-brand-serif font-medium">
                      ${user.balance.toFixed(2)}
                    </h2>
                  </div>
                  <div className="w-12 h-8 bg-white/20 rounded-md backdrop-blur-sm border border-white/30" />
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-1">Card Holder</p>
                    <p className="text-xl font-medium tracking-wide">{user.fullname}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest opacity-70 mb-1">ID Number</p>
                    <p className="font-mono text-sm opacity-90">{user._id.slice(-12).toUpperCase()}</p>
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
                <p className="text-xs uppercase tracking-widest text-brand-secondary font-medium mb-2">Email Address</p>
                <p className="text-lg font-medium opacity-80">{user.email}</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="p-6 bg-white/40 border border-brand-secondary/20 rounded-2xl backdrop-blur-sm"
              >
                <p className="text-xs uppercase tracking-widest text-brand-secondary font-medium mb-2">Phone Number</p>
                <p className="text-lg font-medium opacity-80">+{user.phoneNumber}</p>
              </motion.div>
            </div>
          </div>

          {/* Right Column: Security & Access */}
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

              <h3 className="font-brand-serif text-2xl font-medium mb-6">Security Keys</h3>

              <div className="space-y-6">
                <div className="group">
                  <p className="text-xs uppercase tracking-widest text-brand-secondary font-medium mb-2 group-hover:text-brand-primary transition-colors">Door Access Code</p>
                  <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-secondary/20">
                    <span className="font-mono text-xl tracking-widest font-bold">{user.doorcode}</span>
                    <span className="text-[10px] uppercase opacity-40">Secure</span>
                  </div>
                </div>

                <div className="group">
                  <p className="text-xs uppercase tracking-widest text-brand-secondary font-medium mb-2 group-hover:text-brand-primary transition-colors">Card Password</p>
                  <div className="flex items-center justify-between p-3 bg-brand-bg rounded-xl border border-brand-secondary/20">
                    <span className="font-mono text-xl tracking-widest font-bold">{user.cardPassword}</span>
                    <span className="text-[10px] uppercase opacity-40">Private</span>
                  </div>
                </div>
              </div>

              <div className="mt-10 pt-6 border-t border-brand-secondary/20">
                <p className="text-xs italic opacity-50 text-center leading-relaxed">
                  Security codes are encrypted and linked to your unique hardware signature.
                </p>
              </div>
            </motion.div>

            {/* Quick Action / Status */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="p-6 bg-brand-primary/5 border border-brand-primary/20 rounded-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <div>
                  <p className="text-sm font-medium">System Status: Active</p>
                  <p className="text-xs opacity-60">Your card is ready for use.</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </main>
  );
}
