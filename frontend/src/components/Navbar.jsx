import React, { useState } from 'react';
import { 
  Sprout, Globe, Mic, MessageSquare, UserCheck, 
  TrendingUp, Package, Users, ShoppingBag, Lock, 
  CloudRain, FileText, BarChart3, ShieldAlert, Menu, X
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenVoice, onOpenSMS }) {
  const { lang, toggleLanguage, t } = useLanguage();
  const { currentUser, switchRole } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: TrendingUp },
    { id: 'lots', label: t('nav_lots'), icon: Package },
    { id: 'buyers', label: t('nav_buyers'), icon: Users },
    { id: 'transactions', label: t('nav_transactions'), icon: ShoppingBag },
    { id: 'ledger', label: t('nav_ledger'), icon: Lock },
    { id: 'weather', label: t('nav_weather'), icon: CloudRain },
    { id: 'schemes', label: t('nav_schemes'), icon: FileText },
    { id: 'monitoring', label: t('nav_monitoring'), icon: BarChart3 },
    { id: 'admin', label: t('nav_admin'), icon: ShieldAlert },
  ];

  return (
    <header className="bg-emerald-800 text-white shadow-lg sticky top-0 z-50">
      {/* Top Banner with Persona Switcher & Quick Actions */}
      <div className="bg-emerald-950 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800">
        <div className="flex items-center gap-2 font-medium text-emerald-200">
          <span className="bg-emerald-700 text-white px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wide">
            Mode: {currentUser.role}
          </span>
          <span>{currentUser.name} ({currentUser.phone})</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Role Switcher dropdown */}
          <div className="flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline text-emerald-300">Persona:</span>
            <select
              value={currentUser.role}
              onChange={(e) => switchRole(e.target.value)}
              className="bg-emerald-900 border border-emerald-700 text-amber-300 font-bold rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
            >
              <option value="farmer">👨‍🌾 Farmer / FPO</option>
              <option value="buyer">🏭 Verified Buyer</option>
              <option value="admin">🛡️ Admin Moderator</option>
            </select>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1 bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 text-white font-bold px-2.5 py-0.5 rounded text-xs transition cursor-pointer"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>{lang === 'en' ? 'हिन्दी (Hindi)' : 'English'}</span>
          </button>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <div 
          onClick={() => setActiveTab('dashboard')} 
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="bg-amber-500 text-emerald-950 p-2 rounded-xl group-hover:scale-105 transition shadow">
            <Sprout className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-white">
              {t('app_title')}
              <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                Govt Agmarknet Layer
              </span>
            </h1>
            <p className="text-[11px] text-emerald-200 hidden sm:block">
              {t('tagline')}
            </p>
          </div>
        </div>

        {/* Action Buttons: Voice Assistant & SMS Fallback */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoice}
            className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black px-3 py-2 rounded-xl shadow-md flex items-center gap-1.5 text-xs sm:text-sm active:scale-95 transition cursor-pointer"
          >
            <Mic className="w-4 h-4 text-emerald-950 animate-pulse" />
            <span>Bhashini Voice</span>
          </button>

          <button
            onClick={onOpenSMS}
            className="bg-emerald-700 hover:bg-emerald-600 text-emerald-100 font-bold px-3 py-2 rounded-xl border border-emerald-500 flex items-center gap-1.5 text-xs sm:text-sm active:scale-95 transition cursor-pointer"
          >
            <MessageSquare className="w-4 h-4 text-amber-300" />
            <span className="hidden md:inline">SMS Fallback</span>
            <span className="md:hidden">SMS</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-emerald-900 text-emerald-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar (Desktop) */}
      <nav className="hidden lg:block bg-emerald-900 border-t border-emerald-700/60 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-emerald-950 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-950' : 'text-emerald-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <nav className="lg:hidden bg-emerald-900 border-t border-emerald-700 px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition ${
                  isActive
                    ? 'bg-amber-400 text-emerald-950'
                    : 'text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
}
