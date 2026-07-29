import React, { useState, useMemo } from 'react';
import { Plus, Search, Printer, Edit2, Trash2, Building2, Eye, DollarSign, ArrowUpRight, CheckCircle, Calculator, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { ExecutedProject, ExecutedProjectCostItem, OfficeSettings } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PrintHeader } from '../components/PrintHeader';
import { ActionMenu } from '../components/ActionMenu';
import { ExecutedProjectPrintReport } from '../components/ExecutedProjectPrintReport';
import { ProjectPrintTemplate } from '../components/ProjectPrintTemplate';
import { ReportPreviewModal } from '../components/ReportPreviewModal';
import { ExecutedProjectsRegisterPrintTemplate } from '../components/ProjectRegisterPrintTemplates';

interface ExecutedProjectsPageProps {
  executedProjects: ExecutedProject[];
  settings: OfficeSettings;
  onAddExecutedProject: (project: Omit<ExecutedProject, 'id'>) => void;
  onUpdateExecutedProject: (project: ExecutedProject) => void;
  onDeleteExecutedProject: (id: string) => void;
  onPrint: (selector: string) => void;
}

export const ExecutedProjectsPage: React.FC<ExecutedProjectsPageProps> = ({
  executedProjects,
  settings,
  onAddExecutedProject,
  onUpdateExecutedProject,
  onDeleteExecutedProject,
  onPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ExecutedProject | null>(null);
  const [viewingProject, setViewingProject] = useState<ExecutedProject | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStartDate, setFormStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [formSaleDate, setFormSaleDate] = useState('');
  const [area, setArea] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [type, setType] = useState('تطوير فيلا سكنية');
  const [sellingPrice, setSellingPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Cost items array
  const [costItems, setCostItems] = useState<ExecutedProjectCostItem[]>([]);

  const openAddModal = () => {
    setEditingProject(null);
    setName('');
    setOwnerName('');
    setDate(new Date().toISOString().split('T')[0]);
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormSaleDate('');
    setArea('المرابع العربية');
    setPlotNumber('');
    setType('تطوير سكني');
    setSellingPrice('');
    setNotes('');
    setCostItems([
      { id: `ci-1`, name: 'سعر الأرض الشراء', value: 2000000, date: new Date().toISOString().split('T')[0], notes: '' },
      { id: `ci-2`, name: 'رسوم المقاول والديكور', value: 400000, date: new Date().toISOString().split('T')[0], notes: '' },
      { id: `ci-3`, name: 'رسوم الاستشاري والتراخيص', value: 50000, date: new Date().toISOString().split('T')[0], notes: '' }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: ExecutedProject) => {
    setEditingProject(p);
    setName(p.name);
    setOwnerName(p.ownerName);
    setDate(p.date);
    setFormStartDate(p.startDate || p.date);
    setFormSaleDate(p.saleDate || '');
    setArea(p.area);
    setPlotNumber(p.plotNumber);
    setType(p.type);
    setSellingPrice(p.sellingPrice);
    setNotes(p.notes || '');
    setCostItems(p.costItems || []);
    setIsModalOpen(true);
  };

  const handleAddCostItemRow = () => {
    setCostItems([
      ...costItems,
      {
        id: `ci-${Date.now()}-${costItems.length + 1}`,
        name: 'بند تكلفة جديد',
        value: 10000,
        date: new Date().toISOString().split('T')[0],
        notes: ''
      }
    ]);
  };

  const handleRemoveCostItemRow = (idx: number) => {
    const updated = [...costItems];
    updated.splice(idx, 1);
    setCostItems(updated);
  };

  const handleCostItemChange = (idx: number, field: keyof ExecutedProjectCostItem, val: any) => {
    const updated = [...costItems];
    updated[idx] = { ...updated[idx], [field]: val };
    setCostItems(updated);
  };

  // Calculate live total cost items
  const currentTotalCostItems = useMemo(() => {
    return costItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  }, [costItems]);

  const currentNetOwnerProfit = useMemo(() => {
    const sell = Number(sellingPrice) || 0;
    return sell - currentTotalCostItems;
  }, [sellingPrice, currentTotalCostItems]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !sellingPrice || sellingPrice <= 0) {
      alert('يرجى التأكد من كتابة اسم المشروع وسعر البيع بشكل صحيح');
      return;
    }

    if (editingProject) {
      onUpdateExecutedProject({
        ...editingProject,
        name: name.trim(),
        ownerName: ownerName.trim(),
        date,
        startDate: formStartDate,
        saleDate: formSaleDate || undefined,
        area: area.trim(),
        plotNumber: plotNumber.trim(),
        type,
        notes: notes.trim(),
        costItems,
        sellingPrice: Number(sellingPrice)
      });
    } else {
      onAddExecutedProject({
        name: name.trim(),
        ownerName: ownerName.trim(),
        date,
        startDate: formStartDate,
        saleDate: formSaleDate || undefined,
        area: area.trim(),
        plotNumber: plotNumber.trim(),
        type,
        notes: notes.trim(),
        costItems,
        sellingPrice: Number(sellingPrice)
      });
    }
    setIsModalOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedType('ALL');
    setStartDate('');
    setEndDate('');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      selectedType !== 'ALL' ||
      startDate ||
      endDate ||
      minPrice !== '' ||
      maxPrice !== ''
    );
  }, [searchTerm, selectedType, startDate, endDate, minPrice, maxPrice]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return executedProjects.filter(p => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        p.name.toLowerCase().includes(query) ||
        p.ownerName.toLowerCase().includes(query) ||
        p.area.toLowerCase().includes(query) ||
        (p.plotNumber && p.plotNumber.toLowerCase().includes(query)) ||
        (p.notes && p.notes.toLowerCase().includes(query));

      const matchesType = selectedType === 'ALL' || p.type === selectedType;

      const matchesStartDate = !startDate || p.date >= startDate;
      const matchesEndDate = !endDate || p.date <= endDate;

      const matchesMinPrice = minPrice === '' || p.sellingPrice >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || p.sellingPrice <= Number(maxPrice);

      return matchesSearch && matchesType && matchesStartDate && matchesEndDate && matchesMinPrice && matchesMaxPrice;
    });
  }, [executedProjects, searchTerm, selectedType, startDate, endDate, minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Official Print Header for Executed Project Detail or Summary */}
      {viewingProject ? (
        <PrintHeader
          settings={settings}
          title={`تقرير التكلفة وصافي المالك لمشروع: ${viewingProject.name}`}
          subtitle={`المالك: ${viewingProject.ownerName} | المنطقة: ${viewingProject.area} (قطعة ${viewingProject.plotNumber})`}
          dateRange={`التاريخ: ${viewingProject.date}`}
        />
      ) : (
        <PrintHeader
          settings={settings}
          title="كشف المشاريع المنفذة والمطورة تحت إشراف المكتب"
          subtitle={`عدد المشاريع المعروضة: ${filteredProjects.length}`}
        />
      )}

      {/* Top Bar & Filters Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم المشروع المنفذ، المالك، المنطقة، رقم القطعة، الملاحظات..."
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
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع أنواع التطوير</option>
            <option value="تطوير فيلا سكنية">تطوير فيلا سكنية</option>
            <option value="تطوير سكني">تطوير سكني</option>
            <option value="تطوير تجاري">تطوير تجاري</option>
            <option value="بناء عمارة">بناء عمارة</option>
          </select>

          <div className="flex items-center gap-2">
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

            <button
              onClick={() => onPrint('.executed-projects-register-print-report')}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors border border-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة التقرير</span>
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مشروع منفذ جديد</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-lg text-xs">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">من تاريخ التنفيذ:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">إلى تاريخ التنفيذ:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أقل سعر بيع (درهم):</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى سعر بيع (درهم):</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : '')}
                placeholder="غير محدد"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Results Bar */}
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
          <span>تم العثور على <strong className="text-slate-900 font-bold">{filteredProjects.length}</strong> مشاريع منفذة</span>
          <span>إجمالي قيم البيع المعروضة: <strong className="text-emerald-600 font-bold font-mono">{filteredProjects.reduce((s, p) => s + p.sellingPrice, 0).toLocaleString('ar-AE')} درهم</strong></span>
        </div>
      </div>

      {/* Interactive Cards Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-white p-8 text-center text-slate-400 rounded-xl border border-slate-200 text-xs">
            لا توجد مشاريع منفذة مسجلة حالياً.
          </div>
        ) : (
          filteredProjects.map((p) => {
            const totalCosts = p.costItems ? p.costItems.reduce((s, c) => s + c.value, 0) : 0;
            const netBenefit = p.sellingPrice - totalCosts;

            return (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-400 transition-all cursor-pointer flex flex-col justify-between group"
                onClick={() => setViewingProject(p)}
              >
                {/* Card Header */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
                      {p.name}
                    </h3>
                    <span className="px-2 py-0.5 bg-slate-900 text-amber-400 font-bold text-[10px] rounded shrink-0">
                      {p.type}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 mb-4">
                    المالك: <span className="font-bold text-slate-800">{p.ownerName}</span> | {p.area}
                  </p>

                  {/* Metrics Box & Interactive Percentage Bar */}
                  {(() => {
                    const costPercentage = p.sellingPrice > 0 ? Math.min(100, Math.round((totalCosts / p.sellingPrice) * 100)) : 0;
                    const profitPercentage = Math.max(0, 100 - costPercentage);

                    return (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-3 text-xs">
                        {/* Header percentage badges */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                            <Calculator className="w-3.5 h-3.5 text-blue-600" />
                            <span>مؤشر التكلفة وهامش الربح:</span>
                          </span>
                          <div className="flex items-center gap-1.5 font-mono text-[11px]">
                            <span className="px-2 py-0.5 bg-red-100 text-red-800 border border-red-300 rounded-md font-black">
                              {costPercentage}% تكلفة
                            </span>
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-black">
                              {profitPercentage}% أرباح
                            </span>
                          </div>
                        </div>

                        {/* Interactive Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden p-0.5 border border-slate-300 flex relative shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-red-600 to-red-500 h-full rounded-full transition-all duration-500 flex items-center justify-center text-[9px] font-black text-white font-mono shadow-xs"
                              style={{ width: `${costPercentage}%` }}
                              title={`نسبة التكاليف من سعر البيع: ${costPercentage}%`}
                            >
                              {costPercentage >= 15 && `${costPercentage}%`}
                            </div>
                            <div 
                              className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-full rounded-full transition-all duration-500 flex items-center justify-center text-[9px] font-black text-white font-mono shadow-xs"
                              style={{ width: `${profitPercentage}%` }}
                              title={`نسبة فائدة وأرباح المالك: ${profitPercentage}%`}
                            >
                              {profitPercentage >= 15 && `${profitPercentage}%`}
                            </div>
                          </div>

                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>التكاليف المباشرة: {totalCosts.toLocaleString('ar-AE')} درهم</span>
                            <span>ربح المالك: {netBenefit.toLocaleString('ar-AE')} درهم</span>
                          </div>
                        </div>

                        {/* Financial Metrics */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200 font-mono">
                          <div>
                            <span className="text-slate-500 block text-[9px] font-sans font-bold">سعر البيع الإجمالي:</span>
                            <span className="font-extrabold text-slate-900">{p.sellingPrice.toLocaleString('ar-AE')} درهم</span>
                          </div>
                          <div>
                            <span className="text-emerald-700 block text-[9px] font-sans font-bold">صافي الفائدة للمالك:</span>
                            <span className="font-extrabold text-emerald-600">{netBenefit.toLocaleString('ar-AE')} درهم</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Card Footer Actions */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 no-print rounded-b-xl" onClick={(e) => e.stopPropagation()}>
                  <div className="text-[11px] text-slate-500 font-medium space-x-2 space-x-reverse">
                    <span>البدء: <strong className="font-mono font-bold text-slate-800">{p.startDate || p.date}</strong></span>
                    {p.saleDate && (
                      <span>| البيع: <strong className="font-mono font-bold text-emerald-700">{p.saleDate}</strong></span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingProject(p)}
                      className="px-2.5 py-1 bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold text-xs rounded transition-colors cursor-pointer"
                    >
                      عرض التفاصيل
                    </button>
                    
                    <ActionMenu
                      items={[
                        {
                          label: 'عرض التكاليف والتفاصيل',
                          icon: <Eye className="w-4 h-4 text-emerald-600" />,
                          onClick: () => setViewingProject(p)
                        },
                        {
                          label: 'طباعة تقرير هذا المشروع',
                          icon: <Printer className="w-4 h-4 text-amber-600" />,
                          onClick: () => {
                            setViewingProject(p);
                            setTimeout(() => onPrint('.project-quick-print-report'), 100);
                          }
                        },
                        {
                          label: 'تعديل بيانات المشروع',
                          icon: <Edit2 className="w-4 h-4 text-blue-600" />,
                          onClick: () => openEditModal(p),
                          variant: 'info'
                        },
                        {
                          label: 'حذف المشروع',
                          icon: <Trash2 className="w-4 h-4 text-red-600" />,
                          onClick: () => setDeleteId(p.id),
                          variant: 'danger'
                        }
                      ]}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Viewing Modal & Printable Format Spec: Items first -> Total Items -> Selling Price -> Net Profit */}
      {viewingProject && !isPreviewModalOpen && (
        <Modal
          isOpen={!!viewingProject}
          onClose={() => setViewingProject(null)}
          title={`تقرير وتكاليف مشروع: ${viewingProject.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-6 text-right">
            {/* Metadata Summary */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">اسم المالك:</span>
                <span className="font-bold text-slate-900">{viewingProject.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">المنطقة والقطعة:</span>
                <span className="font-bold text-slate-900">{viewingProject.area} - {viewingProject.plotNumber}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">نوع المشروع:</span>
                <span className="font-bold text-slate-900">{viewingProject.type}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">وقت/تاريخ البدء:</span>
                <span className="font-bold font-mono text-slate-900">{viewingProject.startDate || viewingProject.date}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">وقت/تاريخ البيع:</span>
                <span className="font-bold font-mono text-emerald-700">{viewingProject.saleDate || 'غير مباع/قيد التطوير'}</span>
              </div>
            </div>

            {/* 1. Items Table FIRST */}
            <div>
              <h4 className="font-bold text-slate-900 text-xs mb-2">أولاً: بنود التكلفة الإجمالية للمشروع:</h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-2.5">البند والتفاصيل</th>
                      <th className="p-2.5">قيمة البند (درهم)</th>
                      <th className="p-2.5">التاريخ</th>
                      <th className="p-2.5">ملاحظات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {viewingProject.costItems?.map((ci) => (
                      <tr key={ci.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{ci.name}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-800">{ci.value.toLocaleString('ar-AE')} درهم</td>
                        <td className="p-2.5 font-mono text-slate-500">{ci.date}</td>
                        <td className="p-2.5 text-slate-500">{ci.notes || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 2. Total Items Cost, 3. Selling Price, 4. Net/Owner Profit */}
            {(() => {
              const totalItemsCost = viewingProject.costItems ? viewingProject.costItems.reduce((s, c) => s + c.value, 0) : 0;
              const netOwnerProfit = viewingProject.sellingPrice - totalItemsCost;

              return (
                <div className="bg-slate-900 text-white p-5 rounded-2xl space-y-3 font-mono">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>1. إجمالي التكاليف والبنود:</span>
                    <span className="font-bold text-red-400 text-sm">{totalItemsCost.toLocaleString('ar-AE')} درهم</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span>2. سعر البيع الإجمالي:</span>
                    <span className="font-extrabold text-amber-400 text-base">{viewingProject.sellingPrice.toLocaleString('ar-AE')} درهم</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-sm font-sans font-extrabold">
                    <span className="text-emerald-400">3. صافي أرباح / فائدة المالك:</span>
                    <span className="text-xl font-mono text-emerald-400 font-black">{netOwnerProfit.toLocaleString('ar-AE')} درهم</span>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between no-print pt-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsPreviewModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs cursor-pointer shadow-sm transition-colors"
                >
                  <Eye className="w-4 h-4 text-slate-950" />
                  <span>معاينة وتخصيص التقرير قبل الطباعة</span>
                </button>

                <button
                  onClick={() => onPrint('.project-quick-print-report')}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-xs cursor-pointer shadow-sm transition-colors"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة سريعة</span>
                </button>
              </div>

              <button
                onClick={() => setViewingProject(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs cursor-pointer hover:bg-slate-50 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Preview and Customization Modal for Report */}
      {viewingProject && (
        <ReportPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => setIsPreviewModalOpen(false)}
          project={viewingProject}
          settings={settings}
        />
      )}

      {/* Dedicated Single Executed Project Professional Printable Report Document */}
      <ExecutedProjectsRegisterPrintTemplate
        projects={filteredProjects}
        settings={settings}
        filters={[
          ...(searchTerm.trim() ? [{ label: 'البحث', value: searchTerm.trim() }] : []),
          ...(selectedType !== 'ALL' ? [{ label: 'نوع المشروع', value: selectedType }] : []),
          ...(startDate ? [{ label: 'من تاريخ', value: startDate }] : []),
          ...(endDate ? [{ label: 'إلى تاريخ', value: endDate }] : []),
          ...(minPrice !== '' ? [{ label: 'الحد الأدنى للقيمة', value: String(minPrice) }] : []),
          ...(maxPrice !== '' ? [{ label: 'الحد الأعلى للقيمة', value: String(maxPrice) }] : []),
        ]}
      />
      {viewingProject && (
        <ProjectPrintTemplate
          project={viewingProject}
          settings={settings}
          printClassName="project-quick-print-report"
        />
      )}

      {/* Add / Edit Executed Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'تعديل مشروع منفذ' : 'إضافة مشروع منفذ جديد وتكاليفه'}
        maxWidth="max-w-3xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المشروع *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مشروع تطوير فيلا اللوتس"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المالك *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="اسم المالك"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة ورقم القطعة *</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="المنطقة"
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                  required
                />
                <input
                  type="text"
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  placeholder="رقم القطعة"
                  className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع المشروع *</label>
              <input
                type="text"
                value={type}
                onChange={(e) => setType(e.target.value)}
                placeholder="سكني، تجاري، استثماري..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت/تاريخ البدء (بداية المشروع والتطوير) *</label>
              <input
                type="date"
                value={formStartDate}
                onChange={(e) => {
                  setFormStartDate(e.target.value);
                  setDate(e.target.value);
                }}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">وقت/تاريخ البيع (اختياري أو عند إتمام البيع)</label>
              <input
                type="date"
                value={formSaleDate}
                onChange={(e) => setFormSaleDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">سعر البيع النهائي (درهم) *</label>
              <input
                type="number"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Cost Items list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">بنود التكلفة المضافة (سعر الأرض، مقاول، استشاري، ديكور...):</label>
              <button
                type="button"
                onClick={handleAddCostItemRow}
                className="px-3 py-1 bg-slate-900 text-amber-400 font-bold text-xs rounded hover:bg-slate-800"
              >
                + إضافة بند تكلفة
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {costItems.map((ci, idx) => (
                <div key={ci.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-2 items-center text-xs">
                  <input
                    type="text"
                    value={ci.name}
                    onChange={(e) => handleCostItemChange(idx, 'name', e.target.value)}
                    placeholder="اسم بند التكلفة"
                    className="md:col-span-2 px-2 py-1.5 bg-white border border-slate-300 rounded font-medium"
                    required
                  />
                  <input
                    type="number"
                    value={ci.value}
                    onChange={(e) => handleCostItemChange(idx, 'value', Number(e.target.value))}
                    placeholder="القيمة بالدرهم"
                    className="px-2 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                    required
                  />
                  <div className="flex items-center justify-between">
                    <input
                      type="date"
                      value={ci.date}
                      onChange={(e) => handleCostItemChange(idx, 'date', e.target.value)}
                      className="px-2 py-1.5 bg-white border border-slate-300 rounded font-mono text-[11px]"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveCostItemRow(idx)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Automatic calculation preview in form */}
          <div className="p-3 bg-slate-100 rounded-lg border border-slate-300 text-xs font-mono grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="text-slate-500 font-sans block text-[10px]">إجمالي التكاليف:</span>
              <span className="font-bold text-slate-900">{currentTotalCostItems.toLocaleString('ar-AE')} درهم</span>
            </div>
            <div>
              <span className="text-slate-500 font-sans block text-[10px]">سعر البيع:</span>
              <span className="font-bold text-slate-900">{(Number(sellingPrice) || 0).toLocaleString('ar-AE')} درهم</span>
            </div>
            <div>
              <span className="text-emerald-700 font-sans font-bold block text-[10px]">صافي فائدة المالك:</span>
              <span className="font-black text-emerald-600">{currentNetOwnerProfit.toLocaleString('ar-AE')} درهم</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات</label>
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
              {editingProject ? 'حفظ التعديلات' : 'حفظ المشروع والتكاليف'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteExecutedProject(deleteId);
        }}
        title="حذف المشروع المنفذ"
        message="هل أنت أكتأد من حذف هذا المشروع وتكاليفه؟"
      />
    </div>
  );
};
