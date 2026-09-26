'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface DataPoint {
  date: string;
  inbound: number;
  outbound: number;
  label: string;
}

const data7D: DataPoint[] = [
  { date: 'Mon', inbound: 42, outbound: 38, label: 'Mon, Oct 19' },
  { date: 'Tue', inbound: 55, outbound: 48, label: 'Tue, Oct 20' },
  { date: 'Wed', inbound: 68, outbound: 62, label: 'Wed, Oct 21' },
  { date: 'Thu', inbound: 49, outbound: 56, label: 'Thu, Oct 22' },
  { date: 'Fri', inbound: 82, outbound: 74, label: 'Fri, Oct 23' },
  { date: 'Sat', inbound: 35, outbound: 28, label: 'Sat, Oct 24' },
  { date: 'Sun', inbound: 64, outbound: 58, label: 'Sun, Oct 25' },
];

const data30D: DataPoint[] = [
  { date: 'W1', inbound: 280, outbound: 245, label: 'Week 1 (Oct 1-7)' },
  { date: 'W2', inbound: 340, outbound: 310, label: 'Week 2 (Oct 8-14)' },
  { date: 'W3', inbound: 310, outbound: 335, label: 'Week 3 (Oct 15-21)' },
  { date: 'W4', inbound: 420, outbound: 390, label: 'Week 4 (Oct 22-28)' },
];

const data90D: DataPoint[] = [
  { date: 'Aug', inbound: 1240, outbound: 1120, label: 'August 2026' },
  { date: 'Sep', inbound: 1480, outbound: 1390, label: 'September 2026' },
  { date: 'Oct', inbound: 1650, outbound: 1540, label: 'October 2026' },
];

export function EfferdAreaChart() {
  const [timeRange, setTimeRange] = useState<'7D' | '30D' | '90D'>('7D');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeData = timeRange === '7D' ? data7D : timeRange === '30D' ? data30D : data90D;

  const totalInbound = activeData.reduce((acc, curr) => acc + curr.inbound, 0);
  const totalOutbound = activeData.reduce((acc, curr) => acc + curr.outbound, 0);
  const netDelta = totalInbound - totalOutbound;

  // Chart Geometry & SVG Scaling
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingBottom = 40;
  const paddingTop = 25;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  const maxVal = Math.max(...activeData.map((d) => Math.max(d.inbound, d.outbound))) * 1.15 || 100;

  const getCoordinates = (points: number[]) => {
    return points.map((val, idx) => {
      const x = paddingX + (idx / (points.length - 1)) * chartW;
      const y = paddingTop + chartH - (val / maxVal) * chartH;
      return { x, y };
    });
  };

  const inboundCoords = getCoordinates(activeData.map((d) => d.inbound));
  const outboundCoords = getCoordinates(activeData.map((d) => d.outbound));

  // Build smooth bezier curves
  const createCurvedPath = (coords: { x: number; y: number }[]) => {
    if (coords.length === 0) return '';
    let d = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i];
      const p1 = coords[i + 1];
      const cx = (p0.x + p1.x) / 2;
      d += ` C ${cx},${p0.y} ${cx},${p1.y} ${p1.x},${p1.y}`;
    }
    return d;
  };

  const inboundPath = createCurvedPath(inboundCoords);
  const outboundPath = createCurvedPath(outboundCoords);

  const inboundArea = `${inboundPath} L ${inboundCoords[inboundCoords.length - 1].x},${
    paddingTop + chartH
  } L ${inboundCoords[0].x},${paddingTop + chartH} Z`;

  const outboundArea = `${outboundPath} L ${outboundCoords[outboundCoords.length - 1].x},${
    paddingTop + chartH
  } L ${outboundCoords[0].x},${paddingTop + chartH} Z`;

  const activePoint = hoveredIndex !== null ? activeData[hoveredIndex] : null;

  return (
    <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white/90 dark:bg-slate-900/60 p-6 sm:p-8 shadow-sm dark:shadow-2xl backdrop-blur-xl">
      {/* Header with Title and Range Toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-white/10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/30 px-3 py-1 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              <Sparkles className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
              Efferd Engine
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Dual Flow Analysis</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Inbound Receipts vs Outbound Dispatches
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Volumetric flow comparison across Central, North, and East distribution depots.
          </p>
        </div>

        {/* Controls: Time range pill switcher */}
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 p-1 text-xs font-bold text-slate-600 dark:text-slate-400">
            {(['7D', '30D', '90D'] as const).map((range) => (
              <button
                key={range}
                onClick={() => {
                  setTimeRange(range);
                  setHoveredIndex(null);
                }}
                className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow-md font-bold'
                    : 'hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {range}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
              <span>Inbound (WH/IN)</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span>Outbound (WH/OUT)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 border-b border-slate-100 dark:border-white/10">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Inbound</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">{formatNumber(totalInbound)}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">units</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Total Outbound</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">{formatNumber(totalOutbound)}</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">units</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Net Flow Balance</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-2xl font-black font-mono ${netDelta >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {netDelta >= 0 ? `+${formatNumber(netDelta)}` : formatNumber(netDelta)}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">net in stock</span>
          </div>
        </div>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Turnaround Velocity</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">4.2</span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">hrs avg pick-to-dock</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Area Chart */}
      <div className="relative mt-6 select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Inbound Gradient */}
            <linearGradient id="efferd-inbound-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Outbound Gradient */}
            <linearGradient id="efferd-outbound-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
            const y = paddingTop + chartH * (1 - pct);
            return (
              <g key={i}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#1e293b"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[10px] font-mono fill-slate-500"
                >
                  {Math.round(maxVal * pct)}
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={inboundArea} fill="url(#efferd-inbound-grad)" />
          <path d={outboundArea} fill="url(#efferd-outbound-grad)" />

          {/* Smooth Stroke Lines */}
          <path
            d={inboundPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
          />
          <path
            d={outboundPath}
            fill="none"
            stroke="#818cf8"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-[0_0_8px_rgba(99,102,241,0.5)]"
          />

          {/* X Axis Labels & Interactive hover hit-zones */}
          {activeData.map((d, i) => {
            const x = inboundCoords[i].x;
            const isHovered = hoveredIndex === i;

            return (
              <g key={d.date} onMouseEnter={() => setHoveredIndex(i)} className="cursor-pointer">
                {/* Invisible wide hit target for hover */}
                <rect
                  x={x - chartW / (activeData.length * 2)}
                  y={paddingTop}
                  width={chartW / activeData.length}
                  height={chartH + paddingBottom}
                  fill="transparent"
                />

                {/* X Axis Label */}
                <text
                  x={x}
                  y={height - 12}
                  textAnchor="middle"
                  className={`text-xs font-bold transition-colors ${
                    isHovered ? 'fill-white font-black' : 'fill-slate-400'
                  }`}
                >
                  {d.date}
                </text>

                {/* Crosshair guide line on hover */}
                {isHovered && (
                  <line
                    x1={x}
                    y1={paddingTop}
                    x2={x}
                    y2={paddingTop + chartH}
                    stroke="#475569"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />
                )}

                {/* Data point dots */}
                <circle
                  cx={x}
                  cy={inboundCoords[i].y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#10b981"
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all"
                />
                <circle
                  cx={x}
                  cy={outboundCoords[i].y}
                  r={isHovered ? 5.5 : 3.5}
                  fill="#818cf8"
                  stroke="#0f172a"
                  strokeWidth="2"
                  className="transition-all"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating tooltip anchored to hovered point */}
        {activePoint && hoveredIndex !== null && (
          <div
            className="absolute top-2 pointer-events-none rounded-xl border border-slate-200/90 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-md transition-all duration-150 z-20"
            style={{
              left: `${Math.min(
                Math.max((inboundCoords[hoveredIndex].x / width) * 100, 15),
                85
              )}%`,
              transform: 'translateX(-50%)',
            }}
          >
            <p className="text-2xs font-extrabold uppercase tracking-wider text-slate-400">
              {activePoint.label}
            </p>
            <div className="mt-2 space-y-1 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Inbound:
                </span>
                <span className="font-black text-white">{activePoint.inbound} units</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  Outbound:
                </span>
                <span className="font-black text-white">{activePoint.outbound} units</span>
              </div>
              <div className="border-t border-slate-800 pt-1 mt-1 flex items-center justify-between gap-4 text-2xs text-slate-400">
                <span>Net Delta:</span>
                <span className="font-bold text-teal-300">
                  {activePoint.inbound - activePoint.outbound >= 0 ? '+' : ''}
                  {activePoint.inbound - activePoint.outbound} units
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
