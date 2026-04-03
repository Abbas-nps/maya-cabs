import React, { useEffect, useState } from "react";

const NOTICE_STORAGE_KEY = "mayaCabsPriceUpdateNoticeV1";

export default function FuelPriceNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem(NOTICE_STORAGE_KEY) === "dismissed";
      setOpen(!dismissed);
    } catch {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    try {
      localStorage.setItem(NOTICE_STORAGE_KEY, "dismissed");
    } catch {
      // Ignore storage errors and still close the notice.
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-amber-200 overflow-hidden">
        <div className="bg-amber-50 px-4 py-3 border-b border-amber-200 flex items-center justify-between gap-3">
          <h3 className="text-amber-900 font-extrabold text-base">Pricing Update</h3>
          <button
            type="button"
            onClick={dismiss}
            className="text-amber-700 hover:text-amber-900 text-lg leading-none"
            aria-label="Close pricing update notice"
          >
            ×
          </button>
        </div>

        <div className="px-4 py-4 text-sm text-slate-700 space-y-3">
          <p>
            Our hourly fare has changed from <span className="font-bold">PKR 2,500</span> to <span className="font-bold">PKR 4,500</span> per hour.
          </p>
          <p>
            Fuel price increased from <span className="font-bold">PKR 266/L</span> to <span className="font-bold">PKR 458/L</span> (about <span className="font-bold">75%</span>).
          </p>
          <p className="text-slate-600">
            The same booking rules still apply.
          </p>
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={dismiss}
            className="w-full rounded-xl bg-teal-700 py-3 text-white font-bold hover:bg-teal-800 transition"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}