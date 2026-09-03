import React, { useState, useEffect } from 'react';
import { Users, ShieldCheck, Clock, CheckCircle2, Building, MapPin, Phone } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function BuyerDirectory() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBuyers();
  }, []);

  const fetchBuyers = async () => {
    try {
      const res = await axios.get('/api/buyers');
      setBuyers(res.data);
    } catch (err) {
      console.error("Error loading buyers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerification = async (buyerId, currentVerifiedStatus) => {
    try {
      await axios.post(`/api/buyers/${buyerId}/verify`, {
        verify: !currentVerifiedStatus
      });
      fetchBuyers();
    } catch (err) {
      console.error("Verification error:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-emerald-700" />
          {t('buyers_directory')}
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          All registered buyers must submit GSTIN/PAN and pass Admin verification before placing binding offers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buyers.map((b) => (
          <div key={b.id} className="card-elevated space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{b.business_name || b.name}</h3>
                  <p className="text-xs text-slate-500 font-bold">Contact Person: {b.name}</p>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase flex items-center gap-1 ${
                  b.is_verified 
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                    : 'bg-amber-100 text-amber-900 border border-amber-300'
                }`}>
                  {b.is_verified ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" /> : <Clock className="w-3.5 h-3.5 text-amber-700" />}
                  {b.is_verified ? 'GST VERIFIED' : 'PENDING'}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5 text-xs font-semibold text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">GSTIN / PAN:</span>
                  <strong className="font-mono text-slate-900">{b.gstin_pan || 'GSTIN-07AAAAA0000'}</strong>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">LOCATION:</span>
                  <span>{b.district || 'Delhi'}, {b.state || 'Delhi'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold">TRADE RATING:</span>
                  <span className="text-amber-600 font-bold">⭐ {b.rating} / 5.0</span>
                </div>
              </div>
            </div>

            {/* Admin Toggle Verification Action */}
            {currentUser.role === 'admin' && (
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-bold">Admin Moderation:</span>
                <button
                  onClick={() => handleToggleVerification(b.id, b.is_verified)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    b.is_verified 
                      ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200' 
                      : 'bg-emerald-700 text-white hover:bg-emerald-800'
                  }`}
                >
                  {b.is_verified ? 'Revoke Verification' : 'Approve Buyer GST'}
                </button>
              </div>
            )}

          </div>
        ))}
      </div>

    </div>
  );
}
