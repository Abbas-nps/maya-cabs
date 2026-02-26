import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";

const CHECK_ITEMS = [
  "Wheelchair accessible van with hydraulic ramp",
  "Trained driver assists with boarding and exit",
  "Secured wheelchair locking system in van",
  "Pre-booked 2\u20134 hour time slots",
  "Door-to-door service within Lahore",
  "Driver contacts you 30 minutes before arrival",
];

const NOT_ITEMS = [
  "No medical equipment or oxygen on board",
  "Cannot transport critical or unstable patients",
  "No trained medical staff in the vehicle",
  "For emergencies call 1122 (Rescue)",
];

export default function About() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar title="About This Service" subtitle="What to expect during your ride" showBack />

      {/* Hero image with overlay */}
      <div className="relative bg-teal-800 h-44 flex items-end overflow-hidden">
        <div className="absolute inset-0 bg-teal-900/70" />
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Wheelchair icon as placeholder */}
          <svg viewBox="0 0 80 80" width={80} height={80} fill="none" stroke="white" strokeWidth={1.5} opacity={0.3}>
            <circle cx="40" cy="22" r="8" />
            <path d="M30 38h16l4 20" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M24 56a16 16 0 1 0 32 0" strokeLinecap="round" />
            <path d="M54 38l8 8" strokeLinecap="round" />
          </svg>
        </div>
        <div className="relative z-10 px-5 pb-5">
          <div className="font-bold text-white text-xl leading-snug">Please read before booking</div>
          <div className="text-teal-200 text-sm">Takes less than 1 minute</div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-32 flex flex-col gap-4">
        {/* Transport Service Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-teal-700 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="white" strokeWidth={1.8}>
                <rect x="1" y="10" width="22" height="9" rx="2" />
                <path d="M5 10V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4" />
                <circle cx="7" cy="19" r="2" />
                <circle cx="17" cy="19" r="2" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-white text-base">We are a Transport Service</div>
              <div className="text-teal-200 text-xs">Safe, reliable, non-medical</div>
            </div>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            {CHECK_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <svg viewBox="0 0 20 20" width={18} height={18} fill="none" className="flex-shrink-0 mt-0.5">
                  <path d="M4 10l4 4 8-8" stroke="#0d9488" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-slate-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NOT an Ambulance Card */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-red-600 px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="white" strokeWidth={1.8}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-white text-base">We are NOT an Ambulance</div>
              <div className="text-red-200 text-xs">Please read carefully</div>
            </div>
          </div>
          <div className="px-4 py-4 flex flex-col gap-3">
            {NOT_ITEMS.map((item) => (
              <div key={item} className="flex items-start gap-3">
                <svg viewBox="0 0 20 20" width={18} height={18} fill="none" className="flex-shrink-0 mt-0.5">
                  <path d="M5 5l10 10M15 5L5 15" stroke="#ef4444" strokeWidth={2.2} strokeLinecap="round" />
                </svg>
                <span className="text-slate-700 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-40">
        <button
          className="w-full bg-teal-700 text-white font-bold text-base rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-teal-800 transition"
          onClick={() => navigate("/booking/duration")}
        >
          <svg viewBox="0 0 20 20" width={18} height={18} fill="none">
            <path d="M4 10l4 4 8-8" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          I Understand — Continue to Booking
        </button>
        <p className="text-slate-400 text-xs text-center mt-2">Step 1 of 5: Choose your booking duration</p>
      </div>
    </div>
  );
}
