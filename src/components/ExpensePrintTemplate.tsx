import React from 'react';
import { createPortal } from 'react-dom';
import { Expense, OfficeSettings } from '../types';
import { formatArabicMonthYear } from '../utils/dateUtils';
import companyLogo from '../../logo.jpeg';
import { CompactPrintTable } from './ProfessionalPrintReport';

interface ExpensePrintTemplateProps {
  filteredExpenses: Expense[];
  settings: OfficeSettings;
  searchTerm: string;
  selectedCategory: string;
  selectedPaymentMethod: string;
  selectedResponsible: string;
  selectedMonth: string;
  startDate: string;
  endDate: string;
  minAmount: number | '';
  maxAmount: number | '';
  totalFiltered: number;
}

export const ExpensePrintTemplate: React.FC<ExpensePrintTemplateProps> = ({
  filteredExpenses,
  settings,
  searchTerm,
  selectedCategory,
  selectedPaymentMethod,
  selectedResponsible,
  selectedMonth,
  startDate,
  endDate,
  minAmount,
  maxAmount,
  totalFiltered,
}) => {
  const now = new Date();
  const currentDateStr = now.toLocaleDateString('ar-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const reportNumber = `EXP-${now.toISOString().slice(0, 10).replaceAll('-', '')}`;

  const periodLabel = selectedMonth
    ? formatArabicMonthYear(selectedMonth)
    : startDate || endDate
      ? `من ${startDate || 'البداية'} إلى ${endDate || 'اليوم'}`
      : 'جميع الفترات المسجلة';

  const activeFilters = [
    searchTerm.trim() ? ['البحث', searchTerm.trim()] : null,
    selectedCategory !== 'ALL' ? ['نوع المصروف', selectedCategory] : null,
    selectedPaymentMethod !== 'ALL' ? ['طريقة الدفع', selectedPaymentMethod] : null,
    selectedResponsible !== 'ALL' ? ['المسؤول عن الصرف', selectedResponsible] : null,
    selectedMonth ? ['الشهر المحدد', formatArabicMonthYear(selectedMonth)] : null,
    startDate ? ['الفترة من', startDate] : null,
    endDate ? ['الفترة إلى', endDate] : null,
    minAmount !== '' ? ['الحد الأدنى للمبلغ', `${Number(minAmount).toLocaleString('ar-AE')} درهم`] : null,
    maxAmount !== '' ? ['الحد الأعلى للمبلغ', `${Number(maxAmount).toLocaleString('ar-AE')} درهم`] : null,
  ].filter((item): item is string[] => item !== null);

  const subtitle = selectedCategory !== 'ALL'
    ? `كشف مصروفات فئة ${selectedCategory}`
    : selectedMonth || startDate || endDate
      ? `كشف المصروفات للفترة ${periodLabel}`
      : 'كشف سجل المصروفات';

  const report = (
    <div className="expense-print-wrapper expense-print-report professional-print-report print-report" dir="rtl">
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

      <section className="report-title-section">
        <div className="report-title-content">
          <h1>تقرير المصروفات والنفقات</h1>
          <h2>{subtitle}</h2>
        </div>

        <div className="report-title-divider" />

        <div className="report-meta-row">
          <div className="report-meta-item">
            <strong>رقم الكشف:</strong>
            <span dir="ltr">{reportNumber}</span>
          </div>
          <span className="report-meta-separator">•</span>
          <div className="report-meta-item">
            <strong>تاريخ الإصدار:</strong>
            <span>{currentDateStr}</span>
          </div>
          <span className="report-meta-separator">•</span>
          <div className="report-meta-item">
            <strong>الفترة:</strong>
            <span>{periodLabel}</span>
          </div>
          <span className="report-meta-separator">•</span>
          <div className="report-meta-item">
            <strong>عدد السجلات:</strong>
            <span>{filteredExpenses.length.toLocaleString('ar-AE')}</span>
          </div>
        </div>
      </section>

      <section className="expense-filter-section">
        <h3 className="print-section-heading">بيانات الكشف والفلاتر</h3>
        <table className="project-info-table expense-filter-summary-table">
          <tbody>
            {activeFilters.length > 0 ? (
              activeFilters.map(([label, value]) => (
                <tr key={label}>
                  <th>{label}</th>
                  <td>{value}</td>
                </tr>
              ))
            ) : (
              <tr>
                <th>نطاق الكشف</th>
                <td>جميع السجلات</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="expense-details-section">
        <h3 className="print-section-heading">
          أولًا: تفاصيل المصروفات والنفقات
        </h3>
        {filteredExpenses.length === 0 ? (
          <div className="expense-empty-state">
            لا توجد مصروفات مطابقة للمعايير المحددة.
          </div>
        ) : (
          <CompactPrintTable<Expense>
            records={filteredExpenses}
            getRowKey={expense => expense.id}
            columns={[
              { key: 'index', label: '#', width: '4%', render: (_, index) => index + 1 },
              { key: 'date', label: 'التاريخ', width: '10%', render: expense => expense.date },
              { key: 'category', label: 'نوع المصروف', width: '12%', render: expense => expense.category },
              { key: 'details', label: 'البيان / الوصف', width: '22%', render: expense => expense.details },
              { key: 'payment', label: 'طريقة الدفع', width: '10%', render: expense => expense.paymentMethod },
              { key: 'responsible', label: 'المستفيد / المسؤول', width: '14%', render: expense => expense.responsible },
              { key: 'reference', label: 'رقم المرجع', width: '10%', render: expense => expense.reference },
              { key: 'amount', label: 'المبلغ', width: '10%', render: expense => <span dir="ltr">{expense.amount.toLocaleString('ar-AE')} درهم</span> },
              { key: 'notes', label: 'الملاحظات', width: '8%', render: expense => expense.notes },
            ]}
          />
        )}
      </section>

      <section className="summary-section">
        <h3 className="print-section-heading">ثانيًا: الملخص المالي</h3>
        <table className="expense-summary-table">
          <tbody>
            <tr>
              <th>إجمالي عدد المصروفات</th>
              <td>{filteredExpenses.length.toLocaleString('ar-AE')}</td>
            </tr>
            <tr>
              <th>إجمالي قيمة المصروفات</th>
              <td dir="ltr">{totalFiltered.toLocaleString('ar-AE')} درهم</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  );

  return createPortal(report, document.body);
};
