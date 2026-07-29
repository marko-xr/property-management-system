import React from 'react';
import { EmployeeDebt, OfficeSettings } from '../types';
import { ProfessionalPrintReport } from './ProfessionalPrintReport';

interface Props {
  filteredDebts: EmployeeDebt[]; settings: OfficeSettings; selectedEmployee: string;
  selectedStatus: string; totalDebtsAmount: number; totalRepaidAmount: number;
  totalRemainingBalance: number;
}

export const EmployeeDebtPrintTemplate: React.FC<Props> = (props) => {
  const filters = [
    props.selectedEmployee !== 'ALL' ? { label: 'الموظف', value: props.selectedEmployee } : null,
    props.selectedStatus !== 'ALL' ? { label: 'الحالة', value: props.selectedStatus } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);

  return <ProfessionalPrintReport<EmployeeDebt>
    wrapperClass="employee-debt-print-wrapper"
    settings={props.settings}
    title="تقرير مديونيات وقروض الموظفين"
    subtitle={props.selectedEmployee !== 'ALL' ? `كشف مديونية الموظف ${props.selectedEmployee}` : 'كشف مديونيات وقروض الموظفين'}
    reportPrefix="DEBT"
    filters={filters}
    sectionTitle="أولًا: تفاصيل المديونيات والقروض"
    columns={[
      { key: 'index', label: '#', width: '4%', render: (_, index) => index + 1 },
      { key: 'employee', label: 'اسم الموظف', width: '15%', render: debt => debt.employeeName },
      { key: 'reason', label: 'نوع المديونية / القرض', width: '23%', render: debt => debt.reason },
      { key: 'date', label: 'تاريخ التسجيل', width: '11%', render: debt => debt.date },
      { key: 'total', label: 'القيمة الأصلية', width: '12%', render: debt => <span dir="ltr">{debt.totalAmount.toLocaleString('ar-AE')} درهم</span> },
      { key: 'paid', label: 'المدفوع', width: '11%', render: debt => <span dir="ltr">{debt.repayments.reduce((sum, repayment) => sum + repayment.amount, 0).toLocaleString('ar-AE')} درهم</span> },
      { key: 'remaining', label: 'المتبقي', width: '12%', render: debt => <span dir="ltr">{(debt.totalAmount - debt.repayments.reduce((sum, repayment) => sum + repayment.amount, 0)).toLocaleString('ar-AE')} درهم</span> },
      { key: 'status', label: 'الحالة', width: '12%', render: debt => {
        const paid = debt.repayments.reduce((sum, repayment) => sum + repayment.amount, 0);
        return debt.totalAmount - paid <= 0 ? 'خالص' : paid > 0 ? 'سداد جزئي' : 'قائم';
      }},
    ]}
    records={props.filteredDebts}
    getRowKey={debt => debt.id}
    summary={[
      { label: 'عدد سجلات المديونية', value: props.filteredDebts.length.toLocaleString('ar-AE') },
      { label: 'إجمالي المديونيات', value: <span dir="ltr">{props.totalDebtsAmount.toLocaleString('ar-AE')} درهم</span> },
      { label: 'إجمالي المبالغ المسددة', value: <span dir="ltr">{props.totalRepaidAmount.toLocaleString('ar-AE')} درهم</span> },
      { label: 'إجمالي الأرصدة المتبقية', value: <span dir="ltr">{props.totalRemainingBalance.toLocaleString('ar-AE')} درهم</span> },
    ]}
  />;
};
