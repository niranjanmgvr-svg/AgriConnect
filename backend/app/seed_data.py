from datetime import datetime, timedelta
import random
import json
import hashlib
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models import User, PriceRecord, Lot, Offer, Transaction, LedgerLog, WeatherAlert, Dispute

COMMODITIES_AND_MANDIS = [
    {"commodity": "Ragi (Finger Millet)", "state": "Karnataka", "district": "Bengaluru Rural", "mandi": "Bengaluru", "base_price": 3450.0, "volatility": 25},
    {"commodity": "Tomato", "state": "Karnataka", "district": "Kolar", "mandi": "Kolar", "base_price": 2150.0, "volatility": 70},
    {"commodity": "Paddy (Sona Masoori)", "state": "Karnataka", "district": "Raichur", "mandi": "Raichur", "base_price": 2550.0, "volatility": 20},
    {"commodity": "Cotton", "state": "Karnataka", "district": "Davanagere", "mandi": "Davanagere", "base_price": 7100.0, "volatility": 110},
    {"commodity": "Maize", "state": "Karnataka", "district": "Haveri", "mandi": "Ranebennur", "base_price": 2250.0, "volatility": 30},
    {"commodity": "Onion", "state": "Karnataka", "district": "Chitradurga", "mandi": "Chitradurga", "base_price": 2850.0, "volatility": 75},
    {"commodity": "Tur (Pigeon Pea)", "state": "Karnataka", "district": "Kalaburagi", "mandi": "Kalaburagi", "base_price": 7400.0, "volatility": 60},
    {"commodity": "Chilli (Byadgi)", "state": "Karnataka", "district": "Dharwad", "mandi": "Hubballi", "base_price": 18500.0, "volatility": 250},
    {"commodity": "Arecanut (Betel Nut)", "state": "Karnataka", "district": "Shivamogga", "mandi": "Shivamogga", "base_price": 48500.0, "volatility": 350},
    {"commodity": "Jaggery / Sugarcane", "state": "Karnataka", "district": "Mandya", "mandi": "Mandya", "base_price": 3200.0, "volatility": 40},
    {"commodity": "Potato", "state": "Karnataka", "district": "Hassan", "mandi": "Hassan", "base_price": 1650.0, "volatility": 35},
    {"commodity": "Wheat", "state": "Karnataka", "district": "Belagavi", "mandi": "Belagavi", "base_price": 2650.0, "volatility": 20},
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Always recreate or refresh seed if requested
    db.query(PriceRecord).delete()
    db.query(LedgerLog).delete()
    db.query(Transaction).delete()
    db.query(Offer).delete()
    db.query(Lot).delete()
    db.query(WeatherAlert).delete()
    db.query(User).delete()
    db.commit()

    print("Seeding AgriConnect database with Karnataka APMC Agmarknet dataset...")

    # 1. Users (Karnataka Farmers, Buyers, FPOs & Officers)
    users_data = [
        # Farmers
        {"id": 1, "name": "Basavaraj Gowda", "phone": "9876543210", "role": "farmer", "state": "Karnataka", "district": "Bengaluru Rural", "rating": 4.9},
        {"id": 2, "name": "Siddappa Pujari", "phone": "9876543211", "role": "farmer", "state": "Karnataka", "district": "Belagavi", "rating": 4.8},
        {"id": 3, "name": "Ramesh Swamy", "phone": "9876543212", "role": "farmer", "state": "Karnataka", "district": "Raichur", "rating": 4.7},
        {"id": 4, "name": "Sahyadri Farmers Producer Co.", "phone": "9876543213", "role": "farmer", "state": "Karnataka", "district": "Shivamogga", "rating": 4.95},
        
        # Buyers
        {"id": 5, "name": "Kaveri Agro Traders Pvt Ltd", "phone": "9876543220", "role": "buyer", "state": "Karnataka", "district": "Bengaluru", "gstin_pan": "29AAAAA0000A1Z5", "business_name": "Kaveri Agro Traders", "is_verified": True, "rating": 4.9},
        {"id": 6, "name": "Karnataka Food Processing Co.", "phone": "9876543221", "role": "buyer", "state": "Karnataka", "district": "Mysuru", "gstin_pan": "29BBBBB1111B2Z6", "business_name": "Mysuru Foods Ltd", "is_verified": True, "rating": 4.8},
        {"id": 7, "name": "Deccan Wholesalers & Exporters", "phone": "9876543222", "role": "buyer", "state": "Karnataka", "district": "Hubballi", "gstin_pan": "29CCCCC2222C3Z7", "business_name": "Deccan Exports", "is_verified": True, "rating": 4.6},
        {"id": 8, "name": "Nandi Fresh Organics", "phone": "9876543223", "role": "buyer", "state": "Karnataka", "district": "Chikkaballapura", "gstin_pan": "29DDDDD3333D4Z8", "business_name": "Nandi Fresh Organics", "is_verified": False, "rating": 4.2},
        
        # Admin
        {"id": 9, "name": "Karnataka APMC / NABARD Officer", "phone": "9999999999", "role": "admin", "state": "Karnataka", "district": "Bengaluru", "is_verified": True, "rating": 5.0}
    ]

    for u in users_data:
        db.add(User(**u))
    db.commit()

    # 2. Agmarknet Price History (60 Days)
    today = datetime.now()
    records = []
    
    for item in COMMODITIES_AND_MANDIS:
        base = item["base_price"]
        vol = item["volatility"]
        # Generate 60 daily records
        for i in range(60, -1, -1):
            date_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")
            trend = math_sin_wave(i) * 0.05
            day_noise = random.uniform(-vol, vol)
            modal = max(500.0, round(base * (1.0 + trend) + day_noise, 2))
            min_p = round(modal * 0.92, 2)
            max_p = round(modal * 1.08, 2)
            arrivals = round(random.uniform(100, 850), 1)

            records.append(PriceRecord(
                commodity=item["commodity"],
                state=item["state"],
                district=item["district"],
                mandi=item["mandi"],
                modal_price=modal,
                min_price=min_p,
                max_price=max_p,
                arrivals_qtl=arrivals,
                price_date=date_str
            ))
    db.bulk_save_objects(records)
    db.commit()

    # 3. Seed Digital Lots (Karnataka Produce)
    sample_lots = [
        {
            "farmer_id": 1,
            "commodity": "Ragi (Finger Millet)",
            "variety": "GPU-28 Premium Grade",
            "quantity_qtl": 100.0,
            "expected_price_per_qtl": 3500.0,
            "quality_description": "Clean, sun-dried organic Ragi grains harvested from Bengaluru Rural region. Moisture < 10%.",
            "grade_ai": "Grade A (Indicative AI)",
            "grade_defects_json": json.dumps(["Moisture 9.8%", "Foreign matter 0.5%"]),
            "location_mandi": "Bengaluru APMC Mandi",
            "location_district": "Bengaluru Rural",
            "location_state": "Karnataka",
            "images_json": json.dumps(["https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop"]),
            "status": "active"
        },
        {
            "farmer_id": 3,
            "commodity": "Tomato",
            "variety": "Kolar Red Hybrid",
            "quantity_qtl": 150.0,
            "expected_price_per_qtl": 2200.0,
            "quality_description": "Firm, ripe red tomatoes from Kolar cluster. High shelf life and uniform sizing.",
            "grade_ai": "Grade A (Indicative AI)",
            "grade_defects_json": json.dumps(["Uniform size 90%", "High firmness index"]),
            "location_mandi": "Kolar APMC Mandi",
            "location_district": "Kolar",
            "location_state": "Karnataka",
            "images_json": json.dumps(["https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop"]),
            "status": "active"
        },
        {
            "farmer_id": 2,
            "commodity": "Paddy (Sona Masoori)",
            "variety": "Sona Masoori Raw Paddy",
            "quantity_qtl": 200.0,
            "expected_price_per_qtl": 2600.0,
            "quality_description": "Aged Sona Masoori paddy from Tungabhadra basin in Raichur. Minimal breakage.",
            "grade_ai": "Grade A (Indicative AI)",
            "grade_defects_json": json.dumps(["Moisture 11.2%", "Broken grain 1.5%"]),
            "location_mandi": "Raichur APMC Mandi",
            "location_district": "Raichur",
            "location_state": "Karnataka",
            "images_json": json.dumps(["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop"]),
            "status": "offered"
        }
    ]

    for lot_dict in sample_lots:
        l = Lot(**lot_dict)
        db.add(l)
    db.commit()

    # 4. Sample Offer & Transaction
    sample_offer = Offer(
        lot_id=3,
        buyer_id=6, # Karnataka Food Processing Co.
        offered_price_per_qtl=2580.0,
        quantity_qtl=200.0,
        delivery_date="2026-09-12",
        notes="Pickup arranged directly from Raichur APMC yard with instant bank payout.",
        status="accepted"
    )
    db.add(sample_offer)
    db.commit()

    sample_tx = Transaction(
        lot_id=3,
        offer_id=sample_offer.id,
        farmer_id=2,
        buyer_id=6,
        final_price_per_qtl=2580.0,
        total_amount=516000.0,
        upi_ref="UPI/329481048201/KA_PAYMENT_SUCCESS",
        payment_status="paid",
        delivery_status="delivered",
        certificate_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )
    db.add(sample_tx)
    db.commit()

    # 5. Ledger Genesis Log
    init_data = json.dumps({"event": "LOT_CREATED", "lot_id": 3, "price": 2600.0})
    init_hash = hashlib.sha256(f"0000000000000000000000000000000000000000000000000000000000000000_{init_data}".encode()).hexdigest()
    
    db.add(LedgerLog(
        transaction_id=1,
        lot_id=3,
        event_type="LOT_ACCEPTED_AND_PAID",
        record_data=init_data,
        previous_hash="0000000000000000000000000000000000000000000000000000000000000000",
        current_hash=init_hash
    ))
    db.commit()

    # 6. IMD Weather Alerts (Karnataka Clusters)
    weather_data = [
        {
            "state": "Karnataka",
            "district": "Bengaluru Rural",
            "crop": "Ragi (Finger Millet)",
            "alert_type": "moderate_rain",
            "severity": "warning",
            "title": "IMD Karnataka Warning: Light to Moderate Showers Forecast in Bengaluru Rural",
            "description": "India Meteorological Department (IMD Bengaluru) forecasts light to moderate showers over Bengaluru Rural and Chikkaballapura districts over the next 48 hours.",
            "advisory": "Ensure proper drainage in Ragi fields. Keep harvested produce in dry, covered APMC storage sheds.",
            "issued_date": (today - timedelta(days=1)).strftime("%Y-%m-%d")
        },
        {
            "state": "Karnataka",
            "district": "Kolar",
            "crop": "Tomato",
            "alert_type": "pest_risk",
            "severity": "critical",
            "title": "IMD Karnataka Advisory: High Humidity Blight Risk Alert for Kolar Tomato Cluster",
            "description": "High relative humidity (>88%) and night dew in Kolar APMC belt poses high risk for Early Blotch fungal infection in tomato crops.",
            "advisory": "Apply protective spray of Copper Oxychloride @ 3g/L. Ensure adequate plant spacing to prevent crop disease spread.",
            "issued_date": today.strftime("%Y-%m-%d")
        }
    ]

    for w in weather_data:
        db.add(WeatherAlert(**w))
    db.commit()

    db.close()
    print("Database seeding with Karnataka APMC dataset completed successfully.")

def math_sin_wave(day_idx):
    import math
    return math.sin(day_idx / 7.0)

if __name__ == "__main__":
    seed_database()
