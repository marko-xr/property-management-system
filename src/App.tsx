import React, { useState, useEffect } from 'react';
import { AppState, Expense, Revenue, Contract, EmployeeDebt, EmployeeDebtRepayment, Project, ExecutedProject, Obligation, OfficeSettings, PaymentMethod } from './types';
import { loadAppState, saveAppState } from './services/storage';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { RevenuesPage } from './pages/RevenuesPage';
import { ContractsPage } from './pages/ContractsPage';
import { CollectionPage } from './pages/CollectionPage';
import { EmployeeDebtsPage } from './pages/EmployeeDebtsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { ExecutedProjectsPage } from './pages/ExecutedProjectsPage';
import { ObligationsPage } from './pages/ObligationsPage';
import { SettingsPage } from './pages/SettingsPage';
import { printTarget } from './utils/printUtils';

export default function App() {
  const [appState, setAppState] = useState<AppState>(() => loadAppState());
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loginError, setLoginError] = useState('');

  // Persist state whenever appState changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Handle Login
  const handleLogin = (u: string, p: string) => {
    const foundUser = appState.settings.users?.find(usr => usr.username.toLowerCase() === u.trim().toLowerCase() && (usr.password === p || !usr.password));
    
    if (u === appState.currentUser.username && p === appState.currentUser.password) {
      setAppState(prev => ({ ...prev, isLoggedIn: true }));
      setLoginError('');
    } else if (foundUser) {
      setAppState(prev => ({ 
        ...prev, 
        isLoggedIn: true,
        currentUser: {
          id: foundUser.id,
          username: foundUser.username,
          name: foundUser.name,
          password: foundUser.password || p,
          role: foundUser.role
        }
      }));
      setLoginError('');
    } else if (u === 'admin' && p === 'admin123') {
      // Fallback emergency admin
      setAppState(prev => ({ ...prev, isLoggedIn: true }));
      setLoginError('');
    } else {
      setLoginError('اسم المستخدم أو كلمة المرور غير صحيحة');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    setAppState(prev => ({ ...prev, isLoggedIn: false }));
  };

  // Printing helper
  const handlePrint = (selector: string) => printTarget(selector);

  // ===================== EXPENSES HANDLERS =====================
  const handleAddExpense = (expense: Omit<Expense, 'id'>) => {
    const nowIso = new Date().toISOString();
    const newExp: Expense = {
      ...expense,
      id: `exp-${Date.now()}`,
      createdAt: expense.createdAt || nowIso,
      completedAt: expense.completedAt || nowIso
    };
    setAppState(prev => ({
      ...prev,
      expenses: [newExp, ...prev.expenses]
    }));
  };

  const handleUpdateExpense = (updated: Expense) => {
    setAppState(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === updated.id ? updated : e)
    }));
  };

  const handleDeleteExpense = (id: string) => {
    setAppState(prev => ({
      ...prev,
      expenses: prev.expenses.filter(e => e.id !== id)
    }));
  };

  // ===================== REVENUES HANDLERS =====================
  const handleAddRevenue = (revenue: Omit<Revenue, 'id'>) => {
    const nowIso = new Date().toISOString();
    const newRev: Revenue = {
      ...revenue,
      id: `rev-${Date.now()}`,
      createdAt: revenue.createdAt || nowIso,
      completedAt: revenue.completedAt || nowIso
    };
    setAppState(prev => ({
      ...prev,
      revenues: [newRev, ...prev.revenues]
    }));
  };

  const handleUpdateRevenue = (updated: Revenue) => {
    setAppState(prev => ({
      ...prev,
      revenues: prev.revenues.map(r => r.id === updated.id ? updated : r)
    }));
  };

  const handleDeleteRevenue = (id: string) => {
    setAppState(prev => ({
      ...prev,
      revenues: prev.revenues.filter(r => r.id !== id)
    }));
  };

  // ===================== CONTRACTS HANDLERS =====================
  const handleAddContract = (contract: Omit<Contract, 'id'>) => {
    const nowIso = new Date().toISOString();
    const newContract: Contract = {
      ...contract,
      id: `cnt-${Date.now()}`,
      createdAt: contract.createdAt || nowIso,
      installments: contract.installments.map(inst => ({
        ...inst,
        createdAt: inst.createdAt || nowIso
      }))
    };
    setAppState(prev => ({
      ...prev,
      contracts: [newContract, ...prev.contracts]
    }));
  };

  const handleUpdateContract = (updated: Contract) => {
    setAppState(prev => ({
      ...prev,
      contracts: prev.contracts.map(c => c.id === updated.id ? updated : c)
    }));
  };

  const handleDeleteContract = (id: string) => {
    setAppState(prev => ({
      ...prev,
      contracts: prev.contracts.filter(c => c.id !== id)
    }));
  };

  // Update Installment Status (Collection Page & Contracts Page)
  const handleUpdateInstallmentStatus = (
    contractId: string,
    installmentId: string,
    status: 'محصل' | 'غير محصل',
    collectedDate?: string,
    paymentMethod?: PaymentMethod
  ) => {
    const nowIso = new Date().toISOString();
    setAppState(prev => ({
      ...prev,
      contracts: prev.contracts.map(c => {
        if (c.id !== contractId) return c;
        return {
          ...c,
          installments: c.installments.map(inst => {
            if (inst.id !== installmentId) return inst;
            return {
              ...inst,
              status,
              collectedDate: status === 'محصل' ? (collectedDate || new Date().toISOString().split('T')[0]) : undefined,
              completedAt: status === 'محصل' ? nowIso : undefined,
              paymentMethod: paymentMethod || inst.paymentMethod
            };
          })
        };
      })
    }));
  };

  // ===================== EMPLOYEE DEBTS HANDLERS =====================
  const handleAddDebt = (debt: Omit<EmployeeDebt, 'id' | 'repayments'>) => {
    const nowIso = new Date().toISOString();
    const newDebt: EmployeeDebt = {
      ...debt,
      id: `debt-${Date.now()}`,
      createdAt: debt.createdAt || nowIso,
      repayments: []
    };
    setAppState(prev => ({
      ...prev,
      employeeDebts: [newDebt, ...prev.employeeDebts]
    }));
  };

  const handleUpdateDebt = (updated: EmployeeDebt) => {
    setAppState(prev => ({
      ...prev,
      employeeDebts: prev.employeeDebts.map(d => d.id === updated.id ? updated : d)
    }));
  };

  const handleDeleteDebt = (id: string) => {
    setAppState(prev => ({
      ...prev,
      employeeDebts: prev.employeeDebts.filter(d => d.id !== id)
    }));
  };

  const handleAddRepayment = (debtId: string, repayment: Omit<EmployeeDebtRepayment, 'id' | 'debtId'>) => {
    const nowIso = new Date().toISOString();
    const newRep: EmployeeDebtRepayment = {
      ...repayment,
      id: `rep-${Date.now()}`,
      debtId,
      createdAt: repayment.createdAt || nowIso,
      completedAt: repayment.completedAt || nowIso
    };

    setAppState(prev => ({
      ...prev,
      employeeDebts: prev.employeeDebts.map(d => {
        if (d.id !== debtId) return d;
        const currentRepayments = d.repayments || [];
        return {
          ...d,
          repayments: [...currentRepayments, newRep]
        };
      })
    }));
  };

  // ===================== CONTRACTOR PROJECTS HANDLERS =====================
  const handleAddProject = (project: Omit<Project, 'id'>) => {
    const nowIso = new Date().toISOString();
    const newProject: Project = {
      ...project,
      id: `proj-${Date.now()}`,
      createdAt: project.createdAt || nowIso,
      items: (project.items || []).map(item => ({
        ...item,
        createdAt: item.createdAt || nowIso,
        completedAt: item.status === 'مكتمل' ? (item.completedAt || nowIso) : undefined
      }))
    };
    setAppState(prev => ({
      ...prev,
      projects: [newProject, ...prev.projects]
    }));
  };

  const handleUpdateProject = (updated: Project) => {
    setAppState(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const handleDeleteProject = (id: string) => {
    setAppState(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
  };

  // ===================== EXECUTED PROJECTS HANDLERS =====================
  const handleAddExecutedProject = (project: Omit<ExecutedProject, 'id'>) => {
    const nowIso = new Date().toISOString();
    const newProject: ExecutedProject = {
      ...project,
      id: `exproj-${Date.now()}`,
      createdAt: project.createdAt || nowIso,
      completedAt: project.completedAt || nowIso
    };
    setAppState(prev => ({
      ...prev,
      executedProjects: [newProject, ...prev.executedProjects]
    }));
  };

  const handleUpdateExecutedProject = (updated: ExecutedProject) => {
    setAppState(prev => ({
      ...prev,
      executedProjects: prev.executedProjects.map(p => p.id === updated.id ? updated : p)
    }));
  };

  const handleDeleteExecutedProject = (id: string) => {
    setAppState(prev => ({
      ...prev,
      executedProjects: prev.executedProjects.filter(p => p.id !== id)
    }));
  };

  // ===================== OBLIGATIONS HANDLERS =====================
  const handleAddObligation = (obligation: Omit<Obligation, 'id'>) => {
    const nowIso = new Date().toISOString();
    const newOb: Obligation = {
      ...obligation,
      id: `ob-${Date.now()}`,
      createdAt: obligation.createdAt || nowIso,
      completedAt: obligation.status === 'مكتمل' ? (obligation.completedAt || nowIso) : undefined
    };
    setAppState(prev => ({
      ...prev,
      obligations: [newOb, ...prev.obligations]
    }));
  };

  const handleUpdateObligation = (updated: Obligation) => {
    const nowIso = new Date().toISOString();
    const obWithTime = {
      ...updated,
      completedAt: updated.status === 'مكتمل' ? (updated.completedAt || nowIso) : undefined
    };
    setAppState(prev => ({
      ...prev,
      obligations: prev.obligations.map(o => o.id === updated.id ? obWithTime : o)
    }));
  };

  const handleDeleteObligation = (id: string) => {
    setAppState(prev => ({
      ...prev,
      obligations: prev.obligations.filter(o => o.id !== id)
    }));
  };

  // ===================== SETTINGS & RESTORE HANDLERS =====================
  const handleUpdateSettings = (newSettings: OfficeSettings) => {
    setAppState(prev => ({
      ...prev,
      settings: newSettings
    }));
  };

  const handleRestoreAppState = (restored: AppState) => {
    setAppState(restored);
  };

  // If user is not logged in, show Login Screen
  if (!appState.isLoggedIn) {
    return <Login onLogin={handleLogin} error={loginError} settings={appState.settings} />;
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex text-slate-800 font-sans antialiased dir-rtl">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        state={appState}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header
          activeTab={activeTab}
          settings={appState.settings}
          currentUser={appState.currentUser}
        />

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              state={appState}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesPage
              expenses={appState.expenses}
              settings={appState.settings}
              onAddExpense={handleAddExpense}
              onUpdateExpense={handleUpdateExpense}
              onDeleteExpense={handleDeleteExpense}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'revenues' && (
            <RevenuesPage
              revenues={appState.revenues}
              settings={appState.settings}
              onAddRevenue={handleAddRevenue}
              onUpdateRevenue={handleUpdateRevenue}
              onDeleteRevenue={handleDeleteRevenue}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'contracts' && (
            <ContractsPage
              contracts={appState.contracts}
              settings={appState.settings}
              onAddContract={handleAddContract}
              onUpdateContract={handleUpdateContract}
              onDeleteContract={handleDeleteContract}
              onUpdateInstallmentStatus={handleUpdateInstallmentStatus}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'collection' && (
            <CollectionPage
              contracts={appState.contracts}
              settings={appState.settings}
              onUpdateInstallmentStatus={handleUpdateInstallmentStatus}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'employeeDebts' && (
            <EmployeeDebtsPage
              employeeDebts={appState.employeeDebts}
              settings={appState.settings}
              onAddDebt={handleAddDebt}
              onUpdateDebt={handleUpdateDebt}
              onDeleteDebt={handleDeleteDebt}
              onAddRepayment={handleAddRepayment}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsPage
              projects={appState.projects}
              settings={appState.settings}
              onAddProject={handleAddProject}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'executedProjects' && (
            <ExecutedProjectsPage
              executedProjects={appState.executedProjects}
              settings={appState.settings}
              onAddExecutedProject={handleAddExecutedProject}
              onUpdateExecutedProject={handleUpdateExecutedProject}
              onDeleteExecutedProject={handleDeleteExecutedProject}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'obligations' && (
            <ObligationsPage
              obligations={appState.obligations}
              settings={appState.settings}
              onAddObligation={handleAddObligation}
              onUpdateObligation={handleUpdateObligation}
              onDeleteObligation={handleDeleteObligation}
              onPrint={handlePrint}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsPage
              appState={appState}
              onUpdateSettings={handleUpdateSettings}
              onRestoreAppState={handleRestoreAppState}
            />
          )}
        </main>
      </div>
    </div>
  );
}
