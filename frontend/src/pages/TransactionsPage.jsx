import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, CheckCircle2, Clock, CreditCard, ShieldCheck, 
  FileText, Download, Printer, ExternalLink, ArrowRight 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function TransactionsPage() {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [upiInput, setUpiInput] = useState('');
  const [activeTxId, setActiveTxId] = useState(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await axios.get('/api/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordPayment = async (txId) => {
    if (!upiInput) return;
    try {
      await axios.post(`/api/transactions/${txId}/record-payment`, {
        upi_ref: upiInput
      });
      setUpiInput('');
      setActiveTxId(null);
      fetchTransactions();
    } catch (err) {
      console.error("Payment Record Error:", err);
    }
  };

  const handleFetchCertificate = async (txId) => {
    try {
      const res = await axios.get(`/api/ledger/certificate/${txId}`);
      setSelectedCertificate(res.data);
    } catch (err) {
      console.error("Certificate Error:", err);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <ShoppingBag className="w-7 h-7 text-emerald-700" />
          {t('payment_tracker')}
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Full pipeline: Listed → Offered → Accepted → Paid/Delivered with cryptographic hash audit logging.
        </p>
      </div>

      <div className="space-y-4">
        {transactions.map((tx) => (
          <div key={tx.id} className="card-elevated space-y-4">
            
            {/* Header Status Pipeline */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs text-slate-400 font-mono block">TRANSACTION ID: #AGRI-TX-{String(tx.id).padStart(4, '0')}</span>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  {tx.commodity || 'Crop Harvest Produce'} ({tx.final_price_per_qtl} ₹/qtl)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  tx.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  Payment: {tx.payment_status}
                </span>

                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                  tx.delivery_status === 'delivered' ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-200'
                }`}>
                  Delivery: {tx.delivery_status}
                </span>
              </div>
            </div>

            {/* Pipeline Visualizer */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold py-2 bg-slate-50 rounded-xl border border-slate-100">
              <div className="text-emerald-700">1. Listed ✓</div>
              <div className="text-emerald-700">2. Offered ✓</div>
              <div className="text-emerald-700">3. Accepted ✓</div>
              <div className={tx.payment_status === 'paid' ? 'text-emerald-700' : 'text-amber-600 animate-pulse'}>
                4. {tx.payment_status === 'paid' ? 'Paid & Sealed ✓' : 'Payment Pending'}
              </div>
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-slate-50/50 p-3.5 rounded-xl border border-slate-100 font-medium">
              <div>
                <span className="text-slate-400 font-bold block">FARMER / SELLER:</span>
                <strong className="text-slate-900 text-sm font-extrabold">{tx.farmer_name}</strong>
              </div>

              <div>
                <span className="text-slate-400 font-bold block">BUYER COMPANY:</span>
                <strong className="text-slate-900 text-sm font-extrabold">{tx.buyer_name}</strong>
              </div>

              <div>
                <span className="text-slate-400 font-bold block">TOTAL VALUE:</span>
                <strong className="text-emerald-800 text-base font-black">₹{tx.total_amount.toLocaleString()}</strong>
              </div>
            </div>

            {/* Actions & UPI Input */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {tx.upi_ref ? (
                <div className="text-xs text-slate-600 font-mono bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-emerald-700" />
                  <span>UPI Ref: <strong>{tx.upi_ref}</strong></span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter UPI Ref No. (e.g. UPI/129381...)"
                    value={activeTxId === tx.id ? upiInput : ''}
                    onChange={(e) => {
                      setActiveTxId(tx.id);
                      setUpiInput(e.target.value);
                    }}
                    className="border-2 border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono focus:border-emerald-600 focus:outline-none"
                  />
                  <button
                    onClick={() => handleRecordPayment(tx.id)}
                    className="btn-primary py-1.5 px-3 text-xs font-bold"
                  >
                    Save UPI Ref
                  </button>
                </div>
              )}

              <button
                onClick={() => handleFetchCertificate(tx.id)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-4 h-4 text-amber-400" />
                <span>{t('sale_certificate')}</span>
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Shareable Cryptographic Sale Certificate Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border-4 border-emerald-700 space-y-6 text-slate-900 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setSelectedCertificate(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 font-bold text-xl"
            >
              ✕
            </button>

            {/* Certificate Header */}
            <div className="text-center space-y-2 border-b-2 border-slate-200 pb-4">
              <span className="bg-emerald-800 text-amber-300 font-black px-3 py-1 rounded-full text-xs uppercase tracking-widest">
                OFFICIAL DIGITAL TRADE CERTIFICATE
              </span>
              <h3 className="text-2xl font-black tracking-tight text-emerald-950">AgriConnect Sale Certificate</h3>
              <p className="text-xs font-semibold text-slate-500">
                Certificate ID: <strong>{selectedCertificate.certificate_id}</strong> | Date: {selectedCertificate.issue_date}
              </p>
            </div>

            {/* Certificate Content Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs font-semibold bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Seller / Farmer</span>
                <strong className="text-slate-900 text-sm font-extrabold block">{selectedCertificate.farmer_details.name}</strong>
                <span className="text-slate-500">{selectedCertificate.farmer_details.district}</span>
              </div>

              <div>
                <span className="text-slate-400 uppercase text-[10px] block font-bold">Verified Buyer</span>
                <strong className="text-slate-900 text-sm font-extrabold block">{selectedCertificate.buyer_details.business_name}</strong>
                <span className="text-slate-500">GST: {selectedCertificate.buyer_details.gstin_pan}</span>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-200 grid grid-cols-3 gap-2">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block font-bold">Commodity</span>
                  <strong className="text-slate-900 text-sm font-black">{selectedCertificate.commodity}</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block font-bold">Quantity</span>
                  <strong className="text-slate-900 text-sm font-black">{selectedCertificate.quantity_qtl} Quintals</strong>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] block font-bold">Total Trade Value</span>
                  <strong className="text-emerald-800 text-sm font-black">₹{selectedCertificate.total_value_inr.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Cryptographic Seal */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-2 border border-slate-800">
              <div className="flex items-center justify-between text-xs text-amber-400 font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Cryptographic SHA-256 Ledger Seal
                </span>
                <span className="text-slate-400 text-[10px]">Append-Only Chain</span>
              </div>
              <p className="font-mono text-[10px] text-emerald-300 break-all bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                {selectedCertificate.cryptographic_seal.hash_signature}
              </p>
            </div>

            {/* Certificate Footer */}
            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => window.print()} 
                className="btn-outline py-2 px-4 text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>

              <button 
                onClick={() => setSelectedCertificate(null)} 
                className="btn-primary py-2 px-6 text-xs font-bold"
              >
                Close Certificate
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
