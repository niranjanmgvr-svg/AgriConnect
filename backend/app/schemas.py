from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    name: str
    phone: str
    role: str
    state: Optional[str] = None
    district: Optional[str] = None
    gstin_pan: Optional[str] = None
    business_name: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserOut(UserBase):
    id: int
    is_verified: bool
    rating: float
    created_at: datetime

    class Config:
        from_attributes = True

class OTPRequest(BaseModel):
    phone: str
    role: Optional[str] = "farmer"

class OTPVerify(BaseModel):
    phone: str
    otp: str

class PriceRecordOut(BaseModel):
    id: int
    commodity: str
    state: str
    district: str
    mandi: str
    modal_price: float
    min_price: float
    max_price: float
    arrivals_qtl: float
    price_date: str

    class Config:
        from_attributes = True

class PriceForecastPoint(BaseModel):
    date: str
    forecast_price: float
    lower_bound: float
    upper_bound: float
    is_historical: bool = False

class PriceForecastResponse(BaseModel):
    commodity: str
    mandi: str
    current_price: float
    forecast_7d_change_pct: float
    seasonal_insight: str
    confidence_level: str
    forecast: List[PriceForecastPoint]
    source_citation: str

class AdvisoryResponse(BaseModel):
    recommendation: str # 'SELL_NOW', 'HOLD', 'MONITOR'
    headline: str
    current_price: float
    avg_30d_price: float
    price_diff_pct: float
    reasoning_steps: List[str]
    arrival_trend_note: str

class LotCreate(BaseModel):
    farmer_id: int
    commodity: str
    variety: Optional[str] = "Standard Local"
    quantity_qtl: float
    expected_price_per_qtl: float
    quality_description: Optional[str] = None
    location_mandi: str
    location_district: str
    location_state: str
    images: Optional[List[str]] = []

class LotOut(BaseModel):
    id: int
    farmer_id: int
    farmer_name: Optional[str] = None
    farmer_phone: Optional[str] = None
    commodity: str
    variety: Optional[str] = None
    quantity_qtl: float
    expected_price_per_qtl: float
    quality_description: Optional[str] = None
    grade_ai: str
    grade_defects: List[str] = []
    location_mandi: str
    location_district: str
    location_state: str
    images: List[str] = []
    status: str
    created_at: datetime

    class Config:
        from_attributes = True

class OfferCreate(BaseModel):
    lot_id: int
    buyer_id: int
    offered_price_per_qtl: float
    quantity_qtl: float
    delivery_date: Optional[str] = None
    notes: Optional[str] = None

class CounterOfferRequest(BaseModel):
    counter_price_per_qtl: float
    counter_notes: Optional[str] = None

class OfferOut(BaseModel):
    id: int
    lot_id: int
    buyer_id: int
    buyer_name: Optional[str] = None
    buyer_business: Optional[str] = None
    offered_price_per_qtl: float
    quantity_qtl: float
    delivery_date: Optional[str] = None
    payment_terms: str
    notes: Optional[str] = None
    status: str
    counter_price_per_qtl: Optional[float] = None
    counter_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TransactionOut(BaseModel):
    id: int
    lot_id: int
    offer_id: int
    farmer_id: int
    buyer_id: int
    farmer_name: Optional[str] = None
    buyer_name: Optional[str] = None
    commodity: Optional[str] = None
    final_price_per_qtl: float
    total_amount: float
    upi_ref: Optional[str] = None
    payment_status: str
    delivery_status: str
    certificate_hash: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BuyerMatch(BaseModel):
    buyer_id: int
    buyer_name: str
    business_name: str
    phone: str
    rating: float
    match_score: float # 0-100%
    distance_km: float
    match_reasons: List[str]

class LedgerLogOut(BaseModel):
    id: int
    transaction_id: Optional[int]
    lot_id: Optional[int]
    event_type: str
    record_data: str
    previous_hash: str
    current_hash: str
    timestamp: datetime

    class Config:
        from_attributes = True

class DisputeCreate(BaseModel):
    transaction_id: int
    raised_by_user_id: int
    reason: str
    details: str
    evidence_urls: Optional[List[str]] = []

class VoiceQueryRequest(BaseModel):
    transcription: Optional[str] = None
    audio_base64: Optional[str] = None
    language: Optional[str] = "hi"

class SMSRequest(BaseModel):
    sender_phone: str
    message_text: str
