import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* TopBar */}
      <header className="w-full bg-teal-700 text-white flex items-center px-4 py-3 sticky top-0 z-30">
        <div className="w-10 h-10 rounded-xl bg-teal-600/60 flex items-center justify-center mr-3 flex-shrink-0">
          <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="currentColor" strokeWidth={1.8}>
            <circle cx="12" cy="6" r="2" />
            <path d="M9 12h3l1 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 17a4 4 0 1 0 8 0" strokeLinecap="round" />
            <path d="M16 10l2 2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-bold text-base leading-tight">Maya Cabs</div>
          <div className="text-teal-200 text-xs">Wheelchair Accessible Transport</div>
        </div>
        <span className="bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold">🇵🇰 Lahore</span>
      </header>

      {/* Hero */}
      <div className="bg-teal-700 px-5 pt-6 pb-10">
        <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-bold rounded-full px-3 py-1.5 mb-5">
          <svg viewBox="0 0 24 24" width={14} height={14} fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="6" r="2" />
            <path d="M9 12h3l1 5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 17a4 4 0 1 0 8 0" strokeLinecap="round" />
          </svg>
          WHEELCHAIR ACCESSIBLE VAN
        </div>
        <h1 className="text-white font-extrabold text-3xl leading-tight mb-4">
          Safe transport for wheelchair users in Lahore
        </h1>
        <p className="text-teal-100 text-sm leading-relaxed mb-6">
          Pre-booked, door-to-door van service. Trained drivers. Not an ambulance — a reliable transport service for appointments, hospital visits, and daily needs.
        </p>
        <div className="flex gap-2 mb-6">
          {[
            { val: "10hrs", label: "Daily Service" },
            { val: "4.9★", label: "Avg. Rating" },
            { val: "2025", label: "Est. Since" },
          ].map((s) => (
            <div key={s.val} className="flex-1 bg-white/15 rounded-xl px-2 py-2 text-center">
              <div className="text-white font-bold text-sm">{s.val}</div>
              <div className="text-teal-200 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
        <button
          className="w-full bg-white text-teal-800 font-bold text-lg rounded-2xl py-4 shadow hover:bg-teal-50 transition mb-2"
          onClick={() => navigate("/about")}
        >
          Book a Ride →
        </button>
        <p className="text-teal-200 text-xs text-center">Booking confirmed via WhatsApp • Min. 2 hours</p>
      </div>

      {/* Warning banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center gap-3">
        <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="#d97706" strokeWidth={2}>
          <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
        </svg>
        <p className="text-amber-800 text-sm">
          This is <span className="font-bold">NOT</span> an ambulance service. For medical emergencies, call <span className="font-bold">1122</span>.
        </p>
      </div>

      {/* Features */}
      <div className="px-4 pt-6 pb-10">
        <h2 className="text-slate-900 font-bold text-xl mb-1">Why families trust Maya Cabs</h2>
        <p className="text-slate-500 text-sm mb-5">Built for wheelchair users and their caregivers</p>
        <div className="flex flex-col gap-3">
          {[
            { icon: "♿", title: "Wheelchair-Ready Van", desc: "Hydraulic ramp, secured locking points for all wheelchair types" },
            { icon: "👨‍✈️", title: "Trained Driver", desc: "Assists with boarding, exit, and securing the wheelchair" },
            { icon: "📍", title: "Door-to-Door Service", desc: "Pickup and drop within Lahore, no transfers" },
            { icon: "🔔", title: "30 Min Alert", desc: "Driver calls 30 minutes before arrival" },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm">
              <span className="text-2xl mt-0.5">{f.icon}</span>
              <div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">{f.title}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
