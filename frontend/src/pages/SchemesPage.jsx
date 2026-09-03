import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, CheckCircle2, Award, Landmark, Filter } from 'lucide-react';
import axios from 'axios';

export default function SchemesPage() {
  const [crop, setCrop] = useState('Wheat');
  const [state, setState] = useState('Uttar Pradesh');
  const [landAcres, setLandAcres] = useState(2.5);
  
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, [crop, state, landAcres]);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/schemes/recommend?crop=${crop}&state=${state}&land_acres=${landAcres}`);
      setRecommendations(res.data);
    } catch (err) {
      console.error("Error fetching schemes:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Landmark className="w-7 h-7 text-emerald-700" />
          Government Scheme Recommender
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Integrated with Government of India's <strong>myScheme.gov.in</strong> portal for direct eligibility matching.
        </p>
      </div>

      {/* Filter Inputs */}
      <div className="card-elevated bg-slate-900 text-white space-y-4">
        <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          Enter Farmer Profile for Direct Scheme Matching:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Declared Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            >
              <option value="Wheat">Wheat (गेहूं)</option>
              <option value="Paddy (Dhan)">Paddy / Rice (धान)</option>
              <option value="Onion">Onion (प्याज)</option>
              <option value="Potato">Potato (आलू)</option>
              <option value="Mustard">Mustard (सरसों)</option>
              <option value="Cotton">Cotton (कपास)</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">State</label>
            <input
              type="text"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Landholding Size (Acres)</label>
            <input
              type="number"
              step="0.5"
              value={landAcres}
              onChange={(e) => setLandAcres(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-amber-400 font-bold focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Matched Schemes List */}
      {recommendations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Found <strong>{recommendations.total_matched_schemes}</strong> Matched Central & State Schemes</span>
            <span>Source: {recommendations.source_portal}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.schemes.map((s) => (
              <div key={s.id} className="card-elevated space-y-4 flex flex-col justify-between hover:border-emerald-500 transition">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{s.scheme_name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded uppercase shrink-0">
                      {s.category}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div>
                      <strong className="text-slate-400 uppercase text-[10px] block">Key Benefits:</strong>
                      <p className="text-slate-900 font-bold">{s.benefits}</p>
                    </div>

                    <div>
                      <strong className="text-slate-400 uppercase text-[10px] block">Eligibility Criteria:</strong>
                      <p className="text-slate-700">{s.eligibility_rules}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">{s.portal_name}</span>
                  <a
                    href={s.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2 px-4 text-xs font-bold shadow-sm"
                  >
                    <span>Apply on Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
