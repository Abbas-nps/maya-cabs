import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase";

// ── Simple PIN gate — change this to your preference ──────────────────────────
const ADMIN_PIN = "1122";
const HOLD_MINUTES = 15;

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
  confirmed: "bg-teal-100 text-teal-700 border-teal-200",
  completed: "bg-slate-100 text-slate-600 border-slate-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

const STATUS_OPTIONS = ["pending", "confirmed", "completed", "cancelled"];

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
function BookingModal({ booking, onClose, onStatusChange }) {
  const [status, setStatus] = useState(booking.status || "pending");
  const [saving, setSaving] = useState(false);

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
            <Row label="Date" value={fmtDate(booking.booking_date)} />
            <Row label="Time" value={booking.slot_time && booking.slot_end ? `${booking.slot_time} → ${booking.slot_end}` : "—"} />
            <Row label="Duration" value={booking.duration ? `${booking.duration} hrs` : "—"} />
            <Row label="Trip Type" value={booking.trip_type === "wait-return" ? "Wait & Return" : booking.trip_type === "one-way" ? "One-Way" : "—"} />
          </Section>

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

        {/* WhatsApp reply shortcut */}
        <div className="px-5 py-4 border-t border-slate-100 flex-shrink-0">
          <a
            href={`https://wa.me/92${(booking.passenger_phone || "").replace(/^0/, "").replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${booking.passenger_name || ""}! Your Maya Cabs booking for ${fmtDate(booking.booking_date)} at ${booking.slot_time || ""} is ${status}. Thank you!`)}`}
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
        <div className="text-teal-700 font-bold text-xs mt-0.5">
          {fmtDate(booking.booking_date)}
          {booking.slot_time ? ` · ${booking.slot_time}` : ""}
          {booking.duration ? ` · ${booking.duration}h` : ""}
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

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function Admin() {
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem("adminUnlocked") === "true"
  );
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);

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

  useEffect(() => {
    if (unlocked) fetchBookings();
  }, [unlocked, fetchBookings]);

  const handleUnlock = () => {
    sessionStorage.setItem("adminUnlocked", "true");
    setUnlocked(true);
  };

  const handleStatusChange = (id, newStatus) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );
    if (selected?.id === id) setSelected((s) => ({ ...s, status: newStatus }));
  };

  if (!unlocked) return <PinGate onUnlock={handleUnlock} />;

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "all" || b.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      (b.passenger_name || "").toLowerCase().includes(q) ||
      (b.passenger_phone || "").toLowerCase().includes(q) ||
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
                sessionStorage.removeItem("adminUnlocked");
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

      <main className="flex-1 px-4 pt-4 pb-8">
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
      </main>

      {/* Detail modal */}
      {selected && (
        <BookingModal
          booking={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}
