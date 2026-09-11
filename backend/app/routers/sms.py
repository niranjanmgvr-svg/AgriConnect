from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
import re
from ..database import get_db
from ..models import PriceRecord, Lot, Offer
from ..schemas import SMSRequest

router = APIRouter(prefix="/api/sms", tags=["Offline / SMS Fallback Gateway"])

@router.post("/simulate")
def simulate_sms_action(payload: SMSRequest, db: Session = Depends(get_db)):
    """
    Offline/SMS Fallback Short-code Gateway Simulator (Feature 18).
    Supports feature-phone SMS operations via 56161:
    - PRICE <commodity> <mandi> (e.g. 'PRICE WHEAT KANPUR')
    - LIST <commodity> <qty> <price> (e.g. 'LIST WHEAT 50 2400')
    - ACCEPT OFFER <id>
    """
    msg = payload.message_text.strip().upper()
    phone = payload.sender_phone

    # 1. Check Price SMS Command
    if msg.startswith("PRICE"):
        parts = msg.split()
        commodity = parts[1] if len(parts) > 1 else "RAGI"
        mandi = parts[2] if len(parts) > 2 else "BENGALURU"

        rec = db.query(PriceRecord).filter(
            PriceRecord.commodity.ilike(f"%{commodity}%"),
            PriceRecord.mandi.ilike(f"%{mandi}%")
        ).order_by(PriceRecord.price_date.desc()).first()

        if not rec:
            rec = db.query(PriceRecord).filter(
                PriceRecord.commodity.ilike(f"%{commodity}%")
            ).order_by(PriceRecord.price_date.desc()).first()

        price_val = rec.modal_price if rec else 3450.0
        reply_sms = f"AgriConnect SMS Alert: {commodity} modal price in {mandi} Mandi today is Rs.{price_val:,.0f}/qtl (Min: Rs.{rec.min_price:,.0f}, Max: Rs.{rec.max_price:,.0f}). Source: Agmarknet."

        return {
            "shortcode": "56161",
            "received_sms": payload.message_text,
            "parsed_action": "CHECK_PRICE_SMS",
            "outbound_sms_reply": reply_sms
        }

    # 2. List or Sell Lot SMS Command (e.g. 'LIST RAGI 50 3500' or 'SELL RAGI 50Q')
    elif msg.startswith("LIST") or msg.startswith("SELL"):
        parts = msg.replace('Q', '').split()
        commodity = parts[1] if len(parts) > 1 else "RAGI"
        qty = float(parts[2]) if len(parts) > 2 and parts[2].replace('.', '', 1).isdigit() else 50.0
        price = float(parts[3]) if len(parts) > 3 and parts[3].replace('.', '', 1).isdigit() else 3500.0

        new_lot = Lot(
            farmer_id=1, # Default Basavaraj Gowda
            commodity=commodity.capitalize(),
            quantity_qtl=qty,
            expected_price_per_qtl=price,
            quality_description="Listed via SMS short-code 56161",
            location_mandi="Bengaluru APMC Mandi",
            location_district="Bengaluru Rural",
            location_state="Karnataka",
            status="active"
        )
        db.add(new_lot)
        db.commit()
        db.refresh(new_lot)

        reply_sms = f"AgriConnect SMS: Lot #{new_lot.id} created! {qty} Qtl of {commodity.capitalize()} @ Rs.{price:,.0f}/Qtl listed on digital marketplace. Top verified buyers notified."

        return {
            "shortcode": "56161",
            "received_sms": payload.message_text,
            "parsed_action": "CREATE_LOT_SMS",
            "outbound_sms_reply": reply_sms
        }

    # 3. Accept Offer SMS Command
    elif "ACCEPT" in msg:
        reply_sms = f"AgriConnect SMS: Offer accepted! Buyer notified. UPI payment reference link sent to your registered mobile."
        return {
            "shortcode": "56161",
            "received_sms": payload.message_text,
            "parsed_action": "ACCEPT_OFFER_SMS",
            "outbound_sms_reply": reply_sms
        }

    else:
        reply_sms = "AgriConnect SMS Help: Send 'PRICE <crop> <mandi>' to check price, or 'LIST <crop> <qty> <price>' to list produce. Call toll-free 1800-180-1551."
        return {
            "shortcode": "56161",
            "received_sms": payload.message_text,
            "parsed_action": "HELP_SMS",
            "outbound_sms_reply": reply_sms
        }
