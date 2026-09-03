import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Sparkles, MapPin, CheckCircle, Clock, 
  MessageSquare, UserCheck, AlertTriangle, ShieldCheck, DollarSign, Send, ArrowRight
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function LotDetailPage({ lotId, onBack, onNavigateToTx }) {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  
  const [lot, setLot] = useState(null);
  const [offers, setOffers] = useState([]);
  const [matchedBuyers, setMatchedBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Offer submission form
  const [offerPrice, setOfferPrice] = useState('');
  const [offerQty, setOfferQty] = useState('');
  const [offerNotes, setOfferNotes] = useState('');

  // Counter offer form
  const [counterPrice, setCounterPrice] = useState('');
  const [selectedOfferId, setSelectedOfferId] = useState(null);

  // Grievance modal
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState('Quality Mismatch');
  const [disputeDetails, setDisputeDetails] = useState('');

  useEffect(() => {
    if (lotId) {
      fetchLotDetails();
    }
  }, [lotId]);

  const fetchLotDetails = async () => {
    setLoading(true);
    try {
      const [lotRes, offersRes, buyersRes] = await Promise.all([
        axios.get(`/api/lots/${lotId}`),
        axios.get(`/api/offers/lot/${lotId}`),
        axios.get(`/api/lots/${lotId}/matched-buyers`)
      ]);
      setLot(lotRes.data);
      setOffers(offersRes.data);
      setMatchedBuyers(buyersRes.data);
      setOfferPrice(lotRes.data.expected_price_per_qtl);
      setOfferQty(lotRes.data.quantity_qtl);
    } catch (err) {
      console.error("Error loading lot details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/offers', {
        lot_id: lot.id,
        buyer_id: currentUser.id,
        offered_price_per_qtl: parseFloat(offerPrice),
        quantity_qtl: parseFloat(offerQty),
        notes: offerNotes
      });
      fetchLotDetails();
    } catch (err) {
      console.error("Offer Error:", err);
    }
  };

  const handleCounterOffer = async (offerId) => {
    if (!counterPrice) return;
    try {
      await axios.post(`/api/offers/${offerId}/counter`, {
        counter_price_per_qtl: parseFloat(counterPrice),
        counter_notes: "Farmer counter-offer submitted"
      });
      fetchLotDetails();
    } catch (err) {
      console.error("Counter Error:", err);
    }
  };

  const handleAcceptOffer = async (offerId) => {
    try {
      const res = await axios.post(`/api/offers/${offerId}/accept`);
      if (res.data?.success) {
        onNavigateToTx && onNavigateToTx();
      }
    } catch (err) {
      console.error("Accept Error:", err);
    }
  };

  const handleFlagDispute = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/grievances/flag', {
        transaction_id: lot.id,
        raised_by_user_id: currentUser.id,
        reason: disputeReason,
        details: disputeDetails
      });
      setShowGrievanceModal(false);
      alert("Grievance submitted to Admin Moderation Queue.");
    } catch (err) {
      console.error("Flag Error:", err);
    }
  };

  if (loading || !lot) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading Lot Details...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Top Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-outline py-2 px-4 text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>

        <button
          onClick={() => setShowGrievanceModal(true)}
          className="bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
        >
          <AlertTriangle className="w-4 h-4 text-red-600" />
          <span>Flag Grievance / Dispute</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Lot Overview Card */}
        <div className="space-y-6">
          <div className="card-elevated space-y-4">
            <div className="h-52 -mx-5 -mt-5 bg-slate-100 relative overflow-hidden">
              <img 
                src={lot.images?.[0] || "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop"} 
                alt={lot.commodity}
                className="w-full h-full object-cover" 
              />
              <span className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-amber-400 text-xs font-black px-3 py-1 rounded-xl">
                {lot.grade_ai}
              </span>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">{lot.commodity}</h2>
                <span className="text-xl font-black text-emerald-800">₹{lot.expected_price_per_qtl}/qtl</span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-1">
                Variety: {lot.variety || 'Standard Local'}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">QUANTITY:</span>
                <strong className="text-slate-900 font-extrabold text-sm">{lot.quantity_qtl} Quintals</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">TOTAL ESTIMATED VALUE:</span>
                <strong className="text-emerald-800 font-extrabold text-sm">₹{(lot.quantity_qtl * lot.expected_price_per_qtl).toLocaleString()}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-bold">LOCATION:</span>
                <span className="font-semibold text-slate-700">{lot.location_mandi}, {lot.location_district}</span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-400 uppercase">Quality Description:</h4>
              <p className="text-xs text-slate-700 leading-relaxed font-medium bg-slate-50 p-3 rounded-xl border border-slate-100">
                "{lot.quality_description}"
              </p>
            </div>
          </div>

          {/* Feature 11: Top 5 AI Matched Buyers */}
          <div className="card-elevated space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Top 5 AI Matched Buyers for Lot #{lot.id}
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              Ranked using weighted crop match (35%), quantity fit (20%), buyer rating (20%), and OSM distance (25%).
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {matchedBuyers.map((mb) => (
                <div key={mb.buyer_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-900 font-bold">{mb.business_name}</strong>
                    <span className="bg-amber-400 text-emerald-950 font-black px-2 py-0.5 rounded text-[10px]">
                      {mb.match_score}% Match
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>📍 {mb.distance_km} km away</span>
                    <span>⭐ {mb.rating}/5.0 Rating</span>
                  </div>

                  <div className="text-[10px] text-slate-600 space-y-0.5">
                    {mb.match_reasons.slice(0, 2).map((r, i) => (
                      <p key={i}>• {r}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Negotiation Timeline & Offer Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Buyer Offer Submission Form */}
          {currentUser.role === 'buyer' && (
            <div className="card-elevated space-y-4 bg-emerald-50/50 border-emerald-200">
              <h3 className="font-extrabold text-base text-emerald-900 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-700" />
                Submit Binding Offer / Counter-Proposal
              </h3>

              <form onSubmit={handleCreateOffer} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Offered Price (₹/qtl)</label>
                  <input
                    type="number"
                    value={offerPrice}
                    onChange={(e) => setOfferPrice(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Quantity (qtl)</label>
                  <input
                    type="number"
                    value={offerQty}
                    onChange={(e) => setOfferQty(e.target.value)}
                    className="w-full border-2 border-slate-300 rounded-xl p-2.5 text-sm font-bold focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Terms / Payment Notes</label>
                  <input
                    type="text"
                    value={offerNotes}
                    onChange={(e) => setOfferNotes(e.target.value)}
                    placeholder="e.g. Farm pickup within 3 days with instant UPI payment"
                    className="w-full border-2 border-slate-300 rounded-xl p-2.5 text-xs focus:border-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3 pt-2">
                  <button type="submit" className="btn-primary w-full py-3 text-sm font-bold">
                    Submit Formal Offer to Farmer
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Feature 6: Negotiation & Offer Timeline */}
          <div className="card-elevated space-y-4">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              Offer & Negotiation History Timeline
            </h3>

            {offers.length === 0 ? (
              <div className="text-center py-8 text-slate-400 font-medium text-sm">
                No offers submitted for this lot yet.
              </div>
            ) : (
              <div className="space-y-4">
                {offers.map((off) => (
                  <div 
                    key={off.id}
                    className={`p-4 rounded-2xl border-2 space-y-3 transition ${
                      off.status === 'accepted'
                        ? 'bg-emerald-50 border-emerald-500'
                        : off.status === 'countered'
                        ? 'bg-amber-50 border-amber-400'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <strong className="text-slate-900 font-extrabold text-base">{off.buyer_business}</strong>
                        <p className="text-xs text-slate-500 font-bold">Buyer: {off.buyer_name}</p>
                      </div>

                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                        off.status === 'accepted' ? 'bg-emerald-700 text-white' : 'bg-amber-400 text-emerald-950'
                      }`}>
                        Status: {off.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50/80 p-3 rounded-xl border border-slate-100 text-xs font-semibold">
                      <div>
                        <span className="text-slate-400 font-bold block">OFFER PRICE:</span>
                        <strong className="text-emerald-800 text-base font-black">₹{off.offered_price_per_qtl}/qtl</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">QUANTITY:</span>
                        <strong className="text-slate-900 text-base font-black">{off.quantity_qtl} qtl</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 font-bold block">TOTAL OFFER:</span>
                        <strong className="text-slate-900 text-base font-black">₹{(off.offered_price_per_qtl * off.quantity_qtl).toLocaleString()}</strong>
                      </div>
                    </div>

                    {/* Counter Offer Output */}
                    {off.counter_price_per_qtl && (
                      <div className="bg-amber-100 border border-amber-300 p-3 rounded-xl text-xs space-y-1">
                        <strong className="text-amber-950 font-bold block">Farmer Counter-Proposal:</strong>
                        <p className="text-amber-900 font-extrabold text-sm">Counter Price: ₹{off.counter_price_per_qtl}/qtl</p>
                        <p className="text-amber-800 italic">"{off.counter_notes}"</p>
                      </div>
                    )}

                    {/* Actions for Farmer/Buyer */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                      {currentUser.role === 'farmer' && off.status !== 'accepted' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedOfferId(off.id);
                              const price = prompt("Enter Farmer Counter Price per Quintal (₹):", off.offered_price_per_qtl);
                              if (price) {
                                setCounterPrice(price);
                                handleCounterOffer(off.id);
                              }
                            }}
                            className="btn-outline py-2 px-3 text-xs"
                          >
                            Counter-Offer
                          </button>

                          <button
                            onClick={() => handleAcceptOffer(off.id)}
                            className="btn-primary py-2 px-4 text-xs font-bold shadow"
                          >
                            Accept Offer & Proceed to Payment
                          </button>
                        </>
                      )}

                      {off.status === 'accepted' && (
                        <button
                          onClick={onNavigateToTx}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 cursor-pointer"
                        >
                          <span>View Transaction Tracker</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Flag Grievance Modal */}
      {showGrievanceModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              {t('dispute_flag')}
            </h3>

            <form onSubmit={handleFlagDispute} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block uppercase text-slate-400 mb-1">Reason for Flagging:</label>
                <select
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full border-2 border-slate-300 rounded-xl p-2.5 focus:outline-none"
                >
                  <option value="Quality Mismatch">Quality Mismatch</option>
                  <option value="Payment Delay">Payment Delay</option>
                  <option value="Non-Delivery">Non-Delivery / Logistics Issue</option>
                  <option value="Price Manipulation">Price Manipulation / Coercion</option>
                </select>
              </div>

              <div>
                <label className="block uppercase text-slate-400 mb-1">Details & Evidence Description:</label>
                <textarea
                  value={disputeDetails}
                  onChange={(e) => setDisputeDetails(e.target.value)}
                  rows={3}
                  placeholder="Describe exact grievance issue for Admin Moderation review..."
                  className="w-full border-2 border-slate-300 rounded-xl p-2.5 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowGrievanceModal(false)} className="btn-outline py-2 px-4 text-xs">
                  Cancel
                </button>
                <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-xl text-xs">
                  Submit Flag to Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
