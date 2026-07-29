import React from 'react';
import { Obligation, OfficeSettings } from '../types';
import { ProfessionalPrintReport } from './ProfessionalPrintReport';

interface Props {
  filteredObligations: Obligation[]; settings: OfficeSettings; selectedStatus: string;
  selectedResponsible: string; totalFilteredAmount: number;
}

export const ObligationPrintTemplate: React.FC<Props> = (props) => {
  const filters = [
    props.selectedStatus !== 'ALL' ? { label: 'الحالة', value: props.selectedStatus } : null,
    props.selectedResponsible !== 'ALL' ? { label: 'المسؤول', value: props.selectedResponsible } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return <ProfessionalPrintReport<Obligation>
    wrapperClass="obligation-print-wrapper obligations-print-report print-landscape"
    settings={props.settings}
    title="تقرير الالتزامات والرخص والمواعيد"
    subtitle={props.selectedStatus !== 'ALL' ? `كشف الالتزامات حسب الحالة: ${props.selectedStatus}` : 'كشف الالتزامات والرخص والمواعيد'}
    reportPrefix="OBL"
    filters={filters}
    sectionTitle="أولًا: تفاصيل الالتزامات والرخص والمواعيد"
    columns={[
      { key: 'index', label: '#', width: '4%', className: 'print-col-index', render: (_, index) => index + 1 },
      { key: 'type', label: 'عنوان / نوع الالتزام', width: '24%', className: 'print-col-long-text', render: obligation => obligation.type },
      { key: 'issue', label: 'تاريخ الإصدار', width: '12%', className: 'print-col-date', render: obligation => obligation.issueDate },
      { key: 'expiry', label: 'الاستحقاق / الانتهاء', width: '13%', className: 'print-col-date', render: obligation => obligation.expiryDate },
      { key: 'responsible', label: 'المستفيد / المسؤول', width: '16%', className: 'print-col-medium-text', render: obligation => obligation.responsiblePerson },
      { key: 'amount', label: 'المبلغ', width: '12%', className: 'print-col-amount', render: obligation => <span dir="ltr">{obligation.amount.toLocaleString('ar-AE')} درهم</span> },
      { key: 'status', label: 'الحالة', width: '8%', render: obligation => obligation.status },
      { key: 'notes', label: 'الملاحظات', width: '11%', className: 'print-col-long-text', render: obligation => obligation.notes },
    ]}
    records={props.filteredObligations}
    getRowKey={obligation => obligation.id}
    summary={[
      { label: 'إجمالي عدد الالتزامات', value: props.filteredObligations.length.toLocaleString('ar-AE') },
      { label: 'إجمالي القيمة', value: <span dir="ltr">{props.totalFilteredAmount.toLocaleString('ar-AE')} درهم</span> },
      { label: 'الالتزامات المكتملة', value: props.filteredObligations.filter(item => item.status === 'مكتمل').length.toLocaleString('ar-AE') },
      { label: 'الالتزامات المتأخرة', value: props.filteredObligations.filter(item => item.status === 'متأخر').length.toLocaleString('ar-AE') },
      { label: 'القريبة من الاستحقاق', value: props.filteredObligations.filter(item => item.status === 'قريب').length.toLocaleString('ar-AE') },
    ]}
  />;
};
