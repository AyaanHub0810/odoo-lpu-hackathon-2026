'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Activity, Sparkles, RefreshCw } from 'lucide-react';

export enum HealthStrength {
  Critical = 'Critical',
  Warning = 'Warning',
  Good = 'Good',
  Optimal = 'Optimal',
}

interface HealthScoreData {
  id: string;
  title: string;
  description: string;
  metric: string;
  score: number;
  max: number;
  badge: string;
  color: 'emerald' | 'indigo' | 'amber' | 'blue';
  recommendation: string;
}

const initialScores: HealthScoreData[] = [
  {
    id: 'sla',
    title: 'Fulfillment & SLA Health',
    description: 'Measures on-time dispatch velocity, picking turnaround, and zero-backorder compliance.',
    metric: '98.4% on-time orders',
    score: 96,
    max: 100,
    badge: 'Optimal',
    color: 'emerald',
    recommendation: 'Outbound operations running at peak efficiency across all delivery corridors.',
  },
  {
    id: 'accuracy',
    title: 'Inventory Accuracy & Cycle',
    description: 'Calculates physical vs recorded inventory matching rate verified by recent cycle counts.',
    metric: '99.1% audit consistency',
    score: 92,
    max: 100,
    badge: 'Optimal',
    color: 'indigo',
    recommendation: 'Minimal discrepancies found in Zone A shelves. Next cycle count due in 12 days.',
  },
  {
    id: 'capacity',
    title: 'Rack & Bay Space Utilization',
    description: 'Real-time volumetric utilization across Central Warehouse and East Distribution bays.',
    metric: '84% pallet bay occupancy',
    score: 84,
    max: 100,
    badge: 'Good',
    color: 'blue',
    recommendation: 'Zone B has 16 pallet positions available for incoming shipments this week.',
  },
];

export function WarehouseHealthScores() {
  const [scores, setScores] = useState<HealthScoreData[]>(initialScores);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setScores([
        {
          ...initialScores[0],
          score: Math.min(100, Math.max(90, Math.floor(94 + Math.random() * 6))),
        },
        {
          ...initialScores[1],
          score: Math.min(100, Math.max(88, Math.floor(91 + Math.random() * 8))),
        },
        {
          ...initialScores[2],
          score: Math.min(100, Math.max(80, Math.floor(82 + Math.random() * 10))),
        },
      ]);
      setIsAuditing(false);
    }, 900);
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-300">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              21st.dev Metric Engine
            </span>
            <span className="text-xs font-semibold text-slate-400">Live Calibration</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Operational Health & Precision Scores
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time algorithmic index tracking fulfillment velocity, storage integrity, and bay throughput.
          </p>
        </div>

        <button
          onClick={handleRunAudit}
          disabled={isAuditing}
          className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all cursor-pointer disabled:opacity-70"
        >
          <RefreshCw className={`h-4 w-4 ${isAuditing ? 'animate-spin text-cyan-300' : 'text-indigo-200'}`} />
          <span>{isAuditing ? 'Running Telemetry Audit...' : 'Re-calculate Health Scores'}</span>
        </button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {scores.map((card, idx) => (
          <ScoreCardItem key={card.id} card={card} delay={idx * 150} />
        ))}
      </div>
    </div>
  );
}

function ScoreCardItem({ card, delay }: { card: HealthScoreData; delay: number }) {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Constants for 21st.dev half-circle calculation
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const strokeDashoffset = halfCircumference - (card.score / card.max) * halfCircumference;

  useEffect(() => {
    const start = 0;
    const end = card.score;
    const duration = 1200;
    const startTime = performance.now();

    const animateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.floor(start + (end - start) * ease));

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateNumber);
    }, delay);

    return () => clearTimeout(timer);
  }, [card.score, delay]);

  const colorConfig = {
    emerald: {
      strokeStart: '#10b981',
      strokeEnd: '#34d399',
      badge: 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
      glow: 'hover:shadow-emerald-500/10',
    },
    indigo: {
      strokeStart: '#6366f1',
      strokeEnd: '#818cf8',
      badge: 'bg-indigo-50 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-500/30',
      glow: 'hover:shadow-indigo-500/10',
    },
    blue: {
      strokeStart: '#06b6d4',
      strokeEnd: '#38bdf8',
      badge: 'bg-cyan-50 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-500/30',
      glow: 'hover:shadow-cyan-500/10',
    },
    amber: {
      strokeStart: '#f59e0b',
      strokeEnd: '#fbbf24',
      badge: 'bg-amber-50 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
      glow: 'hover:shadow-amber-500/10',
    },
  }[card.color];

  const gradId = `gauge-grad-${card.id}`;

  return (
    <div
      className={`group relative flex flex-col justify-between rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-800/40 p-6 shadow-sm dark:shadow-xl hover:shadow-md dark:hover:shadow-2xl hover:border-indigo-400 dark:hover:border-indigo-500/40 transition-all duration-300 hover:-translate-y-1 ${colorConfig.glow}`}
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-3">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${colorConfig.badge}`}
          >
            <ShieldCheck className="h-3 w-3" />
            {card.badge}
          </span>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tracking-wider uppercase">Max: {card.max}</span>
        </div>

        <h3 className="text-base font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
          {card.title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">{card.description}</p>
      </div>

      {/* 21st.dev Half-Circle Progress Gauge */}
      <div className="relative my-6 flex flex-col items-center justify-center">
        <svg className="w-48 h-26 overflow-visible" viewBox="0 0 100 52">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colorConfig.strokeStart} />
              <stop offset="100%" stopColor={colorConfig.strokeEnd} />
            </linearGradient>
          </defs>

          {/* Background track arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-slate-700/60"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Animated active progress arc */}
          <path
            d="M 5 50 A 45 45 0 0 1 95 50"
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={halfCircumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Big Counter Value */}
        <div className="absolute bottom-0 text-center">
          <div className="flex items-baseline justify-center">
            <span className="text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">{animatedScore}</span>
            <span className="text-base font-bold text-slate-500 dark:text-slate-400 ml-0.5">/ {card.max}</span>
          </div>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block mt-0.5">
            Index Rating
          </span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="border-t border-slate-100 dark:border-white/5 pt-4 mt-1">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Activity className="h-3.5 w-3.5 text-slate-400" />
            Key Factor
          </span>
          <span className="font-bold text-slate-800 dark:text-white">{card.metric}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal italic">
          &ldquo;{card.recommendation}&rdquo;
        </p>
      </div>
    </div>
  );
}
