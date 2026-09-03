"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Playfair_Display, Inter, Caveat, Beau_Rivage } from 'next/font/google';
import Link from 'next/link';
import AnimatedHighlight from '../components/AnimatedHighlight';

const playfair = Playfair_Display({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
});

const beauRivage = Beau_Rivage({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-beau-rivage',
});

/**
 * DelicateHighlight Component
 */
const DelicateHighlight = ({ children }: { children: React.ReactNode }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <span ref={ref} className="relative inline-block ">
      <span className="relative z-10 md:mx-6 mx-4 ">{children}</span>
      <svg
        className="absolute left-0 -bottom-2 w-full h-4 pointer-events-none z-0 overflow-visible"
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 5,8 Q 25,0 50,8 T 95,4"
          fill="none"
          stroke="var(--brand-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isInView ? { pathLength: 1, opacity: 1 } : {}}
          transition={{ duration: 2.5, ease: "easeInOut" }}
        />
      </svg>
    </span>
  );
};

/**
 * EditorialButton Component
 */
const EditorialButton = ({ href, children, variant = 'primary' }: { href: string, children: React.ReactNode, variant?: 'primary' | 'secondary' }) => {
  const styles = variant === 'primary'
    ? "bg-brand-primary text-white hover:bg-opacity-90"
    : "bg-transparent text-brand-text border border-brand-secondary hover:bg-brand-secondary/10";

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`
          ${styles}
          px-8 py-3
          rounded-full
          text-sm font-medium tracking-wide
          transition-colors
          duration-300
          cursor-pointer
          inline-block
          text-center
        `}
      >
        {children}
      </motion.div>
    </Link>
  );
};

export default function LandingPage() {
  return (
    <main className={`${inter.variable} ${playfair.variable} ${caveat.variable} ${beauRivage.variable} font-brand-sans bg-brand-bg text-brand-text min-h-screen selection:bg-brand-primary/20 selection:text-brand-primary overflow-x-hidden`}>

      {/* Hero Section */}
      <section className="relative pt-32 pb-48 px-6">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`font-brand-serif text-5xl md:text-8xl font-medium tracking-tight mb-10 leading-[1.1]`}
          >
            One RFID Card. <br />
            <span className={`font-brand-cursive text-brand-primary text-6xl md:text-9xl inline-block relative italic mb-4`}>
              <span className="font-brand-cursive  "><DelicateHighlight>Infinite</DelicateHighlight></span>
            </span>
            Possibilities.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-lg md:text-xl mb-16 max-w-2xl mx-auto leading-relaxed font-light opacity-70"
          >
            A unified ecosystem for verification, access control, and seamless payments.
            Bridging the gap between physical presence and digital authorization.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          >
            <EditorialButton href="http://writer/register-card.html">Register Card</EditorialButton>
            <EditorialButton href="http://reader/register-reader.html">Register Reader</EditorialButton>
            <EditorialButton href="/login" variant="secondary">Login to Dashboard</EditorialButton>
          </motion.div>
        </div>

        <div className="absolute top-20 -left-20 md:left-[-5%] w-64 md:w-96 h-64 md:h-96 bg-brand-primary/5 rounded-full blur-3xl z-0" />
        <div className="absolute bottom-0 -right-20 md:right-[-5%] w-64 md:w-96 h-64 md:h-96 bg-brand-secondary/10 rounded-full blur-3xl z-0" />
      </section>

      {/* How It Works Section */}
      <section className="py-40 px-6 bg-white/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-24">
            <h2 className={`font-brand-serif text-4xl md:text-6xl font-medium mb-6`}>How It Works</h2>
            <div className="w-12 h-px bg-brand-secondary mx-auto" />
          </div>

          <div className="space-y-24 relative">
            <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-brand-secondary/30 -translate-x-1/2 hidden md:block" />

            {[
              {
                step: "01",
                title: "Provision",
                desc: "Register your RFID card via the local ESP32 portal to link your unique chip ID to your digital identity.",
                note: "setup in seconds!",
                position: "left"
              },
              {
                step: "02",
                title: "Tap",
                desc: "When the card touches the reader, the RC522 module captures the UID and validates the packet checksum.",
                note: "zero latency!",
                position: "right"
              },
              {
                step: "03",
                title: "Route",
                desc: "The ESP32 proxies the payload securely to our cloud backend, which triggers the authorization logic.",
                note: "secure & encrypted!",
                position: "left"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className={`flex flex-col md:flex-row items-center gap-12 ${item.position === 'right' ? 'md:flex-row-reverse text-right' : 'text-left'}`}
              >
                <div className="w-1/2 hidden md:block" />
                <div className="relative z-10 flex items-center justify-center w-12 h-12 rounded-full bg-brand-bg border border-brand-secondary font-medium text-sm shrink-0">
                  {item.step}
                </div>
                <div className={`w-full md:w-1/2 relative ${item.position === 'right' ? 'md:pr-12' : 'md:pl-12'}`}>
                  <h3 className={`font-brand-serif text-3xl font-medium mb-2`}>{item.title}</h3>
                  <p className="text-lg opacity-60 font-light leading-relaxed">{item.desc}</p>
                  <span className={`font-brand-cursive absolute ${
                    item.position === 'right'
                      ? 'left-0 -top-6 md:-left-20 md:-top-6'
                      : 'right-0 -top-6 md:-right-20 md:-top-6'
                  } text-brand-primary text-xl opacity-80 whitespace-nowrap`}>
                    {item.note}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Hardware Deep-Dive Section */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="space-y-8"
          >
            <h2 className={`font-brand-serif text-4xl md:text-6xl font-medium leading-tight`}>
              The Brains <br />
              <span className={`font-brand-cursive text-brand-primary text-5xl md:text-7xl italic`}>Behind the Tap</span>
            </h2>
            <p className="text-lg leading-loose text-brand-text/80 font-light">
              Our architecture leverages a high-performance <span className="font-medium">ESP32 proxy controller</span>
              integrated with an <AnimatedHighlight className="px-2">RC522 RFID module</AnimatedHighlight>.
              Instead of simple data passing, the local controller pre-processes card UID signatures,
              validates checksums, and manages a secure handshake before tunneling the encrypted
              payload to our cloud backend.
            </p>
            <div className="p-8 border border-brand-secondary/30 bg-white/50 backdrop-blur-sm inline-block rounded-2xl italic opacity-70">
              <p className="font-mono text-xs tracking-tighter">
                &gt; Processing UID: 0x4A 0x2B 0x1C 0x9F... <br />
                &gt; Status: Handshake Secure <br />
                &gt; Routing to Cloud: SUCCESS
              </p>
            </div>
          </motion.div>

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="aspect-4/5 w-full max-w-md mx-auto border border-brand-secondary/20 bg-white shadow-sm flex items-center justify-center relative overflow-hidden rounded-3xl"
            >
              <span className="text-black/20 font-light text-xl uppercase tracking-[0.2em] rotate-12">Hardware Architecture</span>
            </motion.div>
            <motion.svg
              initial={{ opacity: 0, pathLength: 0 }}
              whileInView={{ opacity: 1, pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5 }}
              className="absolute -left-10 md:-left-20 top-1/3 w-32 md:w-48 h-32 md:h-48 z-20 pointer-events-none"
              viewBox="0 0 100 100"
            >
              <path
                d="M 10,80 C 10,80 20,20 50,40 C 80,60 90,40 95,35 M 95,35 L 85,35 M 95,35 L 85,45"
                fill="none"
                stroke="var(--brand-primary)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-40 px-6 bg-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className={`font-brand-serif text-4xl md:text-6xl font-medium mb-6`}>The Architecture</h2>
            <div className="w-12 h-px bg-brand-secondary mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { name: "Next.js", role: "Cloud UI" },
              { name: "Express.js", role: "Backend API" },
              { name: "C++", role: "ESP32 Firmware" },
              { name: "RC522", role: "Hardware" }
            ].map((tech, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-10 text-center border border-brand-secondary/20 bg-white/50 rounded-2xl"
              >
                <h4 className={`font-brand-serif text-2xl font-medium mb-2`}>{tech.name}</h4>
                <p className="text-sm uppercase tracking-widest opacity-50 font-medium">{tech.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-40 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-24">
            <h2 className={`font-brand-serif text-4xl md:text-6xl font-medium mb-6`}>
              Ecosystem <span className={`font-brand-cursive text-brand-primary text-5xl md:text-7xl italic`}>Capabilities</span>
            </h2>
            <div className="w-12 h-px bg-brand-secondary mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              {
                title: "User Verification",
                desc: "Instant authorization. The system cross-references the card's unique UID against our encrypted database to grant access in milliseconds.",
                index: "01"
              },
              {
                title: "Door Unlock",
                desc: "Physical security simplified. Users can define a secure door code during registration, enabling remote-triggered electromagnetic locks.",
                index: "02"
              },
              {
                title: "Payment System",
                desc: "Wallet-less transactions. Load balance via the dashboard and let hardware readers automatically deduct costs upon a simple punch.",
                index: "03"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="group relative p-4"
              >
                <span className="block text-xs font-medium text-brand-secondary mb-4 tracking-widest uppercase">{feature.index}</span>
                <h3 className={`font-brand-serif text-3xl font-medium mb-4`}>{feature.title}</h3>
                <p className="text-xl opacity-60 leading-relaxed font-light">
                  {feature.desc}
                </p>
                <motion.div
                  className="h-px bg-brand-primary mt-6"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 px-6 border-t border-brand-secondary/20">
        <div className="max-w-6xl mx-auto flex flex-col items-center text-center">
          <div className="w-px h-12 bg-brand-secondary/40 mb-10" />
          <p className={`font-light text-sm opacity-60 tracking-wide leading-loose mb-8 font-brand-sans`}>
            &copy; {new Date().getFullYear()} Multipurpose RFID Ecosystem. <br />
            Designing the future of seamless access.
          </p>
          <Link
            href="/login"
            className="text-xs uppercase tracking-[0.2em] font-medium text-brand-primary hover:opacity-70 transition-opacity"
          >
            Return to Dashboard &rarr;
          </Link>
        </div>
      </footer>
    </main>
  );
}
