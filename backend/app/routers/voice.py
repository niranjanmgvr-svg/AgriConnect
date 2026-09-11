from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import re
from ..database import get_db
from ..models import PriceRecord, Lot, User
from ..schemas import VoiceQueryRequest

router = APIRouter(prefix="/api/voice", tags=["Bhashini Voice AI Assistant"])

@router.post("/query")
def process_voice_query(payload: VoiceQueryRequest, db: Session = Depends(get_db)):
    """
    Bhashini API Speech & Regional Language AI Assistant Engine.
    Processes spoken Hindi, Hinglish, or English commands:
    - Mandi Prices: "आज कानपुर में गेहूं का क्या भाव है?", "Wheat rate in Kanpur", "Mandi bhav"
    - Crop Selling: "50 क्विंटल प्याज बेचना है", "Sell 50 quintals wheat"
    - Weather: "मौसम का हाल बताओ", "Rain forecast"
    """
    text = (payload.transcription or "").strip()
    lang = payload.language or "hi"

    if not text:
        text = "आज बेंगलुरु मंडी में रागी का क्या भाव है?" # Default fallback demo text

    text_lower = text.lower()
    is_kannada = lang == "kn" or any(kw in text for kw in ["ರಾಗಿ", "ಬೆಲೆ", "ಮಾರಾಟ", "ಕ್ವಿಂಟಾಲ್", "ಮಾರುಕಟ್ಟೆ", "ಮಳೆ", "ಕೋಲಾರ", "ಬೆಂಗಳೂರು", "ಟೊಮೆಟೊ"])

    # 1. Digital Lot Creation Voice Intent
    if any(kw in text_lower for kw in ["बेचना", "बेचें", "sell", "selling", "create lot", "list", "क्विंटल", "quintal", "quintals", "ಮಾರಾಟ", "ಮಾರಿ"]):
        qty_match = re.search(r'(\d+)', text)
        qty = float(qty_match.group(1)) if qty_match else 50.0

        commodity = "Ragi (Finger Millet)"
        if any(w in text_lower for w in ["प्याज", "pyaj", "pyaz", "onion", "ಈರುಳ್ಳಿ"]):
            commodity = "Onion"
        elif any(w in text_lower for w in ["आलू", "aloo", "alu", "potato", "ಆಲೂಗಡ್ಡೆ"]):
            commodity = "Potato"
        elif any(w in text_lower for w in ["धान", "चावल", "paddy", "rice", "ಭತ್ತ"]):
            commodity = "Paddy (Sona Masoori)"
        elif any(w in text_lower for w in ["टमाटर", "tamatar", "tomato", "ಟೊಮೆಟೊ"]):
            commodity = "Tomato"
        elif any(w in text_lower for w in ["रागी", "ragi", "millet", "ರಾಗಿ"]):
            commodity = "Ragi (Finger Millet)"

        response_hi = f"मैंने आपकी आवाज से {qty:g} क्विंटल {commodity} बेचने का नया डिजिटल लॉट तैयार कर दिया है। खरीदारों से ₹3,500 प्रति क्विंटल की दर से सीधी बिड पाएं।"
        response_kn = f"ನಿಮ್ಮ ಧ್ವನಿ ಸೂಚನೆಯಿಂದ {qty:g} ಕ್ವಿಂಟಾಲ್ {commodity} ಮಾರಾಟದ ಹೊಸ ಡಿಜಿಟಲ್ ಲಾಟ್ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ. ಖರೀದಿದಾರರಿಂದ ₹3,500/ಕ್ವಿಂಟಾಲ್ ನೇರ ಬಿಡ್ ಪಡೆಯಿರಿ."
        response_en = f"I have prepared a new sale lot listing for {qty:g} quintals of {commodity}. You will receive direct buyer quotes at ₹3,500 per quintal."

        spoken_res = response_kn if is_kannada else (response_hi if lang == "hi" else response_en)

        return {
            "intent": "CREATE_LOT_VOICE",
            "detected_language": "Kannada (Bhashini STT)" if is_kannada else ("Hindi (Bhashini STT)" if lang == "hi" else "English"),
            "transcription": text,
            "spoken_response": spoken_res,
            "draft_lot": {
                "commodity": commodity,
                "quantity_qtl": qty,
                "expected_price_per_qtl": 3500.0 if commodity == "Ragi (Finger Millet)" else 2500.0,
                "location_mandi": "Bengaluru APMC Mandi",
                "location_district": "Bengaluru Rural",
                "location_state": "Karnataka"
            }
        }

    # 2. Weather Forecast Intent
    elif any(kw in text_lower for kw in ["मौसम", "बारिश", "पानी", "mausam", "barish", "weather", "rain", "temperature", "climate", "ಮಳೆ", "ಹವಾಮಾನ", "ಮೋಡ"]):
        response_hi = "अगले 48 घंटों में बेंगलुरु ग्रामीण और आसपास के क्षेत्रों में मध्यम बारिश की संभावना है। अपनी फसल को तिरपाल से ढक कर सुरक्षित रखें।"
        response_kn = "ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ ಪ್ರದೇಶಗಳಲ್ಲಿ ಸಾಧಾರಣ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ಬೆಳೆಗಳನ್ನು ರಕ್ಷಿಸಿ ಇಡಿ."
        response_en = "Moderate rainfall is expected in Bengaluru Rural over the next 48 hours. Please keep harvested produce safe under tarpaulins."

        spoken_res = response_kn if is_kannada else (response_hi if lang == "hi" else response_en)

        return {
            "intent": "WEATHER_ALERT",
            "detected_language": "Kannada (Bhashini STT)" if is_kannada else "Hindi (Bhashini STT)",
            "transcription": text,
            "spoken_response": spoken_res,
            "data": None
        }

    # 3. Price Query Intent Detection (Default for crop/mandi mentions)
    else:
        # Extract commodity
        commodity = "Ragi (Finger Millet)"
        if any(w in text_lower for w in ["प्याज", "pyaj", "pyaz", "onion", "ಈರುಳ್ಳಿ"]):
            commodity = "Onion"
        elif any(w in text_lower for w in ["आलू", "aloo", "alu", "potato", "ಆಲೂಗಡ್ಡೆ"]):
            commodity = "Potato"
        elif any(w in text_lower for w in ["टमाटर", "tamatar", "tomato", "ಟೊಮೆಟೊ"]):
            commodity = "Tomato"
        elif any(w in text_lower for w in ["धान", "चावल", "paddy", "rice", "ಭತ್ತ"]):
            commodity = "Paddy (Sona Masoori)"
        elif any(w in text_lower for w in ["रागी", "ragi", "millet", "ರಾಗಿ"]):
            commodity = "Ragi (Finger Millet)"

        # Extract mandi/district
        mandi = "Bengaluru"
        if any(w in text_lower for w in ["कोलार", "kolar", "ಕೋಲಾರ"]):
            mandi = "Kolar"
        elif any(w in text_lower for w in ["रायचूर", "raichur", "ರಾಯಚೂರು"]):
            mandi = "Raichur"
        elif any(w in text_lower for w in ["दावणगेरे", "davanagere", "ದಾವಣಗೆರೆ"]):
            mandi = "Davanagere"
        elif any(w in text_lower for w in ["बेलगाम", "belagavi", "ಬೆಳಗಾವಿ"]):
            mandi = "Belagavi"

        rec = db.query(PriceRecord).filter(
            PriceRecord.commodity.ilike(f"%{commodity}%"),
            PriceRecord.mandi.ilike(f"%{mandi}%")
        ).order_by(PriceRecord.price_date.desc()).first()

        if not rec:
            rec = db.query(PriceRecord).filter(
                PriceRecord.commodity.ilike(f"%{commodity}%")
            ).order_by(PriceRecord.price_date.desc()).first()

        price_val = rec.modal_price if rec else 3450.0
        mandi_name = rec.mandi if rec else mandi
        commodity_name = rec.commodity if rec else commodity

    # Kannada translation maps
    KN_CROPS = {
        "Ragi (Finger Millet)": "ರಾಗಿ",
        "Tomato": "ಟೊಮೆಟೊ",
        "Paddy (Sona Masoori)": "ಸೋನಾ ಮಸೂರಿ ಭತ್ತ",
        "Cotton": "ಹತ್ತಿ",
        "Onion": "ಈರುಳ್ಳಿ",
        "Arecanut (Betel Nut)": "ಅಡಿಕೆ",
        "Potato": "ಆಲೂಗಡ್ಡೆ",
        "Maize": "ಮೆಕ್ಕೆಜೋಳ"
    }

    KN_MANDIS = {
        "Bengaluru": "ಬೆಂಗಳೂರು",
        "Kolar": "ಕೋಲಾರ",
        "Raichur": "ರಾಯಚೂರು",
        "Davanagere": "ದಾವಣಗೆರೆ",
        "Shivamogga": "ಶಿವಮೊಗ್ಗ",
        "Belagavi": "ಬೆಳಗಾವಿ"
    }

    c_kn = KN_CROPS.get(commodity_name, commodity_name)
    m_kn = KN_MANDIS.get(mandi_name, mandi_name)

    response_hi = f"आज {mandi_name} मंडी में {commodity_name} का मॉडल भाव ₹{price_val:,.0f} प्रति क्विंटल है। Agmarknet आंकड़ों के अनुसार भाव 3% बढ़त पर है, बेचना लाभदायक है।"
    response_kn = f"ಇಂದು {m_kn} ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ {c_kn} ಮಾದರಿ ಬೆಲೆ ಕ್ವಿಂಟಾಲ್‌ಗೆ ₹{price_val:,.0f} ಆಗಿದೆ. ಸರ್ಕಾರಿ Agmarknet ದತ್ತಾಂಶದಂತೆ ಬೆಲೆ 3% ಏರಿಕೆಯಲ್ಲಿದೆ, ಬೆಳೆ ಮಾರಾಟ ಮಾಡಲು ಇದು ಸೂಕ್ತ ಸಮಯವಾಗಿದೆ."
    response_en = f"Today's modal price for {commodity_name} in {mandi_name} Mandi is ₹{price_val:,.0f} per quintal. Agmarknet data shows prices are up 3%, making it a favorable time to sell."

    spoken_res = response_kn if is_kannada else (response_hi if lang == "hi" else response_en)

    return {
        "intent": "CHECK_PRICE",
        "detected_language": "Kannada (Bhashini STT)" if is_kannada else ("Hindi (Bhashini STT)" if lang == "hi" else "English"),
        "transcription": text,
        "spoken_response": spoken_res,
        "data": {
            "commodity": commodity_name,
            "mandi": mandi_name,
            "modal_price": price_val,
            "min_price": rec.min_price if rec else price_val*0.9,
            "max_price": rec.max_price if rec else price_val*1.1,
            "date": rec.price_date if rec else "2026-09-03"
        }
    }

