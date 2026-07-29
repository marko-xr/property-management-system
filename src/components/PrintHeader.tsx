import React from 'react';
import { OfficeSettings } from '../types';
import { EmaratekLogo } from './EmaratekLogo';

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
  const currentDate = new Date().toLocaleDateString('ar-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="print-only mb-6 border-b-2 border-slate-900 pb-4 text-slate-900">
      {/* Official Top Banner */}
      <div className="mb-4">
        <EmaratekLogo className="w-full h-14 border-2 border-slate-900" />
      </div>

      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 pt-2 border-t border-slate-200">
        <div>
          <span>العنوان: {settings.address || 'عجمان - الجرف - دوار ماكدونالدز'}</span>
          <span className="mx-2">|</span>
          <span>البريد: {settings.email || 'emaratekrealestate@gmail.com'}</span>
        </div>
        <div>
          <span>تاريخ الطباعة: {currentDate}</span>
        </div>
      </div>

      {/* Document Title Banner */}
      <div className="mt-4 pt-3 border-t border-slate-300 text-center">
        <h2 className="text-xl font-extrabold bg-slate-100 py-2 rounded border border-slate-400 tracking-wide text-slate-900">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-slate-600 mt-1 font-medium">{subtitle}</p>}
        {dateRange && <p className="text-xs text-slate-500 font-medium mt-0.5 font-mono">الفترة: {dateRange}</p>}
      </div>
    </div>
  );
};
