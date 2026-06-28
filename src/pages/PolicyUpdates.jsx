import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { policyChanges } from "../content/policyChanges";

function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toLocaleString("en-PK", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export default function PolicyUpdates() {
  return (
    <>
      <Helmet>
        <title>Policy Updates | Maya Cabs</title>
        <meta
          name="description"
          content="View Maya Cabs policy updates with timestamps, what changed, and why changes were made."
        />
        <link rel="canonical" href="https://mayacabs.pk/policy-updates" />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        <header className="bg-teal-700 text-white px-5 py-4 sticky top-0 z-30">
          <Link to="/home" className="flex items-center gap-3">
            <div className="font-bold text-lg">Maya Cabs</div>
            <span className="text-teal-200 text-sm">Policy Updates</span>
          </Link>
        </header>

        <main className="max-w-3xl mx-auto px-5 py-8">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Policy Change Log</h1>
          <p className="text-slate-600 text-sm mb-6">
            This page shows policy changes with timestamps so customers can understand what changed and why it changed.
          </p>

          <div className="space-y-4">
            {policyChanges.map((entry) => (
              <article key={entry.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h2 className="text-lg font-bold text-slate-900">{entry.title}</h2>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-700 rounded-full px-2.5 py-1 whitespace-nowrap">
                    {formatTimestamp(entry.timestamp)} PKT
                  </span>
                </div>

                <p className="text-xs text-slate-500 mb-3">Updated by: {entry.changedBy}</p>

                <div className="mb-3">
                  <div className="text-sm font-semibold text-slate-800 mb-1">What changed</div>
                  <ul className="list-disc ml-5 text-sm text-slate-700 space-y-1">
                    {entry.whatChanged.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-2">
                  <div className="text-sm font-semibold text-slate-800 mb-1">Why changed</div>
                  <p className="text-sm text-slate-700">{entry.whyChanged}</p>
                </div>

                <div>
                  <div className="text-sm font-semibold text-slate-800 mb-1">Customer impact</div>
                  <p className="text-sm text-slate-700">{entry.customerImpact}</p>
                </div>
              </article>
            ))}
          </div>

          <Link
            to="/about"
            className="mt-6 inline-block rounded-xl bg-teal-700 text-white font-bold px-5 py-3 hover:bg-teal-800 transition"
          >
            Continue to Booking
          </Link>
        </main>
      </div>
    </>
  );
}
