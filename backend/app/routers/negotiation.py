from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json
import hashlib
from ..database import get_db
from ..models import Offer, Lot, User, Transaction, LedgerLog
from ..schemas import OfferCreate, OfferOut, CounterOfferRequest

router = APIRouter(prefix="/api/offers", tags=["Offer & Negotiation Flow"])

@router.get("/lot/{lot_id}", response_model=List[OfferOut])
def get_offers_for_lot(lot_id: int, db: Session = Depends(get_db)):
    offers = db.query(Offer).filter(Offer.lot_id == lot_id).order_by(Offer.created_at.desc()).all()
    
    result = []
    for o in offers:
        buyer = db.query(User).filter(User.id == o.buyer_id).first()
        result.append(OfferOut(
            id=o.id,
            lot_id=o.lot_id,
            buyer_id=o.buyer_id,
            buyer_name=buyer.name if buyer else "Buyer",
            buyer_business=buyer.business_name if buyer else "Buyer Co",
            offered_price_per_qtl=o.offered_price_per_qtl,
            quantity_qtl=o.quantity_qtl,
            delivery_date=o.delivery_date,
            payment_terms=o.payment_terms,
            notes=o.notes,
            status=o.status,
            counter_price_per_qtl=o.counter_price_per_qtl,
            counter_notes=o.counter_notes,
            created_at=o.created_at
        ))
    return result

@router.post("/", response_model=OfferOut)
def submit_offer(payload: OfferCreate, db: Session = Depends(get_db)):
    """
    Buyer submits an offer on a digital lot.
    Must be a verified buyer or signed up buyer.
    """
    lot = db.query(Lot).filter(Lot.id == payload.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    buyer = db.query(User).filter(User.id == payload.buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer user not found")

    new_offer = Offer(
        lot_id=payload.lot_id,
        buyer_id=payload.buyer_id,
        offered_price_per_qtl=payload.offered_price_per_qtl,
        quantity_qtl=payload.quantity_qtl,
        delivery_date=payload.delivery_date or "Within 5 days",
        notes=payload.notes or "Offer submitted via AgriConnect portal",
        status="submitted"
    )
    db.add(new_offer)
    db.commit()
    db.refresh(new_offer)

    # Update lot status to 'offered'
    lot.status = "offered"
    db.commit()

    # Append to hash-chained ledger
    record_str = json.dumps({
        "event": "OFFER_SUBMITTED",
        "offer_id": new_offer.id,
        "lot_id": lot.id,
        "price": payload.offered_price_per_qtl
    })
    last_log = db.query(LedgerLog).order_by(LedgerLog.id.desc()).first()
    prev_hash = last_log.current_hash if last_log else "0" * 64
    cur_hash = hashlib.sha256(f"{prev_hash}_{record_str}".encode()).hexdigest()

    db.add(LedgerLog(
        lot_id=lot.id,
        event_type="OFFER_SUBMITTED",
        record_data=record_str,
        previous_hash=prev_hash,
        current_hash=cur_hash
    ))
    db.commit()

    return OfferOut(
        id=new_offer.id,
        lot_id=new_offer.lot_id,
        buyer_id=new_offer.buyer_id,
        buyer_name=buyer.name,
        buyer_business=buyer.business_name,
        offered_price_per_qtl=new_offer.offered_price_per_qtl,
        quantity_qtl=new_offer.quantity_qtl,
        delivery_date=new_offer.delivery_date,
        payment_terms=new_offer.payment_terms,
        notes=new_offer.notes,
        status=new_offer.status,
        created_at=new_offer.created_at
    )

@router.post("/{offer_id}/counter", response_model=OfferOut)
def submit_counter_offer(
    offer_id: int,
    payload: CounterOfferRequest,
    db: Session = Depends(get_db)
):
    """
    Farmer responds with a counter-offer price and terms.
    """
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    offer.counter_price_per_qtl = payload.counter_price_per_qtl
    offer.counter_notes = payload.counter_notes or "Farmer counter-offer proposed"
    offer.status = "countered"
    offer.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(offer)

    buyer = db.query(User).filter(User.id == offer.buyer_id).first()

    return OfferOut(
        id=offer.id,
        lot_id=offer.lot_id,
        buyer_id=offer.buyer_id,
        buyer_name=buyer.name if buyer else "Buyer",
        buyer_business=buyer.business_name if buyer else "Buyer Co",
        offered_price_per_qtl=offer.offered_price_per_qtl,
        quantity_qtl=offer.quantity_qtl,
        delivery_date=offer.delivery_date,
        payment_terms=offer.payment_terms,
        notes=offer.notes,
        status=offer.status,
        counter_price_per_qtl=offer.counter_price_per_qtl,
        counter_notes=offer.counter_notes,
        created_at=offer.created_at
    )

@router.post("/{offer_id}/accept")
def accept_offer(offer_id: int, db: Session = Depends(get_db)):
    """
    Farmer or Buyer accepts offer. Automatically initiates Transaction & Payment tracker record.
    """
    offer = db.query(Offer).filter(Offer.id == offer_id).first()
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    lot = db.query(Lot).filter(Lot.id == offer.lot_id).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    final_price = offer.counter_price_per_qtl or offer.offered_price_per_qtl
    total_amount = round(final_price * offer.quantity_qtl, 2)

    offer.status = "accepted"
    lot.status = "accepted"
    db.commit()

    # Create Transaction Record
    tx = Transaction(
        lot_id=lot.id,
        offer_id=offer.id,
        farmer_id=lot.farmer_id,
        buyer_id=offer.buyer_id,
        final_price_per_qtl=final_price,
        total_amount=total_amount,
        payment_status="pending",
        delivery_status="pending"
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)

    # Immutable Hash Chain Logging
    record_str = json.dumps({
        "event": "OFFER_ACCEPTED",
        "tx_id": tx.id,
        "lot_id": lot.id,
        "final_price": final_price,
        "total_amount": total_amount
    })
    last_log = db.query(LedgerLog).order_by(LedgerLog.id.desc()).first()
    prev_hash = last_log.current_hash if last_log else "0" * 64
    cur_hash = hashlib.sha256(f"{prev_hash}_{record_str}".encode()).hexdigest()

    tx.certificate_hash = cur_hash
    db.commit()

    db.add(LedgerLog(
        transaction_id=tx.id,
        lot_id=lot.id,
        event_type="OFFER_ACCEPTED",
        record_data=record_str,
        previous_hash=prev_hash,
        current_hash=cur_hash
    ))
    db.commit()

    return {
        "success": True,
        "message": "Offer accepted! Transaction created.",
        "transaction_id": tx.id,
        "final_price_per_qtl": final_price,
        "total_amount": total_amount,
        "certificate_hash": cur_hash
    }
