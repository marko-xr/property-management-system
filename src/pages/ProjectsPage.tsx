import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Printer, Edit2, Trash2, Briefcase, Eye, CheckCircle2, Clock, DollarSign, X, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { Project, ProjectItem, OfficeSettings } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PrintHeader } from '../components/PrintHeader';
import { ActionMenu } from '../components/ActionMenu';
import { ProjectPrintTemplate } from '../components/ProjectPrintTemplate';
import { ReportPreviewModal } from '../components/ReportPreviewModal';
import { formatCreationDateTime, formatCompletionDateTime } from '../utils/dateUtils';

interface ProjectsPageProps {
  projects: Project[];
  settings: OfficeSettings;
  onAddProject: (project: Omit<Project, 'id'>) => void;
  onUpdateProject: (project: Project) => void;
  onDeleteProject: (id: string) => void;
  onPrint: () => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({
  projects,
  settings,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onPrint
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form project state
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [area, setArea] = useState('');
  const [plotNumber, setPlotNumber] = useState('');
  const [contractorCompany, setContractorCompany] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [totalAgreedPrice, setTotalAgreedPrice] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Dynamic items list for project creation
  const [items, setItems] = useState<ProjectItem[]>([]);

  const openAddModal = () => {
    setEditingProject(null);
    setName('');
    setOwnerName('');
    setArea('الروضة');
    setPlotNumber('');
    setContractorCompany('');
    setDate(new Date().toISOString().split('T')[0]);
    setTotalAgreedPrice('');
    setNotes('');
    setItems([
      {
        id: `item-${Date.now()}-1`,
        projectId: 'new',
        name: 'أعمال الهيكل والأساسات الخرسانية',
        value: 50000,
        date: new Date().toISOString().split('T')[0],
        status: 'قيد التنفيذ',
        paidAmount: 15000,
        notes: ''
      }
    ]);
    setIsModalOpen(true);
  };

  const openEditModal = (p: Project) => {
    setEditingProject(p);
    setName(p.name);
    setOwnerName(p.ownerName);
    setArea(p.area);
    setPlotNumber(p.plotNumber);
    setContractorCompany(p.contractorCompany);
    setDate(p.date);
    setTotalAgreedPrice(p.totalAgreedPrice);
    setNotes(p.notes || '');
    setItems(p.items || []);
    setIsModalOpen(true);
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        id: `item-${Date.now()}-${items.length + 1}`,
        projectId: editingProject ? editingProject.id : 'new',
        name: 'بند أعمال جاري',
        value: 10000,
        date: new Date().toISOString().split('T')[0],
        status: 'قيد التنفيذ',
        paidAmount: 0,
        notes: ''
      }
    ]);
  };

  const handleRemoveItemRow = (idx: number) => {
    const updated = [...items];
    updated.splice(idx, 1);
    setItems(updated);
  };

  const handleItemChange = (idx: number, field: keyof ProjectItem, val: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: val };
    setItems(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contractorCompany.trim() || !totalAgreedPrice || totalAgreedPrice <= 0) {
      alert('يرجى التأكد من اسم المشروع، المقاول والسعر الإجمالي المتفق عليه');
      return;
    }

    if (editingProject) {
      onUpdateProject({
        ...editingProject,
        name: name.trim(),
        ownerName: ownerName.trim(),
        area: area.trim(),
        plotNumber: plotNumber.trim(),
        contractorCompany: contractorCompany.trim(),
        date,
        totalAgreedPrice: Number(totalAgreedPrice),
        notes: notes.trim(),
        items
      });
    } else {
      onAddProject({
        name: name.trim(),
        ownerName: ownerName.trim(),
        area: area.trim(),
        plotNumber: plotNumber.trim(),
        contractorCompany: contractorCompany.trim(),
        date,
        totalAgreedPrice: Number(totalAgreedPrice),
        notes: notes.trim(),
        items
      });
    }
    setIsModalOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    setMinPrice('');
    setMaxPrice('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      startDate ||
      endDate ||
      minPrice !== '' ||
      maxPrice !== ''
    );
  }, [searchTerm, startDate, endDate, minPrice, maxPrice]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        p.name.toLowerCase().includes(query) ||
        p.ownerName.toLowerCase().includes(query) ||
        p.contractorCompany.toLowerCase().includes(query) ||
        p.area.toLowerCase().includes(query) ||
        (p.plotNumber && p.plotNumber.toLowerCase().includes(query)) ||
        (p.notes && p.notes.toLowerCase().includes(query));

      const matchesStartDate = !startDate || p.date >= startDate;
      const matchesEndDate = !endDate || p.date <= endDate;

      const matchesMinPrice = minPrice === '' || p.totalAgreedPrice >= Number(minPrice);
      const matchesMaxPrice = maxPrice === '' || p.totalAgreedPrice <= Number(maxPrice);

      return matchesSearch && matchesStartDate && matchesEndDate && matchesMinPrice && matchesMaxPrice;
    });
  }, [projects, searchTerm, startDate, endDate, minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Official Print Header */}
      <PrintHeader
        settings={settings}
        title={viewingProject ? `كشف حساب وبنود مشروع: ${viewingProject.name}` : "كشف مشاريع المقاولين والبنود المعتمدة"}
        subtitle={`عدد المشاريع المعروضة: ${filteredProjects.length}`}
      />

      {/* Top Actions & Filters Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث باسم المشروع، المقاول، المالك، المنطقة، رقم القسيمة، الملاحظات..."
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
              onClick={onPrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors border border-slate-300"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة القائمة</span>
            </button>

            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors shadow-sm cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة مشروع مقاول جديد</span>
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-lg text-xs">
            {/* Start Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">من تاريخ المشروع:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">إلى تاريخ المشروع:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أقل قيمة للمشروع (درهم):</label>
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
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى قيمة للمشروع (درهم):</label>
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
          <span>تم العثور على <strong className="text-slate-900 font-bold">{filteredProjects.length}</strong> مشاريع</span>
          <span>إجمالي الاتفاقيات المعروضة: <strong className="text-blue-600 font-bold font-mono">{filteredProjects.reduce((s, p) => s + p.totalAgreedPrice, 0).toLocaleString('ar-AE')} درهم</strong></span>
        </div>
      </div>

      {/* Projects List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full bg-white p-8 text-center text-slate-400 rounded-xl border border-slate-200 text-xs">
            لا توجد مشاريع مقاولين مسجلة.
          </div>
        ) : (
          filteredProjects.map((p) => {
            const itemsValSum = p.items ? p.items.reduce((s, i) => s + i.value, 0) : 0;
            const paidSum = p.items ? p.items.reduce((s, i) => s + i.paidAmount, 0) : 0;
            const remainingSum = Math.max(0, p.totalAgreedPrice - paidSum);

            return (
              <div key={p.id} className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 hover:border-amber-400 transition-all flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                      <p className="text-[11px] text-slate-500">شركة المقاول: <span className="font-bold text-slate-800">{p.contractorCompany}</span></p>
                    </div>
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded font-bold text-[10px]">
                      {p.date}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                    <div><span className="text-slate-500">المالك:</span> <span className="font-bold">{p.ownerName}</span></div>
                    <div><span className="text-slate-500">المنطقة والقطعة:</span> <span className="font-bold">{p.area} - {p.plotNumber}</span></div>
                  </div>

                  {/* Financial & Interactive Completion Progress Bar */}
                  {(() => {
                    const totalItemsCount = p.items ? p.items.length : 0;
                    const completedItems = p.items ? p.items.filter(i => i.status === 'مكتمل') : [];
                    const completedItemsCount = completedItems.length;
                    const completedValue = p.items ? completedItems.reduce((s, i) => s + i.value, 0) : 0;
                    const completionPercentage = p.totalAgreedPrice > 0 
                      ? Math.min(100, Math.round((completedValue / p.totalAgreedPrice) * 100)) 
                      : (totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0);
                    const remainingPercentage = Math.max(0, 100 - completionPercentage);
                    const paidPercentage = p.totalAgreedPrice > 0 ? Math.min(100, Math.round((paidSum / p.totalAgreedPrice) * 100)) : 0;

                    return (
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-3">
                        {/* Progress Header Badge */}
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-extrabold text-slate-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>نسبة الإنجاز والتقدم:</span>
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-mono font-black text-[11px]">
                              {completionPercentage}% منفذ
                            </span>
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-md font-mono font-black text-[11px]">
                              {remainingPercentage}% متبقي
                            </span>
                          </div>
                        </div>

                        {/* Interactive Dual-Color Progress Bar */}
                        <div className="space-y-1">
                          <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden p-0.5 border border-slate-300 flex relative shadow-inner">
                            <div 
                              className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full rounded-full transition-all duration-500 flex items-center justify-center text-[9px] font-black text-white font-mono shadow-xs"
                              style={{ width: `${completionPercentage}%` }}
                              title={`نسبة الإنجاز المنفذة: ${completionPercentage}%`}
                            >
                              {completionPercentage >= 15 && `${completionPercentage}%`}
                            </div>
                            <div 
                              className="bg-amber-400/90 h-full rounded-full transition-all duration-500 flex items-center justify-center text-[9px] font-black text-amber-950 font-mono"
                              style={{ width: `${remainingPercentage}%` }}
                              title={`المتبقي للتنفيذ: ${remainingPercentage}%`}
                            >
                              {remainingPercentage >= 15 && `${remainingPercentage}%`}
                            </div>
                          </div>

                          <div className="flex justify-between text-[10px] font-bold text-slate-500">
                            <span>البنود المكتملة: {completedItemsCount} من {totalItemsCount}</span>
                            <span>مدفوع للمقاول: {paidPercentage}%</span>
                          </div>
                        </div>

                        {/* Financial Figures */}
                        <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-slate-200 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[9px] font-sans font-bold">المتفق عليه:</span>
                            <span className="font-extrabold text-slate-900">{p.totalAgreedPrice.toLocaleString('ar-AE')}</span>
                          </div>
                          <div>
                            <span className="text-emerald-700 block text-[9px] font-sans font-bold">المدفوع:</span>
                            <span className="font-extrabold text-emerald-600">{paidSum.toLocaleString('ar-AE')}</span>
                          </div>
                          <div>
                            <span className="text-red-600 block text-[9px] font-sans font-bold">المتبقي:</span>
                            <span className="font-extrabold text-red-600">{remainingSum.toLocaleString('ar-AE')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 no-print">
                  <div className="text-[11px] text-slate-500 font-bold">عدد البنود: {p.items ? p.items.length : 0}</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingProject(p)}
                      className="px-3 py-1 bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>تفاصيل البنود</span>
                    </button>
                    
                    <ActionMenu
                      items={[
                        {
                          label: 'عرض التفاصيل والبنود',
                          icon: <Eye className="w-4 h-4 text-emerald-600" />,
                          onClick: () => setViewingProject(p)
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

      {/* View Project Details Modal */}
      {viewingProject && !isPreviewModalOpen && (
        <Modal
          isOpen={!!viewingProject}
          onClose={() => setViewingProject(null)}
          title={`كشف بنود مشروع: ${viewingProject.name}`}
          maxWidth="max-w-3xl"
        >
          <div className="space-y-4">
            {/* Top Project Info & Progress Bar */}
            {(() => {
              const totalItemsCount = viewingProject.items ? viewingProject.items.length : 0;
              const completedItems = viewingProject.items ? viewingProject.items.filter(i => i.status === 'مكتمل') : [];
              const completedItemsCount = completedItems.length;
              const completedValue = viewingProject.items ? completedItems.reduce((s, i) => s + i.value, 0) : 0;
              const completionPercentage = viewingProject.totalAgreedPrice > 0 
                ? Math.min(100, Math.round((completedValue / viewingProject.totalAgreedPrice) * 100)) 
                : (totalItemsCount > 0 ? Math.round((completedItemsCount / totalItemsCount) * 100) : 0);
              const remainingPercentage = Math.max(0, 100 - completionPercentage);

              return (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <span className="text-slate-500 font-bold block">المالك:</span>
                      <span className="font-bold text-slate-900">{viewingProject.ownerName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">شركة المقاول:</span>
                      <span className="font-bold text-slate-900">{viewingProject.contractorCompany}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">المنطقة والقطعة:</span>
                      <span className="font-bold text-slate-900">{viewingProject.area} (قطعة {viewingProject.plotNumber})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-bold block">السعر الكلي المتفق عليه:</span>
                      <span className="font-extrabold text-slate-900 font-mono">{viewingProject.totalAgreedPrice.toLocaleString('ar-AE')} درهم</span>
                    </div>
                  </div>

                  {/* Interactive Dual-Color Progress Bar */}
                  <div className="pt-2 border-t border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>مؤشر التقدم العام والإنجاز الفعلي:</span>
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-mono font-black text-xs">
                          {completionPercentage}% منفذ
                        </span>
                        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded-md font-mono font-black text-xs">
                          {remainingPercentage}% متبقي
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200 h-4.5 rounded-full overflow-hidden p-0.5 border border-slate-300 flex relative shadow-inner">
                      <div 
                        className="bg-gradient-to-r from-emerald-600 to-emerald-500 h-full rounded-full transition-all duration-500 flex items-center justify-center text-[10px] font-black text-white font-mono shadow-xs"
                        style={{ width: `${completionPercentage}%` }}
                      >
                        {completionPercentage >= 10 && `${completionPercentage}%`}
                      </div>
                      <div 
                        className="bg-amber-400/90 h-full rounded-full transition-all duration-500 flex items-center justify-center text-[10px] font-black text-amber-950 font-mono"
                        style={{ width: `${remainingPercentage}%` }}
                      >
                        {remainingPercentage >= 10 && `${remainingPercentage}%`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs">بنود الإنجاز والسداد التفصيلية (يمكنك النقر لتغيير حالة التنفيذ):</h4>
            </div>

            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="p-2.5">البند</th>
                    <th className="p-2.5">قيمة البند</th>
                    <th className="p-2.5">المبلغ المدفوع</th>
                    <th className="p-2.5">حالة التنفيذ والسداد</th>
                    <th className="p-2.5">تحديث الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {viewingProject.items?.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-900">{item.name}</td>
                      <td className="p-2.5 font-mono">{item.value.toLocaleString('ar-AE')} درهم</td>
                      <td className="p-2.5 font-mono font-bold text-emerald-600">{item.paidAmount.toLocaleString('ar-AE')} درهم</td>
                      <td className="p-2.5">
                        <div className="space-y-0.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.status === 'مكتمل' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {item.status}
                          </span>
                          {item.status === 'مكتمل' && (
                            <div className="text-[10px] font-mono text-emerald-700 font-bold">
                              تاريخ السداد: {formatCompletionDateTime(item.completedAt, item.date)}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5">
                        <button
                          type="button"
                          onClick={() => {
                            const newStatus = item.status === 'مكتمل' ? 'قيد التنفيذ' : 'مكتمل';
                            const updatedItems = viewingProject.items.map(it => 
                              it.id === item.id 
                                ? { ...it, status: newStatus, completedAt: newStatus === 'مكتمل' ? new Date().toISOString() : undefined }
                                : it
                            );
                            const updatedProject = { ...viewingProject, items: updatedItems };
                            onUpdateProject(updatedProject);
                            setViewingProject(updatedProject);
                          }}
                          className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                            item.status === 'مكتمل'
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {item.status === 'مكتمل' ? 'تغيير إلى قيد التنفيذ' : 'تحديد كمكتمل ✓'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                  onClick={() => window.print()}
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

      {/* Dedicated Single Ongoing Project Professional Printable Report Document */}
      {viewingProject && (
        <ProjectPrintTemplate
          project={viewingProject}
          settings={settings}
        />
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'تعديل مشروع المقاول' : 'إنشاء مشروع مقاول جديد'}
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
                placeholder="مثال: صيانة وتطوير بناية الريم"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم شركة المقاول *</label>
              <input
                type="text"
                value={contractorCompany}
                onChange={(e) => setContractorCompany(e.target.value)}
                placeholder="شركة الإنجاز للمقاولات"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم مالك العقار *</label>
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
              <label className="block text-xs font-bold text-slate-700 mb-1">السعر الإجمالي المتفق عليه (درهم) *</label>
              <input
                type="number"
                value={totalAgreedPrice}
                onChange={(e) => setTotalAgreedPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0.00"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ الاتفاق *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Items breakdown list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-700">بنود المشروع المتفق عليها مع المقاول:</label>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="px-3 py-1 bg-slate-900 text-amber-400 font-bold text-xs rounded hover:bg-slate-800"
              >
                + إضافة بند جديد
              </button>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto p-1">
              {items.map((item, idx) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-5 gap-2 items-center text-xs">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                    placeholder="اسم البند"
                    className="md:col-span-2 px-2 py-1.5 bg-white border border-slate-300 rounded font-medium"
                    required
                  />
                  <input
                    type="number"
                    value={item.value}
                    onChange={(e) => handleItemChange(idx, 'value', Number(e.target.value))}
                    placeholder="القيمة"
                    className="px-2 py-1.5 bg-white border border-slate-300 rounded font-mono font-bold"
                    required
                  />
                  <input
                    type="number"
                    value={item.paidAmount}
                    onChange={(e) => handleItemChange(idx, 'paidAmount', Number(e.target.value))}
                    placeholder="المدفوع"
                    className="px-2 py-1.5 bg-white border border-slate-300 rounded font-mono text-emerald-600 font-bold"
                  />
                  <div className="flex items-center gap-1">
                    <select
                      value={item.status}
                      onChange={(e) => handleItemChange(idx, 'status', e.target.value)}
                      className="px-2 py-1.5 bg-white border border-slate-300 rounded font-bold text-[11px]"
                    >
                      <option value="قيد التنفيذ">قيد التنفيذ</option>
                      <option value="مكتمل">مكتمل ومستلم</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveItemRow(idx)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات المشروع</label>
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
              {editingProject ? 'حفظ التعديلات' : 'حفظ المشروع'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteProject(deleteId);
        }}
        title="حذف المشروع"
        message="هل أنت أكتأد من حذف سجل هذا المشروع وبنوده؟"
      />
    </div>
  );
};
