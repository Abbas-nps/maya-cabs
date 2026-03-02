import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export default function Home() {
  const navigate = useNavigate();
  return (
    <>
      <Helmet>
        <title>MayaCabs.pk | Wheelchair Accessible Transport in Lahore | Medical &amp; Assisted Travel</title>
        <meta
          name="description"
          content="Pakistan's first wheelchair accessible van service. Trained drivers, safe patient transport, hospital visits, airport transfers and assisted mobility rides in Lahore. Book easily online at MayaCabs.pk."
        />
        <link rel="canonical" href="https://mayacabs.pk/home" />
        <meta property="og:title" content="MayaCabs.pk | Wheelchair Accessible Transport in Lahore" />
        <meta property="og:description" content="Pakistan's first wheelchair accessible van service. Trained drivers, safe patient transport, hospital visits, airport transfers." />
        <meta property="og:url" content="https://mayacabs.pk/home" />
      </Helmet>

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
          Wheelchair Accessible Transport in Lahore
        </h1>
        <p className="text-teal-100 text-sm leading-relaxed mb-6">
          Pre-booked, door-to-door van service. Trained drivers. Not an ambulance — a reliable transport service for wheelchair users attending appointments, hospital visits, and daily needs across Lahore.
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
      <div className="px-4 pt-6 pb-6">
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

      {/* Who this service is for */}
      <div className="px-4 pt-2 pb-6 bg-white">
        <h2 className="text-slate-900 font-bold text-xl mb-1">Who This Service Is For</h2>
        <p className="text-slate-500 text-sm mb-5">Anyone in Lahore who needs safe, accessible transport</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: "🦽", title: "Wheelchair Users", desc: "Manual or powered chairs, all standard sizes" },
            { icon: "🏥", title: "Hospital Patients", desc: "OPD, dialysis, therapy, discharge" },
            { icon: "👴", title: "Elderly Passengers", desc: "Mobility-impaired seniors needing assistance" },
            { icon: "🧒", title: "Children", desc: "Paediatric wheelchair users (with carer)" },
            { icon: "✈️", title: "Air Travellers", desc: "Airport pickups and drop-offs" },
            { icon: "🏋️", title: "Therapy Patients", desc: "Physiotherapy and rehab regular visits" },
          ].map((item) => (
            <div key={item.title} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
              <div className="text-xl mb-1">{item.icon}</div>
              <div className="font-bold text-slate-900 text-xs mb-0.5">{item.title}</div>
              <div className="text-slate-500 text-xs leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="px-4 pt-6 pb-6">
        <h2 className="text-slate-900 font-bold text-xl mb-1">How the Service Works</h2>
        <p className="text-slate-500 text-sm mb-5">Simple 4-step booking, confirmed via WhatsApp</p>
        <div className="flex flex-col gap-3">
          {[
            { step: "1", title: "Choose Duration", desc: "Pick a 2, 3, or 4-hour time slot based on your appointment length" },
            { step: "2", title: "Select Date & Time", desc: "View real-time availability and book your preferred slot" },
            { step: "3", title: "Enter Details", desc: "Pickup address, destination, wheelchair type, and passenger info" },
            { step: "4", title: "Confirm via WhatsApp", desc: "Booking sent to our team — confirmed and prepaid in minutes" },
          ].map((s) => (
            <div key={s.step} className="bg-white rounded-2xl p-4 flex items-start gap-4 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-teal-700 text-white font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                {s.step}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">{s.title}</div>
                <div className="text-slate-500 text-xs leading-relaxed">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <Link to="/how-it-works" className="block mt-4 text-center text-teal-700 font-semibold text-sm hover:underline">
          Read full booking guide →
        </Link>
      </div>

      {/* Areas served */}
      <div className="px-4 pt-2 pb-6 bg-white">
        <h2 className="text-slate-900 font-bold text-xl mb-1">Areas We Serve in Lahore</h2>
        <p className="text-slate-500 text-sm mb-4">Door-to-door across all major neighbourhoods</p>
        <div className="flex flex-wrap gap-2">
          {[
            "DHA", "Bahria Town", "Johar Town", "Gulberg", "Model Town",
            "Iqbal Town", "Cantt", "Wapda Town", "Faisal Town", "Garden Town",
            "Township", "Samanabad", "Shadman", "Cavalry Ground", "Airport Road",
          ].map((area) => (
            <span key={area} className="bg-teal-50 text-teal-800 text-xs font-semibold rounded-full px-3 py-1.5 border border-teal-100">
              📍 {area}
            </span>
          ))}
        </div>
        <Link to="/areas-served" className="block mt-4 text-center text-teal-700 font-semibold text-sm hover:underline">
          View full coverage area →
        </Link>
      </div>

      {/* Services links */}
      <div className="px-4 pt-6 pb-8">
        <h2 className="text-slate-900 font-bold text-xl mb-5">Our Services</h2>
        <div className="flex flex-col gap-3">
          {[
            { title: "Wheelchair Transport", href: "/wheelchair-transport", icon: "♿", desc: "All-terrain hydraulic ramp van, 4-point tie-down" },
            { title: "Hospital Transport", href: "/hospital-transport", icon: "🏥", desc: "OPD, tests, dialysis, discharge support" },
            { title: "Airport Transfer", href: "/airport-transfer", icon: "✈️", desc: "Allama Iqbal Airport, luggage included" },
            { title: "Therapy Visits", href: "/how-it-works", icon: "🏋️", desc: "Regular physiotherapy and rehab sessions" },
          ].map((svc) => (
            <Link
              key={svc.title}
              to={svc.href}
              className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition"
            >
              <span className="text-2xl">{svc.icon}</span>
              <div className="flex-1">
                <div className="font-bold text-slate-900 text-sm">{svc.title}</div>
                <div className="text-slate-500 text-xs">{svc.desc}</div>
              </div>
              <span className="text-slate-400 text-sm">→</span>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div className="px-4 pb-10">
        <button
          className="w-full bg-teal-700 text-white font-bold text-lg rounded-2xl py-4 shadow hover:bg-teal-800 transition"
          onClick={() => navigate("/about")}
        >
          Book a Ride Now →
        </button>
        <p className="text-slate-500 text-xs text-center mt-2">
          Questions?{" "}
          <a href="https://wa.me/923396292222" className="text-teal-700 font-semibold">
            WhatsApp us
          </a>{" "}
          · +92 339 6292222
        </p>
      </div>
    </div>
    </>
  );
}
