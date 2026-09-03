import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Search, AlertCircle, 
  HelpCircle, Lightbulb, ShieldCheck, RefreshCw, Calendar, ArrowRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, LineChart, Line 
} from 'recharts';
import axios from 'axios';
import SourceCitation from '../components/SourceCitation';
import { useLanguage } from '../context/LanguageContext';

export default function Dashboard({ onSelectLot }) {
  const { t } = useLanguage();
  const [prices, setPrices] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState('Wheat');
  const [selectedMandi, setSelectedMandi] = useState('Kanpur');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [historyData, setHistoryData] = useState([]);
  const [forecastData, setForecastData] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPriceSummary();
  }, []);

  useEffect(() => {
    fetchCommodityDetails(selectedCommodity, selectedMandi);
  }, [selectedCommodity, selectedMandi]);

  const fetchPriceSummary = async () => {
    try {
      const res = await axios.get('/api/prices/summary');
      setPrices(res.data);
    } catch (err) {
      console.error("Error fetching price summary:", err);
    }
  };

  const fetchCommodityDetails = async (commodity, mandi) => {
    setLoading(true);
    try {
      const [histRes, fcRes, advRes] = await Promise.all([
        axios.get(`/api/prices/history?commodity=${commodity}&mandi=${mandi}&days=30`),
        axios.get(`/api/prices/forecast?commodity=${commodity}&mandi=${mandi}&forecast_days=14`),
        axios.get(`/api/advisory/recommendation?commodity=${commodity}&mandi=${mandi}`)
      ]);
      setHistoryData(histRes.data?.history || []);
      setForecastData(fcRes.data);
      setAdvisory(advRes.data);
    } catch (err) {
      console.error("Error fetching details:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrices = prices.filter(p => 
    p.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mandi.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Banner Citation */}
      <SourceCitation />

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Mandi Price Search & Live Feed */}
        <div className="space-y-4">
          <div className="card-elevated space-y-3">
            <h2 className="font-extrabold text-lg flex items-center gap-2 text-slate-900">
              <Search className="w-5 h-5 text-emerald-700" />
              {t('price_dashboard_title')}
            </h2>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_commodity_placeholder')}
                className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-xl p-3 pl-10 text-sm font-semibold focus:outline-none"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Showing official daily modal prices across Indian mandis
            </p>
          </div>

          {/* Commodity Cards List */}
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredPrices.slice(0, 15).map((p) => {
              const isSelected = p.commodity === selectedCommodity && p.mandi === selectedMandi;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedCommodity(p.commodity);
                    setSelectedMandi(p.mandi);
                  }}
                  className={`card-elevated cursor-pointer p-4 transition duration-150 ${
                    isSelected 
                      ? 'border-2 border-emerald-600 bg-emerald-50/50 shadow-md ring-2 ring-emerald-500/20' 
                      : 'hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{p.commodity}</h3>
                      <p className="text-xs text-slate-500 font-bold">{p.mandi} Mandi, {p.district} ({p.state})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-800">₹{p.modal_price.toLocaleString()}/qtl</span>
                      <p className="text-[10px] text-slate-400 font-medium">Arrivals: {p.arrivals_qtl} qtl</p>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                    <span>Min: ₹{p.min_price} | Max: ₹{p.max_price}</span>
                    <span className="text-emerald-700 font-bold hover:underline flex items-center gap-0.5">
                      Analyze →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle & Right Columns: Advisory & Time-Series Forecast */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Feature 3: Sell-Now vs Hold Explainable Advisory Box */}
          {advisory && (
            <div className={`rounded-2xl p-6 border-2 shadow-lg space-y-4 transition ${
              advisory.recommendation === 'SELL_NOW'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : advisory.recommendation === 'HOLD'
                ? 'bg-amber-950 text-white border-amber-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    advisory.recommendation === 'SELL_NOW'
                      ? 'bg-amber-400 text-emerald-950'
                      : advisory.recommendation === 'HOLD'
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-blue-400 text-slate-950'
                  }`}>
                    {advisory.recommendation.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">
                    Explainable Rule-Based Logic (No Black-Box Score)
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Target: <strong>{selectedCommodity}</strong> ({selectedMandi} Mandi)
                </div>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-black">{advisory.headline}</h3>
                <p className="text-sm text-slate-200 mt-1">{advisory.arrival_trend_note}</p>
              </div>

              {/* Plain-Language Reasoning Steps */}
              <div className="bg-white/10 rounded-xl p-4 space-y-2 text-xs sm:text-sm font-medium backdrop-blur-sm border border-white/10">
                <h4 className="font-bold text-amber-300 uppercase tracking-wide text-xs flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  {t('explainable_reasoning')}:
                </h4>
                {advisory.reasoning_steps.map((step, idx) => (
                  <p key={idx} className="text-slate-100 leading-relaxed font-sans">
                    {step}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-2 border-t border-white/20">
                <span>Today's Modal Price: <strong>₹{advisory.current_price}/qtl</strong></span>
                <span>30-Day Moving Average: <strong>₹{advisory.avg_30d_price}/qtl</strong></span>
              </div>
            </div>
          )}

          {/* Feature 10: AI Price Forecast Engine Chart & 7-14 Day Confidence Band */}
          {forecastData && (
            <div className="card-elevated space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-700" />
                    AI 7-14 Day Price Forecast & Confidence Band
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Trained on Agmarknet daily price/arrival series for {selectedCommodity} ({selectedMandi})
                  </p>
                </div>

                <div className="bg-emerald-50 text-emerald-900 border border-emerald-200 px-3 py-1.5 rounded-xl text-right">
                  <span className="text-xs text-slate-500 font-bold block">7-Day Projected Move</span>
                  <span className={`text-base font-black ${forecastData.forecast_7d_change_pct >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {forecastData.forecast_7d_change_pct >= 0 ? '▲ +' : '▼ '}{forecastData.forecast_7d_change_pct}%
                  </span>
                </div>
              </div>

              {/* Interactive Forecast Chart */}
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData.forecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#64748b" />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} stroke="#64748b" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                      formatter={(val, name) => [`₹${val}/qtl`, name === 'forecast_price' ? 'Forecast Price' : name === 'upper_bound' ? 'Upper Confidence (85%)' : 'Lower Confidence (85%)']}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="upper_bound" stroke="#34d399" fill="url(#forecastBand)" name="Upper Confidence Band" />
                    <Area type="monotone" dataKey="lower_bound" stroke="#94a3b8" fill="#f1f5f9" name="Lower Confidence Band" />
                    <Line type="monotone" dataKey="forecast_price" stroke="#047857" strokeWidth={3} dot={{ r: 4 }} name="AI Modal Forecast" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Plain-Language Seasonal Insight Sentence */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-xs uppercase tracking-wide text-amber-900">
                    Seasonal Agmarknet Insight:
                  </h4>
                  <p className="text-xs sm:text-sm text-amber-950 font-medium leading-relaxed">
                    "{forecastData.seasonal_insight}"
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
