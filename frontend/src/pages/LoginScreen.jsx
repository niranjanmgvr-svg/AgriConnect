import React, { useState } from 'react';
import { 
  Sprout, Phone, KeyRound, ShieldCheck, ArrowRight, 
  Globe, Sparkles, UserCheck, TrendingUp, Lock, Award, CheckCircle2 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginScreen() {
  const { loginWithPhone, quickLogin } = useAuth();
  const { lang, setLang, t } = useLanguage();

  const [phone, setPhone] = useState('9876543210');
  const [role, setRole] = useState('farmer');
  const [otp, setOtp] = useState('123456');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/request-otp', { phone, role });
      setSuccessMsg(res.data.message || `OTP sent to +91 ${phone}`);
      setStep('otp');
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/verify-otp', { phone, otp });
      if (res.data?.success && res.data?.user) {
        loginWithPhone(res.data.user);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Invalid OTP verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Top Bar on Login Screen */}
      <header className="border-b border-slate-800 bg-emerald-950/80 backdrop-blur-md px-4 sm:px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl shadow-lg">
              <Sprout className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                {t('app_title')}
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-200 hidden sm:block">
                Govt of Maharashtra | Direct Farmer-Buyer Marketplace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-transparent text-[11px] sm:text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="en" className="bg-slate-900">English</option>
                <option value="hi" className="bg-slate-900">हिन्दी</option>
                <option value="mr" className="bg-slate-900">मराठी</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      {/* Main Login Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Platform Branding & Value Props */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-700 text-emerald-300 px-3 py-1 rounded-full text-xs font-bold">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            Official Agmarknet (data.gov.in) & e-NAM Layer
          </div>

          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
            Transparent Mandi Prices & Direct Trade for <span className="text-amber-400">Indian Agriculture</span>
          </h2>

          <p className="text-xs sm:text-base text-slate-300 leading-relaxed font-medium">
            Empowering farmers and FPOs with explainable sell vs. hold advisories, AI price forecasting, direct buyer matching, and tamper-proof SHA-256 transaction certificates.
          </p>

          {/* Key Feature Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
              <TrendingUp className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white">AI Price Forecasting</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">7-14 day forecast range with 85% confidence bands & seasonal insights.</p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm text-white">Hash Ledger Audit</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">SHA-256 append-only transaction chain & printable Sale Certificates.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-5 bg-white text-slate-900 rounded-3xl p-5 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
          
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-2xl font-black text-slate-900">Platform Portal Sign In</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Authenticate via Mobile OTP or Quick Demo Mode
            </p>
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-bold">
              {errorMsg}
            </div>
          )}

          {/* Phone OTP Form */}
          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mobile Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400 font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-2xl p-3.5 pl-14 text-base font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  User Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-2xl p-3.5 text-sm font-bold focus:outline-none bg-white"
                >
                  <option value="farmer">👨‍🌾 Farmer / FPO Representative</option>
                  <option value="buyer">🏭 Verified Buyer</option>
                  <option value="admin">🛡️ Admin Moderator</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 text-base font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                <span>Send Verification OTP</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-xl font-medium">
                {successMsg}
              </div>

              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full border-2 border-emerald-500 focus:border-emerald-700 rounded-2xl p-3.5 text-center tracking-widest text-2xl font-black focus:outline-none"
                    required
                  />
                  <KeyRound className="w-5 h-5 text-slate-400 absolute right-4 top-4" />
                </div>
                <p className="text-xs text-slate-400 font-semibold text-center mt-1">
                  Demo Code: <strong className="text-emerald-700 font-extrabold">123456</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="btn-outline py-3.5 px-4 text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary py-3.5 text-base font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify & Enter Platform</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Login Cards for Evaluators */}
          <div className="pt-4 border-t border-slate-100 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              <span>Quick Judge Demo Login</span>
              <span className="text-emerald-700 font-bold lowercase">1-click access</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                onClick={() => quickLogin('farmer')}
                className="p-3 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-left transition active:scale-95 cursor-pointer"
              >
                <strong className="text-emerald-950 font-extrabold text-xs block">👨‍🌾 Ramesh Kumar</strong>
                <span className="text-[11px] text-emerald-700 font-bold">Farmer / FPO (UP)</span>
              </button>

              <button
                onClick={() => quickLogin('buyer')}
                className="p-3 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl text-left transition active:scale-95 cursor-pointer"
              >
                <strong className="text-amber-950 font-extrabold text-xs block">🏭 Rajesh Patel</strong>
                <span className="text-[11px] text-amber-800 font-bold">Verified Buyer (Delhi)</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Footer Disclaimer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500 font-medium">
        AgriConnect © 2026 — Government of India Agmarknet & e-NAM Price Data Layer | SIH Problem Statement 26132
      </footer>

    </div>
  );
}
