# AgriConnect 🌾 — Digital Price Intelligence & Direct Trade Platform

> **Smart India Hackathon (SIH) — Problem Statement 26132**
> *"Strengthening market linkages and price discovery for farmers"* (Government of Maharashtra)

AgriConnect is a neutral digital layer built on top of India's public **Agmarknet (data.gov.in)** and **e-NAM** price data. It empowers farmers and Farmer Producer Organizations (FPOs) by providing transparent mandi prices, explainable sell vs. hold advisory, direct connections with verified buyers, AI-driven price forecasting, voice/SMS regional language interaction, and an immutable append-only transaction ledger.

---

## 📌 Problem Statement Summary
Indian farmers face asymmetric information regarding real-time mandi prices, leading to distress sales, weak bargaining power, and exploitation by intermediaries. AgriConnect solves this by synthesizing public Agmarknet/e-NAM price datasets into actionable sell/hold advisories, matching farmers directly with GST/PAN-verified buyers, and locking transactions into a tamper-proof cryptographic ledger.

---

## ✨ Key Features

### 🟢 Core Platform (MVP Loop)
- **Phone Number OTP Login & Verified Role Management**: OTP authentication flow via SMS (Demo OTP code `123456`), with quick-switch role personas (Farmer, Verified Buyer, Admin) for judge live demos.
- **Agmarknet Mandi Price Dashboard**: Interactive search and price trends across top Indian commodities (Wheat, Paddy, Potato, Onion, Tomato, Chana, Mustard, Soyabean, Cotton, Maize) and mandis, with visible government data citations (`data.gov.in` / `agmarknet.gov.in`).
- **Explainable Sell-Now vs. Hold Advisory**: Step-by-step rule-based engine comparing current prices to 7-day and 30-day moving averages and arrival volume trends. Explains *why* a recommendation is given.
- **Digital Lot Creation with Image Upload**: Farmers can list produce with variety, quantity (quintals), expected price, location, and produce photo upload preview.
- **Verified Buyer Directory**: Directory of buyers displaying business names, GSTIN/PAN status, and ratings, with an Admin moderation approval queue.
- **Offer & Negotiation Flow**: Binding offer submission for buyers, counter-offer proposals for farmers, and complete negotiation history audit.
- **Transaction & Payment Tracker**: 4-stage pipeline (*Listed -> Offered -> Accepted -> Paid/Delivered*), with UPI reference capture (`UPI/329481048201/PAYMENT_DONE`).
- **Immutable Append-Only Transaction Ledger**: SHA-256 hash-chained log table (`current_hash = SHA256(previous_hash + payload)`), featuring an online cryptographic chain auditor and printable Sale Certificates.
- **Multi-Lingual UI**: Native support for **English**, **Hindi (हिन्दी)**, and **Marathi (मराठी)**.

### 🟡 Additional Modules Built (Simulated / Rule-Based for Hackathon Scope)
- **AI Price Forecast Engine**: Statistical time-series model (exponential smoothing & moving average trend) generating a 7-14 day forecast curve with 85% confidence bands *(Simulated Statistical Model)*.
- **AI Buyer-Lot Matcher**: Weighted scoring algorithm (Crop Match 35%, OSM Distance 25%, Quantity Fit 20%, Buyer Rating 20%) ranking top 5 buyers for a lot.
- **Bhashini Voice & Regional AI Assistant**: Voice-to-text, translation, and speech synthesis playback (`hi-IN`) for price lookups and lot creation *(Rule-Based Simulation)*.
- **Offline / SMS Gateway Simulator**: Shortcode `56161` text interface for feature-phone users without internet *(Simulated Shortcode Gateway)*.
- **IMD Weather & Yield-Risk Alerts**: Weather risk warnings (heavy rain, pest infection risk for purple blotch / late blight) with actionable agronomic advisories.
- **Government Scheme Recommender**: Profile matcher surfacing schemes (**PM-KISAN, PMFBY, Kisan Credit Card, SMAM, PM-KUSUM**) linking directly to `myScheme.gov.in`.
- **FPO & Government Monitoring Dashboard**: Macro analytics view for FPOs and NABARD showing trade volume, average realized farmer price vs Agmarknet benchmark, dispute ratios, and spatial heatmaps.
- **MobileNet Crop Quality Grading**: Indicative **Grade A / B / C** classification with visible defect indicators *(Indicative Rule-Based Simulation)*.
- **Fraud & Price-Manipulation Detection**: Automated anomaly detector flagging offers deviating >25% from Agmarknet daily benchmarks *(Simulated Anomaly Engine)*.

> ℹ️ **Notice on Simulated Features**: Modules such as image quality grading, voice assistant intent parsing, SMS shortcode gateway, and fraud detection are implemented as rule-based simulations tailored for hackathon demonstration.

---

## 🛠️ Tech Stack

- **Backend**: Python FastAPI, SQLAlchemy ORM, SQLite (`agriconnect.db`), Pydantic v2, NumPy, Pandas, Uvicorn
- **Frontend**: React (Vite), Tailwind CSS v4, Lucide Icons, Recharts (time-series graphs), Web Speech API
- **Data Source**: Agmarknet / e-NAM Daily Commodity Price Dataset Snapshot (Government of India)

---

## 📁 Repository Structure

```
AgriConnect/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entry point & CORS
│   │   ├── database.py              # SQLite connection & ORM Session
│   │   ├── models.py                # Database ORM models (User, PriceRecord, Lot, Offer, Transaction, LedgerLog, Dispute, WeatherAlert)
│   │   ├── schemas.py               # Pydantic request/response schemas
│   │   ├── seed_data.py             # Agmarknet daily prices & seed script
│   │   └── routers/                 # Modular REST API endpoints
│   │       ├── auth.py              # Phone OTP login & role switcher
│   │       ├── prices.py            # Mandi prices & AI 7-14 day forecast engine
│   │       ├── advisory.py          # Sell vs Hold explainable rule engine
│   │       ├── lots.py              # Digital lots, AI Buyer Matcher & Quality Grading
│   │       ├── buyers.py            # Buyer directory & GST verification
│   │       ├── negotiation.py       # Offer & Counter-offer pipeline
│   │       ├── transactions.py      # Transaction tracker & UPI reference capture
│   │       ├── ledger.py            # Append-only SHA-256 hash-chained ledger & certificates
│   │       ├── grievances.py        # Grievance flag & dispute queue
│   │       ├── weather.py           # IMD weather risk alerts
│   │       ├── schemes.py           # myScheme.gov.in recommender
│   │       ├── monitoring.py        # FPO & Govt macro analytics
│   │       ├── voice.py             # Bhashini voice AI assistant
│   │       ├── fraud.py             # Price anomaly & fraud detector
│   │       └── sms.py               # SMS fallback simulator (56161)
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx                  # Main React container
│       ├── i18n/
│       │   └── translations.js      # English, Hindi (हिन्दी) & Marathi (मराठी) dictionaries
│       ├── context/
│       │   ├── AuthContext.jsx      # OTP login & multi-role switcher context
│       │   └── LanguageContext.jsx  # Multi-lingual context provider
│       ├── components/              # Navbar, Footer, LoginModal, VoiceAssistantModal, SMSModal, SourceCitation
│       └── pages/                   # Dashboard, LotsPage, LotDetailPage, BuyerDirectory, TransactionsPage, LedgerAuditPage, WeatherAlertsPage, SchemesPage, AdminDashboard, FpoMonitoring
└── README.md
```

---

## 🚀 Quick Setup & Run Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 1. Backend Server Setup (FastAPI)
```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- The backend will automatically create SQLite database `agriconnect.db` and populate initial Agmarknet price datasets.
- Interactive API documentation available at: **http://127.0.0.1:8000/docs**

### 2. Frontend Server Setup (React + Vite)
```bash
cd frontend
npm install
npm run dev -- --host 127.0.0.1 --port 3000
```
- Access the web interface at: **http://127.0.0.1:3000**

---

## 🔑 Demo Instructions for Judges

1. **OTP Login Flow**:
   - Click **"OTP Login"** in the top navbar bar.
   - Enter any 10-digit mobile number (e.g. `9876543210`).
   - Use the prefilled demo OTP code **`123456`** and click **Verify OTP**.

2. **Fast Role Switcher**:
   - During live demos, use the **"Quick Switch"** dropdown in the top bar to toggle between:
     - 👨‍🌾 **Farmer / FPO** (`Ramesh Kumar`)
     - 🏭 **Verified Buyer** (`Rajesh Agro Traders`)
     - 🛡️ **Admin Moderator** (`Agmarknet Admin`)

3. **End-to-End Core Loop**:
   - Check Mandi Prices & Read Explainable Advisory on the **Price Dashboard**.
   - Create a **Digital Lot** with a produce photo.
   - View top 5 **AI Matched Buyers**.
   - Switch to Buyer role -> Submit a **Binding Offer**.
   - Switch to Farmer role -> **Accept Offer**.
   - Enter **UPI Ref No.** & download the cryptographic **Sale Certificate**.
   - Audit the SHA-256 hash integrity in the **Hash Ledger** tab.
