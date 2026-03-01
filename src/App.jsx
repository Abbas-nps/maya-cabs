import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import Duration from "./pages/Duration";
import Schedule from "./pages/Schedule";
import Details from "./pages/Details";
import Review from "./pages/Review";
import Payment from "./pages/Payment";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/booking/duration" element={<Duration />} />
        <Route path="/booking/schedule" element={<Schedule />} />
        <Route path="/booking/details" element={<Details />} />
        <Route path="/booking/review" element={<Review />} />
        <Route path="/booking/payment" element={<Payment />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}