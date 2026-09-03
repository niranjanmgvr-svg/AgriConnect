import React, { useState } from 'react';
import { Phone, ShieldCheck, KeyRound, Sparkles, UserCheck, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ isOpen, onClose }) {
  const { loginWithPhone, MOCK_USERS, switchRole } = useAuth();
  const [phone, setPhone] = useState('9876543210');
  const [role, setRole] = useState('farmer');
  const [otp, setOtp] = useState('123456');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

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
        onClose();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Invalid OTP verification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 text-emerald-950 p-2.5 rounded-2xl shadow">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-xl">Phone OTP Verification</h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Authentic SIH PS 26132 Phone Authentication
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl font-bold">
              {errorMsg}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Enter Mobile Phone Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 font-bold text-sm">+91</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    maxLength={10}
                    className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-2xl p-3 pl-14 text-base font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Select User Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-2xl p-3 text-sm font-bold focus:outline-none bg-white"
                >
                  <option value="farmer">👨‍🌾 Farmer / FPO Representative</option>
                  <option value="buyer">🏭 Verified Buyer</option>
                  <option value="admin">🛡️ Admin Moderator</option>
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3 rounded-xl font-medium">
                ⚡ <strong>Demo Verification Note:</strong> Demo OTP will be pre-filled as <code className="font-bold text-amber-950">123456</code>.
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3.5 text-base font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                <span>Send OTP via SMS</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs p-3 rounded-xl font-medium">
                {successMsg}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Enter 6-Digit OTP Code
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    maxLength={6}
                    className="w-full border-2 border-emerald-500 focus:border-emerald-700 rounded-2xl p-3 text-center tracking-widest text-2xl font-black focus:outline-none"
                    required
                  />
                  <KeyRound className="w-5 h-5 text-slate-400 absolute right-3.5 top-4" />
                </div>
                <p className="text-[11px] text-slate-400 font-semibold text-center mt-1">
                  Demo Hint: Use code <strong>123456</strong>
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="btn-outline py-3 px-4 text-xs font-bold"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 btn-primary py-3 text-base font-bold shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Verify OTP & Log In</span>
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Switcher Section */}
          <div className="pt-3 border-t border-slate-200 text-center space-y-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Quick Judge Demo Login (Instant Role Switching)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  switchRole('farmer');
                  onClose();
                }}
                className="bg-slate-100 hover:bg-emerald-100 text-slate-800 font-bold p-2 rounded-xl text-xs transition"
              >
                👨‍🌾 Farmer
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('buyer');
                  onClose();
                }}
                className="bg-slate-100 hover:bg-emerald-100 text-slate-800 font-bold p-2 rounded-xl text-xs transition"
              >
                🏭 Buyer
              </button>
              <button
                type="button"
                onClick={() => {
                  switchRole('admin');
                  onClose();
                }}
                className="bg-slate-100 hover:bg-emerald-100 text-slate-800 font-bold p-2 rounded-xl text-xs transition"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
