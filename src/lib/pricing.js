/* Default rates (used if city not selected) */
export const SLOT_PRICE_PKR = {
  6: 15000,
  12: 30000,
};

export const SLOT_DISTANCE_CAP_KM = {
  6: 100,
  12: 160,
};

/* City-specific rates */
export const CITY_RATES = {
  Lahore: {
    SLOT_PRICE_PKR: {
      6: 15000,
      12: 30000,
    },
    SLOT_DISTANCE_CAP_KM: {
      6: 100,
      12: 160,
    },
  },
  Karachi: {
    SLOT_PRICE_PKR: {
      6: 17000,
      12: 30000,
    },
    SLOT_DISTANCE_CAP_KM: {
      6: 100,
      12: 160,
    },
  },
};

export function normalizeDuration(duration) {
  const value = Number(duration);
  if (value === 6 || value === 12) return value;
  return 6;
}

export function getSlotPrice(duration, city = null) {
  const normalized = normalizeDuration(duration);
  if (city && CITY_RATES[city]) {
    return CITY_RATES[city].SLOT_PRICE_PKR[normalized] || SLOT_PRICE_PKR[normalized];
  }
  return SLOT_PRICE_PKR[normalized];
}

export function calculateBookingTotalPkr(duration, city = null, fallbackTotal = null) {
  const normalized = normalizeDuration(duration);
  const price = getSlotPrice(normalized, city);
  if (price) return price;

  const fallback = Number(fallbackTotal);
  return Number.isFinite(fallback) && fallback > 0 ? fallback : null;
}

export function getDistanceCapKm(duration, city = null) {
  const normalized = normalizeDuration(duration);
  if (city && CITY_RATES[city]) {
    return CITY_RATES[city].SLOT_DISTANCE_CAP_KM[normalized] || SLOT_DISTANCE_CAP_KM[normalized];
  }
  return SLOT_DISTANCE_CAP_KM[normalized];
}