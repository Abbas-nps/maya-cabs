import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing.tsx";
import BookingFlow from "./pages/BookingFlow.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/book" element={<BookingFlow />} />
      </Routes>
    </BrowserRouter>
  );
}