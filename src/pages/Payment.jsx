import React from "react";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";
import Card from "../components/Card";
import StickyFooter from "../components/StickyFooter";

export default function Payment() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar title="Payment" rightPill="Maya Cabs" showBack />
      <Stepper current={5} />
      <main className="flex-1 flex flex-col items-center px-4 pb-32">
        <Card className="mb-4 w-full max-w-lg">
          <div className="font-bold text-lg text-slate-900 mb-2">Payment</div>
          <div className="text-slate-600 mb-4">Payment processing coming soon.</div>
        </Card>
      </main>
      <StickyFooter>
        <button
          className="w-full bg-teal-600 text-white font-bold text-lg rounded-full py-4 shadow-md hover:bg-teal-700 transition"
          disabled
        >
          Complete Payment
        </button>
      </StickyFooter>
    </div>
  );
}
