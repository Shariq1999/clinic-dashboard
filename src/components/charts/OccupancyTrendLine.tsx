import React from 'react';
import './chartSetup';
import { Line } from 'react-chartjs-2';
import { formatPct } from '../../utils/formatters';

interface OccupancyTrendLineProps {
  trendData: {
    dateLabel: string;
    occupancyPct: number;
    occupiedSlots: number;
    availableSlots: number;
  }[];
}

export const OccupancyTrendLine: React.FC<OccupancyTrendLineProps> = ({ trendData }) => {
  const data = {
    labels: trendData.map((d) => d.dateLabel),
    datasets: [
      {
        label: 'Dialysis Occupancy %',
        data: trendData.map((d) => d.occupancyPct),
        borderColor: '#0d9488', // teal-600
        backgroundColor: 'rgba(13, 148, 136, 0.1)',
        fill: true,
        tension: 0.3,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2.5,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const idx = context.dataIndex;
            const item = trendData[idx];
            return [
              ` Occupancy: ${formatPct(item.occupancyPct, false)}`,
              ` Occupied: ${item.occupiedSlots} slots`,
              ` Available: ${item.availableSlots} slots (Excl. Sundays)`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10, family: 'Inter, sans-serif' }, maxTicksLimit: 12 },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 11, family: 'Inter, sans-serif' },
          callback: (value: any) => `${value}%`,
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Dialysis Occupancy Trend</h3>
          <p className="text-xs text-slate-500">
            Weekly trajectory (Sundays strictly excluded from denominator)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block"></span>
          <span className="text-xs font-semibold text-teal-800">Capacity %</span>
        </div>
      </div>
      <div className="h-64 w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};
