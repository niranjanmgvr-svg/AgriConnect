import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, AlertCircle, RefreshCw, CheckCircle2, FileCheck } from 'lucide-react';
import axios from 'axios';

export default function LedgerAuditPage() {
  const [logs, setLogs] = useState([]);
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLedger();
  }, []);

  const fetchLedger = async () => {
    setLoading(true);
    try {
      const [logsRes, auditRes] = await Promise.all([
        axios.get('/api/ledger/'),
        axios.get('/api/ledger/verify-chain')
      ]);
      setLogs(logsRes.data);
      setAuditResult(auditRes.data);
    } catch (err) {
      console.error("Error loading ledger:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Lock className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black">Immutable Append-Only Transaction Ledger</h2>
          </div>
          <p className="text-xs text-slate-400 font-medium mt-1">
            Every lot creation, offer, payment, and delivery event is linked sequentially via SHA-256 hash chaining (previous_hash + payload_hash).
          </p>
        </div>

        <button
          onClick={fetchLedger}
          className="bg-emerald-700 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 active:scale-95 transition cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Re-Verify Cryptographic Integrity</span>
        </button>
      </div>

      {/* Audit Banner */}
      {auditResult && (
        <div className={`p-5 rounded-2xl border-2 flex items-center justify-between gap-4 ${
          auditResult.status === 'VALIDATED_SECURE'
            ? 'bg-emerald-950 text-white border-emerald-700'
            : 'bg-red-950 text-white border-red-700'
        }`}>
          <div className="flex items-center gap-3">
            {auditResult.status === 'VALIDATED_SECURE' ? (
              <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
            )}
            <div>
              <h3 className="font-extrabold text-lg">
                Status: {auditResult.status} ({auditResult.total_records} Blocks Verified)
              </h3>
              <p className="text-xs text-slate-200 mt-0.5">{auditResult.message}</p>
            </div>
          </div>

          <div className="hidden sm:block text-right text-xs font-mono text-emerald-300">
            SHA-256 Verified
          </div>
        </div>
      )}

      {/* Logs Table / Block List */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
          <FileCheck className="w-5 h-5 text-emerald-700" />
          Sequential Block History
        </h3>

        <div className="space-y-3">
          {logs.map((log, idx) => (
            <div key={log.id} className="card-elevated font-mono text-xs space-y-2 border-l-4 border-l-emerald-600">
              <div className="flex items-center justify-between text-slate-500 font-bold border-b border-slate-100 pb-2">
                <span className="text-emerald-800 font-black">BLOCK #{log.id} — {log.event_type}</span>
                <span>{new Date(log.timestamp).toLocaleString()}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] bg-slate-900 text-slate-200 p-3 rounded-xl">
                <div>
                  <span className="text-slate-500 font-bold block">PREVIOUS BLOCK HASH:</span>
                  <span className="text-amber-300 break-all">{log.previous_hash}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-bold block">CURRENT BLOCK HASH (SHA-256):</span>
                  <span className="text-emerald-400 break-all">{log.current_hash}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <span className="font-bold text-slate-400 uppercase text-[10px] block">Payload Data:</span>
                <code>{log.record_data}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
