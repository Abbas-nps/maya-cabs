import React, { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "../supabase";

// ── Simple PIN gate — change this to your preference ──────────────────────────
const ADMIN_PIN = "6667";
const HOLD_MINUTES = 120;

// ── Hold helpers ─────────────────────────────────────────────────────────────
function holdSecondsLeft(createdAt) {
  if (!createdAt) return 0;
  const expiresAt = new Date(createdAt).getTime() + HOLD_MINUTES * 60 * 1000;
  return Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
}
function isActiveHold(booking) {
  return booking.status === "pending" && holdSecondsLeft(booking.created_at) > 0;
}
function isExpiredHold(booking) {
  return booking.status === "pending" && holdSecondsLeft(booking.created_at) === 0;
}

// ── Live countdown badge ──────────────────────────────────────────────────────
function HoldCountdown({ createdAt }) {
  const [secs, setSecs] = useState(() => holdSecondsLeft(createdAt));
  useEffect(() => {
    if (secs <= 0) return;
    const t = setInterval(() => setSecs(holdSecondsLeft(createdAt)), 1000);
    return () => clearInterval(t);
  }, [createdAt, secs]);
  if (secs <= 0) return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-400 border-slate-200">
      Hold expired
    </span>
  );
  const m = Math.floor(secs / 60);
  const s = String(secs % 60).padStart(2, "0");
  return (
    <span className="text-xs font-bold px-2 py-0.5 rounded-full border bg-orange-100 text-orange-700 border-orange-200 flex items-center gap-1">
      🔒 On Hold {m}:{s}
    </span>
  );
}

const STATUS_COLORS = {
  pending:   "bg-amber-100 text-amber-700 border-amber-200",
  confirmed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];
const DEFAULT_DRIVER_NAME = "Kaabish";
const DEFAULT_VEHICLE_NAME = "Nissan Clipper/Suzuki Every";
const DEFAULT_OPERATOR_NAME = "New Pak Surgical";
const VEHICLE_OPTIONS = ["Nissan Clipper/Suzuki Every"];
const OPERATOR_OPTIONS = ["New Pak Surgical", "Gharib Nawaz"];
const OPERATOR_DRIVER_OPTIONS = {
  "New Pak Surgical": ["Taabish"],
  "Gharib Nawaz": ["Muhammad Ibrahim"],
};
const CITY_OPTIONS = ["Lahore", "Karachi"];
const MIN_SLOT_GAP_HOURS = 2;

function normalizeVehicleName(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return DEFAULT_VEHICLE_NAME;
  if (/^2019 Nissan Clipper WAV$/i.test(normalized)) return DEFAULT_VEHICLE_NAME;
  if (/^Nissan Clipper\/Suzuli Every$/i.test(normalized)) return DEFAULT_VEHICLE_NAME;
  return normalized;
}

function getDriverOptionsForOperator(operatorName) {
  const normalized = String(operatorName || "").trim();
  return OPERATOR_DRIVER_OPTIONS[normalized] || [];
}

function getDefaultDriverForOperator(operatorName) {
  const options = getDriverOptionsForOperator(operatorName);
  return options[0] || DEFAULT_DRIVER_NAME;
}

function normalizeDuration(duration) {
  const value = Number(duration);
  if (value === 6 || value === 12) return value;
  return 6;
}

function formatHourLabel(hour24) {
  const normalized = ((Number(hour24) % 24) + 24) % 24;
  const suffix = normalized >= 12 ? "PM" : "AM";
  const hour12 = normalized % 12 === 0 ? 12 : normalized % 12;
  return `${hour12}:00 ${suffix}`;
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

function buildSlotsForDuration(duration) {
  const normalizedDuration = normalizeDuration(duration);
  const latestStart = 24 - normalizedDuration;
  const slots = [];

  for (let startHour = 0; startHour <= latestStart; startHour += 1) {
    const endHour = startHour + normalizedDuration;
    slots.push({
      id: `${normalizedDuration}H_${String(startHour).padStart(2, "0")}`,
      startHour,
      endHour,
      startLabel: formatHourLabel(startHour),
      endLabel: formatHourLabel(endHour),
      title: `${String(startHour).padStart(2, "0")}:00 to ${String(endHour).padStart(2, "0")}:00`,
    });
  }

  return slots;
}

function hasSlotConflictWithGap(startA, endA, startB, endB, gapHours = MIN_SLOT_GAP_HOURS) {
  const startAMs = startA.getTime();
  const endAMs = endA.getTime() + gapHours * 60 * 60 * 1000;
  const startBMs = startB.getTime();
  const endBMs = endB.getTime() + gapHours * 60 * 60 * 1000;
  return startAMs < endBMs && startBMs < endAMs;
}

function isBlockingStatus(status) {
  return status === "pending" || status === "confirmed" || status === "completed";
}

function shouldShowRideNumber(status) {
  return status === "confirmed" || status === "completed";
}

function encodeAlphaNumeric(value) {
  const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let number = 0;
  for (let index = 0; index < value.length; index += 1) {
    number = (number * 31 + value.charCodeAt(index)) >>> 0;
  }

  let output = "";
  let current = number || 1;
  while (output.length < 6) {
    output = chars[current % chars.length] + output;
    current = Math.floor(current / chars.length);
  }
  return output.slice(-6);
}

function getRideNumber(booking) {
  if (!shouldShowRideNumber(booking.status)) return null;
  const datePart = (booking.booking_date || "").replace(/-/g, "").slice(2);
  const source = [booking.id || "", booking.created_at || "", booking.passenger_phone || ""].join("|");
  return `MC${datePart}${encodeAlphaNumeric(source)}`;
}

function getDriverName(booking) {
  const saved = (booking.driver_name || "").trim();
  if (saved) return saved;
  return getDefaultDriverForOperator(getOperatorName(booking));
}

function getVehicleName(booking) {
  return normalizeVehicleName(booking.vehicle_name);
}

function getOperatorName(booking) {
  return (booking.operator_name || "").trim() || DEFAULT_OPERATOR_NAME;
}

function getCityName(booking) {
  const city = String(booking.city || "").trim();
  if (city) return city;

  const addressBlob = `${booking.pickup || ""} ${booking.destination || ""}`.toLowerCase();
  const hasLahore = /\blahore\b/.test(addressBlob);
  const hasKarachi = /\bkarachi\b/.test(addressBlob);

  if (hasLahore && hasKarachi) return "Lahore/Karachi";
  if (hasLahore) return "Lahore";
  if (hasKarachi) return "Karachi";
  return "Lahore";
}

function getAssignmentUpdateError(error) {
  const message = String(error?.message || "");
  if (
    /column .*vehicle_name.* does not exist/i.test(message)
    || /column .*operator_name.* does not exist/i.test(message)
    || /column .*city.* does not exist/i.test(message)
    || /Could not find the 'vehicle_name' column/i.test(message)
    || /Could not find the 'operator_name' column/i.test(message)
    || /Could not find the 'city' column/i.test(message)
  ) {
    return "Some assignment fields are not present in Supabase yet. Run the bookings migration SQL scripts first.";
  }
  return message || "Unable to update assignment.";
}

function hasMissingAssignmentColumn(error) {
  const message = String(error?.message || "");
  return getMissingAssignmentColumns(message).length > 0;
}

function getMissingAssignmentColumns(message) {
  const missing = [];
  if (/column .*driver_name.* does not exist/i.test(message) || /Could not find the 'driver_name' column/i.test(message)) {
    missing.push("driver_name");
  }
  if (/column .*vehicle_name.* does not exist/i.test(message) || /Could not find the 'vehicle_name' column/i.test(message)) {
    missing.push("vehicle_name");
  }
  if (/column .*operator_name.* does not exist/i.test(message) || /Could not find the 'operator_name' column/i.test(message)) {
    missing.push("operator_name");
  }
  if (/column .*city.* does not exist/i.test(message) || /Could not find the 'city' column/i.test(message)) {
    missing.push("city");
  }
  return missing;
}

function stripAssignmentFields(payload, fields = ["driver_name", "vehicle_name", "operator_name", "city"]) {
  const nextPayload = { ...payload };
  fields.forEach((field) => {
    delete nextPayload[field];
  });
  return nextPayload;
}

async function insertBookingRecord(payload) {
  const { data, error } = await supabase
    .from("bookings")
    .insert(payload)
    .select()
    .single();

  if (!error) return { data, error: null };

  if (!hasMissingAssignmentColumn(error)) {
    return { data: null, error };
  }

  const { data: legacyData, error: legacyError } = await supabase
    .from("bookings")
    .insert(stripAssignmentFields(payload))
    .select()
    .single();

  return { data: legacyData || null, error: legacyError || null };
}

async function updateBookingRecord(id, payload) {
  let attemptPayload = { ...payload };
  let latestError = null;

  for (let attempt = 0; attempt < 4; attempt += 1) {
    if (Object.keys(attemptPayload).length === 0) {
      return { data: null, error: latestError || { message: "No assignment fields available to update." } };
    }

    const { data, error } = await supabase
      .from("bookings")
      .update(attemptPayload)
      .eq("id", id)
      .select("*")
      .single();

    if (!error) {
      return { data: data || null, error: null, appliedPayload: attemptPayload };
    }

    latestError = error;
    if (!hasMissingAssignmentColumn(error)) {
      return { data: null, error };
    }

    const missingColumns = getMissingAssignmentColumns(String(error?.message || ""));
    attemptPayload = stripAssignmentFields(attemptPayload, missingColumns);
  }

  return { data: null, error: latestError };
}

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
function fmtDate(ds) {
  if (!ds) return "—";
  const d = new Date(ds + "T00:00:00");
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
function fmtCreated(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}, ${d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}`;
}

function formatPkr(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) return "—";
  return `PKR ${amount.toLocaleString()}`;
}

function buildBookingSnapshotText(booking, billingHours, hourlyRate) {
  const total = Number(booking.total_pkr) || 0;
  const hours = Number(billingHours) || Number(booking.duration) || 0;
  const rate = Number(hourlyRate) || 0;
  return [
    "Maya Cabs Booking Snapshot",
    "",
    `Passenger: ${booking.passenger_name || "—"}`,
    `Phone: ${booking.passenger_phone || "—"}`,
    `City: ${getCityName(booking)}`,
    `Date: ${fmtDate(booking.booking_date)}`,
    `Slot: ${booking.slot_time && booking.slot_end ? `${booking.slot_time} to ${booking.slot_end}` : "—"}`,
    `Billing Hours: ${hours || "—"}`,
    `Rate per Hour: ${rate ? formatPkr(rate) : "—"}`,
    `Calculated Total: ${formatPkr(total)}`,
    `Trip: ${booking.pickup || "—"} -> ${booking.destination || "—"}`,
    `Status: ${(booking.status || "pending").toUpperCase()}`,
  ].join("\n");
}

// ── PIN Gate ──────────────────────────────────────────────────────────────────
function PinGate({ onUnlock }) {
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      onUnlock();
    } else {
      setShake(true);
      setPin("");
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-xs">
        <div className="bg-white rounded-3xl shadow-sm p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-teal-700 rounded-2xl flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" width={28} height={28} fill="none" stroke="white" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
              </svg>
            </div>
            <h1 className="font-extrabold text-slate-900 text-xl">Admin Access</h1>
            <p className="text-slate-500 text-sm mt-1 text-center">Enter your PIN to view bookings</p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className={[
                "w-full text-center text-2xl font-bold tracking-widest rounded-2xl border-2 px-4 py-4 focus:border-teal-500 outline-none transition",
                shake ? "border-red-400 bg-red-50" : "border-slate-200",
              ].join(" ")}
              placeholder="● ● ● ●"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-teal-700 text-white font-bold text-base rounded-2xl py-4 hover:bg-teal-800 transition"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Booking Detail Modal ──────────────────────────────────────────────────────
function BookingModal({ booking, onClose, onStatusChange, onBookingUpdate }) {
  const [status, setStatus] = useState(booking.status || "pending");
  const [saving, setSaving] = useState(false);
  const [slotSaving, setSlotSaving] = useState(false);
  const [slotError, setSlotError] = useState("");
  const [vehicleName, setVehicleName] = useState(normalizeVehicleName(getVehicleName(booking)));
  const [operatorName, setOperatorName] = useState(getOperatorName(booking));
  const [driverName, setDriverName] = useState(getDriverName(booking));
  const [operatorOptions, setOperatorOptions] = useState(() => {
    const existing = getOperatorName(booking);
    return existing && !OPERATOR_OPTIONS.includes(existing)
      ? [...OPERATOR_OPTIONS, existing]
      : OPERATOR_OPTIONS;
  });
  const [newOperatorName, setNewOperatorName] = useState("");
  const [addingOperator, setAddingOperator] = useState(false);
  const [cityName, setCityName] = useState(() => {
    const savedCity = String(booking.city || "").trim();
    if (CITY_OPTIONS.includes(savedCity)) return savedCity;
    const inferredCity = getCityName(booking);
    return CITY_OPTIONS.includes(inferredCity) ? inferredCity : "Lahore";
  });
  const [assignmentSaving, setAssignmentSaving] = useState(false);
  const [assignmentError, setAssignmentError] = useState("");

  const duration = normalizeDuration(booking.duration);
  const slotOptions = buildSlotsForDuration(duration);
  const [selectedDate, setSelectedDate] = useState(booking.booking_date || new Date().toISOString().slice(0, 10));
  const [selectedSlotId, setSelectedSlotId] = useState(() => {
    const slot = slotOptions.find((option) => option.startLabel === booking.slot_time);
    return slot?.id || "";
  });
  const rideNumber = getRideNumber({ ...booking, status });
  const selectedSlot = slotOptions.find((slot) => slot.id === selectedSlotId) || null;
  const hasScheduleChange = Boolean(selectedSlot)
    && (
      booking.booking_date !== selectedDate
      || booking.slot_time !== selectedSlot.startLabel
      || booking.slot_end !== selectedSlot.endLabel
    );
  const hasAssignmentChange =
    driverName !== getDriverName(booking)
    ||
    vehicleName !== getVehicleName(booking)
    || operatorName !== getOperatorName(booking)
    || cityName !== String(booking.city || "").trim();

  useEffect(() => {
    const available = getDriverOptionsForOperator(operatorName);
    if (!available.length) return;
    if (!available.includes(driverName)) {
      setDriverName(getDefaultDriverForOperator(operatorName));
    }
  }, [operatorName, driverName]);

  const driverOptions = useMemo(() => {
    const base = getDriverOptionsForOperator(operatorName);
    const current = String(driverName || "").trim();
    if (current && !base.includes(current)) return [...base, current];
    if (!base.length) return [getDefaultDriverForOperator(operatorName)];
    return base;
  }, [operatorName, driverName]);

  const handleAddOperator = () => {
    const normalized = String(newOperatorName || "").trim();
    if (!normalized) return;
    setOperatorOptions((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    setOperatorName(normalized);
    setNewOperatorName("");
    setAddingOperator(false);
  };

  const saveStatus = async (newStatus) => {
    setSaving(true);
    const { error } = await supabase
      .from("bookings")
      .update({ status: newStatus })
      .eq("id", booking.id);
    setSaving(false);
    if (!error) {
      setStatus(newStatus);
      onStatusChange(booking.id, newStatus);
    }
  };

  const saveSlot = async () => {
    const nextSlot = selectedSlot;
    if (!nextSlot) return;
    const targetDate = selectedDate || booking.booking_date;

    if (!targetDate) {
      setSlotError("Please select a valid date.");
      return;
    }

    if (
      targetDate === booking.booking_date
      && nextSlot.startLabel === booking.slot_time
      && nextSlot.endLabel === booking.slot_end
    ) {
      setSlotError("");
      return;
    }

    setSlotSaving(true);
    setSlotError("");

    const { data, error } = await supabase
      .from("bookings")
      .select("id, duration, slot_time, slot_end, status")
      .eq("booking_date", targetDate)
      .eq("city", cityName || getCityName(booking))
      .neq("status", "cancelled")
      .neq("id", booking.id);

    if (error) {
      setSlotSaving(false);
      setSlotError(error.message || "Unable to check slot availability.");
      return;
    }

    const activeRows = (data || []).filter((row) => isBlockingStatus(row.status));
    const candidateStart = new Date(`${targetDate}T${String(nextSlot.startHour).padStart(2, "0")}:00:00`);
    const candidateEnd = new Date(candidateStart);
    candidateEnd.setHours(candidateEnd.getHours() + duration);

    const conflict = activeRows.some((row) => {
      const rowStartHour = parseHourLabel(row.slot_time);
      if (rowStartHour === null) return false;
      const rowStart = new Date(`${targetDate}T${String(rowStartHour).padStart(2, "0")}:00:00`);
      const rowEnd = new Date(rowStart);
      rowEnd.setHours(rowEnd.getHours() + normalizeDuration(row.duration));
      return hasSlotConflictWithGap(candidateStart, candidateEnd, rowStart, rowEnd);
    });

    if (conflict) {
      setSlotSaving(false);
      setSlotError("That slot is already occupied for this date and city.");
      return;
    }

    const updates = {
      booking_date: targetDate,
      slot_time: nextSlot.startLabel,
      slot_end: nextSlot.endLabel,
    };
    const { error: updateError } = await supabase
      .from("bookings")
      .update(updates)
      .eq("id", booking.id);

    setSlotSaving(false);

    if (updateError) {
      setSlotError(updateError.message || "Unable to update slot.");
      return;
    }

    onBookingUpdate(booking.id, updates);
  };

  const saveAssignment = async () => {
    setAssignmentSaving(true);
    setAssignmentError("");

    const normalizedOperator = String(operatorName || "").trim() || DEFAULT_OPERATOR_NAME;
    const normalizedDriver = String(driverName || "").trim() || getDefaultDriverForOperator(normalizedOperator);

    const updates = {
      driver_name: normalizedDriver,
      vehicle_name: normalizeVehicleName(vehicleName),
      operator_name: normalizedOperator,
      city: cityName || "Lahore",
    };

    const { data, error: updateError, appliedPayload } = await updateBookingRecord(booking.id, updates);

    setAssignmentSaving(false);

    if (updateError) {
      setAssignmentError(getAssignmentUpdateError(updateError));
      return;
    }

    onBookingUpdate(booking.id, data || appliedPayload || updates);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center sm:items-center px-0 sm:px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className={`px-5 py-4 flex items-center justify-between flex-shrink-0 ${isActiveHold(booking) ? "bg-orange-600" : "bg-teal-700"}`}>
          <div>
            <div className="font-bold text-white text-base">{booking.passenger_name || "—"}</div>
            <div className="text-white/70 text-xs">{booking.passenger_phone || "—"}</div>
            {rideNumber && <div className="text-white/80 text-xs font-semibold mt-1">Ride No: {rideNumber}</div>}
          </div>
          <div className="flex items-center gap-2">
            {booking.status === "pending" && (
              <HoldCountdown createdAt={booking.created_at} />
            )}
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
              <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth={2}>
                <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scroll body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {/* Status control */}
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Status</div>
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  disabled={saving}
                  onClick={() => saveStatus(s)}
                  className={[
                    "px-4 py-2 rounded-xl border text-xs font-bold capitalize transition",
                    status === s
                      ? STATUS_COLORS[s] + " ring-2 ring-offset-1 ring-teal-400"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300",
                  ].join(" ")}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Trip info */}
          <Section title="Trip">
            <Row label="Ride Number" value={rideNumber || "Assigned when confirmed"} />
            <Row label="City" value={getCityName(booking)} />
            <Row label="Date" value={fmtDate(booking.booking_date)} />
            <Row label="Time" value={booking.slot_time && booking.slot_end ? `${booking.slot_time} → ${booking.slot_end}` : "—"} />
            <Row label="Duration" value={booking.duration ? `${booking.duration} hrs` : "—"} />
            <Row label="Trip Type" value={booking.trip_type === "wait-return" ? "Wait & Return" : booking.trip_type === "one-way" ? "One-Way" : "—"} />
            <Row label="Driver" value={getDriverName(booking)} />
            <Row label="Vehicle" value={getVehicleName(booking)} />
            <Row label="Owner/Operator" value={getOperatorName(booking)} />
          </Section>

          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Assignment</div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex flex-col gap-2">
              <label className="text-xs font-semibold text-slate-600">Vehicle</label>
              <label className="text-xs font-semibold text-slate-600">Driver</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
              >
                {driverOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <label className="text-xs font-semibold text-slate-600 mt-1">Vehicle</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                value={vehicleName}
                onChange={(e) => setVehicleName(e.target.value)}
              >
                {VEHICLE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              <label className="text-xs font-semibold text-slate-600 mt-1">Owner / Operator</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                value={operatorName}
                onChange={(e) => setOperatorName(e.target.value)}
              >
                <option value="">Select Operator</option>
                {operatorOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              {!addingOperator ? (
                <button
                  type="button"
                  onClick={() => setAddingOperator(true)}
                  className="w-fit rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  Add Operator -
                </button>
              ) : (
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                    placeholder="New operator name"
                    value={newOperatorName}
                    onChange={(e) => setNewOperatorName(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={handleAddOperator}
                    className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAddingOperator(false);
                      setNewOperatorName("");
                    }}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <label className="text-xs font-semibold text-slate-600 mt-1">City</label>
              <select
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
                value={cityName}
                onChange={(e) => setCityName(e.target.value)}
              >
                {CITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>

              {assignmentError && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {assignmentError}
                </div>
              )}

              <button
                type="button"
                disabled={!hasAssignmentChange || assignmentSaving}
                onClick={saveAssignment}
                className="mt-2 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {assignmentSaving ? "Updating Assignment..." : "Save Assignment"}
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Change Date and Slot</div>
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
              <label className="text-xs font-semibold text-slate-600">Booking Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
              />
              <div className="flex flex-col gap-2">
                {slotOptions.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={slotSaving}
                    onClick={() => setSelectedSlotId(slot.id)}
                    className={[
                      "w-full rounded-xl border px-3 py-3 text-left transition",
                      selectedSlotId === slot.id
                        ? "border-teal-500 bg-teal-50"
                        : "border-slate-200 bg-white hover:border-slate-300",
                    ].join(" ")}
                  >
                    <div className="font-bold text-sm text-slate-900">{slot.title}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {slot.startLabel === booking.slot_time && slot.endLabel === booking.slot_end
                        ? "Current slot"
                        : "Available to assign from admin"}
                    </div>
                  </button>
                ))}
              </div>
              {slotError && (
                <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {slotError}
                </div>
              )}
              <button
                type="button"
                disabled={!hasScheduleChange || slotSaving}
                onClick={saveSlot}
                className="mt-3 w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {slotSaving ? "Updating Date and Slot..." : "Save Date and Slot"}
              </button>
              <div className="mt-2 text-xs text-slate-500">
                This updates the booking in Supabase, so frontend availability and admin records stay in sync automatically.
              </div>
            </div>
          </div>

          <Section title="Journey">
            <Row label="Pickup" value={booking.pickup || "—"} />
            <Row label="Destination" value={booking.destination || "—"} />
          </Section>

          <Section title="Passenger">
            <Row label="Name" value={booking.passenger_name || "—"} />
            <Row label="Phone" value={booking.passenger_phone || "—"} />
            <Row label="Wheelchair" value={
              booking.wheelchair_type === "standard" ? "Standard Width (≤24 in)" :
              booking.wheelchair_type === "wide" ? "Wide / Power (≤28 in)" : "—"
            } />
          </Section>

          <Section title="Payment">
            <Row label="Total" value={booking.total_pkr ? `PKR ${Number(booking.total_pkr).toLocaleString()}` : "—"} highlight />
            <Row label="Method" value="Prepaid" />
          </Section>

          <div className="text-slate-400 text-xs text-right pb-2">
            Submitted: {fmtCreated(booking.created_at)}
          </div>
        </div>

        {/* WhatsApp reply shortcut + Snapshot generator */}
        <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0 flex flex-col gap-2">
          <a
            href={`https://wa.me/92${(booking.passenger_phone || "").replace(/^0/, "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${booking.passenger_name || ""}! ✅ Thank you for booking with Maya Cabs!

📅 BOOKING CONFIRMED
• Date: ${fmtDate(booking.booking_date)}
• Time: ${booking.slot_time && booking.slot_end ? `${booking.slot_time} to ${booking.slot_end}` : "—"}
• Duration: ${booking.duration ? `${booking.duration}-hour slot` : "—"}
• Service: Maya Cabs Wheelchair Accessible Transport

📍 JOURNEY DETAILS
• From: ${booking.pickup || "—"}
• To: ${booking.destination || "—"}

♿ WHEELCHAIR INFO
• Type: ${booking.wheelchair_type === "standard" ? "Standard Width (≤24 inches)" : booking.wheelchair_type === "wide" ? "Wide / Power Chair (≤28 inches)" : "—"}

💰 TOTAL COST: PKR ${booking.total_pkr ? Number(booking.total_pkr).toLocaleString() : "—"} (Prepaid)

⏰ IMPORTANT NOTES:
• Driver will call 30-45 minutes before arrival
• Fixed slots - no extensions allowed after slot end time
• Please be ready at pickup location 5 minutes before scheduled time

Status: ${status.toUpperCase()}
Ride Number: ${rideNumber || "Assigned once booking is confirmed"}
Driver: ${getDriverName(booking)}
Vehicle: ${vehicleName || DEFAULT_VEHICLE_NAME}
Owner / Operator: ${operatorName || DEFAULT_OPERATOR_NAME}

Thank you for choosing Maya Cabs! 🚗`)}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 bg-green-600 text-white font-bold text-sm rounded-2xl py-3 hover:bg-green-700 transition"
          >
            <svg viewBox="0 0 24 24" width={18} height={18} fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Reply on WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{title}</div>
      <div className="bg-slate-50 rounded-2xl px-4 py-1 divide-y divide-slate-100">
        {children}
      </div>
    </div>
  );
}

function Row({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between py-2.5 gap-3">
      <span className="text-slate-500 text-sm flex-shrink-0">{label}</span>
      <span className={`text-sm font-semibold text-right ${highlight ? "text-teal-700 font-extrabold" : "text-slate-800"}`}>
        {value}
      </span>
    </div>
  );
}

// ── Booking Card (list view) ──────────────────────────────────────────────────
function BookingCard({ booking, onClick }) {
  const status = booking.status || "pending";
  const rideNumber = getRideNumber(booking);
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition"
    >
      {/* Avatar */}
      <div className="w-12 h-12 bg-teal-50 rounded-2xl flex items-center justify-center flex-shrink-0">
        <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#0d9488" strokeWidth={1.8}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
        </svg>
      </div>

      {/* Main info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-bold text-slate-900 text-sm truncate">
            {booking.passenger_name || "Unknown"}
          </span>
          {booking.status === "pending" ? (
            <HoldCountdown createdAt={booking.created_at} />
          ) : (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border capitalize ${STATUS_COLORS[status]}`}>
              {status}
            </span>
          )}
        </div>
        <div className="text-slate-500 text-xs mt-0.5 truncate">
          {booking.pickup ? `${booking.pickup} → ${booking.destination || "?"}` : "No journey info"}
        </div>
        <div className="text-indigo-700 font-semibold text-xs mt-0.5">
          City: {getCityName(booking)}
        </div>
        <div className="text-teal-700 font-bold text-xs mt-0.5">
          {fmtDate(booking.booking_date)}
          {booking.slot_time ? ` · ${booking.slot_time}` : ""}
          {booking.duration ? ` · ${booking.duration}h` : ""}
        </div>
        {rideNumber && (
          <div className="text-emerald-700 font-bold text-xs mt-0.5">
            Ride No: {rideNumber}
          </div>
        )}
        <div className="text-slate-500 text-xs mt-0.5 truncate">
          {getDriverName(booking)} · {getVehicleName(booking)}
        </div>
      </div>

      {/* Price + chevron */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {booking.total_pkr && (
          <span className="font-extrabold text-slate-900 text-sm">
            PKR {Number(booking.total_pkr).toLocaleString()}
          </span>
        )}
        <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth={2}>
          <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </button>
  );
}

function ManualBookingPanel({ onBookingCreated }) {
  const today = new Date().toISOString().slice(0, 10);
  const [city, setCity] = useState("Lahore");
  const [passengerName, setPassengerName] = useState("");
  const [passengerPhone, setPassengerPhone] = useState("");
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [bookingDate, setBookingDate] = useState(today);
  const [durationHours, setDurationHours] = useState("6");
  const [hourlyRate, setHourlyRate] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [tripType, setTripType] = useState("one-way");
  const [wheelchairType, setWheelchairType] = useState("standard");
  const [status, setStatus] = useState("pending");
  const [driverName, setDriverName] = useState(getDefaultDriverForOperator(DEFAULT_OPERATOR_NAME));
  const [vehicleName, setVehicleName] = useState(normalizeVehicleName(DEFAULT_VEHICLE_NAME));
  const [operatorName, setOperatorName] = useState(DEFAULT_OPERATOR_NAME);
  const [operatorOptions, setOperatorOptions] = useState(OPERATOR_OPTIONS);
  const [newOperatorName, setNewOperatorName] = useState("");
  const [addingOperator, setAddingOperator] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [lastSavedSnapshot, setLastSavedSnapshot] = useState(null);

  const durationHoursValue = normalizeDuration(durationHours);
  const manualSlotOptions = useMemo(() => buildSlotsForDuration(durationHoursValue), [durationHoursValue]);
  const selectedSlot = manualSlotOptions.find((slot) => slot.id === selectedSlotId) || manualSlotOptions[0] || null;
  const hourlyRateValue = Number(hourlyRate);
  const canCalculateTotal = Number.isFinite(durationHoursValue)
    && Number.isFinite(hourlyRateValue)
    && durationHoursValue > 0
    && hourlyRateValue >= 0;
  const calculatedTotalPkr = canCalculateTotal ? Math.round(durationHoursValue * hourlyRateValue) : null;
  const manualDriverOptions = useMemo(() => {
    const base = getDriverOptionsForOperator(operatorName);
    const current = String(driverName || "").trim();
    if (current && !base.includes(current)) return [...base, current];
    return base;
  }, [operatorName, driverName]);

  const handleAddOperator = () => {
    const normalized = String(newOperatorName || "").trim();
    if (!normalized) return;
    setOperatorOptions((prev) => (prev.includes(normalized) ? prev : [...prev, normalized]));
    setOperatorName(normalized);
    setNewOperatorName("");
    setAddingOperator(false);
  };

  useEffect(() => {
    if (!manualSlotOptions.some((slot) => slot.id === selectedSlotId)) {
      setSelectedSlotId(manualSlotOptions[0]?.id || "");
    }
  }, [selectedSlotId, manualSlotOptions]);

  useEffect(() => {
    const available = getDriverOptionsForOperator(operatorName);
    if (!available.length) return;
    if (!available.includes(driverName)) {
      setDriverName(getDefaultDriverForOperator(operatorName));
    }
  }, [operatorName, driverName]);

  const resetForm = () => {
    setCity("Lahore");
    setPassengerName("");
    setPassengerPhone("");
    setPickup("");
    setDestination("");
    setBookingDate(today);
    setDurationHours("6");
    setHourlyRate("");
    setSelectedSlotId(buildSlotsForDuration(6)[0]?.id || "");
    setTripType("one-way");
    setWheelchairType("standard");
    setStatus("pending");
    setDriverName(getDefaultDriverForOperator(DEFAULT_OPERATOR_NAME));
    setVehicleName(normalizeVehicleName(DEFAULT_VEHICLE_NAME));
    setOperatorName(DEFAULT_OPERATOR_NAME);
    setNewOperatorName("");
    setAddingOperator(false);
  };

  const handleCreateBooking = async () => {
    if (!passengerName.trim() || !passengerPhone.trim() || !pickup.trim() || !destination.trim() || !bookingDate || !selectedSlot) {
      setError("Fill in all required booking details first.");
      setMessage("");
      return;
    }

    if (!canCalculateTotal) {
      setError("Enter valid billing hours and hourly rate to calculate total before saving.");
      setMessage("");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    const { data: existingRows, error: existingError } = await supabase
      .from("bookings")
      .select("id, duration, slot_time, slot_end, status")
      .eq("booking_date", bookingDate)
      .eq("city", city)
      .neq("status", "cancelled");

    if (existingError) {
      setSaving(false);
      setError(existingError.message || "Unable to verify slot availability.");
      return;
    }

    const activeRows = (existingRows || []).filter((row) => isBlockingStatus(row.status));
    const requestedDuration = durationHoursValue;
    const candidateStart = new Date(`${bookingDate}T${String(selectedSlot.startHour).padStart(2, "0")}:00:00`);
    const candidateEnd = new Date(candidateStart);
    candidateEnd.setHours(candidateEnd.getHours() + requestedDuration);

    const conflict = activeRows.some((row) => {
      const rowStartHour = parseHourLabel(row.slot_time);
      if (rowStartHour === null) return false;
      const rowStart = new Date(`${bookingDate}T${String(rowStartHour).padStart(2, "0")}:00:00`);
      const rowEnd = new Date(rowStart);
      rowEnd.setHours(rowEnd.getHours() + normalizeDuration(row.duration));
      return hasSlotConflictWithGap(candidateStart, candidateEnd, rowStart, rowEnd);
    });

    if (conflict) {
      setSaving(false);
      setError("That slot is already occupied for this date.");
      return;
    }

    const payload = {
      passenger_name: passengerName.trim(),
      passenger_phone: passengerPhone.trim(),
      city,
      pickup: pickup.trim(),
      destination: destination.trim(),
      trip_type: tripType,
      wheelchair_type: wheelchairType,
      booking_date: bookingDate,
      slot_time: selectedSlot.startLabel,
      slot_end: selectedSlot.endLabel,
      duration: durationHoursValue,
      total_pkr: calculatedTotalPkr,
      driver_name: driverName || getDefaultDriverForOperator(operatorName),
      vehicle_name: normalizeVehicleName(vehicleName),
      operator_name: operatorName || DEFAULT_OPERATOR_NAME,
      status,
    };

    const { data, error: insertError } = await insertBookingRecord(payload);

    setSaving(false);

    if (insertError) {
      setError(insertError.message || "Unable to create booking.");
      return;
    }

    if (data) onBookingCreated(data);
    if (data) {
      setLastSavedSnapshot({
        booking: data,
        billingHours: durationHoursValue,
        hourlyRate: hourlyRateValue,
      });
    }
    setMessage("Manual booking added successfully.");
    resetForm();
  };

  const handleShareSnapshot = async () => {
    if (!lastSavedSnapshot) return;
    const snapshotText = buildBookingSnapshotText(
      lastSavedSnapshot.booking,
      lastSavedSnapshot.billingHours,
      lastSavedSnapshot.hourlyRate
    );

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Maya Cabs Booking Snapshot",
          text: snapshotText,
        });
        setMessage("Booking snapshot shared.");
        return;
      }

      await navigator.clipboard.writeText(snapshotText);
      setMessage("Snapshot copied. You can now paste it in WhatsApp.");
    } catch (shareError) {
      setError(shareError?.message || "Unable to share snapshot right now.");
    }
  };

  const handleCopySnapshot = async () => {
    if (!lastSavedSnapshot) return;
    const snapshotText = buildBookingSnapshotText(
      lastSavedSnapshot.booking,
      lastSavedSnapshot.billingHours,
      lastSavedSnapshot.hourlyRate
    );
    try {
      await navigator.clipboard.writeText(snapshotText);
      setMessage("Booking snapshot copied to clipboard.");
    } catch (copyError) {
      setError(copyError?.message || "Unable to copy snapshot.");
    }
  };

  const handleDownloadSnapshot = () => {
    if (!lastSavedSnapshot) return;
    const snapshotText = buildBookingSnapshotText(
      lastSavedSnapshot.booking,
      lastSavedSnapshot.billingHours,
      lastSavedSnapshot.hourlyRate
    );
    const blob = new Blob([snapshotText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const safeName = String(lastSavedSnapshot.booking.passenger_name || "booking").trim().replace(/\s+/g, "-").toLowerCase();
    const fileName = `maya-cabs-snapshot-${safeName || "booking"}-${lastSavedSnapshot.booking.booking_date || "date"}.txt`;

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setMessage("Booking snapshot downloaded.");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mb-4">
      <div className="flex items-center gap-2 mb-3">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#0f766e" strokeWidth={2}>
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
        <span className="font-bold text-slate-800 text-sm">Add Booking From WhatsApp</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="Lahore">Lahore</option>
          <option value="Karachi">Karachi</option>
        </select>
        <input
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          placeholder="Passenger name"
          value={passengerName}
          onChange={(e) => setPassengerName(e.target.value)}
        />
        <input
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          placeholder="Passenger phone"
          value={passengerPhone}
          onChange={(e) => setPassengerPhone(e.target.value)}
        />
        <input
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400 sm:col-span-2"
          placeholder="Pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
        <input
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400 sm:col-span-2"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <input
          type="date"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={bookingDate}
          onChange={(e) => setBookingDate(e.target.value)}
        />
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={durationHours}
          onChange={(e) => setDurationHours(e.target.value)}
        >
          <option value="6">6 hours</option>
          <option value="12">12 hours</option>
        </select>
        <input
          type="number"
          min="0"
          step="100"
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          placeholder="Rate per hour (PKR)"
          value={hourlyRate}
          onChange={(e) => setHourlyRate(e.target.value)}
        />
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={selectedSlotId}
          onChange={(e) => setSelectedSlotId(e.target.value)}
        >
          {manualSlotOptions.map((slot) => (
            <option key={slot.id} value={slot.id}>{slot.title}</option>
          ))}
        </select>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={tripType}
          onChange={(e) => setTripType(e.target.value)}
        >
          <option value="one-way">One-Way</option>
          <option value="wait-return">Wait & Return</option>
        </select>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={wheelchairType}
          onChange={(e) => setWheelchairType(e.target.value)}
        >
          <option value="standard">Standard Width</option>
          <option value="wide">Wide / Power Chair</option>
        </select>
        <div className="sm:col-span-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
          <div className="text-xs font-semibold text-emerald-800">Inbuilt Fare Calculator</div>
          <div className="text-sm text-emerald-900 mt-0.5">
            {canCalculateTotal
              ? `${durationHoursValue} hour(s) x ${formatPkr(hourlyRateValue)} = ${formatPkr(calculatedTotalPkr)}`
              : "Enter billable hours and rate per hour to calculate total paid amount."}
          </div>
        </div>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={driverName}
          onChange={(e) => setDriverName(e.target.value)}
        >
          {manualDriverOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
          value={vehicleName}
          onChange={(e) => setVehicleName(e.target.value)}
        >
          {VEHICLE_OPTIONS.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400 sm:col-span-2"
          value={operatorName}
          onChange={(e) => setOperatorName(e.target.value)}
        >
          <option value="">Select Operator</option>
          {operatorOptions.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
        {!addingOperator ? (
          <button
            type="button"
            onClick={() => setAddingOperator(true)}
            className="sm:col-span-2 w-fit rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            Add Operator -
          </button>
        ) : (
          <div className="sm:col-span-2 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-teal-400"
              placeholder="New operator name"
              value={newOperatorName}
              onChange={(e) => setNewOperatorName(e.target.value)}
            />
            <button
              type="button"
              onClick={handleAddOperator}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition"
            >
              Save Operator
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingOperator(false);
                setNewOperatorName("");
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}
      {message && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
          {message}
        </div>
      )}

        {lastSavedSnapshot && (
          <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 px-3 py-3">
            <div className="text-xs font-bold text-sky-800">Last Saved Booking Snapshot</div>
            <div className="text-xs text-slate-700 mt-1">
              {lastSavedSnapshot.booking.passenger_name || "—"} · {formatPkr(lastSavedSnapshot.booking.total_pkr)} · {fmtDate(lastSavedSnapshot.booking.booking_date)}
            </div>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareSnapshot}
                className="rounded-xl bg-sky-700 py-2 text-xs font-bold text-white hover:bg-sky-800 transition"
              >
                Share Snapshot
              </button>
              <button
                type="button"
                onClick={handleCopySnapshot}
                className="rounded-xl border border-sky-300 bg-white py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition"
              >
                Copy Snapshot Text
              </button>
              <button
                type="button"
                onClick={handleDownloadSnapshot}
                className="sm:col-span-2 rounded-xl border border-sky-300 bg-white py-2 text-xs font-bold text-sky-800 hover:bg-sky-100 transition"
              >
                Download Snapshot
              </button>
            </div>
          </div>
        )}

      <button
        type="button"
        onClick={handleCreateBooking}
        disabled={saving}
        className="mt-3 w-full rounded-xl bg-teal-700 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        {saving ? "Saving Manual Booking..." : "Add Booking to Admin Panel"}
      </button>
    </div>
  );
}

// ── Block Dates Panel ───────────────────────────────────────────────────────
// Generate all YYYY-MM-DD strings between two dates (inclusive)
function dateRange(from, to) {
  const dates = [];
  const cur = new Date(from + "T00:00:00");
  const end = new Date(to   + "T00:00:00");
  while (cur <= end) {
    dates.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return dates;
}

function BlockedDatesPanel({ blockedDates, onRefresh }) {
  const today = new Date().toISOString().slice(0, 10);
  const [from, setFrom] = useState(today);
  const [to,   setTo]   = useState(today);
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [blockError, setBlockError] = useState(null);

  async function handleBlock() {
    if (!from || !to || to < from) return;
    setSaving(true);
    setBlockError(null);
    const rows = dateRange(from, to).map(d => ({ date: d, reason: reason || null }));
    const { error } = await supabase
      .from("blocked_dates")
      .upsert(rows, { onConflict: "date" });
    setSaving(false);
    if (error) {
      setBlockError(error.message);
    } else {
      setReason("");
      onRefresh();
    }
  }

  async function handleUnblock(id) {
    setRemoving(id);
    const { error } = await supabase.from("blocked_dates").delete().eq("id", id);
    setRemoving(null);
    if (error) alert("Unblock failed: " + error.message);
    else onRefresh();
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
          <path d="M9 16l6-6M15 16l-6-6" strokeLinecap="round" />
        </svg>
        <span className="font-bold text-slate-800 text-sm">Block Dates</span>
        <span className="text-xs text-slate-400">(reason is private — customers only see dates as unavailable)</span>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 whitespace-nowrap">From</label>
          <input
            type="date"
            value={from}
            min={today}
            onChange={e => { setFrom(e.target.value); if (e.target.value > to) setTo(e.target.value); }}
            onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-red-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 whitespace-nowrap">To</label>
          <input
            type="date"
            value={to}
            min={from || today}
            onChange={e => setTo(e.target.value)}
            onFocus={e => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-red-400"
          />
        </div>
        <input
          type="text"
          placeholder="Reason (private — e.g. car service, personal)"
          value={reason}
          onChange={e => setReason(e.target.value)}
          className="flex-1 min-w-0 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 outline-none focus:border-red-400"
        />
        <button
          onClick={handleBlock}
          disabled={saving || !from || !to || to < from}
          className="bg-red-600 text-white text-sm font-bold rounded-xl px-4 py-2 hover:bg-red-700 transition disabled:opacity-50 whitespace-nowrap"
        >
          {saving ? "Blocking…" : "Block"}
        </button>
      </div>

      {blockError && (
        <div className="text-red-600 text-xs mb-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          ⚠️ {blockError}
          {blockError.includes("does not exist") && (
            <div className="mt-1 text-slate-500">
              Create the <code className="bg-slate-100 px-1 rounded">blocked_dates</code> table in Supabase first — see setup instructions.
            </div>
          )}
        </div>
      )}

      {blockedDates.length === 0 ? (
        <div className="text-slate-400 text-xs">No dates currently blocked.</div>
      ) : (
        <div className="flex flex-col gap-2">
          {blockedDates.map(bd => (
            <div key={bd.id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <div className="flex flex-col">
                <span className="font-bold text-red-700 text-sm">{fmtDate(bd.date)}</span>
                {bd.reason && (
                  <span className="text-slate-500 text-xs mt-0.5">{bd.reason}</span>
                )}
              </div>
              <button
                onClick={() => handleUnblock(bd.id)}
                disabled={removing === bd.id}
                className="text-xs text-slate-400 hover:text-red-600 transition font-semibold ml-4 flex-shrink-0"
              >
                {removing === bd.id ? "…" : "Unblock"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function Admin() {
  const [unlocked, setUnlocked] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (err) setError(err.message);
    else setBookings(data || []);
  }, []);

  const fetchBlockedDates = useCallback(async () => {
    const { data } = await supabase
      .from("blocked_dates")
      .select("*")
      .order("date", { ascending: true });
    setBlockedDates(data || []);
  }, []);

  useEffect(() => {
    if (unlocked) { fetchBookings(); fetchBlockedDates(); }
  }, [unlocked, fetchBookings, fetchBlockedDates]);

  const handleUnlock = () => {
    setUnlocked(true);
  };

  const handleStatusChange = (id, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selected?.id === id) setSelected((s) => ({ ...s, status: newStatus }));
  };

  const handleBookingUpdate = (id, updates) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    if (selected?.id === id) setSelected((s) => ({ ...s, ...updates }));
  };

  const handleBookingCreated = (booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  if (!unlocked) return <PinGate onUnlock={handleUnlock} />;

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (b.passenger_name || "").toLowerCase().includes(q) ||
      (b.passenger_phone || "").toLowerCase().includes(q) ||
      (b.city || "").toLowerCase().includes(q) ||
      (b.pickup || "").toLowerCase().includes(q) ||
      (b.destination || "").toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const counts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = bookings.filter((b) => b.status === s).length;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top bar */}
      <div className="bg-teal-700 px-4 pt-10 pb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-white font-extrabold text-xl">Maya Cabs</h1>
            <p className="text-teal-200 text-xs">Bookings Dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition"
              title="Refresh"
            >
              <svg
                width={16} height={16} viewBox="0 0 16 16" fill="none"
                stroke="white" strokeWidth={2}
                className={loading ? "animate-spin" : ""}
              >
                <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" strokeLinecap="round" />
                <path d="M8 1v3.5L10.5 2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => {
                setUnlocked(false);
              }}
              className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center hover:bg-white/30 transition"
              title="Lock"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stat pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[{ key: "all", label: "All", count: bookings.length }, ...STATUS_OPTIONS.map((s) => ({ key: s, label: s, count: counts[s] }))].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={[
                "flex-shrink-0 rounded-xl px-3 py-1.5 text-xs font-bold capitalize flex items-center gap-1.5 transition",
                filterStatus === f.key
                  ? "bg-white text-teal-700"
                  : "bg-white/20 text-white hover:bg-white/30",
              ].join(" ")}
            >
              {f.label}
              <span className={`rounded-full px-1.5 py-0.5 text-xs ${filterStatus === f.key ? "bg-teal-100 text-teal-700" : "bg-white/30 text-white"}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 pt-4 pb-64 overflow-y-auto">
        <ManualBookingPanel onBookingCreated={handleBookingCreated} />

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-sm px-4 py-3 flex items-center gap-3 mb-4">
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="#94a3b8" strokeWidth={2}>
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3 3" strokeLinecap="round" />
          </svg>
          <input
            className="flex-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            placeholder="Search name, phone, pickup, destination…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="text-slate-400 hover:text-slate-600">
              <svg width={14} height={14} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M3 3l8 8M11 3L3 11" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center justify-center py-20 text-slate-400 text-sm">
            Loading bookings…
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-4 text-red-700 text-sm mb-4">
            Error: {error}
          </div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <svg width={40} height={40} viewBox="0 0 40 40" fill="none" stroke="#cbd5e1" strokeWidth={1.5}>
              <rect x="6" y="10" width="28" height="24" rx="3" />
              <path d="M14 6v6M26 6v6M6 20h28" strokeLinecap="round" />
            </svg>
            <p className="text-sm mt-3">No bookings found</p>
          </div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="flex flex-col gap-3">
            {filtered.map((b) => (
              <BookingCard key={b.id} booking={b} onClick={() => setSelected(b)} />
            ))}
          </div>
        )}

        <BlockedDatesPanel blockedDates={blockedDates} onRefresh={fetchBlockedDates} />
      </main>

      {/* Detail modal */}
      {selected && (
        <BookingModal
          booking={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onBookingUpdate={handleBookingUpdate}
        />
      )}
    </div>
  );
}
