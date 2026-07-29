import React, { useState, useMemo } from 'react';
import { Clock, CheckCircle2, Search, Filter, Printer, AlertTriangle, Building, X, SlidersHorizontal, RotateCcw, RotateCw } from 'lucide-react';
import { Contract, ContractInstallment, OfficeSettings, PaymentMethod } from '../types';
import { Modal } from '../components/Modal';
import { CollectionPrintTemplate } from '../components/CollectionPrintTemplate';
import { ActionMenu } from '../components/ActionMenu';
import { formatDateTime, formatCreationDateTime, formatCompletionDateTime } from '../utils/dateUtils';
import { PrintOrientation } from '../utils/printUtils';

interface CollectionPageProps {
  contracts: Contract[];
  settings: OfficeSettings;
  onUpdateInstallmentStatus: (
    contractId: string, 
    installmentId: string, 
    status: 'محصل' | 'غير محصل',
    collectedDate?: string,
    paymentMethod?: PaymentMethod
  ) => void;
  onPrint: (selector: string, orientation?: PrintOrientation) => void;
}

export const CollectionPage: React.FC<CollectionPageProps> = ({
  contracts,
  settings,
  onUpdateInstallmentStatus,
  onPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('غير محصل'); // 'غير محصل', 'متأخر', 'محصل', 'ALL'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minAmount, setMinAmount] = useState<number | ''>('');
  const [maxAmount, setMaxAmount] = useState<number | ''>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  // Receipt Modal State
  const [collectingItem, setCollectingItem] = useState<{ contract: Contract; installment: ContractInstallment } | null>(null);
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [collectionMethod, setCollectionMethod] = useState<PaymentMethod>('شيك');

  const today = new Date();

  // Extract all installments across contracts
  const allInstallments = useMemo(() => {
    const list: Array<{ contract: Contract; installment: ContractInstallment; isOverdue: boolean }> = [];
    
    contracts.forEach(c => {
      c.installments.forEach(inst => {
        const dueDateObj = new Date(inst.dueDate);
        const isOverdue = inst.status === 'غير محصل' && dueDateObj < today;
        list.push({
          contract: c,
          installment: inst,
          isOverdue
        });
      });
    });

    return list;
  }, [contracts, today]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBuilding('ALL');
    setSelectedMonth('');
    setSelectedStatus('ALL');
    setSelectedPaymentMethod('ALL');
    setStartDate('');
    setEndDate('');
    setMinAmount('');
    setMaxAmount('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      selectedBuilding !== 'ALL' ||
      selectedMonth ||
      selectedStatus !== 'ALL' ||
      selectedPaymentMethod !== 'ALL' ||
      startDate ||
      endDate ||
      minAmount !== '' ||
      maxAmount !== ''
    );
  }, [
    searchTerm,
    selectedBuilding,
    selectedMonth,
    selectedStatus,
    selectedPaymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount
  ]);

  // Filtered installments
  const filteredItems = useMemo(() => {
    return allInstallments.filter(item => {
      const c = item.contract;
      const inst = item.installment;

      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        c.tenantName.toLowerCase().includes(query) ||
        c.buildingName.toLowerCase().includes(query) ||
        c.unitNumber.toLowerCase().includes(query) ||
        c.ownerName.toLowerCase().includes(query) ||
        (inst.chequeNumber && inst.chequeNumber.toLowerCase().includes(query)) ||
        (inst.bankName && inst.bankName.toLowerCase().includes(query));

      const matchesBuilding = selectedBuilding === 'ALL' || c.buildingName === selectedBuilding;
      const matchesMonth = !selectedMonth || inst.dueDate.startsWith(selectedMonth);

      let matchesStatus = true;
      if (selectedStatus === 'غير محصل') {
        matchesStatus = inst.status === 'غير محصل';
      } else if (selectedStatus === 'متأخر') {
        matchesStatus = item.isOverdue;
      } else if (selectedStatus === 'محصل') {
        matchesStatus = inst.status === 'محصل';
      }

      const matchesPaymentMethod = selectedPaymentMethod === 'ALL' ||
        (inst.paymentMethod ? inst.paymentMethod === selectedPaymentMethod : c.paymentType === selectedPaymentMethod);

      const matchesStartDate = !startDate || inst.dueDate >= startDate;
      const matchesEndDate = !endDate || inst.dueDate <= endDate;

      const matchesMinAmount = minAmount === '' || inst.amount >= Number(minAmount);
      const matchesMaxAmount = maxAmount === '' || inst.amount <= Number(maxAmount);

      return matchesSearch && matchesBuilding && matchesMonth && matchesStatus && matchesPaymentMethod && matchesStartDate && matchesEndDate && matchesMinAmount && matchesMaxAmount;
    });
  }, [
    allInstallments,
    searchTerm,
    selectedBuilding,
    selectedMonth,
    selectedStatus,
    selectedPaymentMethod,
    startDate,
    endDate,
    minAmount,
    maxAmount
  ]);

  // Total summary of filtered items
  const totalFilteredAmount = useMemo(() => filteredItems.reduce((sum, item) => sum + item.installment.amount, 0), [filteredItems]);
  const totalCollected = useMemo(() => filteredItems.filter(i => i.installment.status === 'محصل').reduce((sum, i) => sum + i.installment.amount, 0), [filteredItems]);
  const totalUncollected = useMemo(() => filteredItems.filter(i => i.installment.status !== 'محصل').reduce((sum, i) => sum + i.installment.amount, 0), [filteredItems]);

  const handleOpenCollectModal = (contract: Contract, installment: ContractInstallment) => {
    setCollectingItem({ contract, installment });
    setCollectionDate(new Date().toISOString().split('T')[0]);
    setCollectionMethod((installment.paymentMethod as PaymentMethod) || (contract.paymentType === 'نقد' ? 'نقد' : 'شيك'));
  };

  const handleConfirmCollect = () => {
    if (!collectingItem) return;
    onUpdateInstallmentStatus(
      collectingItem.contract.id,
      collectingItem.installment.id,
      'محصل',
      collectionDate,
      collectionMethod
    );
    setCollectingItem(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Bar / Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedStatus('غير محصل')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === 'غير محصل' ? 'bg-amber-500 text-slate-950 shadow-md' : 'bg-slate-100 text-slate-700'
            }`}
          >
            جميع غير المحصلة
          </button>

          <button
            onClick={() => setSelectedStatus('متأخر')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === 'متأخر' ? 'bg-red-600 text-white shadow-md' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            الدفعات المتأخرة فقط
          </button>

          <button
            onClick={() => setSelectedStatus('محصل')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === 'محصل' ? 'bg-emerald-600 text-white shadow-md' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            الدفعات المحصلة
          </button>

          <button
            onClick={() => setSelectedStatus('ALL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedStatus === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-700'
            }`}
          >
            الكل
          </button>
        </div>

        <button
          onClick={() => onPrint('.collection-print-wrapper', 'landscape')}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-300"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة كشف التحصيل</span>
        </button>
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
              placeholder="بحث بالمستأجر، البناية، الوحدة، رقم الشيك، المالك، اسم البنك..."
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
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع البنايات</option>
            {settings.buildings.map((b, idx) => (
              <option key={idx} value={b}>{b}</option>
            ))}
          </select>

          <select
            value={selectedPaymentMethod}
            onChange={(e) => setSelectedPaymentMethod(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع طرق السداد</option>
            <option value="شيك">شيك</option>
            <option value="نقد">نقد</option>
            <option value="تحويل">تحويل بنكي</option>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">من تاريخ استحقاق:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">إلى تاريخ استحقاق:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Min Amount */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أقل قيمة دفعة (درهم):</label>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى قيمة دفعة (درهم):</label>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">تحديد شهر الاستحقاق:</label>
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
          <span>تم العثور على <strong className="text-slate-900 font-bold">{filteredItems.length}</strong> دفعة إيجارية</span>
          <span>إجمالي القيمة المعروضة: <strong className="text-amber-600 font-bold font-mono">{totalFilteredAmount.toLocaleString('ar-AE')} درهم</strong></span>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-900 text-white font-bold">
              <tr>
                <th className="p-3">المستأجر</th>
                <th className="p-3">البناية والوحدة</th>
                <th className="p-3">الدفعة والاستحقاق</th>
                <th className="p-3">المبلغ (درهم)</th>
                <th className="p-3">الشيك / البنك</th>
                <th className="p-3">الحالة وتاريخ التحصيل</th>
                <th className="p-3 no-print">تحويل التحصيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    لا توجد دفعات مطابقة للتصفية المحددة.
                  </td>
                </tr>
              ) : (
                filteredItems.map(({ contract, installment, isOverdue }) => (
                  <tr key={installment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{contract.tenantName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{contract.tenantPhone}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold text-slate-800">{contract.buildingName}</div>
                      <div className="text-[10px] text-slate-500">{contract.unitNumber} ({contract.area})</div>
                    </td>
                    <td className="p-3">
                      <div className="font-bold">الدفعة #{installment.installmentNo}</div>
                      <div className="font-mono text-[11px] text-slate-700">تاريخ الاستحقاق: {installment.dueDate}</div>
                    </td>
                    <td className="p-3 font-mono font-extrabold text-slate-900 text-sm whitespace-nowrap">
                      {installment.amount.toLocaleString('ar-AE')} درهم
                    </td>
                    <td className="p-3 font-mono text-slate-700">
                      <div>{installment.chequeNumber || 'نقدي / تحويل'}</div>
                      <div className="text-[10px] text-slate-500">{installment.bankName || ''}</div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {installment.status === 'محصل' ? (
                        <div className="space-y-1">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>مكتمل ومستلم</span>
                          </span>
                          <div className="text-[10px] font-mono font-semibold text-emerald-700">
                            {formatCompletionDateTime(installment.completedAt, installment.collectedDate)}
                          </div>
                        </div>
                      ) : isOverdue ? (
                        <span className="px-2.5 py-1 bg-red-100 text-red-800 border border-red-300 rounded-md text-[10px] font-bold inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-600" />
                          <span>متأخرة</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[10px] font-bold inline-flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>غير محصلة</span>
                        </span>
                      )}
                    </td>
                    <td className="p-3 no-print whitespace-nowrap">
                      {installment.status === 'غير محصل' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleOpenCollectModal(contract, installment)}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                          >
                            تحويل إلى محصلة
                          </button>
                          <ActionMenu
                            items={[
                              {
                                label: 'تسجيل الدفعة كمحصلة',
                                icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
                                onClick: () => handleOpenCollectModal(contract, installment),
                                variant: 'success'
                              }
                            ]}
                          />
                        </div>
                      ) : (
                        <ActionMenu
                          items={[
                            {
                              label: 'إلغاء التحصيل (إرجاعها كغير محصلة)',
                              icon: <RotateCw className="w-4 h-4 text-red-600" />,
                              onClick: () => onUpdateInstallmentStatus(contract.id, installment.id, 'غير محصل'),
                              variant: 'danger'
                            }
                          ]}
                        />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredItems.length > 0 && (
              <tfoot className="bg-slate-100 font-bold border-t-2 border-slate-300">
                <tr>
                  <td colSpan={4} className="p-3 text-slate-900">إجمالي قيمة الدفعات في هذه التصفية:</td>
                  <td className="p-3 font-mono text-amber-700 text-sm">{totalFilteredAmount.toLocaleString('ar-AE')} درهم</td>
                  <td colSpan={3} className="p-3 text-slate-500 text-[11px]">عدد الدفعات: {filteredItems.length} دفعة</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Collect Modal */}
      {collectingItem && (
        <Modal
          isOpen={!!collectingItem}
          onClose={() => setCollectingItem(null)}
          title={`تسجيل استلام وتحصيل الدفة #${collectingItem.installment.installmentNo}`}
          maxWidth="max-w-md"
        >
          <div className="space-y-4">
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-900 text-xs">
              <div className="font-bold">{collectingItem.contract.tenantName}</div>
              <div>{collectingItem.contract.buildingName} - {collectingItem.contract.unitNumber}</div>
              <div className="font-mono font-bold text-sm text-emerald-700 mt-1">
                المبلغ: {collectingItem.installment.amount.toLocaleString('ar-AE')} درهم
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ التحصيل الأخير *</label>
              <input
                type="date"
                value={collectionDate}
                onChange={(e) => setCollectionDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة السداد الاستلام *</label>
              <select
                value={collectionMethod}
                onChange={(e) => setCollectionMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="شيك">إيداع شيك بانكي</option>
                <option value="تحويل بنكي">تحويل بنكي مباشر</option>
                <option value="نقد">استلام نقدي</option>
                <option value="بطاقة">دفع بالبطاقة</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setCollectingItem(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmCollect}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md"
              >
                تأكيد التحصيل
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dedicated Print Statement for Collection */}
      <CollectionPrintTemplate
        filteredInstallments={filteredItems}
        settings={settings}
        selectedBuilding={selectedBuilding}
        selectedMonth={selectedMonth}
        selectedStatus={selectedStatus}
        totalCollected={totalCollected}
        totalUncollected={totalUncollected}
      />
    </div>
  );
};
