import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import { supabase } from "../supabase";
import {
  clearCustomerSession,
  formatCustomerPhone,
  isValidPakistanPhone,
  normalizeCustomerPhone,
  readCustomerSession,
  signInCustomerProfile,
  upsertCustomerProfile,
} from "../lib/customerProfile";

const LOGIN_GUARD_KEY = "mayaCabsCustomerLoginGuard";
const LOCK_THRESHOLD = 5;
const BAN_THRESHOLD = 10;
const LOCK_MINUTES = 15;
const BAN_HOURS = 24;
const DEFAULT_DRIVER_NAME = "Kaabish";
const DEFAULT_VEHICLE_NAME = "2019 Nissan Clipper WAV";
const DEFAULT_OPERATOR_NAME = "New Pak Surgical";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function formatRideDate(dateString) {
  if (!dateString) return "—";
  const date = new Date(`${dateString}T00:00:00`);
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
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

function getRideNumber(ride) {
  const datePart = (ride.booking_date || "").replace(/-/g, "").slice(2);
  const source = [ride.id || "", ride.created_at || "", ride.passenger_phone || ""].join("|");
  return `MC${datePart}${encodeAlphaNumeric(source)}`;
}

function readLoginGuards() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_GUARD_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeLoginGuards(value) {
  localStorage.setItem(LOGIN_GUARD_KEY, JSON.stringify(value));
}

function getGuardForPhone(phone) {
  const guards = readLoginGuards();
  return guards[normalizeCustomerPhone(phone)] || null;
}

function clearGuardForPhone(phone) {
  const key = normalizeCustomerPhone(phone);
  const guards = readLoginGuards();
  delete guards[key];
  writeLoginGuards(guards);
}

function registerFailedAttempt(phone) {
  const key = normalizeCustomerPhone(phone);
  const guards = readLoginGuards();
  const current = guards[key] || { failures: 0 };
  const failures = Number(current.failures || 0) + 1;
  const next = { failures };

  if (failures >= BAN_THRESHOLD) {
    next.bannedUntil = Date.now() + BAN_HOURS * 60 * 60 * 1000;
  } else if (failures >= LOCK_THRESHOLD) {
    next.lockedUntil = Date.now() + LOCK_MINUTES * 60 * 1000;
  }

  guards[key] = next;
  writeLoginGuards(guards);
  return next;
}

function guardMessage(guard) {
  if (!guard) return "";
  if (guard.bannedUntil && Date.now() < guard.bannedUntil) {
    return "This account is temporarily banned due to multiple retries. Please try later.";
  }
  if (guard.lockedUntil && Date.now() < guard.lockedUntil) {
    return "Too many failed attempts. Account is temporarily locked.";
  }
  return "";
}

function useNextPath() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  return params.get("next") || "/home";
}

export default function CustomerLogin() {
  const navigate = useNavigate();
  const nextPath = useNextPath();
  const [session, setSession] = useState(() => readCustomerSession());

  const [mode, setMode] = useState("signin");
  const [phone, setPhone] = useState(formatCustomerPhone(session?.phone || ""));
  const [pin, setPin] = useState("");
  const [fullName, setFullName] = useState(session?.profile?.full_name || "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [completedRides, setCompletedRides] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");

  const validPhone = isValidPakistanPhone(phone);
  const validPin = /^\d{6}$/.test(pin);
  const guard = getGuardForPhone(phone);
  const blockedMessage = guardMessage(guard);
  const blocked = Boolean(blockedMessage);

  useEffect(() => {
    const syncSession = () => {
      const nextSession = readCustomerSession();
      setSession(nextSession);
      setPhone((current) => current || formatCustomerPhone(nextSession?.phone || ""));
      setFullName((current) => current || nextSession?.profile?.full_name || "");
    };

    window.addEventListener("mayaCabsCustomerSessionChanged", syncSession);
    return () => window.removeEventListener("mayaCabsCustomerSessionChanged", syncSession);
  }, []);

  const fetchCompletedRides = async () => {
    const activePhone = normalizeCustomerPhone(session?.phone || phone);
    if (!activePhone || !isValidPakistanPhone(activePhone)) {
      setCompletedRides([]);
      return;
    }

    setHistoryLoading(true);
    setHistoryError("");

    const { data, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("passenger_phone", activePhone)
      .eq("status", "completed")
      .order("booking_date", { ascending: false })
      .order("created_at", { ascending: false });

    setHistoryLoading(false);

    if (fetchError) {
      setHistoryError(fetchError.message || "Unable to load ride history.");
      setCompletedRides([]);
      return;
    }

    setCompletedRides(data || []);
  };

  useEffect(() => {
    if (!session?.phone) {
      setCompletedRides([]);
      return;
    }
    fetchCompletedRides();
  }, [session?.phone]);

  const handleSubmit = async () => {
    if (!validPhone || !validPin || blocked || (mode === "create" && !fullName.trim())) return;
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (mode === "signin") {
        await signInCustomerProfile(phone, pin);
        clearGuardForPhone(phone);
        setMessage("Signed in successfully.");
      } else {
        await upsertCustomerProfile({
          phone,
          pin,
          createOnly: true,
          profile: {
            fullName: fullName.trim(),
          },
        });
        clearGuardForPhone(phone);
        setMessage("Customer profile created and synced.");
      }
      setSession(readCustomerSession());
      navigate(nextPath);
    } catch (err) {
      if (mode === "signin") {
        const nextGuard = registerFailedAttempt(phone);
        const nextMessage = guardMessage(nextGuard);
        if (nextMessage) {
          setError(nextMessage);
          setSubmitting(false);
          return;
        }
      }
      setError(err.message || "Unable to continue.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar
        title="Customer Login"
        subtitle="Synced profile across devices"
        showBack
        onBack={() => navigate(-1)}
      />

      <main className="flex-1 px-4 pt-5 pb-10">
        <div className="bg-white rounded-3xl shadow-sm p-5 max-w-xl mx-auto">
          <div className="flex gap-2 mb-5">
            {[
              { id: "signin", label: "Sign In" },
              { id: "create", label: "Create Profile" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setMode(item.id);
                  setError("");
                  setMessage("");
                }}
                className={[
                  "flex-1 rounded-2xl px-4 py-3 text-sm font-bold transition",
                  mode === item.id
                    ? "bg-teal-700 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                ].join(" ")}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === "create" && (
              <div>
                <label className="block text-slate-700 text-xs font-semibold mb-1">Full Name</label>
                <input
                  className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-500 outline-none transition"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>
            )}

            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">Phone Number</label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-500 outline-none transition"
                value={phone}
                onChange={(e) => setPhone(normalizeCustomerPhone(e.target.value))}
                placeholder="+923001234567"
                type="tel"
              />
              <p className="text-slate-500 text-xs mt-1">Only Pakistan numbers are allowed and must begin with +92.</p>
            </div>

            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">6-Digit PIN</label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm tracking-[0.25em] focus:border-teal-500 outline-none transition"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="6-digit PIN"
                inputMode="numeric"
                type="password"
              />
            </div>

            {blockedMessage && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{blockedMessage}</div>}
            {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
            {message && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</div>}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!validPhone || !validPin || blocked || submitting || (mode === "create" && !fullName.trim())}
              className="w-full rounded-2xl bg-teal-700 py-4 text-base font-bold text-white hover:bg-teal-800 transition disabled:bg-slate-300 disabled:cursor-not-allowed"
            >
              {submitting ? "Please wait..." : mode === "signin" ? "Sign In" : "Create Synced Profile"}
            </button>

            {session && (
              <button
                type="button"
                onClick={() => {
                  clearCustomerSession();
                  setSession(null);
                  setCompletedRides([]);
                  setMessage("Signed out on this device.");
                }}
                className="w-full rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
              >
                Sign Out On This Device
              </button>
            )}
          </div>

          {session && (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div>
                  <p className="text-slate-900 font-bold text-sm">Manage Account</p>
                  <p className="text-slate-500 text-xs">
                    Signed in as {session?.profile?.full_name || "Customer"} ({formatCustomerPhone(session?.phone || "")})
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchCompletedRides}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-3">
                <p className="text-slate-700 text-xs font-semibold uppercase tracking-wide mb-2">Completed rides history</p>

                {historyLoading && <p className="text-slate-500 text-xs">Loading ride history...</p>}
                {historyError && <p className="text-red-700 text-xs">{historyError}</p>}

                {!historyLoading && !historyError && completedRides.length === 0 && (
                  <p className="text-slate-500 text-xs">No completed rides found for this account yet.</p>
                )}

                {!historyLoading && !historyError && completedRides.length > 0 && (
                  <div className="space-y-2">
                    {completedRides.map((ride) => (
                      <div key={ride.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                        <p className="text-teal-700 text-xs font-bold">Ride No: {getRideNumber(ride)}</p>
                        <p className="text-slate-800 text-xs font-semibold mt-1">
                          {formatRideDate(ride.booking_date)}{ride.slot_time ? ` · ${ride.slot_time}` : ""}
                        </p>
                        <p className="text-slate-600 text-xs mt-0.5">
                          {ride.pickup || "—"} → {ride.destination || "—"}
                        </p>
                        <p className="text-slate-600 text-xs mt-1">
                          Driver: {(ride.driver_name || "").trim() || DEFAULT_DRIVER_NAME}
                        </p>
                        <p className="text-slate-600 text-xs">
                          Vehicle: {(ride.vehicle_name || "").trim() || DEFAULT_VEHICLE_NAME}
                        </p>
                        <p className="text-slate-600 text-xs">
                          Owner / Operator: {(ride.operator_name || "").trim() || DEFAULT_OPERATOR_NAME}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <p className="text-slate-500 text-xs mt-4 leading-relaxed">
            Your profile is stored in the backend and can be used on any device after signing in with the same phone number and PIN.
          </p>
          <p className="text-slate-500 text-xs mt-2">
            Need a booking instead? <Link to={nextPath} className="text-teal-700 font-semibold hover:underline">Continue</Link>
          </p>
        </div>
      </main>
    </div>
  );
}