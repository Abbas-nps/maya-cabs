import React from "react";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import AppRoutes from "./AppRoutes";
import FuelPriceNotice from "./components/FuelPriceNotice";
import CustomerSessionBadge from "./components/CustomerSessionBadge";
import { localBusinessSchema } from "./seo/structuredData";

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        {/* Global JSON-LD structured data injected once at app root */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <FuelPriceNotice />
        <CustomerSessionBadge />
        <AppRoutes />
      </BrowserRouter>
    </HelmetProvider>
  );
}