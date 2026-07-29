import React from 'react';
import { Contract, ContractInstallment, OfficeSettings } from '../types';
import { formatArabicMonthYear } from '../utils/dateUtils';
import { ProfessionalPrintReport } from './ProfessionalPrintReport';

interface Props {
  filteredInstallments: Array<{ contract: Contract; installment: ContractInstallment; isOverdue: boolean }>;
  settings: OfficeSettings; selectedBuilding: string; selectedMonth: string; selectedStatus: string;
  totalCollected: number; totalUncollected: number;
}

type CollectionRecord = Props['filteredInstallments'][number];

export const CollectionPrintTemplate: React.FC<Props> = (props) => {
  const period = props.selectedMonth ? formatArabicMonthYear(props.selectedMonth) : 'جميع الفترات والشهور';
  const filters = [
    props.selectedBuilding !== 'ALL' ? { label: 'البناية', value: props.selectedBuilding } : null,
    props.selectedMonth ? { label: 'الفترة', value: period } : null,
    props.selectedStatus !== 'ALL' ? { label: 'حالة التحصيل', value: props.selectedStatus } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return <ProfessionalPrintReport<CollectionRecord>
    wrapperClass="collection-print-wrapper collection-print-report print-landscape"
    settings={props.settings}
    title="تقرير متابعة تحصيل الدفعات"
    subtitle={props.selectedBuilding !== 'ALL' ? `كشف تحصيل ${props.selectedBuilding}` : `كشف الدفعات والتحصيل — ${period}`}
    reportPrefix="COL"
    filters={filters}
    sectionTitle="أولًا: تفاصيل الدفعات والتحصيل"
    columns={[
      { key: 'index', label: '#', width: '3%', className: 'print-col-index', render: (_, index) => index + 1 },
      { key: 'dueDate', label: 'تاريخ الاستحقاق', width: '10%', className: 'print-col-date', render: item => <span className="print-ltr-value" dir="ltr">{item.installment.dueDate}</span> },
      { key: 'building', label: 'البناية', width: '13%', className: 'print-col-medium-text', render: item => item.contract.buildingName },
      { key: 'unit', label: 'الوحدة', width: '7%', render: item => <span className="print-ltr-value" dir="ltr">{item.contract.unitNumber}</span> },
      { key: 'tenant', label: 'المستأجر', width: '15%', className: 'print-col-medium-text', render: item => item.contract.tenantName },
      { key: 'contract', label: 'رقم العقد', width: '11%', className: 'print-col-reference', render: item => <span className="print-ltr-value" dir="ltr">{item.contract.id || '—'}</span> },
      { key: 'amount', label: 'قيمة الدفعة', width: '9%', className: 'print-col-amount', render: item => <span className="print-money-value" dir="rtl">{item.installment.amount.toLocaleString('ar-AE')} درهم</span> },
      { key: 'method', label: 'طريقة التحصيل', width: '8%', render: item => item.installment.paymentMethod },
      { key: 'cheque', label: 'الشيك / المرجع', width: '11%', className: 'print-col-reference', render: item => <span className="print-ltr-value" dir="ltr">{item.installment.chequeNumber || '—'}</span> },
      { key: 'collected', label: 'تاريخ التحصيل', width: '8%', className: 'print-col-date', render: item => <span className="print-ltr-value" dir="ltr">{item.installment.collectedDate || '—'}</span> },
      { key: 'status', label: 'الحالة', width: '5%', className: 'print-col-medium-text', render: item => item.installment.status === 'محصل' ? 'محصل' : item.isOverdue ? 'متأخر' : 'غير محصل' },
    ]}
    records={props.filteredInstallments}
    getRowKey={item => `${item.contract.id}-${item.installment.id}`}
    summary={[
      { label: 'إجمالي الدفعات', value: <span dir="ltr">{(props.totalCollected + props.totalUncollected).toLocaleString('ar-AE')} درهم</span> },
      { label: 'إجمالي المحصل', value: <span dir="ltr">{props.totalCollected.toLocaleString('ar-AE')} درهم</span> },
      { label: 'إجمالي غير المحصل', value: <span dir="ltr">{props.totalUncollected.toLocaleString('ar-AE')} درهم</span> },
    ]}
  />;
};
