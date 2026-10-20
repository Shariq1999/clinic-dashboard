import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Calendar } from 'lucide-react';

export const DateRangePicker: React.FC = () => {
  const { startDate, endDate, setDateRange } = useAppStore();

  const handlePreset = (start: string, end: string) => {
    setDateRange(start, end);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-xs">
        <Calendar className="w-3.5 h-3.5 text-teal-600" />
        <span className="text-slate-500 font-medium">From</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setDateRange(e.target.value, endDate)}
          className="border-none p-0 text-slate-800 font-medium text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
        />
        <span className="text-slate-400">→</span>
        <span className="text-slate-500 font-medium">To</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setDateRange(startDate, e.target.value)}
          className="border-none p-0 text-slate-800 font-medium text-xs focus:ring-0 focus:outline-hidden cursor-pointer"
        />
      </div>

      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
        <button
          type="button"
          onClick={() => handlePreset('2026-04-01', '2026-09-30')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            startDate === '2026-04-01' && endDate === '2026-09-30'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Full 6M
        </button>
        <button
          type="button"
          onClick={() => handlePreset('2026-04-01', '2026-06-30')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            startDate === '2026-04-01' && endDate === '2026-06-30'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Q1
        </button>
        <button
          type="button"
          onClick={() => handlePreset('2026-07-01', '2026-09-30')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            startDate === '2026-07-01' && endDate === '2026-09-30'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Q2
        </button>
        <button
          type="button"
          onClick={() => handlePreset('2026-09-01', '2026-09-30')}
          className={`px-2 py-0.5 rounded font-medium transition-colors ${
            startDate === '2026-09-01' && endDate === '2026-09-30'
              ? 'bg-white text-teal-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sep '26
        </button>
      </div>
    </div>
  );
};
