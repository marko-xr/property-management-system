import React, { useState } from 'react';
import { Save, Download, Upload, Shield, Building, Users, CreditCard, RefreshCw, CheckCircle2, FileSpreadsheet, Lock, Plus, Copy, ExternalLink, Code, Check, Database, Sparkles } from 'lucide-react';
import { AppState, OfficeSettings } from '../types';
import { exportAppStateToJson, importAppStateFromJson, exportToExcel, importFromExcel, GOOGLE_APPS_SCRIPT_CODE, syncAppStateToGoogleSheets } from '../services/storage';

interface SettingsPageProps {
  appState: AppState;
  onUpdateSettings: (newSettings: OfficeSettings) => void;
  onRestoreAppState: (restoredState: AppState) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  appState,
  onUpdateSettings,
  onRestoreAppState
}) => {
  const [settings, setSettings] = useState<OfficeSettings>(appState.settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New building / employee / unit type inputs
  const [newBuilding, setNewBuilding] = useState('');
  const [newEmployee, setNewEmployee] = useState('');
  const [newUnitType, setNewUnitType] = useState('');

  // Building Auto Generator State
  const [genBuildingName, setGenBuildingName] = useState('');
  const [genFloorsCount, setGenFloorsCount] = useState<number | ''>(4);
  const [genUnitsPerFloor, setGenUnitsPerFloor] = useState<number | ''>(4);
  const [genDefaultUnitType, setGenDefaultUnitType] = useState(settings.unitTypes[0] || 'شقة سكنية');
  const [genPrefix, setGenPrefix] = useState('شقة');

  // Manual Unit Addition State
  const [manualBuilding, setManualBuilding] = useState(settings.buildings[0] || '');
  const [manualUnitNumber, setManualUnitNumber] = useState('');
  const [manualUnitType, setManualUnitType] = useState(settings.unitTypes[0] || 'شقة سكنية');
  const [manualFloorNumber, setManualFloorNumber] = useState<number | ''>('');
  const [manualNotes, setManualNotes] = useState('');

  // Password change state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New User Creation State
  const [newAddUsername, setNewAddUsername] = useState('');
  const [newAddName, setNewAddName] = useState('');
  const [newAddPassword, setNewAddPassword] = useState('');
  const [newAddRole, setNewAddRole] = useState('مدير النظام');
  const [userMsg, setUserMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Google Sheets Sync State
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState(settings.googleSheetsUrl || '');
  const [copyCodeSuccess, setCopyCodeSuccess] = useState(false);
  const [showCodeBox, setShowCodeBox] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{ loading: boolean; text: string | null; type: 'success' | 'error' | null }>({
    loading: false,
    text: null,
    type: null
  });

  const handleCopyScriptCode = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopyCodeSuccess(true);
    setTimeout(() => setCopyCodeSuccess(false), 3000);
  };

  const handleSaveGoogleSheetsUrl = () => {
    const updated = {
      ...settings,
      googleSheetsUrl: googleSheetsUrl.trim()
    };
    setSettings(updated);
    onUpdateSettings(updated);
    setSyncStatus({
      loading: false,
      text: 'تم حفظ رابط تطبيق قوقل شيت بنجاح!',
      type: 'success'
    });
    setTimeout(() => setSyncStatus(prev => ({ ...prev, text: null })), 3500);
  };

  const handleManualSyncGoogleSheets = async () => {
    if (!googleSheetsUrl.trim()) {
      setSyncStatus({
        loading: false,
        text: 'يرجى إدخال رابط تطبيق الويب (Google Web App URL) المنسوخ من قوقل شيت أولاً',
        type: 'error'
      });
      return;
    }

    setSyncStatus({ loading: true, text: 'جاري إرسال ومزامنة البيانات مع قوقل شيت...', type: null });

    const result = await syncAppStateToGoogleSheets(googleSheetsUrl, appState);
    if (result.success) {
      setSyncStatus({
        loading: false,
        text: result.message,
        type: 'success'
      });
    } else {
      setSyncStatus({
        loading: false,
        text: result.message,
        type: 'error'
      });
    }
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddUsername.trim() || !newAddName.trim() || !newAddPassword.trim()) {
      setUserMsg({ text: 'يرجى ملء كافة حقول مستخدم النظام الجديد', type: 'error' });
      return;
    }

    const currentUsers = settings.users || [];
    if (currentUsers.some(u => u.username.toLowerCase() === newAddUsername.trim().toLowerCase())) {
      setUserMsg({ text: 'اسم المستخدم هذا موجود بالفعل!', type: 'error' });
      return;
    }

    const newUserObj = {
      id: `usr-${Date.now()}`,
      username: newAddUsername.trim(),
      name: newAddName.trim(),
      password: newAddPassword.trim(),
      role: newAddRole
    };

    const updatedSettings = {
      ...settings,
      users: [...currentUsers, newUserObj]
    };

    setSettings(updatedSettings);
    onUpdateSettings(updatedSettings);

    setNewAddUsername('');
    setNewAddName('');
    setNewAddPassword('');
    setUserMsg({ text: `تم إضافة المستخدم "${newAddName}" بنجاح!`, type: 'success' });
    setTimeout(() => setUserMsg(null), 3500);
  };

  const handleRemoveUser = (userId: string) => {
    const currentUsers = settings.users || [];
    if (currentUsers.length <= 1) {
      alert('لا يمكن حذف المستخدم الوحيد المتبقي بالنظام');
      return;
    }
    const updatedSettings = {
      ...settings,
      users: currentUsers.filter(u => u.id !== userId)
    };
    setSettings(updatedSettings);
    onUpdateSettings(updatedSettings);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(settings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddBuilding = () => {
    if (!newBuilding.trim()) return;
    if (settings.buildings.includes(newBuilding.trim())) return;
    setSettings({
      ...settings,
      buildings: [...settings.buildings, newBuilding.trim()]
    });
    setNewBuilding('');
  };

  const handleRemoveBuilding = (b: string) => {
    setSettings({
      ...settings,
      buildings: settings.buildings.filter(item => item !== b),
      buildingDetails: (settings.buildingDetails || []).filter(item => item.name !== b)
    });
  };

  const handleAddEmployee = () => {
    if (!newEmployee.trim()) return;
    if (settings.employees.includes(newEmployee.trim())) return;
    setSettings({
      ...settings,
      employees: [...settings.employees, newEmployee.trim()]
    });
    setNewEmployee('');
  };

  const handleRemoveEmployee = (emp: string) => {
    setSettings({
      ...settings,
      employees: settings.employees.filter(item => item !== emp)
    });
  };

  const handleAddUnitType = () => {
    if (!newUnitType.trim()) return;
    if (settings.unitTypes.includes(newUnitType.trim())) return;
    setSettings({
      ...settings,
      unitTypes: [...settings.unitTypes, newUnitType.trim()]
    });
    setNewUnitType('');
  };

  const handleRemoveUnitType = (ut: string) => {
    setSettings({
      ...settings,
      unitTypes: settings.unitTypes.filter(item => item !== ut)
    });
  };

  // Building Auto Generator Handler
  const handleAutoGenerateBuilding = () => {
    if (!genBuildingName.trim()) {
      alert('يرجى كتابة اسم البناية أولاً');
      return;
    }
    const floors = Number(genFloorsCount) || 1;
    const unitsPerFloor = Number(genUnitsPerFloor) || 1;
    const bName = genBuildingName.trim();

    // Ensure building name is in settings.buildings
    const updatedBuildings = settings.buildings.includes(bName)
      ? settings.buildings
      : [...settings.buildings, bName];

    // Generate units array
    const generatedUnits = [];
    for (let f = 1; f <= floors; f++) {
      for (let u = 1; u <= unitsPerFloor; u++) {
        const numStr = `${genPrefix.trim()} ${f}${u < 10 ? '0' + u : u}`;
        generatedUnits.push({
          id: `unit-${Date.now()}-${f}-${u}`,
          unitNumber: numStr,
          unitType: genDefaultUnitType || settings.unitTypes[0] || 'شقة سكنية',
          floorNumber: f
        });
      }
    }

    const currentDetails = settings.buildingDetails || [];
    const existingIdx = currentDetails.findIndex(b => b.name.toLowerCase() === bName.toLowerCase());

    let updatedDetails;
    if (existingIdx >= 0) {
      updatedDetails = [...currentDetails];
      updatedDetails[existingIdx] = {
        ...updatedDetails[existingIdx],
        floorsCount: floors,
        unitsPerFloor: unitsPerFloor,
        units: [...updatedDetails[existingIdx].units, ...generatedUnits]
      };
    } else {
      updatedDetails = [
        ...currentDetails,
        {
          id: `bldg-${Date.now()}`,
          name: bName,
          floorsCount: floors,
          unitsPerFloor: unitsPerFloor,
          units: generatedUnits
        }
      ];
    }

    setSettings({
      ...settings,
      buildings: updatedBuildings,
      buildingDetails: updatedDetails
    });

    setGenBuildingName('');
    alert(`تم توليد البناية "${bName}" بنجاح بعدد ${floors} طوابق و ${generatedUnits.length} وحدة عقارية!`);
  };

  // Manual Unit Handler
  const handleAddManualUnit = () => {
    const targetBldg = manualBuilding || settings.buildings[0];
    if (!targetBldg) {
      alert('يرجى اختيار أو إضافة بناية أولاً');
      return;
    }
    if (!manualUnitNumber.trim()) {
      alert('يرجى كتابة رقم / اسم الوحدة العقارية');
      return;
    }

    const newUnitObj = {
      id: `unit-${Date.now()}`,
      unitNumber: manualUnitNumber.trim(),
      unitType: manualUnitType || settings.unitTypes[0] || 'شقة سكنية',
      floorNumber: manualFloorNumber !== '' ? Number(manualFloorNumber) : undefined,
      notes: manualNotes.trim()
    };

    const currentDetails = settings.buildingDetails || [];
    const existingIdx = currentDetails.findIndex(b => b.name.toLowerCase() === targetBldg.toLowerCase());

    let updatedDetails;
    if (existingIdx >= 0) {
      updatedDetails = [...currentDetails];
      updatedDetails[existingIdx] = {
        ...updatedDetails[existingIdx],
        units: [...updatedDetails[existingIdx].units, newUnitObj]
      };
    } else {
      updatedDetails = [
        ...currentDetails,
        {
          id: `bldg-${Date.now()}`,
          name: targetBldg,
          units: [newUnitObj]
        }
      ];
    }

    const updatedBuildings = settings.buildings.includes(targetBldg)
      ? settings.buildings
      : [...settings.buildings, targetBldg];

    setSettings({
      ...settings,
      buildings: updatedBuildings,
      buildingDetails: updatedDetails
    });

    setManualUnitNumber('');
    setManualNotes('');
  };

  // Remove Unit Handler
  const handleRemoveUnit = (bName: string, unitId: string) => {
    const currentDetails = settings.buildingDetails || [];
    const updatedDetails = currentDetails.map(b => {
      if (b.name === bName) {
        return {
          ...b,
          units: b.units.filter(u => u.id !== unitId)
        };
      }
      return b;
    });
    setSettings({ ...settings, buildingDetails: updatedDetails });
  };

  // Password change
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass !== appState.currentUser.password) {
      setPassMsg({ text: 'كلمة المرور الحالية غير صحيحة', type: 'error' });
      return;
    }
    if (newPass.length < 4) {
      setPassMsg({ text: 'كلمة المرور الجديدة يجب أن تكون 4 خانات على الأقل', type: 'error' });
      return;
    }

    const updated = {
      ...appState,
      currentUser: {
        ...appState.currentUser,
        password: newPass
      }
    };
    onRestoreAppState(updated);
    setCurrentPass('');
    setNewPass('');
    setPassMsg({ text: 'تم تغيير كلمة المرور بنجاح!', type: 'success' });
    setTimeout(() => setPassMsg(null), 3000);
  };

  // JSON Export / Import
  const handleExportJson = () => {
    exportAppStateToJson(appState);
  };

  const handleImportJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importAppStateFromJson(file);
      onRestoreAppState(restored);
      alert('تم استيراد نسخة النظام بنجاح وتحديث كافة البيانات!');
    } catch (err: any) {
      alert(`خطأ في قراءة الملف: ${err.message}`);
    }
  };

  // Excel Export
  const handleExportExcelAll = () => {
    exportToExcel(appState);
  };

  const handleImportExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const restored = await importFromExcel(file, appState);
      onRestoreAppState(restored);
      alert('تم استيراد بيانات ملف الإكسيل وتحديث النظام بنجاح!');
    } catch (err: any) {
      alert(`خطأ في قراءة ملف الإكسيل: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl flex items-center gap-3 font-bold text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>تم حفظ إعدادات المكتب بنجاح!</span>
        </div>
      )}

      {/* Main Office Information Settings */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <Building className="w-5 h-5 text-amber-500" />
          <h2 className="font-extrabold text-slate-900 text-sm">إعدادات وعنوان المكتب العقاري الرسمي</h2>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">اسم المكتب العقاري *</label>
              <input
                type="text"
                value={settings.officeName}
                onChange={(e) => setSettings({ ...settings, officeName: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">شعار المكتب (رابط صورة أو نص) *</label>
              <input
                type="text"
                value={settings.officeLogo}
                onChange={(e) => setSettings({ ...settings, officeLogo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">عنوان المكتب *</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف والتواصل *</label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني الرسمي</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">تفاصيل الحساب البنكي الرسمي للمكتب</label>
              <input
                type="text"
                value={settings.bankAccountDetails}
                onChange={(e) => setSettings({ ...settings, bankAccountDetails: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              />
            </div>
          </div>

          {/* Employees list */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">قائمة الموظفين والوسطاء المعينين:</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newEmployee}
                onChange={(e) => setNewEmployee(e.target.value)}
                placeholder="إضافة اسم موظف جديد..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddEmployee}
                className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs hover:bg-slate-800"
              >
                + إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.employees.map((emp, idx) => (
                <span key={idx} className="px-3 py-1 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg text-xs font-bold flex items-center gap-2">
                  <span>{emp}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveEmployee(emp)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Unit Types List Management */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">أنواع وأسماء الوحدات العقارية (مثال: شقة سكنية، محل، مكتب، فيلا...):</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newUnitType}
                onChange={(e) => setNewUnitType(e.target.value)}
                placeholder="إضافة نوع وحدة جديد (مثال: استوديو، معرض، ملحق)..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddUnitType}
                className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700"
              >
                + إضافة
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.unitTypes.map((ut, idx) => (
                <span key={idx} className="px-3 py-1 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-xs font-bold flex items-center gap-2">
                  <span>{ut}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveUnitType(ut)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Quick Add Simple Building Name */}
          <div className="pt-4 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 mb-2">قائمة أسماء البنايات والعقارات المسجلة:</label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newBuilding}
                onChange={(e) => setNewBuilding(e.target.value)}
                placeholder="إضافة اسم بناية جديدة مباشرة..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddBuilding}
                className="px-4 py-2 bg-slate-900 text-amber-400 font-bold rounded-lg text-xs hover:bg-slate-800"
              >
                + إضافة بناية
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.buildings.map((b, idx) => (
                <span key={idx} className="px-3 py-1 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold flex items-center gap-2">
                  <span>{b}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveBuilding(b)}
                    className="text-red-500 hover:text-red-700 font-bold text-sm"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Building Generator & Unit Generator Block */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="bg-amber-50/60 p-4 rounded-xl border border-amber-200/80 space-y-4">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-xs text-amber-900">
                <Building className="w-4 h-4 text-amber-600" />
                <span>مولد البنايات والوحدات العقارية التلقائي (من العدادات):</span>
              </div>
              <p className="text-[11px] text-slate-600">
                اكتب اسم البناية وعدد الطوابق وعدد الوحدات بكل طابق، وسيقوم النظام بتوليد جميع الوحدات تلقائياً (مثال: شقة 101، 102، 201، 202...).
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div className="lg:col-span-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم البناية *</label>
                  <input
                    type="text"
                    value={genBuildingName}
                    onChange={(e) => setGenBuildingName(e.target.value)}
                    placeholder="مثال: برج الياسمين 2"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">عدد الطوابق *</label>
                  <input
                    type="number"
                    min={1}
                    value={genFloorsCount}
                    onChange={(e) => setGenFloorsCount(e.target.value ? Number(e.target.value) : '')}
                    placeholder="4"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">عدد الوحدات في كل طابق *</label>
                  <input
                    type="number"
                    min={1}
                    value={genUnitsPerFloor}
                    onChange={(e) => setGenUnitsPerFloor(e.target.value ? Number(e.target.value) : '')}
                    placeholder="4"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع الوحدات *</label>
                  <select
                    value={genDefaultUnitType}
                    onChange={(e) => setGenDefaultUnitType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    {settings.unitTypes.map((ut, idx) => (
                      <option key={idx} value={ut}>{ut}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">بادئة التسمية</label>
                  <input
                    type="text"
                    value={genPrefix}
                    onChange={(e) => setGenPrefix(e.target.value)}
                    placeholder="شقة / مكتب / محل"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAutoGenerateBuilding}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs shadow-sm transition-all"
                >
                  ⚡ توليد البناية والوحدات تلقائياً
                </button>
              </div>
            </div>

            {/* Manual Single Unit Addition */}
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center gap-2 font-extrabold text-slate-900 text-xs">
                <Plus className="w-4 h-4 text-blue-600" />
                <span>إضافة وحدة عقارية يدوياً لبناية قائمة:</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">اختر البناية *</label>
                  <select
                    value={manualBuilding}
                    onChange={(e) => setManualBuilding(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    {settings.buildings.map((b, idx) => (
                      <option key={idx} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم / رقم الوحدة *</label>
                  <input
                    type="text"
                    value={manualUnitNumber}
                    onChange={(e) => setManualUnitNumber(e.target.value)}
                    placeholder="مثال: شقة 502، محل 3..."
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">نوع الوحدة *</label>
                  <select
                    value={manualUnitType}
                    onChange={(e) => setManualUnitType(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                  >
                    {settings.unitTypes.map((ut, idx) => (
                      <option key={idx} value={ut}>{ut}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">رقم الطابق (اختياري)</label>
                  <input
                    type="number"
                    value={manualFloorNumber}
                    onChange={(e) => setManualFloorNumber(e.target.value ? Number(e.target.value) : '')}
                    placeholder="مثال: 5"
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAddManualUnit}
                  className="px-4 py-2 bg-slate-900 text-amber-400 hover:bg-slate-800 font-bold rounded-lg text-xs transition-all"
                >
                  + إضافة هذه الوحدة العقارية
                </button>
              </div>
            </div>

            {/* Display Generated Buildings & Units List */}
            {settings.buildingDetails && settings.buildingDetails.length > 0 && (
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-slate-900 text-xs">سجل البنايات والوحدات العقارية المولدة والمعتمدة:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {settings.buildingDetails.map((bldg) => (
                    <div key={bldg.id} className="bg-white border border-slate-200 rounded-xl p-3 space-y-2 shadow-2xs">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-blue-600" />
                          <span className="font-extrabold text-slate-900 text-xs">{bldg.name}</span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-full">
                            {bldg.units.length} وحدة
                          </span>
                        </div>
                        {bldg.floorsCount && (
                          <span className="text-[10px] text-slate-500 font-semibold">
                            {bldg.floorsCount} طوابق ({bldg.unitsPerFloor} وحدة/طابق)
                          </span>
                        )}
                      </div>

                      <div className="max-h-40 overflow-y-auto flex flex-wrap gap-1.5 p-1">
                        {bldg.units.length === 0 ? (
                          <span className="text-[11px] text-slate-400 italic">لا توجد وحدات مسجلة بعد</span>
                        ) : (
                          bldg.units.map((u) => (
                            <span
                              key={u.id}
                              className="px-2 py-1 bg-slate-50 border border-slate-200 text-slate-800 rounded-md text-[11px] font-bold flex items-center gap-1.5 hover:bg-slate-100 transition-colors"
                            >
                              <span>{u.unitNumber}</span>
                              <span className="text-[9px] text-slate-500 font-normal">({u.unitType})</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveUnit(bldg.name, u.id)}
                                className="text-red-500 hover:text-red-700 font-bold text-xs"
                                title="حذف الوحدة"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>حفظ الإعدادات</span>
            </button>
          </div>
        </form>
      </div>

      {/* Google Sheets Live Sync & Apps Script Code Center */}
      <div className="bg-white rounded-2xl border border-emerald-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5 text-slate-900 font-extrabold text-base">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3>ربط قوقل شيت (Google Sheets) والحفظ التلقائي لقاعدة البيانات</h3>
              <p className="text-xs text-slate-500 font-normal mt-0.5">
                ربط النظام مع ملف Google Sheets للحفظ الفوري والمزامنة التلقائية لكافة العقود والمصروفات والإيرادات.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyScriptCode}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {copyCodeSuccess ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
            <span>{copyCodeSuccess ? 'تم نسخ كود قوقل شيت!' : 'نسخ كود Apps Script بضغطة واحدة'}</span>
          </button>
        </div>

        {/* Setup Steps Guide */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
          <h4 className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>خطوات ربط قوقل شيت وسحب البيانات (خمس خطوات بسيطة):</span>
          </h4>
          <ol className="grid grid-cols-1 md:grid-cols-5 gap-2 text-slate-700 font-medium">
            <li className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="font-extrabold text-emerald-700 text-[11px] block">1. افتح Google Sheets</span>
              <span>افتح جدول بيانات جديد فارغ في قوقل شيت بمحرك قوقل الخاص بك.</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="font-extrabold text-emerald-700 text-[11px] block">2. ادخل Apps Script</span>
              <span>من القائمة العلوية اختر <strong>التوسيعات (Extensions)</strong> ثم <strong>Apps Script</strong>.</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="font-extrabold text-emerald-700 text-[11px] block">3. لصق الكود وحفظه</span>
              <span>امسح أي كود موجود، ثم اضغط زر <strong>"نسخ الكود"</strong> أعلاه والصقه بالكامل، ثم حفظ (Ctrl+S).</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="font-extrabold text-emerald-700 text-[11px] block">4. نشر كتطبيق ويب</span>
              <span>اضغط <strong>نشر (Deploy) ← نشر جديد (New deployment) ← تطبيق ويب (Web app)</strong>، ثم اختر الوصول لـ <strong>أي شخص (Anyone)</strong>.</span>
            </li>
            <li className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-1">
              <span className="font-extrabold text-emerald-700 text-[11px] block">5. لصق رابط التطبيق</span>
              <span>انسخ <strong>رابط تطبيق الويب (URL)</strong> المولد والصقه في المربع أدناه للربط والتحديث الفوري.</span>
            </li>
          </ol>
        </div>

        {/* URL Input & Sync Controls */}
        <div className="space-y-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
          <label className="block text-xs font-bold text-slate-800">
            رابط تطبيق الويب المنسوخ من قوقل شيت (Google Web App URL):
          </label>
          
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={googleSheetsUrl}
              onChange={(e) => setGoogleSheetsUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              type="button"
              onClick={handleSaveGoogleSheetsUrl}
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shrink-0 w-full sm:w-auto"
            >
              حفظ الرابط
            </button>
            <button
              type="button"
              onClick={handleManualSyncGoogleSheets}
              disabled={syncStatus.loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all flex items-center justify-center gap-2 shrink-0 w-full sm:w-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${syncStatus.loading ? 'animate-spin' : ''}`} />
              <span>مزامنة وحفظ البيانات الآن بـ Google Sheets</span>
            </button>
          </div>

          {syncStatus.text && (
            <div className={`p-3 rounded-lg text-xs font-bold flex items-center gap-2 ${
              syncStatus.type === 'success' 
                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' 
                : syncStatus.type === 'error'
                ? 'bg-red-100 text-red-900 border border-red-300'
                : 'bg-blue-100 text-blue-900 border border-blue-300'
            }`}>
              {syncStatus.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />}
              <span>{syncStatus.text}</span>
            </div>
          )}
        </div>

        {/* View Code Snippet Toggle */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCodeBox(!showCodeBox)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 cursor-pointer"
            >
              <Code className="w-4 h-4" />
              <span>{showCodeBox ? 'إخفاء كود البرمجة (Google Apps Script)' : 'عرض كود البرمجة الكامل لقوقل شيت (Google Apps Script Code)'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyScriptCode}
              className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>نسخ الكود</span>
            </button>
          </div>

          {showCodeBox && (
            <div className="relative bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto max-h-80 border border-slate-800 dir-ltr text-left">
              <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
            </div>
          )}
        </div>
      </div>

      {/* Backup and Excel Export / Import Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* JSON Backup & Restore */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <Download className="w-5 h-5 text-amber-500" />
            <h3>النسخ الاحتياطي (JSON)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            يمكنك حفظ نسخة احتياطية شاملة لجميع بيانات المكتب (المصروفات، الإيرادات، العقود، المديونيات، والمشاريع) واستعادتها في أي وقت.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleExportJson}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل ملف النسخة الاحتياطية (JSON)</span>
            </button>

            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer border border-slate-300 transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>استعادة النسخة الاحتياطية من ملف (JSON)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportJsonFile}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Excel Export & Import */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3>تصدير واستيراد الإكسيل (Excel)</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            تصدير كافة أقسام النظام إلى ملف Excel متعدد الصفحات، أو رفع ملف إكسيل لتحديث وتعبئة القواعد تلقائياً.
          </p>

          <div className="space-y-3 pt-2">
            <button
              onClick={handleExportExcelAll}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>تصدير البيانات كاملة إلى Excel</span>
            </button>

            <label className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer border border-slate-300 transition-colors">
              <Upload className="w-4 h-4 text-slate-500" />
              <span>استيراد وتحديث البيانات من Excel</span>
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleImportExcelFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Create New System Users & Manage User Accounts */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <Users className="w-5 h-5 text-blue-600" />
            <h3>إدارة مستخدمي النظام وإنشاء حسابات جديدة</h3>
          </div>
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold rounded-lg">
            عدد الحسابات: {settings.users?.length || 1}
          </span>
        </div>

        {userMsg && (
          <div className={`p-3 rounded-lg text-xs font-bold ${
            userMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
          }`}>
            {userMsg.text}
          </div>
        )}

        {/* Add User Form */}
        <form onSubmit={handleCreateNewUser} className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
          <h4 className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>إضافة مستخدم جديد للنظام (مع كلمة المرور والصلاحية):</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">اسم المستخدم (Login Username) *</label>
              <input
                type="text"
                value={newAddUsername}
                onChange={(e) => setNewAddUsername(e.target.value)}
                placeholder="مثال: ahmed_realestate"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">الاسم الكامل للمستخدم *</label>
              <input
                type="text"
                value={newAddName}
                onChange={(e) => setNewAddName(e.target.value)}
                placeholder="مثال: أحمد عبد الله"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">كلمة المرور الحساب *</label>
              <input
                type="password"
                value={newAddPassword}
                onChange={(e) => setNewAddPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">الصلاحية / الدور *</label>
              <select
                value={newAddRole}
                onChange={(e) => setNewAddRole(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-none"
              >
                <option value="مدير النظام">مدير النظام (كامل الصلاحيات)</option>
                <option value="محاسب">محاسب</option>
                <option value="موظف استقبال">موظف استقبال</option>
                <option value="مشرف عقارات">مشرف عقارات</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-sm transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء حساب المستخدم الجديد</span>
            </button>
          </div>
        </form>

        {/* Existing Users Table */}
        <div className="space-y-3">
          <h4 className="font-bold text-xs text-slate-800">الحسابات المسجلة حالياً التي يمكنها تسجيل الدخول:</h4>
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-900 text-white font-bold">
                <tr>
                  <th className="p-3">اسم المستخدم</th>
                  <th className="p-3">الاسم الكامل</th>
                  <th className="p-3">الصلاحية</th>
                  <th className="p-3">كلمة المرور</th>
                  <th className="p-3">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {(settings.users || []).map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900">{u.username}</td>
                    <td className="p-3 font-bold text-slate-800">{u.name}</td>
                    <td className="p-3">
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 font-bold rounded-md text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-500">
                      {u.password ? '••••••••' : '(افتراضية)'}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleRemoveUser(u.id)}
                        className="px-2.5 py-1 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-bold text-[11px] transition-colors"
                        title="حذف هذا المستخدم"
                      >
                        حذف الحساب
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Credentials & Password Management */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm border-b border-slate-100 pb-3">
          <Lock className="w-5 h-5 text-amber-500" />
          <h3>التحكم بالمستخدم وتغيير كلمة المرور</h3>
        </div>

        {passMsg && (
          <div className={`p-3 rounded-lg text-xs font-bold ${
            passMsg.type === 'success' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-red-100 text-red-900 border border-red-300'
          }`}>
            {passMsg.text}
          </div>
        )}

        <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">اسم المستخدم الحساب</label>
            <input
              type="text"
              value={appState.currentUser.username}
              disabled
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الحالية *</label>
            <input
              type="password"
              value={currentPass}
              onChange={(e) => setCurrentPass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">كلمة المرور الجديدة *</label>
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium focus:outline-none"
              required
            />
          </div>

          <div className="col-span-full flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold rounded-lg text-xs shadow-md transition-colors"
            >
              تغيير كلمة المرور
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
