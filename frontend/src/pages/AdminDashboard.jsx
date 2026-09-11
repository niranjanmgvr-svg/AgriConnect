import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, 
  FileSearch, UserCheck, Users, TrendingUp, Package, RefreshCw, Search, Lock, Activity, DollarSign
} from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { getCropImage, handleCropImageError } from '../utils/cropAssets';

export default function AdminDashboard() {
  const { lang, t, translateCommodity, translateMandi, formatCurrency } = useLanguage();
  const [activeTab, setActiveTab] = useState('moderation'); // 'moderation' | 'disputes' | 'fraud' | 'users' | 'prices'
  const [buyers, setBuyers] = useState([]);
  const [unverifiedBuyers, setUnverifiedBuyers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [users, setUsers] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & filter states
  const [userSearch, setUserSearch] = useState('');
  const [priceSearch, setPriceSearch] = useState('');

  // Grievance resolution modal
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [resolutionAction, setResolutionAction] = useState('resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [buyersRes, dispRes, fraudRes, usersRes, pricesRes] = await Promise.all([
        axios.get('/api/buyers/'),
        axios.get('/api/grievances/'),
        axios.get('/api/fraud/alerts'),
        axios.get('/api/auth/users'),
        axios.get('/api/prices/summary')
      ]);

      const allBuyers = buyersRes.data || [];
      setBuyers(allBuyers);
      setUnverifiedBuyers(allBuyers.filter(b => !b.is_verified));
      setDisputes(dispRes.data || []);
      setFraudAlerts(fraudRes.data?.alerts || []);
      setUsers(usersRes.data || []);
      setPrices(pricesRes.data || []);
    } catch (err) {
      console.error("Admin data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBuyer = async (buyerId, verifyStatus = true) => {
    try {
      await axios.post(`/api/buyers/${buyerId}/verify`, { verify: verifyStatus });
      fetchAdminData();
    } catch (err) {
      console.error("Buyer approve error:", err);
    }
  };

  const handleOpenDisputeModal = (dispute, action) => {
    setSelectedDispute(dispute);
    setResolutionAction(action);
    setResolutionNotes(`Admin action [${action.toUpperCase()}]: Issue reviewed against transaction hash ledger.`);
  };

  const handleConfirmDisputeResolution = async (e) => {
    e.preventDefault();
    if (!selectedDispute) return;
    try {
      await axios.post(`/api/grievances/${selectedDispute.id}/resolve`, {
        action: resolutionAction,
        admin_notes: resolutionNotes
      });
      setSelectedDispute(null);
      fetchAdminData();
    } catch (err) {
      console.error("Dispute resolve error:", err);
    }
  };

  // Filtered User List
  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
    (u.phone || '').includes(userSearch) ||
    (u.district || '').toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filtered Mandi Prices
  const filteredPrices = prices.filter(p =>
    (p.commodity || '').toLowerCase().includes(priceSearch.toLowerCase()) ||
    (p.mandi || '').toLowerCase().includes(priceSearch.toLowerCase()) ||
    (p.state || '').toLowerCase().includes(priceSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-purple-950 to-slate-900 text-white p-6 rounded-3xl border border-purple-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Government & Moderation Governance
              </span>
              <span className="bg-emerald-800 text-emerald-100 text-[10px] font-bold px-2 py-0.5 rounded">
                NABARD / APMC Admin Mode
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-8 h-8 text-amber-400" />
              {t('admin.control_center_title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 font-medium">
              {t('admin.moderation_desc')}
            </p>
          </div>

          <button 
            onClick={fetchAdminData} 
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center gap-2 shadow transition cursor-pointer self-start lg:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('common.refresh')}</span>
          </button>
        </div>

        {/* Executive KPI Summary Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-purple-800/80">
          <div className="bg-purple-900/60 p-3 rounded-2xl border border-purple-700/60">
            <span className="text-[10px] text-purple-200 font-bold uppercase block">{t('admin.kpi_pending_buyers')}</span>
            <strong className="text-lg font-black text-amber-300">{unverifiedBuyers.length} Pending</strong>
          </div>
          <div className="bg-purple-900/60 p-3 rounded-2xl border border-purple-700/60">
            <span className="text-[10px] text-purple-200 font-bold uppercase block">{t('admin.kpi_open_grievances')}</span>
            <strong className="text-lg font-black text-red-300">{disputes.filter(d => d.status === 'open').length} Open</strong>
          </div>
          <div className="bg-purple-900/60 p-3 rounded-2xl border border-purple-700/60">
            <span className="text-[10px] text-purple-200 font-bold uppercase block">{t('admin.kpi_total_users')}</span>
            <strong className="text-lg font-black text-white">{users.length} Users</strong>
          </div>
          <div className="bg-purple-900/60 p-3 rounded-2xl border border-purple-700/60">
            <span className="text-[10px] text-purple-200 font-bold uppercase block">{t('admin.kpi_mandi_records')}</span>
            <strong className="text-lg font-black text-emerald-300">{prices.length} Commodities</strong>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-purple-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'moderation' ? 'bg-amber-400 text-slate-950 shadow' : 'bg-purple-900/70 text-purple-200 hover:bg-purple-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>{t('admin.tab_gst_moderation')} ({unverifiedBuyers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('disputes')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'disputes' ? 'bg-amber-400 text-slate-950 shadow' : 'bg-purple-900/70 text-purple-200 hover:bg-purple-800'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>{t('admin.tab_grievances')} ({disputes.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fraud')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'fraud' ? 'bg-amber-400 text-slate-950 shadow' : 'bg-purple-900/70 text-purple-200 hover:bg-purple-800'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>{t('admin.tab_fraud_flags')} ({fraudAlerts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users' ? 'bg-amber-400 text-slate-950 shadow' : 'bg-purple-900/70 text-purple-200 hover:bg-purple-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{t('admin.tab_user_directory')} ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('prices')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'prices' ? 'bg-amber-400 text-slate-950 shadow' : 'bg-purple-900/70 text-purple-200 hover:bg-purple-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>{t('admin.tab_mandi_rates')}</span>
          </button>
        </div>
      </div>

      {/* MODULE 1: BUYER GST MODERATION QUEUE */}
      {activeTab === 'moderation' && (
        <div className="card-elevated space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <UserCheck className="w-6 h-6 text-emerald-700" />
                Pending Buyer GST Verification Applications ({unverifiedBuyers.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Review submitted GSTIN/PAN credentials before enabling institutional buying privileges.
              </p>
            </div>
          </div>

          {unverifiedBuyers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium">All buyer verification applications have been reviewed.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {unverifiedBuyers.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs font-semibold">
                  <div className="flex items-start justify-between">
                    <div>
                      <strong className="text-slate-900 font-extrabold text-sm block">{b.business_name || b.name}</strong>
                      <span className="text-slate-500">Contact: {b.name} ({b.phone})</span>
                    </div>
                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                      APPROVAL PENDING
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-slate-700">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">GSTIN / PAN:</span>
                      <span className="font-mono text-slate-900 font-bold">{b.gstin_pan || '29AAAAA0000A1Z5'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-bold">DISTRICT:</span>
                      <span>{b.district || 'Bengaluru'}, {b.state || 'Karnataka'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApproveBuyer(b.id, true)}
                      className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve GST & Enable Bidding</span>
                    </button>
                    <button
                      onClick={() => handleApproveBuyer(b.id, false)}
                      className="bg-red-100 hover:bg-red-200 text-red-800 font-bold py-2.5 px-3 rounded-xl text-xs"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODULE 2: GRIEVANCES & DISPUTES CENTER */}
      {activeTab === 'disputes' && (
        <div className="card-elevated space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Farmer & Buyer Grievances Queue ({disputes.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Audit transactions, resolve delivery quality disputes, or issue cryptographic ledger corrections.
              </p>
            </div>
          </div>

          {disputes.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium">No open grievances or transaction disputes.</div>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div key={d.id} className="p-4 bg-red-50/40 rounded-2xl border border-red-200 space-y-2 text-xs font-semibold">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-red-800 text-white font-black px-2 py-0.5 rounded text-[10px]">
                        Dispute #{d.id}
                      </span>
                      <strong className="text-red-950 text-sm font-black">{d.reason}</strong>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                      d.status === 'open' ? 'bg-red-200 text-red-900 border border-red-300' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {d.status}
                    </span>
                  </div>

                  <p className="text-slate-800 italic bg-white p-2.5 rounded-xl border border-red-100">
                    "{d.details}"
                  </p>
                  
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Raised by: {d.raised_by_name || 'Basavaraj Gowda'} ({d.raised_by_role || 'Farmer'})</span>
                    <span>Date: {d.created_at ? new Date(d.created_at).toLocaleDateString() : 'Recent'}</span>
                  </div>

                  {d.status === 'open' && (
                    <div className="flex items-center gap-2 pt-2 border-t border-red-200/60">
                      <button
                        onClick={() => handleOpenDisputeModal(d, 'resolved')}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Resolve Dispute</span>
                      </button>
                      <button
                        onClick={() => handleOpenDisputeModal(d, 'dismissed')}
                        className="bg-slate-700 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-xl text-xs"
                      >
                        Dismiss Dispute
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODULE 3: AI FRAUD & ANOMALY FLAGS */}
      {activeTab === 'fraud' && (
        <div className="card-elevated space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <FileSearch className="w-6 h-6 text-amber-500" />
                AI Fraud & Cartel Anomaly Engine ({fraudAlerts.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Automated detection of bidding price suppression, unusual mandi volume spikes, and trader cartelization.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {fraudAlerts.map((fa, i) => (
              <div key={i} className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <strong className="text-amber-950 text-sm font-black">{fa.title}</strong>
                  <span className="bg-amber-400 text-emerald-950 px-2.5 py-0.5 rounded text-[10px] font-black uppercase">
                    {fa.severity} SEVERITY
                  </span>
                </div>
                <p className="text-slate-800">{fa.description}</p>
                <div className="bg-white p-2.5 rounded-xl border border-amber-200 text-[11px] text-amber-900 font-bold flex items-center justify-between">
                  <span>Action: {fa.recommended_action}</span>
                  <button onClick={() => alert(`Admin Mitigation Dispatched for: ${fa.title}`)} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black px-3 py-1 rounded-lg text-[10px]">
                    Dispatch Intervention
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 4: USER DIRECTORY & ROLE MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card-elevated space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <Users className="w-6 h-6 text-emerald-700" />
                System User Directory ({filteredUsers.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">All registered farmers, verified buyers, and administrative users.</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user name or phone..."
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <div key={u.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <strong className="text-slate-900 font-extrabold text-sm">{u.name}</strong>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    u.role === 'buyer' ? 'bg-amber-400 text-slate-950' : (u.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-emerald-700 text-white')
                  }`}>
                    {u.role}
                  </span>
                </div>
                <p className="text-slate-600">Phone: {u.phone}</p>
                <p className="text-slate-500 text-[11px]">{u.district || 'Bengaluru Rural'}, {u.state || 'Karnataka'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE 5: AGMARKNET MANDI RATES INSPECTOR */}
      {activeTab === 'prices' && (
        <div className="card-elevated space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-emerald-700" />
                Agmarknet Live Mandi Price Records ({filteredPrices.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">Daily government benchmark price snapshot for Karnataka mandis.</p>
            </div>

            <div className="relative">
              <input
                type="text"
                value={priceSearch}
                onChange={(e) => setPriceSearch(e.target.value)}
                placeholder="Filter crop or mandi..."
                className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredPrices.map((p, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <img
                    src={getCropImage(p.commodity)}
                    onError={handleCropImageError}
                    alt={p.commodity}
                    className="w-12 h-12 rounded-xl object-cover border border-emerald-600/30 shadow-sm shrink-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <strong className="text-slate-900 font-black text-sm">{translateCommodity(p.commodity)}</strong>
                      <span className="text-emerald-800 font-black text-sm">{formatCurrency(p.modal_price)}/qtl</span>
                    </div>
                    <p className="text-slate-600">{translateMandi(p.mandi)} ({p.district})</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-200/60">
                  <span>Min: ₹{p.min_price} | Max: ₹{p.max_price}</span>
                  <span>Arrivals: {p.arrivals_qtl} Qtl</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* DISPUTE RESOLUTION MODAL */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-red-200 space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-600" />
                Resolve Grievance #{selectedDispute.id}
              </h3>
              <button onClick={() => setSelectedDispute(null)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>

            <form onSubmit={handleConfirmDisputeResolution} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Resolution Action</label>
                <select
                  value={resolutionAction}
                  onChange={(e) => setResolutionAction(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-xl p-2.5 text-xs font-bold focus:outline-none"
                >
                  <option value="resolved">Approve Grievance & Issue Refund</option>
                  <option value="dismissed">Dismiss Grievance (Unsubstantiated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 mb-1">Admin Moderation Rationale & Notes</label>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={3}
                  className="w-full border-2 border-slate-300 rounded-xl p-3 text-xs font-bold focus:outline-none"
                  required
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button type="button" onClick={() => setSelectedDispute(null)} className="flex-1 bg-slate-100 py-2.5 rounded-xl text-xs font-bold">Cancel</button>
                <button type="submit" className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 rounded-xl text-xs shadow">Confirm Resolution</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
