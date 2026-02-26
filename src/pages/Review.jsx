import React from "react";
import TopBar from "../components/TopBar";
import Stepper from "../components/Stepper";
import Card from "../components/Card";
import StickyFooter from "../components/StickyFooter";

export default function Review({ booking, onNext }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <TopBar title="Review Booking" rightPill="Maya Cabs" showBack />
      <Stepper current={4} />
      <main className="flex-1 flex flex-col items-center px-4 pb-32">
        <Card className="mb-4 w-full max-w-lg">
          <div className="font-bold text-lg text-slate-900 mb-2">Review Your Booking</div>
          <div className="text-slate-600 mb-4">Please review your booking details before proceeding to payment.</div>
          {/* Render booking summary here */}
          <div className="text-slate-700 text-sm">
            <div><b>Duration:</b> {booking?.duration} hours</div>
            <div><b>Date:</b> {booking?.date}</div>
            <div><b>Time:</b> {booking?.time}</div>
            <div><b>Passenger:</b> {booking?.fullName}</div>
            <div><b>Wheelchair Type:</b> {booking?.wheelchairType}</div>
          </div>
        </Card>
      </main>
      <StickyFooter>
        <button
          className="w-full bg-teal-600 text-white font-bold text-lg rounded-full py-4 shadow-md hover:bg-teal-700 transition"
          onClick={onNext}
        >
          Proceed to Payment &rarr;
        </button>
      </StickyFooter>
    </div>
  );
}
