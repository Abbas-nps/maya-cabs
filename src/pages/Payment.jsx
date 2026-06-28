import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";
import { supabase } from "../supabase";
import { calculateBookingTotalPkr, getDistanceCapKm, normalizeDuration } from "../lib/pricing";
import { SELECTED_CITY_KEY } from "./CitySelect";

// ── Replace with Maya Cabs WhatsApp number (with country code, no + or spaces) ──
const WHATSAPP_NUMBER = "923396292222";
const PENDING_BOOKING_QUEUE_KEY = "mayaCabsPendingBookingQueue";
const DEFAULT_DRIVER_NAME = "Kaabish";
const DEFAULT_VEHICLE_NAME = "2019 Nissan Clipper WAV";
const DEFAULT_OPERATOR_NAME = "New Pak Surgical";
const MIN_SLOT_GAP_HOURS = 2;

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DOW = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function formatDate(ds) {
  if (!ds) return "—";
  const d = new Date(ds + "T00:00:00");
  return `${DOW[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

function buildWhatsAppMessage(booking, selectedCity) {
  const city = booking.city || selectedCity || "—";
  const duration = normalizeDuration(booking.duration);
  const distanceCapKm = getDistanceCapKm(duration, selectedCity);
  const total = calculateBookingTotalPkr(booking.duration, selectedCity, booking.total);
  const date = formatDate(booking.date);
  const timeSlot = booking.slotTime && booking.slotEnd
    ? `${booking.slotTime} to ${booking.slotEnd}`
    : "—";
  const passenger = booking.fullName || "—";
  const phone = booking.phone || "—";
  const wheelchair =
    booking.wheelchairType === "standard"
      ? "Standard Width (under 28 inches)"
      : booking.wheelchairType === "wide"
      ? "Wide / Power Chair (28 inches and above - on-call confirmation required)"
      : "—";

  return (
    `Hello Maya Cabs, I would like to confirm a booking:\n\n` +
    `🏙️ City: ${city}\n` +
    `📅 Date: ${date}\n` +
    `⏰ Time: ${timeSlot}\n` +
    `⌛ Duration: Exactly ${duration} hours\n` +
    `📏 Distance Cap: ${distanceCapKm} km (city-only use)\n` +
    `♿ Wheelchair: ${wheelchair}\n` +
    `� Pickup: ${booking.pickup || "—"}\n` +
    `🏁 Destination: ${booking.destination || "—"}\n` +
    `🔄 Trip Type: ${booking.tripType === "wait-return" ? "Wait & Return" : "One-Way"}\n` +
    `�👤 Passenger: ${passenger}\n` +
    `📞 Phone: ${phone}\n` +
    `💰 Total: ${total ? `PKR ${Number(total).toLocaleString()}` : "—"} (prepaid)\n` +
    `⚠️ No extensions allowed.\n\n` +
    `Please confirm availability. Thank you!`
  );
}

function buildBookingPayload(booking, total, selectedCity) {
  return {
    passenger_name: booking.fullName || null,
    passenger_phone: booking.phone || null,
    city: booking.city || selectedCity || null,
    pickup: booking.pickup || null,
    destination: booking.destination || null,
    trip_type: booking.tripType || null,
    wheelchair_type: booking.wheelchairType || null,
    booking_date: booking.date || null,
    slot_time: booking.slotTime || null,
    slot_end: booking.slotEnd || null,
    duration: booking.duration ? Number(booking.duration) : null,
    total_pkr: total,
    driver_name: DEFAULT_DRIVER_NAME,
    vehicle_name: DEFAULT_VEHICLE_NAME,
    operator_name: DEFAULT_OPERATOR_NAME,
    status: "pending",
  };
}

function bookingQueueKey(payload) {
  return [payload.passenger_phone, payload.booking_date, payload.slot_time, payload.duration].join("|");
}

function readPendingQueue() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_BOOKING_QUEUE_KEY) || "[]");
  } catch {
    return [];
  }
}

function writePendingQueue(items) {
  localStorage.setItem(PENDING_BOOKING_QUEUE_KEY, JSON.stringify(items));
}

function enqueuePendingBooking(payload) {
  const items = readPendingQueue();
  const key = bookingQueueKey(payload);
  const withoutSame = items.filter((item) => bookingQueueKey(item.payload || {}) !== key);
  withoutSame.push({ payload, queuedAt: new Date().toISOString() });
  writePendingQueue(withoutSame);
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseHourLabel(label) {
  const match = String(label || "").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = String(match[3]).toUpperCase();
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || minutes !== 0) return null;

  let hour24 = hours % 12;
  if (suffix === "PM") hour24 += 12;
  return hour24;
}

function getBookingWindow(dateStr, bookingRow) {
  const startHour = parseHourLabel(bookingRow?.slot_time);
  if (startHour === null) return null;

  const start = new Date(`${dateStr}T${String(startHour).padStart(2, "0")}:00:00`);

  const endHour = parseHourLabel(bookingRow?.slot_end);
  if (endHour !== null) {
    const end = new Date(start);
    end.setHours(endHour, 0, 0, 0);
    if (end.getTime() <= start.getTime()) end.setDate(end.getDate() + 1);
    return { start, end };
  }

  const durationHours = normalizeDuration(bookingRow?.duration);
  const end = new Date(start);
  end.setHours(end.getHours() + durationHours);
  return { start, end };
}

function hasSlotConflictWithGap(startA, endA, startB, endB, gapHours = MIN_SLOT_GAP_HOURS) {
  const startAMs = startA.getTime();
  const endAMs = endA.getTime() + gapHours * 60 * 60 * 1000;
  const startBMs = startB.getTime();
  const endBMs = endB.getTime() + gapHours * 60 * 60 * 1000;
  return startAMs < endBMs && startBMs < endAMs;
}

function hasMissingAssignmentColumn(error) {
  const message = String(error?.message || "");
  return (
    /column .*driver_name.* does not exist/i.test(message)
    || /column .*vehicle_name.* does not exist/i.test(message)
    || /column .*operator_name.* does not exist/i.test(message)
    || /column .*city.* does not exist/i.test(message)
    || /Could not find the 'driver_name' column/i.test(message)
    || /Could not find the 'vehicle_name' column/i.test(message)
    || /Could not find the 'operator_name' column/i.test(message)
    || /Could not find the 'city' column/i.test(message)
  );
}

function stripAssignmentFields(payload) {
  const {
    driver_name,
    vehicle_name,
    operator_name,
    city,
    ...legacyPayload
  } = payload;

  return legacyPayload;
}

async function insertBookingWithRetry(payload, maxAttempts = 3) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const { error } = await supabase.from("bookings").insert(payload);
    if (!error) return { ok: true, error: null };

    if (hasMissingAssignmentColumn(error)) {
      const legacyPayload = stripAssignmentFields(payload);
      const { error: legacyError } = await supabase.from("bookings").insert(legacyPayload);
      if (!legacyError) return { ok: true, error: null, usedLegacySchema: true };
      lastError = legacyError;
    } else {
      lastError = error;
    }

    if (attempt < maxAttempts) await delay(250 * attempt);
  }
  return { ok: false, error: lastError };
}

async function flushPendingQueue() {
  const items = readPendingQueue();
  if (!items.length) return { sent: 0, kept: 0 };

  const remaining = [];
  let sent = 0;
  for (const item of items) {
    const payload = item?.payload;
    if (!payload) continue;
    const { ok } = await insertBookingWithRetry(payload, 2);
    if (ok) sent += 1;
    else remaining.push(item);
  }

  writePendingQueue(remaining);
  return { sent, kept: remaining.length };
}

function openWhatsAppContact(encodedMsg) {
  const appUrl = `whatsapp://send?phone=${WHATSAPP_NUMBER}&text=${encodedMsg}`;
  const webUrl = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodedMsg}`;
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");

  if (isMobile) {
    window.location.href = appUrl;
    window.setTimeout(() => {
      if (!document.hidden) window.location.href = webUrl;
    }, 900);
    return;
  }

  const waTab = window.open(webUrl, "_blank", "noopener,noreferrer");
  if (!waTab) window.location.href = webUrl;
}

export default function Payment({ onBack }) {
  const navigate = useNavigate();
  const { citySlug } = useParams();
  const booking = JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}");
  const [waOpened, setWaOpened] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saveState, setSaveState] = useState("idle"); // idle | saved | queued
  const [selectedCity, setSelectedCity] = useState(null);

  useEffect(() => {
    if (citySlug) {
      const normalized = String(citySlug).trim().toLowerCase();
      if (normalized === "lahore") localStorage.setItem(SELECTED_CITY_KEY, "Lahore");
      if (normalized === "karachi") localStorage.setItem(SELECTED_CITY_KEY, "Karachi");
    }
    const city = localStorage.getItem(SELECTED_CITY_KEY) || null;
    setSelectedCity(city);
  }, [citySlug]);

  const duration = normalizeDuration(booking.duration);
  const distanceCapKm = getDistanceCapKm(duration, selectedCity);
  const total = calculateBookingTotalPkr(booking.duration, selectedCity, booking.total);
  const date = formatDate(booking.date);
  const timeSlot =
    booking.slotTime && booking.slotEnd
      ? `${booking.slotTime} → ${booking.slotEnd}`
      : "—";

  const handleWhatsApp = async () => {
    if (submitting) return;
    setSubmitting(true);
    setSaveState("idle");

    try {
      // Try syncing any previously queued payloads from flaky sessions/devices.
      await flushPendingQueue().catch(() => {});

      if (booking.date && booking.slotTime) {
        const holdCutoff = new Date(Date.now() - 120 * 60 * 1000).toISOString();
        const cityForCheck = booking.city || selectedCity;

        let existingBookingsQuery = supabase
          .from("bookings")
          .select("id, duration, slot_time, slot_end, status, created_at")
          .eq("booking_date", booking.date)
          .neq("status", "cancelled")
          .or(`status.neq.pending,created_at.gte.${holdCutoff}`);

        if (cityForCheck) {
          existingBookingsQuery = existingBookingsQuery.eq("city", cityForCheck);
        }

        const { data: existingRows, error: existingError } = await existingBookingsQuery;

        if (existingError) {
          console.error("Supabase restriction check error:", existingError.message);
        }

        const activeRows = (existingRows || []).filter(
          (row) => row.status === "pending" || row.status === "confirmed" || row.status === "completed"
        );
        const requestedWindow = getBookingWindow(booking.date, {
          slot_time: booking.slotTime,
          slot_end: booking.slotEnd,
          duration: booking.duration,
        });

        if (!requestedWindow) {
          alert("Selected time is invalid. Please choose your slot again.");
          return;
        }

        const hasConflict = activeRows.some((row) => {
          const existingWindow = getBookingWindow(booking.date, row);
          if (!existingWindow) return false;
          return hasSlotConflictWithGap(
            requestedWindow.start,
            requestedWindow.end,
            existingWindow.start,
            existingWindow.end
          );
        });

        if (hasConflict) {
          alert("This slot is no longer available. Please select another start time from the Schedule page.");
          return;
        }
      }

      const payload = buildBookingPayload(booking, total, selectedCity);
      const saveResult = await insertBookingWithRetry(payload, 3);
      if (!saveResult.ok) {
        enqueuePendingBooking(payload);
        setSaveState("queued");
      } else {
        setSaveState("saved");
      }

      // Open WhatsApp without relying on popup permissions.
      const msg = encodeURIComponent(buildWhatsAppMessage(booking, selectedCity));
      openWhatsAppContact(msg);
      setWaOpened(true);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    flushPendingQueue().catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar
        title="Complete Booking"
        subtitle="Confirm via WhatsApp"
        showBack
        onBack={onBack || (() => navigate(-1))}
      />
      <Stepper current={5} />

      <main className="flex-1 px-4 pt-5 pb-36">
        <h2 className="text-slate-900 font-extrabold text-2xl mb-1">Almost there!</h2>
        <p className="text-slate-500 text-sm mb-5">
          Send your booking request via WhatsApp and we'll confirm within 30 minutes.
        </p>

        {/* Booking summary */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="bg-teal-700 px-4 py-3">
            <span className="font-bold text-white text-base">Your Booking Summary</span>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            <SummaryRow icon="📅" label="Date" value={date} />
            <SummaryRow icon="⏰" label="Time" value={timeSlot} />
            <SummaryRow icon="⌛" label="Duration" value={`${duration} hours`} />
            <SummaryRow icon="📏" label="Distance Cap" value={`${distanceCapKm} km`} />
            <SummaryRow icon="👤" label="Passenger" value={booking.fullName || "—"} />
            <SummaryRow icon="📍" label="Pickup" value={booking.pickup || "—"} />
            <SummaryRow icon="🏁" label="To" value={booking.destination || "—"} />
            <SummaryRow icon="🔄" label="Trip" value={booking.tripType === "wait-return" ? "Wait & Return" : "One-Way"} />
            <SummaryRow icon="♿" label="Wheelchair" value={
              booking.wheelchairType === "standard" ? "Standard Width" :
              booking.wheelchairType === "wide" ? "Wide / Power Chair" : "—"
            } />
            <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
              <span className="text-slate-500 text-sm">Total (prepaid)</span>
              <span className="font-extrabold text-teal-700 text-xl">
                {total ? `PKR ${Number(total).toLocaleString()}` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Payment method card */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 py-4 flex items-start gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#16a34a" strokeWidth={1.8}>
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <path d="M2 10h20" strokeLinecap="round" />
                <path d="M6 15h4" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-slate-900 text-base mb-0.5">Prepaid Booking</div>
              <div className="text-slate-500 text-xs leading-relaxed">
                Payment is made in advance to secure your booking. Your ride is confirmed once payment is received.
              </div>
            </div>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-2">
            <div className="font-bold text-slate-900 text-sm mb-3">How it works</div>
            <div className="flex flex-col gap-3">
              {[
                { n: "1", text: "Tap the WhatsApp button below to send your booking details" },
                { n: "2", text: "Maya Cabs confirms availability within 30 minutes" },
                { n: "3", text: "Complete your prepaid payment to confirm the booking" },
                { n: "4", text: "Driver contacts you 30 minutes before your scheduled pickup" },
                { n: "5", text: "Slots are fixed. No extensions are allowed after slot end time" },
              ].map((s) => (
                <div key={s.n} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-teal-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {s.n}
                  </span>
                  <span className="text-slate-600 text-sm leading-snug">{s.text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-4 pb-4" />
        </div>

        {/* Success state */}
        {waOpened && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-4 py-4 flex items-start gap-3 mb-4">
            <svg viewBox="0 0 20 20" width={20} height={20} fill="none" className="flex-shrink-0 mt-0.5">
              <circle cx="10" cy="10" r="9" fill="#16a34a" />
              <path d="M5 10l3.5 3.5L15 7" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <div className="font-bold text-green-800 text-sm">WhatsApp opened</div>
              <div className="text-green-700 text-xs mt-0.5">
                Please tap Send inside WhatsApp to submit your booking request.
              </div>
              {saveState === "saved" && (
                <div className="text-green-700 text-xs mt-1">Booking saved to Maya Cabs system.</div>
              )}
              {saveState === "queued" && (
                <div className="text-amber-700 text-xs mt-1">
                  Booking is queued locally and will auto-sync when network is stable.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-40">
        {!waOpened ? (
          <>
            <button
              className="w-full bg-green-600 text-white font-bold text-base rounded-2xl py-4 hover:bg-green-700 transition flex items-center justify-center gap-3 disabled:bg-green-400 disabled:cursor-not-allowed"
              onClick={handleWhatsApp}
              disabled={submitting}
            >
              {/* WhatsApp icon */}
              <svg viewBox="0 0 24 24" width={22} height={22} fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              {submitting ? "Saving Booking..." : "Send Booking via WhatsApp"}
            </button>
            <p className="text-slate-400 text-xs text-center mt-2">
              Opens WhatsApp chat with Maya Cabs (+92 339 6292222). Booking is saved to backend with retry + fail-safe queue.
            </p>
          </>
        ) : (
          <>
            <button
              className="w-full bg-green-600 text-white font-bold text-base rounded-2xl py-4 hover:bg-green-700 transition flex items-center justify-center gap-3 mb-2"
              onClick={handleWhatsApp}
            >
              <svg viewBox="0 0 24 24" width={20} height={20} fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Open WhatsApp Again
            </button>
            <button
              className="w-full bg-teal-700 text-white font-bold text-base rounded-2xl py-3 hover:bg-teal-800 transition"
              onClick={() => {
                localStorage.removeItem("mayaCabsBooking");
                navigate("/home");
              }}
            >
              Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-6 text-center flex-shrink-0">{icon}</span>
      <span className="text-slate-500 text-sm flex-shrink-0 w-20">{label}</span>
      <span className="font-semibold text-slate-800 text-sm">{value}</span>
    </div>
  );
}
