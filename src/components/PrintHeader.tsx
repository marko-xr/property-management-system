import React from 'react';
import { OfficeSettings } from '../types';
import { PrintLetterhead } from './PrintLetterhead';

interface PrintHeaderProps {
  settings: OfficeSettings;
  title: string;
  subtitle?: string;
  dateRange?: string;
}

export const PrintHeader: React.FC<PrintHeaderProps> = ({
  settings,
  title,
  subtitle,
  dateRange
}) => {
  return (
    <div className="print-only text-slate-900">
      <PrintLetterhead settings={settings} />

      {/* Document Title Banner */}
      <div className="pt-3 border-t border-slate-300 text-center">
        <h2 className="text-xl font-extrabold bg-slate-100 py-2 rounded border border-slate-400 tracking-wide text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-600 mt-1 font-medium">{subtitle}</p>}
        {dateRange && <p className="text-xs text-slate-500 font-medium mt-0.5 font-mono">الفترة: {dateRange}</p>}
      </div>
    </div>
  );
};
