import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Filter, ShieldCheck, Clock, CheckCircle2, 
  MapPin, Tag, ArrowUpRight, DollarSign, Award, Building2, Send, ChevronRight, Users, MessageSquare 
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BuyerDirectory from './BuyerDirectory';
import { getCropImage, handleCropImageError } from '../utils/cropImages';

export default function BuyerPortalPage({ onSelectLot }) {
  const { lang, t, translateCommodity, translateMandi, translateGrade, formatCurrency, formatQuantity } = useLanguage();
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('sourcing'); // 'sourcing' | 'my_bids' | 'directory'
  const [lots, setLots] = useState([]);
  const [myOffers, setMyOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');
  const [selectedMandi, setSelectedMandi] = useState('all');
  const [selectedGrade, setSelectedGrade] = useState('all');
  const [maxPrice, setMaxPrice] = useState('');

  // Bid Modal State
  const [selectedLotForBid, setSelectedLotForBid] = useState(null);
  const [bidPrice, setBidPrice] = useState('');
  const [bidQty, setBidQty] = useState('');
  const [bidNotes, setBidNotes] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidSuccessMsg, setBidSuccessMsg] = useState('');

  useEffect(() => {
    fetchMarketplaceLots();
  }, []);

  const fetchMarketplaceLots = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/lots/');
      setLots(res.data || []);

      // Fetch sample active offers for buyer
      const txRes = await axios.get('/api/transactions/');
      setMyOffers(txRes.data || []);
    } catch (err) {
      console.error("Buyer portal error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenBidModal = (lot) => {
    setSelectedLotForBid(lot);
    setBidPrice(lot.expected_price_per_qtl || 3500);
    setBidQty(lot.quantity_qtl || 50);
    setBidNotes("Ready for instant Agmarknet price match and immediate payment upon delivery inspection.");
    setBidSuccessMsg('');
  };

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    if (!selectedLotForBid) return;
    setSubmittingBid(true);
    setBidSuccessMsg('');

    try {
      await axios.post('/api/negotiation/offer', {
        lot_id: selectedLotForBid.id,
        buyer_id: currentUser?.id || 5,
        offered_price_per_qtl: parseFloat(bidPrice),
        offered_quantity_qtl: parseFloat(bidQty),
        notes: bidNotes
      });

      setBidSuccessMsg(`Binding bid of ₹${parseFloat(bidPrice).toLocaleString()}/qtl successfully submitted to ${selectedLotForBid.farmer_name || 'Farmer'}!`);
      setTimeout(() => {
        setSelectedLotForBid(null);
        fetchMarketplaceLots();
      }, 1500);
    } catch (err) {
      console.error("Bid submission error:", err);
    } finally {
      setSubmittingBid(false);
    }
  };

  // Filter Logic
  const filteredLots = lots.filter(lot => {
    const matchesSearch = (lot.commodity || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lot.location_mandi || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (lot.location_district || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCrop = selectedCrop === 'all' || (lot.commodity || '').toLowerCase().includes(selectedCrop.toLowerCase());
    const matchesMandi = selectedMandi === 'all' || (lot.location_mandi || '').toLowerCase().includes(selectedMandi.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || (lot.grade_ai || '').toLowerCase().includes(selectedGrade.toLowerCase());
    const matchesPrice = !maxPrice || lot.expected_price_per_qtl <= parseFloat(maxPrice);
    return matchesSearch && matchesCrop && matchesMandi && matchesGrade && matchesPrice;
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Top Banner & Sourcing Portal Header */}
      <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-6 rounded-3xl border border-emerald-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              <ShoppingBag className="w-8 h-8 text-amber-400" />
              {t('buyer.portal_title')}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-200 font-medium">
              {t('buyer.portal_desc')}
            </p>
          </div>

          {/* Quick Buyer Stats */}
          <div className="flex items-center gap-3 bg-emerald-900/60 p-3 rounded-2xl border border-emerald-700/60 shrink-0">
            <div className="text-center px-3 border-r border-emerald-700/60">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">{t('buyer.gst_approved')}</span>
              <strong className="text-xs font-black text-amber-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> {t('buyer.gst_approved')}
              </strong>
            </div>
            <div className="text-center px-3 border-r border-emerald-700/60">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">Mandi Lots</span>
              <strong className="text-sm font-black text-white">{filteredLots.length} Active</strong>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-emerald-300 font-bold uppercase block">{t('buyer.trust_rating')}</span>
              <strong className="text-sm font-black text-amber-300">⭐ 4.9 / 5.0</strong>
            </div>
          </div>
        </div>

        {/* View Mode Navigation Tabs */}
        <div className="flex items-center gap-2 pt-2 border-t border-emerald-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sourcing')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'sourcing'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Produce Sourcing Marketplace ({filteredLots.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my_bids')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'my_bids'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>My Submitted Bids & Deals ({myOffers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-emerald-900/80 text-emerald-200 hover:bg-emerald-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Verified Buyer Directory</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Sourcing Marketplace */}
      {activeTab === 'sourcing' && (
        <div className="space-y-6">
          
          {/* Search & Sourcing Filter Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="relative w-full md:w-96">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search produce by crop, mandi, or district..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-emerald-600"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              </div>

              <div className="flex items-center gap-2 flex-wrap w-full md:w-auto">
                {/* Crop Filter */}
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">🌾 All Commodities</option>
                  <option value="ragi">Ragi (Finger Millet)</option>
                  <option value="tomato">Tomato (Kolar Red)</option>
                  <option value="paddy">Paddy (Sona Masoori)</option>
                  <option value="cotton">Cotton (Davanagere)</option>
                  <option value="arecanut">Arecanut (Shivamogga)</option>
                </select>

                {/* Mandi Filter */}
                <select
                  value={selectedMandi}
                  onChange={(e) => setSelectedMandi(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">🏛️ All APMC Mandis</option>
                  <option value="bengaluru">Bengaluru APMC</option>
                  <option value="kolar">Kolar APMC</option>
                  <option value="raichur">Raichur APMC</option>
                  <option value="shivamogga">Shivamogga APMC</option>
                </select>

                {/* Grade Filter */}
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="all">⭐ All AI Quality Grades</option>
                  <option value="grade a">Grade A (Premium FAQ)</option>
                  <option value="grade b">Grade B (Standard)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Available Produce Grid */}
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-bold">Loading Mandi Sourcing Marketplace...</div>
          ) : filteredLots.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <Search className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-lg font-black text-slate-800">No Produce Lots Found</h4>
              <p className="text-xs text-slate-500 font-medium">Try broadening your crop or mandi search filters above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLots.map((lot) => (
                <div key={lot.id} className="card-elevated flex flex-col justify-between space-y-4 hover:border-emerald-500 transition">
                  <div className="space-y-3">
                    {/* Header Image & Grade */}
                    <div className="relative h-44 rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={lot.images_json && JSON.parse(lot.images_json)[0] && !JSON.parse(lot.images_json)[0].includes('1574323347407') ? JSON.parse(lot.images_json)[0] : getCropImage(lot.commodity)}
                        onError={handleCropImageError}
                        alt={lot.commodity}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-emerald-950/90 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider border border-amber-300/40">
                        {translateGrade(lot.grade_ai || 'Grade A (Indicative AI)')}
                      </span>
                      <span className="absolute bottom-3 right-3 bg-slate-900/90 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                        Lot #{lot.id}
                      </span>
                    </div>

                    {/* Crop Info */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg flex items-center justify-between">
                        <span>{translateCommodity(lot.commodity)}</span>
                        <span className="text-emerald-800 font-black">{formatCurrency(lot.expected_price_per_qtl)}/qtl</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">{lot.variety || 'GPU-28 Premium Grade'}</p>
                    </div>

                    {/* Produce Details Pills */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">AVAILABLE QTY:</span>
                        <strong className="text-slate-900 font-extrabold">{lot.quantity_qtl} Quintals</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">MANDI LOCATION:</span>
                        <span className="text-slate-700 font-semibold">{lot.location_mandi || 'Bengaluru APMC'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-bold">FARMER SELLER:</span>
                        <span className="text-emerald-800 font-bold">{lot.farmer_name || 'Basavaraj Gowda'} (⭐ 4.9)</span>
                      </div>
                    </div>
                  </div>

                  {/* Place Bid Action Button */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenBidModal(lot)}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow transition cursor-pointer active:scale-95"
                    >
                      <DollarSign className="w-4 h-4 text-amber-300" />
                      <span>Place Binding Bid</span>
                    </button>

                    <button
                      onClick={() => onSelectLot && onSelectLot(lot.id)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-xl text-xs font-bold transition"
                      title="Inspect Quality Specs"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Submitted Bids & Deals Tracker */}
      {activeTab === 'my_bids' && (
        <div className="card-elevated space-y-4">
          <h3 className="font-extrabold text-lg text-slate-900 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-emerald-700" />
              Active Procurement Bids & Negotiations ({myOffers.length})
            </span>
          </h3>

          {myOffers.length === 0 ? (
            <div className="p-8 text-center text-slate-400 font-medium">No active bids submitted yet. Browse the Sourcing Marketplace to place bids.</div>
          ) : (
            <div className="space-y-3">
              {myOffers.map((offer) => (
                <div key={offer.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-3">
                    <img
                      src={getCropImage(offer.lot_commodity || 'Ragi (Finger Millet)')}
                      onError={handleCropImageError}
                      alt={offer.lot_commodity || 'Produce'}
                      className="w-12 h-12 rounded-xl object-cover border border-emerald-600/30 shadow-sm shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-emerald-800 text-white font-black px-2 py-0.5 rounded text-[10px]">
                          Transaction #{offer.id}
                        </span>
                        <strong className="text-slate-900 text-sm font-black">{translateCommodity(offer.lot_commodity || 'Ragi (Finger Millet)')}</strong>
                      </div>
                      <p className="text-slate-600">
                        Offered Price: <strong className="text-emerald-800">{formatCurrency(offer.agreed_price_per_qtl)}/qtl</strong> for {offer.quantity_qtl} Qtl
                      </p>
                      <p className="text-slate-400 text-[11px]">
                        Seller: {offer.farmer_name || 'Basavaraj Gowda'} | UPI Ref: <span className="font-mono text-slate-700">{offer.upi_reference || 'PENDING'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-black uppercase ${
                      offer.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-900 border border-amber-300'
                    }`}>
                      {offer.status?.toUpperCase() || 'ACCEPTED BY FARMER'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Buyer Directory */}
      {activeTab === 'directory' && (
        <BuyerDirectory />
      )}

      {/* BINDING BID SUBMISSION MODAL */}
      {selectedLotForBid && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-emerald-200 space-y-5 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <img
                  src={getCropImage(selectedLotForBid.commodity)}
                  onError={handleCropImageError}
                  alt={selectedLotForBid.commodity}
                  className="w-12 h-12 rounded-xl object-cover border border-emerald-600/40 shadow-sm shrink-0"
                />
                <div>
                  <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-700" />
                    {t('buyer.bid_modal_title')}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Direct procurement bid for Lot #{selectedLotForBid.id} ({translateCommodity(selectedLotForBid.commodity)})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedLotForBid(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            {bidSuccessMsg ? (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p>{bidSuccessMsg}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitOffer} className="space-y-4">
                
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Farmer Expected Price:</span>
                    <span className="text-slate-900">₹{selectedLotForBid.expected_price_per_qtl?.toLocaleString()}/qtl</span>
                  </div>
                  <div className="flex justify-between text-slate-500 font-bold">
                    <span>Agmarknet Mandi Benchmark:</span>
                    <span className="text-emerald-700 font-extrabold">₹3,450/qtl (Bengaluru)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Your Offer Price per Quintal (₹)
                  </label>
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-xl p-3 text-sm font-bold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Purchase Quantity (Quintals)
                  </label>
                  <input
                    type="number"
                    value={bidQty}
                    onChange={(e) => setBidQty(e.target.value)}
                    className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-xl p-3 text-sm font-bold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 mb-1">
                    Delivery Terms & Notes
                  </label>
                  <textarea
                    value={bidNotes}
                    onChange={(e) => setBidNotes(e.target.value)}
                    rows={2}
                    className="w-full border-2 border-slate-300 focus:border-emerald-600 rounded-xl p-3 text-xs font-bold focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedLotForBid(null)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingBid}
                    className="flex-1 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow"
                  >
                    <Send className="w-4 h-4" />
                    <span>{submittingBid ? 'Submitting Bid...' : 'Confirm & Submit Bid'}</span>
                  </button>
                </div>

              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
