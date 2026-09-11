import React, { useState } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import SMSModal from './components/SMSModal';

// Pages
import LoginScreen from './pages/LoginScreen';
import Dashboard from './pages/Dashboard';
import LotsPage from './pages/LotsPage';
import LotDetailPage from './pages/LotDetailPage';
import BuyerDirectory from './pages/BuyerDirectory';
import BuyerPortalPage from './pages/BuyerPortalPage';
import TransactionsPage from './pages/TransactionsPage';
import WeatherAlertsPage from './pages/WeatherAlertsPage';
import SchemesPage from './pages/SchemesPage';
import AdminDashboard from './pages/AdminDashboard';
import FpoMonitoring from './pages/FpoMonitoring';

function AppContent() {
  const { isAuthenticated, currentUser } = useAuth();
  const { lang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);

  // Sync active Tab when user role changes
  React.useEffect(() => {
    if (currentUser?.role === 'buyer') {
      setActiveTab('buyers');
    } else if (currentUser?.role === 'admin') {
      setActiveTab('admin');
    } else if (currentUser?.role === 'farmer') {
      setActiveTab('dashboard');
    }
  }, [currentUser?.role]);

  const handleSelectLot = (id) => {
    setSelectedLotId(id);
    setActiveTab('lot_detail');
  };

  const handleNavigateToTx = () => {
    setActiveTab('transactions');
  };

  // Route Guard: Unauthenticated users see standalone LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 selection:bg-amber-400 selection:text-emerald-950">
      
      {/* Two-Tier Top Header & Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setSelectedLotId(null);
        }}
        onOpenVoice={() => setShowVoiceModal(true)}
        onOpenSMS={() => setShowSMSModal(true)}
      />

      {/* Main Page View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && <Dashboard onSelectLot={handleSelectLot} />}
        {activeTab === 'lots' && <LotsPage onSelectLot={handleSelectLot} />}
        {activeTab === 'lot_detail' && (
          <LotDetailPage 
            lotId={selectedLotId || 1} 
            onBack={() => setActiveTab('lots')}
            onNavigateToTx={handleNavigateToTx} 
          />
        )}
        {activeTab === 'buyers' && <BuyerPortalPage onSelectLot={handleSelectLot} />}
        {activeTab === 'transactions' && <TransactionsPage />}
        {activeTab === 'weather' && <WeatherAlertsPage />}
        {activeTab === 'schemes' && <SchemesPage />}
        {activeTab === 'monitoring' && <FpoMonitoring />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Persistent Bhashini Voice FAB (Pinned Bottom-Right) */}
      <button
        onClick={() => setShowVoiceModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white p-3.5 sm:px-5 sm:py-3.5 rounded-full shadow-2xl border-2 border-amber-300 flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 group"
        aria-label="Bol Kar Bhaav Jaanein / Voice Assistant"
      >
        <span className="relative flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-400"></span>
        </span>
        <div className="bg-amber-400 p-2 rounded-full text-emerald-950 group-hover:rotate-12 transition-transform">
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        </div>
        <div className="text-left hidden sm:block pr-1">
          <p className="text-xs font-black text-amber-300 uppercase tracking-wider leading-none">{t('voice_assistant')}</p>
          <p className="text-sm font-bold text-white leading-tight">AI Multi-Lang 🎙️</p>
        </div>
      </button>

      {/* Accessibility Modals */}
      <VoiceAssistantModal 
        isOpen={showVoiceModal} 
        onClose={() => setShowVoiceModal(false)}
        onSelectAction={(tab) => {
          setActiveTab(tab);
          setShowVoiceModal(false);
        }} 
      />

      <SMSModal 
        isOpen={showSMSModal} 
        onClose={() => setShowSMSModal(false)} 
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
