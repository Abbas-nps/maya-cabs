import React from "react";
import { useNavigate } from "react-router-dom";

export default function TopBar({ title = "Maya Cabs", subtitle = null, rightLabel = "Maya Cabs", showBack = false, onBack = null }) {
  const navigate = useNavigate();
  const handleBack = onBack || (() => navigate(-1));

  return (
    <header className="w-full bg-teal-700 text-white flex items-center px-4 py-3 shadow-sm sticky top-0 z-30 min-h-[64px]">
      {showBack ? (
        <button
          aria-label="Back"
          className="mr-3 w-10 h-10 flex items-center justify-center rounded-xl bg-teal-600/60 hover:bg-teal-600 transition flex-shrink-0"
          onClick={handleBack}
        >
          <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M13 16l-5-5 5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      ) : (
        <div className="w-10 mr-3 flex-shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-bold text-base leading-tight truncate">{title}</div>
        {subtitle && <div className="text-teal-200 text-xs leading-tight truncate mt-0.5">{subtitle}</div>}
      </div>
      {rightLabel && (
        <span className="ml-3 bg-white/20 text-white px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap flex-shrink-0">
          {rightLabel}
        </span>
      )}
    </header>
  );
}
