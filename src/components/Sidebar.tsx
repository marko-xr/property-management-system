import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  TrendingUp, 
  FileText, 
  Clock, 
  Users, 
  Briefcase, 
  Building2, 
  AlertCircle, 
  Settings,
  LogOut,
  Building
} from 'lucide-react';
import { AppState } from '../types';
import companyLogo from '../../logo.jpeg';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  state: AppState;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  state,
  onLogout
}) => {
  const today = new Date();
  
  // Uncollected / Overdue payments count
  let uncollectedCount = 0;
  if (state.contracts) {
    state.contracts.forEach(c => {
      if (c.status === 'نشط' && c.installments) {
        c.installments.forEach(inst => {
          if (inst.status === 'غير محصل') {
            uncollectedCount++;
          }
        });
      }
    });
  }

  // Contracts expiring within 60 days
  let expiringContractsCount = 0;
  if (state.contracts) {
    state.contracts.forEach(c => {
      if (c.status === 'نشط') {
        const end = new Date(c.endDate);
        const diffDays = Math.ceil((end.getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (diffDays <= 60) {
          expiringContractsCount++;
        }
      }
    });
  }

  // Near or overdue obligations
  let pendingObligationsCount = 0;
  if (state.obligations) {
    state.obligations.forEach(ob => {
      if (ob.status === 'قريب' || ob.status === 'متأخر') {
        pendingObligationsCount++;
      }
    });
  }

  const menuItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'expenses', label: 'المصروفات', icon: Receipt },
    { id: 'revenues', label: 'الإيرادات والعمولات', icon: TrendingUp },
    { 
      id: 'contracts', 
      label: 'الإيجارات والعقود', 
      icon: FileText,
      badge: expiringContractsCount > 0 ? expiringContractsCount : null,
      badgeColor: 'bg-amber-500'
    },
    { 
      id: 'collection', 
      label: 'متابعة التحصيل', 
      icon: Clock,
      badge: uncollectedCount > 0 ? uncollectedCount : null,
      badgeColor: 'bg-red-500'
    },
    { id: 'employeeDebts', label: 'الموظفين ومديونياتهم', icon: Users },
    { id: 'projects', label: 'المشاريع وبنود المقاولين', icon: Briefcase },
    { id: 'executedProjects', label: 'المشاريع المنفذة', icon: Building2 },
    { 
      id: 'obligations', 
      label: 'الالتزامات والرخص والمواعيد', 
      icon: AlertCircle,
      badge: pendingObligationsCount > 0 ? pendingObligationsCount : null,
      badgeColor: 'bg-red-500'
    },
    { id: 'settings', label: 'الإعدادات والنسخ الاحتياطي', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-[#0f172a] text-slate-200 flex flex-col h-screen sticky top-0 z-30 border-l border-slate-800 shrink-0 no-print">
      {/* Office Branding Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center gap-3 bg-slate-950/40">
        <div className="w-10 h-10 rounded-xl bg-white text-slate-900 flex items-center justify-center font-black text-xs shadow-sm shrink-0 border border-slate-700 p-1">
          <img src={companyLogo} alt="شعار الشركة" className="w-full h-full object-contain" />
        </div>
        <div className="overflow-hidden">
          <h1 className="font-extrabold text-white text-sm truncate tracking-tight" title={state.settings.officeName || 'إماراتك العقارية'}>
            {state.settings.officeName || 'إماراتك العقارية'}
          </h1>
          <p className="text-[10px] text-amber-400 font-bold truncate">{state.settings.address || 'عجمان - الجرف - دوار ماكدونالدز'}</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-colors border-r-4 ${
                isActive
                  ? 'bg-white/10 text-white border-blue-500 font-bold'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white border-transparent'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-[10px] font-bold text-white rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User info & Logout */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};
