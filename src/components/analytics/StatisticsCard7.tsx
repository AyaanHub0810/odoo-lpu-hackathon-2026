'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, Package, Truck, ArrowLeftRight, AlertTriangle } from 'lucide-react';

export interface StatItem {
  id: string;
  title: string;
  value: string | number;
  unit?: string;
  change: {
    value: string;
    isPositive: boolean;
    period: string;
  };
  sparkline: number[];
  icon: React.ReactNode;
  color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
  subtitle: string;
  target?: string;
}

interface StatisticsCard7Props {
  stats?: StatItem[];
  onCardClick?: (statId: string) => void;
}

const defaultStats: StatItem[] = [
  {
    id: 'stock-units',
    title: 'Total Stock Units',
    value: '430',
    unit: 'units',
    change: {
      value: '+12.4%',
      isPositive: true,
      period: 'vs last week',
    },
    sparkline: [310, 340, 360, 350, 390, 410, 430],
    icon: <Package className="h-5 w-5" />,
    color: 'indigo',
    subtitle: 'Across 4 Warehouses',
    target: 'Target: 500 max capacity',
  },
  {
    id: 'inbound-rate',
    title: 'Inbound Receipts Flow',
    value: '6',
    unit: 'operations',
    change: {
      value: '+8.2%',
      isPositive: true,
      period: 'this week',
    },
    sparkline: [2, 3, 5, 4, 7, 5, 6],
    icon: <Truck className="h-5 w-5" />,
    color: 'emerald',
    subtitle: '4 ready to receive, 1 late',
    target: '100% QA inspected',
  },
  {
    id: 'outbound-rate',
    title: 'Outbound Dispatch Flow',
    value: '6',
    unit: 'dispatches',
    change: {
      value: '-3.1%',
      isPositive: false,
      period: 'vs yesterday',
    },
    sparkline: [8, 7, 6, 7, 5, 6, 6],
    icon: <ArrowLeftRight className="h-5 w-5" />,
    color: 'violet',
    subtitle: '4 ready, 2 waiting, 1 late',
    target: 'SLA cutoff: 18:00 EST',
  },
  {
    id: 'stock-alerts',
    title: 'Critical Stock Flags',
    value: '3',
    unit: 'items',
    change: {
      value: '-25.0%',
      isPositive: true, // fewer stock flags is positive!
      period: 'resolved today',
    },
    sparkline: [6, 5, 5, 4, 4, 3, 3],
    icon: <AlertTriangle className="h-5 w-5" />,
    color: 'rose',
    subtitle: 'Below safety thresholds',
    target: 'Safety reorder triggered',
  },
];

export function StatisticsCard7({ stats = defaultStats, onCardClick }: StatisticsCard7Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} onClick={() => onCardClick?.(stat.id)} />
      ))}
    </div>
  );
}

function StatCard({ stat, onClick }: { stat: StatItem; onClick?: () => void }) {
  const colorMap = {
    indigo: {
      bg: 'bg-indigo-500/15',
      text: 'text-indigo-400',
      border: 'hover:border-indigo-500/40 hover:shadow-indigo-500/10',
      glow: 'from-indigo-600/20 to-transparent',
      sparkStroke: '#818cf8',
      sparkGrad: '#6366f1',
    },
    emerald: {
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'hover:border-emerald-500/40 hover:shadow-emerald-500/10',
      glow: 'from-emerald-600/20 to-transparent',
      sparkStroke: '#34d399',
      sparkGrad: '#10b981',
    },
    violet: {
      bg: 'bg-cyan-500/15',
      text: 'text-cyan-400',
      border: 'hover:border-cyan-500/40 hover:shadow-cyan-500/10',
      glow: 'from-cyan-600/20 to-transparent',
      sparkStroke: '#22d3ee',
      sparkGrad: '#06b6d4',
    },
    rose: {
      bg: 'bg-rose-500/15',
      text: 'text-rose-400',
      border: 'hover:border-rose-500/40 hover:shadow-rose-500/10',
      glow: 'from-rose-600/20 to-transparent',
      sparkStroke: '#fb7185',
      sparkGrad: '#f43f5e',
    },
    amber: {
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'hover:border-amber-500/40 hover:shadow-amber-500/10',
      glow: 'from-amber-600/20 to-transparent',
      sparkStroke: '#fbbf24',
      sparkGrad: '#f59e0b',
    },
  }[stat.color];

  // SVG Sparkline geometry calculation
  const max = Math.max(...stat.sparkline);
  const min = Math.min(...stat.sparkline);
  const range = max - min || 1;
  const width = 110;
  const height = 36;

  const points = stat.sparkline.map((val, idx) => {
    const x = (idx / (stat.sparkline.length - 1)) * width;
    const y = height - ((val - min) / range) * (height - 10) - 5;
    return { x, y };
  });

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x},${pt.y}`, '');
  const areaD = `${pathD} L ${width},${height} L 0,${height} Z`;

  return (
    <div
      onClick={onClick}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-5 shadow-sm dark:shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:hover:shadow-2xl cursor-pointer ${colorMap.border}`}
    >
      {/* Decorative subtle ambient backlight wash */}
      <div className={`absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-gradient-to-br ${colorMap.glow} opacity-60 blur-2xl group-hover:opacity-100 transition-opacity pointer-events-none`} />

      {/* Header with Title and Icon */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            {stat.subtitle}
          </span>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
            {stat.title}
          </h4>
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200/80 dark:border-white/10 ${colorMap.bg} ${colorMap.text} shadow-inner group-hover:scale-110 transition-transform`}
        >
          {stat.icon}
        </div>
      </div>

      {/* Main Metric Value and Micro Sparkline */}
      <div className="my-4 flex items-end justify-between relative z-10">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white">{stat.value}</span>
            {stat.unit && <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{stat.unit}</span>}
          </div>

          {/* Change pill */}
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ring-1 ${
                stat.change.isPositive
                  ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-emerald-300 dark:ring-emerald-500/30'
                  : 'bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-rose-300 dark:ring-rose-500/30'
              }`}
            >
              {stat.change.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {stat.change.value}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">{stat.change.period}</span>
          </div>
        </div>

        {/* Micro Sparkline Chart */}
        <div className="relative">
          <svg width={width} height={height} className="overflow-visible">
            <defs>
              <linearGradient id={`grad-${stat.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colorMap.sparkGrad} stopOpacity="0.35" />
                <stop offset="100%" stopColor={colorMap.sparkGrad} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path d={areaD} fill={`url(#grad-${stat.id})`} />
            <path
              d={pathD}
              fill="none"
              stroke={colorMap.sparkStroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-[0_0_6px_rgba(99,102,241,0.2)]"
            />
            {/* Last dot */}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3.5"
                fill={colorMap.sparkStroke}
                className="animate-ping"
              />
            )}
            {points.length > 0 && (
              <circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3"
                fill="#ffffff"
              />
            )}
          </svg>
        </div>
      </div>

      {/* Target or Subtitle Footer */}
      {stat.target && (
        <div className="relative z-10 border-t border-slate-100 dark:border-white/5 pt-2 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>{stat.target}</span>
          <span className="font-semibold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center gap-0.5 transition-colors">
            Details &rarr;
          </span>
        </div>
      )}
    </div>
  );
}
