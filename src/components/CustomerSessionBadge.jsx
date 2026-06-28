import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { formatCustomerPhone, readCustomerSession } from "../lib/customerProfile";

export default function CustomerSessionBadge() {
  const location = useLocation();
  const [session, setSession] = useState(() => readCustomerSession());

  useEffect(() => {
    const syncSession = () => setSession(readCustomerSession());
    syncSession();

    window.addEventListener("storage", syncSession);
    window.addEventListener("focus", syncSession);
    window.addEventListener("mayaCabsCustomerSessionChanged", syncSession);

    return () => {
      window.removeEventListener("storage", syncSession);
      window.removeEventListener("focus", syncSession);
      window.removeEventListener("mayaCabsCustomerSessionChanged", syncSession);
    };
  }, [location.pathname]);

  if (!session?.phone) return null;

  const name = session.profile?.full_name || "Customer";

  return (
    <div className="fixed bottom-3 right-3 z-[90] max-w-[92vw] rounded-2xl border border-emerald-200 bg-emerald-50/95 backdrop-blur px-3 py-2 shadow-lg">
      <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Signed In</div>
      <div className="text-sm font-bold text-slate-900 truncate">{name}</div>
      <div className="text-xs text-slate-600 truncate">{formatCustomerPhone(session.phone)}</div>
      <Link to="/customer-login" className="text-xs font-semibold text-emerald-700 hover:underline">
        Manage profile
      </Link>
    </div>
  );
}
