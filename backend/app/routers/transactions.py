from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json
import hashlib
from ..database import get_db
from ..models import Transaction, Lot, User, LedgerLog
from ..schemas import TransactionOut

router = APIRouter(prefix="/api/transactions", tags=["Transaction & Payment Tracking"])

@router.get("/", response_model=List[TransactionOut])
def get_transactions(
    user_id: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if user_id:
        query = query.filter((Transaction.farmer_id == user_id) | (Transaction.buyer_id == user_id))
        
    transactions = query.order_by(Transaction.created_at.desc()).all()
    
    result = []
    for t in transactions:
        farmer = db.query(User).filter(User.id == t.farmer_id).first()
        buyer = db.query(User).filter(User.id == t.buyer_id).first()
        lot = db.query(Lot).filter(Lot.id == t.lot_id).first()

        result.append(TransactionOut(
            id=t.id,
            lot_id=t.lot_id,
            offer_id=t.offer_id,
            farmer_id=t.farmer_id,
            buyer_id=t.buyer_id,
            farmer_name=farmer.name if farmer else "Farmer",
            buyer_name=buyer.name if buyer else "Buyer",
            commodity=lot.commodity if lot else "Crop Produce",
            final_price_per_qtl=t.final_price_per_qtl,
            total_amount=t.total_amount,
            upi_ref=t.upi_ref,
            payment_status=t.payment_status,
            delivery_status=t.delivery_status,
            certificate_hash=t.certificate_hash,
            created_at=t.created_at
        ))
    return result

@router.post("/{tx_id}/record-payment")
def record_upi_payment(
    tx_id: int,
    upi_ref: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Captures UPI reference number entry to update transaction payment status to 'paid'.
    Does not run payment gateway — directly records status and appends to immutable hash chain.
    """
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    tx.upi_ref = upi_ref
    tx.payment_status = "paid"
    tx.delivery_status = "in_transit"
    db.commit()

    # Append to Immutable Ledger
    record_str = json.dumps({
        "event": "PAYMENT_RECORDED",
        "tx_id": tx.id,
        "upi_ref": upi_ref,
        "amount": tx.total_amount
    })
    last_log = db.query(LedgerLog).order_by(LedgerLog.id.desc()).first()
    prev_hash = last_log.current_hash if last_log else "0" * 64
    cur_hash = hashlib.sha256(f"{prev_hash}_{record_str}".encode()).hexdigest()

    tx.certificate_hash = cur_hash
    db.commit()

    db.add(LedgerLog(
        transaction_id=tx.id,
        lot_id=tx.lot_id,
        event_type="PAYMENT_RECORDED",
        record_data=record_str,
        previous_hash=prev_hash,
        current_hash=cur_hash
    ))
    db.commit()

    return {
        "success": True,
        "tx_id": tx.id,
        "upi_ref": upi_ref,
        "payment_status": tx.payment_status,
        "delivery_status": tx.delivery_status,
        "certificate_hash": cur_hash,
        "message": "UPI reference recorded and locked into transaction ledger."
    }

@router.post("/{tx_id}/mark-delivered")
def mark_delivery_completed(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    tx.delivery_status = "delivered"
    
    lot = db.query(Lot).filter(Lot.id == tx.lot_id).first()
    if lot:
        lot.status = "completed"
        
    db.commit()

    # Ledger Entry
    record_str = json.dumps({
        "event": "DELIVERY_COMPLETED",
        "tx_id": tx.id,
        "lot_id": tx.lot_id
    })
    last_log = db.query(LedgerLog).order_by(LedgerLog.id.desc()).first()
    prev_hash = last_log.current_hash if last_log else "0" * 64
    cur_hash = hashlib.sha256(f"{prev_hash}_{record_str}".encode()).hexdigest()

    db.add(LedgerLog(
        transaction_id=tx.id,
        lot_id=tx.lot_id,
        event_type="DELIVERY_COMPLETED",
        record_data=record_str,
        previous_hash=prev_hash,
        current_hash=cur_hash
    ))
    db.commit()

    return {"success": True, "message": "Transaction completed and delivered."}
