import React from 'react';
import './chartSetup';
import { Bar } from 'react-chartjs-2';
import { formatNumber } from '../../utils/formatters';

interface FootfallByDeptProps {
  deptFootfall: {
    department: string;
    count: number;
    color: string;
  }[];
}

export const FootfallByDeptBar: React.FC<FootfallByDeptProps> = ({ deptFootfall }) => {
  const data = {
    labels: deptFootfall.map((d) => d.department),
    datasets: [
      {
        label: 'Patients / Sessions',
        data: deptFootfall.map((d) => d.count),
        backgroundColor: deptFootfall.map((d) => d.color),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) => ` ${formatNumber(context.raw)} patients`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 10, family: 'Inter, sans-serif' } },
      },
      y: {
        grid: { display: false },
        ticks: { font: { size: 11, family: 'Inter, sans-serif', weight: 'bold' as const } },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Patient Volume by Department</h3>
          <p className="text-xs text-slate-500">Total clinical patient encounters</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};
