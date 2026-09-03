from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import json
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, nullable=False) # 'farmer', 'buyer', 'admin'
    state = Column(String, nullable=True)
    district = Column(String, nullable=True)
    gstin_pan = Column(String, nullable=True)
    business_name = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    rating = Column(Float, default=4.8)
    created_at = Column(DateTime, default=datetime.utcnow)

    lots = relationship("Lot", back_populates="farmer")
    offers = relationship("Offer", back_populates="buyer")

class PriceRecord(Base):
    __tablename__ = "price_records"

    id = Column(Integer, primary_key=True, index=True)
    commodity = Column(String, index=True, nullable=False)
    state = Column(String, index=True, nullable=False)
    district = Column(String, index=True, nullable=False)
    mandi = Column(String, index=True, nullable=False)
    modal_price = Column(Float, nullable=False) # ₹ per Quintal
    min_price = Column(Float, nullable=False)
    max_price = Column(Float, nullable=False)
    arrivals_qtl = Column(Float, default=100.0) # Quintals
    price_date = Column(String, index=True, nullable=False) # YYYY-MM-DD
    created_at = Column(DateTime, default=datetime.utcnow)

class Lot(Base):
    __tablename__ = "lots"

    id = Column(Integer, primary_key=True, index=True)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    commodity = Column(String, nullable=False)
    variety = Column(String, nullable=True)
    quantity_qtl = Column(Float, nullable=False)
    expected_price_per_qtl = Column(Float, nullable=False)
    quality_description = Column(Text, nullable=True)
    grade_ai = Column(String, default="Grade A (Indicative)") # Grade A / B / C
    grade_defects_json = Column(Text, default="[]")
    location_mandi = Column(String, nullable=False)
    location_district = Column(String, nullable=False)
    location_state = Column(String, nullable=False)
    images_json = Column(Text, default="[]") # JSON list of image URLs
    status = Column(String, default="active") # 'active', 'offered', 'accepted', 'completed', 'cancelled'
    created_at = Column(DateTime, default=datetime.utcnow)

    farmer = relationship("User", back_populates="lots")
    offers = relationship("Offer", back_populates="lot")
    transactions = relationship("Transaction", back_populates="lot")

class Offer(Base):
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    offered_price_per_qtl = Column(Float, nullable=False)
    quantity_qtl = Column(Float, nullable=False)
    delivery_date = Column(String, nullable=True)
    payment_terms = Column(String, default="Immediate UPI upon receipt")
    notes = Column(Text, nullable=True)
    status = Column(String, default="submitted") # 'submitted', 'countered', 'accepted', 'rejected'
    counter_price_per_qtl = Column(Float, nullable=True)
    counter_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    lot = relationship("Lot", back_populates="offers")
    buyer = relationship("User", back_populates="offers")
    transactions = relationship("Transaction", back_populates="offer")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    lot_id = Column(Integer, ForeignKey("lots.id"), nullable=False)
    offer_id = Column(Integer, ForeignKey("offers.id"), nullable=False)
    farmer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    final_price_per_qtl = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    upi_ref = Column(String, nullable=True)
    payment_status = Column(String, default="pending") # 'pending', 'paid', 'verified'
    delivery_status = Column(String, default="pending") # 'pending', 'in_transit', 'delivered'
    certificate_hash = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    lot = relationship("Lot", back_populates="transactions")
    offer = relationship("Offer", back_populates="transactions")
    farmer = relationship("User", foreign_keys=[farmer_id])
    buyer = relationship("User", foreign_keys=[buyer_id])

class LedgerLog(Base):
    __tablename__ = "ledger_logs"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, nullable=True)
    lot_id = Column(Integer, nullable=True)
    event_type = Column(String, nullable=False) # 'LOT_CREATED', 'OFFER_SUBMITTED', 'COUNTER_OFFER', 'OFFER_ACCEPTED', 'PAYMENT_RECORDED', 'DELIVERY_COMPLETED'
    record_data = Column(Text, nullable=False)
    previous_hash = Column(String, nullable=False)
    current_hash = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)

class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"), nullable=False)
    raised_by_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String, nullable=False)
    details = Column(Text, nullable=False)
    evidence_urls_json = Column(Text, default="[]")
    status = Column(String, default="open") # 'open', 'under_review', 'resolved', 'dismissed'
    admin_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

class WeatherAlert(Base):
    __tablename__ = "weather_alerts"

    id = Column(Integer, primary_key=True, index=True)
    state = Column(String, nullable=False)
    district = Column(String, nullable=False)
    crop = Column(String, nullable=False)
    alert_type = Column(String, nullable=False) # 'heavy_rain', 'heatwave', 'pest_risk', 'frost'
    severity = Column(String, default="warning") # 'info', 'warning', 'critical'
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    advisory = Column(Text, nullable=False)
    issued_date = Column(String, nullable=False)
