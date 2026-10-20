import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatPct } from '../../utils/formatters';

interface KpiCardProps {
  title: string;
  value: string;
  subValue?: string;
  deltaPct?: number;
  deltaLabel?: string;
  icon: LucideIcon;
  variant?: 'teal' | 'blue' | 'indigo' | 'emerald' | 'amber' | 'rose';
  isInverseDelta?: boolean; // if true, positive delta is bad (e.g. cost)
}

const colorMap = {
  teal: {
    bg: 'bg-teal-50',
    border: 'border-teal-200',
    iconBg: 'bg-teal-100',
    iconText: 'text-teal-700',
    accent: 'text-teal-600',
  },
  blue: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconText: 'text-blue-700',
    accent: 'text-blue-600',
  },
  indigo: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconText: 'text-indigo-700',
    accent: 'text-indigo-600',
  },
  emerald: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    iconBg: 'bg-emerald-100',
    iconText: 'text-emerald-700',
    accent: 'text-emerald-600',
  },
  amber: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconText: 'text-amber-700',
    accent: 'text-amber-600',
  },
  rose: {
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    iconBg: 'bg-rose-100',
    iconText: 'text-rose-700',
    accent: 'text-rose-600',
  },
};

export const KpiCard: React.FC<KpiCardProps> = ({
  title,
  value,
  subValue,
  deltaPct,
  deltaLabel = 'vs prior period',
  icon: Icon,
  variant = 'teal',
  isInverseDelta = false,
}) => {
  const c = colorMap[variant];

  // For revenue/profit: positive is good (green), negative is bad (red)
  // For cost: positive is bad (red), negative is good (green)
  const isPositive = deltaPct !== undefined && deltaPct > 0;
  const isNeutral = deltaPct === undefined || Math.abs(deltaPct) < 0.05;
  const isGood = isInverseDelta ? !isPositive : isPositive;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className={`p-2 rounded-lg ${c.iconBg}`}>
          <Icon className={`w-4 h-4 ${c.iconText}`} />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900">{value}</span>
        {subValue && <span className="text-xs text-slate-500 font-medium">{subValue}</span>}
      </div>

      {deltaPct !== undefined && (
        <div className="flex items-center gap-1.5 text-xs">
          {isNeutral ? (
            <span className="inline-flex items-center text-slate-500 font-medium">
              <Minus className="w-3.5 h-3.5 mr-0.5" /> 0.0%
            </span>
          ) : (
            <span
              className={`inline-flex items-center font-semibold px-1.5 py-0.5 rounded text-[11px] ${
                isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}
            >
              {isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {formatPct(deltaPct)}
            </span>
          )}
          <span className="text-slate-400 text-[11px] truncate">{deltaLabel}</span>
        </div>
      )}
    </div>
  );
};
