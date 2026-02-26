import React from "react";

export default function Pill({ children, color = "teal", className = "" }) {
  const colorMap = {
    teal: "bg-teal-100 text-teal-800",
    red: "bg-red-100 text-red-700",
    yellow: "bg-yellow-100 text-yellow-800",
    green: "bg-green-100 text-green-800",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${colorMap[color] || colorMap.teal} ${className}`}
    >
      {children}
    </span>
  );
}
