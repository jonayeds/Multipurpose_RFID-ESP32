"use client";

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

type AnimatedHighlightProps = {
  children: React.ReactNode;
  className?: string;
  highlightClassName?: string;
};

export default function AnimatedHighlight({
  children,
  className = '',
  highlightClassName = 'bg-brand-primary',
}: AnimatedHighlightProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={`relative inline-block text-brand-bg ${className}`}>
      <motion.span
        className={`absolute rounded-md inset-y-0 left-0 z-0 ${highlightClassName}`}
        initial={{ width: 0 }}
        animate={isInView ? { width: '100%' } : { width: 0 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        aria-hidden="true"
      />
      <span className="relative z-10">{children}</span>
    </span>
  );
}