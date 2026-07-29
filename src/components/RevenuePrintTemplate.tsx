import React from 'react';
import { Revenue, OfficeSettings } from '../types';
import { formatArabicMonthYear, formatCompletionDateTime } from '../utils/dateUtils';
import { ProfessionalPrintReport } from './ProfessionalPrintReport';

interface Props {
  filteredRevenues: Revenue[]; settings: OfficeSettings; selectedEmployee: string;
  selectedType: string; selectedMonth: string; startDate: string; endDate: string;
  totalFiltered: number; employeePerformance: Array<{ emp: string; total: number }>;
}

export const RevenuePrintTemplate: React.FC<Props> = (props) => {
  const period = props.selectedMonth ? formatArabicMonthYear(props.selectedMonth)
    : props.startDate || props.endDate ? `من ${props.startDate || 'البداية'} إلى ${props.endDate || 'اليوم'}` : 'جميع الفترات';
  const filters = [
    props.selectedEmployee !== 'ALL' ? { label: 'الموظف', value: props.selectedEmployee } : null,
    props.selectedType !== 'ALL' ? { label: 'نوع الإيراد', value: props.selectedType } : null,
    props.selectedMonth || props.startDate || props.endDate ? { label: 'الفترة', value: period } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return <ProfessionalPrintReport<Revenue>
    wrapperClass="revenue-print-wrapper"
    settings={props.settings}
    title="تقرير الإيرادات والعمولات"
    subtitle={props.selectedEmployee !== 'ALL' ? `كشف إيرادات وعمولات الموظف ${props.selectedEmployee}` : `كشف الإيرادات والعمولات — ${period}`}
    reportPrefix="REV"
    filters={filters}
    sectionTitle="أولًا: تفاصيل الإيرادات والعمولات"
    columns={[
      { key: 'index', label: '#', width: '4%', render: (_, index) => index + 1 },
      { key: 'date', label: 'التاريخ', width: '11%', render: revenue => revenue.date },
      { key: 'employee', label: 'الموظف / الدافع', width: '14%', render: revenue => revenue.employeeName },
      { key: 'type', label: 'نوع الإيراد / العمولة', width: '14%', render: revenue => revenue.type },
      { key: 'details', label: 'البيان / الوصف', width: '24%', render: revenue => revenue.details },
      { key: 'amount', label: 'المبلغ', width: '12%', render: revenue => <span dir="ltr">{revenue.amount.toLocaleString('ar-AE')} درهم</span> },
      { key: 'received', label: 'تاريخ الاستلام', width: '11%', render: revenue => formatCompletionDateTime(revenue.completedAt, revenue.date) },
      { key: 'notes', label: 'الملاحظات', width: '10%', render: revenue => revenue.notes },
    ]}
    records={props.filteredRevenues}
    getRowKey={revenue => revenue.id}
    summary={[
      { label: 'إجمالي عدد السجلات', value: props.filteredRevenues.length.toLocaleString('ar-AE') },
      { label: 'إجمالي الإيرادات والعمولات', value: <span dir="ltr">{props.totalFiltered.toLocaleString('ar-AE')} درهم</span> },
    ]}
  />;
};
