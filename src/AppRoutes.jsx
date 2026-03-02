import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Eagerly loaded (booking flow + home)
import Home from "./pages/Home";
import About from "./pages/About";

// Lazy loaded — booking flow (split chunk)
const Duration = lazy(() => import("./pages/Duration"));
const Schedule = lazy(() => import("./pages/Schedule"));
const Details = lazy(() => import("./pages/Details"));
const Review = lazy(() => import("./pages/Review"));
const Payment = lazy(() => import("./pages/Payment"));
const Admin = lazy(() => import("./pages/Admin"));

// Lazy loaded — SEO content pages
const Services = lazy(() => import("./pages/Services"));
const HowItWorks = lazy(() => import("./pages/HowItWorks"));
const WheelchairTransport = lazy(() => import("./pages/WheelchairTransport"));
const HospitalTransport = lazy(() => import("./pages/HospitalTransport"));
const AirportTransfer = lazy(() => import("./pages/AirportTransfer"));
const AreasServed = lazy(() => import("./pages/AreasServed"));
const Contact = lazy(() => import("./pages/Contact"));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="w-8 h-8 border-4 border-teal-700 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/home" replace />} />

        {/* Main pages */}
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />

        {/* Booking flow */}
        <Route path="/booking/duration" element={<Duration />} />
        <Route path="/booking/schedule" element={<Schedule />} />
        <Route path="/booking/details" element={<Details />} />
        <Route path="/booking/review" element={<Review />} />
        <Route path="/booking/payment" element={<Payment />} />

        {/* Admin */}
        <Route path="/admin" element={<Admin />} />

        {/* SEO content pages */}
        <Route path="/services" element={<Services />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/wheelchair-transport" element={<WheelchairTransport />} />
        <Route path="/hospital-transport" element={<HospitalTransport />} />
        <Route path="/airport-transfer" element={<AirportTransfer />} />
        <Route path="/areas-served" element={<AreasServed />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </Suspense>
  );
}
