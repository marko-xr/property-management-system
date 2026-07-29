import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Printer, Edit2, Trash2, Receipt, Calendar, DollarSign, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Expense, OfficeSettings, PaymentMethod } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ExpensePrintTemplate } from '../components/ExpensePrintTemplate';
import { ActionMenu } from '../components/ActionMenu';
import { formatCreationDateTime, formatCompletionDateTime, formatArabicMonthYear } from '../utils/dateUtils';
import { PrintOrientation } from '../utils/printUtils';

interface ExpensesPageProps {
  expenses: Expense[];
  settings: OfficeSettings;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onPrint: (selector: string, orientation?: PrintOrientation) => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  expenses,
  settings,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [selectedResponsible, setSelectedResponsible] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [amount, setAmount] = useState<number | ''>('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(settings.expenseCategories[0] || 'إيجار المكتب');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('تحويل بنكي');
  const [responsible, setResponsible] = useState(settings.employees[0] || 'المدير العام');
  const [notes, setNotes] = useState('');
  const [reference, setReference] = useState('');

  const openAddModal = () => {
    setEditingExpense(null);
    setAmount('');
    setDetails('');
    setDate(new Date().toISOString().split('T')[0]);
    setCategory(settings.expenseCategories[0] || 'إيجار المكتب');
    setPaymentMethod('تحويل بنكي');
    setResponsible(settings.employees[0] || 'المدير العام');
    setNotes('');
    setReference('');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setAmount(exp.amount);
    setDetails(exp.details);
    setDate(exp.date);
    setCategory(exp.category);
    setPaymentMethod(exp.paymentMethod);
    setResponsible(exp.responsible);
    setNotes(exp.notes || '');
    setReference(exp.reference || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0 || !details.trim()) {
      alert('يرجى تعبئة المبلغ والتفاصيل بشكل صحيح');
      return;
    }

    if (editingExpense) {
      onUpdateExpense({
        ...editingExpense,
        amount: Number(amount),
        details: details.trim(),
        date,
        category,
        paymentMethod,
        responsible,
        notes: notes.trim(),
        reference: reference.trim()
      });
    } else {
      onAddExpense({
        amount: Number(amount),
        details: details.trim(),
        date,
        category,
        paymentMethod,
        responsible,
        notes: notes.trim(),
        reference: reference.trim()
      });
    }
    setIsModalOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('ALL');
    setSelectedPaymentMethod('ALL');
    setSelectedResponsible('ALL');
    setSelectedMonth('');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      selectedCategory !== 'ALL' ||
      selectedPaymentMethod !== 'ALL' ||
      selectedResponsible !== 'ALL' ||
      selectedMonth ||
      startDate ||
      endDate ||
      minAmount !== '' ||
      maxAmount !== ''
    );
  }, [searchTerm, selectedCategory, selectedPaymentMethod, selectedResponsible, selectedMonth, startDate, endDate, minAmount, maxAmount]);

  // Filter logic
  const filteredExpenses = useMemo(() => {
    return expenses.filter(e => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query || 
        e.details.toLowerCase().includes(query) ||
        e.responsible.toLowerCase().includes(query) ||
        e.category.toLowerCase().includes(query) ||
        (e.reference && e.reference.toLowerCase().includes(query)) ||
        (e.notes && e.notes.toLowerCase().includes(query));

      const matchesCategory = selectedCategory === 'ALL' || e.category === selectedCategory;
      const matchesPaymentMethod = selectedPaymentMethod === 'ALL' || e.paymentMethod === selectedPaymentMethod;
      const matchesResponsible = selectedResponsible === 'ALL' || e.responsible === selectedResponsible;
      const matchesMonth = !selectedMonth || e.date.startsWith(selectedMonth);

      const matchesStartDate = !startDate || e.date >= startDate;
      const matchesEndDate = !endDate || e.date <= endDate;

      const matchesMinAmount = minAmount === '' || e.amount >= Number(minAmount);
      const matchesMaxAmount = maxAmount === '' || e.amount <= Number(maxAmount);

      return matchesSearch && matchesCategory && matchesPaymentMethod && matchesResponsible && matchesMonth && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });
  }, [expenses, searchTerm, selectedCategory, selectedPaymentMethod, selectedResponsible, selectedMonth, startDate, endDate, minAmount, maxAmount]);

  // Totals calculations
  const totalFiltered = useMemo(() => filteredExpenses.reduce((sum, e) => sum + e.amount, 0), [filteredExpenses]);

  const currentYearStr = new Date().getFullYear().toString();
  const yearlyTotal = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(currentYearStr)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentYearStr]);

  const currentMonthStr = new Date().toISOString().substring(0, 7);
  const monthlyTotal = useMemo(() => {
    return expenses.filter(e => e.date.startsWith(currentMonthStr)).reduce((sum, e) => sum + e.amount, 0);
  }, [expenses, currentMonthStr]);

  const handlePrintExpenses = async () => {
    const logoImages = Array.from(
      document.querySelectorAll<HTMLImageElement>('.expense-print-report .print-letterhead-logo img')
    );

    await Promise.all(logoImages.map(image => {
      if (image.complete) return Promise.resolve();

      return new Promise<void>(resolve => {
        image.addEventListener('load', () => resolve(), { once: true });
        image.addEventListener('error', () => resolve(), { once: true });
      });
    }));

    if (document.fonts?.ready) {
      await document.fonts.ready;
    }

    onPrint('.expense-print-report', 'landscape');
  };

  return (
    <div className="space-y-6">
      {/* Top Summaries & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        {/* Statistics Pills */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">مصروفات الشهر الجاري</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">{monthlyTotal.toLocaleString('ar-AE')} درهم</div>
            </div>
          </div>

          <div className="bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 font-bold">إجمالي السنة ({currentYearStr})</div>
              <div className="text-sm font-extrabold text-slate-900 font-mono">{yearlyTotal.toLocaleString('ar-AE')} درهم</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintExpenses}
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
            <span>إضافة مصروف جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالكلمة المفتاحية (التفاصيل، اسم المسؤول، المرجع، الفئة)..."
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

          {/* Quick Category Select */}
          <div className="flex items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">جميع فئات المصروفات</option>
              {settings.expenseCategories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أقل مبلغ (درهم):</label>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى مبلغ (درهم):</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="غير محدد"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">طريقة الدفع:</label>
              <select
                value={selectedPaymentMethod}
                onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">جميع الطرق</option>
                <option value="نقد">نقد</option>
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="شيك">شيك</option>
                <option value="بطاقة">بطاقة</option>
                <option value="خصم من الراتب">خصم من الراتب</option>
              </select>
            </div>

            {/* Responsible Employee */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">الشخص المسؤول:</label>
              <select
                value={selectedResponsible}
                onChange={(e) => setSelectedResponsible(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">جميع المسؤولين</option>
                {settings.employees.map((emp, idx) => (
                  <option key={idx} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            {/* Filter Month */}
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

        {/* Results Info Bar */}
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
          <span>تم العثور على <strong className="text-slate-900 font-bold">{filteredExpenses.length}</strong> مصروف بناءً على الفلاتر المحددة</span>
          <span>إجمالي القيمة: <strong className="text-blue-600 font-bold font-mono">{totalFiltered.toLocaleString('ar-AE')} درهم</strong></span>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3">التاريخ</th>
                <th className="p-3">المبلغ (درهم)</th>
                <th className="p-3">الفئة</th>
                <th className="p-3">تفاصيل المصروف</th>
                <th className="p-3">طريقة وسداد الدفع</th>
                <th className="p-3">المسؤول</th>
                <th className="p-3">المرجع/المرفق</th>
                <th className="p-3 no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    لا توجد مصروفات مسجلة تطابق التصفية الحالية.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono text-slate-600 whitespace-nowrap">{item.date}</td>
                    <td className="p-3 font-mono font-extrabold text-red-600 text-sm whitespace-nowrap">
                      {item.amount.toLocaleString('ar-AE')}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold">
                        {item.category}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs">
                      <div className="font-bold text-slate-900">{item.details}</div>
                      {item.notes && <div className="text-[10px] text-slate-500 truncate">{item.notes}</div>}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="font-bold text-slate-900">{item.paymentMethod}</div>
                      <div className="text-[10px] text-emerald-700 font-mono font-bold">
                        تاريخ الدفع: {formatCompletionDateTime(item.completedAt, item.date)}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{item.responsible}</td>
                    <td className="p-3 font-mono text-slate-500 whitespace-nowrap">{item.reference || '-'}</td>
                    <td className="p-3 no-print whitespace-nowrap">
                      <ActionMenu
                        items={[
                          {
                            label: 'تعديل المصروف',
                            icon: <Edit2 className="w-4 h-4 text-blue-600" />,
                            onClick: () => openEditModal(item),
                            variant: 'info'
                          },
                          {
                            label: 'حذف المصروف',
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
            {/* Table Footer Total */}
            {filteredExpenses.length > 0 && (
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={1} className="p-3 text-slate-900">المجموع النهائي:</td>
                  <td className="p-3 font-mono text-red-700 text-sm">{totalFiltered.toLocaleString('ar-AE')} درهم</td>
                  <td colSpan={6} className="p-3 text-slate-500 text-[11px]">عدد السجلات: {filteredExpenses.length} مصروف</td>
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
        title={editingExpense ? 'تعديل المصروف' : 'إضافة مصروف جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ (درهم) *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">التاريخ *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">فئة المصروف *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {settings.expenseCategories.map((cat, idx) => (
                  <option key={idx} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="تحويل بنكي">تحويل بنكي</option>
                <option value="نقد">نقد</option>
                <option value="شيك">شيك</option>
                <option value="بطاقة">بطاقة</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الشخص / الموظف المسؤول *</label>
              <select
                value={responsible}
                onChange={(e) => setResponsible(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {settings.employees.map((emp, idx) => (
                  <option key={idx} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مرجع / رقم الفاتورة (اختياري)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="مثال: INV-9041"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل المصروف *</label>
            <input
              type="text"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="وصف واضح لسبب صرف المبلغ..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات إضافية (اختياري)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="أي ملاحظات أو توضيحات أخرى..."
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
              {editingExpense ? 'تعديل وحفظ' : 'حفظ المصروف'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteExpense(deleteId);
        }}
        title="حذف المصروف"
        message="هل أنت أكتأد من رغبتك في حذف هذا المصروف؟ لا يمكن التراجع بعد الحذف."
      />

      {/* Dedicated Professional Print Statement for Expenses */}
      <ExpensePrintTemplate
        filteredExpenses={filteredExpenses}
        settings={settings}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        selectedPaymentMethod={selectedPaymentMethod}
        selectedResponsible={selectedResponsible}
        selectedMonth={selectedMonth}
        startDate={startDate}
        endDate={endDate}
        minAmount={minAmount}
        maxAmount={maxAmount}
        totalFiltered={totalFiltered}
      />
    </div>
  );
};
