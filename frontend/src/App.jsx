import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import VoiceAssistantModal from './components/VoiceAssistantModal';
import SMSModal from './components/SMSModal';

// Pages
import Dashboard from './pages/Dashboard';
import LotsPage from './pages/LotsPage';
import LotDetailPage from './pages/LotDetailPage';
import BuyerDirectory from './pages/BuyerDirectory';
import TransactionsPage from './pages/TransactionsPage';
import LedgerAuditPage from './pages/LedgerAuditPage';
import WeatherAlertsPage from './pages/WeatherAlertsPage';
import SchemesPage from './pages/SchemesPage';
import AdminDashboard from './pages/AdminDashboard';
import FpoMonitoring from './pages/FpoMonitoring';

function AppContent() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedLotId, setSelectedLotId] = useState(null);
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [showSMSModal, setShowSMSModal] = useState(false);

  const handleSelectLot = (id) => {
    setSelectedLotId(id);
    setActiveTab('lot_detail');
  };

  const handleNavigateToTx = () => {
    setActiveTab('transactions');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 font-sans text-slate-900 selection:bg-amber-400 selection:text-emerald-950">
      
      {/* Top Header & Navbar */}
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
        {activeTab === 'buyers' && <BuyerDirectory />}
        {activeTab === 'transactions' && <TransactionsPage />}
        {activeTab === 'ledger' && <LedgerAuditPage />}
        {activeTab === 'weather' && <WeatherAlertsPage />}
        {activeTab === 'schemes' && <SchemesPage />}
        {activeTab === 'monitoring' && <FpoMonitoring />}
        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals */}
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
