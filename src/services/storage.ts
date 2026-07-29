import { AppState, Expense, Revenue, Contract, EmployeeDebt, Project, ExecutedProject, Obligation, OfficeSettings } from '../types';
import { initialSeedData } from '../data/seedData';
import * as XLSX from 'xlsx';

const STORAGE_KEY = 'real_estate_office_app_v1';

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveAppState(initialSeedData);
      return initialSeedData;
    }
    const parsed = JSON.parse(raw) as AppState;
    const loadedSettings = {
      ...initialSeedData.settings,
      ...(parsed.settings || {})
    };

    // Auto-migrate legacy office name if stored in local storage
    if (
      !loadedSettings.officeName ||
      loadedSettings.officeName.includes('الأصالة') ||
      loadedSettings.officeName.includes('الاصالة') ||
      loadedSettings.officeName.includes('الأصاله') ||
      loadedSettings.officeName.includes('الاصاله')
    ) {
      loadedSettings.officeName = 'إماراتك العقارية';
      loadedSettings.officeLogo = 'إماراتك العقارية';
    }

    if (loadedSettings.email && loadedSettings.email.includes('alasala')) {
      loadedSettings.email = 'emaratekrealestate@gmail.com';
    }

    const finalState: AppState = {
      isLoggedIn: parsed.isLoggedIn ?? true,
      currentUser: parsed.currentUser || initialSeedData.currentUser,
      expenses: parsed.expenses || initialSeedData.expenses,
      revenues: parsed.revenues || initialSeedData.revenues,
      contracts: parsed.contracts || initialSeedData.contracts,
      employeeDebts: parsed.employeeDebts || initialSeedData.employeeDebts,
      projects: parsed.projects || initialSeedData.projects,
      executedProjects: parsed.executedProjects || initialSeedData.executedProjects,
      obligations: parsed.obligations || initialSeedData.obligations,
      settings: loadedSettings
    };

    // Save migrated state back to local storage
    saveAppState(finalState);

    return finalState;
  } catch (e) {
    console.error('Error loading app state:', e);
    return initialSeedData;
  }
}

export function saveAppState(state: AppState): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (e) {
    console.error('Error saving app state:', e);
    return false;
  }
}

export function exportAppStateToJson(state: AppState) {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
  const downloadAnchor = document.createElement('a');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `نسخة_احتياطية_مكتب_عقاري_${dateStr}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function importAppStateFromJson(file: File): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed && typeof parsed === 'object') {
          const restored: AppState = {
            isLoggedIn: true,
            currentUser: parsed.currentUser || initialSeedData.currentUser,
            expenses: parsed.expenses || [],
            revenues: parsed.revenues || [],
            contracts: parsed.contracts || [],
            employeeDebts: parsed.employeeDebts || [],
            projects: parsed.projects || [],
            executedProjects: parsed.executedProjects || [],
            obligations: parsed.obligations || [],
            settings: parsed.settings || initialSeedData.settings
          };
          saveAppState(restored);
          resolve(restored);
        } else {
          reject(new Error('صيغة ملف JSON غير صالحة'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة الملف'));
    reader.readAsText(file);
  });
}

export function exportToExcel(state: AppState) {
  const wb = XLSX.utils.book_new();

  // 1. Expenses Sheet
  const expensesData = state.expenses.map(e => ({
    'المعرف': e.id,
    'التاريخ': e.date,
    'المبلغ (درهم)': e.amount,
    'الفئة': e.category,
    'التفاصيل': e.details,
    'طريقة الدفع': e.paymentMethod,
    'المسؤول': e.responsible,
    'المرجع': e.reference || '',
    'الملاحظات': e.notes || ''
  }));
  const wsExpenses = XLSX.utils.json_to_sheet(expensesData);
  XLSX.utils.book_append_sheet(wb, wsExpenses, "المصروفات");

  // 2. Revenues Sheet
  const revenuesData = state.revenues.map(r => ({
    'المعرف': r.id,
    'التاريخ': r.date,
    'الموظف': r.employeeName,
    'المبلغ (درهم)': r.amount,
    'نوع الإيراد': r.type,
    'البيان': r.details,
    'الملاحظات': r.notes || ''
  }));
  const wsRevenues = XLSX.utils.json_to_sheet(revenuesData);
  XLSX.utils.book_append_sheet(wb, wsRevenues, "الإيرادات والعمولات");

  // 3. Contracts Sheet
  const contractsData = state.contracts.map(c => ({
    'رقم العقد': c.id,
    'البناية': c.buildingName,
    'المنطقة': c.area,
    'رقم الوحدة': c.unitNumber,
    'نوع الوحدة': c.unitType,
    'المالك': c.ownerName,
    'المستأجر': c.tenantName,
    'هاتف المستأجر': c.tenantPhone,
    'بداية العقد': c.startDate,
    'نهاية العقد': c.endDate,
    'الإيجار السنوي': c.annualRent,
    'عدد الدفعات': c.installmentsCount,
    'مبلغ التأمين': c.securityDeposit,
    'طريقة الدفع': c.paymentType,
    'الحالة': c.status,
    'ملاحظات': c.notes || ''
  }));
  const wsContracts = XLSX.utils.json_to_sheet(contractsData);
  XLSX.utils.book_append_sheet(wb, wsContracts, "العقود والإيجارات");

  // 4. Installments Sheet
  const installmentsData: any[] = [];
  state.contracts.forEach(c => {
    c.installments.forEach(inst => {
      installmentsData.push({
        'رقم العقد': c.id,
        'المستأجر': c.tenantName,
        'البناية والوحدة': `${c.buildingName} - ${c.unitNumber}`,
        'رقم الدفعة': inst.installmentNo,
        'تاريخ الاستحقاق': inst.dueDate,
        'المبلغ': inst.amount,
        'رقم الشيك': inst.chequeNumber || '',
        'اسم البنك': inst.bankName || '',
        'حالة التحصيل': inst.status,
        'تاريخ التحصيل': inst.collectedDate || '',
        'طريقة الدفع': inst.paymentMethod || ''
      });
    });
  });
  const wsInstallments = XLSX.utils.json_to_sheet(installmentsData);
  XLSX.utils.book_append_sheet(wb, wsInstallments, "جدول الدفعات والتحصيل");

  // 5. Employee Debts Sheet
  const debtsData = state.employeeDebts.map(d => {
    const totalPaid = d.repayments ? d.repayments.reduce((acc, r) => acc + r.amount, 0) : 0;
    const remaining = d.totalAmount - totalPaid;
    let status = 'مديونية قائمة';
    if (remaining <= 0) status = 'مسددة بالكامل';
    else if (totalPaid > 0) status = 'سداد جزئي';

    return {
      'اسم الموظف': d.employeeName,
      'الهاتف': d.phone,
      'إجمالي المديونية': d.totalAmount,
      'المبلغ المسدد': totalPaid,
      'المتبقي': remaining,
      'الحالة': status,
      'سبب المديونية': d.reason,
      'التاريخ': d.date,
      'ملاحظات': d.notes || ''
    };
  });
  const wsDebts = XLSX.utils.json_to_sheet(debtsData);
  XLSX.utils.book_append_sheet(wb, wsDebts, "مديونيات الموظفين");

  // 6. Obligations Sheet
  const obligationsData = state.obligations.map(o => ({
    'الالتزام': o.type,
    'المبلغ': o.amount,
    'تاريخ الإصدار': o.issueDate,
    'تاريخ الانتهاء': o.expiryDate,
    'المسؤول': o.responsiblePerson,
    'الحالة': o.status,
    'ملاحظات': o.notes || ''
  }));
  const wsObligations = XLSX.utils.json_to_sheet(obligationsData);
  XLSX.utils.book_append_sheet(wb, wsObligations, "الالتزامات والرخص");

  // Write file
  const dateStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `بيانات_المكتب_العقاري_${dateStr}.xlsx`);
}

export function importFromExcel(file: File, currentState: AppState): Promise<AppState> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        // Parse worksheets if available, otherwise preserve current state
        const newState: AppState = { ...currentState };

        if (workbook.SheetNames.includes("المصروفات")) {
          const sheet = workbook.Sheets["المصروفات"];
          const rawExpenses: any[] = XLSX.utils.sheet_to_json(sheet);
          if (rawExpenses.length > 0) {
            newState.expenses = rawExpenses.map((row, idx) => ({
              id: row['المعرف'] || `exp-imp-${idx}`,
              date: row['التاريخ'] || new Date().toISOString().split('T')[0],
              amount: Number(row['المبلغ (درهم)']) || 0,
              category: row['الفئة'] || 'مصروفات مكتبية',
              details: row['التفاصيل'] || 'مستورد من إكسيل',
              paymentMethod: row['طريقة الدفع'] || 'نقد',
              responsible: row['المسؤول'] || 'المدير العام',
              reference: row['المرجع'] || '',
              notes: row['الملاحظات'] || ''
            }));
          }
        }

        if (workbook.SheetNames.includes("الإيرادات والعمولات")) {
          const sheet = workbook.Sheets["الإيرادات والعمولات"];
          const rawRevenues: any[] = XLSX.utils.sheet_to_json(sheet);
          if (rawRevenues.length > 0) {
            newState.revenues = rawRevenues.map((row, idx) => ({
              id: row['المعرف'] || `rev-imp-${idx}`,
              date: row['التاريخ'] || new Date().toISOString().split('T')[0],
              employeeName: row['الموظف'] || 'محمد العتيبي',
              amount: Number(row['المبلغ (درهم)']) || 0,
              type: row['نوع الإيراد'] || 'عمولة تأجير',
              details: row['البيان'] || 'مستورد من إكسيل',
              notes: row['الملاحظات'] || ''
            }));
          }
        }

        saveAppState(newState);
        resolve(newState);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('فشل قراءة ملف الإكسيل'));
    reader.readAsArrayBuffer(file);
  });
}

export const GOOGLE_APPS_SCRIPT_CODE = `// ==============================================================================
//  كود ربط نظام إماراتك العقارية مع قوقل شيت (Google Sheets Apps Script)
// ==============================================================================
// 1. افتح جدول بيانات جديد في Google Sheets (جدول فارغ).
// 2. اذهب إلى القائمة الرئيسية: التوسيعات (Extensions) -> Apps Script.
// 3. امسح أي كود موجود والتقط/الصق هذا الكود بالكامل واضغط حفظ (Ctrl+S).
// 4. اضغط على زر "نشر" (Deploy) -> "نشر جديد" (New deployment).
// 5. اختر نوع التثبيت: تطبيق ويب (Web app).
// 6. الوصف: "ربط نظام إماراتك العقارية".
// 7. تنفيذ باسم (Execute as): Me (حسابك الشخصي).
// 8. من يمكنه الوصول (Who has access): "أي شخص" (Anyone).
// 9. اضغط "تطبيق / نشر" ووافق على الصلاحيات المطلوبة.
// 10. انسخ "رابط تطبيق الويب" (Web App URL) ولصقه في صفحة الإعدادات بالنظام.
// ==============================================================================

function doPost(e) {
  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    // 1. sheet: العقود والإيجارات
    if (data.contracts) {
      var sheetContracts = getOrCreateSheet(ss, "العقود والإيجارات", [
        "رقم العقد", "البناية", "المنطقة", "رقم الوحدة", "نوع الوحدة", "المالك", "المستأجر", "هاتف المستأجر",
        "تاريخ البداية", "تاريخ النهاية", "الإيجار السنوي", "عدد الدفعات", "مبلغ التأمين", "الحالة", "ملاحظات"
      ]);
      sheetContracts.getRange(2, 1, Math.max(sheetContracts.getLastRow() - 1, 1), 15).clearContent();
      
      var rowsContracts = data.contracts.map(function(c) {
        return [
          c.id || "", c.buildingName || "", c.area || "", c.unitNumber || "", c.unitType || "",
          c.ownerName || "", c.tenantName || "", c.tenantPhone || "", c.startDate || "", c.endDate || "",
          c.annualRent || 0, c.installmentsCount || 1, c.securityDeposit || 0, c.status || "", c.notes || ""
        ];
      });
      if (rowsContracts.length > 0) {
        sheetContracts.getRange(2, 1, rowsContracts.length, 15).setValues(rowsContracts);
      }
    }

    // 2. sheet: المصروفات
    if (data.expenses) {
      var sheetExpenses = getOrCreateSheet(ss, "المصروفات", [
        "المعرف", "التاريخ", "المبلغ (درهم)", "الفئة", "التفاصيل", "طريقة الدفع", "المسؤول", "المرجع", "ملاحظات"
      ]);
      sheetExpenses.getRange(2, 1, Math.max(sheetExpenses.getLastRow() - 1, 1), 9).clearContent();
      
      var rowsExpenses = data.expenses.map(function(exp) {
        return [
          exp.id || "", exp.date || "", exp.amount || 0, exp.category || "", exp.details || "",
          exp.paymentMethod || "", exp.responsible || "", exp.reference || "", exp.notes || ""
        ];
      });
      if (rowsExpenses.length > 0) {
        sheetExpenses.getRange(2, 1, rowsExpenses.length, 9).setValues(rowsExpenses);
      }
    }

    // 3. sheet: الإيرادات والعمولات
    if (data.revenues) {
      var sheetRevenues = getOrCreateSheet(ss, "الإيرادات والعمولات", [
        "المعرف", "التاريخ", "الموظف", "المبلغ (درهم)", "نوع الإيراد", "البيان", "ملاحظات"
      ]);
      sheetRevenues.getRange(2, 1, Math.max(sheetRevenues.getLastRow() - 1, 1), 7).clearContent();
      
      var rowsRevenues = data.revenues.map(function(rev) {
        return [
          rev.id || "", rev.date || "", rev.employeeName || "", rev.amount || 0,
          rev.type || "", rev.details || "", rev.notes || ""
        ];
      });
      if (rowsRevenues.length > 0) {
        sheetRevenues.getRange(2, 1, rowsRevenues.length, 7).setValues(rowsRevenues);
      }
    }

    // 4. sheet: جدول التحصيل والأقساط
    if (data.contracts) {
      var sheetInst = getOrCreateSheet(ss, "جدول التحصيل والأقساط", [
        "رقم العقد", "المستأجر", "البناية والوحدة", "رقم الدفعة", "تاريخ الاستحقاق", "المبلغ", "حالة التحصيل", "طريقة الدفع", "رقم الشيك"
      ]);
      sheetInst.getRange(2, 1, Math.max(sheetInst.getLastRow() - 1, 1), 9).clearContent();

      var rowsInst = [];
      data.contracts.forEach(function(c) {
        if (c.installments) {
          c.installments.forEach(function(inst) {
            rowsInst.push([
              c.id || "", c.tenantName || "", (c.buildingName || "") + " - " + (c.unitNumber || ""),
              inst.installmentNo || 1, inst.dueDate || "", inst.amount || 0, inst.status || "",
              inst.paymentMethod || "", inst.chequeNumber || ""
            ]);
          });
        }
      });
      if (rowsInst.length > 0) {
        sheetInst.getRange(2, 1, rowsInst.length, 9).setValues(rowsInst);
      }
    }

    // 5. sheet: مديونيات الموظفين
    if (data.employeeDebts) {
      var sheetDebts = getOrCreateSheet(ss, "مديونيات الموظفين", [
        "اسم الموظف", "الهاتف", "إجمالي المديونية", "سبب المديونية", "التاريخ", "ملاحظات"
      ]);
      sheetDebts.getRange(2, 1, Math.max(sheetDebts.getLastRow() - 1, 1), 6).clearContent();

      var rowsDebts = data.employeeDebts.map(function(d) {
        return [
          d.employeeName || "", d.phone || "", d.totalAmount || 0,
          d.reason || "", d.date || "", d.notes || ""
        ];
      });
      if (rowsDebts.length > 0) {
        sheetDebts.getRange(2, 1, rowsDebts.length, 6).setValues(rowsDebts);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "تم حفظ وتحديث بيانات النظام في قوقل شيت بنجاح!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("تطبيق الربط يعمل بنجاح! جاهز لاستقبال بيانات إماراتك العقارية.");
}

function getOrCreateSheet(ss, sheetName, headers) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#0f172a").setFontColor("#ffffff");
  }
  return sheet;
}
`;

export async function syncAppStateToGoogleSheets(url: string, state: AppState): Promise<{ success: boolean; message: string }> {
  if (!url || !url.trim()) {
    return { success: false, message: 'يرجى أدخال رابط تطبيق الويب (Google Web App URL) الخاص بقوقل شيت أولاً' };
  }

  try {
    const payload = JSON.stringify({
      contracts: state.contracts,
      expenses: state.expenses,
      revenues: state.revenues,
      employeeDebts: state.employeeDebts,
      obligations: state.obligations,
      settings: {
        officeName: state.settings.officeName,
        phone: state.settings.phone,
        address: state.settings.address
      }
    });

    // Use mode: 'no-cors' fallback if Google Apps Script CORS blocks custom headers
    await fetch(url.trim(), {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payload
    });

    return {
      success: true,
      message: 'تم إرسال ومزامنة البيانات مع قوقل شيت بنجاح! افتح شيت قوقل لرؤية كافة التحديثات.'
    };
  } catch (err: any) {
    console.error('Error syncing to Google Sheets:', err);
    return {
      success: false,
      message: 'تعذر الاتصال برابط قوقل شيت. يرجى التأكد من نشر تطبيق الويب ومنح الوصول لـ (Anyone / أي شخص).'
    };
  }
}

