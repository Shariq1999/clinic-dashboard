import React from 'react';
import './chartSetup';
import { Doughnut } from 'react-chartjs-2';
import { formatINR } from '../../utils/formatters';

interface CostBreakdownDonutProps {
  rent: number;
  electricity: number;
  staffing: number;
  consumables: number;
  licensing: number;
  other: number;
  doctorPayouts: number;
}

export const CostBreakdownDonut: React.FC<CostBreakdownDonutProps> = ({
  rent,
  electricity,
  staffing,
  consumables,
  licensing,
  other,
  doctorPayouts,
}) => {
  const total = rent + electricity + staffing + consumables + licensing + other + doctorPayouts;

  const data = {
    labels: [
      'Staffing',
      'Rent',
      'Consumables',
      'Doctor Payouts',
      'Electricity',
      'Licensing',
      'Other OPEX',
    ],
    datasets: [
      {
        data: [staffing, rent, consumables, doctorPayouts, electricity, licensing, other],
        backgroundColor: [
          '#0284c7', // Sky 600 - Staffing
          '#4f46e5', // Indigo 600 - Rent
          '#d97706', // Amber 600 - Consumables
          '#10b981', // Emerald 500 - Doctor Payouts
          '#ea580c', // Orange 600 - Electricity
          '#8b5cf6', // Violet 500 - Licensing
          '#64748b', // Slate 500 - Other
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '68%',
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, family: 'Inter, sans-serif' },
          generateLabels: (chart: any) => {
            const dataObj = chart.data;
            if (dataObj.labels.length && dataObj.datasets.length) {
              return dataObj.labels.map((label: string, i: number) => {
                const value = dataObj.datasets[0].data[i];
                const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
                return {
                  text: `${label} (${pct}%)`,
                  fillStyle: dataObj.datasets[0].backgroundColor[i],
                  strokeStyle: '#ffffff',
                  lineWidth: 1,
                  hidden: false,
                  index: i,
                };
              });
            }
            return [];
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            const pct = total > 0 ? ((val / total) * 100).toFixed(1) : '0';
            return ` ${context.label}: ${formatINR(val)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Cost Structure Breakdown</h3>
          <p className="text-xs text-slate-500">6 OPEX buckets + dynamic doctor payouts</p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-slate-400 uppercase font-semibold">Total Cost</span>
          <p className="text-base font-bold text-slate-900 leading-none mt-0.5">
            {formatINR(total, true)}
          </p>
        </div>
      </div>
      <div className="h-64 w-full relative flex items-center justify-center">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
};
