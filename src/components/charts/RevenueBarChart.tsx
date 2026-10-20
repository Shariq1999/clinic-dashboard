import React from 'react';
import './chartSetup';
import { Bar } from 'react-chartjs-2';
import { formatINR } from '../../utils/formatters';

interface RevenueBarChartProps {
  monthlyData: {
    month: string;
    dialysis: number;
    bloodTest: number;
    xray: number;
    usg: number;
    physio: number;
    consultation: number;
  }[];
}

export const RevenueBarChart: React.FC<RevenueBarChartProps> = ({ monthlyData }) => {
  const labels = monthlyData.map((d) => d.month);

  const data = {
    labels,
    datasets: [
      {
        label: 'Dialysis',
        data: monthlyData.map((d) => d.dialysis),
        backgroundColor: '#0d9488', // teal-600
        borderRadius: 4,
      },
      {
        label: 'Blood Tests',
        data: monthlyData.map((d) => d.bloodTest),
        backgroundColor: '#f43f5e', // rose-500
        borderRadius: 4,
      },
      {
        label: 'X-Ray',
        data: monthlyData.map((d) => d.xray),
        backgroundColor: '#3b82f6', // blue-500
        borderRadius: 4,
      },
      {
        label: 'USG / Doppler',
        data: monthlyData.map((d) => d.usg),
        backgroundColor: '#8b5cf6', // purple-500
        borderRadius: 4,
      },
      {
        label: 'Physiotherapy',
        data: monthlyData.map((d) => d.physio),
        backgroundColor: '#f59e0b', // amber-500
        borderRadius: 4,
      },
      {
        label: 'Consultation',
        data: monthlyData.map((d) => d.consultation),
        backgroundColor: '#10b981', // emerald-500
        borderRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, family: 'Inter, sans-serif' },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return ` ${context.dataset.label}: ${formatINR(val)}`;
          },
          footer: (tooltipItems: any[]) => {
            let sum = 0;
            tooltipItems.forEach((item) => {
              sum += item.parsed.y || 0;
            });
            return `Total: ${formatINR(sum)}`;
          },
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter, sans-serif' } },
      },
      y: {
        stacked: true,
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 11, family: 'Inter, sans-serif' },
          callback: (value: any) => formatINR(Number(value), true),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Monthly Revenue by Department</h3>
          <p className="text-xs text-slate-500">Stacked distribution across clinical service units</p>
        </div>
      </div>
      <div className="h-72 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
