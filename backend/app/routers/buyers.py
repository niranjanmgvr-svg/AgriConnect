from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User
from ..schemas import UserOut

router = APIRouter(prefix="/api/buyers", tags=["Buyer Directory & Verification"])

@router.get("/", response_model=List[UserOut])
def list_buyers(db: Session = Depends(get_db)):
    """
    Returns list of all registered buyers with verification status.
    """
    return db.query(User).filter(User.role == "buyer").all()

@router.post("/register", response_model=UserOut)
def register_buyer(
    name: str = Body(...),
    phone: str = Body(...),
    business_name: str = Body(...),
    gstin_pan: str = Body(...),
    state: str = Body(...),
    district: str = Body(...),
    db: Session = Depends(get_db)
):
    existing = db.query(User).filter(User.phone == phone).first()
    if existing:
        existing.business_name = business_name
        existing.gstin_pan = gstin_pan
        existing.state = state
        existing.district = district
        db.commit()
        db.refresh(existing)
        return existing

    new_buyer = User(
        name=name,
        phone=phone,
        role="buyer",
        business_name=business_name,
        gstin_pan=gstin_pan,
        state=state,
        district=district,
        is_verified=False, # Admin approval required
        rating=4.5
    )
    db.add(new_buyer)
    db.commit()
    db.refresh(new_buyer)
    return new_buyer

@router.post("/{buyer_id}/verify")
def toggle_buyer_verification(
    buyer_id: int,
    verify: bool = Body(..., embed=True),
    db: Session = Depends(get_db)
):
    """
    Admin Moderation action: Approve or reject buyer verification request.
    """
    buyer = db.query(User).filter(User.id == buyer_id, User.role == "buyer").first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    buyer.is_verified = verify
    db.commit()
    db.refresh(buyer)
    return {
        "success": True,
        "buyer_id": buyer.id,
        "business_name": buyer.business_name,
        "is_verified": buyer.is_verified,
        "message": f"Buyer '{buyer.business_name}' verification set to {verify}"
    }
