import React from "react";

const STEPS = [
  { label: "Duration" },
  { label: "Schedule" },
  { label: "Details" },
  { label: "Review" },
  { label: "Payment" },
];

export default function Stepper({ current = 1 }) {
  return (
    <div className="w-full bg-white border-b border-slate-100 px-4 py-4">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        {STEPS.map((step, idx) => {
          const num = idx + 1;
          const isActive = num === current;
          const isDone = num < current;
          const isFuture = num > current;
          return (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1 flex-shrink-0">
                <div
                  className={[
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-base transition-all",
                    isDone ? "bg-teal-600 text-white" : "",
                    isActive ? "bg-teal-600 text-white ring-4 ring-teal-200" : "",
                    isFuture ? "bg-white border-2 border-slate-200 text-slate-400" : "",
                  ].join(" ")}
                >
                  {isDone ? (
                    <svg width={18} height={18} viewBox="0 0 18 18" fill="none">
                      <path d="M4 9l3.5 3.5L14 6" stroke="white" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{num}</span>
                  )}
                </div>
                <span
                  className={[
                    "text-xs font-semibold",
                    isActive ? "text-teal-700" : isDone ? "text-teal-600" : "text-slate-400",
                  ].join(" ")}
                >
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={[
                    "flex-1 h-0.5 mx-1 mb-5 rounded-full",
                    idx + 1 < current ? "bg-teal-500" : "bg-slate-200",
                  ].join(" ")}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
