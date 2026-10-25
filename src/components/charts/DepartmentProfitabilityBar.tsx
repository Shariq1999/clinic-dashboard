import React from 'react';
import { Bar } from 'react-chartjs-2';
import './chartSetup';
import { formatINR } from '../../utils/formatters';
import { DepartmentProfitabilityMetric } from '../../types/schema';

interface Props {
  metrics: DepartmentProfitabilityMetric[];
}

export const DepartmentProfitabilityBar: React.FC<Props> = ({ metrics }) => {
  const labels = metrics.map((m) => m.name.replace(' (Pathology)', '').replace(' Center', ''));

  const data = {
    labels,
    datasets: [
      {
        label: 'Gross Revenue',
        data: metrics.map((m) => m.revenue),
        backgroundColor: '#0d9488', // teal-600
        borderRadius: 4,
      },
      {
        label: 'Total Cost',
        data: metrics.map((m) => m.totalCost),
        backgroundColor: '#f43f5e', // rose-500
        borderRadius: 4,
      },
      {
        label: 'Net Operating Profit',
        data: metrics.map((m) => m.netProfit),
        backgroundColor: '#6366f1', // indigo-500
        borderRadius: 4,
      },
    ],
  };

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: 12,
          font: { size: 11, weight: 'bold' as const },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const val = context.parsed.y;
            return ` ${context.dataset.label}: ${formatINR(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
      y: {
        grid: { color: '#f1f5f9' },
        ticks: {
          callback: (value: any) => {
            if (Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
            if (Math.abs(value) >= 1000) return `₹${(value / 1000).toFixed(0)}k`;
            return `₹${value}`;
          },
          font: { size: 10 },
        },
      },
    },
  };

  return (
    <div className="h-64 sm:h-72 w-full">
      <Bar data={data} options={options} />
    </div>
  );
};
