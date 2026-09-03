import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Sparkles, MapPin, Tag, Calendar, 
  CheckCircle, ArrowRight, ShieldCheck, Image as ImageIcon, Camera
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LotsPage({ onSelectLot }) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const [lots, setLots] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Lot Creation Form State
  const [commodity, setCommodity] = useState('Wheat');
  const [variety, setVariety] = useState('Sharbati Premium');
  const [quantityQtl, setQuantityQtl] = useState(100);
  const [expectedPrice, setExpectedPrice] = useState(2450);
  const [qualityDesc, setQualityDesc] = useState('Sun-dried golden grains, moisture level under 11%. High kernel uniformity.');
  const [mandi, setMandi] = useState('Kanpur Mandi');
  const [district, setDistrict] = useState('Kanpur Nagar');
  const [state, setState] = useState('Uttar Pradesh');
  const [aiGrade, setAiGrade] = useState(null);

  useEffect(() => {
    fetchLots();
  }, []);

  const fetchLots = async () => {
    try {
      const res = await axios.get('/api/lots');
      setLots(res.data);
    } catch (err) {
      console.error("Error fetching lots:", err);
    }
  };

  const handleTestAiGrade = async () => {
    try {
      const res = await axios.post(`/api/lots/quality-grade?commodity=${commodity}`);
      setAiGrade(res.data);
    } catch (err) {
      console.error("AI Grade Error:", err);
    }
  };

  const handleCreateLot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/lots', {
        farmer_id: currentUser.id,
        commodity,
        variety,
        quantity_qtl: parseFloat(quantityQtl),
        expected_price_per_qtl: parseFloat(expectedPrice),
        quality_description: qualityDesc,
        location_mandi: mandi,
        location_district: district,
        location_state: state,
        images: ["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop"]
      });
      setShowCreateModal(false);
      fetchLots();
    } catch (err) {
      console.error("Error creating lot:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-emerald-700" />
            Digital Lot Marketplace
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Directly connect your harvest with verified buyers across India without middlemen.
          </p>
        </div>

        {currentUser.role === 'farmer' && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary py-3.5 px-6 text-sm font-bold shadow-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>{t('create_lot')}</span>
          </button>
        )}
      </div>

      {/* Digital Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {lots.map((lot) => (
          <div 
            key={lot.id} 
            className="card-elevated flex flex-col justify-between overflow-hidden hover:border-emerald-500 transition group"
          >
            <div className="space-y-4">
              {/* Image Preview & Grade Banner */}
              <div className="relative h-44 -mx-5 -mt-5 bg-slate-100 overflow-hidden">
                <img 
                  src={lot.images?.[0] || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop"} 
                  alt={lot.commodity}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                />
                
                <span className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-sm text-amber-400 text-xs font-black px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {lot.grade_ai}
                </span>

                <span className="absolute bottom-3 right-3 bg-emerald-800 text-white text-xs font-black px-2.5 py-1 rounded-lg shadow">
                  ₹{lot.expected_price_per_qtl.toLocaleString()}/qtl
                </span>
              </div>

              {/* Lot Details */}
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-extrabold text-slate-900">{lot.commodity}</h3>
                  <span className="text-xs bg-slate-100 font-bold px-2 py-0.5 rounded text-slate-600">
                    {lot.variety || 'Standard Grade'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{lot.location_mandi}, {lot.location_district} ({lot.location_state})</span>
                </div>
              </div>

              {/* Quantity & Farmer */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-400 font-bold block">LOT QUANTITY</span>
                  <strong className="text-slate-900 text-sm font-black">{lot.quantity_qtl} Quintals</strong>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block">FARMER / FPO</span>
                  <strong className="text-emerald-800 text-sm font-extrabold">{lot.farmer_name}</strong>
                </div>
              </div>

              <p className="text-xs text-slate-600 line-clamp-2 italic">
                "{lot.quality_description}"
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
                Status: <strong className="text-emerald-700">{lot.status}</strong>
              </span>

              <button
                onClick={() => onSelectLot(lot.id)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
              >
                <span>View & Negotiate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Digital Lot Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="bg-emerald-800 p-5 text-white flex items-center justify-between">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Plus className="w-5 h-5 text-amber-400" />
                {t('create_lot')}
              </h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-emerald-200 hover:text-white font-bold text-xl px-2"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLot} className="p-6 space-y-4 text-sm font-semibold text-slate-700">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Commodity Crop</label>
                  <select
                    value={commodity}
                    onChange={(e) => setCommodity(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-xl p-3 focus:border-emerald-600 focus:outline-none"
                  >
                    <option value="Wheat">Wheat (गेहूं)</option>
                    <option value="Onion">Onion (प्याज)</option>
                    <option value="Potato">Potato (आलू)</option>
                    <option value="Paddy (Dhan)">Paddy / Rice (धान)</option>
                    <option value="Tomato">Tomato (टमाटर)</option>
                    <option value="Chana (Gram)">Chana / Gram (चना)</option>
                    <option value="Mustard">Mustard (सरसों)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Variety / Quality</label>
                  <input
                    type="text"
                    value={variety}
                    onChange={(e) => setVariety(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-xl p-3 focus:border-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quantity (Quintals)</label>
                  <input
                    type="number"
                    value={quantityQtl}
                    onChange={(e) => setQuantityQtl(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-xl p-3 focus:border-emerald-600 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Expected Price (₹/Quintal)</label>
                  <input
                    type="number"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-xl p-3 focus:border-emerald-600 focus:outline-none font-bold text-emerald-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Location / Mandi</label>
                <div className="grid grid-cols-3 gap-2">
                  <input type="text" value={mandi} onChange={(e) => setMandi(e.target.value)} placeholder="Mandi" className="border-2 border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none" />
                  <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="District" className="border-2 border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none" />
                  <input type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="State" className="border-2 border-slate-300 rounded-xl p-2.5 text-xs focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Quality Description</label>
                <textarea
                  value={qualityDesc}
                  onChange={(e) => setQualityDesc(e.target.value)}
                  rows={2}
                  className="w-full border-2 border-slate-300 rounded-xl p-3 text-xs focus:border-emerald-600 focus:outline-none"
                />
              </div>

              {/* Feature 17: MobileNet AI Quality Pre-Check */}
              <div className="bg-slate-900 text-white p-4 rounded-2xl space-y-3 border border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <Sparkles className="w-4 h-4" />
                    MobileNet AI Quality Pre-Check
                  </div>

                  <button
                    type="button"
                    onClick={handleTestAiGrade}
                    className="bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition"
                  >
                    Run AI Photo Analysis
                  </button>
                </div>

                {aiGrade && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-400 font-extrabold text-sm">{aiGrade.indicative_grade}</span>
                      <span className="text-slate-400">{aiGrade.confidence_pct}% Match</span>
                    </div>
                    <p className="text-slate-300">{aiGrade.summary}</p>
                    <div className="flex flex-wrap gap-1 text-[10px]">
                      {aiGrade.defect_flags.map((d, i) => (
                        <span key={i} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline py-3 px-5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary py-3 px-6 text-xs font-bold"
                >
                  Publish Digital Lot Listing
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
