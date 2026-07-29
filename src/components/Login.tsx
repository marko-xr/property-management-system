import React, { useState } from 'react';
import { Building, Lock, User, KeyRound, AlertCircle, ShieldCheck } from 'lucide-react';
import { OfficeSettings } from '../types';

interface LoginProps {
  settings: OfficeSettings;
  onLogin?: (u: string, p: string) => void;
  onLoginSuccess?: (user: { username: string; name: string; role: string }) => void;
  error?: string;
}

export const Login: React.FC<LoginProps> = ({ settings, onLogin, onLoginSuccess, error: externalError }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [internalError, setInternalError] = useState('');

  const displayError = externalError || internalError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setInternalError('يرجى إدخال اسم المستخدم وكلمة المرور');
      return;
    }

    if (onLogin) {
      onLogin(username, password);
    } else if (onLoginSuccess) {
      const foundUser = settings.users?.find(u => u.username.toLowerCase() === username.trim().toLowerCase());
      if (foundUser || (username === 'admin' && (password === 'admin' || password === '123456'))) {
        setInternalError('');
        onLoginSuccess(foundUser || { id: 'usr-1', username: 'admin', name: 'سارة المنصوري', role: 'مدير المكتب' });
      } else {
        setInternalError('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0f172a] flex items-center justify-center p-4 relative overflow-hidden dir-rtl">
      {/* Subtle background decoration */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 z-10 text-right">
        {/* Top Header Card */}
        <div className="bg-[#0f172a] p-8 text-center border-b border-slate-800 relative">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-white text-slate-900 flex items-center justify-center font-bold text-2xl shadow-md mb-4 border border-slate-700 p-2">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center font-mono font-black text-xs leading-none">
                <div className="text-red-600 font-bold">EMARATEK</div>
                <div className="text-emerald-600 text-[8px]">REAL ESTATE</div>
              </div>
            )}
          </div>
          <h1 className="text-xl font-extrabold text-white">{settings.officeName || 'إماراتك العقارية'}</h1>
          <p className="text-amber-400 text-xs font-bold mt-1">عجمان - الجرف - دوار ماكدونالدز</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {displayError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{displayError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">اسم المستخدم</label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="أدخل اسم المستخدم"
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">كلمة المرور</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل كلمة المرور"
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                required
              />
              <KeyRound className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
            </div>
          </div>

          {/* Demo Hint */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] flex items-center justify-between">
            <span>بيانات الدخول التجريبية:</span>
            <span className="font-mono font-bold text-slate-900 dir-ltr bg-white px-2 py-0.5 rounded border border-slate-200">admin / admin</span>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>تسجيل الدخول للنظام</span>
          </button>
        </form>

        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>نظام إدارة عقارات آمن ومحمي</span>
        </div>
      </div>
    </div>
  );
};

