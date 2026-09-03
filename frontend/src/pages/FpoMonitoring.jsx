import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, DollarSign, Package, AlertTriangle, ShieldCheck, MapPin, Building2 } from 'lucide-react';
import axios from 'axios';

export default function FpoMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  const fetchMonitoringData = async () => {
    try {
      const res = await axios.get('/api/monitoring/macro-analytics');
      setData(res.data);
    } catch (err) {
      console.error("Monitoring data error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading FPO Macro Analytics...</div>;
  }

  const { kpis } = data;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-emerald-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-amber-400" />
            <div>
              <h2 className="text-2xl font-black">FPO & Government Macro Monitoring Dashboard</h2>
              <p className="text-xs text-slate-300 font-medium">
                {data.monitoring_agency} | Scope: <strong>{data.scope}</strong>
              </p>
            </div>
          </div>

          <span className="bg-amber-400 text-emerald-950 font-black px-3 py-1 rounded-full text-xs uppercase tracking-wider">
            NABARD & State Board Analytics View
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-elevated space-y-1">
          <span className="text-slate-400 font-bold text-xs uppercase">Total Farmers / FPO Members</span>
          <strong className="text-2xl font-black text-slate-900 block">{kpis.total_registered_farmers} Registered</strong>
          <span className="text-xs text-emerald-700 font-semibold">Across 4 States</span>
        </div>

        <div className="card-elevated space-y-1">
          <span className="text-slate-400 font-bold text-xs uppercase">Total Digital Trade Value</span>
          <strong className="text-2xl font-black text-emerald-800 block">₹{kpis.total_realized_trade_value_inr.toLocaleString()}</strong>
          <span className="text-xs text-slate-500 font-semibold">{kpis.total_trade_volume_qtl} Quintals Traded</span>
        </div>

        <div className="card-elevated space-y-1 bg-emerald-50 border-emerald-200">
          <span className="text-emerald-900 font-bold text-xs uppercase">Avg Farmer Realized Price</span>
          <strong className="text-2xl font-black text-emerald-900 block">₹{kpis.avg_realized_farmer_price}/qtl</strong>
          <span className="text-xs text-emerald-700 font-bold">
            ▲ {kpis.farmer_price_uplift_pct}% Uplift vs Agmarknet Benchmark (₹{kpis.agmarknet_benchmark_price})
          </span>
        </div>

        <div className="card-elevated space-y-1">
          <span className="text-slate-400 font-bold text-xs uppercase">Grievance & Dispute Ratio</span>
          <strong className="text-2xl font-black text-slate-900 block">{kpis.dispute_count} Disputes</strong>
          <span className="text-xs text-slate-500 font-semibold">{kpis.dispute_ratio_pct}% Dispute Rate</span>
        </div>
      </div>

      {/* Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Commodity Volume Distribution */}
        <div className="card-elevated space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <Package className="w-5 h-5 text-emerald-700" />
            Commodity Trade Distribution & Realization
          </h3>

          <div className="space-y-3">
            {data.commodity_breakdown.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs font-semibold">
                <div className="flex items-center justify-between">
                  <span className="text-slate-900 font-extrabold text-sm">{item.commodity}</span>
                  <span className="text-emerald-800 font-black">₹{item.avg_price}/qtl</span>
                </div>

                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full" 
                    style={{ width: `${item.share_pct}%` }} 
                  />
                </div>

                <div className="flex items-center justify-between text-slate-500 text-[11px] pt-1">
                  <span>Volume: {item.volume_qtl} qtl</span>
                  <span>Share: {item.share_pct}% of total trade</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* District Performance Heatmap */}
        <div className="card-elevated space-y-4">
          <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-700" />
            District-Level Price Realization Uplift
          </h3>

          <div className="space-y-3">
            {data.district_performance.map((d, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <strong className="text-slate-900 font-extrabold text-sm block">{d.district}</strong>
                  <span className="text-slate-500">{d.state} ({d.active_lots} Active Lots)</span>
                </div>

                <div className="text-right">
                  <span className="bg-emerald-100 text-emerald-900 font-black px-2.5 py-1 rounded-lg text-xs block">
                    {d.realization_uplift} Uplift
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">vs Local Agmarknet</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
