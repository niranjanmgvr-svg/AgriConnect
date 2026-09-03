from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import hashlib
import json
from ..database import get_db
from ..models import LedgerLog, Transaction, Lot, User
from ..schemas import LedgerLogOut

router = APIRouter(prefix="/api/ledger", tags=["Immutable Transaction Ledger"])

@router.get("/", response_model=List[LedgerLogOut])
def get_ledger_logs(db: Session = Depends(get_db)):
    """
    Returns full append-only hash-chained transaction ledger history.
    """
    return db.query(LedgerLog).order_by(LedgerLog.id.asc()).all()

@router.get("/verify-chain")
def audit_ledger_chain(db: Session = Depends(get_db)):
    """
    Cryptographic Audit Tool: Re-calculates SHA-256 hashes sequentially across all ledger records.
    Verifies zero-tampering and returns audit pass/fail details.
    """
    logs = db.query(LedgerLog).order_by(LedgerLog.id.asc()).all()
    
    if not logs:
        return {"status": "VALID", "total_records": 0, "corrupted_record_id": None, "message": "Ledger is empty"}

    expected_prev = "0000000000000000000000000000000000000000000000000000000000000000"
    
    for idx, log in enumerate(logs):
        if idx > 0:
            if log.previous_hash != logs[idx - 1].current_hash:
                return {
                    "status": "TAMPER_DETECTED",
                    "total_records": len(logs),
                    "corrupted_record_id": log.id,
                    "reason": f"Previous hash mismatch at log ID {log.id}. Stored previous hash does not match prior record hash."
                }
        
        # Verify current hash calculation
        computed = hashlib.sha256(f"{log.previous_hash}_{log.record_data}".encode()).hexdigest()
        if computed != log.current_hash:
            return {
                "status": "TAMPER_DETECTED",
                "total_records": len(logs),
                "corrupted_record_id": log.id,
                "reason": f"Content hash mismatch at log ID {log.id}. Stored hash does not match computed SHA-256 payload."
            }

    return {
        "status": "VALIDATED_SECURE",
        "total_records": len(logs),
        "last_block_hash": logs[-1].current_hash,
        "message": f"Cryptographic integrity audit PASSED. Verified {len(logs)} records in unbroken SHA-256 hash chain."
    }

@router.get("/certificate/{tx_id}")
def generate_sale_certificate(tx_id: int, db: Session = Depends(get_db)):
    """
    Generates shareable cryptographic Sale Certificate for completed sales.
    """
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    lot = db.query(Lot).filter(Lot.id == tx.lot_id).first()
    farmer = db.query(User).filter(User.id == tx.farmer_id).first()
    buyer = db.query(User).filter(User.id == tx.buyer_id).first()

    return {
        "certificate_id": f"AGRI-CERT-2026-{tx.id:06d}",
        "transaction_id": tx.id,
        "lot_id": tx.lot_id,
        "issue_date": tx.created_at.strftime("%B %d, %Y"),
        "commodity": lot.commodity if lot else "Agricultural Produce",
        "variety": lot.variety if lot else "Standard Grade",
        "quantity_qtl": lot.quantity_qtl if lot else 0.0,
        "agreed_price_per_qtl": tx.final_price_per_qtl,
        "total_value_inr": tx.total_amount,
        "farmer_details": {
            "name": farmer.name if farmer else "Farmer",
            "district": farmer.district if farmer else "UP",
            "phone": farmer.phone if farmer else ""
        },
        "buyer_details": {
            "business_name": buyer.business_name if buyer else buyer.name,
            "gstin_pan": buyer.gstin_pan if buyer else "VERIFIED-BUYER",
            "district": buyer.district if buyer else "Delhi"
        },
        "payment": {
            "status": tx.payment_status,
            "upi_reference": tx.upi_ref or "N/A"
        },
        "cryptographic_seal": {
            "algorithm": "SHA-256 Ledger Hash-Chain",
            "hash_signature": tx.certificate_hash or "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
            "verification_portal": "https://agriconnect.gov.in/ledger/verify"
        }
    }
