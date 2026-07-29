import React, { useState } from 'react';
import { Printer, Building, User, Calendar, CheckCircle2, Clock, DollarSign, FileText, AlertCircle, Home, X, RefreshCw } from 'lucide-react';
import { Contract, ContractInstallment, OfficeSettings } from '../types';
import { Modal } from './Modal';
import { PrintLetterhead } from './PrintLetterhead';
import { printTarget } from '../utils/printUtils';

interface UnitStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildingName: string;
  unitNumber: string;
  contracts: Contract[];
  settings: OfficeSettings;
  allBuildings?: string[];
  allUnitsList?: { buildingName: string; unitNumber: string; unitType: string }[];
  onSelectUnit?: (building: string, unit: string) => void;
}

export const UnitStatementModal: React.FC<UnitStatementModalProps> = ({
  isOpen,
  onClose,
  buildingName: initialBuildingName,
  unitNumber: initialUnitNumber,
  contracts,
  settings,
  allBuildings = [],
  allUnitsList = [],
  onSelectUnit
}) => {
  const [selectedBuilding, setSelectedBuilding] = useState(initialBuildingName);
  const [selectedUnit, setSelectedUnit] = useState(initialUnitNumber);

  // Sync state when props change
  React.useEffect(() => {
    setSelectedBuilding(initialBuildingName);
    setSelectedUnit(initialUnitNumber);
  }, [initialBuildingName, initialUnitNumber]);

  if (!isOpen) return null;

  // Filter contracts for this specific unit
  const unitContracts = contracts.filter(
    c => c.buildingName === selectedBuilding && c.unitNumber === selectedUnit
  );

  // Sort contracts by date descending
  const sortedContracts = [...unitContracts].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );

  const today = new Date();
  const activeContract = sortedContracts.find(c => c.status === 'نشط');
  const latestContract = sortedContracts[0];

  let isExpired = false;
  if (activeContract) {
    const endD = new Date(activeContract.endDate);
    if (endD.getTime() <= today.getTime()) {
      isExpired = true;
    }
  } else if (latestContract && latestContract.status === 'منتهي') {
    isExpired = true;
  }

  const isOccupied = activeContract && !isExpired;
  const unitType = activeContract?.unitType || latestContract?.unitType || 'شقة سكنية';

  // Calculate totals for installments of this unit across contracts
  const allInstallments = unitContracts.flatMap(c => c.installments || []);
  const collectedInstallments = allInstallments.filter(i => i.status === 'محصل');
  const pendingInstallments = allInstallments.filter(i => i.status === 'غير محصل');

  const totalCollectedAmount = collectedInstallments.reduce((sum, i) => sum + i.amount, 0);
  const totalPendingAmount = pendingInstallments.reduce((sum, i) => sum + i.amount, 0);
  const totalRentAgreed = unitContracts.reduce((sum, c) => sum + (c.annualRent || 0), 0);

  // Get available units for dropdown if building is selected
  const availableUnitsForBuilding = allUnitsList.filter(u => u.buildingName === selectedBuilding);

  const handlePrint = () => printTarget('.unit-print-wrapper');

  return (
    <>
      {/* Screen View inside Modal */}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`كشف تفصيلي بالشقة / الوحدة: ${selectedUnit} - ${selectedBuilding}`}
        maxWidth="max-w-4xl"
      >
        <div className="space-y-6 text-right">
          {/* Quick Unit Switcher Bar (if list provided) */}
          {allUnitsList.length > 0 && (
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-amber-600" />
                <span>اختر شقة/وحدة أخرى لطباعة كشفها:</span>
              </span>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedBuilding}
                  onChange={(e) => {
                    const newBldg = e.target.value;
                    setSelectedBuilding(newBldg);
                    const matchingUnits = allUnitsList.filter(u => u.buildingName === newBldg);
                    if (matchingUnits.length > 0) {
                      setSelectedUnit(matchingUnits[0].unitNumber);
                      if (onSelectUnit) onSelectUnit(newBldg, matchingUnits[0].unitNumber);
                    }
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none"
                >
                  {(allBuildings.length > 0 ? allBuildings : settings.buildings).map((bldg, idx) => (
                    <option key={idx} value={bldg}>{bldg}</option>
                  ))}
                </select>

                <select
                  value={selectedUnit}
                  onChange={(e) => {
                    const newUnit = e.target.value;
                    setSelectedUnit(newUnit);
                    if (onSelectUnit) onSelectUnit(selectedBuilding, newUnit);
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-none"
                >
                  {availableUnitsForBuilding.length > 0 ? (
                    availableUnitsForBuilding.map((u, idx) => (
                      <option key={idx} value={u.unitNumber}>وحدة/شقة {u.unitNumber} ({u.unitType})</option>
                    ))
                  ) : (
                    <option value={selectedUnit}>وحدة {selectedUnit}</option>
                  )}
                </select>
              </div>
            </div>
          )}

          {/* Unit Status Header Card */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-amber-400 font-extrabold text-lg">
                <Building className="w-5 h-5" />
                <span>{selectedBuilding} - الوحدة / الشقة {selectedUnit}</span>
              </div>
              <div className="text-xs text-slate-300 mt-1">
                نوع الوحدة: <strong className="text-white">{unitType}</strong> | الموقع: <strong className="text-white">{settings.address}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOccupied && activeContract ? (
                <span className="px-3 py-1.5 bg-emerald-500 text-slate-950 rounded-lg font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>مؤجرة (عقد نشط)</span>
                </span>
              ) : isExpired ? (
                <span className="px-3 py-1.5 bg-amber-500 text-slate-950 rounded-lg font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                  <Clock className="w-4 h-4" />
                  <span>عقد منتهي</span>
                </span>
              ) : (
                <span className="px-3 py-1.5 bg-slate-700 text-slate-200 rounded-lg font-bold text-xs flex items-center gap-1.5">
                  <Home className="w-4 h-4" />
                  <span>فارغة / شغارة</span>
                </span>
              )}
            </div>
          </div>

          {/* Active / Current Contract Details */}
          {activeContract ? (
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-3">
              <h4 className="font-extrabold text-emerald-900 text-xs flex items-center gap-1.5 border-b border-emerald-200 pb-2">
                <FileText className="w-4 h-4 text-emerald-700" />
                <span>بيانات العقد المبرم والمستأجر الحالي:</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block font-medium">اسم المستأجر:</span>
                  <span className="font-bold text-slate-900">{activeContract.tenantName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">رقم الهاتف:</span>
                  <span className="font-bold font-mono text-slate-900">{activeContract.tenantPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">فترة العقد:</span>
                  <span className="font-bold font-mono text-slate-900">{activeContract.startDate} إلى {activeContract.endDate}</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">الإيجار السنوي:</span>
                  <span className="font-extrabold font-mono text-emerald-700 text-sm">{activeContract.annualRent.toLocaleString('ar-AE')} درهم</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">مبلغ التأمين:</span>
                  <span className="font-bold font-mono text-slate-900">{activeContract.securityDeposit.toLocaleString('ar-AE')} درهم</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">طريقة السداد / الدفعات:</span>
                  <span className="font-bold text-slate-900">{activeContract.paymentType} ({activeContract.installmentsCount} أقساط)</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">حالة العقد:</span>
                  <span className="font-bold text-emerald-700">نشط وساري</span>
                </div>
                <div>
                  <span className="text-slate-500 block font-medium">مالك البناية:</span>
                  <span className="font-bold text-slate-900">{activeContract.ownerName || '-'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs text-slate-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-slate-400" />
              <span>لا يوجد عقد إيجار نشط حالياً لهذه الشقة / الوحدة.</span>
            </div>
          )}

          {/* Current Contract Installments Payment Table */}
          {activeContract && activeContract.installments && activeContract.installments.length > 0 && (
            <div>
              <h4 className="font-extrabold text-slate-900 text-xs mb-2">جدول الأقساط والدفعات المستحقة للعقد الحالي:</h4>
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-2.5">القسط #</th>
                      <th className="p-2.5">تاريخ الاستحقاق</th>
                      <th className="p-2.5">المبلغ (درهم)</th>
                      <th className="p-2.5">طريقة الدفع / الشيك</th>
                      <th className="p-2.5">الحالة والتاريخ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {activeContract.installments.map((inst) => (
                      <tr key={inst.id} className={inst.status === 'محصل' ? 'bg-emerald-50/40' : 'hover:bg-slate-50'}>
                        <td className="p-2.5 font-bold text-slate-900">القسط {inst.installmentNo}</td>
                        <td className="p-2.5 font-mono text-slate-700">{inst.dueDate}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{inst.amount.toLocaleString('ar-AE')} درهم</td>
                        <td className="p-2.5 text-slate-600">
                          {inst.chequeNumber ? `شيك رقم ${inst.chequeNumber} (${inst.bankName || ''})` : (inst.paymentMethod || 'شيك')}
                        </td>
                        <td className="p-2.5">
                          {inst.status === 'محصل' ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>محصل ({inst.collectedDate || 'تم السداد'})</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded font-bold text-[10px] inline-flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-600" />
                              <span>متبقي / غير محصل</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* All Historical Contracts Log for this Unit */}
          <div>
            <h4 className="font-extrabold text-slate-900 text-xs mb-2">سجل المستأجرين والعقود المسجلة للشقة ({sortedContracts.length}):</h4>
            {sortedContracts.length === 0 ? (
              <div className="bg-slate-50 p-6 rounded-xl text-center border border-slate-200 text-xs text-slate-400">
                لا توجد عقود سابقة مسجلة لهذه الوحدة.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">المستأجر</th>
                      <th className="p-2.5">الهاتف</th>
                      <th className="p-2.5">فترة العقد</th>
                      <th className="p-2.5">الإيجار السنوي</th>
                      <th className="p-2.5">حالة العقد</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {sortedContracts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold text-slate-900">{c.tenantName}</td>
                        <td className="p-2.5 font-mono text-slate-600">{c.tenantPhone}</td>
                        <td className="p-2.5 font-mono text-slate-600">{c.startDate} إلى {c.endDate}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{c.annualRent.toLocaleString('ar-AE')} درهم</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.status === 'نشط' ? 'bg-emerald-100 text-emerald-800' :
                            c.status === 'منتهي' ? 'bg-amber-100 text-amber-800' :
                            c.status === 'مجدد' ? 'bg-blue-100 text-blue-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Unit Financial Summary Bar */}
          <div className="bg-slate-900 text-white p-4 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
            <div>
              <span className="text-slate-400 block font-sans font-bold text-[10px]">إجمالي العقود المبرمة:</span>
              <span className="text-amber-400 font-extrabold text-sm">{totalRentAgreed.toLocaleString('ar-AE')} درهم</span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans font-bold text-[10px]">إجمالي الدفعات المحصلة:</span>
              <span className="text-emerald-400 font-extrabold text-sm">{totalCollectedAmount.toLocaleString('ar-AE')} درهم</span>
            </div>
            <div>
              <span className="text-slate-400 block font-sans font-bold text-[10px]">المبالغ غير المحصلة / القادمة:</span>
              <span className="text-red-400 font-extrabold text-sm">{totalPendingAmount.toLocaleString('ar-AE')} درهم</span>
            </div>
          </div>

          {/* Action Buttons inside Modal */}
          <div className="flex items-center justify-between no-print pt-2 border-t border-slate-200">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold rounded-xl text-xs shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة كشف الشقة / حفظ PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>
      </Modal>

      {/* Dedicated Professional Printable A4 Document for Unit Statement */}
      <div className="unit-print-wrapper hidden print:block text-right dir-rtl font-sans bg-white text-slate-900 p-6 leading-normal text-xs">
        {/* 1. Official Top Company Banner */}
        <PrintLetterhead settings={settings} />

        {/* 2. Document Title Box */}
        <div className="mb-5 p-3 bg-slate-100 rounded-lg border border-slate-300 text-center">
          <h1 className="text-lg font-black text-slate-900 tracking-tight mb-1">
            كشف أداء وتفاصيل الشقة / الوحدة العقارية
          </h1>
          <h2 className="text-sm font-bold text-slate-800 mb-2">
            {selectedBuilding} - شقة / وحدة رقم ({selectedUnit})
          </h2>

          <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-slate-700 border-t border-slate-200 pt-2 mt-1">
            <span>
              رقم الكشف:{' '}
              <strong className="font-mono text-slate-900">
                STMT-{selectedBuilding.replace(/\s+/g, '')}-{selectedUnit}
              </strong>
            </span>
            <span>•</span>
            <span>
              نوع الوحدة:{' '}
              <strong className="text-slate-900">{unitType}</strong>
            </span>
            <span>•</span>
            <span>
              حالة الإشغال:{' '}
              <strong className="text-slate-900">
                {isOccupied ? 'مؤجرة (عقد نشط وساري)' : isExpired ? 'عقد منتهي' : 'فارغة / شغارة'}
              </strong>
            </span>
          </div>
        </div>

        {/* 4. Active Lease & Tenant Details */}
        <div className="mb-5 print-section">
          <h3 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
            تفاصيل العقد الساري والمستأجر القائم:
          </h3>
          {activeContract ? (
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white text-xs">
              <table className="w-full text-right border-collapse">
                <tbody>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                      اسم المستأجر:
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                      {activeContract.tenantName}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 w-1/4 border-l border-slate-200">
                      رقم الهاتف / التواصل:
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 w-1/4">
                      {activeContract.tenantPhone || '-'}
                    </td>
                  </tr>
                  <tr className="border-b border-slate-200">
                    <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                      فترة العقد الساري:
                    </td>
                    <td className="p-2.5 font-mono text-slate-900 border-l border-slate-200">
                      من {activeContract.startDate} إلى {activeContract.endDate}
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                      الإيجار السنوي المتفق عليه:
                    </td>
                    <td className="p-2.5 font-mono font-bold text-slate-900">
                      {activeContract.annualRent.toLocaleString('ar-AE')} درهم
                    </td>
                  </tr>
                  <tr className="bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                      مبلغ تأمين العقد:
                    </td>
                    <td className="p-2.5 font-mono text-slate-900 border-l border-slate-200">
                      {activeContract.securityDeposit.toLocaleString('ar-AE')} درهم
                    </td>
                    <td className="p-2.5 font-bold text-slate-900 border-l border-slate-200">
                      طريقة السداد والأقساط:
                    </td>
                    <td className="p-2.5 text-slate-900">
                      {activeContract.paymentType} ({activeContract.installmentsCount} أقساط)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold text-center">
              الوحدة فارغة حالياً وجاهزة للتأجير، ولا يوجد عقد إيجار ساري المفعول مسجل للوحدة في الوقت الحالي.
            </div>
          )}
        </div>

        {/* 5. Installments Schedule Table */}
        {activeContract && activeContract.installments && activeContract.installments.length > 0 && (
          <div className="mb-5 print-section">
            <h3 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
              جدول سداد الأقساط والدفعات المستحقة للوحدة:
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="cost-table w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="p-2.5 border-l border-slate-300 text-center w-16">القسط #</th>
                    <th className="p-2.5 border-l border-slate-300 text-center w-28">تاريخ الاستحقاق</th>
                    <th className="p-2.5 border-l border-slate-300 text-center w-32">قيمة القسط</th>
                    <th className="p-2.5 border-l border-slate-300 text-right">رقم الشيك / طريقة السداد</th>
                    <th className="p-2.5 text-center w-36">حالة التحصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {activeContract.installments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-l border-slate-200 text-center font-bold text-slate-900">
                        القسط {inst.installmentNo}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono text-slate-900">
                        {inst.dueDate}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                        {inst.amount.toLocaleString('ar-AE')} درهم
                      </td>
                      <td className="p-2.5 border-l border-slate-200 text-slate-800">
                        {inst.chequeNumber ? `شيك رقم ${inst.chequeNumber} (${inst.bankName || ''})` : (inst.paymentMethod || 'شيك')}
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        {inst.status === 'محصل' ? (
                          <span className="text-emerald-800 font-bold">تم التحصيل ({inst.collectedDate || ''})</span>
                        ) : (
                          <span className="text-amber-800 font-bold">متبقي / غير محصل</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Historical Tenant Log */}
        <div className="mb-5 print-section">
          <h3 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
            سجل المستأجرين والعقود المسجلة للوحدة:
          </h3>
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            {sortedContracts.length === 0 ? (
              <div className="p-4 text-center text-slate-500 italic bg-slate-50">لا توجد عقود سابقة مسجلة لهذه الوحدة.</div>
            ) : (
              <table className="cost-table w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="p-2.5 border-l border-slate-300 text-center w-12">#</th>
                    <th className="p-2.5 border-l border-slate-300 text-right">اسم المستأجر</th>
                    <th className="p-2.5 border-l border-slate-300 text-center w-28">رقم الهاتف</th>
                    <th className="p-2.5 border-l border-slate-300 text-center w-44">فترة العقد</th>
                    <th className="p-2.5 border-l border-slate-300 text-center w-32">الإيجار السنوي</th>
                    <th className="p-2.5 text-center w-24">حالة العقد</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {sortedContracts.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-l border-slate-200 text-center font-bold text-slate-700">{idx + 1}</td>
                      <td className="p-2.5 border-l border-slate-200 font-bold text-slate-900">{c.tenantName}</td>
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono text-slate-700">{c.tenantPhone || '-'}</td>
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono text-slate-900 whitespace-nowrap">{c.startDate} إلى {c.endDate}</td>
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold text-slate-900 whitespace-nowrap">{c.annualRent.toLocaleString('ar-AE')} درهم</td>
                      <td className="p-2.5 text-center font-bold text-slate-800">{c.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 7. Financial Summary Box */}
        <div className="mb-5 summary-table-box print-section">
          <h3 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
            <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
            الملخص المالي الشامل للوحدة
          </h3>
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs bg-slate-50">
            <table className="w-full text-right border-collapse">
              <tbody>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-900">
                    إجمالي القيم الإيجارية المسجلة للوحدة:
                  </td>
                  <td className="p-2.5 font-mono font-bold text-left text-slate-900 text-sm whitespace-nowrap">
                    {totalRentAgreed.toLocaleString('ar-AE')} درهم
                  </td>
                </tr>
                <tr className="border-b border-slate-200">
                  <td className="p-2.5 font-bold text-slate-900">
                    إجمالي الدفعات والأقساط المحصلة فعلياً:
                  </td>
                  <td className="p-2.5 font-mono font-bold text-left text-emerald-800 text-sm whitespace-nowrap">
                    {totalCollectedAmount.toLocaleString('ar-AE')} درهم
                  </td>
                </tr>
                <tr className="bg-slate-200 font-black">
                  <td className="p-3 text-slate-900 text-sm">
                    إجمالي المبالغ غير المحصلة / المتبقية:
                  </td>
                  <td className="p-3 font-mono text-left text-amber-900 text-base whitespace-nowrap">
                    {totalPendingAmount.toLocaleString('ar-AE')} درهم
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
};
