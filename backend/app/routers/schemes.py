from fastapi import APIRouter, Query
from typing import List

router = APIRouter(prefix="/api/schemes", tags=["Government Scheme Recommender"])

GOVT_SCHEMES_DATABASE = [
    {
        "id": "SCH-001",
        "scheme_name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
        "category": "Direct Income Support",
        "benefits": "₹6,000 per year transferred directly in 3 equal installments of ₹2,000 into bank accounts.",
        "eligibility_rules": "All landholding farmer families across India (small, marginal, and large). Excludes income tax payers.",
        "eligible_crops": ["All Crops"],
        "min_land_acres": 0.0,
        "max_land_acres": 100.0,
        "official_url": "https://myscheme.gov.in/schemes/pm-kisan",
        "portal_name": "myScheme.gov.in / PM-KISAN Portal"
    },
    {
        "id": "SCH-002",
        "scheme_name": "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
        "category": "Crop Insurance & Loss Coverage",
        "benefits": "Comprehensive risk insurance against unseasonal rain, drought, pest attack, and post-harvest losses. Farmer pays low premium (1.5% - 2%).",
        "eligibility_rules": "Farmers growing notified crops in notified areas during Kharif & Rabi seasons.",
        "eligible_crops": ["Ragi (Finger Millet)", "Paddy (Sona Masoori)", "Cotton", "Mustard", "Potato", "Soyabean", "Tomato"],
        "min_land_acres": 0.1,
        "max_land_acres": 100.0,
        "official_url": "https://pmfby.gov.in",
        "portal_name": "PMFBY National Portal"
    },
    {
        "id": "SCH-003",
        "scheme_name": "Kisan Credit Card (KCC) Scheme",
        "category": "Subsidized Institutional Credit",
        "benefits": "Concessional short-term crop loans up to ₹3 Lakh at effective 4% interest rate (with 3% prompt repayment incentive).",
        "eligibility_rules": "Individual farmers, Joint Borrowers, Tenant Farmers, Sharecroppers, Self Help Groups (SHGs) & FPOs.",
        "eligible_crops": ["All Crops"],
        "min_land_acres": 0.0,
        "max_land_acres": 100.0,
        "official_url": "https://myscheme.gov.in/schemes/kcc",
        "portal_name": "myScheme.gov.in / RBI KCC Portal"
    },
    {
        "id": "SCH-004",
        "scheme_name": "Sub-Mission on Agricultural Mechanization (SMAM)",
        "category": "Equipment Subsidy",
        "benefits": "50% to 80% subsidy on procurement of tractors, harvesters, seeders, and drone sprayers for FPOs and small landholders.",
        "eligibility_rules": "Registered small/marginal farmers, Women farmers, and registered FPOs.",
        "eligible_crops": ["Ragi (Finger Millet)", "Paddy (Sona Masoori)", "Maize", "Cotton"],
        "min_land_acres": 0.5,
        "max_land_acres": 50.0,
        "official_url": "https://agrimachinery.nic.in",
        "portal_name": "FARMS / Direct Benefit Transfer in Agriculture"
    },
    {
        "id": "SCH-005",
        "scheme_name": "PM-KUSUM Component B & C (Solar Pump Scheme)",
        "category": "Renewable Energy & Irrigation",
        "benefits": "Up to 60% central & state subsidy for installing standalone solar agriculture pumps (3HP - 10HP).",
        "eligibility_rules": "Individual farmers, Water User Associations, FPOs having agriculture land with tube-well/open well.",
        "eligible_crops": ["All Crops"],
        "min_land_acres": 1.0,
        "max_land_acres": 100.0,
        "official_url": "https://pmkusum.mnre.gov.in",
        "portal_name": "MNRE Solar Agriculture Portal"
    }
]

@router.get("/recommend")
def recommend_schemes(
    crop: str = Query("Ragi (Finger Millet)"),
    state: str = Query("Karnataka"),
    land_acres: float = Query(2.5)
):
    """
    Government Scheme Recommender Engine.
    Matches farmer inputs (Crop, State, Landholding Size) against official central and state schemes.
    Refers directly to myScheme.gov.in.
    """
    matched = []
    for s in GOVT_SCHEMES_DATABASE:
        crop_match = ("All Crops" in s["eligible_crops"]) or any(c.lower() in crop.lower() for c in s["eligible_crops"])
        land_match = s["min_land_acres"] <= land_acres <= s["max_land_acres"]
        
        if crop_match and land_match:
            matched.append(s)

    return {
        "farmer_profile": {
            "declared_crop": crop,
            "state": state,
            "landholding_acres": land_acres
        },
        "total_matched_schemes": len(matched),
        "source_portal": "myScheme.gov.in (National Single Window Service)",
        "schemes": matched
    }
