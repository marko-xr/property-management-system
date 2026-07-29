import React from 'react';
import { createPortal } from 'react-dom';
import { Project, ExecutedProject, OfficeSettings } from '../types';
import { EmaratekLogo } from './EmaratekLogo';
import companyLogo from '../../logo.jpeg';

export interface ProjectPrintTemplateProps {
  project: Project | ExecutedProject;
  settings: OfficeSettings;
  customTitle?: string;
  customNotes?: string;
  showBasicInfo?: boolean;
  showItemsTable?: boolean;
  showPaidColumn?: boolean;
  showFinancialSummary?: boolean;
  showNotesSection?: boolean;
  showSignatures?: boolean;
  showHeader?: boolean;
  forScreenPreview?: boolean;
  printClassName?: string;
}

export const ProjectPrintTemplate: React.FC<ProjectPrintTemplateProps> = ({
  project,
  settings,
  customTitle,
  customNotes,
  showBasicInfo = true,
  showItemsTable = true,
  showPaidColumn = true,
  showFinancialSummary = true,
  showNotesSection = true,
  showSignatures = true,
  showHeader = true,
  forScreenPreview = false,
  printClassName = '',
}) => {
  // Determine project type (ExecutedProject has 'costItems', Project has 'items')
  const isExecuted = 'costItems' in project;
  const executedProject = isExecuted ? (project as ExecutedProject) : null;
  const ongoingProject = !isExecuted ? (project as Project) : null;

  // Normalized items array
  interface NormalizedItem {
    id: string;
    name: string;
    value: number;
    date: string;
    notes?: string;
    paidAmount?: number;
  }

  const costItems: NormalizedItem[] = isExecuted
    ? (executedProject?.costItems || []).map((ci) => ({
        id: ci.id,
        name: ci.name,
        value: ci.value,
        date: ci.date,
        notes: ci.notes,
      }))
    : (ongoingProject?.items || []).map((item) => ({
        id: item.id,
        name: item.name,
        value: item.value,
        date: item.date,
        notes: item.notes || (item.status === 'مكتمل' ? 'مكتمل' : 'قيد التنفيذ'),
        paidAmount: item.paidAmount,
      }));

  // Calculations
  const totalCost = costItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0);
  const totalPaid = !isExecuted
    ? costItems.reduce((sum, item) => sum + (Number(item.paidAmount) || 0), 0)
    : 0;

  const sellingPrice = isExecuted
    ? Number(executedProject?.sellingPrice) || 0
    : Number(ongoingProject?.totalAgreedPrice) || 0;

  const netProfit = sellingPrice - totalCost;
  const isLoss = netProfit < 0;

  const currentDateStr = new Date().toLocaleDateString('ar-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Contractor / Type field
  const contractorOrType = isExecuted
    ? executedProject?.type || 'تطوير عقاري'
    : ongoingProject?.contractorCompany || 'شركة المقاولات';

  // Dates
  const startDate = isExecuted
    ? executedProject?.startDate || executedProject?.date || '-'
    : ongoingProject?.date || '-';

  const endDateOrSaleDate = isExecuted
    ? executedProject?.saleDate || 'غير مباع / قيد التطوير'
    : 'قيد التنفيذ والمتابعة';

  const defaultTitle = isExecuted
    ? 'تقرير وتكاليف مشروع'
    : 'تقرير ومتابعة تكاليف مشروع تحت التنفيذ';

  const wrapperClass = forScreenPreview
    ? 'bg-white text-slate-900 p-6 shadow-md rounded-lg border border-slate-300 w-full text-xs text-right dir-rtl font-sans my-2'
    : `project-print-wrapper ${printClassName} print-report hidden print:block text-right dir-rtl font-sans bg-white text-slate-900 leading-normal text-xs`;

  const report = (
    <div className={wrapperClass}>
      {!forScreenPreview && (
        <header className="print-letterhead">
          <div className="print-letterhead-en" dir="ltr">
            <div className="print-letterhead-name">EMARATEK REAL ESTATE</div>
            <div className="print-letterhead-location">
              Ajman - Al Jurf - McDonald's Roundabout
            </div>
          </div>

          <div className="print-letterhead-logo">
            <img src={companyLogo} alt="شعار إماراتك العقارية" />
          </div>

          <div className="print-letterhead-ar" dir="rtl">
            <div className="print-letterhead-name">إماراتك العقارية</div>
            <div className="print-letterhead-location">
              {settings.address || 'عجمان - الجرف - دوار ماكدونالدز'}
            </div>
          </div>
        </header>
      )}

      {/* 1. Official Top Company Banner */}
      {forScreenPreview && showHeader && (
        <>
          <div className="mb-3">
            <EmaratekLogo className="w-full h-14 border-2 border-slate-900 rounded-lg" />
          </div>

          {/* Sub Header Information Row */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-700 pb-2 mb-4 border-b border-slate-300">
            <div>
              <span>العنوان: {settings.address || 'عجمان - الجرف - دوار ماكدونالدز'}</span>
              <span className="mx-2">|</span>
              <span>البريد: {settings.email || 'emaratekrealestate@gmail.com'}</span>
              <span className="mx-2">|</span>
              <span>الهاتف: {settings.phone || '0000 740 6 971+'}</span>
            </div>
            <div>
              <span>تاريخ الطباعة: {currentDateStr}</span>
            </div>
          </div>
        </>
      )}

      {/* 2. Document Title Box */}
      <div className="report-title-section mb-5 p-3 bg-slate-100 rounded-lg border border-slate-300 text-center">
        <div className="report-title-content">
          <h1 className="text-lg font-black text-slate-900 tracking-tight mb-1">
            {customTitle || defaultTitle}
          </h1>
          <h2 className="text-sm font-bold text-slate-800 mb-2">
            {project.name}
          </h2>
        </div>

        <div className="report-title-divider" />

        <div className="report-meta-row flex items-center justify-center gap-4 text-[11px] font-medium text-slate-700 flex-wrap">
          <div className="report-meta-item">
            <strong>رقم التقرير:</strong>
            <span className="font-mono text-slate-900">
              PRJ-{project.id ? project.id.slice(-6).toUpperCase() : '001'}
            </span>
          </div>
          <span className="report-meta-separator">•</span>
          <div className="report-meta-item">
            <strong>تاريخ الإصدار:</strong>
            <span className="font-mono text-slate-900">{currentDateStr}</span>
          </div>
          <span className="report-meta-separator">•</span>
          <div className="report-meta-item">
            <strong>حالة المشروع:</strong>
            <span className="text-slate-900">
              {isExecuted
                ? executedProject?.saleDate ? 'مباع ومكتمل' : 'منفذ / قيد المتابعة'
                : 'تحت التنفيذ'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Basic Information (بيانات المشروع الأساسية) */}
      {showBasicInfo && (
        forScreenPreview ? (
          <section className="project-info-section mb-5 print-section">
          <h3 className="print-section-title font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
            بيانات المشروع الأساسية:
          </h3>
          <div className="project-info-wrapper border border-slate-300 rounded-lg overflow-hidden bg-white text-xs">
            <table className="w-full text-right border-collapse">
              <tbody>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                    اسم المشروع:
                  </td>
                  <td className="p-2.5 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                    {project.name}
                  </td>
                  <td className="p-2.5 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                    اسم المالك:
                  </td>
                  <td className="p-2.5 font-bold text-slate-900 w-1/4">
                    {project.ownerName}
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                    المنطقة والقطعة:
                  </td>
                  <td className="p-2.5 text-slate-800 border-l border-slate-200">
                    {project.area} {project.plotNumber ? `(قطعة ${project.plotNumber})` : ''}
                  </td>
                  <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                    {isExecuted ? 'نوع المشروع:' : 'شركة المقاولات / المنفذ:'}
                  </td>
                  <td className="p-2.5 text-slate-800">
                    {contractorOrType}
                  </td>
                </tr>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                    تاريخ البدء / التسجيل:
                  </td>
                  <td className="p-2.5 font-mono text-slate-900 border-l border-slate-200">
                    {startDate}
                  </td>
                  <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                    {isExecuted ? 'تاريخ البيع النهائي:' : 'حالة المشروع الحالية:'}
                  </td>
                  <td className="p-2.5 text-slate-900 font-bold">
                    {endDateOrSaleDate}
                  </td>
                </tr>
                {project.notes && (
                  <tr className="bg-white">
                    <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                      تفاصيل / وصف المشروع:
                    </td>
                    <td colSpan={3} className="p-2.5 text-slate-800">
                      {project.notes}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
        ) : (
          <>
            <section className="project-info-section mb-5 print-section">
              <h3 className="print-section-title">بيانات المشروع الأساسية</h3>
              <table className="project-info-table">
                <tbody>
                  <tr>
                    <th>اسم المشروع</th>
                    <td>{project.name}</td>
                  </tr>
                  <tr>
                    <th>اسم المالك</th>
                    <td>{project.ownerName}</td>
                  </tr>
                  <tr>
                    <th>المنطقة والقطعة</th>
                    <td>
                      {project.area} {project.plotNumber ? `- قطعة ${project.plotNumber}` : ''}
                    </td>
                  </tr>
                  <tr>
                    <th>{isExecuted ? 'نوع المشروع' : 'شركة المقاولات / المنفذ'}</th>
                    <td>{contractorOrType}</td>
                  </tr>
                  <tr>
                    <th>تفاصيل / وصف المشروع</th>
                    <td>{project.notes || '—'}</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section className="project-status-section mb-5 print-section">
              <table className="project-status-table">
                <thead>
                  <tr className="table-section-title-row">
                    <th colSpan={2} className="table-section-title">
                      التواريخ وحالة المشروع
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th>تاريخ البدء / التسجيل</th>
                    <td>{startDate}</td>
                  </tr>
                  <tr>
                    <th>حالة المشروع / البيع</th>
                    <td>
                      {isExecuted
                        ? executedProject?.saleDate ? 'مباع ومكتمل' : 'غير مباع / قيد التطوير'
                        : 'تحت التنفيذ والمتابعة'}
                    </td>
                  </tr>
                  <tr>
                    <th>تاريخ البيع النهائي</th>
                    <td>{isExecuted && executedProject?.saleDate ? executedProject.saleDate : 'غير محدد'}</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </>
        )
      )}

      {/* 4. Items Table (جدول بنود التكلفة الإجمالية / بنود التنفيذ) */}
      {showItemsTable && (
        <section className="project-costs-section mb-5 print-section">
          {forScreenPreview && (
            <h3 className="print-section-title font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
              {isExecuted ? 'أولاً: بنود التكلفة الإجمالية للمشروع' : 'أولاً: جدول بنود الإنجاز والدفعات الإنشائية'}
            </h3>
          )}
          <div className="report-table-wrapper border border-slate-300 rounded-lg overflow-hidden">
            <table className="cost-table w-full text-right text-xs border-collapse">
              <thead>
                {!forScreenPreview && (
                  <tr className="table-section-title-row">
                    <th
                      colSpan={isExecuted ? 5 : (showPaidColumn ? 6 : 5)}
                      className="table-section-title"
                    >
                      {isExecuted ? 'أولاً: بنود التكلفة الإجمالية للمشروع' : 'أولاً: جدول بنود الإنجاز والدفعات الإنشائية'}
                    </th>
                  </tr>
                )}
                <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                  <th className="p-2.5 border-l border-slate-300 text-center w-12">#</th>
                  <th className="p-2.5 border-l border-slate-300 text-right">البند والتفاصيل</th>
                  <th className="p-2.5 border-l border-slate-300 text-center w-36">القيمة (بالدرهم)</th>
                  {!isExecuted && showPaidColumn && (
                    <th className="p-2.5 border-l border-slate-300 text-center w-32">المسدد (بالدرهم)</th>
                  )}
                  <th className="p-2.5 border-l border-slate-300 text-center w-28">التاريخ</th>
                  <th className="p-2.5 text-right">الملاحظات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                {costItems && costItems.length > 0 ? (
                  costItems.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50">
                      <td className="p-2.5 border-l border-slate-200 text-center font-bold font-mono text-slate-700">
                        {idx + 1}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 font-bold text-slate-900">
                        {item.name}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold text-slate-900 dir-ltr whitespace-nowrap">
                        {item.value.toLocaleString('ar-AE')} درهم
                      </td>
                      {!isExecuted && showPaidColumn && (
                        <td className="p-2.5 border-l border-slate-200 text-center font-mono text-slate-900 dir-ltr whitespace-nowrap">
                          {(item.paidAmount || 0).toLocaleString('ar-AE')} درهم
                        </td>
                      )}
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono text-slate-700 whitespace-nowrap">
                        {item.date || '-'}
                      </td>
                      <td className="p-2.5 text-slate-700">
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isExecuted ? 5 : (showPaidColumn ? 6 : 5)} className="p-4 text-center text-slate-500 italic">
                      لا توجد بنود تفصيلية مسجلة.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 5. Financial Summary (الملخص المالي للمشروع) */}
      {showFinancialSummary && (
        <section className="summary-section mb-5 summary-table-box print-section">
          <h3 className="print-section-title font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
            الملخص المالي للمشروع
          </h3>
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs bg-slate-50">
            <table className="w-full text-right border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-900">
                    {isExecuted ? 'إجمالي تكاليف المشروع:' : 'إجمالي المبالغ المستحقة للبنود:'}
                  </td>
                  <td className="p-2.5 font-mono font-bold text-left text-slate-900 text-sm whitespace-nowrap">
                    {totalCost.toLocaleString('ar-AE')} درهم
                  </td>
                </tr>
                {!isExecuted && showPaidColumn && (
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold text-slate-900">
                      إجمالي المبالغ المسددة بالفعل:
                    </td>
                    <td className="p-2.5 font-mono font-bold text-left text-emerald-800 text-sm whitespace-nowrap">
                      {totalPaid.toLocaleString('ar-AE')} درهم
                    </td>
                  </tr>
                )}
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-900">
                    {isExecuted ? 'سعر البيع المتوقع أو الإجمالي:' : 'السعر الكلي المتفق عليه للمشروع:'}
                  </td>
                  <td className="p-2.5 font-mono font-bold text-left text-slate-900 text-sm whitespace-nowrap">
                    {sellingPrice.toLocaleString('ar-AE')} درهم
                  </td>
                </tr>
                <tr className="bg-slate-200 font-black">
                  <td className="p-3 text-slate-900 text-sm">
                    {isExecuted
                      ? isLoss ? 'صافي الخسارة:' : 'صافي الربح / فائدة المالك:'
                      : 'المبلغ المتبقي غير المسدد:'}
                  </td>
                  <td className="p-3 font-mono text-left text-slate-950 text-base whitespace-nowrap">
                    {isExecuted
                      ? `${Math.abs(netProfit).toLocaleString('ar-AE')} درهم`
                      : `${(sellingPrice - totalPaid).toLocaleString('ar-AE')} درهم`}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Custom Report Notes Section */}
      {forScreenPreview && showNotesSection && (
        <section className="notes-section mb-5 print-section">
          <h3 className="print-section-title font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
            ملاحظات الكشف والتقرير:
          </h3>
          <div className="border border-slate-300 rounded-lg p-3 bg-slate-50 text-xs text-slate-800 whitespace-pre-wrap leading-relaxed min-h-[50px]">
            {customNotes && customNotes.trim() ? customNotes : 'لا توجد ملاحظات إضافية على هذا الكشف.'}
          </div>
        </section>
      )}

      {/* 6. Signatures Section (التوقيع والاعتماد الرسمي) */}
      {forScreenPreview && showSignatures && (
        <div className="signature-section mt-8 pt-4 border-t border-slate-300 text-xs print-section">
          <div className="grid grid-cols-4 gap-3 text-center font-bold text-slate-900 pt-2">
            <div>
              <p className="mb-8">إعداد التقرير</p>
              <p className="text-slate-400 font-normal">____________________</p>
            </div>
            <div>
              <p className="mb-8">اعتماد الإدارة</p>
              <p className="text-slate-400 font-normal">____________________</p>
            </div>
            <div>
              <p className="mb-8">التوقيع</p>
              <p className="text-slate-400 font-normal">____________________</p>
            </div>
            <div>
              <p className="mb-8">التاريخ</p>
              <p className="text-slate-400 font-normal">____________________</p>
            </div>
          </div>

          {/* Footer is retained in the screen preview only. */}
          {forScreenPreview && (
            <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-mono">
              <span>{settings.officeName || 'إماراتك العقارية'} - تقرير وتكاليف مشروع</span>
              <span>تاريخ الطباعة: {currentDateStr}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Render the print document outside modal and application layout constraints.
  return forScreenPreview ? report : createPortal(report, document.body);
};
