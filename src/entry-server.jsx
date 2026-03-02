import React from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Static imports for SSR prerendering (no lazy loading)
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import HowItWorks from "./pages/HowItWorks";
import WheelchairTransport from "./pages/WheelchairTransport";
import HospitalTransport from "./pages/HospitalTransport";
import AirportTransfer from "./pages/AirportTransfer";
import AreasServed from "./pages/AreasServed";
import Contact from "./pages/Contact";

function SSRApp() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/wheelchair-transport" element={<WheelchairTransport />} />
      <Route path="/hospital-transport" element={<HospitalTransport />} />
      <Route path="/airport-transfer" element={<AirportTransfer />} />
      <Route path="/areas-served" element={<AreasServed />} />
      <Route path="/contact" element={<Contact />} />
    </Routes>
  );
}

export async function render(url) {
  const helmetContext = {};
  const html = ReactDOMServer.renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <SSRApp />
      </StaticRouter>
    </HelmetProvider>
  );
  return { html, helmet: helmetContext.helmet };
}

