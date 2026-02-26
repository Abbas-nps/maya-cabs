import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";

const HOURLY_RATE = 2500;

const OPTIONS = [
  {
    hours: 2,
    label: "2 Hours",
    tag: "Minimum",
    tagColor: "bg-amber-100 text-amber-700",
    desc: "Best for single appointments or short trips within the city.",
    banner: null,
  },
  {
    hours: 3,
    label: "3 Hours",
    tag: "Most Popular",
    tagColor: "bg-teal-100 text-teal-700",
    desc: "Ideal for hospital visits, multiple stops, or longer appointments.",
    banner: "POPULAR",
  },
  {
    hours: 4,
    label: "4 Hours",
    tag: "Extended",
    tagColor: "bg-slate-100 text-slate-600",
    desc: "For longer trips or multiple appointments in a day.",
    banner: null,
  },
];

export default function Duration({ onNext, onBack }) {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(2);
  const total = selected * HOURLY_RATE;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar
        title="Choose Duration"
        subtitle="Minimum 2 hours \u2022 Hourly billing"
        showBack
        onBack={onBack || (() => navigate(-1))}
      />
      <Stepper current={1} />

      <main className="flex-1 px-4 pt-5 pb-36">
        <h2 className="text-slate-900 font-extrabold text-2xl mb-1">How many hours do you need?</h2>
        <p className="text-slate-500 text-sm mb-5">Select your booking duration. Billing is hourly.</p>

        {/* Price info card */}
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center gap-3 mb-5 shadow-sm">
          <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 24 24" width={20} height={20} fill="none" stroke="#0d9488" strokeWidth={1.8}>
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
              <line x1="12" y1="12" x2="12" y2="16" />
              <line x1="10" y1="14" x2="14" y2="14" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-slate-900">PKR 2,500 / hour</div>
            <div className="text-slate-500 text-xs">Includes driver assistance &amp; van hire</div>
          </div>
        </div>

        {/* Duration options */}
        <div className="flex flex-col gap-3">
          {OPTIONS.map((opt) => {
            const isSelected = selected === opt.hours;
            return (
              <button
                key={opt.hours}
                className={[
                  "w-full text-left rounded-2xl border-2 overflow-hidden transition-all",
                  isSelected ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white",
                ].join(" ")}
                onClick={() => setSelected(opt.hours)}
              >
                {/* Top row */}
                <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                  {/* Radio */}
                  <div
                    className={[
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                      isSelected ? "border-teal-600 bg-teal-600" : "border-slate-300 bg-white",
                    ].join(" ")}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-base">{opt.label}</span>
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${opt.tagColor}`}>
                        {opt.tag}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1 leading-snug">{opt.desc}</p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    {opt.banner && (
                      <span className="bg-teal-700 text-white font-bold text-xs rounded-lg px-2 py-1 mb-1">
                        {opt.banner}
                      </span>
                    )}
                    <span className={`font-extrabold text-lg leading-tight ${isSelected ? "text-teal-700" : "text-slate-700"}`}>
                      PKR {(opt.hours * HOURLY_RATE).toLocaleString()}
                    </span>
                    <span className="text-slate-400 text-xs">total</span>
                  </div>
                </div>

                {/* Hour chips — only for selected */}
                {isSelected && (
                  <div className="border-t border-teal-200 px-4 py-3 flex items-center gap-2 flex-wrap">
                    {Array.from({ length: opt.hours }).map((_, i) => (
                      <span
                        key={i}
                        className="bg-teal-700 text-white text-xs font-bold rounded-full px-3 py-1.5 flex items-center gap-1"
                      >
                        <svg viewBox="0 0 16 16" width={12} height={12} fill="none" stroke="white" strokeWidth={1.8}>
                          <circle cx="8" cy="8" r="6" />
                          <path d="M8 5v3l2 2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Hour {i + 1}
                      </span>
                    ))}
                    <span className="text-teal-700 font-bold text-sm ml-1">
                      = PKR {(opt.hours * HOURLY_RATE).toLocaleString()}
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-40">
        <div className="flex items-center justify-between mb-3">
          <span className="text-slate-600 text-sm">{selected} hours selected</span>
          <span className="font-extrabold text-teal-700 text-lg">PKR {total.toLocaleString()}</span>
        </div>
        <button
          className="w-full bg-teal-700 text-white font-bold text-base rounded-2xl py-4 hover:bg-teal-800 transition"
          onClick={() => {
            const existing = JSON.parse(localStorage.getItem("mayaCabsBooking") || "{}");
            localStorage.setItem("mayaCabsBooking", JSON.stringify({ ...existing, duration: selected, total: selected * 2500 }));
            if (onNext) onNext(selected); else navigate("/booking/schedule");
          }}
        >
          Continue to Schedule →
        </button>
      </div>
    </div>
  );
}
