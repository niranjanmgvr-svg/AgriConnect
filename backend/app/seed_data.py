from datetime import datetime, timedelta
import random
import json
import hashlib
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models import User, PriceRecord, Lot, Offer, Transaction, LedgerLog, WeatherAlert, Dispute

COMMODITIES_AND_MANDIS = [
    {"commodity": "Wheat", "state": "Uttar Pradesh", "district": "Kanpur Nagar", "mandi": "Kanpur", "base_price": 2350.0, "volatility": 15},
    {"commodity": "Wheat", "state": "Punjab", "district": "Ludhiana", "mandi": "Khanna", "base_price": 2420.0, "volatility": 20},
    {"commodity": "Wheat", "state": "Madhya Pradesh", "district": "Indore", "mandi": "Indore", "base_price": 2510.0, "volatility": 18},
    {"commodity": "Paddy (Dhan)", "state": "Punjab", "district": "Amritsar", "mandi": "Amritsar", "base_price": 2200.0, "volatility": 25},
    {"commodity": "Paddy (Dhan)", "state": "Haryana", "district": "Karnal", "mandi": "Karnal", "base_price": 2280.0, "volatility": 20},
    {"commodity": "Potato", "state": "Uttar Pradesh", "district": "Agra", "mandi": "Agra", "base_price": 1450.0, "volatility": 40},
    {"commodity": "Potato", "state": "West Bengal", "district": "Hooghly", "mandi": "Tarakeswar", "base_price": 1380.0, "volatility": 35},
    {"commodity": "Onion", "state": "Maharashtra", "district": "Nashik", "mandi": "Lasalgaon", "base_price": 2850.0, "volatility": 80},
    {"commodity": "Onion", "state": "Delhi", "district": "North Delhi", "mandi": "Azadpur", "base_price": 3100.0, "volatility": 75},
    {"commodity": "Tomato", "state": "Karnataka", "district": "Kolar", "mandi": "Kolar", "base_price": 1950.0, "volatility": 90},
    {"commodity": "Tomato", "state": "Maharashtra", "district": "Pune", "mandi": "Narayangaon", "base_price": 2050.0, "volatility": 85},
    {"commodity": "Chana (Gram)", "state": "Madhya Pradesh", "district": "Ujjain", "mandi": "Ujjain", "base_price": 5400.0, "volatility": 45},
    {"commodity": "Mustard", "state": "Rajasthan", "district": "Bharatpur", "mandi": "Bharatpur", "base_price": 5750.0, "volatility": 50},
    {"commodity": "Soyabean", "state": "Madhya Pradesh", "district": "Ujjain", "mandi": "Ujjain", "base_price": 4650.0, "volatility": 40},
    {"commodity": "Cotton", "state": "Gujarat", "district": "Rajkot", "mandi": "Rajkot", "base_price": 7200.0, "volatility": 110},
    {"commodity": "Maize", "state": "Bihar", "district": "Begusarai", "mandi": "Begusarai", "base_price": 2150.0, "volatility": 30},
]

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(User).first():
        print("Database already seeded.")
        db.close()
        return

    print("Seeding AgriConnect database with Agmarknet dataset and initial users...")

    # 1. Users
    users_data = [
        # Farmers
        {"id": 1, "name": "Ramesh Kumar", "phone": "9876543210", "role": "farmer", "state": "Uttar Pradesh", "district": "Kanpur Nagar", "rating": 4.9},
        {"id": 2, "name": "Sukhwinder Singh", "phone": "9876543211", "role": "farmer", "state": "Punjab", "district": "Ludhiana", "rating": 4.8},
        {"id": 3, "name": "Ganesh Patil", "phone": "9876543212", "role": "farmer", "state": "Maharashtra", "district": "Nashik", "rating": 4.7},
        {"id": 4, "name": "Kisan Mitra FPO", "phone": "9876543213", "role": "farmer", "state": "Madhya Pradesh", "district": "Indore", "rating": 4.95},
        
        # Buyers
        {"id": 5, "name": "Rajesh Agro Traders", "phone": "9876543220", "role": "buyer", "state": "Delhi", "district": "North Delhi", "gstin_pan": "07AAAAA0000A1Z5", "business_name": "Rajesh Agro Traders Pvt Ltd", "is_verified": True, "rating": 4.9},
        {"id": 6, "name": "Annapurna Food Processing", "phone": "9876543221", "role": "buyer", "state": "Punjab", "district": "Ludhiana", "gstin_pan": "03BBBBB1111B2Z6", "business_name": "Annapurna Foods", "is_verified": True, "rating": 4.8},
        {"id": 7, "name": "Maharashtra Mandi Wholesalers", "phone": "9876543222", "role": "buyer", "state": "Maharashtra", "district": "Mumbai", "gstin_pan": "27CCCCC2222C3Z7", "business_name": "MM Wholesalers Co.", "is_verified": True, "rating": 4.6},
        {"id": 8, "name": "GreenField Retail", "phone": "9876543223", "role": "buyer", "state": "Uttar Pradesh", "district": "Lucknow", "gstin_pan": "09DDDDD3333D4Z8", "business_name": "GreenField Fresh Organics", "is_verified": False, "rating": 4.2},
        
        # Admin
        {"id": 9, "name": "Agmarknet Admin", "phone": "9999999999", "role": "admin", "state": "Delhi", "district": "New Delhi", "is_verified": True, "rating": 5.0}
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
            # Trend component + random fluctuation
            trend = math_sin_wave(i) * 0.05
            day_noise = random.uniform(-vol, vol)
            modal = max(500.0, round(base * (1.0 + trend) + day_noise, 2))
            min_p = round(modal * 0.92, 2)
            max_p = round(modal * 1.08, 2)
            arrivals = round(random.uniform(50, 450), 1)

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

    # 3. Seed Digital Lots
    sample_lots = [
        {
            "farmer_id": 1,
            "commodity": "Wheat",
            "variety": "Sharbati A-Grade",
            "quantity_qtl": 80.0,
            "expected_price_per_qtl": 2400.0,
            "quality_description": "Clean, golden grain. Moisture level below 11%. Sourced from rainfed harvest.",
            "grade_ai": "Grade A (Indicative AI)",
            "grade_defects_json": json.dumps(["Moisture 10.5%", "Foreign matter 0.8%"]),
            "location_mandi": "Kanpur Mandi",
            "location_district": "Kanpur Nagar",
            "location_state": "Uttar Pradesh",
            "images_json": json.dumps(["https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop"]),
            "status": "active"
        },
        {
            "farmer_id": 3,
            "commodity": "Onion",
            "variety": "Red Nashik Quality",
            "quantity_qtl": 120.0,
            "expected_price_per_qtl": 2900.0,
            "quality_description": "Medium to large size red onions, firm bulb structure, standard grading.",
            "grade_ai": "Grade A (Indicative AI)",
            "grade_defects_json": json.dumps(["Uniform size 85%", "Skin tightness high"]),
            "location_mandi": "Lasalgaon Mandi",
            "location_district": "Nashik",
            "location_state": "Maharashtra",
            "images_json": json.dumps(["https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=600&auto=format&fit=crop"]),
            "status": "active"
        },
        {
            "farmer_id": 2,
            "commodity": "Paddy (Dhan)",
            "variety": "PR-126 Basmati Hybrid",
            "quantity_qtl": 150.0,
            "expected_price_per_qtl": 2250.0,
            "quality_description": "Freshly threshed paddy, high grain length, minimal breakage.",
            "grade_ai": "Grade B (Indicative AI)",
            "grade_defects_json": json.dumps(["Moisture 13.2%", "Broken grain 2.1%"]),
            "location_mandi": "Amritsar Mandi",
            "location_district": "Amritsar",
            "location_state": "Punjab",
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
        buyer_id=6, # Annapurna Foods
        offered_price_per_qtl=2220.0,
        quantity_qtl=150.0,
        delivery_date="2026-09-10",
        notes="We will arrange pickup from farm site with immediate bank payment.",
        status="accepted"
    )
    db.add(sample_offer)
    db.commit()

    sample_tx = Transaction(
        lot_id=3,
        offer_id=sample_offer.id,
        farmer_id=2,
        buyer_id=6,
        final_price_per_qtl=2220.0,
        total_amount=333000.0,
        upi_ref="UPI/329481048201/PAYMENT_DONE",
        payment_status="paid",
        delivery_status="delivered",
        certificate_hash="e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    )
    db.add(sample_tx)
    db.commit()

    # 5. Ledger Genesis Log
    init_data = json.dumps({"event": "LOT_CREATED", "lot_id": 3, "price": 2250.0})
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

    # 6. IMD Weather Alerts
    weather_data = [
        {
            "state": "Uttar Pradesh",
            "district": "Kanpur Nagar",
            "crop": "Wheat",
            "alert_type": "heavy_rain",
            "severity": "warning",
            "title": "IMD Weather Warning: Unseasonal Moderate to Heavy Rainfall Expected",
            "description": "India Meteorological Department (IMD) forecasts widespread light to moderate rainfall with thundershowers over Kanpur and surrounding districts in the next 48 hours.",
            "advisory": "Drain excess water from wheat fields immediately. Delay post-harvest drying until skies clear. Store harvested grain in elevated covered platforms.",
            "issued_date": (today - timedelta(days=1)).strftime("%Y-%m-%d")
        },
        {
            "state": "Maharashtra",
            "district": "Nashik",
            "crop": "Onion",
            "alert_type": "pest_risk",
            "severity": "critical",
            "title": "IMD Agriculture Advisory: High Humidity Pest Infection Alert for Onion",
            "description": "Relative humidity (>85%) combined with warm night temperatures creates conducive environment for Purple Blotch and Stemphylium blight fungal infection in onion crops.",
            "advisory": "Apply prophylactic spray of Mancozeb @ 2.5g/L or Dithane M-45. Avoid excessive nitrogen fertilizer applications during humid weather.",
            "issued_date": today.strftime("%Y-%m-%d")
        }
    ]

    for w in weather_data:
        db.add(WeatherAlert(**w))
    db.commit()

    db.close()
    print("Database seeding completed successfully.")

def math_sin_wave(day_idx):
    import math
    return math.sin(day_idx / 7.0)

if __name__ == "__main__":
    seed_database()
