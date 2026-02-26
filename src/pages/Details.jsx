import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";

const WHEELCHAIR_OPTIONS = [
  {
    id: "standard",
    label: "Standard Width",
    badge: "Fits Easily",
    badgeColor: "bg-teal-100 text-teal-700",
    dimension: "Up to 24 inches (61 cm)",
    desc: "Most standard and transport wheelchairs. Fits our van comfortably.",
  },
  {
    id: "wide",
    label: "Wide / Power Chair",
    badge: "Confirm Width",
    badgeColor: "bg-amber-100 text-amber-700",
    dimension: "Up to 28 inches (71 cm)",
    desc: "Power wheelchairs and bariatric models. Please confirm width before booking.",
  },
];

export default function Details({ onNext, onBack }) {
  const navigate = useNavigate();
  const [wheelchairType, setWheelchairType] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [notEmergency, setNotEmergency] = useState(false);

  const allValid = wheelchairType && fullName.trim() && phone.trim() && notEmergency;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <TopBar
        title="Confirm Details"
        subtitle="Wheelchair & passenger information"
        showBack
        onBack={onBack || (() => navigate(-1))}
      />
      <Stepper current={3} />

      <main className="flex-1 px-4 pt-5 pb-36">
        <h2 className="text-slate-900 font-extrabold text-2xl mb-1">Confirm Your Details</h2>
        <p className="text-slate-500 text-sm mb-5">
          We need this information before confirming your booking
        </p>

        {/* Wheelchair Type card */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#0d9488" strokeWidth={1.8}>
                <circle cx="12" cy="6" r="2" />
                <path d="M9 12h3l1 5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M7 17a4 4 0 1 0 8 0" strokeLinecap="round" />
                <path d="M16 10l2 2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">Wheelchair Type</span>
            </div>
            <span className="text-red-500 font-bold text-sm">Required</span>
          </div>
          <p className="px-4 pb-3 text-slate-500 text-sm">
            Select the width of your wheelchair so we can confirm our van can accommodate it.
          </p>
          <div className="px-4 pb-4 flex flex-col gap-3">
            {WHEELCHAIR_OPTIONS.map((opt) => {
              const isSelected = wheelchairType === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setWheelchairType(opt.id)}
                  className={[
                    "w-full text-left rounded-2xl border-2 px-4 py-4 flex items-start gap-3 transition",
                    isSelected ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                      isSelected ? "border-teal-600 bg-teal-600" : "border-slate-300",
                    ].join(" ")}
                  >
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="font-bold text-slate-900 text-sm">{opt.label}</span>
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${opt.badgeColor}`}>
                        {opt.badge}
                      </span>
                    </div>
                    <div className="text-teal-700 font-bold text-xs mb-1">{opt.dimension}</div>
                    <div className="text-slate-500 text-xs leading-relaxed">{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Passenger info card */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#3b82f6" strokeWidth={1.8}>
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" strokeLinecap="round" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">Passenger Information</span>
            </div>
            <span className="text-red-500 font-bold text-sm">Required</span>
          </div>
          <p className="px-4 pb-3 text-slate-500 text-sm">
            Enter details of the person being transported.
          </p>
          <div className="px-4 pb-4 flex flex-col gap-3">
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-500 outline-none transition"
                placeholder="e.g. Muhammad Tariq"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-slate-700 text-xs font-semibold mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-xl border-2 border-slate-200 px-4 py-3 text-sm focus:border-teal-500 outline-none transition"
                placeholder="e.g. 0300-1234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="tel"
              />
            </div>
          </div>
        </div>

        {/* Emergency confirmation */}
        <div className="bg-white rounded-2xl shadow-sm mb-4 overflow-hidden">
          <div className="px-4 pt-4 pb-3 flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg viewBox="0 0 24 24" width={22} height={22} fill="none" stroke="#f59e0b" strokeWidth={1.8}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <div className="flex-1">
              <span className="font-bold text-slate-900 text-base">Important Confirmation</span>
            </div>
            <span className="text-red-500 font-bold text-sm">Required</span>
          </div>
          <div className="px-4 pb-4">
            <button
              onClick={() => setNotEmergency(!notEmergency)}
              className={[
                "w-full text-left rounded-2xl border-2 px-4 py-4 flex items-start gap-3 transition",
                notEmergency ? "border-teal-500 bg-teal-50" : "border-slate-200 bg-white",
              ].join(" ")}
            >
              <div
                className={[
                  "w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                  notEmergency ? "border-teal-600 bg-teal-600" : "border-slate-300",
                ].join(" ")}
              >
                {notEmergency && (
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <path d="M2 6l3 3 5-5" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm mb-0.5">
                  I confirm this is NOT a medical emergency
                </div>
                <div className="text-slate-500 text-xs">
                  For emergencies, please call 1122 (Rescue)
                </div>
              </div>
            </button>
          </div>
        </div>
      </main>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-4 py-4 z-40">
        {!allValid && (
          <p className="text-orange-500 font-semibold text-sm text-center mb-3">
            Complete all required fields above to continue
          </p>
        )}
        <button
          disabled={!allValid}
          className={[
            "w-full font-bold text-base rounded-2xl py-4 transition",
            allValid
              ? "bg-teal-700 text-white hover:bg-teal-800"
              : "bg-slate-200 text-slate-400 cursor-not-allowed",
          ].join(" ")}
          onClick={() => {
            if (!allValid) return;
            if (onNext) onNext({ wheelchairType, fullName, phone });
            else navigate("/booking/review");
          }}
        >
          {allValid ? "Continue to Review →" : "Fill in all required fields"}
        </button>
      </div>
    </div>
  );
}
