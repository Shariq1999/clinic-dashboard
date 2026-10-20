import React from 'react';
import './chartSetup';
import { Bar } from 'react-chartjs-2';
import { formatINR } from '../../utils/formatters';

interface ProfitWaterfallProps {
  grossRevenue: number;
  fixedOpex: number;
  doctorPayouts: number;
  netProfit: number;
}

export const ProfitWaterfallChart: React.FC<ProfitWaterfallProps> = ({
  grossRevenue,
  fixedOpex,
  doctorPayouts,
  netProfit,
}) => {
  const data = {
    labels: ['Gross Revenue', 'Monthly OPEX', 'Doctor Payouts', 'Net Profit'],
    datasets: [
      {
        label: 'Financial Flow',
        data: [grossRevenue, -fixedOpex, -doctorPayouts, netProfit],
        backgroundColor: [
          '#0d9488', // teal-600 - Revenue
          '#ef4444', // red-500 - OPEX
          '#f59e0b', // amber-500 - Doctor Payout
          netProfit >= 0 ? '#10b981' : '#dc2626', // emerald or red - Profit
        ],
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const raw = context.raw || 0;
            return ` ${context.label}: ${formatINR(raw)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter, sans-serif' } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 10, family: 'Inter, sans-serif' },
          callback: (value: any) => formatINR(Number(value), true),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">P&L Waterfall Bridge</h3>
          <p className="text-xs text-slate-500">Gross revenue minus operating expenditures and doctor fees</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Net Result</span>
          <p
            className={`text-base font-bold leading-none mt-0.5 ${
              netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {formatINR(netProfit, true)}
          </p>
        </div>
      </div>
      <div className="h-64 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
