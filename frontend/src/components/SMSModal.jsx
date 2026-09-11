import React, { useState } from 'react';
import { Smartphone, Send, X, ArrowLeft, Check, Sparkles } from 'lucide-react';
import axios from 'axios';

export default function SMSModal({ isOpen, onClose }) {
  const [smsText, setSmsText] = useState("PRICE ONION LASALGAON");
  const [phoneNum, setPhoneNum] = useState("9876543210");
  const [loading, setLoading] = useState(false);
  const [conversation, setConversation] = useState([
    { sender: 'outbound', text: "Welcome to AgriConnect Shortcode SMS Gateway 56161. Send 'PRICE <crop> <mandi>' or 'SELL <crop> <qty>' for offline trade." }
  ]);

  if (!isOpen) return null;

  const handleSendSMS = async () => {
    if (!smsText.trim()) return;
    const userMsg = smsText;
    setConversation(prev => [...prev, { sender: 'inbound', text: userMsg }]);
    setSmsText('');
    setLoading(true);

    try {
      const res = await axios.post('/api/sms/simulate', {
        sender_phone: phoneNum,
        message_text: userMsg
      });
      if (res.data?.outbound_sms_reply) {
        setConversation(prev => [...prev, { sender: 'outbound', text: res.data.outbound_sms_reply }]);
      }
    } catch (err) {
      setConversation(prev => [...prev, { sender: 'outbound', text: "Error connecting to SMS gateway. Try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 text-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-700 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Mock Feature Phone Header */}
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-amber-400 text-slate-950 p-2 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm flex items-center gap-2">
                Offline SMS Gateway: 56161
                <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                  Simulated Gateway
                </span>
              </h3>
              <p className="text-[10px] text-slate-300">Feature Phone Text Portal for Farmers without Internet</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SMS Chat Screen */}
        <div className="p-4 h-80 overflow-y-auto space-y-3 bg-slate-950/90 font-mono text-xs">
          {conversation.map((msg, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${msg.sender === 'inbound' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-3 shadow ${
                  msg.sender === 'inbound'
                    ? 'bg-emerald-600 text-white rounded-br-none font-bold'
                    : 'bg-slate-800 text-amber-300 border border-slate-700 rounded-bl-none font-medium'
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-500 mt-1">
                {msg.sender === 'inbound' ? 'From: Farmer (+91 9876543210)' : 'From: 56161 (AgriConnect Gateway)'}
              </span>
            </div>
          ))}
        </div>

        {/* Preset Quick SMS Commands (Requirement 9) */}
        <div className="p-3 bg-slate-800/80 border-t border-slate-800 space-y-1.5 text-xs">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tap Test Commands:</p>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSmsText("PRICE RAGI BENGALURU")}
              className="bg-slate-700 hover:bg-slate-600 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer"
            >
              PRICE RAGI BENGALURU
            </button>
            <button
              onClick={() => setSmsText("SELL RAGI 50Q")}
              className="bg-slate-700 hover:bg-slate-600 text-amber-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer"
            >
              SELL RAGI 50Q
            </button>
            <button
              onClick={() => setSmsText("PRICE TOMATO KOLAR")}
              className="bg-slate-700 hover:bg-slate-600 text-emerald-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer"
            >
              PRICE TOMATO KOLAR
            </button>
            <button
              onClick={() => setSmsText("HELP")}
              className="bg-slate-700 hover:bg-slate-600 text-slate-300 px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold cursor-pointer"
            >
              HELP
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={smsText}
            onChange={(e) => setSmsText(e.target.value)}
            placeholder="Type SMS command..."
            className="flex-1 bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-amber-400"
          />
          <button
            onClick={handleSendSMS}
            disabled={loading}
            className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-black p-2 rounded-xl transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
