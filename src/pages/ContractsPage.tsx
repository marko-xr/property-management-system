import React, { useState, useMemo } from 'react';
import { Plus, Search, Filter, Printer, Edit2, Trash2, FileText, Calendar, Building, Eye, CheckCircle2, Clock, AlertTriangle, X, SlidersHorizontal, RotateCcw, XCircle, Home, History, UserCheck, ShieldCheck, UserX } from 'lucide-react';
import { Contract, ContractInstallment, OfficeSettings } from '../types';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { PrintHeader } from '../components/PrintHeader';
import { PrintLetterhead } from '../components/PrintLetterhead';
import { ActionMenu, ActionMenuItem } from '../components/ActionMenu';
import { UnitStatementModal } from '../components/UnitStatementModal';
import { ContractRegisterPrintTemplate } from '../components/ContractRegisterPrintTemplate';
import { formatCreationDateTime, formatCompletionDateTime } from '../utils/dateUtils';

interface ContractsPageProps {
  contracts: Contract[];
  settings: OfficeSettings;
  onAddContract: (contract: Omit<Contract, 'id'>) => void;
  onUpdateContract: (contract: Contract) => void;
  onDeleteContract: (id: string) => void;
  onPrint: (selector: string) => void;
}

export const ContractsPage: React.FC<ContractsPageProps> = ({
  contracts,
  settings,
  onAddContract,
  onUpdateContract,
  onDeleteContract,
  onPrint
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'units'>('list');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBuilding, setSelectedBuilding] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedExpiryFilter, setSelectedExpiryFilter] = useState<string>('ALL'); // 30, 60, 90 days
  const [selectedUnitType, setSelectedUnitType] = useState<string>('ALL');
  const [selectedPaymentType, setSelectedPaymentType] = useState<string>('ALL');
  const [minRent, setMinRent] = useState<number | ''>('');
  const [maxRent, setMaxRent] = useState<number | ''>('');
  const [startDateFrom, setStartDateFrom] = useState<string>('');
  const [startDateTo, setStartDateTo] = useState<string>('');
  const [endDateFrom, setEndDateFrom] = useState<string>('');
  const [endDateTo, setEndDateTo] = useState<string>('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Contract | null>(null);
  const [viewingContract, setViewingContract] = useState<Contract | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Unit Statement Modal state
  const [unitStatementTarget, setUnitStatementTarget] = useState<{ buildingName: string; unitNumber: string } | null>(null);

  // Renewal & Vacate state
  const [renewingContract, setRenewingContract] = useState<Contract | null>(null);
  const [isRenewModalOpen, setIsRenewModalOpen] = useState<boolean>(false);
  const [vacateContract, setVacateContract] = useState<Contract | null>(null);

  // Unit Directory filter state
  const [unitSearchQuery, setUnitSearchQuery] = useState('');
  const [selectedUnitBuildingFilter, setSelectedUnitBuildingFilter] = useState('ALL');
  const [selectedUnitOccupancyFilter, setSelectedUnitOccupancyFilter] = useState('ALL'); // ALL | OCCUPIED | VACANT | EXPIRED

  // Form fields
  const [buildingName, setBuildingName] = useState(settings.buildings[0] || 'بناية الريم');
  const [area, setArea] = useState('الروضة');
  const [unitNumber, setUnitNumber] = useState('');
  const [unitType, setUnitType] = useState(settings.unitTypes[0] || 'شقة residential');
  const [ownerName, setOwnerName] = useState('');
  const [tenantName, setTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split('T')[0];
  });
  const [annualRent, setAnnualRent] = useState<number | ''>(50000);
  const [installmentsCount, setInstallmentsCount] = useState<number>(4);
  const [securityDeposit, setSecurityDeposit] = useState<number | ''>(3000);
  const [paymentType, setPaymentType] = useState<'نقد' | 'شيك' | 'تحويل'>('شيك');
  const [notes, setNotes] = useState('');
  const [contractStatus, setContractStatus] = useState<'نشط' | 'منتهي' | 'ملغى'>('نشط');

  // Custom installments state for modal editing
  const [installments, setInstallments] = useState<ContractInstallment[]>([]);

  // Generate Installments helper (supports 1 to 12 installments)
  const generateInstallments = (
    rentVal: number, 
    countVal: number, 
    startVal: string, 
    cId: string = 'new'
  ): ContractInstallment[] => {
    if (!rentVal || countVal <= 0 || !startVal) return [];
    
    const baseAmount = Math.floor((rentVal / countVal) * 100) / 100;
    const remainder = Math.round((rentVal - baseAmount * countVal) * 100) / 100;
    const result: ContractInstallment[] = [];
    const baseDate = new Date(startVal);

    for (let i = 0; i < countVal; i++) {
      const dueDateObj = new Date(baseDate);
      const monthsToAdd = Math.round(i * (12 / countVal));
      dueDateObj.setMonth(dueDateObj.getMonth() + monthsToAdd);
      const dueDateStr = dueDateObj.toISOString().split('T')[0];

      const itemAmount = i === countVal - 1 ? Math.round((baseAmount + remainder) * 100) / 100 : baseAmount;

      result.push({
        id: `inst-${Date.now()}-${i + 1}`,
        contractId: cId,
        installmentNo: i + 1,
        dueDate: dueDateStr,
        amount: itemAmount,
        chequeNumber: paymentType === 'شيك' ? `CHK-${1000 + i}` : '',
        bankName: paymentType === 'شيك' ? 'بنك دبي الإسلامي' : '',
        status: 'غير محصل',
        notes: ''
      });
    }
    return result;
  };

  const handleAutoGenerateClick = () => {
    if (!annualRent || annualRent <= 0) {
      alert('يرجى تحديد قيمة الإيجار السنوي أولاً');
      return;
    }
    const generated = generateInstallments(Number(annualRent), Number(installmentsCount), startDate);
    setInstallments(generated);
  };

  const openAddModal = () => {
    setEditingContract(null);
    setBuildingName(settings.buildings[0] || 'بناية الريم');
    setArea('الروضة');
    setUnitNumber('');
    setUnitType(settings.unitTypes[0] || 'شقة residential');
    setOwnerName('');
    setTenantName('');
    setTenantPhone('');
    const todayStr = new Date().toISOString().split('T')[0];
    setStartDate(todayStr);
    const endD = new Date();
    endD.setFullYear(endD.getFullYear() + 1);
    setEndDate(endD.toISOString().split('T')[0]);
    setAnnualRent(60000);
    setInstallmentsCount(4);
    setSecurityDeposit(3000);
    setPaymentType('شيك');
    setNotes('');
    setContractStatus('نشط');

    // Pre-generate
    const initialInst = generateInstallments(60000, 4, todayStr);
    setInstallments(initialInst);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Contract) => {
    setEditingContract(c);
    setBuildingName(c.buildingName);
    setArea(c.area);
    setUnitNumber(c.unitNumber);
    setUnitType(c.unitType);
    setOwnerName(c.ownerName);
    setTenantName(c.tenantName);
    setTenantPhone(c.tenantPhone);
    setStartDate(c.startDate);
    setEndDate(c.endDate);
    setAnnualRent(c.annualRent);
    setInstallmentsCount(c.installmentsCount);
    setSecurityDeposit(c.securityDeposit);
    setPaymentType(c.paymentType);
    setNotes(c.notes || '');
    setContractStatus(c.status);
    setInstallments(c.installments || []);
    setIsModalOpen(true);
  };

  const openAddModalForUnit = (bldgName: string, uNumber: string, uType: string) => {
    setEditingContract(null);
    setBuildingName(bldgName);
    setArea('الروضة');
    setUnitNumber(uNumber);
    setUnitType(uType || settings.unitTypes[0] || 'شقة سكنية');
    setOwnerName('');
    setTenantName('');
    setTenantPhone('');
    const todayStr = new Date().toISOString().split('T')[0];
    setStartDate(todayStr);
    const endD = new Date();
    endD.setFullYear(endD.getFullYear() + 1);
    setEndDate(endD.toISOString().split('T')[0]);
    setAnnualRent(60000);
    setInstallmentsCount(4);
    setSecurityDeposit(3000);
    setPaymentType('شيك');
    setNotes(`تأجير جديد للوحدة ${uNumber}`);
    setContractStatus('نشط');

    const initialInst = generateInstallments(60000, 4, todayStr);
    setInstallments(initialInst);
    setIsModalOpen(true);
  };

  const openRenewModal = (c: Contract) => {
    setRenewingContract(c);
    setBuildingName(c.buildingName);
    setArea(c.area);
    setUnitNumber(c.unitNumber);
    setUnitType(c.unitType);
    setOwnerName(c.ownerName);
    setTenantName(c.tenantName);
    setTenantPhone(c.tenantPhone);

    const newStart = c.endDate || new Date().toISOString().split('T')[0];
    setStartDate(newStart);

    const endD = new Date(newStart);
    endD.setFullYear(endD.getFullYear() + 1);
    setEndDate(endD.toISOString().split('T')[0]);

    setAnnualRent(c.annualRent);
    setInstallmentsCount(c.installmentsCount || 4);
    setSecurityDeposit(c.securityDeposit || 0);
    setPaymentType(c.paymentType || 'شيك');
    setNotes(`تجديد للعقد السابق للمستأجر ${c.tenantName} - مرجع العقد السابق: ${c.id}`);

    const initialInst = generateInstallments(c.annualRent, c.installmentsCount || 4, newStart);
    setInstallments(initialInst);
    setIsRenewModalOpen(true);
  };

  const handleRenewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewingContract) return;

    if (!tenantName.trim() || !unitNumber.trim() || !annualRent || annualRent <= 0) {
      alert('يرجى التأكد من ملء حقول المستأجر، رقم الوحدة والإيجار السنوي');
      return;
    }

    const finalInstallments = installments.length > 0 
      ? installments 
      : generateInstallments(Number(annualRent), Number(installmentsCount), startDate);

    // 1) Update original contract status to 'مجدد'
    onUpdateContract({
      ...renewingContract,
      status: 'مجدد'
    });

    // 2) Add new contract as 'نشط'
    onAddContract({
      buildingName,
      area,
      unitNumber,
      unitType,
      ownerName,
      tenantName,
      tenantPhone,
      startDate,
      endDate,
      annualRent: Number(annualRent),
      installmentsCount: Number(installmentsCount),
      securityDeposit: Number(securityDeposit || 0),
      paymentType,
      notes: notes.trim(),
      status: 'نشط',
      installments: finalInstallments
    });

    setIsRenewModalOpen(false);
    setRenewingContract(null);
    alert('تم تجديد العقد بنجاح! وتم تحويل العقد السابق بالسجل التاريخي للوحدة إلى (مجدد).');
  };

  const handleConfirmVacate = () => {
    if (!vacateContract) return;
    onUpdateContract({
      ...vacateContract,
      status: 'ملغى'
    });
    setVacateContract(null);
    alert(`تم إخلاء/إلغاء عقد الوحدة (${vacateContract.unitNumber}) بنجاح! أصبحت الوحدة الآن شغارة وفارغة للتأجير الجديد مع حفظ كافة البيانات بالسجل.`);
  };

  // Memoized Unit Directory List
  const allUnitsList = useMemo(() => {
    const map = new Map<string, { buildingName: string; unitNumber: string; unitType: string }>();

    if (settings.buildingDetails) {
      settings.buildingDetails.forEach(bldg => {
        bldg.units.forEach(u => {
          const key = `${bldg.name.trim()}:::${u.unitNumber.trim()}`;
          map.set(key, {
            buildingName: bldg.name.trim(),
            unitNumber: u.unitNumber.trim(),
            unitType: u.unitType || 'شقة سكنية'
          });
        });
      });
    }

    contracts.forEach(c => {
      const key = `${c.buildingName.trim()}:::${c.unitNumber.trim()}`;
      if (!map.has(key)) {
        map.set(key, {
          buildingName: c.buildingName.trim(),
          unitNumber: c.unitNumber.trim(),
          unitType: c.unitType || 'شقة سكنية'
        });
      }
    });

    return Array.from(map.values());
  }, [settings.buildingDetails, contracts]);

  const handleInstallmentChange = (index: number, field: keyof ContractInstallment, value: any) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName.trim() || !unitNumber.trim() || !annualRent || annualRent <= 0) {
      alert('يرجى التأكد من ملء حقول المستأجر، رقم الوحدة والإيجار السنوي');
      return;
    }

    const finalInstallments = installments.length > 0 
      ? installments 
      : generateInstallments(Number(annualRent), Number(installmentsCount), startDate);

    if (editingContract) {
      onUpdateContract({
        ...editingContract,
        buildingName,
        area,
        unitNumber,
        unitType,
        ownerName,
        tenantName,
        tenantPhone,
        startDate,
        endDate,
        annualRent: Number(annualRent),
        installmentsCount: Number(installmentsCount),
        securityDeposit: Number(securityDeposit || 0),
        paymentType,
        notes: notes.trim(),
        status: contractStatus,
        installments: finalInstallments
      });
    } else {
      onAddContract({
        buildingName,
        area,
        unitNumber,
        unitType,
        ownerName,
        tenantName,
        tenantPhone,
        startDate,
        endDate,
        annualRent: Number(annualRent),
        installmentsCount: Number(installmentsCount),
        securityDeposit: Number(securityDeposit || 0),
        paymentType,
        notes: notes.trim(),
        status: contractStatus,
        installments: finalInstallments
      });
    }
    setIsModalOpen(false);
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedBuilding('ALL');
    setSelectedStatus('ALL');
    setSelectedExpiryFilter('ALL');
    setSelectedUnitType('ALL');
    setSelectedPaymentType('ALL');
    setMinRent('');
    setMaxRent('');
    setStartDateFrom('');
    setStartDateTo('');
    setEndDateFrom('');
    setEndDateTo('');
  };

  const hasActiveFilters = useMemo(() => {
    return !!(
      searchTerm ||
      selectedBuilding !== 'ALL' ||
      selectedStatus !== 'ALL' ||
      selectedExpiryFilter !== 'ALL' ||
      selectedUnitType !== 'ALL' ||
      selectedPaymentType !== 'ALL' ||
      minRent !== '' ||
      maxRent !== '' ||
      startDateFrom ||
      startDateTo ||
      endDateFrom ||
      endDateTo
    );
  }, [
    searchTerm,
    selectedBuilding,
    selectedStatus,
    selectedExpiryFilter,
    selectedUnitType,
    selectedPaymentType,
    minRent,
    maxRent,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo
  ]);

  // Filtered logic
  const today = new Date();
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const query = searchTerm.trim().toLowerCase();
      const matchesSearch = !query ||
        c.tenantName.toLowerCase().includes(query) ||
        c.buildingName.toLowerCase().includes(query) ||
        c.unitNumber.toLowerCase().includes(query) ||
        c.area.toLowerCase().includes(query) ||
        c.ownerName.toLowerCase().includes(query) ||
        (c.tenantPhone && c.tenantPhone.toLowerCase().includes(query)) ||
        (c.notes && c.notes.toLowerCase().includes(query));

      const matchesBuilding = selectedBuilding === 'ALL' || c.buildingName === selectedBuilding;
      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      const matchesUnitType = selectedUnitType === 'ALL' || c.unitType === selectedUnitType;
      const matchesPaymentType = selectedPaymentType === 'ALL' || c.paymentType === selectedPaymentType;

      // Expiry filter (30, 60, 90 days)
      let matchesExpiry = true;
      if (selectedExpiryFilter !== 'ALL') {
        const endD = new Date(c.endDate);
        const diffDays = Math.ceil((endD.getTime() - today.getTime()) / (1000 * 3600 * 24));
        const maxDays = Number(selectedExpiryFilter);
        matchesExpiry = diffDays <= maxDays;
      }

      // Rent Range
      const matchesMinRent = minRent === '' || c.annualRent >= Number(minRent);
      const matchesMaxRent = maxRent === '' || c.annualRent <= Number(maxRent);

      // Start Date Range
      const matchesStartDateFrom = !startDateFrom || c.startDate >= startDateFrom;
      const matchesStartDateTo = !startDateTo || c.startDate <= startDateTo;

      // End Date Range
      const matchesEndDateFrom = !endDateFrom || c.endDate >= endDateFrom;
      const matchesEndDateTo = !endDateTo || c.endDate <= endDateTo;

      return matchesSearch && matchesBuilding && matchesStatus && matchesExpiry && matchesUnitType && matchesPaymentType && matchesMinRent && matchesMaxRent && matchesStartDateFrom && matchesStartDateTo && matchesEndDateFrom && matchesEndDateTo;
    });
  }, [
    contracts,
    searchTerm,
    selectedBuilding,
    selectedStatus,
    selectedExpiryFilter,
    selectedUnitType,
    selectedPaymentType,
    minRent,
    maxRent,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    today
  ]);

  const filteredUnitsList = useMemo(() => {
    return allUnitsList.filter(unit => {
      // Building Filter
      if (selectedUnitBuildingFilter !== 'ALL' && unit.buildingName !== selectedUnitBuildingFilter) {
        return false;
      }

      // Unit contracts
      const uContracts = contracts.filter(c => c.buildingName === unit.buildingName && c.unitNumber === unit.unitNumber);
      const activeContract = uContracts.find(c => c.status === 'نشط');
      const latestContract = [...uContracts].sort((a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime())[0];

      let isExpired = false;
      if (activeContract) {
        const daysLeft = Math.ceil((new Date(activeContract.endDate).getTime() - today.getTime()) / (1000 * 3600 * 24));
        if (daysLeft <= 0) isExpired = true;
      } else if (latestContract && latestContract.status === 'منتهي') {
        isExpired = true;
      }

      const isOccupied = activeContract && !isExpired;
      const isVacant = !isOccupied && !isExpired;

      // Occupancy Filter
      if (selectedUnitOccupancyFilter === 'OCCUPIED' && !isOccupied) return false;
      if (selectedUnitOccupancyFilter === 'VACANT' && !isVacant) return false;
      if (selectedUnitOccupancyFilter === 'EXPIRED' && !isExpired) return false;

      // Search Query
      if (unitSearchQuery.trim()) {
        const q = unitSearchQuery.trim().toLowerCase();
        const matchesUnit = unit.unitNumber.toLowerCase().includes(q) || unit.buildingName.toLowerCase().includes(q) || unit.unitType.toLowerCase().includes(q);
        const matchesTenant = uContracts.some(c => c.tenantName.toLowerCase().includes(q) || (c.tenantPhone && c.tenantPhone.toLowerCase().includes(q)));
        if (!matchesUnit && !matchesTenant) return false;
      }

      return true;
    });
  }, [allUnitsList, contracts, selectedUnitBuildingFilter, selectedUnitOccupancyFilter, unitSearchQuery, today]);

  return (
    <div className="space-y-6">
      {/* Official Print Header for Contract Schedule */}
      {viewingContract ? (
        <PrintHeader 
          settings={settings}
          title={`تفاصيل العقد وجدول الدفعات - ${viewingContract.buildingName} (${viewingContract.unitNumber})`}
          subtitle={`المستأجر: ${viewingContract.tenantName} | المالك: ${viewingContract.ownerName}`}
          dateRange={`فترة العقد: من ${viewingContract.startDate} إلى ${viewingContract.endDate}`}
        />
      ) : (
        <PrintHeader 
          settings={settings}
          title="كشف عقود الإيجار والوحدات العقارية"
          subtitle={`إجمالي العقود المعروضة: ${filteredContracts.length}`}
        />
      )}

      {/* Tab Navigation */}
      <div className="flex items-center gap-3 border-b border-slate-200 pb-3 no-print">
        <button
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'list'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>قائمة عقود الإيجار ({filteredContracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('units')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'units'
              ? 'bg-slate-900 text-amber-400 shadow-sm'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building className="w-4 h-4 text-blue-500" />
          <span>سجل وتأجير الوحدات العقارية ({allUnitsList.length} وحدة)</span>
        </button>
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setSelectedExpiryFilter('ALL');
              setSelectedStatus('ALL');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedExpiryFilter === 'ALL' && selectedStatus === 'ALL' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            جميع العقود ({contracts.length})
          </button>
          <button
            onClick={() => setSelectedExpiryFilter('30')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedExpiryFilter === '30' ? 'bg-red-600 text-white shadow-xs' : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            تنتهي خلال 30 يوماً
          </button>
          <button
            onClick={() => setSelectedExpiryFilter('60')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedExpiryFilter === '60' ? 'bg-amber-600 text-white shadow-xs' : 'bg-amber-50 text-amber-800 border border-amber-200'
            }`}
          >
            تنتهي خلال 60 يوماً
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onPrint('.contract-print-wrapper')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors border border-slate-300"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة القائمة</span>
          </button>

          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء عقد إيجار جديد</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Container */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3 no-print">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="بحث بالكلمة المفتاحية (اسم المستأجر، المالك، البناية، رقم الوحدة، هاتف المستأجر)..."
              className="w-full pl-9 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-2.5" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute left-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Select Building */}
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع البنايات</option>
            {settings.buildings.map((b, idx) => (
              <option key={idx} value={b}>{b}</option>
            ))}
          </select>

          {/* Quick Select Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">جميع الحالات</option>
            <option value="نشط">نشط</option>
            <option value="منتهي">منتهي</option>
            <option value="ملغى">ملغى</option>
          </select>

          {/* Toggle Advanced Filters Button */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border ${
              showAdvancedFilters || hasActiveFilters
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>فلاتر متقدمة</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
            )}
          </button>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold border border-red-200"
              title="مسح جميع الفلاتر"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>إعادة ضبط</span>
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50/50 p-3 rounded-lg text-xs">
            {/* Unit Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">نوع العقار/الوحدة:</label>
              <select
                value={selectedUnitType}
                onChange={(e) => setSelectedUnitType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">جميع الأنواع</option>
                {settings.unitTypes.map((ut, idx) => (
                  <option key={idx} value={ut}>{ut}</option>
                ))}
              </select>
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">طريقة الدفع الرئيسية:</label>
              <select
                value={selectedPaymentType}
                onChange={(e) => setSelectedPaymentType(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ALL">جميع الطرق</option>
                <option value="شيك">شيك</option>
                <option value="نقد">نقد</option>
                <option value="تحويل">تحويل بنكي</option>
              </select>
            </div>

            {/* Min Rent */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أقل قيمة إيجار سنوي:</label>
              <input
                type="number"
                value={minRent}
                onChange={(e) => setMinRent(e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Max Rent */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">أعلى قيمة إيجار سنوي:</label>
              <input
                type="number"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value ? Number(e.target.value) : '')}
                placeholder="غير محدد"
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* Start Date From & To */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">تاريخ بدايه العقد (من):</label>
              <input
                type="date"
                value={startDateFrom}
                onChange={(e) => setStartDateFrom(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">تاريخ بداية العقد (إلى):</label>
              <input
                type="date"
                value={startDateTo}
                onChange={(e) => setStartDateTo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            {/* End Date From & To */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">تاريخ نهاية العقد (من):</label>
              <input
                type="date"
                value={endDateFrom}
                onChange={(e) => setEndDateFrom(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">تاريخ نهاية العقد (إلى):</label>
              <input
                type="date"
                value={endDateTo}
                onChange={(e) => setEndDateTo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        )}

        {/* Results Bar */}
        <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
          <span>تم العثور على <strong className="text-slate-900 font-bold">{filteredContracts.length}</strong> عقداً إيجارياً</span>
          <span>إجمالي الإيجارات المعروضة: <strong className="text-blue-600 font-bold font-mono">{filteredContracts.reduce((sum, c) => sum + c.annualRent, 0).toLocaleString('ar-AE')} درهم</strong></span>
        </div>
      </div>

      {/* Contracts Table View */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">العقار والوحدة</th>
                  <th className="p-3">اسم المستأجر والتلفون</th>
                  <th className="p-3">اسم المالك</th>
                  <th className="p-3">فترة العقد</th>
                  <th className="p-3">الإيجار السنوي</th>
                  <th className="p-3">الدفعات</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3 no-print">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredContracts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      لا توجد عقود مسجلة مطابقة للبحث والتصفية.
                    </td>
                  </tr>
                ) : (
                  filteredContracts.map((c) => {
                    const endD = new Date(c.endDate);
                    const daysLeft = Math.ceil((endD.getTime() - today.getTime()) / (1000 * 3600 * 24));
                    const uncollectedCount = c.installments.filter(i => i.status === 'غير محصل').length;

                    return (
                      <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.buildingName} - {c.unitNumber}</div>
                          <div className="text-[10px] text-slate-500">{c.area} ({c.unitType})</div>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-slate-900">{c.tenantName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{c.tenantPhone}</div>
                        </td>
                        <td className="p-3 font-bold text-slate-700">{c.ownerName}</td>
                        <td className="p-3">
                          <div className="font-mono text-[11px] text-slate-800">{c.startDate} إلى {c.endDate}</div>
                          {daysLeft <= 90 && c.status === 'نشط' && (
                            <div className={`text-[10px] font-bold mt-0.5 ${daysLeft <= 30 ? 'text-red-600' : 'text-amber-600'}`}>
                              {daysLeft <= 0 ? 'منتهي' : `متبقي ${daysLeft} يوم`}
                            </div>
                          )}
                        </td>
                        <td className="p-3 font-mono font-extrabold text-slate-900 text-sm">
                          {c.annualRent.toLocaleString('ar-AE')} <span className="text-[10px] text-slate-500">درهم</span>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 rounded font-bold text-[10px]">
                            {c.installmentsCount} دفعات ({c.paymentType})
                          </span>
                          {uncollectedCount > 0 && (
                            <div className="text-[10px] text-red-600 font-bold mt-0.5">
                              {uncollectedCount} غير محصلة
                            </div>
                          )}
                        </td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                            c.status === 'نشط' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            c.status === 'مجدد' ? 'bg-blue-100 text-blue-800 border border-blue-300' :
                            c.status === 'منتهي' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                            'bg-slate-100 text-slate-600 border border-slate-300'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-3 no-print whitespace-nowrap">
                          {(() => {
                            const contractActions: ActionMenuItem[] = [
                              {
                                label: 'عرض العقد والدفعات',
                                icon: <Eye className="w-4 h-4 text-emerald-600" />,
                                onClick: () => setViewingContract(c)
                              }
                            ];

                            if (c.status === 'نشط' || c.status === 'منتهي') {
                              contractActions.push({
                                label: 'تجديد العقد',
                                icon: <RotateCcw className="w-4 h-4 text-emerald-600" />,
                                onClick: () => openRenewModal(c),
                                variant: 'success'
                              });
                            }

                            if (c.status === 'نشط') {
                              contractActions.push({
                                label: 'إخلاء الشقة / إلغاء العقد',
                                icon: <XCircle className="w-4 h-4 text-amber-600" />,
                                onClick: () => setVacateContract(c),
                                variant: 'warning'
                              });
                            }

                            contractActions.push(
                              {
                                label: 'تعديل بيانات العقد',
                                icon: <Edit2 className="w-4 h-4 text-blue-600" />,
                                onClick: () => openEditModal(c),
                                variant: 'info'
                              },
                              {
                                label: 'حذف العقد',
                                icon: <Trash2 className="w-4 h-4 text-red-600" />,
                                onClick: () => setDeleteId(c.id),
                                variant: 'danger'
                              }
                            );

                            return <ActionMenu items={contractActions} />;
                          })()}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Unit Directory & Rental Log View */}
      {activeTab === 'units' && (
        <div className="space-y-6">
          {/* Unit Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="البحث برقم الوحدة، اسم البناية، أو اسم المستأجر..."
                  value={unitSearchQuery}
                  onChange={(e) => setUnitSearchQuery(e.target.value)}
                  className="w-full pr-9 pl-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <select
                  value={selectedUnitBuildingFilter}
                  onChange={(e) => setSelectedUnitBuildingFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">جميع البنايات ({settings.buildings.length})</option>
                  {settings.buildings.map((bldg, idx) => (
                    <option key={idx} value={bldg}>{bldg}</option>
                  ))}
                </select>

                <select
                  value={selectedUnitOccupancyFilter}
                  onChange={(e) => setSelectedUnitOccupancyFilter(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ALL">جميع الحالات</option>
                  <option value="OCCUPIED">🟢 مؤجرة (عقد نشط)</option>
                  <option value="EXPIRED">🟡 عقد منتهي (يحتاج تجديد)</option>
                  <option value="VACANT">⚪ فارغة / شغارة</option>
                </select>

                <button
                  onClick={openAddModal}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>عقد إيجار جديد</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
              <span>عدد الوحدات المعروضة: <strong className="text-slate-900 font-bold">{filteredUnitsList.length}</strong> من أصل {allUnitsList.length} وحدة</span>
              <span>الوحدات المؤجرة: <strong className="text-emerald-600 font-bold">{allUnitsList.filter(u => {
                const active = contracts.find(c => c.buildingName === u.buildingName && c.unitNumber === u.unitNumber && c.status === 'نشط');
                return active && new Date(active.endDate).getTime() > today.getTime();
              }).length}</strong> | الشغارة: <strong className="text-slate-700 font-bold">{allUnitsList.filter(u => {
                const active = contracts.find(c => c.buildingName === u.buildingName && c.unitNumber === u.unitNumber && c.status === 'نشط');
                return !active;
              }).length}</strong></span>
            </div>
          </div>

          {/* Unit Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUnitsList.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
                لا توجد وحدات عقارية مطابقة للتصفية.
              </div>
            ) : (
              filteredUnitsList.map((unit) => {
                const unitContracts = contracts.filter(c => c.buildingName === unit.buildingName && c.unitNumber === unit.unitNumber);
                const sortedUnitContracts = [...unitContracts].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
                
                const activeContract = unitContracts.find(c => c.status === 'نشط');
                const latestContract = sortedUnitContracts[0];

                let isExpired = false;
                let daysLeft = 0;

                if (activeContract) {
                  const endD = new Date(activeContract.endDate);
                  daysLeft = Math.ceil((endD.getTime() - today.getTime()) / (1000 * 3600 * 24));
                  if (daysLeft <= 0) isExpired = true;
                } else if (latestContract && latestContract.status === 'منتهي') {
                  isExpired = true;
                }

                const isOccupied = activeContract && !isExpired;

                return (
                  <div key={`${unit.buildingName}-${unit.unitNumber}`} className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col justify-between hover:border-slate-300 transition-all">
                    {/* Card Header */}
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 font-extrabold text-slate-900 text-sm">
                          <Building className="w-4 h-4 text-blue-600" />
                          <span>{unit.buildingName} - {unit.unitNumber}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                          {unit.unitType}
                        </div>
                      </div>

                      {isOccupied && (
                        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md text-[10px] font-extrabold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>مؤجرة (نشط)</span>
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-md text-[10px] font-extrabold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>عقد منتهي</span>
                        </span>
                      )}
                      {!isOccupied && !isExpired && (
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 border border-slate-300 rounded-md text-[10px] font-bold flex items-center gap-1">
                          <Home className="w-3 h-3 text-slate-500" />
                          <span>فارغة / شغارة</span>
                        </span>
                      )}
                    </div>

                    {/* Card Body */}
                    <div className="p-4 space-y-3 text-xs flex-1">
                      {isOccupied && activeContract ? (
                        <div className="bg-emerald-50/60 p-3 rounded-lg border border-emerald-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-emerald-800">المستأجر الحالي:</span>
                            <span className="font-extrabold text-slate-900 text-xs">{activeContract.tenantName}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">رقم الهاتف:</span>
                            <span className="font-mono font-bold text-slate-800">{activeContract.tenantPhone}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">فترة العقد:</span>
                            <span className="font-mono text-slate-700">{activeContract.startDate} إلى {activeContract.endDate}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-emerald-200/60">
                            <span className="text-slate-500">الإيجار السنوي:</span>
                            <span className="font-mono font-extrabold text-emerald-700">{activeContract.annualRent.toLocaleString('ar-AE')} درهم</span>
                          </div>
                          {daysLeft <= 90 && (
                            <div className={`text-[10px] font-bold text-center pt-1 ${daysLeft <= 30 ? 'text-red-600' : 'text-amber-700'}`}>
                              متبقي على نهاية العقد {daysLeft} يوم
                            </div>
                          )}
                        </div>
                      ) : isExpired && latestContract ? (
                        <div className="bg-amber-50/60 p-3 rounded-lg border border-amber-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-amber-900">آخر مستأجر (عقد منتهي):</span>
                            <span className="font-extrabold text-slate-900 text-xs">{latestContract.tenantName}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">رقم الهاتف:</span>
                            <span className="font-mono font-bold text-slate-800">{latestContract.tenantPhone}</span>
                          </div>
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-500">انتهى بتاريخ:</span>
                            <span className="font-mono text-red-600 font-bold">{latestContract.endDate}</span>
                          </div>
                          <div className="text-[10px] text-amber-800 font-medium bg-amber-100/50 p-1.5 rounded text-center">
                            يمكنك تجديد العقد لنفس المستأجر أو إخلاء الوحدة لتأجيرها لمستأجر جديد
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-center space-y-1">
                          <div className="font-bold text-slate-700 text-xs">الوحدة متوفرة وجاهزة للتأجير</div>
                          <div className="text-[11px] text-slate-500">لا يوجد عقد نشط حالياً لهذه الوحدة</div>
                        </div>
                      )}

                      {/* Unit History Log Section */}
                      <div className="pt-2 border-t border-slate-100">
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                            <History className="w-3.5 h-3.5 text-slate-500" />
                            <span>سجل العقود السابقة ({unitContracts.length})</span>
                          </span>
                        </div>

                        {unitContracts.length === 0 ? (
                          <div className="text-[10px] text-slate-400 italic">لا توجد عقود سابقة مسجلة بهذه الوحدة.</div>
                        ) : (
                          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-[11px]">
                            {sortedUnitContracts.map((uc) => (
                              <div key={uc.id} className="p-2 bg-slate-50 rounded border border-slate-100 flex items-center justify-between">
                                <div>
                                  <div className="font-bold text-slate-800">{uc.tenantName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono">{uc.startDate} - {uc.endDate}</div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                    uc.status === 'نشط' ? 'bg-emerald-100 text-emerald-800' :
                                    uc.status === 'مجدد' ? 'bg-blue-100 text-blue-800' :
                                    uc.status === 'منتهي' ? 'bg-amber-100 text-amber-800' :
                                    'bg-slate-200 text-slate-700'
                                  }`}>
                                    {uc.status}
                                  </span>
                                  <button
                                    onClick={() => setViewingContract(uc)}
                                    className="p-1 text-slate-600 hover:text-blue-600 hover:bg-white rounded transition-colors"
                                    title="عرض العقد والدفعات"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions Footer */}
                    <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => setUnitStatementTarget({ buildingName: unit.buildingName, unitNumber: unit.unitNumber })}
                        className="px-2.5 py-1.5 bg-slate-900 text-amber-400 hover:bg-slate-800 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                        title="طباعة كشف شامل ومُعتمَد للشقة"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>كشف الشقة</span>
                      </button>

                      <div className="flex items-center gap-2">
                        {isOccupied && activeContract && (
                          <>
                            <button
                              onClick={() => openRenewModal(activeContract)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>تجديد العقد</span>
                            </button>
                            <button
                              onClick={() => setVacateContract(activeContract)}
                              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>إخلاء الوحدة</span>
                            </button>
                          </>
                        )}

                        {isExpired && latestContract && (
                          <>
                            <button
                              onClick={() => openRenewModal(latestContract)}
                              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>تجديد العقد</span>
                            </button>
                            <button
                              onClick={() => openAddModalForUnit(unit.buildingName, unit.unitNumber, unit.unitType)}
                              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>تأجير جديد</span>
                            </button>
                          </>
                        )}

                        {!isOccupied && !isExpired && (
                          <button
                            onClick={() => openAddModalForUnit(unit.buildingName, unit.unitNumber, unit.unitType)}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>تأجير جديد</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* View Contract & Payment Schedule Modal */}
      {viewingContract && (
        <Modal
          isOpen={!!viewingContract}
          onClose={() => setViewingContract(null)}
          title={`جدول دفعات العقد: ${viewingContract.buildingName} - ${viewingContract.unitNumber}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-6">
            {/* Contract Summary Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 font-bold block">المستأجر:</span>
                <span className="font-bold text-slate-900 text-sm">{viewingContract.tenantName}</span>
                <span className="text-slate-500 block font-mono">{viewingContract.tenantPhone}</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">المالك والعقار:</span>
                <span className="font-bold text-slate-900">{viewingContract.ownerName}</span>
                <span className="text-slate-500 block">{viewingContract.buildingName} ({viewingContract.area})</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">الإيجار والتأمين:</span>
                <span className="font-bold text-emerald-700 text-sm">{viewingContract.annualRent.toLocaleString('ar-AE')} درهم/سنة</span>
                <span className="text-slate-500 block">التأمين: {viewingContract.securityDeposit} درهم</span>
              </div>
              <div>
                <span className="text-slate-500 font-bold block">فترة العقد:</span>
                <span className="font-bold text-slate-900 font-mono">{viewingContract.startDate} إلى {viewingContract.endDate}</span>
                <span className="text-slate-500 block font-bold text-amber-600">{viewingContract.status}</span>
              </div>
            </div>

            {/* Payment Schedule Table */}
            <div>
              <h4 className="font-bold text-slate-900 text-sm mb-2">جدول الدفعات المخططة والتحصيل:</h4>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-900 text-white font-bold">
                    <tr>
                      <th className="p-2.5">رقم الدفعة</th>
                      <th className="p-2.5">تاريخ الاستحقاق</th>
                      <th className="p-2.5">المبلغ (درهم)</th>
                      <th className="p-2.5">رقم الشيك / المرجع</th>
                      <th className="p-2.5">اسم البنك</th>
                      <th className="p-2.5">حالة وتاريخ التحصيل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {viewingContract.installments.map((inst) => (
                      <tr key={inst.id} className="hover:bg-slate-50">
                        <td className="p-2.5 font-bold">الدفعة #{inst.installmentNo}</td>
                        <td className="p-2.5 font-mono text-slate-800">{inst.dueDate}</td>
                        <td className="p-2.5 font-mono font-bold text-slate-900">{inst.amount.toLocaleString('ar-AE')}</td>
                        <td className="p-2.5 font-mono">{inst.chequeNumber || '-'}</td>
                        <td className="p-2.5">{inst.bankName || '-'}</td>
                        <td className="p-2.5">
                          {inst.status === 'محصل' ? (
                            <div className="space-y-0.5">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 inline-block">
                                مكتمل ومستلم
                              </span>
                              <div className="text-[10px] font-mono text-emerald-700 font-bold">
                                تاريخ التحصيل: {formatCompletionDateTime(inst.completedAt, inst.collectedDate)}
                              </div>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800 border border-red-300">
                              غير محصل
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between no-print pt-2">
              <button
                onClick={() => onPrint('.contract-detail-print-report')}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs cursor-pointer hover:bg-slate-800 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة جدول العقد</span>
              </button>
              <button
                onClick={() => setViewingContract(null)}
                className="px-4 py-2 border border-slate-300 text-slate-700 font-bold rounded-lg text-xs cursor-pointer hover:bg-slate-100 transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Dedicated Printable A4 Document for Contract Details & Payment Schedule */}
      {viewingContract && (
        <div className="contract-print-wrapper contract-detail-print-report hidden print:block text-right dir-rtl font-sans bg-white text-slate-900 p-6 leading-normal text-xs">
          {/* Top Banner */}
          <PrintLetterhead settings={settings} />

          {/* Document Title Box */}
          <div className="mb-5 p-3 bg-slate-100 rounded-lg border border-slate-300 text-center">
            <h1 className="text-lg font-black text-slate-900 tracking-tight mb-1">
              كشف وتفاصيل عقد الإيجار وجدول الدفعات
            </h1>
            <h2 className="text-sm font-bold text-slate-800 mb-2">
              {viewingContract.buildingName} - شقة / وحدة رقم ({viewingContract.unitNumber})
            </h2>

            <div className="flex items-center justify-center gap-4 text-[11px] font-medium text-slate-700 border-t border-slate-200 pt-2 mt-1">
              <span>
                رقم العقد:{' '}
                <strong className="font-mono text-slate-900">
                  CNT-{viewingContract.buildingName.replace(/\s+/g, '')}-{viewingContract.unitNumber}
                </strong>
              </span>
              <span>•</span>
              <span>
                المستأجر:{' '}
                <strong className="text-slate-900">{viewingContract.tenantName}</strong>
              </span>
              <span>•</span>
              <span>
                حالة العقد:{' '}
                <strong className="text-slate-900">{viewingContract.status}</strong>
              </span>
            </div>
          </div>

          {/* Basic Contract Info Table */}
          <div className="mb-5 print-section">
            <h3 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
              بيانات العقد والأطراف المتعاقدة:
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden bg-white text-xs">
              <table className="contract-info-print-table w-full text-right border-collapse">
                <tbody>
                  <tr>
                    <th>اسم المستأجر الرسمي:</th>
                    <td>{viewingContract.tenantName || '—'}</td>
                  </tr>
                  <tr>
                    <th>رقم هاتف المستأجر:</th>
                    <td dir="ltr">{viewingContract.tenantPhone || '—'}</td>
                  </tr>
                  <tr>
                    <th>اسم المالك والعقار:</th>
                    <td>{viewingContract.ownerName} ({viewingContract.buildingName})</td>
                  </tr>
                  <tr>
                    <th>رقم الشقة / المنطقة:</th>
                    <td>شقة {viewingContract.unitNumber} - {viewingContract.area}</td>
                  </tr>
                  <tr>
                    <th>فترة العقد المبرمة:</th>
                    <td>من {viewingContract.startDate} إلى {viewingContract.endDate}</td>
                  </tr>
                  <tr>
                    <th>الإيجار السنوي المتفق عليه:</th>
                    <td>{viewingContract.annualRent.toLocaleString('ar-AE')} درهم</td>
                  </tr>
                  <tr>
                    <th>مبلغ تأمين العقد:</th>
                    <td>{viewingContract.securityDeposit.toLocaleString('ar-AE')} درهم</td>
                  </tr>
                  <tr>
                    <th>طريقة السداد وعدد الأقساط:</th>
                    <td>{viewingContract.paymentType} ({viewingContract.installmentsCount} أقساط)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Schedule Table */}
          <div className="mb-5 print-section">
            <h3 className="font-bold text-xs text-slate-900 mb-2 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-slate-900 inline-block rounded-xs"></span>
              جدول الدفعات المخططة وحالة التحصيل:
            </h3>
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <table className="cost-table w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-bold border-b border-slate-300">
                    <th className="p-2.5 border-l border-slate-300 text-center w-16">الدفعة #</th>
                    <th className="p-2.5 border-l border-slate-300 text-center w-28">تاريخ الاستحقاق</th>
                    <th className="p-2.5 border-l border-slate-300 text-center w-32">المبلغ (درهم)</th>
                    <th className="p-2.5 border-l border-slate-300 text-right">رقم الشيك / المرجع</th>
                    <th className="p-2.5 border-l border-slate-300 text-right">اسم البنك</th>
                    <th className="p-2.5 text-center w-36">حالة التحصيل</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {viewingContract.installments.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-50">
                      <td className="p-2.5 border-l border-slate-200 text-center font-bold text-slate-900">
                        #{inst.installmentNo}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono text-slate-900">
                        {inst.dueDate}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 text-center font-mono font-bold text-slate-900 whitespace-nowrap">
                        {inst.amount.toLocaleString('ar-AE')} درهم
                      </td>
                      <td className="p-2.5 border-l border-slate-200 font-mono text-slate-800">
                        {inst.chequeNumber || '-'}
                      </td>
                      <td className="p-2.5 border-l border-slate-200 text-slate-800">
                        {inst.bankName || '-'}
                      </td>
                      <td className="p-2.5 text-center font-bold">
                        {inst.status === 'محصل' ? (
                          <span className="text-emerald-800 font-bold">محصل ومستلم</span>
                        ) : (
                          <span className="text-amber-800 font-bold">غير محصل</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-100 font-bold border-t border-slate-300">
                  <tr>
                    <td colSpan={2} className="p-2.5 border-l border-slate-300 text-slate-900">
                      الإجمالي الكلي لجدول الدفعات:
                    </td>
                    <td className="p-2.5 border-l border-slate-300 text-center font-mono text-slate-900 text-sm">
                      {viewingContract.installments.reduce((sum, i) => sum + i.amount, 0).toLocaleString('ar-AE')} درهم
                    </td>
                    <td colSpan={3} className="p-2.5 text-slate-600 font-normal">
                      عدد الدفعات: {viewingContract.installments.length} دفعات
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

        </div>
      )}

      <ContractRegisterPrintTemplate
        contracts={filteredContracts}
        settings={settings}
        searchTerm={searchTerm}
        selectedBuilding={selectedBuilding}
        selectedStatus={selectedStatus}
        selectedUnitType={selectedUnitType}
        selectedPaymentType={selectedPaymentType}
        active={activeTab === 'list' && !viewingContract}
      />

      {/* Add / Edit Contract Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContract ? 'تعديل عقد الإيجار' : 'إنشاء عقد إيجار وجدول دفعات'}
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم البناية *</label>
              <select
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                {settings.buildings.map((b, idx) => (
                  <option key={idx} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Quick registered unit picker */}
            {(() => {
              const bDetail = (settings.buildingDetails || []).find(b => b.name === buildingName);
              if (bDetail && bDetail.units && bDetail.units.length > 0) {
                return (
                  <div className="col-span-full bg-amber-50/80 p-2.5 rounded-xl border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-amber-600" />
                      اختر وحدة مسجلة تلقائياً في ({buildingName}):
                    </span>
                    <select
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        const found = bDetail.units.find(u => u.id === selectedId);
                        if (found) {
                          setUnitNumber(found.unitNumber);
                          setUnitType(found.unitType);
                        }
                      }}
                      className="px-3 py-1 bg-white border border-amber-300 text-slate-900 font-bold rounded-lg text-xs focus:outline-none"
                    >
                      <option value="">-- اختر من قائمة الوحدات العقارية --</option>
                      {bDetail.units.map(u => (
                        <option key={u.id} value={u.id}>{u.unitNumber} - ({u.unitType})</option>
                      ))}
                    </select>
                  </div>
                );
              }
              return null;
            })()}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة *</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="اسم المنطقة"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الوحدة *</label>
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                placeholder="مثال: شقة 302"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">نوع الوحدة *</label>
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                {settings.unitTypes.map((t, idx) => (
                  <option key={idx} value={t}>{t}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المالك *</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="اسم مالك العقار"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستأجر *</label>
              <input
                type="text"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="اسم المستأجر الثلاثي"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">هاتف المستأجر *</label>
              <input
                type="text"
                value={tenantPhone}
                onChange={(e) => setTenantPhone(e.target.value)}
                placeholder="+971 50 000 0000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ بداية العقد *</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ نهاية العقد *</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الإيجار السنوي (درهم) *</label>
              <input
                type="number"
                value={annualRent}
                onChange={(e) => setAnnualRent(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="60000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عدد أقساط/دفعات العقد (1 إلى 12 قسط) *</label>
              <select
                value={installmentsCount}
                onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
              >
                <option value={1}>1 قسط (دفعة سنوية واحدة)</option>
                <option value={2}>2 قسطين (نصف سنوي - كل 6 أشهر)</option>
                <option value={3}>3 أقساط (كل 4 أشهر)</option>
                <option value={4}>4 أقساط (ربع سنوي - كل 3 أشهر)</option>
                <option value={5}>5 أقساط</option>
                <option value={6}>6 أقساط (كل شهرين)</option>
                <option value={7}>7 أقساط</option>
                <option value={8}>8 أقساط</option>
                <option value={9}>9 أقساط</option>
                <option value={10}>10 أقساط</option>
                <option value={11}>11 قسط</option>
                <option value={12}>12 قسط (شهري - كل شهر)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">مبلغ التأمين (درهم)</label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="3000"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">طريقة الدفع *</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="شيك">شيكات بنكية</option>
                <option value="نقد">نقد</option>
                <option value="تحويل">تحويل بنكي</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">حالة العقد *</label>
              <select
                value={contractStatus}
                onChange={(e) => setContractStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              >
                <option value="نشط">نشط</option>
                <option value="منتهي">منتهي</option>
                <option value="ملغى">ملغى</option>
              </select>
            </div>
          </div>

          {/* Auto Generate Button & Editable Table for Installments */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-xs text-slate-900">جدول الدفعات (توليد تلقائي مع تعديل يدوي):</h4>
              <button
                type="button"
                onClick={handleAutoGenerateClick}
                className="px-3 py-1 bg-slate-900 text-amber-400 font-bold rounded text-xs hover:bg-slate-800 transition-colors"
              >
                إعادة توليد الجدول تلقائياً
              </button>
            </div>

            <div className="overflow-x-auto max-h-48 border border-slate-200 rounded-lg">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 text-slate-800 font-bold sticky top-0">
                  <tr>
                    <th className="p-2">الدفعة #</th>
                    <th className="p-2">تاريخ الاستحقاق</th>
                    <th className="p-2">المبلغ (درهم)</th>
                    <th className="p-2">رقم الشيك</th>
                    <th className="p-2">اسم البنك</th>
                    <th className="p-2">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {installments.map((inst, index) => (
                    <tr key={inst.id}>
                      <td className="p-2 font-bold">#{inst.installmentNo}</td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={inst.dueDate}
                          onChange={(e) => handleInstallmentChange(index, 'dueDate', e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={inst.amount}
                          onChange={(e) => handleInstallmentChange(index, 'amount', Number(e.target.value))}
                          className="w-24 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={inst.chequeNumber || ''}
                          onChange={(e) => handleInstallmentChange(index, 'chequeNumber', e.target.value)}
                          placeholder="رقم الشيك"
                          className="w-28 px-2 py-1 bg-white border border-slate-300 rounded font-mono text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={inst.bankName || ''}
                          onChange={(e) => handleInstallmentChange(index, 'bankName', e.target.value)}
                          placeholder="اسم البنك"
                          className="w-28 px-2 py-1 bg-white border border-slate-300 rounded text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          value={inst.status}
                          onChange={(e) => handleInstallmentChange(index, 'status', e.target.value)}
                          className="px-2 py-1 bg-white border border-slate-300 rounded text-xs font-bold"
                        >
                          <option value="غير محصل">غير محصل</option>
                          <option value="محصل">محصل</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات العقد</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="شروط إضافية أو ملاحظات..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-md"
            >
              {editingContract ? 'حفظ التعديلات' : 'حفظ العقد والدفعات'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (deleteId) onDeleteContract(deleteId);
        }}
        title="حذف عقد الإيجار"
        message="هل أنت أكتأد من حذف هذا العقد وجميع دفعاته؟ لا يمكن التراجع عن هذا الإجراء."
      />

      {/* Renewal Modal */}
      {isRenewModalOpen && renewingContract && (
        <Modal
          isOpen={isRenewModalOpen}
          onClose={() => {
            setIsRenewModalOpen(false);
            setRenewingContract(null);
          }}
          title={`تجديد عقد الإيجار: ${renewingContract.buildingName} - وحدة (${renewingContract.unitNumber})`}
          maxWidth="max-w-3xl"
        >
          <form onSubmit={handleRenewSubmit} className="space-y-4 text-xs">
            <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-800 text-xs font-medium">
              سيتم حفظ العقد القديم بصفة <strong>(مجدد)</strong> في السجل التاريخي للوحدة، وإنشاء عقد جديد للفترة القادمة مع إمكانية تعديل البيانات والتاريخ والقيمة.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم البناية والعقار</label>
                <input
                  type="text"
                  value={buildingName}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم الوحدة</label>
                <input
                  type="text"
                  value={unitNumber}
                  disabled
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستأجر</label>
                <input
                  type="text"
                  value={tenantName}
                  onChange={(e) => setTenantName(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف المستأجر</label>
                <input
                  type="text"
                  value={tenantPhone}
                  onChange={(e) => setTenantPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ بداية العقد الجديد</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">تاريخ نهاية العقد الجديد</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الإيجار السنوي الجديد (درهم)</label>
                <input
                  type="number"
                  value={annualRent}
                  onChange={(e) => setAnnualRent(e.target.value === '' ? '' : Number(e.target.value))}
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono font-extrabold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">عدد الدفعات</label>
                <select
                  value={installmentsCount}
                  onChange={(e) => setInstallmentsCount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value={1}>دفعة واحدة (سنوي)</option>
                  <option value={2}>دفعتان (كل 6 أشهر)</option>
                  <option value={3}>3 دفعات (كل 4 أشهر)</option>
                  <option value={4}>4 دفعات (كل 3 أشهر)</option>
                  <option value={6}>6 دفعات (كل شهرين)</option>
                  <option value={12}>12 دفعة (شهري)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات العقد المجدد</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setIsRenewModalOpen(false);
                  setRenewingContract(null);
                }}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-md flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>إتمام تجديد العقد</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Vacate Confirm Dialog */}
      {vacateContract && (
        <ConfirmDialog
          isOpen={!!vacateContract}
          onClose={() => setVacateContract(null)}
          onConfirm={handleConfirmVacate}
          title="إخلاء الوحدة وإلغاء العقد"
          message={`هل أنت أكتأد من إخلاء الوحدة (${vacateContract.unitNumber}) لمستأجر (${vacateContract.tenantName})؟ سيتم تغيير حالة العقد إلى (ملغى) وحفظ كافة سجلات السداد، وتصبح الوحدة فارغة لتأجيرها مجدداً.`}
        />
      )}

      {/* Unit Statement Modal */}
      {unitStatementTarget && (
        <UnitStatementModal
          isOpen={!!unitStatementTarget}
          onClose={() => setUnitStatementTarget(null)}
          buildingName={unitStatementTarget.buildingName}
          unitNumber={unitStatementTarget.unitNumber}
          contracts={contracts}
          settings={settings}
          allBuildings={settings.buildings}
          allUnitsList={allUnitsList}
          onSelectUnit={(bldg, unit) => setUnitStatementTarget({ buildingName: bldg, unitNumber: unit })}
        />
      )}
    </div>
  );
};
