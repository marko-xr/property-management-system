import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Printer, Edit2, Trash2, Users, CreditCard, DollarSign, CheckCircle2, AlertCircle, Eye, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { EmployeeDebt, EmployeeDebtRepayment, OfficeSettings, PaymentMethod } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmployeeDebtPrintTemplate } from '../components/EmployeeDebtPrintTemplate';
import { ActionMenu, ActionMenuItem } from '../components/ActionMenu';
import { formatCreationDateTime, formatCompletionDateTime } from '../utils/dateUtils';

interface EmployeeDebtsPageProps {
  employeeDebts: EmployeeDebt[];
  settings: OfficeSettings;
  onAddDebt: (debt: Omit<EmployeeDebt, 'id' | 'repayments'>) => void;
  onUpdateDebt: (debt: EmployeeDebt) => void;
  onDeleteDebt: (id: string) => void;
  onAddRepayment: (debtId: string, repayment: Omit<EmployeeDebtRepayment, 'id' | 'debtId'>) => void;
  onPrint: () => void;
}

export const EmployeeDebtsPage: React.FC<EmployeeDebtsPageProps> = ({
  employeeDebts,
  settings,
  onAddDebt,
  onUpdateDebt,
  onDeleteDebt,
  onAddRepayment,
  onPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<EmployeeDebt | null>(null);
  const [viewingDebt, setViewingDebt] = useState<EmployeeDebt | null>(null);
  const [repayingDebt, setRepayingDebt] = useState<EmployeeDebt | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form Debt fields
  const [employeeName, setEmployeeName] = useState(settings.employees[0] || 'محمد العتيبي');
  const [phone, setPhone] = useState('');
  const [totalAmount, setTotalAmount] = useState<number | ''>('');
  const [reason, setReason] = useState('بطاقة وسيط عقاري معتمد');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Repayment form fields
  const [repaymentAmount, setRepaymentAmount] = useState<number | ''>('');
  const [repaymentDate, setRepaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [repaymentMethod, setRepaymentMethod] = useState<PaymentMethod>('خصم من الراتب');
  const [repaymentNotes, setRepaymentNotes] = useState('');

  const openAddDebtModal = () => {
    setEditingDebt(null);
    setEmployeeName(settings.employees[0] || 'محمد العتيبي');
    setPhone('+971 50 000 0000');
    setTotalAmount('');
    setReason('بطاقة وسيط عقاري معتمد');
    setDate(new Date().toISOString().split('T')[0]);
    setNotes('');
    setIsDebtModalOpen(true);
  };

  const openEditDebtModal = (debt: EmployeeDebt) => {
    setEditingDebt(debt);
    setEmployeeName(debt.employeeName);
    setPhone(debt.phone);
    setTotalAmount(debt.totalAmount);
    setReason(debt.reason);
    setDate(debt.date);
    setNotes(debt.notes || '');
    setIsDebtModalOpen(true);
  };

  const handleDebtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!totalAmount || totalAmount <= 0) {
      alert('يرجى تحديد مبلغ المديونية');
      return;
    }

    if (editingDebt) {
      onUpdateDebt({
        ...editingDebt,
        employeeName,
        phone,
        totalAmount: Number(totalAmount),
        reason,
        date,
        notes: notes.trim()
      });
    } else {
      onAddDebt({
        employeeName,
        phone,
        totalAmount: Number(totalAmount),
        reason,
        date,
        notes: notes.trim()
      });
    }
    setIsDebtModalOpen(false);
  };

  const handleRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayingDebt || !repaymentAmount || repaymentAmount <= 0) {
      alert('يرجى كتابة مبلغ السداد الصحيح');
      return;
    }

    onAddRepayment(repayingDebt.id, {
      amount: Number(repaymentAmount),
      date: repaymentDate,
      paymentMethod: repaymentMethod,
      notes: repaymentNotes.trim()
    });

    setRepayingDebt(null);
    setRepaymentAmount('');
    setRepaymentNotes('');
  };

  // Process list with calculated totals and status
  const processedDebts = useMemo(() => {
    return employeeDebts.map(debt => {
      const totalPaid = debt.repayments ? debt.repayments.reduce((sum, r) => sum + r.amount, 0) : 0;
      const remaining = debt.totalAmount - totalPaid;
      
      let status: 'مديونية قائمة' | 'سداد جزئي' | 'مسددة بالكامل' = 'مديونية قائمة';
      if (remaining <= 0) {
        status = 'مسددة بالكامل';
      } else if (totalPaid > 0) {
        status = 'سداد جزئي';
      }

      return {
        ...debt,
        totalPaid,
        remaining: Math.max(0, remaining),
        status
      };
    });
  }, [employeeDebts]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedEmployee('ALL');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      selectedStatus !== 'ALL' ||
      selectedEmployee !== 'ALL' ||
      startDate ||
      endDate ||
      minAmount !== '' ||
      maxAmount !== ''
    );
  }, [searchTerm, selectedStatus, selectedEmployee, startDate, endDate, minAmount, maxAmount]);

  // Filtered
  const filteredDebts = useMemo(() => {
    return processedDebts.filter(item => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        item.employeeName.toLowerCase().includes(query) ||
        item.phone.includes(query) ||
        item.reason.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query));

      const matchesStatus = selectedStatus === 'ALL' || item.status === selectedStatus;
      const matchesEmployee = selectedEmployee === 'ALL' || item.employeeName === selectedEmployee;

      const matchesStartDate = !startDate || item.date >= startDate;
      const matchesEndDate = !endDate || item.date <= endDate;

      const matchesMinAmount = minAmount === '' || item.totalAmount >= Number(minAmount);
      const matchesMaxAmount = maxAmount === '' || item.totalAmount <= Number(maxAmount);

      return matchesSearch && matchesStatus && matchesEmployee && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });
  }, [processedDebts, searchTerm, selectedStatus, selectedEmployee, startDate, endDate, minAmount, maxAmount]);

  // Totals
  const totalDebtsSum = useMemo(() => filteredDebts.reduce((s, i) => s + i.totalAmount, 0), [filteredDebts]);
  const totalPaidSum = useMemo(() => filteredDebts.reduce((s, i) => s + i.totalPaid, 0), [filteredDebts]);
  const totalRemainingSum = useMemo(() => filteredDebts.reduce((s, i) => s + i.remaining, 0), [filteredDebts]);

  return (
    <div className="space-y-6">
      {/* Top Bar / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* Stat Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold">إجمالي المديونيات المعروضة</div>
            <div className="text-sm font-extrabold text-slate-900 font-mono">{totalDebtsSum.toLocaleString('ar-AE')} درهم</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold">المبالغ المسددة</div>
            <div className="text-sm font-extrabold text-emerald-600 font-mono">{totalPaidSum.toLocaleString('ar-AE')} درهم</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[10px] text-slate-500 font-bold">المتبقي المطلوب</div>
            <div className="text-sm font-extrabold text-red-600 font-mono">{totalRemainingSum.toLocaleString('ar-AE')} درهم</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPrint}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف المديونيات</span>
          </button>

          <button
            onClick={openAddDebtModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تسجيل مديونية / سلفة موظف</span>
          </button>
        </div>
      </div>

      {/* Search & Filters Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        {/* Main Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم الموظف، رقم الهاتف، سبب المديونية، الملاحظات..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع الموظفين</option>
            {settings.employees.map((emp, idx) => (
              <option key={idx} value={emp}>{emp}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="مديونية قائمة">مديونية قائمة</option>
            <option value="سداد جزئي">سداد جزئي</option>
            <option value="مسددة بالكامل">مسددة بالكامل</option>
          </select>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فلاتر متقدمة</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
            )}
          </button>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold border border-red-200"
              title="مسح جميع الفلاتر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-lg text-xs">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">من تاريخ المديونية:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">إلى تاريخ المديونية:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أقل مبلغ مديونية (درهم):</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Max Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى مبلغ مديونية (درهم):</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="غير محدد"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Results Bar */}
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
          <span>تم العثور على <strong className="text-slate-900 font-bold">{filteredDebts.length}</strong> سجل مديونية</span>
          <span>المتبقي المطلوب للفلتر الحالي: <strong className="text-red-600 font-bold font-mono">{totalRemainingSum.toLocaleString('ar-AE')} درهم</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3">اسم الموظف</th>
                <th className="p-3">التاريخ والسبب</th>
                <th className="p-3">إجمالي المديونية</th>
                <th className="p-3">المسدد</th>
                <th className="p-3">المتبقي</th>
                <th className="p-3">الحالة وتاريخ السداد</th>
                <th className="p-3 no-print">إجراءات السداد والتعديل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredDebts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    لا توجد سجلات مديونيات سلفة مطابقة.
                  </td>
                </tr>
              ) : (
                filteredDebts.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{item.employeeName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.phone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{item.reason}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{item.date}</div>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {item.totalAmount.toLocaleString('ar-AE')} درهم
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600 whitespace-nowrap">
                      {item.totalPaid.toLocaleString('ar-AE')} درهم
                    </td>
                    <td className="p-3 font-mono font-extrabold text-red-600 whitespace-nowrap">
                      {item.remaining.toLocaleString('ar-AE')} درهم
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-block ${
                          item.status === 'مسددة بالكامل'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.status === 'سداد جزئي'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}>
                          {item.status}
                        </span>
                        {item.completedAt && (
                          <div className="text-[10px] font-mono text-emerald-700 font-bold">
                            {formatCompletionDateTime(item.completedAt, item.date)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 no-print whitespace-nowrap">
                      {(() => {
                        const debtActions: ActionMenuItem[] = [];

                        if (item.remaining > 0) {
                          debtActions.push({
                            label: 'تسجيل سداد جديد',
                            icon: <DollarSign className="w-4 h-4 text-emerald-600" />,
                            onClick: () => {
                              setRepayingDebt(item);
                              setRepaymentAmount(item.remaining);
                            },
                            variant: 'success'
                          });
                        }

                        debtActions.push(
                          {
                            label: 'عرض كشف السدادات',
                            icon: <Eye className="w-4 h-4 text-slate-700" />,
                            onClick: () => setViewingDebt(item)
                          },
                          {
                            label: 'تعديل السلفة',
                            icon: <Edit2 className="w-4 h-4 text-blue-600" />,
                            onClick: () => openEditDebtModal(item),
                            variant: 'info'
                          },
                          {
                            label: 'حذف السلفة',
                            icon: <Trash2 className="w-4 h-4 text-red-600" />,
                            onClick: () => setDeleteId(item.id),
                            variant: 'danger'
                          }
                        );

                        return <ActionMenu items={debtActions} />;
                      })()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Viewing Debt & Repayments Modal */}
      {viewingDebt && (
        <Modal
          isOpen={!!viewingDebt}
          onClose={() => setViewingDebt(null)}
          title={`تفاصيل وسجل سدادات مديونية: ${viewingDebt.employeeName}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">إجمالي المديونية:</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{viewingDebt.totalAmount.toLocaleString('ar-AE')} درهم</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">إجمالي السداد:</span>
                <span className="font-bold text-emerald-600 font-mono text-sm">
                  {(viewingDebt.repayments ? viewingDebt.repayments.reduce((s, r) => s + r.amount, 0) : 0).toLocaleString('ar-AE')} درهم
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">المتبقي المطلوب:</span>
                <span className="font-bold text-red-600 font-mono text-sm">
                  {Math.max(0, viewingDebt.totalAmount - (viewingDebt.repayments ? viewingDebt.repayments.reduce((s, r) => s + r.amount, 0) : 0)).toLocaleString('ar-AE')} درهم
                </span>
              </div>
            </div>

            <h4 className="font-bold text-slate-900 text-xs">سجل عمليات السداد المدخلة:</h4>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 font-bold text-slate-800">
                  <tr>
                    <th className="p-2">التاريخ</th>
                    <th className="p-2">المبلغ (درهم)</th>
                    <th className="p-2">طريقة السداد</th>
                    <th className="p-2">ملاحظات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(!viewingDebt.repayments || viewingDebt.repayments.length === 0) ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">لا توجد عمليات سداد مسجلة حتى الآن</td>
                    </tr>
                  ) : (
                    viewingDebt.repayments.map((rep) => (
                      <tr key={rep.id}>
                        <td className="p-2 font-mono">{rep.date}</td>
                        <td className="p-2 font-mono font-bold text-emerald-600">{rep.amount.toLocaleString('ar-AE')}</td>
                        <td className="p-2 font-bold">{rep.paymentMethod}</td>
                        <td className="p-2 text-slate-600">{rep.notes || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between no-print pt-2">
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة كشف الحساب</span>
              </button>
              <button
                onClick={() => setViewingDebt(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Record Repayment Modal */}
      {repayingDebt && (
        <Modal
          isOpen={!!repayingDebt}
          onClose={() => setRepayingDebt(null)}
          title={`تسجيل دفعة سداد لـ: ${repayingDebt.employeeName}`}
          maxWidth="max-w-md"
        >
          <form onSubmit={handleRepaymentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ السداد (درهم) *</label>
              <input
                type="number"
                value={repaymentAmount}
                onChange={(e) => setRepaymentAmount(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:outline-none"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ السداد *</label>
              <input
                type="date"
                value={repaymentDate}
                onChange={(e) => setRepaymentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد *</label>
              <select
                value={repaymentMethod}
                onChange={(e) => setRepaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="خصم من الراتب">خصم من الراتب</option>
                <option value="نقد">تسليم نقدي في الخزينة</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="شيك">شيك</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات السداد</label>
              <input
                type="text"
                value={repaymentNotes}
                onChange={(e) => setRepaymentNotes(e.target.value)}
                placeholder="ملاحظات..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setRepayingDebt(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md"
              >
                تأكيد وحفظ السداد
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add / Edit Debt Modal */}
      <Modal
        isOpen={isDebtModalOpen}
        onClose={() => setIsDebtModalOpen(false)}
        title={editingDebt ? 'تعديل سجل المديونية' : 'تسجيل مديونية / سلفة موظف جديدة'}
      >
        <form onSubmit={handleDebtSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف *</label>
              <select
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                {settings.employees.map((emp, idx) => (
                  <option key={idx} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف *</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+971 50 000 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ المديونية (درهم) *</label>
              <input
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">سبب المديونية *</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="بطاقة وسيط، سلفة طارئة، رسوم..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ المديونية *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">الملاحظات (اختياري)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="تفاصيل الترتيب والاتفاق..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsDebtModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md"
            >
              {editingDebt ? 'تعديل وحفظ' : 'حفظ المديونية'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteDebt(deleteId);
        }}
        title="حذف مديونية موظف"
        message="هل أنت أكتأد من حذف هذه المديونية والسدادات الخاصة بها؟"
      />

      {/* Dedicated Print Statement for Employee Debts */}
      <EmployeeDebtPrintTemplate
        filteredDebts={filteredDebts}
        settings={settings}
        selectedEmployee={selectedEmployee}
        selectedStatus={selectedStatus}
        totalDebtsAmount={totalDebtsSum}
        totalRepaidAmount={totalPaidSum}
        totalRemainingBalance={totalRemainingSum}
      />
    </div>
  );
};
