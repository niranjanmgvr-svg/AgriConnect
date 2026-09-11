import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Search, AlertCircle, 
  HelpCircle, Lightbulb, ShieldCheck, RefreshCw, Calendar, ArrowRight,
  Package, MessageSquare, CloudRain, CheckCircle2, ArrowUpRight, ArrowDownRight, Sparkles, Lock,
  IndianRupee, Sprout, Handshake, Sun
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, Legend, LineChart, Line 
} from 'recharts';
import axios from 'axios';
import SourceCitation from '../components/SourceCitation';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getCropImage, handleCropImageError } from '../utils/cropImages';

export default function Dashboard({ onSelectLot }) {
  const { lang, t, translateCommodity, translateMandi, translateGrade, formatCurrency, formatQuantity } = useLanguage();
  const { currentUser, viewMode } = useAuth();
  
  const [prices, setPrices] = useState([]);
  const [selectedCommodity, setSelectedCommodity] = useState('Ragi (Finger Millet)');
  const [selectedMandi, setSelectedMandi] = useState('Bengaluru');
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

  const selectedPriceItem = prices.find(
    p => p.commodity === selectedCommodity && p.mandi === selectedMandi
  ) || {
    modal_price: 2450,
    min_price: 2350,
    max_price: 2510,
    arrivals_qtl: 1200,
    state: 'Uttar Pradesh'
  };

  return (
    <div className="space-y-6 text-slate-900 font-sans pb-8">
      
      {/* Top Welcome Sub-Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Welcome, {currentUser?.name || 'Ram Kishor Verma'}! <span className="text-emerald-700 font-bold text-sm sm:text-base">| Optimize Your Farm & Harvest</span>
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-0.5">
            Real-time Agmarknet price discovery, explainable AI forecasting & direct trade portal.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[11px] px-3 py-1 rounded-full uppercase flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            Official Agmarknet Layer
          </span>
        </div>
      </div>

      {/* Main Section Header */}
      <div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Live Market & Crop Insights
        </h3>
      </div>

      {/* FEATURED CLEAN CARD: Ragi - Bengaluru Mandi */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Left Column: Crop Details */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-start gap-4">
              <img
                src={getCropImage(selectedCommodity)}
                onError={handleCropImageError}
                alt={selectedCommodity}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-600 shadow-md shrink-0"
              />
              <div>
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  {translateCommodity(selectedCommodity)} - {translateMandi(selectedMandi)} ({selectedPriceItem.state})
                </h4>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Quality: <strong className="text-slate-800">{translateGrade("Grade A (FAQ Verified)")}</strong>
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{t('seller.current_price')}:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-slate-900">
                  {formatCurrency(selectedPriceItem.modal_price)}
                </span>
                <span className="text-sm font-bold text-slate-600">{t('seller.per_quintal')}</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                As of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}, 11:30 AM
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Area Forecast Chart */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5 text-xs font-black text-emerald-800">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>{selectedCommodity} Price Forecast (7-14 Days)</span>
              </div>

              {/* Advisory Pill */}
              <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 shadow-sm">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>{lang === 'en' ? 'SELL NOW (High Demand)' : 'अभी बेचें (SELL NOW)'}</span>
              </div>
            </div>

            {/* Recharts Area Chart with Gradient */}
            {forecastData && (
              <div className="h-52 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={forecastData.forecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.45}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.02}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#64748b' }} stroke="#cbd5e1" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '16px', color: '#fff', fontSize: '12px' }}
                      formatter={(val) => [`₹${val}/qtl`, 'Forecast Rate']}
                    />
                    <Area type="monotone" dataKey="forecast_price" stroke="#10b981" strokeWidth={3} fill="url(#areaGradient)" dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#ffffff' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Bar Inside Card */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700 bg-slate-50/80 p-3.5 rounded-2xl">
          <div>
            <span className="text-slate-400 uppercase text-[10px] block font-extrabold">MANDI DETAILS</span>
            <span>Mandi: <strong className="text-slate-900">{selectedMandi}</strong> (Arrival: {selectedPriceItem.arrivals_qtl}q)</span>
          </div>

          <div className="sm:text-center">
            <span className="text-slate-400 uppercase text-[10px] block font-extrabold">HIGHEST BID</span>
            <strong className="text-emerald-800 text-sm">Highest Bid: ₹{selectedPriceItem.max_price.toLocaleString()}</strong>
          </div>

          <div className="sm:text-right">
            <span className="text-slate-400 uppercase text-[10px] block font-extrabold">BENCHMARK MIN PRICE</span>
            <strong className="text-slate-800 text-sm">Min Price: ₹{selectedPriceItem.min_price.toLocaleString()}</strong>
          </div>
        </div>

      </div>

      {/* 4 CLEAN WHITE QUICK ACTION CARDS GRID (Matches Screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Mandi Rates */}
        <div 
          onClick={() => {
            const el = document.getElementById('mandi-search-section');
            el && el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group active:scale-98"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl group-hover:scale-105 transition shadow-sm">
            <IndianRupee className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg">Mandi Rates</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">View Live Prices & Trends</p>
          </div>
        </div>

        {/* Card 2: Sell Crops */}
        <div 
          onClick={() => onSelectLot && onSelectLot('new')}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group active:scale-98"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-black text-xl group-hover:scale-105 transition shadow-sm">
            <Sprout className="w-6 h-6 text-amber-700" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg">Sell Crops</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">List Harvest for Active Buyers</p>
          </div>
        </div>

        {/* Card 3: Buyer Bids */}
        <div 
          onClick={() => window.location.hash = '#transactions'}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group active:scale-98"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-black text-xl group-hover:scale-105 transition shadow-sm">
            <Handshake className="w-6 h-6 text-emerald-700" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg">Buyer Bids</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">14 New Bids Received</p>
          </div>
        </div>

        {/* Card 4: IMD Weather Alerts */}
        <div 
          onClick={() => window.location.hash = '#weather'}
          className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-md transition cursor-pointer space-y-3 group active:scale-98"
        >
          <div className="w-12 h-12 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xl group-hover:scale-105 transition shadow-sm">
            <Sun className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h4 className="font-black text-slate-900 text-lg">IMD Weather Alerts</h4>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">7-Day Forecast & Advisory - Clear, 22°C-31°C</p>
          </div>
        </div>

      </div>

      {/* DETAILED MANDI SEARCH & FULL MARKET FEED SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4" id="mandi-search-section">
        
        {/* Left Column: Search & Commodity Cards Feed */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card-elevated space-y-3">
            <h4 className="font-black text-lg text-slate-900 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-700" />
              {t('price_dashboard_title')}
            </h4>

            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('search_commodity_placeholder')}
                className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-2xl p-3 pl-11 text-sm font-bold focus:outline-none min-h-[48px] shadow-sm transition"
              />
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <p className="text-xs text-slate-500 font-semibold">
              Select commodity to inspect live Agmarknet benchmark rates
            </p>
          </div>

          {/* Commodity Feed List */}
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
                  className={`card-elevated cursor-pointer p-4 transition duration-150 rounded-2xl min-h-[48px] ${
                    isSelected 
                      ? 'border-2 border-emerald-600 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500/20' 
                      : 'hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={getCropImage(p.commodity)}
                        onError={handleCropImageError}
                        alt={p.commodity}
                        className="w-12 h-12 rounded-xl object-cover border border-emerald-600/30 shadow-sm shrink-0"
                      />
                      <div>
                        <h5 className="font-black text-slate-900 text-base">{translateCommodity(p.commodity)}</h5>
                        <p className="text-xs text-slate-500 font-bold">{translateMandi(p.mandi)}, {p.district} ({p.state})</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-black text-emerald-800">{formatCurrency(p.modal_price)}/qtl</span>
                      <p className="text-[10px] text-slate-400 font-medium">{t('metrics.arrivals_qtl')}: {p.arrivals_qtl} qtl</p>
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

        {/* Right Column: Detailed Advisory Rationale & Full Technical Forecast */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Advisory Decision Box */}
          {advisory && (
            <div className={`rounded-3xl p-6 border-4 shadow-xl space-y-4 transition ${
              advisory.recommendation === 'SELL_NOW'
                ? 'bg-emerald-900 text-white border-emerald-600'
                : 'bg-amber-950 text-white border-amber-500'
            }`}>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="bg-amber-400 text-slate-950 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow">
                    {advisory.recommendation === 'SELL_NOW' 
                      ? (lang === 'en' ? 'SELL NOW' : 'अभी बेचें (SELL NOW)') 
                      : (lang === 'en' ? 'HOLD 3 DAYS' : 'रोकें (HOLD 3 DAYS)')}
                  </span>
                  <span className="text-xs text-slate-300 font-bold">
                    {viewMode === 'kisan' ? 'Kisan Advisory' : 'Rule-Based Logic'}
                  </span>
                </div>
                <div className="text-xs text-slate-300 font-bold">
                  Selected: <strong>{selectedCommodity}</strong> ({selectedMandi} Mandi)
                </div>
              </div>

              <div>
                <h4 className="text-2xl sm:text-3xl font-black text-white">{advisory.headline}</h4>
                <p className="text-sm text-slate-200 mt-1 font-semibold">{advisory.arrival_trend_note}</p>
              </div>

              {/* Rationale Box */}
              <div className="bg-white/10 rounded-2xl p-4 space-y-2 text-sm font-medium backdrop-blur-md border border-white/20">
                <h5 className="font-extrabold text-amber-300 uppercase tracking-wide text-xs flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Kisan Advisory Rationale:
                </h5>
                {advisory.reasoning_steps.map((step, idx) => (
                  <p key={idx} className="text-slate-100 font-bold leading-relaxed">
                    • {step}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Source Citation Footer */}
          <SourceCitation />

        </div>

      </div>

    </div>
  );
}
