import React from 'react';
import { OfficeSettings } from '../types';
import companyLogo from '../../logo.jpeg';

interface PrintLetterheadProps {
  settings: OfficeSettings;
}

export const PrintLetterhead: React.FC<PrintLetterheadProps> = ({ settings }) => (
  <header className="print-letterhead">
    <div className="print-letterhead-en" dir="ltr">
      <div className="print-letterhead-name">EMARATEK REAL ESTATE</div>
      <div className="print-letterhead-location">
        Ajman - Al Jurf - McDonald's Roundabout
      </div>
    </div>

    <div className="print-letterhead-logo">
      <img src={companyLogo} alt="شعار إماراتك العقارية" />
    </div>

    <div className="print-letterhead-ar" dir="rtl">
      <div className="print-letterhead-name">إماراتك العقارية</div>
      <div className="print-letterhead-location">
        {settings.address || 'عجمان - الجرف - دوار ماكدونالدز'}
      </div>
    </div>
  </header>
);
