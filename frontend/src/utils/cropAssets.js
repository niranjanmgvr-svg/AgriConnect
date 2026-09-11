/**
 * Central Crop Asset Dictionary for AgriConnect (SIH Presentation-Ready)
 * Binds high-quality, realistic, CDN-hosted images to unique commodity IDs.
 */

export const CROP_ASSETS = {
  ragi: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80", // Authentic reddish brown finger millet grains
  "finger millet": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&auto=format&fit=crop&q=80",
  paddy: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80", // Paddy stalks & rice harvest
  rice: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
  tomato: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80", // Fresh red Kolar tomatoes
  potato: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80", // Fresh harvested potatoes
  onion: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8ce?w=800&auto=format&fit=crop&q=80", // Red/white onions
  chilli: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80", // Dried red Byadgi chillies
  byadgi: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80",
  cotton: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=800&auto=format&fit=crop&q=80", // White cotton bolls
  jaggery: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=800&auto=format&fit=crop&q=80", // Sugarcane & Jaggery
  sugarcane: "https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=800&auto=format&fit=crop&q=80",
  tur: "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80", // Tur pigeon pea
  "pigeon pea": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80",
  maize: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80", // Golden corn / Maize
  corn: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80",
  arecanut: "https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop&q=80", // 12th Commodity: Betel Nut palm fruit bunch
  "betel nut": "https://images.unsplash.com/photo-1508747703725-719777637510?w=800&auto=format&fit=crop&q=80",
  wheat: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80" // Golden wheat stalk
};

export const DEFAULT_CROP_SVG = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='%23064e3b'/><circle cx='400' cy='300' r='180' fill='%23f59e0b' opacity='0.2'/><text x='50%' y='48%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='64' font-weight='900' fill='%23fbbf24'>🌾 AgriConnect</text><text x='50%' y='60%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='28' font-weight='700' fill='%236ee7b7'>Karnataka Mandi Produce</text></svg>";

/**
 * Dynamic crop image asset resolver
 * @param {string} commodityName 
 * @returns {string} Image URL
 */
export function getCropImage(commodityName) {
  if (!commodityName) return CROP_ASSETS.ragi;
  const nameLower = String(commodityName).toLowerCase();

  for (const [key, url] of Object.entries(CROP_ASSETS)) {
    if (nameLower.includes(key)) {
      return url;
    }
  }

  return CROP_ASSETS.ragi; // Authentic Ragi default fallback
}

export function handleCropImageError(e) {
  e.target.onerror = null;
  e.target.src = DEFAULT_CROP_SVG;
}
