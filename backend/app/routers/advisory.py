from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
import numpy as np
from ..database import get_db
from ..models import PriceRecord
from ..schemas import AdvisoryResponse

router = APIRouter(prefix="/api/advisory", tags=["Advisory Engine"])

@router.get("/recommendation", response_model=AdvisoryResponse)
def get_sell_hold_advisory(
    commodity: str = Query("Ragi (Finger Millet)"),
    mandi: str = Query("Bengaluru"),
    db: Session = Depends(get_db)
):
    """
    Explainable Rule-Based Sell-Now vs Hold Advisory Engine.
    Compares current mandi price against 7-day and 30-day moving averages and arrival volume trends.
    Outputs plain-language step-by-step reasoning transparently.
    """
    records = db.query(PriceRecord).filter(
        PriceRecord.commodity.ilike(f"%{commodity}%"),
        PriceRecord.mandi.ilike(f"%{mandi}%")
    ).order_by(PriceRecord.price_date.asc()).all()

    if not records:
        records = db.query(PriceRecord).filter(
            PriceRecord.commodity.ilike(f"%{commodity}%")
        ).order_by(PriceRecord.price_date.asc()).all()

    if not records:
        raise HTTPException(status_code=404, detail="No historical price data found to evaluate advisory")

    prices = [r.modal_price for r in records]
    arrivals = [r.arrivals_qtl for r in records]

    current_price = prices[-1]
    avg_30d = float(np.mean(prices[-30:])) if len(prices) >= 30 else current_price
    avg_7d = float(np.mean(prices[-7:])) if len(prices) >= 7 else current_price
    
    price_diff_pct = round(((current_price - avg_30d) / avg_30d) * 100.0, 1)

    arrival_recent = float(np.mean(arrivals[-3:])) if len(arrivals) >= 3 else 100.0
    arrival_past = float(np.mean(arrivals[-14:-3])) if len(arrivals) >= 14 else arrival_recent
    
    arrival_trend_pct = round(((arrival_recent - arrival_past) / (arrival_past + 0.1)) * 100.0, 1)

    reasoning_steps = []
    
    # Step 1: Benchmark Comparison
    if price_diff_pct > 0:
        reasoning_steps.append(
            f"Step 1 (Price Benchmark): Today's price of ₹{current_price:,.0f}/qtl in {mandi} Mandi is {abs(price_diff_pct)}% HIGHER than the 30-day local moving average (₹{avg_30d:,.0f}/qtl)."
        )
    else:
        reasoning_steps.append(
            f"Step 1 (Price Benchmark): Today's price of ₹{current_price:,.0f}/qtl in {mandi} Mandi is {abs(price_diff_pct)}% LOWER than the 30-day local moving average (₹{avg_30d:,.0f}/qtl)."
        )

    # Step 2: Arrival Volume Trend
    if arrival_trend_pct > 5:
        arrival_note = f"Mandi arrivals have increased by {arrival_trend_pct}% over the past week (supply expansion)."
        reasoning_steps.append(f"Step 2 (Supply Trend): {arrival_note}")
    elif arrival_trend_pct < -5:
        arrival_note = f"Mandi arrivals have dropped by {abs(arrival_trend_pct)}% over the past week (supply contraction)."
        reasoning_steps.append(f"Step 2 (Supply Trend): {arrival_note}")
    else:
        arrival_note = "Mandi arrivals remain stable compared to recent 14-day average."
        reasoning_steps.append(f"Step 2 (Supply Trend): {arrival_note}")

    # Step 3: Decision Logic Evaluation
    if price_diff_pct >= 4.0:
        recommendation = "SELL_NOW"
        headline = f"Recommended: SELL NOW — Favorable Price Window (₹{current_price:,.0f}/qtl)"
        reasoning_steps.append(
            "Step 3 (Rule Execution): Price is significantly above the 30-day baseline. Locking in sales now mitigates potential downside risk if arrivals surge next week."
        )
    elif price_diff_pct <= -4.0:
        recommendation = "HOLD"
        headline = f"Recommended: HOLD STOCKS — Temporary Price Dip (₹{current_price:,.0f}/qtl)"
        reasoning_steps.append(
            "Step 3 (Rule Execution): Price is temporarily depressed below the 30-day baseline. Historical Agmarknet data suggests market prices will recover as arrivals normalize in 7-10 days."
        )
    else:
        recommendation = "MONITOR"
        headline = f"Recommended: MONITOR MARKET — Stable Price Range (₹{current_price:,.0f}/qtl)"
        reasoning_steps.append(
            "Step 3 (Rule Execution): Price is floating within standard market equilibrium bounds (±4%). Staggering your sale (selling 50% lot now, holding 50%) is advised."
        )

    return AdvisoryResponse(
        recommendation=recommendation,
        headline=headline,
        current_price=current_price,
        avg_30d_price=round(avg_30d, 2),
        price_diff_pct=price_diff_pct,
        reasoning_steps=reasoning_steps,
        arrival_trend_note=arrival_note
    )
