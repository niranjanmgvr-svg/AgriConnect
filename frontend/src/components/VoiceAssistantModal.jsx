import React, { useState } from 'react';
import { Mic, Volume2, X, Sparkles, Send, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

export default function VoiceAssistantModal({ isOpen, onClose, onSelectAction }) {
  const [queryText, setQueryText] = useState("आज कानपुर मंडी में गेहूं का क्या भाव है?");
  const [isListening, setIsListening] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null);

  if (!isOpen) return null;

  const handleSimulateListen = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
    }, 2000);
  };

  const speakText = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'hi-IN';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendQuery = async () => {
    if (!queryText.trim()) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/voice/query', {
        transcription: queryText,
        language: 'hi'
      });
      setResponse(res.data);
      if (res.data?.spoken_response) {
        speakText(res.data.spoken_response);
      }
    } catch (err) {
      console.error("Voice Query Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-emerald-200 overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-emerald-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2.5 rounded-2xl text-emerald-950 shadow">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg flex items-center gap-2 flex-wrap">
                Bhashini Voice AI Assistant
                <span className="bg-amber-400 text-emerald-950 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                  Simulated for Demo
                </span>
              </h3>
              <p className="text-xs text-emerald-200">
                Ask Mandi prices or create digital lots by speaking in Hindi/Regional language
              </p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 rounded-full hover:bg-emerald-700 text-emerald-200 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Preset Voice Prompts */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 block">
              Sample Voice Queries (Tap to speak):
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setQueryText("आज कानपुर मंडी में गेहूं का क्या भाव है?")}
                className="text-left p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold text-xs sm:text-sm flex items-center justify-between"
              >
                <span>🗣️ "आज कानपुर मंडी में गेहूं का क्या भाव है?"</span>
                <span className="text-[10px] bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">Price Query</span>
              </button>

              <button
                onClick={() => setQueryText("50 क्विंटल प्याज बेचना है")}
                className="text-left p-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-950 font-semibold text-xs sm:text-sm flex items-center justify-between"
              >
                <span>🗣️ "50 क्विंटल प्याज बेचना है"</span>
                <span className="text-[10px] bg-amber-600 text-white font-bold px-2 py-0.5 rounded">Sell Lot</span>
              </button>
            </div>
          </div>

          {/* Voice Input Controls */}
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                rows={2}
                placeholder="Type or speak query in Hindi or English..."
                className="w-full border-2 border-emerald-300 focus:border-emerald-600 rounded-2xl p-3 text-sm font-semibold focus:outline-none pr-12"
              />
              <button
                onClick={handleSimulateListen}
                className={`absolute right-3 top-3 p-2 rounded-xl transition ${
                  isListening ? 'bg-red-500 text-white animate-ping' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
                title="Simulate Microphone Speech"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleSendQuery}
              disabled={loading}
              className="w-full btn-primary py-3.5 text-sm font-bold shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span>Process Voice Command (Rule-Based Simulation)</span>
            </button>
          </div>

          {/* Response Output Box */}
          {response && (
            <div className="bg-slate-900 text-white rounded-2xl p-5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wide">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Intent: {response.intent} ({response.detected_language})
                </div>
                <button
                  onClick={() => speakText(response.spoken_response)}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white p-1.5 rounded-lg flex items-center gap-1 text-xs"
                >
                  <Volume2 className="w-4 h-4" />
                  Listen Audio
                </button>
              </div>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-emerald-300 font-medium text-sm">
                "{response.spoken_response}"
              </div>

              {response.data && (
                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div><span className="text-slate-400">Commodity:</span> <strong className="text-white">{response.data.commodity}</strong></div>
                  <div><span className="text-slate-400">Mandi:</span> <strong className="text-white">{response.data.mandi}</strong></div>
                  <div><span className="text-slate-400">Modal Price:</span> <strong className="text-emerald-400 font-extrabold text-sm">₹{response.data.modal_price}/qtl</strong></div>
                  <div><span className="text-slate-400">Date:</span> <strong className="text-white">{response.data.date}</strong></div>
                </div>
              )}

              {response.draft_lot && (
                <div className="bg-amber-950/60 p-3 rounded-xl border border-amber-700/60 text-xs space-y-2">
                  <p className="text-amber-200 font-bold">Draft Lot Auto-Filled from Voice:</p>
                  <p className="text-white">{response.draft_lot.quantity_qtl} Quintals of {response.draft_lot.commodity} @ ₹{response.draft_lot.expected_price_per_qtl}/qtl</p>
                  <button
                    onClick={() => {
                      onClose();
                      onSelectAction && onSelectAction('lots');
                    }}
                    className="w-full bg-amber-500 hover:bg-amber-400 text-emerald-950 font-bold py-2 rounded-lg text-xs transition"
                  >
                    Go to Digital Lots to Publish Listing →
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
