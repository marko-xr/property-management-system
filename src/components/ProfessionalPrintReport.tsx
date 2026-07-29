import React from 'react';
import { createPortal } from 'react-dom';
import { OfficeSettings } from '../types';
import { PrintLetterhead } from './PrintLetterhead';

export interface PrintDetailRow {
  label: string;
  value: React.ReactNode;
}

export interface PrintColumn<T> {
  key: string;
  label: string;
  width?: string;
  className?: string;
  render: (record: T, index: number) => React.ReactNode;
}

interface CompactPrintTableProps<T> {
  columns: PrintColumn<T>[];
  records: T[];
  getRowKey: (record: T) => string;
}

export function CompactPrintTable<T>({ columns, records, getRowKey }: CompactPrintTableProps<T>) {
  return (
    <table className="compact-print-table">
      <colgroup>
        {columns.map(column => <col key={column.key} style={{ width: column.width }} />)}
      </colgroup>
      <thead>
        <tr>{columns.map(column => <th key={column.key} className={column.className}>{column.label}</th>)}</tr>
      </thead>
      <tbody>
        {records.map((record, index) => (
          <tr key={getRowKey(record)}>
            {columns.map(column => <td key={column.key} className={column.className}>{displayValue(column.render(record, index))}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface ProfessionalPrintReportProps<T> {
  wrapperClass: string;
  settings: OfficeSettings;
  title: string;
  subtitle: string;
  reportPrefix: string;
  filters: PrintDetailRow[];
  sectionTitle: string;
  columns: PrintColumn<T>[];
  records: T[];
  getRowKey: (record: T) => string;
  summary: PrintDetailRow[];
  active?: boolean;
}

const displayValue = (value: React.ReactNode) =>
  value === null || value === undefined || value === '' ? '—' : value;

export function ProfessionalPrintReport<T>({
  wrapperClass,
  settings,
  title,
  subtitle,
  reportPrefix,
  filters,
  sectionTitle,
  columns,
  records,
  getRowKey,
  summary,
  active = true,
}: ProfessionalPrintReportProps<T>) {
  if (!active) return null;

  const now = new Date();
  const issueDate = now.toLocaleDateString('ar-AE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const reportNumber = `${reportPrefix}-${now.toISOString().slice(0, 10).replaceAll('-', '')}`;

  const report = (
    <div className={`${wrapperClass} professional-print-report print-report`} dir="rtl">
      <PrintLetterhead settings={settings} />

      <section className="report-title-section">
        <div className="report-title-content">
          <h1>{title}</h1>
          <h2>{subtitle}</h2>
        </div>
        <div className="report-title-divider" />
        <div className="report-meta-row">
          <div className="report-meta-item"><strong>رقم الكشف:</strong><span dir="ltr">{reportNumber}</span></div>
          <span className="report-meta-separator">•</span>
          <div className="report-meta-item"><strong>تاريخ الإصدار:</strong><span>{issueDate}</span></div>
          <span className="report-meta-separator">•</span>
          <div className="report-meta-item"><strong>عدد السجلات:</strong><span>{records.length.toLocaleString('ar-AE')}</span></div>
        </div>
      </section>

      <section className="professional-filter-section">
        <h3 className="print-section-heading">بيانات الكشف والفلاتر</h3>
        <table className="print-record-table">
          <tbody>
            {(filters.length ? filters : [{ label: 'نطاق الكشف', value: 'جميع السجلات' }]).map(row => (
              <tr key={row.label}><th>{row.label}</th><td>{displayValue(row.value)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="professional-records-section">
        <h3 className="print-section-heading">{sectionTitle}</h3>
        {records.length
          ? <CompactPrintTable columns={columns} records={records} getRowKey={getRowKey} />
          : <div className="professional-empty-state">لا توجد سجلات مطابقة للمعايير المحددة.</div>}
      </section>

      <section className="professional-summary-section">
        <h3 className="print-section-heading">ثانيًا: الملخص</h3>
        <table className="print-record-table">
          <tbody>
            {summary.map(row => (
              <tr key={row.label}><th>{row.label}</th><td>{displayValue(row.value)}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );

  return createPortal(report, document.body);
}
