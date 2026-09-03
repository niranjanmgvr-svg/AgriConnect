import React, { useState, useEffect } from 'react';
import { CloudRain, AlertTriangle, ShieldCheck, Thermometer, Droplets, Wind } from 'lucide-react';
import axios from 'axios';

export default function WeatherAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherAlerts();
  }, []);

  const fetchWeatherAlerts = async () => {
    try {
      const res = await axios.get('/api/weather/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error("Error fetching weather alerts:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <CloudRain className="w-7 h-7 text-emerald-700" />
          IMD Crop-Health & Yield-Risk Alerts
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Sourced from India Meteorological Department (IMD) agromet advisory services to protect harvest yield.
        </p>
      </div>

      <div className="space-y-4">
        {alerts.map((a) => (
          <div 
            key={a.id} 
            className={`card-elevated border-2 space-y-3 ${
              a.severity === 'critical' ? 'bg-red-50/50 border-red-300' : 'bg-amber-50/50 border-amber-300'
            }`}
          >
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className={`w-5 h-5 ${a.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`} />
                <h3 className="font-extrabold text-slate-900 text-base">{a.title}</h3>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-black uppercase ${
                a.severity === 'critical' ? 'bg-red-600 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {a.severity} RISK
              </span>
            </div>

            <div className="text-xs font-semibold text-slate-600 flex items-center gap-4">
              <span>📍 Location: <strong>{a.district}, {a.state}</strong></span>
              <span>🌾 Crop: <strong>{a.crop}</strong></span>
              <span>📅 Date: <strong>{a.issued_date}</strong></span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-slate-200">
              "{a.description}"
            </p>

            <div className="bg-emerald-900 text-white p-4 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Agronomic Action Advisory for Farmers:
              </h4>
              <p className="text-xs sm:text-sm font-medium leading-relaxed">
                {a.advisory}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
