import React, { useState } from 'react';
import { 
  Receipt, 
  TrendingUp, 
  FileCheck, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldAlert,
  Building2,
  Filter,
  CheckCircle2,
  XCircle,
  PlusCircle
} from 'lucide-react';
import { AppState } from '../types';
import { EmaratekLogo } from '../components/EmaratekLogo';

interface DashboardPageProps {
  state: AppState;
  setActiveTab: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ state, setActiveTab }) => {
  const today = new Date();
  const currentMonthStr = today.toISOString().substring(0, 7); // YYYY-MM (e.g. 2026-07)

  // Selected Month filter for dashboard (defaulting to current month e.g., 2026-07)
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);

  // Month Format Helper
  const getMonthLabel = (isoMonth: string) => {
    if (!isoMonth) return '';
    const [year, month] = isoMonth.split('-');
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString('ar-AE', { month: 'long', year: 'numeric' });
  };

  // 1. Monthly Expenses for Selected Month
  const selectedExpenses = state.expenses.filter(e => e.date.startsWith(selectedMonth));
  const monthlyExpensesTotal = selectedExpenses.reduce((sum, e) => sum + e.amount, 0);

  // 2. Monthly Revenues for Selected Month
  const selectedRevenues = state.revenues.filter(r => r.date.startsWith(selectedMonth));
  const monthlyRevenuesTotal = selectedRevenues.reduce((sum, r) => sum + r.amount, 0);

  // 3. Due Installments in Selected Month
  const monthlyInstallmentsList: any[] = [];
  let monthlyDueTotal = 0;
  let monthlyCollectedTotal = 0;
  let monthlyUncollectedTotal = 0;

  state.contracts.forEach(c => {
    if (c.installments) {
      c.installments.forEach(inst => {
        if (inst.dueDate && inst.dueDate.startsWith(selectedMonth)) {
          monthlyDueTotal += inst.amount;
          if (inst.status === 'محصل') {
            monthlyCollectedTotal += inst.amount;
          } else {
            monthlyUncollectedTotal += inst.amount;
          }
          monthlyInstallmentsList.push({
            contract: c,
            installment: inst
          });
        }
      });
    }
  });

  // 4. Overdue Payments Across All Active Contracts
  let overdueTotal = 0;
  let overdueCount = 0;
  const overduePaymentsList: any[] = [];

  state.contracts.forEach(c => {
    if (c.status === 'نشط' && c.installments) {
      c.installments.forEach(inst => {
        if (inst.status === 'غير محصل') {
          const dueDate = new Date(inst.dueDate);
          if (dueDate < today) {
            overdueCount++;
            overdueTotal += inst.amount;
            overduePaymentsList.push({
              tenantName: c.tenantName,
              building: c.buildingName,
              unit: c.unitNumber,
              amount: inst.amount,
              dueDate: inst.dueDate,
              instNo: inst.installmentNo
            });
          }
        }
      });
    }
  });

  // 5. Expiring Contracts (<90 days)
  const expiringContractsList: any[] = [];
  state.contracts.forEach(c => {
    if (c.status === 'نشط') {
      const endDate = new Date(c.endDate);
      const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diffDays <= 90) {
        expiringContractsList.push({
          contract: c,
          daysLeft: diffDays
        });
      }
    }
  });

  // 6. Active Contracts count
  const activeContracts = state.contracts.filter(c => c.status === 'نشط');

  // 7. Expiring / Overdue Obligations
  const pendingObligations = state.obligations.filter(ob => ob.status === 'قريب' || ob.status === 'متأخر');

  return (
    <div className="space-y-6">
      {/* Top Header & Branding Banner */}
      <div className="bg-[#0f172a] text-white p-6 rounded-2xl shadow-sm border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-[11px] font-bold">
              لوحة المتابعة والعمل الشهري
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {state.settings.officeName || 'إماراتك العقارية'}
          </h2>
          <p className="text-xs text-slate-400 max-w-xl">
            نظام المتابعة التشغيلية الشهرية لمصروفات وإيرادات وعمولات المكتب ودفعات عقود الإيجار المستحقة.
          </p>
        </div>

        {/* Selected Month Control & Dash Symbol */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 self-start lg:self-auto">
          <div>
            <div className="text-[10px] text-slate-400 font-bold mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-400" />
              <span>الشهر المالي المحدد:</span>
            </div>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => {
                if (e.target.value) setSelectedMonth(e.target.value);
              }}
              className="bg-slate-950 text-amber-400 font-mono font-extrabold text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="px-3 border-r border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold">-</div>
            <div className="text-lg font-bold text-slate-200 font-mono">-</div>
          </div>
        </div>
      </div>

      {/* Month Indicator Banner */}
      <div className="bg-slate-900 text-white p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-amber-400" />
          <span>
            عرض بيانات العمل والنشاط المالي لشهر: <strong className="text-amber-400 text-sm font-bold mx-1">{getMonthLabel(selectedMonth)}</strong>
            {selectedMonth === currentMonthStr && (
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold mr-2">
                الشهر الحالي
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedMonth !== currentMonthStr && (
            <button
              onClick={() => setSelectedMonth(currentMonthStr)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-[11px] transition-colors"
            >
              العودة للشهر الحالي ({getMonthLabel(currentMonthStr)})
            </button>
          )}
        </div>
      </div>

      {/* Main Stats Grid for Selected Month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Expenses */}
        <div 
          onClick={() => setActiveTab('expenses')}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">مصروفات شهر ({getMonthLabel(selectedMonth)})</span>
            <div className="p-2 rounded-lg bg-red-50 text-red-600 group-hover:bg-red-100 transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-slate-900 font-mono">
              {monthlyExpensesTotal.toLocaleString('ar-AE')} <span className="text-xs font-normal text-slate-500">درهم</span>
            </div>
            <div className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>{selectedExpenses.length} عملية مصروفات مسجلة</span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Revenues & Commissions */}
        <div 
          onClick={() => setActiveTab('revenues')}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">إيرادات وعمولات ({getMonthLabel(selectedMonth)})</span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-emerald-700 font-mono">
              {monthlyRevenuesTotal.toLocaleString('ar-AE')} <span className="text-xs font-normal text-slate-500">درهم</span>
            </div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{selectedRevenues.length} عملية إيراد وعمولة</span>
            </div>
          </div>
        </div>

        {/* Card 3: Monthly Due Installments */}
        <div 
          onClick={() => setActiveTab('collection')}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">الدفعات المستحقة لـ ({getMonthLabel(selectedMonth)})</span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-blue-900 font-mono">
              {monthlyDueTotal.toLocaleString('ar-AE')} <span className="text-xs font-normal text-slate-500">درهم</span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium mt-1 flex items-center justify-between">
              <span className="text-emerald-600 font-bold">محصل: {monthlyCollectedTotal.toLocaleString('ar-AE')}</span>
              <span className="text-red-600 font-bold">متبقي: {monthlyUncollectedTotal.toLocaleString('ar-AE')}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Active Contracts */}
        <div 
          onClick={() => setActiveTab('contracts')}
          className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">العقود النشطة والقائمة</span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 transition-colors">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-black text-slate-900 font-mono">
              {activeContracts.length} <span className="text-xs font-normal text-slate-500">عقداً نشطاً</span>
            </div>
            <div className="text-[11px] text-amber-700 font-medium mt-1">
              متابعة الوحدات والإيجارات
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Installments Due Table for Selected Month */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>دفعات الإيجار المستحقة في شهر ({getMonthLabel(selectedMonth)})</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              متابعة حالة التحصيل والأقساط الخاصة بعقود الإيجار لشهر المتابعة المالي
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('collection')}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors"
            >
              جدول كافة التحصيلات ←
            </button>
          </div>
        </div>

        {monthlyInstallmentsList.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
            لا توجد أقساط أو دفعات إيجار مستحقة في شهر {getMonthLabel(selectedMonth)}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="bg-slate-900 text-white font-bold">
                  <th className="p-2.5">المستأجر</th>
                  <th className="p-2.5">العقار والوحدة</th>
                  <th className="p-2.5">رقم الدفعة</th>
                  <th className="p-2.5">تاريخ الاستحقاق</th>
                  <th className="p-2.5">المبلغ (درهم)</th>
                  <th className="p-2.5">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {monthlyInstallmentsList.map(({ contract, installment }, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-2.5 font-bold text-slate-900">{contract.tenantName}</td>
                    <td className="p-2.5 text-slate-600">{contract.buildingName} - {contract.unitNumber}</td>
                    <td className="p-2.5 font-bold">الدفعة رقم {installment.installmentNo}</td>
                    <td className="p-2.5 font-mono text-slate-800">{installment.dueDate}</td>
                    <td className="p-2.5 font-mono font-extrabold text-slate-900 text-sm">
                      {installment.amount.toLocaleString('ar-AE')}
                    </td>
                    <td className="p-2.5">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 w-fit ${
                        installment.status === 'محصل' 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {installment.status === 'محصل' ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                        <span>{installment.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Two Column Layout for Overdue & Expiring Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Overdue Payments */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span>الدفعات المتأخرة المستحقة التحصيل</span>
            </h3>
            <button 
              onClick={() => setActiveTab('collection')} 
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              عرض الكل ({overdueCount}) ←
            </button>
          </div>

          {overduePaymentsList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              لا توجد دفعات متأخرة حالياً.
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2.5">المستأجر</th>
                    <th className="p-2.5">البناية والوحدة</th>
                    <th className="p-2.5">تاريخ الاستحقاق</th>
                    <th className="p-2.5">المبلغ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {overduePaymentsList.slice(0, 5).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-900">{item.tenantName}</td>
                      <td className="p-2.5 text-slate-600">{item.building} - {item.unit}</td>
                      <td className="p-2.5 font-mono text-red-600 font-bold">{item.dueDate}</td>
                      <td className="p-2.5 font-mono font-bold">{item.amount.toLocaleString('ar-AE')} درهم</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Table 2: Expiring Contracts */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-600" />
              <span>عقود قريبة من الانتهاء (خلال 90 يوماً)</span>
            </h3>
            <button 
              onClick={() => setActiveTab('contracts')} 
              className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
            >
              إدارة العقود ({expiringContractsList.length}) ←
            </button>
          </div>

          {expiringContractsList.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              لا توجد عقود تنتهي قريبًا.
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-xs text-right">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-bold border-b border-slate-200">
                    <th className="p-2.5">المستأجر</th>
                    <th className="p-2.5">العقار</th>
                    <th className="p-2.5">تاريخ الانتهاء</th>
                    <th className="p-2.5">المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {expiringContractsList.slice(0, 5).map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/80">
                      <td className="p-2.5 font-bold text-slate-900">{item.contract.tenantName}</td>
                      <td className="p-2.5 text-slate-600">{item.contract.buildingName} ({item.contract.unitNumber})</td>
                      <td className="p-2.5 font-mono text-slate-700">{item.contract.endDate}</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          item.daysLeft <= 30 ? 'bg-[#fee2e2] text-[#991b1b]' : 'bg-[#fef9c3] text-[#854d0e]'
                        }`}>
                          {item.daysLeft <= 0 ? 'منتهي' : `${item.daysLeft} يوم`}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Obligations Widget */}
      {pendingObligations.length > 0 && (
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-center justify-between text-amber-900 text-xs font-bold">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0" />
            <span>تنبيه الالتزامات والرخص: يوجد لديك {pendingObligations.length} التزام قادم أو متأخر يتطلب التجديد أو السداد!</span>
          </div>
          <button
            onClick={() => setActiveTab('obligations')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors font-bold shrink-0 cursor-pointer"
          >
            مراجعة الالتزامات
          </button>
        </div>
      )}
    </div>
  );
};
