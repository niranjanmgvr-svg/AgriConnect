from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .seed_data import seed_database
from .routers import (
    auth, prices, advisory, lots, buyers, negotiation,
    transactions, ledger, grievances, weather, schemes,
    monitoring, voice, fraud, sms
)

app = FastAPI(
    title="AgriConnect Platform API",
    description="Neutral digital layer on top of India's public Agmarknet & e-NAM price data connecting farmers directly with verified buyers.",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for dev/testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(prices.router)
app.include_router(advisory.router)
app.include_router(lots.router)
app.include_router(buyers.router)
app.include_router(negotiation.router)
app.include_router(transactions.router)
app.include_router(ledger.router)
app.include_router(grievances.router)
app.include_router(weather.router)
app.include_router(schemes.router)
app.include_router(monitoring.router)
app.include_router(voice.router)
app.include_router(fraud.router)
app.include_router(sms.router)

@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_database()

@app.get("/")
def root():
    return {
        "app_name": "AgriConnect Platform",
        "status": "ONLINE",
        "citation": "Source: Agmarknet (data.gov.in) & e-NAM Government of India",
        "version": "1.0.0",
        "docs_url": "http://localhost:8000/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
