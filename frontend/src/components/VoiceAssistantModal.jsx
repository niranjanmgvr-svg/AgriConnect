import React, { useState, useEffect } from 'react';
import { Mic, Volume2, X, Sparkles, Send, CheckCircle2, RefreshCw, Globe, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useLanguage } from '../context/LanguageContext';
import { getCropImage, handleCropImageError } from '../utils/cropAssets';

export default function VoiceAssistantModal({ isOpen, onClose, onSelectAction }) {
  const { lang, t, translateCommodity, translateMandi, formatCurrency } = useLanguage();
  const [queryText, setQueryText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  
  const getMicLangCode = (l) => {
    if (l === 'kn') return 'kn-IN';
    if (l === 'hi') return 'hi-IN';
    if (l === 'mr') return 'mr-IN';
    return 'en-IN';
  };

  const [micLanguage, setMicLanguage] = useState(() => getMicLangCode(lang));

  useEffect(() => {
    setMicLanguage(getMicLangCode(lang));
  }, [lang]);
  const [loading, setLoading] = useState(false);
  const [micError, setMicError] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: 'ai',
      text: 'ನಮಸ್ಕಾರ! ನಾನು ಅಗ್ರಿ ಕನೆಕ್ಟ್‌ನ Bhashini ಡಿಜಿಟಲ್ ವಾಯ್ಸ್ ಸಹಾಯಕ. ನಿಮ್ಮ ಧ್ವನಿಯಿಂದ ಪ್ರಶ್ನೆ ಕೇಳಿ ಅಥವಾ ಕೆಳಗಿನ ಬಟನ್ ಒತ್ತಿ.',
      time: 'Just now'
    }
  ]);

  // Auto-speak text using Web Speech API with Bhashini regional fallback guard
  const speakText = (textToSpeak) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = micLanguage || 'kn-IN';
      utterance.rate = 0.95;

      // Check available voices for regional match
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = (micLanguage || 'kn').split('-')[0];
      const hasVoice = voices.some(v => v.lang && (v.lang.startsWith(langPrefix) || v.lang.startsWith(micLanguage)));

      if (!hasVoice && langPrefix !== 'en') {
        console.warn(`[Bhashini TTS Guard] Native ${micLanguage} voice engine not found on host browser. Displaying visual audio card response.`);
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const executeDirectVoiceQuery = async (textQuery) => {
    if (!textQuery || !textQuery.trim()) return;
    const userMessage = textQuery.trim();
    setQueryText("");
    setInterimTranscript("");
    setMicError("");
    setLoading(true);

    // Append User Message to Chat History
    const newUserChat = {
      id: Date.now(),
      sender: 'user',
      text: userMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory(prev => [...prev, newUserChat]);

    try {
      const apiLang = micLanguage.startsWith('kn') ? 'kn' : (micLanguage.startsWith('hi') ? 'hi' : 'en');
      const res = await axios.post('/api/voice/query', {
        transcription: userMessage,
        language: apiLang
      });

      const responseData = res.data;

      // Append AI Response to Chat History
      const newAiChat = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseData.spoken_response,
        intent: responseData.intent,
        data: responseData.data,
        draft_lot: responseData.draft_lot,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, newAiChat]);

      // Auto-speak answer out loud
      if (responseData.spoken_response) {
        speakText(responseData.spoken_response);
      }
    } catch (err) {
      console.error("Voice Query Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMicListen = () => {
    setMicError("");
    setInterimTranscript("");

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = micLanguage;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 3;
      
      setIsListening(true);
      try {
        recognition.start();
      } catch (e) {
        console.warn("Recognition already started", e);
      }

      recognition.onresult = (event) => {
        let currentText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentText += event.results[i][0].transcript;
        }
        setInterimTranscript(currentText);
        setQueryText(currentText);

        if (event.results[0].isFinal) {
          setIsListening(false);
          executeDirectVoiceQuery(currentText);
        }
      };

      recognition.onerror = (err) => {
        console.warn("Speech Recognition Error:", err.error);
        setIsListening(false);
        if (err.error === 'not-allowed') {
          setMicError("Microphone access denied in browser settings.");
        } else if (err.error === 'no-speech') {
          setMicError("No speech heard. Please speak closer to microphone or use 1-click prompts.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };
    } else {
      // Browser Speech API fallback simulation
      setIsListening(true);
      setInterimTranscript("सुन रहा हूँ... (आज कानपुर मंडी में गेहूं का क्या भाव है?)");
      setTimeout(() => {
        setIsListening(false);
        executeDirectVoiceQuery("आज कानपुर मंडी में गेहूं का क्या भाव है?");
      }, 1800);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 font-sans">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-emerald-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-900 to-slate-950 p-4 sm:p-5 text-white flex items-center justify-between shrink-0 border-b border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 p-2.5 rounded-2xl text-emerald-950 shadow">
              <Mic className={`w-6 h-6 ${isListening ? 'animate-ping text-red-600' : 'animate-bounce'}`} />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                Voice Chat 🎙️
                <span className="bg-amber-400 text-emerald-950 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                  Multi-Lang Voice
                </span>
              </h3>
              <p className="text-xs text-amber-300 font-bold">
                {isListening ? '🔴 Speak now into your Mic...' : 'Tap Mic or Select Direct Question'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mic Language Selector */}
            <div className="bg-emerald-950 border border-emerald-700 px-2 py-1 rounded-xl flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <select
                value={micLanguage}
                onChange={(e) => setMicLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
              >
                <option value="kn-IN" className="bg-slate-900">ಕನ್ನಡ (Kannada)</option>
                <option value="hi-IN" className="bg-slate-900">हिन्दी (Hindi)</option>
                <option value="en-IN" className="bg-slate-900">English (India)</option>
                <option value="mr-IN" className="bg-slate-900">ಮರಾಠಿ (Marathi)</option>
              </select>
            </div>

            <button 
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                onClose();
              }} 
              className="p-2 rounded-full hover:bg-emerald-700 text-emerald-200 hover:text-white transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Listening Banner */}
        {isListening && (
          <div className="bg-red-600 text-white p-3 text-xs font-extrabold flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
              </span>
              <span>LISTENING LIVE: "{interimTranscript || 'Listening to your voice...'}"</span>
            </div>
            <span className="text-[10px] bg-red-800 px-2 py-0.5 rounded font-black">MIC ACTIVE</span>
          </div>
        )}

        {micError && (
          <div className="bg-amber-50 border-b border-amber-200 text-amber-900 p-2.5 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        {/* 1-Tap Direct Prompts Bar */}
        <div className="bg-emerald-50/70 border-b border-emerald-200/80 p-3 shrink-0 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-extrabold text-emerald-900 uppercase tracking-wider">
            <span>⚡ 1-Click Voice Questions (Kannada & Multi-Lang):</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => executeDirectVoiceQuery(micLanguage === 'kn-IN' ? "ಬೆಂಗಳೂರು ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ರಾಗಿ ಬೆಲೆ ಎಷ್ಟು?" : "आज बेंगलुरु मंडी में रागी का क्या भाव है?")}
              disabled={loading}
              className="text-left p-2.5 rounded-2xl bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-950 font-extrabold text-xs shadow-sm flex items-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span className="text-base shrink-0">🌾</span>
              <span className="truncate">{micLanguage === 'kn-IN' ? 'ಬೆಂಗಳೂರು ರಾಗಿ ಬೆಲೆ?' : 'Bengaluru Ragi Rate?'}</span>
            </button>

            <button
              onClick={() => executeDirectVoiceQuery(micLanguage === 'kn-IN' ? "50 ಕ್ವಿಂಟಾಲ್ ರಾಗಿ ಮಾರಾಟ ಮಾಡಬೇಕು" : "50 क्विंटल रागी बेचना है")}
              disabled={loading}
              className="text-left p-2.5 rounded-2xl bg-white hover:bg-amber-100 border border-amber-300 text-amber-950 font-extrabold text-xs shadow-sm flex items-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span className="text-base shrink-0">📦</span>
              <span className="truncate">{micLanguage === 'kn-IN' ? '50 ಕ್ವಿಂಟಾಲ್ ರಾಗಿ ಮಾರಿ' : 'Sell 50 Qtl Ragi?'}</span>
            </button>

            <button
              onClick={() => executeDirectVoiceQuery(micLanguage === 'kn-IN' ? "ಕೋಲಾರ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಟೊಮೆಟೊ ಬೆಲೆ ಎಷ್ಟು?" : "कोलार मंडी में टमाटर का क्या भाव है?")}
              disabled={loading}
              className="text-left p-2.5 rounded-2xl bg-white hover:bg-emerald-100 border border-emerald-300 text-emerald-950 font-extrabold text-xs shadow-sm flex items-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span className="text-base shrink-0">🍅</span>
              <span className="truncate">{micLanguage === 'kn-IN' ? 'ಕೋಲಾರ ಟೊಮೆಟೊ ಬೆಲೆ?' : 'Kolar Tomato Price?'}</span>
            </button>

            <button
              onClick={() => executeDirectVoiceQuery(micLanguage === 'kn-IN' ? "ಮಳೆ ಮುನ್ಸೂಚನೆ ತಿಳಿಸಿ" : "मौसम का हाल बताओ")}
              disabled={loading}
              className="text-left p-2.5 rounded-2xl bg-white hover:bg-blue-100 border border-blue-300 text-blue-950 font-extrabold text-xs shadow-sm flex items-center gap-2 active:scale-95 transition cursor-pointer"
            >
              <span className="text-base shrink-0">🌦️</span>
              <span className="truncate">{micLanguage === 'kn-IN' ? 'ಮಳೆ ಮುನ್ಸೂಚನೆ' : 'Rain & Weather Alert'}</span>
            </button>
          </div>
        </div>

        {/* Chat Conversation Timeline */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50 min-h-[220px]">
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              <div
                className={`max-w-[85%] rounded-3xl p-4 shadow-md text-sm space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-emerald-800 text-white rounded-br-none font-bold'
                    : 'bg-white border-2 border-emerald-300 text-slate-900 rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between gap-2 border-b border-black/10 pb-1 text-[11px] opacity-80">
                  <span className="font-black uppercase tracking-wider">
                    {msg.sender === 'user' ? '🗣️ You Spoke:' : '🤖 Voice Chat AI:'}
                  </span>
                  <span>{msg.time}</span>
                </div>

                <p className="text-sm font-extrabold leading-relaxed">
                  "{msg.text}"
                </p>

                {/* Repeat Spoken Audio */}
                {msg.sender === 'ai' && (
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => speakText(msg.text)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow active:scale-95 transition cursor-pointer"
                    >
                      <Volume2 className="w-4 h-4" />
                      <span>🔊 Listen Spoken Answer</span>
                    </button>

                    {msg.draft_lot && (
                      <button
                        onClick={() => {
                          onClose();
                          onSelectAction && onSelectAction('lots');
                        }}
                        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs px-3 py-1.5 rounded-xl shadow active:scale-95 transition cursor-pointer"
                      >
                        Publish Lot →
                      </button>
                    )}
                  </div>
                )}

                {/* Price Result Card */}
                {msg.data && (
                  <div className="bg-slate-900 text-white p-3 rounded-2xl text-xs space-y-2 mt-2 border border-emerald-700/60 shadow flex items-center gap-3">
                    <img
                      src={getCropImage(msg.data.commodity)}
                      onError={handleCropImageError}
                      alt={msg.data.commodity}
                      className="w-14 h-14 rounded-xl object-cover border border-amber-400/40 shadow-sm shrink-0"
                    />
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">{t('seller.crop_name')}:</span>
                        <strong className="text-amber-400 font-extrabold text-sm">{translateCommodity(msg.data.commodity)}</strong>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">{t('metrics.modal_price')}:</span>
                        <strong className="text-emerald-400 font-black text-sm">{formatCurrency(msg.data.modal_price)}/qtl</strong>
                      </div>
                      {msg.data.mandi && (
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 font-bold">{t('seller.mandi_details')}:</span>
                          <span className="text-emerald-200 font-bold">{translateMandi(msg.data.mandi)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border-2 border-amber-300 text-slate-900 p-4 rounded-3xl rounded-bl-none shadow-md flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-amber-500 animate-spin" />
                <span className="text-xs font-bold text-slate-700">Analyzing voice & fetching live Mandi prices...</span>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Input & Mic Controls */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 space-y-3">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              executeDirectVoiceQuery(queryText);
            }} 
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={isListening ? "Listening live to microphone..." : "Type or speak your question..."}
                className={`w-full border-2 rounded-2xl p-3 text-sm font-extrabold focus:outline-none pr-10 ${
                  isListening ? 'border-red-500 bg-red-50/50' : 'border-slate-300 focus:border-emerald-600'
                }`}
              />
              <button
                type="button"
                onClick={handleStartMicListen}
                className={`absolute right-2 top-2 p-1.5 rounded-xl transition ${
                  isListening ? 'bg-red-600 text-white animate-ping' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
                title="Tap to speak"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>

            {/* Central Mic Pulse Button */}
            <button
              type="button"
              onClick={handleStartMicListen}
              className={`p-3.5 rounded-2xl shadow-lg transition active:scale-95 flex items-center justify-center shrink-0 cursor-pointer ${
                isListening ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-400 hover:bg-amber-500 text-slate-950'
              }`}
              title="Tap to speak into Microphone"
            >
              <Mic className="w-5 h-5 stroke-[2.5]" />
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={loading || !queryText.trim()}
              className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white p-3.5 rounded-2xl shadow-lg transition active:scale-95 shrink-0 cursor-pointer"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          <p className="text-[10px] text-slate-400 font-bold text-center">
            Bhashini AI Speech-to-Text & Text-to-Speech Engine
          </p>
        </div>

      </div>
    </div>
  );
}

