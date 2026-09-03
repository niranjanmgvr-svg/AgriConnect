import React, { useState, useRef, useEffect } from 'react';
import { 
  Sprout, Globe, Mic, MessageSquare, UserCheck, 
  TrendingUp, Package, Users, ShoppingBag, Lock, 
  CloudRain, FileText, BarChart3, ShieldAlert, Menu, X,
  User, LogOut, ChevronDown, ShieldCheck, ExternalLink
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ activeTab, setActiveTab, onOpenVoice, onOpenSMS }) {
  const { lang, setLang, t } = useLanguage();
  const { currentUser, switchRole, logout } = useAuth();
  
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { id: 'dashboard', label: t('nav_dashboard'), icon: TrendingUp },
    { id: 'lots', label: t('nav_lots'), icon: Package },
    { id: 'buyers', label: t('nav_buyers'), icon: Users },
    { id: 'transactions', label: t('nav_transactions'), icon: ShoppingBag },
    { id: 'weather', label: t('nav_weather'), icon: CloudRain },
    { id: 'schemes', label: t('nav_schemes'), icon: FileText },
    { id: 'monitoring', label: t('nav_monitoring'), icon: BarChart3 },
    { id: 'admin', label: t('nav_admin'), icon: ShieldAlert },
  ];

  const getRoleBadge = (role) => {
    if (role === 'farmer') return { label: 'Farmer / FPO', bg: 'bg-emerald-700 text-white' };
    if (role === 'buyer') return { label: 'Verified Buyer', bg: 'bg-amber-500 text-slate-950 font-black' };
    return { label: 'Admin Moderator', bg: 'bg-purple-600 text-white' };
  };

  const badgeInfo = getRoleBadge(currentUser?.role);

  return (
    <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50 w-full overflow-x-clip">
      
      {/* Tier 1: Main Top Bar */}
      <div className="bg-emerald-950 border-b border-emerald-800/80 px-3 sm:px-6 py-2.5 sm:py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Heading (Removed SIH 26132 badge as requested) */}
          <div 
            onClick={() => {
              setActiveTab('dashboard');
              setMobileMenuOpen(false);
            }} 
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group shrink-0"
          >
            <div className="bg-amber-500 text-slate-950 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl group-hover:scale-105 transition shadow-md">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                {t('app_title')}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-emerald-300 hidden md:block mt-1">
                {t('tagline')}
              </p>
            </div>
          </div>

          {/* Right Section: Accessibility Controls, Language, User Profile & Log Out */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Desktop Accessibility Buttons */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={onOpenVoice}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black px-3 py-1.5 rounded-xl shadow flex items-center gap-1.5 text-xs active:scale-95 transition cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-slate-950 animate-pulse" />
                <span>Bhashini Voice</span>
              </button>

              <button
                onClick={onOpenSMS}
                className="bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-bold px-3 py-1.5 rounded-xl border border-emerald-600 flex items-center gap-1.5 text-xs active:scale-95 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-300" />
                <span>SMS Fallback</span>
              </button>
            </div>

            {/* Language Selector Dropdown */}
            <div className="flex items-center gap-1 bg-emerald-900 border border-emerald-700 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl text-xs">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-emerald-950">English</option>
                <option value="hi" className="bg-emerald-950">हिन्दी</option>
                <option value="mr" className="bg-emerald-950">मराठी</option>
              </select>
            </div>

            {/* User Profile Avatar & Dropdown Menu */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 bg-emerald-900 hover:bg-emerald-800 border border-emerald-700 p-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl transition cursor-pointer"
              >
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-xs sm:text-sm shadow">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight">
                    {currentUser?.name || 'User'}
                  </span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${badgeInfo.bg}`}>
                    {badgeInfo.label}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-emerald-300 hidden md:block" />
              </button>

              {/* Profile Dropdown Items */}
              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50 rounded-t-2xl">
                    <strong className="text-sm font-black text-slate-900 block">{currentUser?.name}</strong>
                    <span className="text-xs text-slate-500 font-semibold block">+91 {currentUser?.phone}</span>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 border border-emerald-300">
                      {badgeInfo.label} • {currentUser?.district || 'India'}
                    </span>
                  </div>

                  <div className="py-1">
                    <div className="px-4 py-1.5 text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
                      Switch Persona (Judge Demo)
                    </div>
                    
                    <button
                      onClick={() => {
                        switchRole('farmer');
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-xs text-left font-bold flex items-center justify-between hover:bg-emerald-50 ${
                        currentUser?.role === 'farmer' ? 'text-emerald-800 bg-emerald-50/60 font-black' : 'text-slate-700'
                      }`}
                    >
                      <span>👨‍🌾 Farmer / FPO</span>
                      {currentUser?.role === 'farmer' && <ShieldCheck className="w-4 h-4 text-emerald-700" />}
                    </button>

                    <button
                      onClick={() => {
                        switchRole('buyer');
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-xs text-left font-bold flex items-center justify-between hover:bg-amber-50 ${
                        currentUser?.role === 'buyer' ? 'text-amber-900 bg-amber-50/60 font-black' : 'text-slate-700'
                      }`}
                    >
                      <span>🏭 Verified Buyer</span>
                      {currentUser?.role === 'buyer' && <ShieldCheck className="w-4 h-4 text-amber-700" />}
                    </button>

                    <button
                      onClick={() => {
                        switchRole('admin');
                        setProfileDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-xs text-left font-bold flex items-center justify-between hover:bg-purple-50 ${
                        currentUser?.role === 'admin' ? 'text-purple-900 bg-purple-50/60 font-black' : 'text-slate-700'
                      }`}
                    >
                      <span>🛡️ Admin Moderator</span>
                      {currentUser?.role === 'admin' && <ShieldCheck className="w-4 h-4 text-purple-700" />}
                    </button>
                  </div>

                  <div className="border-t border-slate-100 pt-1">
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log Out</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

            {/* Prominent Direct Log Out Button in Top Header */}
            <button
              onClick={logout}
              className="hidden sm:flex items-center gap-1.5 bg-red-950/80 hover:bg-red-900 border border-red-800/80 text-red-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer"
              title="Log Out of Account"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>

            {/* Mobile Navigation Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-emerald-800 text-emerald-200 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

          </div>

        </div>
      </div>

      {/* Tier 2: Secondary Navigation Bar (Desktop Tabs) */}
      <nav className="hidden lg:block bg-emerald-900 border-t border-emerald-800/60 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1 overflow-x-auto py-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm'
                    : 'text-emerald-100 hover:bg-emerald-800 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Comprehensive Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-emerald-950 border-t border-emerald-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* User Profile Card on Mobile Drawer */}
          <div className="bg-emerald-900/90 border border-emerald-800 p-3 rounded-2xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-base shadow">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <strong className="text-xs font-black text-white block">{currentUser?.name}</strong>
                <span className="text-[10px] text-emerald-300 font-bold block">+91 {currentUser?.phone}</span>
              </div>
            </div>

            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeInfo.bg}`}>
              {badgeInfo.label}
            </span>
          </div>

          {/* Accessibility Quick Buttons on Mobile Drawer */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onOpenVoice();
                setMobileMenuOpen(false);
              }}
              className="bg-amber-500 text-slate-950 font-black p-2.5 rounded-xl shadow flex items-center justify-center gap-1.5 text-xs"
            >
              <Mic className="w-4 h-4 animate-pulse" />
              <span>Bhashini Voice</span>
            </button>

            <button
              onClick={() => {
                onOpenSMS();
                setMobileMenuOpen(false);
              }}
              className="bg-emerald-800 text-emerald-100 font-bold p-2.5 rounded-xl border border-emerald-700 flex items-center justify-center gap-1.5 text-xs"
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>SMS Fallback</span>
            </button>
          </div>

          {/* Quick Persona Switching for Mobile */}
          <div className="bg-emerald-900/60 p-2.5 rounded-xl border border-emerald-800 space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase text-emerald-300 block">Switch Persona (Judge Demo):</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                onClick={() => {
                  switchRole('farmer');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center ${currentUser?.role === 'farmer' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-950 text-emerald-200'}`}
              >
                👨‍🌾 Farmer
              </button>
              <button
                onClick={() => {
                  switchRole('buyer');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center ${currentUser?.role === 'buyer' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-950 text-emerald-200'}`}
              >
                🏭 Buyer
              </button>
              <button
                onClick={() => {
                  switchRole('admin');
                  setMobileMenuOpen(false);
                }}
                className={`py-1.5 px-1 rounded-lg text-[10px] font-bold text-center ${currentUser?.role === 'admin' ? 'bg-amber-400 text-slate-950 font-black' : 'bg-emerald-950 text-emerald-200'}`}
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-1 pt-1 border-t border-emerald-800">
            <span className="text-[10px] font-extrabold uppercase text-emerald-400 tracking-wider px-2 block mb-1">Navigation Menu:</span>
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-xs transition ${
                    isActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-emerald-100 hover:bg-emerald-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Log Out Button */}
          <div className="pt-2 border-t border-emerald-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-red-950 text-red-200 border border-red-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
}
