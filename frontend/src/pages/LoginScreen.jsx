import React, { useState } from 'react';
import { 
  Sprout, Phone, KeyRound, ShieldCheck, ArrowRight, 
  Globe, Sparkles, UserCheck, Lock, Award, Mail, User, Check
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginScreen() {
  const { loginWithPhone, loginWithGoogle, quickLogin } = useAuth();
  const { lang, setLang, t } = useLanguage();

  // Form State
  const [role, setRole] = useState('farmer'); // 'farmer' (Seller) | 'buyer' (Buyer)
  const [name, setName] = useState('Basavaraj Gowda');
  const [contactInfo, setContactInfo] = useState('9876543210');
  const [otp, setOtp] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!contactInfo || contactInfo.trim().length < 3) {
      setErrorMsg('Please enter a valid Mobile Number or Email address');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      loginWithPhone({
        name: name || (role === 'buyer' ? 'Kaveri Agro Traders' : 'Basavaraj Gowda'),
        phone: contactInfo.includes('@') ? '9876543210' : contactInfo,
        email: contactInfo.includes('@') ? contactInfo : null,
        role: role,
        business_name: role === 'buyer' ? 'Kaveri Agro Traders Pvt Ltd' : null
      });
      setLoading(false);
    }, 200);
  };

  const handleVerifyAndLogin = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!otp) {
      setErrorMsg('Please enter the 6-digit verification OTP');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      loginWithPhone({
        name: name || (role === 'buyer' ? 'Kaveri Agro Traders' : 'Basavaraj Gowda'),
        phone: contactInfo.includes('@') ? '9876543210' : contactInfo,
        email: contactInfo.includes('@') ? contactInfo : null,
        role: role,
        business_name: role === 'buyer' ? 'Kaveri Agro Traders Pvt Ltd' : null
      });
      setLoading(false);
    }, 400);
  };

  const handleGoogleSignIn = () => {
    setLoading(true);
    setTimeout(() => {
      loginWithGoogle({
        name: role === 'buyer' ? 'Kaveri Agro Traders (Google)' : 'Basavaraj Gowda (Google)',
        email: contactInfo.includes('@') ? contactInfo : 'user@gmail.com',
        role: role,
        picture: 'https://lh3.googleusercontent.com/a/default-user'
      });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Top Header Bar */}
      <header className="border-b border-slate-800 bg-emerald-950/90 backdrop-blur-md px-4 sm:px-6 py-3.5 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 text-slate-950 p-2 sm:p-2.5 rounded-2xl shadow-lg">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {t('app_title')}
              </h1>
              <p className="text-xs text-emerald-300 hidden sm:block">
                Direct Farmer-Buyer Digital Agriculture Platform
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-xl">
            <Globe className="w-4 h-4 text-amber-400 shrink-0" />
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="en" className="bg-slate-900">English</option>
              <option value="hi" className="bg-slate-900">हिन्दी</option>
              <option value="mr" className="bg-slate-900">मराठी</option>
              <option value="kn" className="bg-slate-900">ಕನ್ನಡ</option>
            </select>
          </div>
        </div>
      </header>

      {/* Center Main Content Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 flex flex-col justify-center">
        
        {/* Simple Login Card */}
        <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
          
          {/* Title Header */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Sign In to AgriConnect
            </h2>
            <p className="text-xs font-semibold text-slate-500">
              Simple 1-Click Access for Farmers & Buyers
            </p>
          </div>

          {/* Error / Success Notifications */}
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-bold text-center">
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-xl font-bold text-center">
              {successMsg}
            </div>
          )}

          {/* STEP 1: Select Role (Buyer or Seller) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black uppercase tracking-wider text-slate-500 text-center">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setRole('farmer');
                  setName('Basavaraj Gowda');
                }}
                className={`py-3 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'farmer' 
                    ? 'bg-emerald-700 text-white shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>👨‍🌾 Farmer / Seller</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRole('buyer');
                  setName('Kaveri Agro Traders');
                }}
                className={`py-3 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  role === 'buyer' 
                    ? 'bg-amber-500 text-slate-950 shadow-md' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🏭 Verified Buyer</span>
              </button>
            </div>
          </div>

          {/* Simple Form */}
          <form onSubmit={otpSent ? handleVerifyAndLogin : handleSendOtp} className="space-y-4">
            
            {/* Field 1: Name */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Your Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Basavaraj Gowda"
                  className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-2xl p-3 pl-11 text-sm font-bold focus:outline-none"
                  required
                />
                <User className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Field 2: Mobile Number or Email */}
            <div>
              <label className="block text-xs font-extrabold text-slate-700 mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="9876543210 or email@domain.com"
                  className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-2xl p-3 pl-11 text-sm font-bold focus:outline-none"
                  required
                />
                <Phone className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            {/* Field 3: OTP Field (shows after clicking Get OTP or ready for quick login) */}
            {otpSent && (
              <div>
                <label className="block text-xs font-extrabold text-slate-700 mb-1">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full border-2 border-emerald-500 focus:border-emerald-700 rounded-2xl p-3 text-center tracking-widest text-xl font-black focus:outline-none bg-emerald-50/50"
                    required
                  />
                  <KeyRound className="w-5 h-5 text-emerald-600 absolute right-3.5 top-3.5" />
                </div>
                <p className="text-[11px] text-emerald-800 font-bold text-center mt-1">
                  Demo Verification OTP: <strong>123456</strong>
                </p>
              </div>
            )}

            {/* Action Submit Button */}
            {!otpSent ? (
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-sm font-black shadow-lg flex items-center justify-center gap-2 rounded-2xl cursor-pointer min-h-[48px]"
              >
                <span>Sign In to AgriConnect →</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="btn-outline py-3 px-4 text-xs font-bold rounded-2xl"
                >
                  Edit
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary py-3.5 text-sm font-black shadow-lg flex items-center justify-center gap-2 rounded-2xl cursor-pointer min-h-[48px]"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify OTP & Sign In</span>
                </button>
              </div>
            )}

          </form>

          {/* OR Google SSO Button */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <button
              onClick={handleGoogleSignIn}
              type="button"
              className="w-full bg-white hover:bg-slate-50 border-2 border-slate-300 text-slate-800 font-extrabold py-3 px-4 rounded-2xl shadow-sm flex items-center justify-center gap-2.5 transition active:scale-98 cursor-pointer"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span className="text-xs font-extrabold text-slate-800">Sign in with Google</span>
            </button>
          </div>

          {/* Quick Judge Demo Buttons */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block text-center">
              Quick Judge Demo Sign-In:
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => quickLogin('farmer')}
                className="py-2.5 px-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-center transition cursor-pointer active:scale-95"
              >
                <span className="text-xs font-black text-emerald-950 block">👨‍🌾 Farmer</span>
                <span className="text-[10px] text-emerald-700 font-bold truncate block">Basavaraj</span>
              </button>

              <button
                onClick={() => quickLogin('buyer')}
                className="py-2.5 px-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl text-center transition cursor-pointer active:scale-95"
              >
                <span className="text-xs font-black text-amber-950 block">🏭 Buyer</span>
                <span className="text-[10px] text-amber-800 font-bold truncate block">Kaveri Agro</span>
              </button>

              <button
                onClick={() => quickLogin('admin')}
                className="py-2.5 px-2 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl text-center transition cursor-pointer active:scale-95"
              >
                <span className="text-xs font-black text-purple-950 block">🛡️ Admin</span>
                <span className="text-[10px] text-purple-800 font-bold truncate block">APMC Admin</span>
              </button>
            </div>
          </div>

        </div>

      </main>

      {/* Simple Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-3 text-center text-slate-500 text-xs font-bold">
        AgriConnect © 2026 • Official Agmarknet & e-NAM Layer
      </footer>

    </div>
  );
}
