from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import json
from ..database import get_db
from ..models import Dispute, Transaction, User
from ..schemas import DisputeCreate

router = APIRouter(prefix="/api/grievances", tags=["Grievance & Disputes"])

@router.get("/")
def list_disputes(
    status: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Dispute)
    if status:
        query = query.filter(Dispute.status == status)
        
    disputes = query.order_by(Dispute.created_at.desc()).all()
    
    result = []
    for d in disputes:
        tx = db.query(Transaction).filter(Transaction.id == d.transaction_id).first()
        user = db.query(User).filter(User.id == d.raised_by_user_id).first()
        ev_urls = json.loads(d.evidence_urls_json) if d.evidence_urls_json else []

        result.append({
            "id": d.id,
            "transaction_id": d.transaction_id,
            "raised_by_id": d.raised_by_user_id,
            "raised_by_name": user.name if user else "User",
            "raised_by_role": user.role if user else "User",
            "reason": d.reason,
            "details": d.details,
            "evidence_urls": ev_urls,
            "status": d.status,
            "admin_notes": d.admin_notes,
            "created_at": d.created_at,
            "resolved_at": d.resolved_at
        })
    return result

@router.post("/flag")
def flag_dispute(payload: DisputeCreate, db: Session = Depends(get_db)):
    """
    Either party (Farmer or Buyer) can flag a transaction for resolution.
    """
    tx = db.query(Transaction).filter(Transaction.id == payload.transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    user = db.query(User).filter(User.id == payload.raised_by_user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    new_dispute = Dispute(
        transaction_id=payload.transaction_id,
        raised_by_user_id=payload.raised_by_user_id,
        reason=payload.reason,
        details=payload.details,
        evidence_urls_json=json.dumps(payload.evidence_urls or []),
        status="open"
    )
    db.add(new_dispute)
    db.commit()
    db.refresh(new_dispute)

    return {
        "success": True,
        "dispute_id": new_dispute.id,
        "message": "Grievance submitted to Admin Moderation Queue for review."
    }

@router.post("/{dispute_id}/resolve")
def resolve_dispute(
    dispute_id: int,
    action: str = Body(..., embed=True), # 'resolved', 'dismissed'
    admin_notes: str = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Admin Moderation action to resolve or dismiss dispute.
    """
    dispute = db.query(Dispute).filter(Dispute.id == dispute_id).first()
    if not dispute:
        raise HTTPException(status_code=404, detail="Dispute record not found")

    dispute.status = action
    dispute.admin_notes = admin_notes
    dispute.resolved_at = datetime.utcnow()
    db.commit()

    return {
        "success": True,
        "dispute_id": dispute.id,
        "status": dispute.status,
        "message": f"Dispute #{dispute.id} marked as {action}."
    }
