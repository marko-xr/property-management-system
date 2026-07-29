import React from 'react';
import { Printer, CheckCircle2, UserCheck } from 'lucide-react';
import { OfficeSettings } from '../types';

interface HeaderProps {
  activeTab?: string;
  title?: string;
  subtitle?: string;
  settings: OfficeSettings;
  onPrintPage?: () => void;
  currentUser?: { username: string; name: string; role: string };
}

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  dashboard: { title: 'لوحة التحكم الرئيسيّة', subtitle: 'نظرة عامة على مؤشرات الأداء المالي والعقود والالتزامات' },
  expenses: { title: 'سجل المصروفات والنفقات', subtitle: 'متابعة وإدارة مصروفات التشغيل والخدمات اليومية للمكتب' },
  revenues: { title: 'الإيرادات والعمولات', subtitle: 'تسجيل وتحصيل عمولات الإيجارات والخدمات العقارية' },
  contracts: { title: 'سجل عقود الإيجار', subtitle: 'إدارة عقود الإيجار النشطة، الدفعات، والحدود الزمنية' },
  collection: { title: 'متابعة تحصيل الدفعات', subtitle: 'جدول الأقساط المستحقة، المتأخرات، ومطالبات التحصيل' },
  employeeDebts: { title: 'مديونيات وقروض الموظفين', subtitle: 'متابعة سُلف الموظفين والخصومات وتسديد الديون' },
  projects: { title: 'المشاريع وبنود المقاولين', subtitle: 'متابعة اتفافيات المشاريع، المستخلصات ومدفوعات المقاولين' },
  executedProjects: { title: 'المشاريع المنفذة', subtitle: 'أرشيف التكاليف الفعلية وأسعار بيع العقارات المنفذة' },
  obligations: { title: 'الالتزامات والرخص والمواعيد', subtitle: 'تنبيهات انتهاء الرخص التجارية، الفواتير، والالتزامات' },
  settings: { title: 'إعدادات النظام والبيانات', subtitle: 'تخصيص بيانات المكتب العقاري، المستخدمين والنسخ الاحتياطي' },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab = 'dashboard',
  title,
  subtitle,
  onPrintPage,
  currentUser
}) => {
  const currentTabInfo = TAB_TITLES[activeTab] || { title: title || 'لوحة التحكم', subtitle: subtitle || '' };
  const displayTitle = title || currentTabInfo.title;
  const displaySubtitle = subtitle || currentTabInfo.subtitle;

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 px-6 flex items-center justify-between no-print shadow-xs shrink-0">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-base font-bold text-slate-900 tracking-tight">{displayTitle}</h1>
        {displaySubtitle && <p className="text-[11px] text-slate-500 font-medium">{displaySubtitle}</p>}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Storage / Server Status Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200/80 text-[11px] font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>متصل وحافظ تلقائي</span>
        </div>

        {/* Print Button */}
        {onPrintPage && (
          <button
            onClick={onPrintPage}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors border border-slate-200"
            title="طباعة الصفحة الحالية"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>طباعة</span>
          </button>
        )}

        {/* User profile */}
        {currentUser && (
          <div className="flex items-center gap-2 pr-3 border-r border-slate-200">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-blue-400 flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="hidden md:block text-right">
              <div className="text-xs font-bold text-slate-900 leading-none">{currentUser.name}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{currentUser.role}</div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

