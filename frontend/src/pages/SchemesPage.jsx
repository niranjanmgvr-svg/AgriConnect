import React, { useState, useEffect } from 'react';
import { FileText, ExternalLink, CheckCircle2, Award, Landmark, Filter, Check } from 'lucide-react';
import axios from 'axios';

export default function SchemesPage() {
  const [crop, setCrop] = useState('Wheat');
  const [state, setState] = useState('Uttar Pradesh');
  const [landCategory, setLandCategory] = useState('Marginal (2 - 5 Acres)');
  const [landAcres, setLandAcres] = useState(2.5);
  
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchemes();
  }, [crop, state, landAcres, landCategory]);

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
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-emerald-700" />
            Government Scheme & Credit Recommender
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Official government scheme eligibility matching engine integrated with <strong>myScheme.gov.in</strong>.
          </p>
        </div>

        <span className="bg-amber-400 text-slate-950 font-black text-xs px-3 py-1.5 rounded-full uppercase tracking-wider self-start md:self-auto shadow">
          myScheme.gov.in Verified
        </span>
      </div>

      {/* Requirement 7: Eligibility Filter Controls */}
      <div className="card-elevated bg-slate-900 text-white space-y-4">
        <h3 className="font-extrabold text-sm text-amber-400 flex items-center gap-2 uppercase tracking-wider">
          <Filter className="w-4 h-4" />
          Filter Farmer Eligibility Profile:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Cultivated Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
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
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Punjab">Punjab</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 block mb-1">Landholding Category</label>
            <select
              value={landCategory}
              onChange={(e) => {
                setLandCategory(e.target.value);
                if (e.target.value.includes('Small')) setLandAcres(1.0);
                else if (e.target.value.includes('Marginal')) setLandAcres(3.0);
                else setLandAcres(7.0);
              }}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-400"
            >
              <option value="Small (< 2 Acres)">Small Farmer (&lt; 2 Acres)</option>
              <option value="Marginal (2 - 5 Acres)">Marginal Farmer (2 - 5 Acres)</option>
              <option value="Large (> 5 Acres)">Large Farmer (&gt; 5 Acres)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Matched Schemes List (Requirement 7: PM-KISAN, PMFBY, KCC, AIF) */}
      {recommendations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span>Displaying <strong>{recommendations.total_matched_schemes}</strong> Eligible Schemes for {crop} ({state})</span>
            <span>Ref: {recommendations.source_portal}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.schemes.map((s) => (
              <div key={s.id} className="card-elevated space-y-4 flex flex-col justify-between hover:border-emerald-500 transition group">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">{s.scheme_name}</h3>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded uppercase shrink-0">
                      {s.category}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2.5 text-xs">
                    <div>
                      <strong className="text-slate-400 uppercase text-[10px] block font-extrabold">Subsidy Amount / Benefit:</strong>
                      <p className="text-emerald-800 font-black text-sm">{s.benefits}</p>
                    </div>

                    <div>
                      <strong className="text-slate-400 uppercase text-[10px] block font-extrabold">Exact Eligibility Rationale:</strong>
                      <p className="text-slate-700 font-medium leading-relaxed">{s.eligibility_rules}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                    {s.portal_name}
                  </span>
                  <a
                    href={s.official_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary py-2 px-4 text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Apply on myScheme.gov.in</span>
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
