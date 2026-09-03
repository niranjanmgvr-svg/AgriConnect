from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User
from ..schemas import OTPRequest, OTPVerify, UserOut

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/request-otp")
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    """
    Simulates sending phone OTP via SMS.
    Returns a mock OTP (123456) for easy testing and instant verification.
    """
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        # Create new user default if phone doesn't exist
        user = User(
            name=f"User {payload.phone[-4:]}",
            phone=payload.phone,
            role=payload.role or "farmer",
            is_verified=False
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "success": True,
        "message": f"OTP sent to +91 {payload.phone}",
        "demo_otp": "123456",
        "phone": payload.phone,
        "role": user.role
    }

@router.post("/verify-otp")
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    if payload.otp != "123456":
        raise HTTPException(status_code=400, detail="Invalid OTP. Enter 123456 for demo verification.")
    
    user = db.query(User).filter(User.phone == payload.phone).first()
    if not user:
        raise HTTPException(status_code=444, detail="User not found")
    
    return {
        "success": True,
        "message": "OTP Verified successfully!",
        "token": f"mock-jwt-token-{user.id}",
        "user": {
            "id": user.id,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "state": user.state,
            "district": user.district,
            "is_verified": user.is_verified,
            "business_name": user.business_name
        }
    }

@router.get("/users", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()
