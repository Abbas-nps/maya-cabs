import React from "react";

export default function PricingNoticeModal({ open, onAcknowledge }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white border border-amber-300 shadow-2xl overflow-hidden">
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
          <h3 className="font-extrabold text-amber-900 text-base">PRICING NOTICE</h3>
        </div>

        <div className="px-4 py-4 text-sm text-slate-700 space-y-3 leading-relaxed">
          <p>Price is subject to change without prior notice based on fuel price changes and related operating costs.</p>
          <p>
            Even in case of prior booking, rides are charged in accordance with the
            new rate or cancellation of the booking may be enforced.
          </p>
          <p className="font-semibold text-slate-900">By proceeding, you accept these terms.</p>
          <p className="text-xs text-slate-500">
            View change history: <a className="text-teal-700 font-semibold hover:underline" href="/policy-updates">Policy Updates</a>
          </p>
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            className="w-full rounded-xl bg-teal-700 py-3 text-white font-bold hover:bg-teal-800 transition"
            onClick={onAcknowledge}
          >
            I Acknowledge
          </button>
        </div>
      </div>
    </div>
  );
}
