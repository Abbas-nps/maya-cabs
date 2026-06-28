import React, { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { supabase } from "../supabase";

const CRM_AUTH_KEY = "mayaCabsCrmAuth";
const CRM_DATA_KEY = "mayaCabsCrmData";

const MAX_ATTEMPTS_BEFORE_LOCK = 5;
const MAX_ATTEMPTS_BEFORE_BAN = 10;
const LOCK_MINUTES = 15;
const BAN_HOURS = 24;

const USERS = [
  { username: "asad", pin: "2026", name: "Asad", role: "Manager" },
  { username: "abbas", pin: "1988", name: "Abbas", role: "Owner / Oversight" },
  { username: "saad", pin: "2201", name: "Saad", role: "Director" },
  { username: "salman", pin: "2202", name: "Salman", role: "Advisor" },
  { username: "noor", pin: "2203", name: "Noor", role: "Director" },
];

const BLOCKED_USERS = ["sufiyan"];

const VIEW_ONLY_USERS = ["saad", "salman", "noor"];

const LEAD_STAGES = [
  "new-lead",
  "explained-service",
  "interested",
  "booking-confirmed",
  "dropped",
];

const LEAD_STAGE_LABELS = {
  "new-lead": "New Lead",
  "explained-service": "Explained Service",
  interested: "Interested",
  "booking-confirmed": "Booking Confirmed",
  dropped: "Dropped",
};

const LEGACY_STAGE_TO_PIPELINE = {
  new: "new-lead",
  contacted: "explained-service",
  "in-progress": "interested",
  "booking-in-process": "explained-service",
  booked: "booking-confirmed",
  lost: "dropped",
};

const LEAD_SOURCES = [
  "website-booking-form",
  "hotel-inquiry",
  "hospital-referral-nps",
  "wheelchair-customer-inquiry",
  "direct-call",
  "whatsapp",
];

const CUSTOMER_TYPES = ["end-user", "b2b"];
const EXPLAIN_METHODS = ["call", "whatsapp", "visit", "email"];
const SLOT_TYPES = ["4-hour", "6-hour", "12-hour"];
const PAYMENT_METHODS = ["cash", "bank-transfer", "easypaisa", "card", "credit"];
const BOOKING_TYPES = ["one-off", "recurring"];
const CRM_LEAD_META_MARKER = "\n\n---crm-meta---\n";

const ORG_TYPES = [
  "hotel",
  "guest-house",
  "rent-a-car",
  "hospital",
  "concierge",
  "end-user",
];

const OP_WORK_TYPES = ["vehicle-design", "regulatory", "partnership", "admin"];
const OP_STATUSES = ["todo", "in-progress", "blocked", "done"];
const BOOKING_OP_STATES = ["inquiry", "in-process", "confirmed", "completed", "cancelled"];
const BOOKING_SLOT_WINDOWS = ["8:00-12:00", "10:00-14:00", "12:00-16:00", "14:00-18:00", "18:00-22:00", "12:00-00:00"];

function mapAdminBookingStateToCrmState(status) {
  const value = String(status || "").toLowerCase();
  if (value === "pending") return "inquiry";
  if (value === "confirmed") return "confirmed";
  if (value === "completed") return "completed";
  if (value === "cancelled") return "cancelled";
  return "in-process";
}

function mapAdminBookingToCrmBookingOp(booking) {
  const slotTime = String(booking.slot_time || "").trim();
  const slotEnd = String(booking.slot_end || "").trim();
  const slotWindow = slotTime && slotEnd ? `${slotTime}-${slotEnd}` : "—";
  return {
    id: `admin-${booking.id}`,
    sourceType: "admin-live",
    createdAt: booking.created_at || nowIso(),
    leadId: "",
    city: booking.city || "Lahore",
    slotWindow,
    slotType: booking.duration ? `${booking.duration}-hour` : "—",
    bookingState: mapAdminBookingStateToCrmState(booking.status),
    queuePosition: null,
    notifyContact: booking.passenger_phone || "",
    notes: booking.pickup && booking.destination
      ? `${booking.passenger_name || "Customer"}: ${booking.pickup} -> ${booking.destination}`
      : booking.passenger_name || "",
    passengerName: booking.passenger_name || "",
    totalPkr: booking.total_pkr || null,
    rideDate: booking.booking_date || "",
    rawStatus: booking.status || "pending",
  };
}

const SEEDED_MANUAL_RIDES = [
  {
    clientName: "Faraz Sheikh",
    travelType: "Took his son to Packages Mall Lahore with family",
    hoursBooked: 4,
    rideType: "recreational",
  },
  {
    clientName: "Hamna Khwaja",
    travelType: "Took her mom for a doctor visit/appointment",
    hoursBooked: 3,
    rideType: "medical",
  },
  {
    clientName: "Khawaja Umer",
    travelType: "Took his mother for a doctor visit/appointment",
    hoursBooked: 2,
    rideType: "medical",
  },
  {
    clientName: "Sohail",
    travelType: "Mrs Sohail went shopping for her daughters wedding",
    hoursBooked: 3,
    rideType: "recreational",
  },
  {
    clientName: "Sohail",
    travelType: "Took his wife for a doctors appointment",
    hoursBooked: 3,
    rideType: "medical",
  },
  {
    clientName: "Tahira Begum",
    travelType: "Attended a wedding",
    hoursBooked: 6,
    rideType: "recreational",
  },
  {
    clientName: "Mr Khwaja",
    travelType: "Took his mom to a wedding",
    hoursBooked: 6,
    rideType: "recreational",
  },
  {
    clientName: "Mr Khawaja",
    travelType: "Doctor's appointment",
    hoursBooked: 6,
    rideType: "medical",
  },
];

function nowIso() {
  return new Date().toISOString();
}

function serializeLeadNotes(visibleNotes, extraFields) {
  const notes = String(visibleNotes || "").trim();
  const payload = JSON.stringify(extraFields || {});
  return `${notes}${CRM_LEAD_META_MARKER}${payload}`;
}

function deserializeLeadNotes(rawNotes) {
  const value = String(rawNotes || "");
  const markerIndex = value.indexOf(CRM_LEAD_META_MARKER);
  if (markerIndex === -1) {
    return {
      notes: value,
      meta: {},
    };
  }

  const visible = value.slice(0, markerIndex).trim();
  const metaRaw = value.slice(markerIndex + CRM_LEAD_META_MARKER.length).trim();
  try {
    return {
      notes: visible,
      meta: JSON.parse(metaRaw || "{}"),
    };
  } catch {
    return {
      notes: value,
      meta: {},
    };
  }
}

function mapStageToDb(stage) {
  switch (normalizeLeadStage(stage)) {
    case "new-lead":
      return "new";
    case "explained-service":
      return "booking-in-process";
    case "interested":
      return "in-progress";
    case "booking-confirmed":
      return "booked";
    case "dropped":
      return "lost";
    default:
      return "new";
  }
}

function mapDbLeadToApp(row) {
  const { notes, meta } = deserializeLeadNotes(row.notes);
  return {
    id: row.id,
    createdAt: row.created_at || nowIso(),
    source: row.source || "website-booking-form",
    orgType: row.org_type || "hotel",
    orgName: row.org_name || "",
    contactName: row.contact_name || "",
    contactRole: row.contact_role || "",
    phone: row.phone || "",
    receivedDate: meta.receivedDate || String(row.created_at || "").slice(0, 10),
    city: row.city || "Lahore",
    customerType: meta.customerType || "end-user",
    stage: normalizeLeadStage(meta.stage || row.stage),
    owner: row.owner_name || "Asad",
    explainedDate: meta.explainedDate || "",
    explainedMethod: meta.explainedMethod || "call",
    objections: meta.objections || "",
    slotTypeInterested: meta.slotTypeInterested || "4-hour",
    dateNeeded: meta.dateNeeded || "",
    decisionMaker: meta.decisionMaker || "",
    finalPrice: meta.finalPrice || "",
    paymentMethod: meta.paymentMethod || "cash",
    bookingDate: meta.bookingDate || "",
    slotDuration: meta.slotDuration || "4-hour",
    bookingType: meta.bookingType || "one-off",
    revenue: meta.revenue || "",
    nextBookingDate: meta.nextBookingDate || "",
    discoveredAdmins: meta.discoveredAdmins || "",
    waitingOn: meta.waitingOn || "",
    termsWanted: meta.termsWanted || "",
    followUpDue: meta.followUpDue || "",
    notes,
  };
}

function mapAppLeadToDb(lead, actorName) {
  return {
    id: lead.id,
    source: lead.source || "website-booking-form",
    org_type: lead.orgType || "hotel",
    org_name: lead.orgName || "",
    contact_name: lead.contactName || "",
    contact_role: lead.contactRole || "",
    phone: lead.phone || "",
    city: lead.city || "Lahore",
    stage: mapStageToDb(lead.stage),
    owner_name: lead.owner || "Asad",
    created_by: actorName || "CRM",
    notes: serializeLeadNotes(lead.notes, {
      stage: normalizeLeadStage(lead.stage),
      receivedDate: lead.receivedDate || "",
      customerType: lead.customerType || "end-user",
      explainedDate: lead.explainedDate || "",
      explainedMethod: lead.explainedMethod || "call",
      objections: lead.objections || "",
      slotTypeInterested: lead.slotTypeInterested || "4-hour",
      dateNeeded: lead.dateNeeded || "",
      decisionMaker: lead.decisionMaker || "",
      finalPrice: lead.finalPrice || "",
      paymentMethod: lead.paymentMethod || "cash",
      bookingDate: lead.bookingDate || "",
      slotDuration: lead.slotDuration || "4-hour",
      bookingType: lead.bookingType || "one-off",
      revenue: lead.revenue || "",
      nextBookingDate: lead.nextBookingDate || "",
      discoveredAdmins: lead.discoveredAdmins || "",
      waitingOn: lead.waitingOn || "",
      termsWanted: lead.termsWanted || "",
      followUpDue: lead.followUpDue || "",
    }),
  };
}

function normalizeLeadStage(stage) {
  if (LEAD_STAGES.includes(stage)) return stage;
  return LEGACY_STAGE_TO_PIPELINE[stage] || "new-lead";
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function manualRideSignature(ride) {
  return [
    String(ride.clientName || "").trim().toLowerCase(),
    String(ride.travelType || "").trim().toLowerCase(),
    String(ride.hoursBooked || ""),
  ].join("|");
}

function buildSeededManualRides() {
  const seededAt = nowIso();
  return SEEDED_MANUAL_RIDES.map((ride) => ({
    id: crypto.randomUUID(),
    createdAt: seededAt,
    createdBy: "System Seed",
    clientName: ride.clientName,
    hoursBooked: ride.hoursBooked,
    rideType: ride.rideType,
    travelType: ride.travelType,
  }));
}

function mergeSeededManualRides(existingManualRides) {
  const existing = Array.isArray(existingManualRides) ? existingManualRides : [];
  const existingSignatures = new Set(existing.map((ride) => manualRideSignature(ride)));
  const missingSeeds = buildSeededManualRides().filter((ride) => !existingSignatures.has(manualRideSignature(ride)));
  return [...existing, ...missingSeeds];
}

function defaultCrmData() {
  return {
    leads: [
      {
        id: crypto.randomUUID(),
        createdAt: nowIso(),
        source: "New Pak Surgical",
        orgType: "hospital",
        orgName: "New Pak Surgical Referral Desk",
        contactName: "Lead Coordinator",
        contactRole: "Coordinator",
        phone: "0339-6292222",
        city: "Lahore",
        stage: "explained-service",
        owner: "Asad",
        receivedDate: nowIso().slice(0, 10),
        customerType: "b2b",
        explainedDate: "",
        explainedMethod: "call",
        objections: "",
        slotTypeInterested: "4-hour",
        dateNeeded: "",
        decisionMaker: "",
        finalPrice: "",
        paymentMethod: "cash",
        bookingDate: "",
        slotDuration: "4-hour",
        bookingType: "one-off",
        revenue: "",
        nextBookingDate: "",
        discoveredAdmins: "",
        waitingOn: "Hospital approval window",
        termsWanted: "Pilot with discounted first rides",
        followUpDue: "",
        notes: "Wheelchair user referrals need 24h follow-up",
      },
    ],
    bookingOps: [],
    manualRides: buildSeededManualRides(),
    interactions: [],
    feedbackLogs: [],
    appointments: [],
    operations: [],
  };
}

function readCrmData() {
  const data = readJson(CRM_DATA_KEY, defaultCrmData());
  return {
    ...data,
    leads: (data?.leads || []).map((lead) => ({
      ...lead,
      stage: normalizeLeadStage(lead.stage),
      receivedDate: lead.receivedDate || String(lead.createdAt || "").slice(0, 10),
      customerType: lead.customerType || "end-user",
      explainedMethod: lead.explainedMethod || "call",
      slotTypeInterested: lead.slotTypeInterested || "4-hour",
      paymentMethod: lead.paymentMethod || "cash",
      slotDuration: lead.slotDuration || "4-hour",
      bookingType: lead.bookingType || "one-off",
    })),
    manualRides: mergeSeededManualRides(data?.manualRides),
  };
}

function writeCrmData(data) {
  writeJson(CRM_DATA_KEY, data);
}

function readAuth() {
  return readJson(CRM_AUTH_KEY, {});
}

function writeAuth(next) {
  writeJson(CRM_AUTH_KEY, next);
}

function getUserAuthState(username) {
  const all = readAuth();
  return all[username] || { failedAttempts: 0, lockedUntil: null, bannedUntil: null };
}

function setUserAuthState(username, state) {
  const all = readAuth();
  all[username] = state;
  writeAuth(all);
}

function loginAttempt(username, pin) {
  if (BLOCKED_USERS.includes(username)) {
    return { ok: false, message: "Access denied. This account is blocked." };
  }

  const user = USERS.find((u) => u.username === username);
  if (!user) return { ok: false, message: "Invalid credentials." };

  const state = getUserAuthState(username);
  const now = Date.now();
  const bannedUntil = state.bannedUntil ? new Date(state.bannedUntil).getTime() : 0;
  const lockedUntil = state.lockedUntil ? new Date(state.lockedUntil).getTime() : 0;

  if (bannedUntil > now) {
    return {
      ok: false,
      message: `Account banned until ${new Date(bannedUntil).toLocaleString()}.`,
    };
  }

  if (lockedUntil > now) {
    return {
      ok: false,
      message: `Account temporarily locked until ${new Date(lockedUntil).toLocaleTimeString()}.`,
    };
  }

  if (user.pin === pin) {
    setUserAuthState(username, { failedAttempts: 0, lockedUntil: null, bannedUntil: null });
    return { ok: true, user };
  }

  const nextAttempts = (state.failedAttempts || 0) + 1;
  const nextState = {
    failedAttempts: nextAttempts,
    lockedUntil:
      nextAttempts >= MAX_ATTEMPTS_BEFORE_LOCK && nextAttempts < MAX_ATTEMPTS_BEFORE_BAN
        ? new Date(now + LOCK_MINUTES * 60 * 1000).toISOString()
        : null,
    bannedUntil:
      nextAttempts >= MAX_ATTEMPTS_BEFORE_BAN
        ? new Date(now + BAN_HOURS * 60 * 60 * 1000).toISOString()
        : null,
  };
  setUserAuthState(username, nextState);

  if (nextState.bannedUntil) {
    return { ok: false, message: "Too many failed attempts. Account banned for 24 hours." };
  }
  if (nextState.lockedUntil) {
    return { ok: false, message: "Too many failed attempts. Account locked for 15 minutes." };
  }
  return {
    ok: false,
    message: `Invalid PIN. Attempt ${nextAttempts}/${MAX_ATTEMPTS_BEFORE_LOCK} before temporary lock.`,
  };
}

function SectionCard({ title, subtitle, right, children }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200">
      <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
        <div>
          <div className="font-bold text-slate-900 text-sm">{title}</div>
          {subtitle ? <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function StatusBadge({ value }) {
  const cls =
    value === "booking-confirmed" || value === "booked"
      ? "bg-emerald-100 text-emerald-700"
      : value === "explained-service" || value === "booking-in-process"
      ? "bg-amber-100 text-amber-700"
      : value === "interested" || value === "in-progress"
      ? "bg-sky-100 text-sky-700"
      : value === "dropped" || value === "lost"
      ? "bg-rose-100 text-rose-700"
      : "bg-slate-100 text-slate-700";
  return <span className={`text-xs font-bold px-2 py-1 rounded-full ${cls}`}>{LEAD_STAGE_LABELS[value] || value}</span>;
}

function CrmLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const result = loginAttempt(username.trim().toLowerCase(), pin.trim());
    if (!result.ok) {
      setError(result.message);
      setPin("");
      return;
    }

    const session = {
      username: result.user.username,
      name: result.user.name,
      role: result.user.role,
      loginAt: nowIso(),
    };
    onLogin(session);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900">Maya Cabs CRM</h1>
          <p className="text-slate-500 text-sm mt-1">
            Project of New Pak Surgical · Secure access for Asad and board
          </p>
        </div>

        <form className="flex flex-col gap-3" onSubmit={submit}>
          <label className="text-xs font-semibold text-slate-600">User</label>
          <input
            type="text"
            autoCapitalize="none"
            autoCorrect="off"
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter username"
          />

          <label className="text-xs font-semibold text-slate-600 mt-1">PIN</label>
          <input
            type="password"
            className="rounded-xl border border-slate-200 px-3 py-3 text-sm"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter secure PIN"
          />

          {error ? <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</div> : null}

          <button
            type="submit"
            className="mt-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold py-3"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 text-[11px] text-slate-500 leading-relaxed">
          Security policy: failed attempts are rate-limited, temporary lock after 5 wrong PINs, and 24-hour ban after 10 wrong PINs.
        </div>
      </div>
    </div>
  );
}

function CrmApp({ session, onLogout }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [data, setData] = useState(() => readCrmData());

  const [leadForm, setLeadForm] = useState({
    source: "website-booking-form",
    orgType: "hotel",
    orgName: "",
    contactName: "",
    contactRole: "",
    phone: "",
    receivedDate: new Date().toISOString().slice(0, 10),
    city: "Lahore",
    customerType: "end-user",
    stage: "new-lead",
    owner: "Asad",
    explainedDate: "",
    explainedMethod: "call",
    objections: "",
    slotTypeInterested: "4-hour",
    dateNeeded: "",
    decisionMaker: "",
    finalPrice: "",
    paymentMethod: "cash",
    bookingDate: "",
    slotDuration: "4-hour",
    bookingType: "one-off",
    revenue: "",
    nextBookingDate: "",
    discoveredAdmins: "",
    waitingOn: "",
    termsWanted: "",
    followUpDue: "",
    notes: "",
  });
  const [leadEditId, setLeadEditId] = useState("");
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [leadViewId, setLeadViewId] = useState("");
  const [leadSearch, setLeadSearch] = useState("");
  const [leadStageFilter, setLeadStageFilter] = useState("all");
  const [leadCityFilter, setLeadCityFilter] = useState("all");
  const [leadTypeFilter, setLeadTypeFilter] = useState("all");
  const [leadSourceFilter, setLeadSourceFilter] = useState("all");
  const [leadSyncMode, setLeadSyncMode] = useState("checking");
  const [leadSyncMessage, setLeadSyncMessage] = useState("");
  const [liveBookings, setLiveBookings] = useState([]);
  const [liveBookingsMessage, setLiveBookingsMessage] = useState("Loading live bookings from admin...");

  const [interactionForm, setInteractionForm] = useState({
    leadId: "",
    channel: "call",
    spokeToName: "",
    spokeToRole: "",
    spokeToPhone: "",
    discoveredAdmins: "",
    waitingOn: "",
    termsWanted: "",
    followUpDue: "",
    summary: "",
    nextStep: "",
  });

  const [appointmentForm, setAppointmentForm] = useState({
    title: "",
    city: "Lahore",
    dateTime: "",
    withWhom: "",
    linkedLeadId: "",
    status: "scheduled",
  });

  const [opsForm, setOpsForm] = useState({
    title: "",
    workType: "regulatory",
    owner: "Asad",
    dueDate: "",
    status: "todo",
    notes: "",
  });

  const [feedbackForm, setFeedbackForm] = useState({
    bookingId: "",
    riderName: "",
    source: "New Pak Surgical",
    isWheelchairCustomer: true,
    incentiveDiscountPercent: "",
    feedbackSummary: "",
    followUpDue: "",
  });

  const [bookingOpsForm, setBookingOpsForm] = useState({
    leadId: "",
    city: "Lahore",
    slotWindow: "10:00-14:00",
    slotType: "4-hour",
    bookingState: "inquiry",
    queuePosition: "",
    notifyContact: "",
    notes: "",
  });

  const [manualRideForm, setManualRideForm] = useState({
    clientName: "",
    hoursBooked: "",
    rideType: "medical",
    travelType: "",
  });

  const updateData = (next) => {
    setData(next);
    writeCrmData(next);
  };

  const leadBeingViewed = useMemo(() => {
    if (!leadViewId) return null;
    return (data.leads || []).find((lead) => lead.id === leadViewId) || null;
  }, [data.leads, leadViewId]);

  useEffect(() => {
    if (leadViewId && !leadBeingViewed) {
      setLeadViewId("");
    }
  }, [leadViewId, leadBeingViewed]);

  const persistLeadToSharedStore = async (lead) => {
    const payload = mapAppLeadToDb(lead, session?.name);
    console.log("🔄 Persisting lead to Supabase:", payload);
    const { error } = await supabase.from("crm_leads").upsert(payload, { onConflict: "id" });
    if (error) {
      console.error("❌ Supabase upsert error:", error);
      throw error;
    }
    console.log("✅ Lead persisted successfully");
  };

  useEffect(() => {
    let active = true;

    async function loadSharedLeads() {
      setLeadSyncMode("checking");
      setLeadSyncMessage("");
      const localData = readCrmData();
      console.log("🔍 Checking shared lead sync... Local leads found:", localData.leads?.length || 0);
      const { data: rows, error } = await supabase
        .from("crm_leads")
        .select("*")
        .order("updated_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.warn("⚠️ Supabase query error:", error);
        setLeadSyncMode("local");
        setLeadSyncMessage("CRM leads are currently device-local only. Shared Supabase lead sync is not enabled yet.");
        return;
      }

      console.log("✅ Supabase query success. Remote leads found:", rows?.length || 0);
      let sharedLeads = (rows || []).map(mapDbLeadToApp);
      if (!sharedLeads.length && (localData.leads || []).length) {
        console.log("🔄 Bootstrap: Pushing local leads to Supabase...");
        try {
          await Promise.all((localData.leads || []).map((lead) => persistLeadToSharedStore(lead)));
          sharedLeads = localData.leads || [];
          setLeadSyncMessage("Shared lead sync is active. Existing local leads on this browser were pushed to Supabase.");
          console.log("✅ Bootstrap complete:", sharedLeads.length, "leads pushed");
        } catch (bootstrapError) {
          console.error("❌ Bootstrap error:", bootstrapError);
          setLeadSyncMode("local");
          setLeadSyncMessage(bootstrapError?.message || "Shared sync is available, but initial lead upload failed.");
          return;
        }
      }

      setLeadSyncMode("shared");
      if (!leadSyncMessage) {
        setLeadSyncMessage(sharedLeads.length ? "Shared lead sync is active." : "Shared lead sync is active. No remote leads found yet.");
      }
      console.log("📊 Final state: mode=shared, leads=", sharedLeads.length);
      updateData({
        ...localData,
        ...data,
        leads: sharedLeads.length ? sharedLeads : localData.leads,
      });
    }

    loadSharedLeads();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadLiveBookings = async () => {
      const { data: rows, error } = await supabase
        .from("bookings")
        .select("id, passenger_name, passenger_phone, city, pickup, destination, booking_date, slot_time, slot_end, duration, total_pkr, status, created_at")
        .order("created_at", { ascending: false })
        .limit(120);

      if (!active) return;

      if (error) {
        setLiveBookings([]);
        setLiveBookingsMessage(error?.message || "Live booking sync from admin is currently unavailable.");
        return;
      }

      const rowsList = rows || [];
      setLiveBookings(rowsList);
      setLiveBookingsMessage(rowsList.length ? "Live bookings are synced from admin." : "No live bookings found in admin yet.");
    };

    loadLiveBookings();
    const intervalId = setInterval(loadLiveBookings, 30000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, []);

  const resetLeadForm = () => {
    setLeadForm((prev) => ({
      ...prev,
      orgName: "",
      contactName: "",
      contactRole: "",
      phone: "",
      receivedDate: new Date().toISOString().slice(0, 10),
      city: "Lahore",
      customerType: "end-user",
      stage: "new-lead",
      orgType: "hotel",
      source: "website-booking-form",
      explainedDate: "",
      explainedMethod: "call",
      objections: "",
      slotTypeInterested: "4-hour",
      dateNeeded: "",
      decisionMaker: "",
      finalPrice: "",
      paymentMethod: "cash",
      bookingDate: "",
      slotDuration: "4-hour",
      bookingType: "one-off",
      revenue: "",
      nextBookingDate: "",
      discoveredAdmins: "",
      waitingOn: "",
      termsWanted: "",
      followUpDue: "",
      notes: "",
    }));
  };

  const startCreateLead = () => {
    setLeadEditId("");
    resetLeadForm();
    setShowLeadModal(true);
  };

  const startEditLead = (lead) => {
    setLeadEditId(lead.id);
    setLeadForm({
      source: lead.source || "website-booking-form",
      orgType: lead.orgType || "hotel",
      orgName: lead.orgName || "",
      contactName: lead.contactName || "",
      contactRole: lead.contactRole || "",
      phone: lead.phone || "",
      receivedDate: lead.receivedDate || String(lead.createdAt || "").slice(0, 10),
      city: lead.city || "Lahore",
      customerType: lead.customerType || "end-user",
      stage: normalizeLeadStage(lead.stage),
      owner: lead.owner || "Asad",
      explainedDate: lead.explainedDate || "",
      explainedMethod: lead.explainedMethod || "call",
      objections: lead.objections || "",
      slotTypeInterested: lead.slotTypeInterested || "4-hour",
      dateNeeded: lead.dateNeeded || "",
      decisionMaker: lead.decisionMaker || "",
      finalPrice: lead.finalPrice || "",
      paymentMethod: lead.paymentMethod || "cash",
      bookingDate: lead.bookingDate || "",
      slotDuration: lead.slotDuration || "4-hour",
      bookingType: lead.bookingType || "one-off",
      revenue: lead.revenue || "",
      nextBookingDate: lead.nextBookingDate || "",
      discoveredAdmins: lead.discoveredAdmins || "",
      waitingOn: lead.waitingOn || "",
      termsWanted: lead.termsWanted || "",
      followUpDue: lead.followUpDue || "",
      notes: lead.notes || "",
    });
    setShowLeadModal(true);
  };

  const openLead = (leadId) => {
    setLeadViewId(leadId);
  };

  const updateLead = (leadId, updater) => {
    const next = {
      ...data,
      leads: (data.leads || []).map((lead) => {
        if (lead.id !== leadId) return lead;
        return {
          ...lead,
          ...updater(lead),
        };
      }),
    };
    updateData(next);
    return next.leads.find((lead) => lead.id === leadId) || null;
  };

  const updateLeadAndPersist = async (leadId, updater) => {
    const updatedLead = updateLead(leadId, updater);
    if (leadSyncMode === "shared" && updatedLead) {
      try {
        await persistLeadToSharedStore(updatedLead);
      } catch (error) {
        setLeadSyncMode("local");
        setLeadSyncMessage(error?.message || "Lead updated locally, but shared sync failed.");
      }
    }
    return updatedLead;
  };

  const deleteLead = async (leadId) => {
    if (session.username !== "abbas") {
      alert("Only Abbas can delete leads.");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this lead?")) return;

    const previousLeads = data.leads;
    const next = {
      ...data,
      leads: data.leads.filter((l) => l.id !== leadId),
    };
    updateData(next);

    if (leadSyncMode === "shared") {
      try {
        const { error } = await supabase.from("crm_leads").delete().eq("id", leadId);
        if (error) {
          throw error;
        }
        setLeadSyncMessage("Lead deleted from shared CRM successfully.");
      } catch (error) {
        console.error("Failed to delete from shared store:", error);
        updateData({
          ...data,
          leads: previousLeads,
        });
        setLeadSyncMessage(error?.message || "Delete failed on shared CRM. Lead was restored locally.");
      }
    }
  };

  const addLead = async () => {
    if (!leadForm.orgName.trim() || !leadForm.contactName.trim() || !leadForm.phone.trim()) return;
    const normalizedLead = {
      ...leadForm,
      stage: normalizeLeadStage(leadForm.stage),
      orgName: leadForm.orgName.trim(),
      contactName: leadForm.contactName.trim(),
      contactRole: leadForm.contactRole.trim(),
      phone: leadForm.phone.trim(),
      decisionMaker: String(leadForm.decisionMaker || "").trim(),
      finalPrice: String(leadForm.finalPrice || "").trim(),
      revenue: String(leadForm.revenue || "").trim(),
      discoveredAdmins: leadForm.discoveredAdmins.trim(),
      waitingOn: leadForm.waitingOn.trim(),
      termsWanted: leadForm.termsWanted.trim(),
      notes: leadForm.notes.trim(),
    };

    if (leadEditId) {
      await updateLeadAndPersist(leadEditId, () => normalizedLead);
    } else {
      const newLead = {
        id: crypto.randomUUID(),
        createdAt: nowIso(),
        ...normalizedLead,
      };
      const next = {
        ...data,
        leads: [
          newLead,
          ...data.leads,
        ],
      };
      updateData(next);
      if (leadSyncMode === "shared") {
        try {
          await persistLeadToSharedStore(newLead);
        } catch (error) {
          setLeadSyncMode("local");
          setLeadSyncMessage(error?.message || "Lead saved locally, but shared sync failed.");
        }
      }
    }

    setLeadEditId("");
    resetLeadForm();
    setShowLeadModal(false);
  };

  const addInteraction = () => {
    if (!interactionForm.leadId || !interactionForm.summary.trim()) return;
    const next = {
      ...data,
      interactions: [
        {
          id: crypto.randomUUID(),
          createdAt: nowIso(),
          by: session.name,
          ...interactionForm,
          spokeToName: interactionForm.spokeToName.trim(),
          spokeToRole: interactionForm.spokeToRole.trim(),
          spokeToPhone: interactionForm.spokeToPhone.trim(),
          discoveredAdmins: interactionForm.discoveredAdmins.trim(),
          waitingOn: interactionForm.waitingOn.trim(),
          termsWanted: interactionForm.termsWanted.trim(),
          summary: interactionForm.summary.trim(),
          nextStep: interactionForm.nextStep.trim(),
        },
        ...data.interactions,
      ],
    };
    updateData(next);
    setInteractionForm((prev) => ({
      ...prev,
      spokeToName: "",
      spokeToRole: "",
      spokeToPhone: "",
      discoveredAdmins: "",
      waitingOn: "",
      termsWanted: "",
      followUpDue: "",
      summary: "",
      nextStep: "",
    }));
  };

  const addAppointment = () => {
    if (!appointmentForm.title.trim() || !appointmentForm.dateTime) return;
    const next = {
      ...data,
      appointments: [
        {
          id: crypto.randomUUID(),
          createdAt: nowIso(),
          ...appointmentForm,
          title: appointmentForm.title.trim(),
          withWhom: appointmentForm.withWhom.trim(),
        },
        ...data.appointments,
      ],
    };
    updateData(next);
    setAppointmentForm((prev) => ({ ...prev, title: "", dateTime: "", withWhom: "" }));
  };

  const addOps = () => {
    if (!opsForm.title.trim()) return;
    const next = {
      ...data,
      operations: [
        {
          id: crypto.randomUUID(),
          createdAt: nowIso(),
          ...opsForm,
          title: opsForm.title.trim(),
          notes: opsForm.notes.trim(),
        },
        ...data.operations,
      ],
    };
    updateData(next);
    setOpsForm((prev) => ({ ...prev, title: "", dueDate: "", notes: "" }));
  };

  const addFeedbackLog = () => {
    if (!feedbackForm.feedbackSummary.trim()) return;
    const next = {
      ...data,
      feedbackLogs: [
        {
          id: crypto.randomUUID(),
          createdAt: nowIso(),
          capturedBy: session.name,
          bookingId: feedbackForm.bookingId || null,
          riderName: feedbackForm.riderName.trim(),
          source: feedbackForm.source,
          isWheelchairCustomer: Boolean(feedbackForm.isWheelchairCustomer),
          incentiveDiscountPercent: Number(feedbackForm.incentiveDiscountPercent) || 0,
          feedbackSummary: feedbackForm.feedbackSummary.trim(),
          followUpDue: feedbackForm.followUpDue || null,
        },
        ...(data.feedbackLogs || []),
      ],
    };
    updateData(next);
    setFeedbackForm((prev) => ({
      ...prev,
      bookingId: "",
      riderName: "",
      incentiveDiscountPercent: "",
      feedbackSummary: "",
      followUpDue: "",
    }));
  };

  const addBookingOps = () => {
    if (!bookingOpsForm.bookingState || !bookingOpsForm.slotWindow) return;
    const next = {
      ...data,
      bookingOps: [
        {
          id: crypto.randomUUID(),
          createdAt: nowIso(),
          ...bookingOpsForm,
          queuePosition: Number(bookingOpsForm.queuePosition) || null,
          notes: bookingOpsForm.notes.trim(),
          notifyContact: bookingOpsForm.notifyContact.trim(),
        },
        ...(data.bookingOps || []),
      ],
    };
    updateData(next);
    setBookingOpsForm((prev) => ({
      ...prev,
      leadId: "",
      queuePosition: "",
      notifyContact: "",
      notes: "",
      bookingState: "inquiry",
    }));
  };

  const addManualRide = () => {
    if (!manualRideForm.clientName.trim() || !manualRideForm.hoursBooked) return;

    const hoursBooked = Number(manualRideForm.hoursBooked);
    if (!Number.isFinite(hoursBooked) || hoursBooked <= 0) return;

    const next = {
      ...data,
      manualRides: [
        {
          id: crypto.randomUUID(),
          createdAt: nowIso(),
          createdBy: session.name,
          clientName: manualRideForm.clientName.trim(),
          hoursBooked,
          rideType: manualRideForm.rideType,
          travelType: manualRideForm.travelType.trim(),
        },
        ...(data.manualRides || []),
      ],
    };
    updateData(next);

    setManualRideForm((prev) => ({
      ...prev,
      clientName: "",
      hoursBooked: "",
      travelType: "",
      rideType: "medical",
    }));
  };

  const leadMap = useMemo(() => {
    const out = {};
    data.leads.forEach((l) => {
      out[l.id] = l;
    });
    return out;
  }, [data.leads]);

  const stageCounts = useMemo(() => {
    const base = LEAD_STAGES.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {});
    data.leads.forEach((l) => {
      const stage = normalizeLeadStage(l.stage);
      if (base[stage] !== undefined) base[stage] += 1;
    });

    // Treat manual booking logs as booked outcomes so funnel reflects real captured bookings.
    const manualBookedCount = (data.manualRides || []).length;
    base["booking-confirmed"] += manualBookedCount;

    return base;
  }, [data.leads, data.manualRides]);

  const bookingStateCounts = useMemo(() => {
    const liveBookingOps = (liveBookings || []).map(mapAdminBookingToCrmBookingOp);
    const combinedBookingOps = [...liveBookingOps, ...(data.bookingOps || [])];
    const base = BOOKING_OP_STATES.reduce((acc, s) => {
      acc[s] = 0;
      return acc;
    }, {});
    combinedBookingOps.forEach((b) => {
      if (base[b.bookingState] !== undefined) base[b.bookingState] += 1;
    });
    return base;
  }, [liveBookings, data.bookingOps]);

  const liveBookingOps = useMemo(() => {
    return (liveBookings || []).map(mapAdminBookingToCrmBookingOp);
  }, [liveBookings]);

  const combinedBookingOps = useMemo(() => {
    return [...liveBookingOps, ...(data.bookingOps || [])];
  }, [liveBookingOps, data.bookingOps]);

  const leadCities = useMemo(() => {
    return Array.from(new Set((data.leads || []).map((lead) => lead.city).filter(Boolean))).sort();
  }, [data.leads]);

  const leadSources = useMemo(() => {
    return Array.from(new Set((data.leads || []).map((lead) => lead.source).filter(Boolean))).sort();
  }, [data.leads]);

  const filteredLeads = useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    return (data.leads || []).filter((lead) => {
      const stage = normalizeLeadStage(lead.stage);
      if (leadStageFilter !== "all" && stage !== leadStageFilter) return false;
      if (leadCityFilter !== "all" && lead.city !== leadCityFilter) return false;
      if (leadTypeFilter !== "all" && (lead.customerType || "end-user") !== leadTypeFilter) return false;
      if (leadSourceFilter !== "all" && lead.source !== leadSourceFilter) return false;
      if (!q) return true;

      const haystack = [
        lead.orgName,
        lead.contactName,
        lead.phone,
        lead.city,
        lead.orgType,
        lead.source,
        lead.notes,
        lead.customerType,
        lead.decisionMaker,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [data.leads, leadSearch, leadStageFilter, leadCityFilter, leadTypeFilter, leadSourceFilter]);

  const leadsByStage = useMemo(() => {
    const out = LEAD_STAGES.reduce((acc, stage) => {
      acc[stage] = [];
      return acc;
    }, {});
    filteredLeads.forEach((lead) => {
      const stage = normalizeLeadStage(lead.stage);
      if (out[stage]) out[stage].push(lead);
    });
    return out;
  }, [filteredLeads]);

  const analytics = useMemo(() => {
    const bookingOps = combinedBookingOps;
    const feedbackLogs = data.feedbackLogs || [];
    const manualRides = data.manualRides || [];
    const wheelchairFeedback = feedbackLogs.filter((f) => f.isWheelchairCustomer);
    const openFollowUps = feedbackLogs.filter((f) => f.followUpDue);
    const completedBookingOps = bookingOps.filter((b) => b.bookingState === "completed");
    const medicalRides = manualRides.filter((r) => r.rideType === "medical");
    const recreationalRides = manualRides.filter((r) => r.rideType === "recreational");
    const totalManualHours = manualRides.reduce((sum, r) => sum + (Number(r.hoursBooked) || 0), 0);
    const medicalHours = medicalRides.reduce((sum, r) => sum + (Number(r.hoursBooked) || 0), 0);
    const recreationalHours = recreationalRides.reduce((sum, r) => sum + (Number(r.hoursBooked) || 0), 0);
    const medicalToRecreationalRatio = `${medicalRides.length}:${recreationalRides.length}`;

    return {
      completedBookingOps: completedBookingOps.length,
      totalFeedbackLogs: feedbackLogs.length,
      wheelchairFeedbackCount: wheelchairFeedback.length,
      openFollowUpsCount: openFollowUps.length,
      totalManualRides: manualRides.length,
      totalManualHours,
      medicalRideCount: medicalRides.length,
      recreationalRideCount: recreationalRides.length,
      medicalHours,
      recreationalHours,
      medicalToRecreationalRatio,
    };
  }, [combinedBookingOps, data.feedbackLogs, data.manualRides]);

  const todayDate = new Date().toISOString().slice(0, 10);
  const todaysAppointments = data.appointments.filter((a) => String(a.dateTime || "").startsWith(todayDate));

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="bg-teal-800 text-white px-4 py-4 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div>
            <div className="font-extrabold text-lg">Maya Cabs CRM</div>
            <div className="text-teal-100 text-xs">Wheelchair Accessible Mobility · New Pak Surgical</div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-sm font-bold">{session.name}</div>
              <div className="text-[11px] text-teal-100">{session.role}</div>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-xl bg-white/20 hover:bg-white/30 px-3 py-2 text-xs font-bold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-2 mb-4">
          {[
            ["dashboard", "Dashboard"],
            ["leads", "Lead Pipeline"],
            ["booking-ops", "Booking Operations"],
            ["interactions", "Interaction Log"],
            ["appointments", "Appointments"],
            ["operations", "Operations / Compliance"],
            ["analytics", "Feedback & Analytics"],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`rounded-full px-4 py-2 text-xs font-bold border ${
                activeTab === id
                  ? "bg-teal-700 text-white border-teal-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="Lead Funnel" subtitle="Track who is making a booking and who is still in process">
              <div className="grid grid-cols-2 gap-2">
                {LEAD_STAGES.map((s) => (
                  <div key={s} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-xs text-slate-500 capitalize">{s.replaceAll("-", " ")}</div>
                    <div className="text-xl font-extrabold text-slate-900">{stageCounts[s] || 0}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Today’s Appointments" subtitle="Calls, meetings and follow-ups">
              {todaysAppointments.length ? (
                <div className="flex flex-col gap-2">
                  {todaysAppointments.map((a) => (
                    <div key={a.id} className="rounded-xl border border-slate-200 p-3 bg-white">
                      <div className="font-bold text-sm text-slate-900">{a.title}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(a.dateTime).toLocaleString()} · {a.city}</div>
                      <div className="text-xs text-slate-600 mt-1">With: {a.withWhom || "—"}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-slate-500">No appointments scheduled for today.</div>
              )}
            </SectionCard>

            <SectionCard title="Non-Client Work" subtitle="Vehicle design, regulatory approvals, and internal tasks">
              <div className="flex flex-col gap-2">
                {data.operations.slice(0, 6).map((op) => (
                  <div key={op.id} className="rounded-xl border border-slate-200 p-3 bg-white">
                    <div className="font-bold text-sm text-slate-900">{op.title}</div>
                    <div className="text-xs text-slate-500 mt-1 capitalize">
                      {op.workType.replace("-", " ")} · {op.status} · Owner: {op.owner}
                    </div>
                  </div>
                ))}
                {!data.operations.length && <div className="text-sm text-slate-500">No operational work logged yet.</div>}
              </div>
            </SectionCard>

            <SectionCard title="Booking Operations" subtitle="Inquiries, in-process, confirmed, completed">
              <div className="grid grid-cols-2 gap-2">
                {BOOKING_OP_STATES.map((state) => (
                  <div key={state} className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                    <div className="text-xs text-slate-500 capitalize">{state.replaceAll("-", " ")}</div>
                    <div className="text-xl font-extrabold text-slate-900">{bookingStateCounts[state] || 0}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Feedback Coverage" subtitle="Customer feedback logging and follow-up health">
              <div className="text-sm text-slate-700 flex flex-col gap-2">
                <div className="flex justify-between"><span>Feedback Logs</span><span className="font-bold">{analytics.totalFeedbackLogs}</span></div>
                <div className="flex justify-between"><span>Wheelchair Customer Feedback</span><span className="font-bold">{analytics.wheelchairFeedbackCount}</span></div>
                <div className="flex justify-between"><span>Open Follow-ups</span><span className="font-bold text-amber-700">{analytics.openFollowUpsCount}</span></div>
              </div>
            </SectionCard>

            <SectionCard title="Manual Booking Entry" subtitle="Add ride logs by client name, hours, and ride type">
              <div className="flex flex-col gap-2">
                <input
                  className="input"
                  placeholder="Client name"
                  value={manualRideForm.clientName}
                  onChange={(e) => setManualRideForm({ ...manualRideForm, clientName: e.target.value })}
                />
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  placeholder="Hours booked"
                  value={manualRideForm.hoursBooked}
                  onChange={(e) => setManualRideForm({ ...manualRideForm, hoursBooked: e.target.value })}
                />
                <select
                  className="input"
                  value={manualRideForm.rideType}
                  onChange={(e) => setManualRideForm({ ...manualRideForm, rideType: e.target.value })}
                >
                  <option value="medical">Medical</option>
                  <option value="recreational">Recreational</option>
                  <option value="airport-pick-drop">Airport Pick & Drop</option>
                </select>
                <textarea
                  className="input min-h-[70px]"
                  placeholder="Travel type / note (optional)"
                  value={manualRideForm.travelType}
                  onChange={(e) => setManualRideForm({ ...manualRideForm, travelType: e.target.value })}
                />
                <button type="button" className="btn" onClick={addManualRide}>Save Manual Booking</button>
              </div>
            </SectionCard>

            <SectionCard title="Medical vs Recreational Ratio" subtitle="Based on manual ride logs">
              <div className="text-sm text-slate-700 flex flex-col gap-2">
                <div className="flex justify-between"><span>Total Manual Rides</span><span className="font-bold">{analytics.totalManualRides}</span></div>
                <div className="flex justify-between"><span>Total Hours</span><span className="font-bold">{analytics.totalManualHours}</span></div>
                <div className="flex justify-between"><span>Medical Rides</span><span className="font-bold">{analytics.medicalRideCount}</span></div>
                <div className="flex justify-between"><span>Recreational Rides</span><span className="font-bold">{analytics.recreationalRideCount}</span></div>
                <div className="flex justify-between"><span>Medical Hours</span><span className="font-bold">{analytics.medicalHours}</span></div>
                <div className="flex justify-between"><span>Recreational Hours</span><span className="font-bold">{analytics.recreationalHours}</span></div>
                <div className="flex justify-between"><span>Ratio (Medical:Recreational)</span><span className="font-bold text-teal-700">{analytics.medicalToRecreationalRatio}</span></div>
              </div>
            </SectionCard>

            <SectionCard title="Recent Manual Bookings" subtitle="Client, hours, and ride category logs">
              <div className="flex flex-col gap-2">
                {(data.manualRides || []).slice(0, 12).map((ride) => (
                  <div key={ride.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <div className="font-semibold">{ride.clientName}</div>
                    <div className="text-xs text-slate-600 mt-1">Hours: {ride.hoursBooked} · Type: {ride.rideType}</div>
                    <div className="text-xs text-slate-600 mt-1">Travel: {ride.travelType || "—"}</div>
                    <div className="text-xs text-slate-500 mt-1">By {ride.createdBy} · {new Date(ride.createdAt).toLocaleString()}</div>
                  </div>
                ))}
                {!(data.manualRides || []).length && <div className="text-sm text-slate-500">No manual bookings logged yet.</div>}
              </div>
            </SectionCard>
          </div>
        )}

        {activeTab === "leads" && (
          <div className="space-y-3">
            <SectionCard title="Pipeline Board" subtitle="New Lead → Explained Service → Interested → Booking Confirmed">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
                <input
                  className="input md:col-span-2"
                  placeholder="Search lead name, phone, city..."
                  value={leadSearch}
                  onChange={(e) => setLeadSearch(e.target.value)}
                />
                <select className="input" value={leadStageFilter} onChange={(e) => setLeadStageFilter(e.target.value)}>
                  <option value="all">All Stages</option>
                  {LEAD_STAGES.map((s) => <option key={s} value={s}>{LEAD_STAGE_LABELS[s]}</option>)}
                </select>
                <select className="input" value={leadCityFilter} onChange={(e) => setLeadCityFilter(e.target.value)}>
                  <option value="all">All Cities</option>
                  {leadCities.map((city) => <option key={city} value={city}>{city}</option>)}
                </select>
                <select className="input" value={leadTypeFilter} onChange={(e) => setLeadTypeFilter(e.target.value)}>
                  <option value="all">All Buyer Types</option>
                  {CUSTOMER_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                </select>
                <select className="input" value={leadSourceFilter} onChange={(e) => setLeadSourceFilter(e.target.value)}>
                  <option value="all">All Sources</option>
                  {leadSources.map((source) => <option key={source} value={source}>{source}</option>)}
                </select>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="text-xs text-slate-500">Showing {filteredLeads.length} lead(s)</div>
                {!VIEW_ONLY_USERS.includes(session.username) && (
                  <button type="button" className="btn max-w-[180px]" onClick={startCreateLead}>Add New Lead</button>
                )}
              </div>

              <div className={`mt-3 rounded-xl border px-3 py-2 text-xs ${leadSyncMode === "shared" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                {leadSyncMessage || (leadSyncMode === "shared" ? "Shared lead sync is active." : "Leads are currently stored only on this browser.")}
              </div>
            </SectionCard>

            <div className="overflow-x-auto pb-2">
              <div className="min-w-[1020px] grid grid-cols-5 gap-3">
                {LEAD_STAGES.map((stage) => (
                  <div key={stage} className="rounded-2xl border border-slate-200 bg-white p-2">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <div className="text-xs font-bold text-slate-700">{LEAD_STAGE_LABELS[stage]}</div>
                      <span className="text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 px-2 py-0.5">{(leadsByStage[stage] || []).length}</span>
                    </div>

                    <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
                      {(leadsByStage[stage] || []).map((lead) => (
                        <div
                          key={lead.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => openLead(lead.id)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              openLead(lead.id);
                            }
                          }}
                          className="rounded-xl border border-slate-200 p-2 bg-slate-50 cursor-pointer hover:border-teal-300"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-bold text-slate-900">{lead.orgName}</div>
                              <div className="text-[11px] text-slate-500">{lead.contactName} · {lead.phone}</div>
                            </div>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              {!VIEW_ONLY_USERS.includes(session.username) && (
                                <button type="button" className="text-[11px] font-bold text-teal-700" onClick={() => startEditLead(lead)}>Edit</button>
                              )}
                              {session.username === "abbas" && (
                                <button type="button" className="text-[11px] font-bold text-rose-600 hover:text-rose-700" onClick={() => deleteLead(lead.id)}>Delete</button>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 text-[11px] text-slate-600">{lead.city} · {lead.orgType} · {lead.source || "—"}</div>
                          <div className="mt-1 text-[11px] text-slate-600">Type: {lead.customerType || "end-user"} · Received: {lead.receivedDate || "—"}</div>

                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <label className="text-[10px] text-slate-500">Follow-up</label>
                            {VIEW_ONLY_USERS.includes(session.username) ? (
                              <div className="text-[11px] text-slate-700 mt-0.5">{lead.followUpDue ? new Date(lead.followUpDue).toLocaleString() : "—"}</div>
                            ) : (
                              <input
                                type="datetime-local"
                                className="input !text-xs !py-1.5"
                                value={lead.followUpDue || ""}
                                onChange={(e) => updateLeadAndPersist(lead.id, () => ({ followUpDue: e.target.value }))}
                              />
                            )}
                          </div>

                          <div className="mt-2" onClick={(e) => e.stopPropagation()}>
                            <label className="text-[10px] text-slate-500">Stage</label>
                            {VIEW_ONLY_USERS.includes(session.username) ? (
                              <div className="mt-0.5"><StatusBadge value={normalizeLeadStage(lead.stage)} /></div>
                            ) : (
                              <select
                                className="input !text-xs !py-1.5"
                                value={normalizeLeadStage(lead.stage)}
                                onChange={(e) => updateLeadAndPersist(lead.id, () => ({ stage: normalizeLeadStage(e.target.value) }))}
                              >
                                {LEAD_STAGES.map((s) => <option key={s} value={s}>{LEAD_STAGE_LABELS[s]}</option>)}
                              </select>
                            )}
                          </div>

                          {lead.explainedDate ? <div className="mt-2 text-[11px] text-slate-600">Explained: {lead.explainedDate} via {lead.explainedMethod || "call"}</div> : null}
                          {lead.slotTypeInterested || lead.dateNeeded ? <div className="mt-1 text-[11px] text-slate-600">Interested: {lead.slotTypeInterested || "—"} · Need by {lead.dateNeeded || "—"}</div> : null}
                          {lead.bookingDate || lead.revenue ? <div className="mt-1 text-[11px] text-emerald-700">Booked: {lead.bookingDate || "—"} · Revenue {lead.revenue || "—"}</div> : null}

                          {lead.waitingOn ? <div className="mt-2 text-[11px] text-rose-600">Waiting: {lead.waitingOn}</div> : null}
                        </div>
                      ))}
                      {!(leadsByStage[stage] || []).length && (
                        <div className="text-[11px] text-slate-400 px-1 py-2">No leads</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {showLeadModal && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 p-4 flex items-center justify-center">
                <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[92vh] overflow-y-auto">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="font-extrabold text-slate-900">{leadEditId ? "Edit Lead" : "Add New Lead"}</div>
                    <button
                      type="button"
                      className="text-slate-400 text-xl leading-none"
                      onClick={() => {
                        setShowLeadModal(false);
                        setLeadEditId("");
                        resetLeadForm();
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2 text-xs font-bold text-slate-500">New Lead</div>
                    <input className="input" placeholder="Lead name / organization" value={leadForm.orgName} onChange={(e) => setLeadForm({ ...leadForm, orgName: e.target.value })} />
                    <input className="input" placeholder="Contact person" value={leadForm.contactName} onChange={(e) => setLeadForm({ ...leadForm, contactName: e.target.value })} />
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1">Phone <span className="text-rose-600">*</span></label>
                      <input className="input" placeholder="Phone number (required)" value={leadForm.phone} onChange={(e) => setLeadForm({ ...leadForm, phone: e.target.value })} />
                    </div>
                    <input className="input" placeholder="WhatsApp / alternate contact" value={leadForm.contactRole} onChange={(e) => setLeadForm({ ...leadForm, contactRole: e.target.value })} />
                    <select className="input" value={leadForm.city} onChange={(e) => setLeadForm({ ...leadForm, city: e.target.value })}>
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                    </select>
                    <select className="input" value={leadForm.customerType} onChange={(e) => setLeadForm({ ...leadForm, customerType: e.target.value })}>
                      {CUSTOMER_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <select className="input" value={leadForm.source} onChange={(e) => setLeadForm({ ...leadForm, source: e.target.value })}>
                      {LEAD_SOURCES.map((source) => <option key={source} value={source}>{source}</option>)}
                    </select>
                    <input type="date" className="input" value={leadForm.receivedDate} onChange={(e) => setLeadForm({ ...leadForm, receivedDate: e.target.value })} />

                    <div className="md:col-span-2 text-xs font-bold text-slate-500 mt-2">Explained Service</div>
                    <input type="date" className="input" value={leadForm.explainedDate} onChange={(e) => setLeadForm({ ...leadForm, explainedDate: e.target.value })} />
                    <select className="input" value={leadForm.explainedMethod} onChange={(e) => setLeadForm({ ...leadForm, explainedMethod: e.target.value })}>
                      {EXPLAIN_METHODS.map((method) => <option key={method} value={method}>{method}</option>)}
                    </select>
                    <textarea className="input md:col-span-2 min-h-[70px]" placeholder="Objections noted (too expensive / van capacity / specific date etc.)" value={leadForm.objections} onChange={(e) => setLeadForm({ ...leadForm, objections: e.target.value })} />
                    <input type="datetime-local" className="input md:col-span-2" value={leadForm.followUpDue} onChange={(e) => setLeadForm({ ...leadForm, followUpDue: e.target.value })} />

                    <div className="md:col-span-2 text-xs font-bold text-slate-500 mt-2">Interested</div>
                    <select className="input" value={leadForm.slotTypeInterested} onChange={(e) => setLeadForm({ ...leadForm, slotTypeInterested: e.target.value })}>
                      {SLOT_TYPES.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                    <input type="date" className="input" value={leadForm.dateNeeded} onChange={(e) => setLeadForm({ ...leadForm, dateNeeded: e.target.value })} />
                    <input className="input" placeholder="Decision maker (manager / receptionist etc.)" value={leadForm.decisionMaker} onChange={(e) => setLeadForm({ ...leadForm, decisionMaker: e.target.value })} />
                    <input className="input" type="number" min="0" placeholder="Final price agreed" value={leadForm.finalPrice} onChange={(e) => setLeadForm({ ...leadForm, finalPrice: e.target.value })} />
                    <select className="input" value={leadForm.paymentMethod} onChange={(e) => setLeadForm({ ...leadForm, paymentMethod: e.target.value })}>
                      {PAYMENT_METHODS.map((pm) => <option key={pm} value={pm}>{pm}</option>)}
                    </select>
                    <input className="input" placeholder="Assign to" value={leadForm.owner} onChange={(e) => setLeadForm({ ...leadForm, owner: e.target.value })} />

                    <div className="md:col-span-2 text-xs font-bold text-slate-500 mt-2">Booking Confirmed</div>
                    <input type="date" className="input" value={leadForm.bookingDate} onChange={(e) => setLeadForm({ ...leadForm, bookingDate: e.target.value })} />
                    <select className="input" value={leadForm.slotDuration} onChange={(e) => setLeadForm({ ...leadForm, slotDuration: e.target.value })}>
                      {SLOT_TYPES.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
                    </select>
                    <select className="input" value={leadForm.bookingType} onChange={(e) => setLeadForm({ ...leadForm, bookingType: e.target.value })}>
                      {BOOKING_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                    <input className="input" type="number" min="0" placeholder="Revenue" value={leadForm.revenue} onChange={(e) => setLeadForm({ ...leadForm, revenue: e.target.value })} />
                    <input type="date" className="input md:col-span-2" value={leadForm.nextBookingDate} onChange={(e) => setLeadForm({ ...leadForm, nextBookingDate: e.target.value })} />

                    <div className="md:col-span-2 text-xs font-bold text-slate-500 mt-2">General</div>
                    <select className="input" value={leadForm.stage} onChange={(e) => setLeadForm({ ...leadForm, stage: e.target.value })}>
                      {LEAD_STAGES.map((s) => <option key={s} value={s}>{LEAD_STAGE_LABELS[s]}</option>)}
                    </select>
                    <select className="input" value={leadForm.orgType} onChange={(e) => setLeadForm({ ...leadForm, orgType: e.target.value })}>
                      {ORG_TYPES.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <input className="input md:col-span-2" placeholder="What are we waiting on?" value={leadForm.waitingOn} onChange={(e) => setLeadForm({ ...leadForm, waitingOn: e.target.value })} />
                    <textarea className="input md:col-span-2 min-h-[80px]" placeholder="Terms wanted" value={leadForm.termsWanted} onChange={(e) => setLeadForm({ ...leadForm, termsWanted: e.target.value })} />
                    <textarea className="input md:col-span-2 min-h-[90px]" placeholder="Notes" value={leadForm.notes} onChange={(e) => setLeadForm({ ...leadForm, notes: e.target.value })} />
                  </div>

                  <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      onClick={() => {
                        setShowLeadModal(false);
                        setLeadEditId("");
                        resetLeadForm();
                      }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      className="btn max-w-[180px] disabled:opacity-50 disabled:cursor-not-allowed" 
                      disabled={!leadForm.orgName.trim() || !leadForm.contactName.trim() || !leadForm.phone.trim()}
                      onClick={addLead}
                    >
                      {leadEditId ? "Save Changes" : "Save Lead"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {leadBeingViewed && (
              <div className="fixed inset-0 z-50 bg-slate-900/40 p-4 flex items-center justify-center">
                <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-xl max-h-[92vh] overflow-y-auto">
                  <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <div className="font-extrabold text-slate-900">Open Lead</div>
                      <div className="text-xs text-slate-500 mt-0.5">{leadBeingViewed.orgName} · {leadBeingViewed.contactName}</div>
                    </div>
                    <button
                      type="button"
                      className="text-slate-400 text-xl leading-none"
                      onClick={() => setLeadViewId("")}
                    >
                      ×
                    </button>
                  </div>

                  <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div><span className="font-semibold text-slate-700">Phone:</span> <span className="text-slate-900">{leadBeingViewed.phone || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">City:</span> <span className="text-slate-900">{leadBeingViewed.city || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Stage:</span> <span className="text-slate-900">{LEAD_STAGE_LABELS[normalizeLeadStage(leadBeingViewed.stage)] || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Type:</span> <span className="text-slate-900">{leadBeingViewed.customerType || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Source:</span> <span className="text-slate-900">{leadBeingViewed.source || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Org Type:</span> <span className="text-slate-900">{leadBeingViewed.orgType || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Received:</span> <span className="text-slate-900">{leadBeingViewed.receivedDate || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Follow-up:</span> <span className="text-slate-900">{leadBeingViewed.followUpDue ? new Date(leadBeingViewed.followUpDue).toLocaleString() : "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Decision Maker:</span> <span className="text-slate-900">{leadBeingViewed.decisionMaker || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Owner:</span> <span className="text-slate-900">{leadBeingViewed.owner || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Explained Date:</span> <span className="text-slate-900">{leadBeingViewed.explainedDate || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Explained Via:</span> <span className="text-slate-900">{leadBeingViewed.explainedMethod || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Slot Interested:</span> <span className="text-slate-900">{leadBeingViewed.slotTypeInterested || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Need By:</span> <span className="text-slate-900">{leadBeingViewed.dateNeeded || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Booking Date:</span> <span className="text-slate-900">{leadBeingViewed.bookingDate || "—"}</span></div>
                    <div><span className="font-semibold text-slate-700">Revenue:</span> <span className="text-slate-900">{leadBeingViewed.revenue || "—"}</span></div>
                    <div className="md:col-span-2"><span className="font-semibold text-slate-700">Waiting On:</span> <span className="text-slate-900">{leadBeingViewed.waitingOn || "—"}</span></div>
                    <div className="md:col-span-2"><span className="font-semibold text-slate-700">Terms Wanted:</span> <span className="text-slate-900">{leadBeingViewed.termsWanted || "—"}</span></div>
                    <div className="md:col-span-2"><span className="font-semibold text-slate-700">Notes:</span> <span className="text-slate-900">{leadBeingViewed.notes || "—"}</span></div>
                  </div>

                  <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                    <button
                      type="button"
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
                      onClick={() => setLeadViewId("")}
                    >
                      Close
                    </button>
                    {!VIEW_ONLY_USERS.includes(session.username) && (
                      <button
                        type="button"
                        className="btn max-w-[180px]"
                        onClick={() => {
                          setLeadViewId("");
                          startEditLead(leadBeingViewed);
                        }}
                      >
                        Edit Lead
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "interactions" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="Log Interaction" subtitle="Track where each conversation has reached">
              <div className="flex flex-col gap-2">
                <select className="input" value={interactionForm.leadId} onChange={(e) => setInteractionForm({ ...interactionForm, leadId: e.target.value })}>
                  <option value="">Select lead</option>
                  {data.leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.orgName} · {l.contactName}</option>
                  ))}
                </select>
                <select className="input" value={interactionForm.channel} onChange={(e) => setInteractionForm({ ...interactionForm, channel: e.target.value })}>
                  <option value="call">Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="visit">In-Person Visit</option>
                  <option value="email">Email</option>
                </select>
                <input className="input" placeholder="Who did Asad speak to?" value={interactionForm.spokeToName} onChange={(e) => setInteractionForm({ ...interactionForm, spokeToName: e.target.value })} />
                <input className="input" placeholder="Role in their organization" value={interactionForm.spokeToRole} onChange={(e) => setInteractionForm({ ...interactionForm, spokeToRole: e.target.value })} />
                <input className="input" placeholder="Contact number" value={interactionForm.spokeToPhone} onChange={(e) => setInteractionForm({ ...interactionForm, spokeToPhone: e.target.value })} />
                <input className="input" placeholder="Other admins discovered" value={interactionForm.discoveredAdmins} onChange={(e) => setInteractionForm({ ...interactionForm, discoveredAdmins: e.target.value })} />
                <input className="input" placeholder="What are we waiting on?" value={interactionForm.waitingOn} onChange={(e) => setInteractionForm({ ...interactionForm, waitingOn: e.target.value })} />
                <textarea className="input min-h-[70px]" placeholder="Terms they want to work on" value={interactionForm.termsWanted} onChange={(e) => setInteractionForm({ ...interactionForm, termsWanted: e.target.value })} />
                <textarea className="input min-h-[90px]" placeholder="Interaction summary" value={interactionForm.summary} onChange={(e) => setInteractionForm({ ...interactionForm, summary: e.target.value })} />
                <input className="input" placeholder="Next step" value={interactionForm.nextStep} onChange={(e) => setInteractionForm({ ...interactionForm, nextStep: e.target.value })} />
                <input type="datetime-local" className="input" value={interactionForm.followUpDue} onChange={(e) => setInteractionForm({ ...interactionForm, followUpDue: e.target.value })} />
                <button type="button" className="btn" onClick={addInteraction}>Save Interaction</button>
              </div>
            </SectionCard>

            <div className="lg:col-span-2 flex flex-col gap-3">
              {data.interactions.map((it) => {
                const lead = leadMap[it.leadId];
                return (
                  <SectionCard
                    key={it.id}
                    title={`${it.channel.toUpperCase()} · ${lead?.orgName || "Unknown lead"}`}
                    subtitle={`By ${it.by} · ${new Date(it.createdAt).toLocaleString()}`}
                  >
                    <div className="text-sm text-slate-800">{it.summary}</div>
                    <div className="mt-2 text-xs text-slate-600">Spoke To: {it.spokeToName || "—"} ({it.spokeToRole || "—"}) · {it.spokeToPhone || "—"}</div>
                    <div className="text-xs text-slate-600">Other Admins: {it.discoveredAdmins || "—"}</div>
                    <div className="text-xs text-slate-600">Waiting On: {it.waitingOn || "—"}</div>
                    <div className="text-xs text-slate-600">Terms Wanted: {it.termsWanted || "—"}</div>
                    <div className="mt-2 text-xs text-slate-600">Next step: {it.nextStep || "—"}</div>
                    <div className="text-xs text-slate-600">Follow-up due: {it.followUpDue ? new Date(it.followUpDue).toLocaleString() : "—"}</div>
                  </SectionCard>
                );
              })}
              {!data.interactions.length && <div className="text-sm text-slate-500">No interactions logged yet.</div>}
            </div>
          </div>
        )}

        {activeTab === "booking-ops" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="Track Booking State" subtitle="Inquiry → in-process → confirmed → completed / cancelled">
              <div className="flex flex-col gap-2">
                <select className="input" value={bookingOpsForm.leadId} onChange={(e) => setBookingOpsForm({ ...bookingOpsForm, leadId: e.target.value })}>
                  <option value="">Linked lead (optional)</option>
                  {data.leads.map((l) => <option key={l.id} value={l.id}>{l.orgName}</option>)}
                </select>
                <select className="input" value={bookingOpsForm.city} onChange={(e) => setBookingOpsForm({ ...bookingOpsForm, city: e.target.value })}>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                </select>
                <select className="input" value={bookingOpsForm.slotWindow} onChange={(e) => setBookingOpsForm({ ...bookingOpsForm, slotWindow: e.target.value })}>
                  {BOOKING_SLOT_WINDOWS.map((w) => <option key={w} value={w}>{w}</option>)}
                </select>
                <select className="input" value={bookingOpsForm.slotType} onChange={(e) => setBookingOpsForm({ ...bookingOpsForm, slotType: e.target.value })}>
                  <option value="4-hour">4-hour</option>
                  <option value="12-hour">12-hour</option>
                </select>
                <select className="input" value={bookingOpsForm.bookingState} onChange={(e) => setBookingOpsForm({ ...bookingOpsForm, bookingState: e.target.value })}>
                  {BOOKING_OP_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className="input" type="number" min="0" placeholder="Queue position (if slot full)" value={bookingOpsForm.queuePosition} onChange={(e) => setBookingOpsForm({ ...bookingOpsForm, queuePosition: e.target.value })} />
                <input className="input" placeholder="Notify contact on cancellation" value={bookingOpsForm.notifyContact} onChange={(e) => setBookingOpsForm({ ...bookingOpsForm, notifyContact: e.target.value })} />
                <textarea className="input min-h-[80px]" placeholder="Booking progress notes" value={bookingOpsForm.notes} onChange={(e) => setBookingOpsForm({ ...bookingOpsForm, notes: e.target.value })} />
                <button type="button" className="btn" onClick={addBookingOps}>Save Booking Operation</button>
              </div>
            </SectionCard>

            <div className="lg:col-span-2 flex flex-col gap-3">
              <SectionCard title="Live Bookings From Admin" subtitle={liveBookingsMessage}>
                <div className="flex flex-col gap-2">
                  {liveBookingOps.slice(0, 30).map((b) => (
                    <div key={b.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-sm text-slate-900">{b.passengerName || "Customer"}</div>
                        <div className="text-xs font-bold uppercase text-teal-700">{b.rawStatus || "pending"}</div>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{b.city} · {b.slotType} · {b.slotWindow}</div>
                      <div className="text-xs text-slate-600 mt-1">Date: {b.rideDate || "—"} · Contact: {b.notifyContact || "—"}</div>
                      <div className="text-xs text-slate-600 mt-1">{b.notes || "—"}</div>
                      <div className="text-xs text-emerald-700 font-semibold mt-1">Total: {b.totalPkr ? `PKR ${Number(b.totalPkr).toLocaleString()}` : "—"}</div>
                    </div>
                  ))}
                  {!liveBookingOps.length && <div className="text-sm text-slate-500">No live admin bookings found.</div>}
                </div>
              </SectionCard>

              <SectionCard title="CRM Booking Operations Log" subtitle="Manual CRM booking operations entries">
                <div className="flex flex-col gap-3">
                  {(data.bookingOps || []).map((b) => (
                    <SectionCard
                      key={b.id}
                      title={`${leadMap[b.leadId]?.orgName || "Unlinked booking"}`}
                      subtitle={`${b.city} · ${b.slotType} · ${b.slotWindow}`}
                      right={<StatusBadge value={b.bookingState} />}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-600">
                        <div><span className="font-semibold">State:</span> {b.bookingState}</div>
                        <div><span className="font-semibold">Queue:</span> {b.queuePosition || "—"}</div>
                        <div><span className="font-semibold">Notify:</span> {b.notifyContact || "—"}</div>
                        <div><span className="font-semibold">Created:</span> {new Date(b.createdAt).toLocaleString()}</div>
                      </div>
                      {b.notes ? <div className="mt-2 text-sm text-slate-700">{b.notes}</div> : null}
                    </SectionCard>
                  ))}
                  {!(data.bookingOps || []).length && <div className="text-sm text-slate-500">No manual CRM booking operations logged yet.</div>}
                </div>
              </SectionCard>

            </div>
          </div>
        )}

        {activeTab === "appointments" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="Add Appointment" subtitle="Dashboard-ready scheduling">
              <div className="flex flex-col gap-2">
                <input className="input" placeholder="Appointment title" value={appointmentForm.title} onChange={(e) => setAppointmentForm({ ...appointmentForm, title: e.target.value })} />
                <select className="input" value={appointmentForm.city} onChange={(e) => setAppointmentForm({ ...appointmentForm, city: e.target.value })}>
                  <option value="Lahore">Lahore</option>
                  <option value="Karachi">Karachi</option>
                </select>
                <input type="datetime-local" className="input" value={appointmentForm.dateTime} onChange={(e) => setAppointmentForm({ ...appointmentForm, dateTime: e.target.value })} />
                <input className="input" placeholder="With whom" value={appointmentForm.withWhom} onChange={(e) => setAppointmentForm({ ...appointmentForm, withWhom: e.target.value })} />
                <select className="input" value={appointmentForm.linkedLeadId} onChange={(e) => setAppointmentForm({ ...appointmentForm, linkedLeadId: e.target.value })}>
                  <option value="">Optional: linked lead</option>
                  {data.leads.map((l) => <option key={l.id} value={l.id}>{l.orgName}</option>)}
                </select>
                <button type="button" className="btn" onClick={addAppointment}>Save Appointment</button>
              </div>
            </SectionCard>

            <div className="lg:col-span-2 flex flex-col gap-3">
              {data.appointments.map((a) => (
                <SectionCard key={a.id} title={a.title} subtitle={`${new Date(a.dateTime).toLocaleString()} · ${a.city}`}>
                  <div className="text-sm text-slate-700">With: {a.withWhom || "—"}</div>
                  <div className="text-xs text-slate-600 mt-1">Lead: {leadMap[a.linkedLeadId]?.orgName || "—"}</div>
                </SectionCard>
              ))}
              {!data.appointments.length && <div className="text-sm text-slate-500">No appointments scheduled yet.</div>}
            </div>
          </div>
        )}

        {activeTab === "operations" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="Add Work Item" subtitle="Track non-client and regulatory work">
              <div className="flex flex-col gap-2">
                <input className="input" placeholder="Task title" value={opsForm.title} onChange={(e) => setOpsForm({ ...opsForm, title: e.target.value })} />
                <select className="input" value={opsForm.workType} onChange={(e) => setOpsForm({ ...opsForm, workType: e.target.value })}>
                  {OP_WORK_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <select className="input" value={opsForm.status} onChange={(e) => setOpsForm({ ...opsForm, status: e.target.value })}>
                  {OP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <input className="input" placeholder="Owner" value={opsForm.owner} onChange={(e) => setOpsForm({ ...opsForm, owner: e.target.value })} />
                <input type="date" className="input" value={opsForm.dueDate} onChange={(e) => setOpsForm({ ...opsForm, dueDate: e.target.value })} />
                <textarea className="input min-h-[90px]" placeholder="Notes" value={opsForm.notes} onChange={(e) => setOpsForm({ ...opsForm, notes: e.target.value })} />
                <button type="button" className="btn" onClick={addOps}>Save Work Item</button>
              </div>
            </SectionCard>

            <div className="lg:col-span-2 flex flex-col gap-3">
              {data.operations.map((op) => (
                <SectionCard key={op.id} title={op.title} subtitle={`${op.workType} · ${op.status}`}>
                  <div className="text-sm text-slate-700">Owner: {op.owner || "—"}</div>
                  <div className="text-xs text-slate-600 mt-1">Due: {op.dueDate || "—"}</div>
                  {op.notes ? <div className="text-sm text-slate-700 mt-2">{op.notes}</div> : null}
                </SectionCard>
              ))}
              {!data.operations.length && <div className="text-sm text-slate-500">No operations work logged yet.</div>}
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <SectionCard title="CRM Performance Snapshot" subtitle="Based on booking operations and feedback logs">
              <div className="text-sm text-slate-700 flex flex-col gap-2">
                <div className="flex justify-between"><span>Completed in CRM Booking Ops</span><span className="font-bold">{analytics.completedBookingOps}</span></div>
                <div className="flex justify-between"><span>Feedback Logs</span><span className="font-bold">{analytics.totalFeedbackLogs}</span></div>
                <div className="flex justify-between"><span>Wheelchair Customer Feedback</span><span className="font-bold">{analytics.wheelchairFeedbackCount}</span></div>
                <div className="flex justify-between"><span>Open Follow-ups</span><span className="font-bold text-amber-700">{analytics.openFollowUpsCount}</span></div>
                <div className="flex justify-between"><span>Manual Medical:Recreational</span><span className="font-bold text-teal-700">{analytics.medicalToRecreationalRatio}</span></div>
              </div>
            </SectionCard>

            <SectionCard title="Log Completed Ride Feedback" subtitle="Capture customer sentiment and incentive decisions">
              <div className="flex flex-col gap-2">
                <input className="input" placeholder="Booking reference ID (optional)" value={feedbackForm.bookingId} onChange={(e) => setFeedbackForm({ ...feedbackForm, bookingId: e.target.value })} />
                <input className="input" placeholder="Rider name" value={feedbackForm.riderName} onChange={(e) => setFeedbackForm({ ...feedbackForm, riderName: e.target.value })} />
                <select className="input" value={feedbackForm.source} onChange={(e) => setFeedbackForm({ ...feedbackForm, source: e.target.value })}>
                  <option value="New Pak Surgical">New Pak Surgical</option>
                  <option value="Hotel">Hotel</option>
                  <option value="Direct">Direct</option>
                </select>
                <label className="text-xs text-slate-600 flex items-center gap-2">
                  <input type="checkbox" checked={feedbackForm.isWheelchairCustomer} onChange={(e) => setFeedbackForm({ ...feedbackForm, isWheelchairCustomer: e.target.checked })} />
                  Wheelchair customer
                </label>
                <input className="input" type="number" min="0" max="100" placeholder="Incentive discount % (optional)" value={feedbackForm.incentiveDiscountPercent} onChange={(e) => setFeedbackForm({ ...feedbackForm, incentiveDiscountPercent: e.target.value })} />
                <textarea className="input min-h-[90px]" placeholder="Feedback summary" value={feedbackForm.feedbackSummary} onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackSummary: e.target.value })} />
                <input type="datetime-local" className="input" value={feedbackForm.followUpDue} onChange={(e) => setFeedbackForm({ ...feedbackForm, followUpDue: e.target.value })} />
                <button type="button" className="btn" onClick={addFeedbackLog}>Save Feedback Log</button>
              </div>
            </SectionCard>

            <SectionCard title="Recent Feedback Logs" subtitle="Wheelchair users and follow-up action tracking">
              <div className="flex flex-col gap-2">
                {(data.feedbackLogs || []).slice(0, 12).map((f) => (
                  <div key={f.id} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    <div className="font-semibold">{f.riderName || "Customer"} · {f.source}</div>
                    <div className="text-xs text-slate-500 mt-1">By {f.capturedBy} · {new Date(f.createdAt).toLocaleString()}</div>
                    <div className="text-xs text-slate-600 mt-1">Wheelchair: {f.isWheelchairCustomer ? "Yes" : "No"} · Incentive: {f.incentiveDiscountPercent || 0}%</div>
                    <div className="text-xs text-slate-600 mt-1">Follow-up: {f.followUpDue ? new Date(f.followUpDue).toLocaleString() : "—"}</div>
                    <div className="mt-1">{f.feedbackSummary}</div>
                  </div>
                ))}
                {!(data.feedbackLogs || []).length && <div className="text-sm text-slate-500">No feedback logs yet.</div>}
              </div>
            </SectionCard>
          </div>
        )}

      </div>

      <style>{`
        .input {
          width: 100%;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0.65rem 0.75rem;
          font-size: 0.875rem;
          color: #0f172a;
          background: white;
        }
        .input:focus {
          outline: none;
          border-color: #14b8a6;
          box-shadow: 0 0 0 2px rgba(20,184,166,0.15);
        }
        .btn {
          width: 100%;
          border-radius: 0.75rem;
          background: #0f766e;
          color: white;
          font-weight: 700;
          padding: 0.7rem 0.75rem;
        }
        .btn:hover { background: #115e59; }
      `}</style>
    </div>
  );
}

export default function Crm() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!session?.username) return;

    const normalizedUsername = String(session.username).trim().toLowerCase();
    const isBlocked = BLOCKED_USERS.includes(normalizedUsername);
    const isKnownUser = USERS.some((user) => user.username === normalizedUsername);
    if (isBlocked || !isKnownUser) {
      setSession(null);
    }
  }, [session]);

  return (
    <>
      <Helmet>
        <title>Maya Cabs CRM | New Pak Surgical</title>
        <meta
          name="description"
          content="CRM for Maya Cabs lead management, interactions, appointments, and operational compliance tracking."
        />
      </Helmet>
      {!session ? (
        <CrmLogin onLogin={setSession} />
      ) : (
        <CrmApp
          session={session}
          onLogout={() => {
            setSession(null);
          }}
        />
      )}
    </>
  );
}
