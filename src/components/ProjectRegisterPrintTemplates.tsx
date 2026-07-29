import React from 'react';
import { ExecutedProject, OfficeSettings, Project } from '../types';
import { ProfessionalPrintReport } from './ProfessionalPrintReport';

type Filter = { label: string; value: string };

export function ProjectsRegisterPrintTemplate(props: {
  projects: Project[];
  settings: OfficeSettings;
  filters: Filter[];
}) {
  const agreed = props.projects.reduce((sum, project) => sum + project.totalAgreedPrice, 0);
  const paid = props.projects.reduce(
    (sum, project) => sum + project.items.reduce((itemSum, item) => itemSum + item.paidAmount, 0),
    0,
  );
  return <ProfessionalPrintReport<Project>
    wrapperClass="projects-register-print-report"
    settings={props.settings}
    title="تقرير مشاريع المقاولين"
    subtitle="كشف المشاريع وبنود المقاولين المعتمدة"
    reportPrefix="PRJ"
    filters={props.filters}
    sectionTitle="أولاً: تفاصيل المشاريع"
    columns={[
      { key: 'index', label: '#', width: '4%', render: (_, index) => index + 1 },
      { key: 'name', label: 'المشروع', width: '18%', render: project => project.name },
      { key: 'owner', label: 'المالك', width: '15%', render: project => project.ownerName },
      { key: 'location', label: 'المنطقة / القطعة', width: '15%', render: project => `${project.area} / ${project.plotNumber}` },
      { key: 'contractor', label: 'المقاول', width: '16%', render: project => project.contractorCompany },
      { key: 'date', label: 'التاريخ', width: '10%', render: project => project.date },
      { key: 'agreed', label: 'قيمة الاتفاق', width: '12%', render: project => `${project.totalAgreedPrice.toLocaleString('ar-AE')} درهم` },
      { key: 'items', label: 'البنود', width: '10%', render: project => project.items.length },
    ]}
    records={props.projects}
    getRowKey={project => project.id}
    summary={[
      { label: 'عدد المشاريع', value: props.projects.length.toLocaleString('ar-AE') },
      { label: 'إجمالي الاتفاقيات', value: `${agreed.toLocaleString('ar-AE')} درهم` },
      { label: 'إجمالي المسدد', value: `${paid.toLocaleString('ar-AE')} درهم` },
      { label: 'إجمالي المتبقي', value: `${Math.max(0, agreed - paid).toLocaleString('ar-AE')} درهم` },
    ]}
  />;
}

export function ExecutedProjectsRegisterPrintTemplate(props: {
  projects: ExecutedProject[];
  settings: OfficeSettings;
  filters: Filter[];
}) {
  const selling = props.projects.reduce((sum, project) => sum + project.sellingPrice, 0);
  const costs = props.projects.reduce(
    (sum, project) => sum + project.costItems.reduce((itemSum, item) => itemSum + item.value, 0),
    0,
  );
  return <ProfessionalPrintReport<ExecutedProject>
    wrapperClass="executed-projects-register-print-report"
    settings={props.settings}
    title="تقرير المشاريع المنفذة"
    subtitle="كشف المشاريع المنفذة والمطورة تحت إشراف المكتب"
    reportPrefix="EXE"
    filters={props.filters}
    sectionTitle="أولاً: تفاصيل المشاريع المنفذة"
    columns={[
      { key: 'index', label: '#', width: '4%', render: (_, index) => index + 1 },
      { key: 'name', label: 'المشروع', width: '18%', render: project => project.name },
      { key: 'owner', label: 'المالك', width: '15%', render: project => project.ownerName },
      { key: 'type', label: 'النوع', width: '12%', render: project => project.type },
      { key: 'location', label: 'المنطقة / القطعة', width: '15%', render: project => `${project.area} / ${project.plotNumber}` },
      { key: 'date', label: 'التاريخ', width: '10%', render: project => project.date },
      { key: 'cost', label: 'إجمالي التكلفة', width: '13%', render: project => `${project.costItems.reduce((sum, item) => sum + item.value, 0).toLocaleString('ar-AE')} درهم` },
      { key: 'selling', label: 'قيمة البيع', width: '13%', render: project => `${project.sellingPrice.toLocaleString('ar-AE')} درهم` },
    ]}
    records={props.projects}
    getRowKey={project => project.id}
    summary={[
      { label: 'عدد المشاريع', value: props.projects.length.toLocaleString('ar-AE') },
      { label: 'إجمالي التكاليف', value: `${costs.toLocaleString('ar-AE')} درهم` },
      { label: 'إجمالي قيم البيع', value: `${selling.toLocaleString('ar-AE')} درهم` },
      { label: 'صافي العائد', value: `${(selling - costs).toLocaleString('ar-AE')} درهم` },
    ]}
  />;
}
