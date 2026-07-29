import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Printer, Edit2, Trash2, TrendingUp, UserCheck, Calendar, DollarSign, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Revenue, OfficeSettings } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { RevenuePrintTemplate } from '../components/RevenuePrintTemplate';
import { ActionMenu } from '../components/ActionMenu';
import { formatCreationDateTime, formatCompletionDateTime, formatArabicMonthYear } from '../utils/dateUtils';
import { PrintOrientation } from '../utils/printUtils';

interface RevenuesPageProps {
  revenues: Revenue[];
  settings: OfficeSettings;
  onAddRevenue: (revenue: Omit<Revenue, 'id'>) => void;
  onUpdateRevenue: (revenue: Revenue) => void;
  onDeleteRevenue: (id: string) => void;
  onPrint: (selector: string, orientation?: PrintOrientation) => void;
}

export const RevenuesPage: React.FC<RevenuesPageProps> = ({
  revenues,
  settings,
  onAddRevenue,
  onUpdateRevenue,
  onDeleteRevenue,
  onPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRevenue, setEditingRevenue] = useState<Revenue | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [employeeName, setEmployeeName] = useState(settings.employees[0] || 'أحمد المنصوري');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState<number | ''>('');
  const [type, setType] = useState(settings.revenueTypes[0] || 'عمولة بيع وشراء');
  const [details, setDetails] = useState('');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingRevenue(null);
    setEmployeeName(settings.employees[0] || 'أحمد المنصوري');
    setDate(new Date().toISOString().split('T')[0]);
    setAmount('');
    setType(settings.revenueTypes[0] || 'عمولة بيع وشراء');
    setDetails('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (rev: Revenue) => {
    setEditingRevenue(rev);
    setEmployeeName(rev.employeeName);
    setDate(rev.date);
    setAmount(rev.amount);
    setType(rev.type);
    setDetails(rev.details);
    setNotes(rev.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !details.trim()) {
      alert('يرجى إدخال المبلغ والتفاصيل بوضوح');
      return;
    }

    if (editingRevenue) {
      onUpdateRevenue({
        ...editingRevenue,
        employeeName,
        date,
        amount: Number(amount),
        type,
        details: details.trim(),
        notes: notes.trim()
      });
    } else {
      onAddRevenue({
        employeeName,
        date,
        amount: Number(amount),
        type,
        details: details.trim(),
        notes: notes.trim()
      });
    }
    setIsModalOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedEmployee('ALL');
    setSelectedType('ALL');
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      selectedEmployee !== 'ALL' ||
      selectedType !== 'ALL' ||
      selectedMonth ||
      startDate ||
      endDate ||
      minAmount !== '' ||
      maxAmount !== ''
    );
  }, [searchTerm, selectedEmployee, selectedType, selectedMonth, startDate, endDate, minAmount, maxAmount]);

  // Filtered revenues
  const filteredRevenues = useMemo(() => {
    return revenues.filter(r => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        r.details.toLowerCase().includes(query) ||
        r.employeeName.toLowerCase().includes(query) ||
        r.type.toLowerCase().includes(query) ||
        (r.notes && r.notes.toLowerCase().includes(query));

      const matchesEmp = selectedEmployee === 'ALL' || r.employeeName === selectedEmployee;
      const matchesType = selectedType === 'ALL' || r.type === selectedType;
      const matchesMonth = !selectedMonth || r.date.startsWith(selectedMonth);

      const matchesStartDate = !startDate || r.date >= startDate;
      const matchesEndDate = !endDate || r.date <= endDate;

      const matchesMinAmount = minAmount === '' || r.amount >= Number(minAmount);
      const matchesMaxAmount = maxAmount === '' || r.amount <= Number(maxAmount);

      return matchesSearch && matchesEmp && matchesType && matchesMonth && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });
  }, [revenues, searchTerm, selectedEmployee, selectedType, selectedMonth, startDate, endDate, minAmount, maxAmount]);

  const totalFiltered = useMemo(() => filteredRevenues.reduce((sum, r) => sum + r.amount, 0), [filteredRevenues]);

  // Employee Performance breakdown
  const employeePerformance = useMemo(() => {
    const map: Record<string, number> = {};
    const targetRevenues = selectedMonth 
      ? revenues.filter(r => r.date.startsWith(selectedMonth))
      : revenues;

    targetRevenues.forEach(r => {
      map[r.employeeName] = (map[r.employeeName] || 0) + r.amount;
    });

    return Object.entries(map).map(([emp, total]) => ({ emp, total })).sort((a, b) => b.total - a.total);
  }, [revenues, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Top Bar / Statistics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* Statistics Cards */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">إجمالي التصفية الحالية</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">{totalFiltered.toLocaleString('ar-AE')} درهم</div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPrint('.revenue-print-wrapper', 'landscape')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الكشف</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة إيراد / عمولة</span>
          </button>
        </div>
      </div>

      {/* Employee Performance Cards summary */}
      <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm no-print">
        <div className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
          <UserCheck className="w-4 h-4" />
          <span>ملخص تحصيل وتأدية الموظفين ({selectedMonth ? `شهر ${selectedMonth}` : 'الإجمالي'}):</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {employeePerformance.map((item, idx) => (
            <div key={idx} className="bg-slate-800/80 p-2.5 rounded-lg border border-slate-700 text-right">
              <div className="text-xs font-bold text-slate-200 truncate">{item.emp}</div>
              <div className="text-sm font-mono font-extrabold text-emerald-400 mt-1">
                {item.total.toLocaleString('ar-AE')} <span className="text-[10px] font-normal text-slate-400">درهم</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search & Filters Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        {/* Main Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالكلمة المفتاحية (التفاصيل، الموظف، نوع الإيراد، الملاحظات)..."
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

          {/* Employee Filter */}
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

          {/* Revenue Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع أنواع الإيرادات</option>
            {settings.revenueTypes.map((t, idx) => (
              <option key={idx} value={t}>{t}</option>
            ))}
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
            {/* Date From */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">من تاريخ:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">إلى تاريخ:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أقل قيمة (درهم):</label>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى قيمة (درهم):</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="غير محدد"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Month Select */}
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">تحديد الشهر المحدد:</label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Results Bar */}
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
          <span>تم العثور على <strong className="text-slate-900 font-bold">{filteredRevenues.length}</strong> سجل إيراد/عمولة</span>
          <span>إجمالي القيمة: <strong className="text-emerald-600 font-bold font-mono">{totalFiltered.toLocaleString('ar-AE')} درهم</strong></span>
        </div>
      </div>

      {/* Revenues Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">اسم الموظف</th>
                <th className="p-3">المبلغ (درهم)</th>
                <th className="p-3">نوع الإيراد</th>
                <th className="p-3">تفاصيل البيان</th>
                <th className="p-3">تاريخ استلام الإيراد</th>
                <th className="p-3">الملاحظات</th>
                <th className="p-3 no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredRevenues.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد إيرادات مسجلة مطابقة للفلاتر.
                  </td>
                </tr>
              ) : (
                filteredRevenues.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{item.date}</td>
                    <td className="p-3 font-bold text-slate-900 whitespace-nowrap">{item.employeeName}</td>
                    <td className="p-3 font-mono font-extrabold text-emerald-600 text-sm whitespace-nowrap">
                      {item.amount.toLocaleString('ar-AE')}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-bold">
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs font-bold text-slate-800">{item.details}</td>
                    <td className="p-3 font-mono text-emerald-700 font-bold whitespace-nowrap">
                      {formatCompletionDateTime(item.completedAt, item.date)}
                    </td>
                    <td className="p-3 text-slate-500 max-w-xs truncate">{item.notes || '-'}</td>
                    <td className="p-3 no-print whitespace-nowrap">
                      <ActionMenu
                        items={[
                          {
                            label: 'تعديل الإيراد',
                            icon: <Edit2 className="w-4 h-4 text-blue-600" />,
                            onClick: () => openEditModal(item),
                            variant: 'info'
                          },
                          {
                            label: 'حذف الإيراد',
                            icon: <Trash2 className="w-4 h-4 text-red-600" />,
                            onClick: () => setDeleteId(item.id),
                            variant: 'danger'
                          }
                        ]}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredRevenues.length > 0 && (
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={2} className="p-3 text-slate-900">إجمالي الإيرادات:</td>
                  <td className="p-3 font-mono text-emerald-700 text-sm">{totalFiltered.toLocaleString('ar-AE')} درهم</td>
                  <td colSpan={5} className="p-3 text-slate-500 text-[11px]">عدد العمليات: {filteredRevenues.length} عملية</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRevenue ? 'تعديل سجل الإيراد' : 'تسجيل إيراد / عمولة جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم الموظف *</label>
              <select
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {settings.employees.map((emp, idx) => (
                  <option key={idx} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الإيراد *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المحصل (درهم) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
                min="1"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الإيراد *</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {settings.revenueTypes.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">البيان / التفاصيل *</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="مثال: عمولة تأجير شقة رقم 302..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات (اختياري)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="أي تفاصيل أخرى..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md"
            >
              {editingRevenue ? 'تعديل وحفظ' : 'حفظ الإيراد'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteRevenue(deleteId);
        }}
        title="حذف الإيراد"
        message="هل أنت أكتأد من حذف هذا الإيراد؟"
      />

      {/* Dedicated Professional Print Statement for Revenues & Commissions */}
      <RevenuePrintTemplate
        filteredRevenues={filteredRevenues}
        settings={settings}
        selectedEmployee={selectedEmployee}
        selectedType={selectedType}
        selectedMonth={selectedMonth}
        startDate={startDate}
        endDate={endDate}
        totalFiltered={totalFiltered}
        employeePerformance={employeePerformance}
      />
    </div>
  );
};
