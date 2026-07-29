import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Printer, Edit2, Trash2, AlertCircle, ShieldAlert, CheckCircle2, Clock, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Obligation, OfficeSettings } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ObligationPrintTemplate } from '../components/ObligationPrintTemplate';
import { ActionMenu } from '../components/ActionMenu';
import { formatCreationDateTime, formatCompletionDateTime } from '../utils/dateUtils';

interface ObligationsPageProps {
  obligations: Obligation[];
  settings: OfficeSettings;
  onAddObligation: (obligation: Omit<Obligation, 'id'>) => void;
  onUpdateObligation: (obligation: Obligation) => void;
  onDeleteObligation: (id: string) => void;
  onPrint: (selector: string) => void;
}

export const ObligationsPage: React.FC<ObligationsPageProps> = ({
  obligations,
  settings,
  onAddObligation,
  onUpdateObligation,
  onDeleteObligation,
  onPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedResponsible, setSelectedResponsible] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingObligation, setEditingObligation] = useState<Obligation | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form State
  const [type, setType] = useState('الرخصة التجارية');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [amount, setAmount] = useState<number | ''>(5000);
  const [responsiblePerson, setResponsiblePerson] = useState(settings.employees[0] || 'المدير العام');
  const [status, setStatus] = useState<'نشط' | 'قريب' | 'متأخر' | 'مكتمل'>('نشط');
  const [notes, setNotes] = useState('');

  const openAddModal = () => {
    setEditingObligation(null);
    setType('الرخصة التجارية');
    setIssueDate(new Date().toISOString().split('T')[0]);
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    setExpiryDate(d.toISOString().split('T')[0]);
    setAmount(5000);
    setResponsiblePerson(settings.employees[0] || 'المدير العام');
    setStatus('نشط');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (ob: Obligation) => {
    setEditingObligation(ob);
    setType(ob.type);
    setIssueDate(ob.issueDate);
    setExpiryDate(ob.expiryDate);
    setAmount(ob.amount);
    setResponsiblePerson(ob.responsiblePerson);
    setStatus(ob.status);
    setNotes(ob.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!type.trim() || !amount || amount <= 0) {
      alert('يرجى التأكد من اختيار نوع الالتزام والمبلغ بشكل صحيح');
      return;
    }

    if (editingObligation) {
      onUpdateObligation({
        ...editingObligation,
        type: type.trim(),
        issueDate,
        expiryDate,
        amount: Number(amount),
        responsiblePerson,
        status,
        notes: notes.trim()
      });
    } else {
      onAddObligation({
        type: type.trim(),
        issueDate,
        expiryDate,
        amount: Number(amount),
        responsiblePerson,
        status,
        notes: notes.trim()
      });
    }
    setIsModalOpen(false);
  };

  // Helper days left calculation
  const today = new Date();
  const processedObligations = useMemo(() => {
    return obligations.map(ob => {
      const expD = new Date(ob.expiryDate);
      const daysLeft = Math.ceil((expD.getTime() - today.getTime()) / (1000 * 3600 * 24));
      
      let computedStatus = ob.status;
      if (ob.status !== 'مكتمل') {
        if (daysLeft < 0) {
          computedStatus = 'متأخر';
        } else if (daysLeft <= 45) {
          computedStatus = 'قريب';
        } else {
          computedStatus = 'نشط';
        }
      }

      return {
        ...ob,
        daysLeft,
        computedStatus
      };
    });
  }, [obligations, today]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('ALL');
    setSelectedYear('');
    setSelectedResponsible('ALL');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      selectedStatus !== 'ALL' ||
      selectedYear ||
      selectedResponsible !== 'ALL' ||
      startDate ||
      endDate ||
      minAmount !== '' ||
      maxAmount !== ''
    );
  }, [
    searchTerm,
    selectedStatus,
    selectedYear,
    selectedResponsible,
    startDate,
    endDate,
    minAmount,
    maxAmount
  ]);

  // Filtered
  const filteredObligations = useMemo(() => {
    return processedObligations.filter(item => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        item.type.toLowerCase().includes(query) ||
        item.responsiblePerson.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query));

      const matchesStatus = selectedStatus === 'ALL' || item.computedStatus === selectedStatus;
      const matchesYear = !selectedYear || item.expiryDate.startsWith(selectedYear);
      const matchesResponsible = selectedResponsible === 'ALL' || item.responsiblePerson === selectedResponsible;

      const matchesStartDate = !startDate || item.expiryDate >= startDate;
      const matchesEndDate = !endDate || item.expiryDate <= endDate;

      const matchesMinAmount = minAmount === '' || item.amount >= Number(minAmount);
      const matchesMaxAmount = maxAmount === '' || item.amount <= Number(maxAmount);

      return matchesSearch && matchesStatus && matchesYear && matchesResponsible && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });
  }, [
    processedObligations,
    searchTerm,
    selectedStatus,
    selectedYear,
    selectedResponsible,
    startDate,
    endDate,
    minAmount,
    maxAmount
  ]);

  const totalFilteredAmount = useMemo(() => filteredObligations.reduce((sum, item) => sum + item.amount, 0), [filteredObligations]);

  return (
    <div className="space-y-6">
      {/* Top Bar Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            الكل ({obligations.length})
          </button>
          <button
            onClick={() => setSelectedStatus('قريب')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'قريب' ? 'bg-amber-600 text-white' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            قريبة الانتهاء
          </button>
          <button
            onClick={() => setSelectedStatus('متأخر')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedStatus === 'متأخر' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            المتأخرة
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPrint('.obligation-print-wrapper')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة كشف الالتزامات</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة التزام / موعد جديد</span>
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
              placeholder="بحث بنوع الالتزام، المسؤول، الملاحظات..."
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
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="نشط">نشط</option>
            <option value="قريب">قريب الانتهاء</option>
            <option value="متأخر">متأخر</option>
            <option value="مكتمل">مكتمل ومجدد</option>
          </select>

          <select
            value={selectedResponsible}
            onChange={(e) => setSelectedResponsible(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع الموظفين المسؤولين</option>
            {settings.employees.map((emp, idx) => (
              <option key={idx} value={emp}>{emp}</option>
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
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">من تاريخ انتهاء الترخيص:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">إلى تاريخ انتهاء الترخيص:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أقل رسوم (درهم):</label>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى رسوم (درهم):</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value ? Number(e.target.value) : '')}
                placeholder="غير محدد"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Year Input */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">سنة الانتهاء:</label>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                placeholder="2026"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

        {/* Results Bar */}
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
          <span>تم العثور على <strong className="text-slate-900 font-bold">{filteredObligations.length}</strong> التزامات</span>
          <span>إجمالي الرسوم التقديرية: <strong className="text-blue-600 font-bold font-mono">{filteredObligations.reduce((s, o) => s + o.amount, 0).toLocaleString('ar-AE')} درهم</strong></span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3">نوع الالتزام / الرخصة</th>
                <th className="p-3">تاريخ الإصدار والانتهاء</th>
                <th className="p-3">الأيام المتبقية</th>
                <th className="p-3">المبلغ التقديري</th>
                <th className="p-3">المسؤول</th>
                <th className="p-3">الحالة وتاريخ التجديد</th>
                <th className="p-3 no-print">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredObligations.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    لا توجد التزامات مسجلة مطابقة.
                  </td>
                </tr>
              ) : (
                filteredObligations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 text-sm">{item.type}</div>
                      {item.notes && <div className="text-[10px] text-slate-500 max-w-xs truncate">{item.notes}</div>}
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      <div>من: {item.issueDate}</div>
                      <div className="font-bold text-slate-900">إلى: {item.expiryDate}</div>
                    </td>
                    <td className="p-3 font-bold font-mono">
                      {item.computedStatus === 'مكتمل' ? (
                        <span className="text-emerald-600">مكتمل</span>
                      ) : item.daysLeft < 0 ? (
                        <span className="text-red-600 font-black">متأخر بـ {Math.abs(item.daysLeft)} يوم</span>
                      ) : (
                        <span className={item.daysLeft <= 45 ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                          متبقي {item.daysLeft} يوم
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-mono font-extrabold text-slate-900 whitespace-nowrap">
                      {item.amount.toLocaleString('ar-AE')} درهم
                    </td>
                    <td className="p-3 font-bold text-slate-800 whitespace-nowrap">{item.responsiblePerson}</td>
                    <td className="p-3 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold inline-flex items-center gap-1 ${
                          item.computedStatus === 'مكتمل'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : item.computedStatus === 'متأخر'
                            ? 'bg-red-100 text-red-800 border border-red-300'
                            : item.computedStatus === 'قريب'
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-blue-50 text-blue-800 border border-blue-200'
                        }`}>
                          {item.computedStatus === 'متأخر' && <AlertCircle className="w-3 h-3 text-red-600" />}
                          {item.computedStatus === 'قريب' && <Clock className="w-3 h-3 text-amber-600" />}
                          {item.computedStatus === 'مكتمل' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{item.computedStatus}</span>
                        </span>
                        {item.computedStatus === 'مكتمل' && (
                          <div className="text-[10px] font-mono text-emerald-700 font-bold">
                            {formatCompletionDateTime(item.completedAt, item.expiryDate)}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-3 no-print whitespace-nowrap">
                      <ActionMenu
                        items={[
                          {
                            label: 'تعديل الالتزام',
                            icon: <Edit2 className="w-4 h-4 text-blue-600" />,
                            onClick: () => openEditModal(item),
                            variant: 'info'
                          },
                          {
                            label: 'حذف الالتزام',
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
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingObligation ? 'تعديل الالتزام والموعد' : 'تسجيل التزام / تجديد موعد جديد'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الالتزام / الرخصة *</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="تجديد إيجار، رخصة تجارية، إقامة..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المبلغ المالي المخصص (درهم) *</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الإصدار / البداية *</label>
              <input
                type="date"
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الانتهاء / الموعد *</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الشخص المسؤول *</label>
              <select
                value={responsiblePerson}
                onChange={(e) => setResponsiblePerson(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                {settings.employees.map((emp, idx) => (
                  <option key={idx} value={emp}>{emp}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الحالة *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="نشط">نشط ساري</option>
                <option value="قريب">قريب الانتهاء</option>
                <option value="متأخر">متأخر</option>
                <option value="مكتمل">مكتمل ومجدد</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات والتفاصيل</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
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
              {editingObligation ? 'تعديل وحفظ' : 'حفظ الالتزام'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteObligation(deleteId);
        }}
        title="حذف الالتزام"
        message="هل أنت أكتأد من حذف هذا الالتزام؟"
      />

      {/* Dedicated Print Statement for Obligations */}
      <ObligationPrintTemplate
        filteredObligations={filteredObligations}
        settings={settings}
        selectedStatus={selectedStatus}
        selectedResponsible={selectedResponsible}
        totalFilteredAmount={totalFilteredAmount}
      />
    </div>
  );
};
