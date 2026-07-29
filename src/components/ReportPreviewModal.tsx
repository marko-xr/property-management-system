import React, { useState, useEffect } from 'react';
import { Project, ExecutedProject, OfficeSettings } from '../types';
import { Modal } from './Modal';
import { ProjectPrintTemplate } from './ProjectPrintTemplate';
import { Printer, Eye, Settings2, RotateCcw, CheckSquare, Square, FileText, Type } from 'lucide-react';
import { printTarget } from '../utils/printUtils';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | ExecutedProject | null;
  settings: OfficeSettings;
}

export const ReportPreviewModal: React.FC<ReportPreviewModalProps> = ({
  isOpen,
  onClose,
  project,
  settings,
}) => {
  if (!project) return null;

  const isExecuted = 'costItems' in project;

  const defaultTitle = isExecuted
    ? 'تقرير وتكاليف مشروع'
    : 'تقرير ومتابعة تكاليف مشروع تحت التنفيذ';

  const [customTitle, setCustomTitle] = useState<string>(defaultTitle);
  const [customNotes, setCustomNotes] = useState<string>(project.notes || '');

  // Visibility toggles
  const [showHeader, setShowHeader] = useState<boolean>(true);
  const [showBasicInfo, setShowBasicInfo] = useState<boolean>(true);
  const [showItemsTable, setShowItemsTable] = useState<boolean>(true);
  const [showPaidColumn, setShowPaidColumn] = useState<boolean>(true);
  const [showFinancialSummary, setShowFinancialSummary] = useState<boolean>(true);
  const [showNotesSection, setShowNotesSection] = useState<boolean>(true);
  const [showSignatures, setShowSignatures] = useState<boolean>(true);

  // Panel state
  const [showControls, setShowControls] = useState<boolean>(true);

  // Sync when project changes
  useEffect(() => {
    if (project) {
      const initTitle = isExecuted
        ? 'تقرير وتكاليف مشروع'
        : 'تقرير ومتابعة تكاليف مشروع تحت التنفيذ';
      setCustomTitle(initTitle);
      setCustomNotes(project.notes || '');
    }
  }, [project, isExecuted]);

  const handleReset = () => {
    setCustomTitle(defaultTitle);
    setCustomNotes(project.notes || '');
    setShowHeader(true);
    setShowBasicInfo(true);
    setShowItemsTable(true);
    setShowPaidColumn(true);
    setShowFinancialSummary(true);
    setShowNotesSection(true);
    setShowSignatures(true);
  };

  const handlePrint = () => printTarget('.project-preview-print-report');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="معاينة التقرير وتخصيص خيارات الطباعة"
      maxWidth="max-w-6xl"
    >
      <div className="space-y-4 text-right dir-rtl font-sans">
        {/* Top Control Bar & Action Ribbon */}
        <div className="bg-slate-900 text-white p-3.5 rounded-xl flex items-center justify-between gap-3 shadow-md flex-wrap">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-amber-400/20 text-amber-400 rounded-lg">
              <Eye className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-sm text-slate-100">
                معاينة التقرير النهائي للمشروع: <span className="text-amber-400">{project.name}</span>
              </h3>
              <p className="text-[11px] text-slate-400">
                يمكنك التعديل على العناوين، وإضافة ملاحظات الكشف، واختيار العناصر الظاهرة قبل الطباعة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowControls(!showControls)}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors cursor-pointer border ${
                showControls
                  ? 'bg-amber-400 text-slate-950 border-amber-400'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Settings2 className="w-4 h-4" />
              <span>{showControls ? 'إخفاء أدوات التحكم' : 'تعديل وتخصيص الكشف'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-lg text-xs cursor-pointer shadow-md transition-transform active:scale-95"
            >
              <Printer className="w-4.5 h-4.5 text-slate-950" />
              <span>طباعة التقرير الان / حفظ PDF</span>
            </button>
          </div>
        </div>

        {/* Customization Options Box */}
        {showControls && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4 text-xs transition-all shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-sm">
                <Settings2 className="w-4 h-4 text-amber-600" />
                <span>خيارات تخصيص العناوين والمكونات الظاهرة في الكشف:</span>
              </div>
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-md font-bold cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الافتراضي</span>
              </button>
            </div>

            {/* Inputs Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-800 font-bold mb-1.5 flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-slate-600" />
                  عنوان التقرير الرئيسي:
                </label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="أدخل عنوان التقرير..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-800 font-bold mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-600" />
                  ملاحظات الكشف والتقرير:
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  rows={2}
                  placeholder="اكتب أي ملاحظات أو شروط خاصة بالكشف للطباعة..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900 font-normal focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
                />
              </div>
            </div>

            {/* Visibility Checkboxes Section */}
            <div>
              <label className="block text-slate-800 font-bold mb-2">
                تحديد المكونات والأقسام المراد إظهارها في التقرير:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showHeader}
                    onChange={(e) => setShowHeader(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                  />
                  <span className="font-bold text-slate-800 text-[11px]">رأس التقرير وشعار المكتب</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showBasicInfo}
                    onChange={(e) => setShowBasicInfo(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                  />
                  <span className="font-bold text-slate-800 text-[11px]">البيانات الأساسية للمشروع</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showItemsTable}
                    onChange={(e) => setShowItemsTable(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                  />
                  <span className="font-bold text-slate-800 text-[11px]">جدول بنود التكلفة والإنجاز</span>
                </label>

                {!isExecuted && (
                  <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
                    <input
                      type="checkbox"
                      checked={showPaidColumn}
                      onChange={(e) => setShowPaidColumn(e.target.checked)}
                      className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                    />
                    <span className="font-bold text-slate-800 text-[11px]">عمود المبالغ المسددة</span>
                  </label>
                )}

                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showFinancialSummary}
                    onChange={(e) => setShowFinancialSummary(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                  />
                  <span className="font-bold text-slate-800 text-[11px]">جدول الملخص المالي</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showNotesSection}
                    onChange={(e) => setShowNotesSection(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                  />
                  <span className="font-bold text-slate-800 text-[11px]">ملاحظات الكشف والتقرير</span>
                </label>

                <label className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100/70 transition-colors">
                  <input
                    type="checkbox"
                    checked={showSignatures}
                    onChange={(e) => setShowSignatures(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 cursor-pointer rounded"
                  />
                  <span className="font-bold text-slate-800 text-[11px]">جدول الاعتماد والتواقييع</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Paper Document Preview Container */}
        <div className="bg-slate-200/80 border border-slate-300 p-4 sm:p-6 rounded-xl max-h-[60vh] overflow-y-auto space-y-2 shadow-inner">
          <div className="text-center text-slate-500 text-[11px] font-bold mb-2 flex items-center justify-center gap-1.5">
            <span>صفحة معاينة الورقة المطبوعة (A4 Portrait)</span>
          </div>

          <ProjectPrintTemplate
            project={project}
            settings={settings}
            customTitle={customTitle}
            customNotes={customNotes}
            showBasicInfo={showBasicInfo}
            showItemsTable={showItemsTable}
            showPaidColumn={showPaidColumn}
            showFinancialSummary={showFinancialSummary}
            showNotesSection={showNotesSection}
            showSignatures={showSignatures}
            showHeader={showHeader}
            forScreenPreview={true}
          />
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200 pt-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-black rounded-lg text-xs cursor-pointer shadow-md transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>إرسال إلى الطابعة / حفظ PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs hover:bg-slate-100 cursor-pointer transition-colors"
          >
            إغلاق
          </button>
        </div>

        {/* Hidden Printable Version synced with user options */}
        <ProjectPrintTemplate
          project={project}
          settings={settings}
          customTitle={customTitle}
          customNotes={customNotes}
          showBasicInfo={showBasicInfo}
          showItemsTable={showItemsTable}
          showPaidColumn={showPaidColumn}
          showFinancialSummary={showFinancialSummary}
          showNotesSection={showNotesSection}
          showSignatures={showSignatures}
          showHeader={showHeader}
          forScreenPreview={false}
          printClassName="project-preview-print-report"
        />
      </div>
    </Modal>
  );
};
