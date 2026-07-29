import React from 'react';
import { ExecutedProject, OfficeSettings } from '../types';

interface ExecutedProjectPrintReportProps {
  project: ExecutedProject;
  settings: OfficeSettings;
}

export const ExecutedProjectPrintReport: React.FC<ExecutedProjectPrintReportProps> = ({
  project,
  settings
}) => {
  // Financial calculations
  const totalItemsCost = project.costItems
    ? project.costItems.reduce((sum, item) => sum + (Number(item.value) || 0), 0)
    : 0;
  const sellingPrice = Number(project.sellingPrice) || 0;
  const netProfit = sellingPrice - totalItemsCost;
  const isLoss = netProfit < 0;

  const currentDateStr = new Date().toLocaleDateString('ar-AE', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <div className="executed-project-print-wrapper text-right dir-rtl font-sans bg-white text-black p-6 font-normal leading-relaxed">
      {/* 1. Header (رأس التقرير) */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-center justify-between gap-4 mb-3">
          {/* Right side: Office Info */}
          <div>
            <h2 className="font-extrabold text-sm text-slate-900">
              {settings.officeName || 'إماراتك العقارية'}
            </h2>
            <p className="text-[11px] text-slate-700 mt-0.5">
              {settings.address || 'عجمان - الإمارات العربية المتحدة'}
            </p>
            {settings.phone && (
              <p className="text-[11px] text-slate-700 font-mono">
                هاتف: {settings.phone}
              </p>
            )}
          </div>

          {/* Left side: Logo or B&W identifier */}
          <div className="text-left">
            {settings.officeLogo && settings.officeLogo.startsWith('http') ? (
              <img
                src={settings.officeLogo}
                alt={settings.officeName}
                className="h-12 w-auto object-contain grayscale"
              />
            ) : (
              <div className="border border-slate-900 px-3 py-1 font-black text-xs text-slate-900">
                {settings.officeName || 'إماراتك العقارية'}
              </div>
            )}
          </div>
        </div>

        {/* Main Title Centered */}
        <div className="text-center mt-3 pt-2 border-t border-slate-200">
          <h1 className="text-xl font-black text-black tracking-tight mb-1">
            تقرير وتكاليف مشروع
          </h1>
          <h2 className="text-base font-bold text-slate-900">
            {project.name}
          </h2>

          <div className="flex items-center justify-center gap-6 mt-3 text-xs text-slate-800 font-medium">
            <span>
              رقم التقرير:{' '}
              <strong className="font-mono text-black">
                PRJ-{project.id ? project.id.slice(-6).toUpperCase() : '001'}
              </strong>
            </span>
            <span>
              تاريخ إصدار التقرير:{' '}
              <strong className="font-mono text-black">{currentDateStr}</strong>
            </span>
            <span>
              حالة المشروع:{' '}
              <strong className="text-black">
                {project.saleDate ? 'مباع ومكتمل' : 'منفذ / قيد المتابعة'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Project Info Section (بيانات المشروع) */}
      <div className="project-info-grid mb-6 print-section">
        <h3 className="font-bold text-xs text-black mb-2 border-r-4 border-black pr-2">
          بيانات المشروع الأساسية:
        </h3>
        <div className="border border-slate-300 rounded overflow-hidden text-xs">
          <table className="w-full text-right border-collapse">
            <tbody>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                  اسم المشروع:
                </td>
                <td className="p-2.5 font-bold text-black w-1/4 border-l border-slate-200">
                  {project.name}
                </td>
                <td className="p-2.5 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                  اسم المالك:
                </td>
                <td className="p-2.5 font-bold text-black w-1/4">
                  {project.ownerName}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                  المنطقة والقطعة:
                </td>
                <td className="p-2.5 text-black border-l border-slate-200">
                  {project.area} {project.plotNumber ? `(قطعة ${project.plotNumber})` : ''}
                </td>
                <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                  نوع المشروع:
                </td>
                <td className="p-2.5 text-black">
                  {project.type || 'تطوير عقاري'}
                </td>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50">
                <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                  تاريخ بدء المشروع:
                </td>
                <td className="p-2.5 font-mono text-black border-l border-slate-200">
                  {project.startDate || project.date || '-'}
                </td>
                <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                  تاريخ البيع المتوقع / النهائي:
                </td>
                <td className="p-2.5 font-mono text-black">
                  {project.saleDate || 'غير مباع / قيد التطوير'}
                </td>
              </tr>
              {project.notes && (
                <tr className="bg-white">
                  <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                    ملاحظات وصفية:
                  </td>
                  <td colSpan={3} className="p-2.5 text-black">
                    {project.notes}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Cost Items Section (أولاً: بنود التكلفة الإجمالية للمشروع) */}
      <div className="mb-6 print-section">
        <h3 className="font-bold text-xs text-black mb-2 border-r-4 border-black pr-2">
          أولاً: بنود التكلفة الإجمالية للمشروع
        </h3>
        <div className="border border-slate-300 rounded overflow-hidden">
          <table className="cost-table w-full text-right text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 text-black font-bold border-b border-slate-300">
                <th className="p-2.5 border-l border-slate-300 text-center w-12">#</th>
                <th className="p-2.5 border-l border-slate-300 text-right">البند والتفاصيل</th>
                <th className="p-2.5 border-l border-slate-300 text-center w-36">قيمة البند بالدرهم</th>
                <th className="p-2.5 border-l border-slate-300 text-center w-28">التاريخ</th>
                <th className="p-2.5 text-right">الملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {project.costItems && project.costItems.length > 0 ? (
                project.costItems.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-slate-50">
                    <td className="p-2.5 border-l border-slate-300 text-center font-bold font-mono">
                      {idx + 1}
                    </td>
                    <td className="p-2.5 border-l border-slate-300 font-bold text-black">
                      {item.name}
                    </td>
                    <td className="p-2.5 border-l border-slate-300 text-center font-mono font-bold text-black dir-ltr">
                      {item.value.toLocaleString('ar-AE')} درهم
                    </td>
                    <td className="p-2.5 border-l border-slate-300 text-center font-mono text-slate-800">
                      {item.date || '-'}
                    </td>
                    <td className="p-2.5 text-slate-700">
                      {item.notes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-slate-500 italic">
                    لا توجد بنود تكلفة تفصيلية مسجلة.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Financial Summary Section (الملخص المالي للمشروع) */}
      <div className="mb-6 summary-table-box print-section">
        <h3 className="font-bold text-xs text-black mb-2 border-r-4 border-black pr-2">
          الملخص المالي للمشروع
        </h3>
        <div className="border-2 border-slate-900 rounded overflow-hidden text-xs bg-slate-50">
          <table className="w-full text-right border-collapse">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-3 font-bold text-slate-900">
                  إجمالي تكاليف المشروع:
                </td>
                <td className="p-3 font-mono font-bold text-left text-black text-sm">
                  {totalItemsCost.toLocaleString('ar-AE')} درهم
                </td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-3 font-bold text-slate-900">
                  سعر البيع المتوقع أو الإجمالي:
                </td>
                <td className="p-3 font-mono font-bold text-left text-black text-sm">
                  {sellingPrice.toLocaleString('ar-AE')} درهم
                </td>
              </tr>
              <tr className="bg-slate-200 font-black">
                <td className="p-3 text-slate-950 text-sm">
                  {isLoss ? 'صافي الخسارة:' : 'صافي الربح / فائدة المالك:'}
                </td>
                <td className="p-3 font-mono text-left text-slate-950 text-base">
                  {Math.abs(netProfit).toLocaleString('ar-AE')} درهم
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Notes & Signatures Section (الملاحظات والتوقيع) */}
      <div className="signature-section mt-8 pt-4 border-t border-slate-300 text-xs print-section">
        <div className="mb-6">
          <p className="font-bold text-black mb-1">ملاحظات عامة:</p>
          <div className="border-b border-dotted border-slate-400 h-6"></div>
          <div className="border-b border-dotted border-slate-400 h-6"></div>
        </div>

        <div className="grid grid-cols-4 gap-3 text-center font-bold text-black pt-4 border-t border-slate-200">
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

        {/* Footer */}
        <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-600 font-mono">
          <span>{settings.officeName || 'إماراتك العقارية'} - تقرير وتكاليف مشروع</span>
          <span>تاريخ الطباعة: {currentDateStr}</span>
        </div>
      </div>
    </div>
  );
};
