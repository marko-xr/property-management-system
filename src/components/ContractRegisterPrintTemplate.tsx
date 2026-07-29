import React from 'react';
import { Contract, OfficeSettings } from '../types';
import { ProfessionalPrintReport } from './ProfessionalPrintReport';

interface Props {
  contracts: Contract[];
  settings: OfficeSettings;
  searchTerm: string;
  selectedBuilding: string;
  selectedStatus: string;
  selectedUnitType: string;
  selectedPaymentType: string;
  active: boolean;
}

export const ContractRegisterPrintTemplate: React.FC<Props> = (props) => {
  const filters = [
    props.searchTerm.trim() ? { label: 'البحث', value: props.searchTerm.trim() } : null,
    props.selectedBuilding !== 'ALL' ? { label: 'البناية', value: props.selectedBuilding } : null,
    props.selectedStatus !== 'ALL' ? { label: 'حالة العقد', value: props.selectedStatus } : null,
    props.selectedUnitType !== 'ALL' ? { label: 'نوع الوحدة', value: props.selectedUnitType } : null,
    props.selectedPaymentType !== 'ALL' ? { label: 'طريقة الدفع', value: props.selectedPaymentType } : null,
  ].filter((row): row is { label: string; value: string } => row !== null);
  const annualRentTotal = props.contracts.reduce((sum, contract) => sum + contract.annualRent, 0);

  return <ProfessionalPrintReport<Contract>
    wrapperClass="contract-print-wrapper"
    active={props.active}
    settings={props.settings}
    title="تقرير سجل عقود الإيجار"
    subtitle={props.selectedBuilding !== 'ALL' ? `سجل عقود ${props.selectedBuilding}` : 'قائمة عقود الإيجار'}
    reportPrefix="CNT"
    filters={filters}
    sectionTitle="أولًا: تفاصيل عقود الإيجار"
    columns={[
      { key: 'index', label: '#', width: '4%', render: (_, index) => index + 1 },
      { key: 'building', label: 'البناية', width: '14%', render: contract => contract.buildingName },
      { key: 'unit', label: 'الوحدة', width: '7%', render: contract => contract.unitNumber },
      { key: 'tenant', label: 'اسم المستأجر', width: '18%', render: contract => contract.tenantName },
      { key: 'contract', label: 'رقم العقد', width: '10%', render: contract => contract.id },
      { key: 'start', label: 'تاريخ البداية', width: '11%', render: contract => contract.startDate },
      { key: 'end', label: 'تاريخ النهاية', width: '11%', render: contract => contract.endDate },
      { key: 'rent', label: 'الإيجار السنوي', width: '14%', render: contract => <span dir="ltr">{contract.annualRent.toLocaleString('ar-AE')} درهم</span> },
      { key: 'status', label: 'الحالة', width: '11%', render: contract => contract.status },
    ]}
    records={props.contracts}
    getRowKey={contract => contract.id}
    summary={[
      { label: 'إجمالي عدد العقود', value: props.contracts.length.toLocaleString('ar-AE') },
      { label: 'العقود النشطة', value: props.contracts.filter(contract => contract.status === 'نشط').length.toLocaleString('ar-AE') },
      { label: 'العقود المنتهية', value: props.contracts.filter(contract => contract.status === 'منتهي').length.toLocaleString('ar-AE') },
      { label: 'إجمالي الإيجار السنوي', value: <span dir="ltr">{annualRentTotal.toLocaleString('ar-AE')} درهم</span> },
    ]}
  />;
};
