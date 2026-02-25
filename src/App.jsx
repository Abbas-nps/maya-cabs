import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";

/**
 * Maya Cabs – Booking & Slot Availability (v1 Operational)
 * -------------------------------------------------------
 * Rules:
 * - Slot size: 60 minutes
 * - Min booking: 2 hours, customer can select 2/3/4 hours
 * - Travel buffer: 1 hour auto-blocked after every booking (hold/book)
 * - Booking window: up to 3 days ahead
 * - Same-day: must be at least 3 hours in advance
 * - Price: PKR 2,500 per hour, includes 30km per hour
 * - Payment: bank transfer
 * - Hold expiry: 15 minutes (auto releases if not confirmed)
 * - Admin PIN: 2580 (payment confirmation + manual controls)
 * - Required confirmations: wheelchair width < 29", ToS agreement (non-ambulance, no critical care, no oxygen cylinders)
 * - Cancellation: non-refundable within 4 hours; PKR 2,500 deduction on all refunds
 * - WhatsApp share to: 0339-629-2222
 *
 * Note: This prototype uses localStorage per device. For multi-device shared availability,
 * connect to a shared backend (Supabase/Firebase) next.
 */

const BUSINESS_TZ = "Asia/Karachi";

// Ops config
const START_HOUR = 7; // 07:00
const END_HOUR = 23; // last slot starts 22:00
const MIN_HOURS = 2;
const MAX_HOURS_OPTIONS = [2, 3, 4];
const BUFFER_HOURS = 1;

const MAX_DAYS_AHEAD = 3; // including today
const SAME_DAY_MIN_ADVANCE_HOURS = 3;

const PRICE_PER_HOUR_PKR = 2500;
const INCLUDED_KM_PER_HOUR = 30;

const HOLD_EXPIRY_MINUTES = 15;

const WHATSAPP_NUMBER = "03396292222"; // no dashes for wa.me
const ADMIN_PIN = "2580";

// ====== Responsive settings (change these if you want) ======
const MOBILE_BREAKPOINT_PX = 900;
// Choose how many columns the slot grid should have on mobile:
// 1 = big buttons, 2 = more compact
const MOBILE_SLOT_COLUMNS = 1; // <-- change to 2 if you want

// Helpers
function pad2(n) {
  return String(n).padStart(2, "0");
}

function isoDateLocal(d) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function parseISODateToLocalMidnight(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function formatTimeLabel(hour, minute) {
  const h12 = ((hour + 11) % 12) + 1;
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${h12}:${pad2(minute)} ${ampm}`;
}

function buildSlots() {
  const slots = [];
  for (let h = START_HOUR; h < END_HOUR; h++) {
    const id = `${pad2(h)}:00`;
    slots.push({
      id,
      hour: h,
      label: `${formatTimeLabel(h, 0)} – ${formatTimeLabel(h + 1, 0)}`,
    });
  }
  return slots;
}

const ALL_SLOTS = buildSlots();

function storageKey(dateStr) {
  return `mayacabs_v1_${dateStr}`;
}

function badgeStyle(status) {
  const common = {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 900,
    lineHeight: "12px",
    whiteSpace: "nowrap",
  };
  if (status === "AVAILABLE") return { ...common, background: "#e5e7eb", color: "#111827" };
  if (status === "HELD") return { ...common, background: "#3b82f6", color: "white" };
  if (status === "BOOKED") return { ...common, background: "#ef4444", color: "white" };
  if (status === "BLOCKED") return { ...common, background: "#111827", color: "white" };
  return { ...common, background: "#e5e7eb", color: "#111827" };
}

function slotButtonStyle(status) {
  const base = {
    width: "100%",
    textAlign: "left",
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(0,0,0,0.12)",
    background: "white",
    cursor: "pointer",
  };
  if (status === "BOOKED") return { ...base, borderColor: "rgba(239,68,68,0.6)" };
  if (status === "HELD") return { ...base, borderColor: "rgba(59,130,246,0.6)" };
  if (status === "BLOCKED") return { ...base, borderColor: "rgba(17,24,39,0.6)" };
  return base;
}

function Card({ children, style }) {
  return (
    <div
      style={{
        border: "1px solid rgba(0,0,0,0.12)",
        borderRadius: 16,
        background: "white",
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, disabled, variant = "primary", style, type = "button" }) {
  const base = {
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(0,0,0,0.12)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    fontWeight: 900,
  };
  const variants = {
    primary: { background: "#111827", color: "white" },
    outline: { background: "white", color: "#111827" },
    danger: { background: "#ef4444", color: "white", border: "1px solid #ef4444" },
    blue: { background: "#3b82f6", color: "white", border: "1px solid #3b82f6" },
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant], ...style }}>
      {children}
    </button>
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.14)",
        outline: "none",
      }}
    />
  );
}

function TextArea({ value, onChange, placeholder }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={3}
      style={{
        width: "100%",
        padding: "10px 12px",
        borderRadius: 14,
        border: "1px solid rgba(0,0,0,0.14)",
        outline: "none",
        resize: "vertical",
        fontFamily: "inherit",
      }}
    />
  );
}

function nowLocal() {
  return new Date();
}

function diffHours(a, b) {
  return (b.getTime() - a.getTime()) / (1000 * 60 * 60);
}

function addMinutesISO(minutes) {
  return new Date(Date.now() + minutes * 60 * 1000).toISOString();
}

function formatPKR(n) {
  return `PKR ${n.toLocaleString("en-PK")}`;
}

function buildWhatsAppLink(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

function safeParseJSON(raw, fallback) {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export default function App() {
  // ===== Responsive detection =====
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`)?.matches ?? false;
  });

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT_PX}px)`);
    const apply = () => setIsMobile(!!mq.matches);
    apply();

    if (mq.addEventListener) {
      mq.addEventListener("change", apply);
      return () => mq.removeEventListener("change", apply);
    }
    mq.addListener?.(apply);
    return () => mq.removeListener?.(apply);
  }, []);

  const [dateStr, setDateStr] = useState(() => isoDateLocal(new Date()));
  const [blocks, setBlocks] = useState({});

  // Admin
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPinInput, setAdminPinInput] = useState("");

  // Modal
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Customer form
  const [hours, setHours] = useState(2);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [wheelchairType, setWheelchairType] = useState("");
  const [widthOk, setWidthOk] = useState(false);
  const [tosOk, setTosOk] = useState(false);
  const [cancelPolicyOk, setCancelPolicyOk] = useState(false);

  // Supabase auth session (for “who am I signed in as?”)
  const [session, setSession] = useState(null);
  const userEmail = session?.user?.email || "";

  // (kept because you had them, even if unused today)
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPass, setAdminPass] = useState("");

  const [lastRequestWhatsAppLink, setLastRequestWhatsAppLink] = useState("");

  // ✅ FIX: Supabase session hookup MUST be a top-level useEffect (not nested)
  useEffect(() => {
    let unsub = null;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!error) setSession(data?.session ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess ?? null);
    });

    unsub = () => listener?.subscription?.unsubscribe?.();

    return () => {
      try {
        unsub?.();
      } catch {}
    };
  }, []);

  // Load day (localStorage)
  useEffect(() => {
    const raw = localStorage.getItem(storageKey(dateStr));
    setBlocks(safeParseJSON(raw, {}));
    setLastRequestWhatsAppLink("");
    setSelectedSlot(null);
    setModalOpen(false);
  }, [dateStr]);

  function persist(nextBlocks) {
    setBlocks(nextBlocks);
    localStorage.setItem(storageKey(dateStr), JSON.stringify(nextBlocks));
  }

  // Auto-release expired holds every 10 seconds
  useEffect(() => {
    const t = setInterval(() => {
      const current = localStorage.getItem(storageKey(dateStr));
      const dayBlocks = safeParseJSON(current, {});
      let changed = false;

      for (const [slotId, block] of Object.entries(dayBlocks)) {
        if (block?.status === "HELD" && block?.expiresAt) {
          if (Date.now() > new Date(block.expiresAt).getTime()) {
            const bid = block.bookingId;
            for (const [sid2, blk2] of Object.entries(dayBlocks)) {
              if (blk2?.bookingId === bid) {
                delete dayBlocks[sid2];
                changed = true;
              }
            }
          }
        }
      }

      if (changed) {
        localStorage.setItem(storageKey(dateStr), JSON.stringify(dayBlocks));
        setBlocks(dayBlocks);
      }
    }, 10000);

    return () => clearInterval(t);
  }, [dateStr]);

  function statusOf(slotId) {
    return blocks[slotId]?.status || "AVAILABLE";
  }

  const unavailableCount = useMemo(() => {
    return Object.values(blocks).filter((b) => b?.status && b.status !== "AVAILABLE").length;
  }, [blocks]);

  const todayStr = isoDateLocal(nowLocal());

  function isDateWithinWindow(targetDateStr) {
    const today = parseISODateToLocalMidnight(todayStr);
    const target = parseISODateToLocalMidnight(targetDateStr);
    const daysAhead = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysAhead >= 0 && daysAhead <= MAX_DAYS_AHEAD - 1;
  }

  function isEntireDateBookable(targetDateStr) {
    const now = nowLocal();
    if (!isDateWithinWindow(targetDateStr)) return false;
    if (targetDateStr !== todayStr) return true;

    for (const slot of ALL_SLOTS) {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slot.hour, 0, 0, 0);
      const hrs = diffHours(now, start);
      if (hrs >= SAME_DAY_MIN_ADVANCE_HOURS) return true;
    }
    return false;
  }

  function getNextValidDate(startDateStr) {
    let testDate = parseISODateToLocalMidnight(startDateStr);
    for (let i = 0; i < 5; i++) {
      const dStr = isoDateLocal(testDate);
      if (isEntireDateBookable(dStr)) return dStr;
      testDate.setDate(testDate.getDate() + 1);
    }
    return startDateStr;
  }

  useEffect(() => {
    if (!isEntireDateBookable(dateStr)) {
      const next = getNextValidDate(dateStr);
      if (next !== dateStr) {
        setDateStr(next);
        alert("No remaining bookable slots on that date. Showing the next available date.");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateStr]);

  function isStartTimeAllowed(targetDateStr, slotHour) {
    const now = nowLocal();

    if (!isDateWithinWindow(targetDateStr)) return { ok: false, reason: "Bookings are allowed up to 3 days ahead only." };

    if (targetDateStr !== todayStr) {
      return { ok: true, reason: "" };
    }

    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), slotHour, 0, 0, 0);
    const hrs = diffHours(now, start);
    if (hrs < SAME_DAY_MIN_ADVANCE_HOURS) {
      return { ok: false, reason: `Same-day bookings must be at least ${SAME_DAY_MIN_ADVANCE_HOURS} hours in advance.` };
    }
    return { ok: true, reason: "" };
  }

  function blockPlanFromStart(slotId, hoursSelected) {
    const startIndex = ALL_SLOTS.findIndex((s) => s.id === slotId);
    if (startIndex < 0) return { ok: false, reason: "Invalid start slot.", rideSlots: [], bufferSlots: [] };

    const rideSlots = ALL_SLOTS.slice(startIndex, startIndex + hoursSelected);
    if (rideSlots.length < hoursSelected) {
      return { ok: false, reason: "Not enough time left in the day for this duration.", rideSlots, bufferSlots: [] };
    }

    const bufferSlots = ALL_SLOTS.slice(startIndex + hoursSelected, startIndex + hoursSelected + BUFFER_HOURS);
    return { ok: true, reason: "", rideSlots, bufferSlots };
  }

  function isPlanAvailable(plan) {
    const rideBusy = plan.rideSlots.some((s) => statusOf(s.id) !== "AVAILABLE");
    if (rideBusy) return { ok: false, reason: "Selected duration overlaps with an unavailable slot." };

    const bufferBusy = plan.bufferSlots.some((s) => statusOf(s.id) !== "AVAILABLE");
    if (bufferBusy) return { ok: false, reason: "Travel buffer overlaps with an unavailable slot. Choose a different start time." };

    return { ok: true, reason: "" };
  }

  function openSlot(slot) {
    setSelectedSlot(slot);
    setModalOpen(true);
    setLastRequestWhatsAppLink("");
    setHours(2);
  }

  function resetForm() {
    setHours(2);
    setFullName("");
    setPhone("");
    setPickup("");
    setDropoff("");
    setWheelchairType("");
    setWidthOk(false);
    setTosOk(false);
    setCancelPolicyOk(false);
  }

  function createBookingId() {
    return `B-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }

  function customerSubmitHold() {
    if (!selectedSlot) return;

    const startAllow = isStartTimeAllowed(dateStr, selectedSlot.hour);
    if (!startAllow.ok) {
      alert(startAllow.reason);
      return;
    }

    if (!fullName.trim() || !phone.trim() || !pickup.trim() || !dropoff.trim() || !wheelchairType.trim()) {
      alert("Please fill all required fields.");
      return;
    }
    if (!widthOk) {
      alert('Wheelchair width confirmation is required (must be under 29").');
      return;
    }
    if (!tosOk) {
      alert("Please agree to the Terms of Service.");
      return;
    }
    if (!cancelPolicyOk) {
      alert("Please agree to the Cancellation Policy.");
      return;
    }
    if (!MAX_HOURS_OPTIONS.includes(hours) || hours < MIN_HOURS) {
      alert("Invalid duration.");
      return;
    }

    const plan = blockPlanFromStart(selectedSlot.id, hours);
    if (!plan.ok) {
      alert(plan.reason);
      return;
    }

    const avail = isPlanAvailable(plan);
    if (!avail.ok) {
      alert(avail.reason);
      return;
    }

    const bookingId = createBookingId();
    const createdAt = new Date().toISOString();
    const expiresAt = addMinutesISO(HOLD_EXPIRY_MINUTES);

    const next = { ...blocks };

    for (const s of plan.rideSlots) {
      next[s.id] = {
        status: "HELD",
        kind: "RIDE",
        bookingId,
        startSlotId: selectedSlot.id,
        hours,
        name: fullName.trim(),
        phone: phone.trim(),
        pickup: pickup.trim(),
        dropoff: dropoff.trim(),
        wheelchairType: wheelchairType.trim(),
        widthOk: true,
        tosOk: true,
        cancelPolicyOk: true,
        createdAt,
        expiresAt,
      };
    }

    for (const s of plan.bufferSlots) {
      next[s.id] = {
        status: "BLOCKED",
        kind: "BUFFER",
        bookingId,
        startSlotId: selectedSlot.id,
        hours,
        createdAt,
      };
    }

    persist(next);

    const totalPrice = hours * PRICE_PER_HOUR_PKR;
    const includedKm = hours * INCLUDED_KM_PER_HOUR;
    const startLabel = selectedSlot.label;

    const msg =
      `Maya Cabs Booking Request (Lahore)\n` +
      `Date: ${dateStr}\n` +
      `Start: ${startLabel}\n` +
      `Duration: ${hours} hour(s)\n` +
      `Price: ${formatPKR(totalPrice)} (includes ${includedKm}km)\n\n` +
      `Name: ${fullName.trim()}\n` +
      `Phone: ${phone.trim()}\n` +
      `Pickup: ${pickup.trim()}\n` +
      `Drop-off: ${dropoff.trim()}\n` +
      `Wheelchair type: ${wheelchairType.trim()}\n` +
      `Wheelchair width < 29": Yes\n\n` +
      `Payment: Bank Transfer (please share receipt)\n` +
      `Note: Driver will contact later for WhatsApp pin location.\n` +
      `Booking ID: ${bookingId}`;

    setLastRequestWhatsAppLink(buildWhatsAppLink(msg));
    setModalOpen(false);
    resetForm();
  }

  function adminUnlock() {
    if (adminPinInput.trim() === ADMIN_PIN) {
      setAdminUnlocked(true);
      setAdminPinInput("");
    } else {
      alert("Incorrect PIN.");
    }
  }

  function adminLock() {
    setAdminUnlocked(false);
    setAdminPinInput("");
  }

  function findBookingIdForSlot(slotId) {
    const blk = blocks[slotId];
    return blk?.bookingId || "";
  }

  function adminConfirmPaymentForStart(slotId, hoursSelected) {
    const plan = blockPlanFromStart(slotId, hoursSelected);
    if (!plan.ok) {
      alert(plan.reason);
      return;
    }

    const bookingId = findBookingIdForSlot(slotId);
    if (!bookingId) {
      alert("No booking found on this slot.");
      return;
    }

    const next = { ...blocks };

    for (const [sid, blk] of Object.entries(next)) {
      if (blk?.bookingId === bookingId) {
        if (blk.kind === "RIDE") {
          next[sid] = { ...blk, status: "BOOKED", expiresAt: undefined };
        } else if (blk.kind === "BUFFER") {
          next[sid] = { ...blk, status: "BLOCKED" };
        }
      }
    }

    persist(next);
    alert("Payment confirmed. Booking marked as BOOKED.");
  }

  function adminReleaseBooking(slotId) {
    const bookingId = findBookingIdForSlot(slotId);
    if (!bookingId) {
      alert("No booking found on this slot.");
      return;
    }
    const next = { ...blocks };
    for (const [sid, blk] of Object.entries(next)) {
      if (blk?.bookingId === bookingId) delete next[sid];
    }
    persist(next);
    alert("Booking released (ride + buffer cleared).");
  }

  function adminBlockMaintenance(slotId, hoursSelected) {
    const plan = blockPlanFromStart(slotId, hoursSelected);
    if (!plan.ok) {
      alert(plan.reason);
      return;
    }
    const next = { ...blocks };
    const bookingId = `M-${Date.now()}`;
    const createdAt = new Date().toISOString();

    for (const s of plan.rideSlots) {
      next[s.id] = {
        status: "BLOCKED",
        kind: "RIDE",
        bookingId,
        startSlotId: slotId,
        hours: hoursSelected,
        createdAt,
      };
    }
    for (const s of plan.bufferSlots) {
      next[s.id] = {
        status: "BLOCKED",
        kind: "BUFFER",
        bookingId,
        startSlotId: slotId,
        hours: hoursSelected,
        createdAt,
      };
    }
    persist(next);
    alert("Slots blocked.");
  }

  function adminClearDay() {
    if (!confirm("Clear all bookings/blocks for this date?")) return;
    persist({});
  }

  // ===== Styles (responsive-safe) =====
  const page = { minHeight: "100dvh", background: "#f3f4f6" };
  const container = {
    maxWidth: 1100,
    margin: "0 auto",
    padding: isMobile ? 14 : 18,
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Inter,Arial,sans-serif',
    color: "#111827",
    boxSizing: "border-box",
    overflowX: "hidden",
    overflowWrap: "anywhere",
  };

  const topRow = {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    alignItems: "flex-end",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: isMobile ? "1fr" : "2fr 1fr",
    gap: 16,
  };

  const slotGridCols = isMobile
    ? MOBILE_SLOT_COLUMNS === 2
      ? "repeat(2, minmax(0, 1fr))"
      : "1fr"
    : "repeat(3, minmax(0, 1fr))";
  const slotGrid = { display: "grid", gridTemplateColumns: slotGridCols, gap: 12 };

  const dateWindowOk = isDateWithinWindow(dateStr);
  const dateNote = dateWindowOk
    ? `Bookings allowed up to ${MAX_DAYS_AHEAD} days ahead. Same-day requires ${SAME_DAY_MIN_ADVANCE_HOURS}h advance.`
    : `This date is outside the allowed booking window (max ${MAX_DAYS_AHEAD} days ahead).`;

  return (
    <div style={page}>
      <div style={container}>
        <div style={topRow}>
          <div>
            <h1 style={{ margin: 0, fontSize: 26 }}>Maya Cabs · Booking Slots</h1>
            <div style={{ marginTop: 6, color: "rgba(17,24,39,0.7)", fontSize: 13 }}>
              Lahore only · 1 van · Timezone: {BUSINESS_TZ} · {unavailableCount} slot(s) unavailable
            </div>

            {/* ✅ Shows who you are signed in as */}
            <div style={{ marginTop: 6, color: "rgba(17,24,39,0.7)", fontSize: 12, fontWeight: 900 }}>
              Signed in: {userEmail || "Not signed in"}
            </div>

            <div style={{ marginTop: 6, color: dateWindowOk ? "rgba(17,24,39,0.7)" : "#b91c1c", fontSize: 12, fontWeight: 800 }}>
              {dateNote}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
            <div style={{ minWidth: isMobile ? "100%" : 220 }}>
              <div style={{ fontSize: 12, color: "rgba(17,24,39,0.7)", marginBottom: 6 }}>Select date</div>
              <Input
                type="date"
                value={dateStr}
                onChange={(e) => {
                  const chosen = e.target.value;
                  if (isEntireDateBookable(chosen)) {
                    setDateStr(chosen);
                  } else {
                    const next = getNextValidDate(chosen);
                    setDateStr(next);
                    alert("No remaining bookable slots on that date. Showing the next available date.");
                  }
                }}
              />
            </div>

            <Card style={{ padding: 12, display: "flex", alignItems: "center", gap: 10, width: isMobile ? "100%" : "auto" }}>
              <div style={{ fontSize: 14, fontWeight: 900 }}>Staff/Admin</div>
              {!adminUnlocked ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                  <input
                    value={adminPinInput}
                    onChange={(e) => setAdminPinInput(e.target.value)}
                    placeholder="PIN"
                    inputMode="numeric"
                    style={{
                      width: 90,
                      padding: "10px 12px",
                      borderRadius: 14,
                      border: "1px solid rgba(0,0,0,0.14)",
                      outline: "none",
                      fontWeight: 900,
                    }}
                  />
                  <Button variant="primary" onClick={adminUnlock}>
                    Unlock
                  </Button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span style={badgeStyle("BOOKED")}>Unlocked</span>
                  <Button variant="outline" onClick={adminLock}>
                    Lock
                  </Button>
                </div>
              )}
            </Card>
          </div>
        </div>

        <div style={{ height: 14 }} />

        <div style={grid}>
          {/* Slots */}
          <Card style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <div style={{ fontSize: 18, fontWeight: 1000 }}>Slots</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={badgeStyle("AVAILABLE")}>Available</span>
                <span style={badgeStyle("HELD")}>On Hold (15 min)</span>
                <span style={badgeStyle("BOOKED")}>Booked</span>
                <span style={badgeStyle("BLOCKED")}>Blocked (buffer/ops)</span>
              </div>
            </div>

            <div style={{ marginTop: 10, fontSize: 12, color: "rgba(17,24,39,0.7)" }}>
              Clicking a slot selects a <b>start time</b>. Minimum booking: <b>2 hours</b> + auto <b>1 hour buffer</b>.
            </div>

            <div style={{ height: 12 }} />

            <div style={slotGrid}>
              {ALL_SLOTS.map((slot) => {
                const st = statusOf(slot.id);
                const blk = blocks[slot.id];
                const label2 =
                  st === "AVAILABLE"
                    ? "Open"
                    : st === "HELD"
                    ? `Hold · ${blk?.name ? blk.name : "Pending"}`
                    : st === "BOOKED"
                    ? `Booked · ${blk?.name ? blk.name : ""}`
                    : blk?.kind === "BUFFER"
                    ? "Blocked · Buffer"
                    : "Blocked";

                const startAllow = isStartTimeAllowed(dateStr, slot.hour);
                const disabledByRule = !startAllow.ok;

                return (
                  <button
                    key={slot.id}
                    onClick={() => openSlot(slot)}
                    disabled={disabledByRule && !adminUnlocked}
                    title={disabledByRule && !adminUnlocked ? startAllow.reason : ""}
                    style={{
                      ...slotButtonStyle(st),
                      opacity: disabledByRule && !adminUnlocked ? 0.45 : 1,
                      cursor: disabledByRule && !adminUnlocked ? "not-allowed" : "pointer",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                      <div>
                        <div style={{ fontWeight: 1000, fontSize: 13 }}>{slot.label}</div>
                        <div style={{ marginTop: 4, fontSize: 12, color: "rgba(17,24,39,0.7)" }}>{label2}</div>
                      </div>
                      <span style={badgeStyle(st)}>
                        {st === "AVAILABLE" ? "Available" : st === "HELD" ? "On Hold" : st === "BOOKED" ? "Booked" : "Blocked"}
                      </span>
                    </div>

                    {st === "HELD" && blk?.expiresAt ? (
                      <div style={{ marginTop: 8, fontSize: 11, color: "rgba(17,24,39,0.65)" }}>
                        Expires: {new Date(blk.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    ) : null}
                  </button>
                );
              })}
            </div>

            {adminUnlocked ? (
              <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: "rgba(17,24,39,0.7)" }}>Admin can override time rules (same-day advance / window).</div>
                <Button variant="danger" onClick={adminClearDay}>
                  Clear day
                </Button>
              </div>
            ) : null}
          </Card>

          {/* Side panel */}
          <Card style={{ padding: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 1000 }}>Pricing & Rules</div>
            <div style={{ height: 10 }} />

            <div style={{ fontSize: 13, color: "rgba(17,24,39,0.78)", lineHeight: 1.55 }}>
              <div>
                <b>Rate:</b> {formatPKR(PRICE_PER_HOUR_PKR)} / hour
              </div>
              <div>
                <b>Included:</b> {INCLUDED_KM_PER_HOUR}km per hour
              </div>
              <div style={{ marginTop: 8 }}>
                <b>Minimum booking:</b> {MIN_HOURS} hours
              </div>
              <div>
                <b>Travel buffer:</b> {BUFFER_HOURS} hour auto-blocked after every booking
              </div>
              <div style={{ marginTop: 8 }}>
                <b>Hold:</b> {HOLD_EXPIRY_MINUTES} minutes pending bank transfer confirmation
              </div>
              <div style={{ marginTop: 8 }}>
                <b>Cancellation:</b> Non-refundable if less than <b>4 hours</b> left. <b>{formatPKR(2500)}</b> deduction on all refunds.
              </div>
              <div style={{ marginTop: 12, fontSize: 12, color: "rgba(17,24,39,0.65)" }}>
                Maya Cabs is <b>non-ambulance</b>. We refuse service for critical/life-saving/critical-care needs and users with oxygen cylinders.
              </div>
            </div>

            {lastRequestWhatsAppLink ? (
              <div style={{ marginTop: 14, padding: 12, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
                <div style={{ fontWeight: 1000, marginBottom: 8 }}>Send request on WhatsApp</div>
                <Button variant="blue" onClick={() => window.open(lastRequestWhatsAppLink, "_blank")} style={{ width: "100%" }}>
                  WhatsApp 0339-629-2222
                </Button>
                <div style={{ marginTop: 8, fontSize: 12, color: "rgba(17,24,39,0.7)" }}>Share bank transfer receipt in WhatsApp to confirm payment.</div>
              </div>
            ) : (
              <div style={{ marginTop: 14, fontSize: 12, color: "rgba(17,24,39,0.65)" }}>After submitting a request, you’ll get a WhatsApp share button here.</div>
            )}
          </Card>
        </div>

        {/* Modal */}
        {modalOpen && selectedSlot ? (
          <div
            onClick={() => setModalOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.45)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 18,
              zIndex: 50,
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "min(680px, 100%)",
                maxHeight: "min(92dvh, 820px)",
                overflowY: "auto",
                background: "white",
                borderRadius: 18,
                padding: 16,
                border: "1px solid rgba(0,0,0,0.12)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontWeight: 1100, fontSize: 16 }}>{selectedSlot.label}</div>
                  <div style={{ fontSize: 12, color: "rgba(17,24,39,0.7)", marginTop: 6 }}>
                    Select duration (min {MIN_HOURS}h). Travel buffer (+{BUFFER_HOURS}h) is auto-blocked.
                  </div>
                </div>
                <Button variant="outline" onClick={() => setModalOpen(false)}>
                  Close
                </Button>
              </div>

              <div style={{ height: 12 }} />

              {/* Plan preview */}
              {(() => {
                const startAllow = isStartTimeAllowed(dateStr, selectedSlot.hour);
                const plan = blockPlanFromStart(selectedSlot.id, hours);
                const avail = plan.ok ? isPlanAvailable(plan) : { ok: false, reason: plan.reason };

                const totalPrice = hours * PRICE_PER_HOUR_PKR;
                const includedKm = hours * INCLUDED_KM_PER_HOUR;

                return (
                  <div style={{ border: "1px solid rgba(0,0,0,0.12)", borderRadius: 16, padding: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ fontWeight: 1000 }}>Booking summary</div>
                      <span style={badgeStyle(avail.ok ? "AVAILABLE" : "BLOCKED")}>{avail.ok ? "Available" : "Not available"}</span>
                    </div>

                    <div style={{ marginTop: 10, display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Duration</div>
                        <select
                          value={hours}
                          onChange={(e) => setHours(Number(e.target.value))}
                          style={{
                            width: "100%",
                            padding: "10px 12px",
                            borderRadius: 14,
                            border: "1px solid rgba(0,0,0,0.14)",
                            background: "white",
                            fontWeight: 800,
                          }}
                        >
                          {MAX_HOURS_OPTIONS.map((h) => (
                            <option key={h} value={h}>
                              {h} hour(s)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <div style={{ fontSize: 12, fontWeight: 900, marginBottom: 6 }}>Price</div>
                        <div style={{ padding: "10px 12px", borderRadius: 14, border: "1px solid rgba(0,0,0,0.12)", fontWeight: 1000 }}>
                          {formatPKR(totalPrice)}{" "}
                          <span style={{ fontWeight: 700, color: "rgba(17,24,39,0.65)", fontSize: 12 }}>({includedKm}km included)</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ marginTop: 10, fontSize: 12, color: startAllow.ok || adminUnlocked ? "rgba(17,24,39,0.7)" : "#b91c1c", fontWeight: 800 }}>
                      {startAllow.ok || adminUnlocked ? "Timing rule: OK" : startAllow.reason}
                    </div>

                    {!avail.ok ? <div style={{ marginTop: 10, fontSize: 12, color: "#b91c1c", fontWeight: 900 }}>{avail.reason}</div> : null}
                  </div>
                );
              })()}

              <div style={{ height: 12 }} />

              {!adminUnlocked ? (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 900 }}>Full name *</div>
                      <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g., Abbas" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 900 }}>Phone / WhatsApp *</div>
                      <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 900 }}>Pickup address *</div>
                      <TextArea value={pickup} onChange={(e) => setPickup(e.target.value)} placeholder="Area + street + landmark" />
                    </div>
                    <div>
                      <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 900 }}>Drop-off address *</div>
                      <TextArea value={dropoff} onChange={(e) => setDropoff(e.target.value)} placeholder="Hospital / home + landmark" />
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: 12, marginBottom: 6, fontWeight: 900 }}>Wheelchair type *</div>
                    <Input value={wheelchairType} onChange={(e) => setWheelchairType(e.target.value)} placeholder="Manual / Electric / etc." />
                  </div>

                  <div style={{ display: "grid", gap: 8, padding: 12, borderRadius: 16, border: "1px solid rgba(0,0,0,0.12)" }}>
                    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
                      <input type="checkbox" checked={widthOk} onChange={(e) => setWidthOk(e.target.checked)} style={{ marginTop: 3 }} />
                      <span>
                        I confirm my wheelchair <b>width (wheel to wheel)</b> is <b>under 29 inches</b>.
                      </span>
                    </label>

                    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
                      <input type="checkbox" checked={tosOk} onChange={(e) => setTosOk(e.target.checked)} style={{ marginTop: 3 }} />
                      <span>
                        I agree: Maya Cabs is a <b>non-ambulance</b>. We refuse service for <b>critical/life-saving/critical-care</b> needs and users with <b>oxygen cylinders</b>.
                        Driver will contact later for WhatsApp pin location.
                      </span>
                    </label>

                    <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13 }}>
                      <input type="checkbox" checked={cancelPolicyOk} onChange={(e) => setCancelPolicyOk(e.target.checked)} style={{ marginTop: 3 }} />
                      <span>
                        I agree to cancellation policy: <b>non-refundable</b> if less than <b>4 hours</b> remain. <b>{formatPKR(2500)}</b> deduction on all refunds.
                      </span>
                    </label>
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Button variant="primary" onClick={customerSubmitHold} style={{ flex: 1, minWidth: 220 }} disabled={!isDateWithinWindow(dateStr)}>
                      Submit request (15-min hold)
                    </Button>
                    <Button variant="outline" onClick={() => setModalOpen(false)} style={{ minWidth: 160 }}>
                      Cancel
                    </Button>
                  </div>

                  <div style={{ fontSize: 12, color: "rgba(17,24,39,0.7)" }}>After submitting, share bank transfer receipt on WhatsApp to confirm payment.</div>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 10 }}>
                  <div style={{ fontSize: 14, fontWeight: 1000 }}>Admin actions</div>
                  <div style={{ fontSize: 12, color: "rgba(17,24,39,0.7)" }}>
                    Use the start slot to confirm/release the entire booking (ride + buffer).
                  </div>

                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <Button variant="danger" onClick={() => adminConfirmPaymentForStart(selectedSlot.id, hours)}>
                      Confirm payment → Book
                    </Button>

                    <Button variant="outline" onClick={() => adminReleaseBooking(selectedSlot.id)}>
                      Release booking
                    </Button>

                    <Button variant="primary" onClick={() => adminBlockMaintenance(selectedSlot.id, hours)}>
                      Block slots (ops/maintenance)
                    </Button>
                  </div>

                  <div style={{ fontSize: 12, color: "rgba(17,24,39,0.7)" }}>Tip: customer holds expire automatically after {HOLD_EXPIRY_MINUTES} minutes if unpaid.</div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}