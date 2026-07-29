export type PaymentMethod = 'نقد' | 'تحويل بنكي' | 'شيك' | 'بطاقة' | 'خصم من الراتب';

export interface Expense {
  id: string;
  amount: number;
  details: string;
  date: string;
  category: string;
  paymentMethod: PaymentMethod;
  responsible: string;
  notes?: string;
  reference?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface Revenue {
  id: string;
  employeeName: string;
  date: string;
  amount: number;
  type: string;
  details: string;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface ContractInstallment {
  id: string;
  contractId: string;
  installmentNo: number;
  dueDate: string;
  amount: number;
  chequeNumber?: string;
  bankName?: string;
  status: 'محصل' | 'غير محصل';
  collectedDate?: string;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface Contract {
  id: string;
  buildingName: string;
  area: string;
  unitNumber: string;
  unitType: string;
  ownerName: string;
  tenantName: string;
  tenantPhone: string;
  startDate: string;
  endDate: string;
  annualRent: number;
  installmentsCount: number;
  securityDeposit: number;
  paymentType: 'نقد' | 'شيك' | 'تحويل';
  notes?: string;
  status: 'نشط' | 'منتهي' | 'ملغى' | 'مجدد';
  installments: ContractInstallment[];
  createdAt?: string;
  completedAt?: string;
}

export interface EmployeeDebtRepayment {
  id: string;
  debtId: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface EmployeeDebt {
  id: string;
  employeeName: string;
  phone: string;
  totalAmount: number;
  reason: string;
  date: string;
  notes?: string;
  repayments: EmployeeDebtRepayment[];
  createdAt?: string;
  completedAt?: string;
}

export interface ProjectItem {
  id: string;
  projectId: string;
  name: string;
  value: number;
  date: string;
  notes?: string;
  status: 'قيد التنفيذ' | 'مكتمل';
  paidAmount: number;
  createdAt?: string;
  completedAt?: string;
}

export interface Project {
  id: string;
  name: string;
  ownerName: string;
  area: string;
  plotNumber: string;
  contractorCompany: string;
  date: string;
  totalAgreedPrice: number;
  items: ProjectItem[];
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface ExecutedProjectCostItem {
  id: string;
  name: string;
  value: number;
  date: string;
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface ExecutedProject {
  id: string;
  name: string;
  ownerName: string;
  date: string;
  startDate?: string;
  saleDate?: string;
  area: string;
  plotNumber: string;
  type: string;
  notes?: string;
  costItems: ExecutedProjectCostItem[];
  sellingPrice: number;
  createdAt?: string;
  completedAt?: string;
}

export interface Obligation {
  id: string;
  type: string;
  issueDate: string;
  expiryDate: string;
  amount: number;
  responsiblePerson: string;
  status: 'نشط' | 'قريب' | 'متأخر' | 'مكتمل';
  notes?: string;
  createdAt?: string;
  completedAt?: string;
}

export interface AppUser {
  id: string;
  username: string;
  name: string;
  password?: string;
  role: string;
}

export interface BuildingUnit {
  id: string;
  unitNumber: string;
  unitType: string;
  floorNumber?: number;
  notes?: string;
}

export interface BuildingDetail {
  id: string;
  name: string;
  floorsCount?: number;
  unitsPerFloor?: number;
  units: BuildingUnit[];
}

export interface OfficeSettings {
  officeName: string;
  officeLogo: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  bankAccountDetails: string;
  taxNumber: string;
  printHeaderNote: string;
  expenseCategories: string[];
  revenueTypes: string[];
  employees: string[];
  buildings: string[];
  unitTypes: string[];
  buildingDetails?: BuildingDetail[];
  users: AppUser[];
  googleSheetsUrl?: string;
  autoSyncGoogleSheets?: boolean;
}

export interface AppState {
  isLoggedIn?: boolean;
  currentUser: {
    id: string;
    username: string;
    name: string;
    password: string;
    role: string;
  };
  expenses: Expense[];
  revenues: Revenue[];
  contracts: Contract[];
  employeeDebts: EmployeeDebt[];
  projects: Project[];
  executedProjects: ExecutedProject[];
  obligations: Obligation[];
  settings: OfficeSettings;
}
