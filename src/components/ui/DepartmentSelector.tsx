import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { DepartmentId } from '../../types/schema';
import { Stethoscope } from 'lucide-react';

export const DepartmentSelector: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { department, setDepartment } = useAppStore();

  return (
    <div className={`flex items-center gap-1.5 ${compact ? 'text-xs' : 'text-sm'}`}>
      <Stethoscope className="w-4 h-4 text-teal-600 shrink-0" />
      <select
        value={department}
        onChange={(e) => setDepartment(e.target.value as 'ALL' | DepartmentId)}
        className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 shadow-xs hover:border-teal-500 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer"
      >
        <option value="ALL">🩺 All Departments (Consolidated)</option>
        <option value="DIALYSIS">🩸 Dialysis Center</option>
        <option value="BLOOD_TEST">🔬 Blood Tests (Pathology)</option>
        <option value="USG">📡 USG / Ultrasound</option>
        <option value="XRAY">🩻 X-Ray & Radiology</option>
        <option value="PHYSIO">🏃 Physiotherapy</option>
        <option value="CONSULTATION">👨‍⚕️ Doctor Consultations</option>
      </select>
    </div>
  );
};
