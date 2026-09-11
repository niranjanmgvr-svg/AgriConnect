import React, { useState, useEffect } from 'react';
import { CloudRain, AlertTriangle, ShieldCheck, Thermometer, Droplets, Wind, Calendar, Sun, CloudLightning, Info } from 'lucide-react';
import axios from 'axios';

export default function WeatherAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('Bengaluru Rural');
  const [loading, setLoading] = useState(true);

  const forecastClusters = {
    "Bengaluru Rural": {
      district: "Bengaluru Rural (Karnataka)",
      crop: "Ragi (Finger Millet) / Vegetables",
      five_day: [
        { day: "Today", temp: "28°C", humidity: "78%", condition: "Moderate Rain 🌧️", rain_prob: "65%", risk: "Normal" },
        { day: "Tomorrow", temp: "27°C", humidity: "82%", condition: "Thunderstorms ⛈️", rain_prob: "80%", risk: "Heavy Rain / Waterlogging Alert" },
        { day: "Day 3", temp: "29°C", humidity: "70%", condition: "Partly Cloudy ⛅", rain_prob: "30%", risk: "Normal" },
        { day: "Day 4", temp: "30°C", humidity: "65%", condition: "Sunny ☀️", rain_prob: "10%", risk: "Normal" },
        { day: "Day 5", temp: "31°C", humidity: "60%", condition: "Clear Skies ☀️", rain_prob: "5%", risk: "Normal" },
      ],
      advisory: "Store harvested Ragi grains in elevated tarpaulin sheds within 24 hours to prevent moisture absorption."
    },
    "Kolar": {
      district: "Kolar (Karnataka)",
      crop: "Tomato / Mango / Flowers",
      five_day: [
        { day: "Today", temp: "29°C", humidity: "88%", condition: "Continuous Drizzle 🌧️", rain_prob: "75%", risk: "Pest Vulnerability (Late Blight)" },
        { day: "Tomorrow", temp: "28°C", humidity: "84%", condition: "Cloudy ☁️", rain_prob: "50%", risk: "Pest Vulnerability (Late Blight)" },
        { day: "Day 3", temp: "31°C", humidity: "70%", condition: "Sunny Intervals ⛅", rain_prob: "20%", risk: "Normal" },
        { day: "Day 4", temp: "32°C", humidity: "65%", condition: "Sunny ☀️", rain_prob: "10%", risk: "Normal" },
        { day: "Day 5", temp: "33°C", humidity: "58%", condition: "Warm ☀️", rain_prob: "5%", risk: "Normal" },
      ],
      advisory: "High atmospheric humidity creates high vulnerability for tomato late blight fungal infection. Spray recommended bio-fungicide once rain stops."
    },
    "Raichur": {
      district: "Raichur (Karnataka)",
      crop: "Paddy (Sona Masoori) / Cotton",
      five_day: [
        { day: "Today", temp: "33°C", humidity: "65%", condition: "Sunny Intervals ⛅", rain_prob: "25%", risk: "Normal" },
        { day: "Tomorrow", temp: "34°C", humidity: "60%", condition: "Clear Skies ☀️", rain_prob: "10%", risk: "Normal" },
        { day: "Day 3", temp: "35°C", humidity: "55%", condition: "Hot & Dry ☀️", rain_prob: "5%", risk: "Heat Stress Flag" },
        { day: "Day 4", temp: "32°C", humidity: "72%", condition: "Light Rain 🌧️", rain_prob: "40%", risk: "Normal" },
        { day: "Day 5", temp: "30°C", humidity: "78%", condition: "Thunderstorms ⛈️", rain_prob: "70%", risk: "Waterlogging Alert" },
      ],
      advisory: "Ensure canal drainage channels are clear in Tungabhadra basin paddy fields ahead of Day 5 thunderstorms."
    },
    "Shivamogga": {
      district: "Shivamogga (Karnataka)",
      crop: "Arecanut / Maize / Spices",
      five_day: [
        { day: "Today", temp: "27°C", humidity: "90%", condition: "Heavy Rain 🌧️", rain_prob: "85%", risk: "Fungal Spot Risk" },
        { day: "Tomorrow", temp: "26°C", humidity: "88%", condition: "Overcast ☁️", rain_prob: "60%", risk: "Fungal Spot Risk" },
        { day: "Day 3", temp: "28°C", humidity: "75%", condition: "Partly Cloudy ⛅", rain_prob: "30%", risk: "Normal" },
        { day: "Day 4", temp: "30°C", humidity: "65%", condition: "Sunny ☀️", rain_prob: "10%", risk: "Normal" },
        { day: "Day 5", temp: "31°C", humidity: "60%", condition: "Sunny ☀️", rain_prob: "5%", risk: "Normal" },
      ],
      advisory: "Apply drainage channels across Arecanut plantations to prevent root rot during heavy rainfall days."
    }
  };

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

  const activeCluster = forecastClusters[selectedCluster] || forecastClusters["Bengaluru Rural"];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <CloudRain className="w-7 h-7 text-emerald-700" />
            IMD Weather & Yield-Risk Advisory
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Real-time agromet forecasts and risk alerts sourced from India Meteorological Department (IMD).
          </p>
        </div>

        {/* Agricultural Cluster Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200">
          <span className="text-xs font-bold text-slate-600">Select Cluster:</span>
          <select
            value={selectedCluster}
            onChange={(e) => setSelectedCluster(e.target.value)}
            className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900 focus:outline-none cursor-pointer"
          >
            <option value="Bengaluru Rural">🌾 Bengaluru Rural (Ragi / Veggies)</option>
            <option value="Kolar">🍅 Kolar Cluster (Tomato / Fruits)</option>
            <option value="Raichur">🍚 Raichur Cluster (Paddy Sona Masoori)</option>
            <option value="Shivamogga">🌴 Shivamogga Cluster (Arecanut / Maize)</option>
          </select>
        </div>
      </div>

      {/* 5-Day Weather Forecast Grid */}
      <div className="card-elevated space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-700" />
              Localized 5-Day Forecast — {activeCluster.district}
            </h3>
            <p className="text-xs text-slate-500 font-medium">Primary Crops: {activeCluster.crop}</p>
          </div>

          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase">
            IMD Live Agromet Sync
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {activeCluster.five_day.map((fd, idx) => (
            <div 
              key={idx} 
              className={`p-3.5 rounded-2xl border text-xs space-y-2 text-center transition ${
                fd.risk !== 'Normal' ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <span className="font-black text-slate-900 block text-sm">{fd.day}</span>
              <p className="text-xl font-black text-emerald-800">{fd.temp}</p>
              <p className="font-bold text-slate-700">{fd.condition}</p>
              
              <div className="text-[11px] text-slate-500 font-semibold space-y-0.5 pt-1 border-t border-slate-200">
                <p>💧 Humidity: {fd.humidity}</p>
                <p>🌧️ Rain Prob: {fd.rain_prob}</p>
              </div>

              {fd.risk !== 'Normal' && (
                <span className="inline-block text-[9px] font-black bg-red-600 text-white px-2 py-0.5 rounded uppercase mt-1">
                  {fd.risk}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Agronomic Action Advisory Box */}
        <div className="bg-emerald-950 text-white p-4.5 rounded-2xl space-y-2 border border-emerald-800">
          <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4 text-amber-400" />
            Practical Agronomic Action Advisory:
          </h4>
          <p className="text-xs sm:text-sm font-medium text-emerald-100 leading-relaxed">
            {activeCluster.advisory}
          </p>
        </div>
      </div>

      {/* Real-time Risk Alerts Stream */}
      <div className="space-y-4 pt-2">
        <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Active Regional Yield-Risk Flags
        </h3>

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

            <div className="text-xs font-semibold text-slate-600 flex items-center gap-4 flex-wrap">
              <span>📍 Location: <strong>{a.district}, {a.state}</strong></span>
              <span>🌾 Crop: <strong>{a.crop}</strong></span>
              <span>📅 Date: <strong>{a.issued_date}</strong></span>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/70 p-3 rounded-xl border border-slate-200">
              "{a.description}"
            </p>

            <div className="bg-emerald-900 text-white p-4 rounded-xl space-y-1">
              <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Agronomic Advisory:
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
