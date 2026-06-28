import { supabase } from "../supabase";

export const CUSTOMER_SESSION_KEY = "mayaCabsCustomerSession";

export function normalizeCustomerPhone(phone) {
  const trimmed = String(phone || "").trim();
  if (trimmed.startsWith("+92")) {
    const digits = trimmed.slice(3).replace(/\D/g, "").slice(0, 10);
    return `+92${digits}`;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length >= 12) return `+92${digits.slice(2, 12)}`;
  if (digits.startsWith("0") && digits.length >= 11) return `+92${digits.slice(1, 11)}`;
  if (digits.length <= 10) return `+92${digits}`;
  return `+92${digits.slice(-10)}`;
}

export function formatCustomerPhone(phone) {
  const normalized = normalizeCustomerPhone(phone);
  if (normalized.startsWith("+92") && normalized.length === 13) return normalized;
  return phone || "";
}

export function isValidPakistanPhone(phone) {
  return /^\+92\d{10}$/.test(normalizeCustomerPhone(phone));
}

export function readCustomerSession() {
  try {
    return JSON.parse(localStorage.getItem(CUSTOMER_SESSION_KEY) || "null");
  } catch {
    return null;
  }
}

export function writeCustomerSession(session) {
  localStorage.setItem(CUSTOMER_SESSION_KEY, JSON.stringify(session));
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mayaCabsCustomerSessionChanged"));
  }
}

export function clearCustomerSession() {
  localStorage.removeItem(CUSTOMER_SESSION_KEY);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mayaCabsCustomerSessionChanged"));
  }
}

async function sha256Hex(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashCustomerPin(pin) {
  return sha256Hex(String(pin || ""));
}

function isNetworkFetchError(error) {
  const message = String(error?.message || "");
  return /failed to fetch|networkerror|load failed/i.test(message) || error?.name === "TypeError";
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function rpcWithRetry(functionName, params, attempts = 2) {
  let lastResult = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const result = await supabase.rpc(functionName, params);
      if (!result.error || !isNetworkFetchError(result.error) || attempt === attempts) return result;
      lastResult = result;
      await delay(350 * attempt);
    } catch (error) {
      if (!isNetworkFetchError(error) || attempt === attempts) throw error;
      await delay(350 * attempt);
    }
  }
  return lastResult || { data: null, error: new Error("Network request failed") };
}

export async function signInCustomerProfile(phone, pin) {
  const normalizedPhone = normalizeCustomerPhone(phone);
  const pinHash = await hashCustomerPin(pin);
  const { data, error } = await rpcWithRetry("customer_profile_sign_in", {
    p_phone: normalizedPhone,
    p_pin_hash: pinHash,
  });

  if (error) {
    const message = String(error.message || "");
    if (isNetworkFetchError(error)) {
      throw new Error("Unable to connect right now. Please check internet and try again.");
    }
    if (/ACCOUNT_BANNED/i.test(message)) throw new Error("This account is temporarily banned due to multiple retries. Please try later.");
    if (/ACCOUNT_LOCKED/i.test(message)) throw new Error("Too many failed attempts. Account is temporarily locked.");
    if (/INVALID_CREDENTIALS/i.test(message)) throw new Error("Incorrect PIN. Please try again.");
    if (/does not exist|Could not find the function|relation .* does not exist|PROFILE_NOT_FOUND/i.test(message)) {
      throw new Error("User profile does not exist. Please make a profile.");
    }
    throw error;
  }

  const profile = Array.isArray(data) ? data[0] : data;
  if (!profile) throw new Error("User profile does not exist. Please make a profile.");

  const session = {
    phone: normalizedPhone,
    pinHash,
    profile,
  };
  writeCustomerSession(session);
  return session;
}

export async function upsertCustomerProfile({ phone, pin, pinHash, profile, createOnly = false }) {
  const normalizedPhone = normalizeCustomerPhone(phone);
  const resolvedPinHash = pinHash || (await hashCustomerPin(pin));

  const { data, error } = await rpcWithRetry("customer_profile_upsert", {
    p_phone: normalizedPhone,
    p_pin_hash: resolvedPinHash,
    p_full_name: profile.fullName || null,
    p_wheelchair_type: profile.wheelchairType || null,
    p_pickup: profile.pickup || null,
    p_destination: profile.destination || null,
    p_estimated_distance_km: Number.isFinite(Number(profile.estimatedDistanceKm))
      ? Number(profile.estimatedDistanceKm)
      : null,
    p_trip_type: profile.tripType || null,
    p_create_only: createOnly,
  });

  if (error) {
    const message = String(error.message || "");
    if (isNetworkFetchError(error)) {
      throw new Error("Unable to connect right now. Please check internet and try again.");
    }
    if (/PROFILE_EXISTS/i.test(message)) {
      throw new Error("A profile already exists for this number. Please sign in instead.");
    }
    if (/does not exist|Could not find the function|relation .* does not exist/i.test(message)) {
      throw new Error("User profile does not exist. Please make a profile.");
    }
    throw error;
  }

  const savedProfile = Array.isArray(data) ? data[0] : data;
  const session = {
    phone: normalizedPhone,
    pinHash: resolvedPinHash,
    profile: savedProfile,
  };
  writeCustomerSession(session);
  return session;
}