import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, XCircle, FileSearch, UserCheck } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const [unverifiedBuyers, setUnverifiedBuyers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [buyersRes, dispRes, fraudRes] = await Promise.all([
        axios.get('/api/buyers/'),
        axios.get('/api/grievances/'),
        axios.get('/api/fraud/alerts')
      ]);
      setUnverifiedBuyers(buyersRes.data.filter(b => !b.is_verified));
      setDisputes(dispRes.data);
      setFraudAlerts(fraudRes.data?.alerts || []);
    } catch (err) {
      console.error("Admin data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveBuyer = async (buyerId) => {
    try {
      await axios.post(`/api/buyers/${buyerId}/verify`, { verify: true });
      fetchAdminData();
    } catch (err) {
      console.error("Buyer approve error:", err);
    }
  };

  const handleResolveDispute = async (disputeId, action) => {
    const notes = prompt("Enter Admin Moderation Resolution Notes:");
    if (!notes) return;
    try {
      await axios.post(`/api/grievances/${disputeId}/resolve`, {
        action,
        admin_notes: notes
      });
      fetchAdminData();
    } catch (err) {
      console.error("Dispute resolve error:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-amber-400" />
            Admin & Moderator Control Panel
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Buyer verification moderation, grievance dispute resolution queue, and AI fraud detection alerts.
          </p>
        </div>

        <button onClick={fetchAdminData} className="btn-primary py-2 px-4 text-xs font-bold">
          Refresh Queue
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Pending Buyer Verification Queue */}
        <div className="card-elevated space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              Pending Buyer Approval ({unverifiedBuyers.length})
            </span>
          </h3>

          {unverifiedBuyers.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-4 text-center">No pending buyer approvals.</p>
          ) : (
            <div className="space-y-3">
              {unverifiedBuyers.map((b) => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <strong className="text-slate-900 font-bold block">{b.business_name || b.name}</strong>
                  <p className="text-slate-500 font-mono">GSTIN/PAN: {b.gstin_pan || 'PENDING-SUBMISSION'}</p>
                  <p className="text-slate-500">Phone: {b.phone}</p>
                  <button
                    onClick={() => handleApproveBuyer(b.id)}
                    className="w-full btn-primary py-2 text-xs font-bold mt-1"
                  >
                    Approve Buyer GST & Enable Trading
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Grievance Dispute Resolution Queue */}
        <div className="card-elevated space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Grievance & Dispute Queue ({disputes.length})
            </span>
          </h3>

          {disputes.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium py-4 text-center">No open disputes in queue.</p>
          ) : (
            <div className="space-y-3">
              {disputes.map((d) => (
                <div key={d.id} className="p-3 bg-red-50/50 rounded-xl border border-red-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-red-800">Dispute #{d.id} ({d.reason})</span>
                    <span className="bg-red-200 text-red-900 px-2 py-0.5 rounded text-[10px] uppercase">{d.status}</span>
                  </div>

                  <p className="text-slate-700 italic">"{d.details}"</p>
                  <p className="text-slate-500 text-[10px]">Raised by: {d.raised_by_name} ({d.raised_by_role})</p>

                  {d.status === 'open' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleResolveDispute(d.id, 'resolved')}
                        className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-1.5 rounded-lg text-xs"
                      >
                        Resolve
                      </button>
                      <button
                        onClick={() => handleResolveDispute(d.id, 'dismissed')}
                        className="flex-1 bg-slate-700 hover:bg-slate-800 text-white font-bold py-1.5 rounded-lg text-xs"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 3: AI Fraud & Price-Manipulation Detection Queue */}
        <div className="card-elevated space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-amber-500" />
              AI Fraud & Anomaly Flags ({fraudAlerts.length})
            </span>
          </h3>

          <div className="space-y-3">
            {fraudAlerts.map((fa, i) => (
              <div key={i} className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-1.5">
                <div className="flex items-center justify-between font-bold">
                  <strong className="text-amber-950">{fa.title}</strong>
                  <span className="bg-amber-400 text-emerald-950 px-2 py-0.5 rounded text-[10px] uppercase font-black">
                    {fa.severity}
                  </span>
                </div>
                <p className="text-slate-700">{fa.description}</p>
                <div className="bg-white p-2 rounded border border-amber-200 text-[10px] text-amber-900 font-semibold">
                  Action: {fa.recommended_action}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
