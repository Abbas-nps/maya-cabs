import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

export default function Services() {
  return (
    <>
      <Helmet>
        <title>Wheelchair Transport Services in Lahore | Maya Cabs</title>
        <meta
          name="description"
          content="Discover all wheelchair accessible transport services by Maya Cabs in Lahore: hospital transport, therapy visits, airport transfers and daily assisted mobility rides."
        />
        <link rel="canonical" href="https://mayacabs.pk/services" />
        <meta property="og:title" content="Wheelchair Transport Services in Lahore | Maya Cabs" />
        <meta property="og:url" content="https://mayacabs.pk/services" />
      </Helmet>

      <div className="min-h-screen bg-slate-50">
        {/* Header */}
        <header className="bg-teal-700 text-white px-5 py-4 sticky top-0 z-30">
          <Link to="/home" className="flex items-center gap-3">
            <div className="font-bold text-lg">Maya Cabs</div>
            <span className="text-teal-200 text-sm">Wheelchair Accessible Transport</span>
          </Link>
        </header>

        <main className="max-w-2xl mx-auto px-5 py-10">
          <h1 className="text-3xl font-extrabold text-slate-900 mb-4">
            Wheelchair Accessible Transport Services in Lahore
          </h1>
          <p className="text-slate-600 text-base leading-relaxed mb-8">
            Maya Cabs is Pakistan's first dedicated wheelchair accessible van service, built
            specifically for people with mobility challenges, their families, and caregivers in
            Lahore. Every vehicle in our fleet is equipped with a hydraulic boarding ramp, interior
            wheelchair tie-down anchors, and safety harness straps — ensuring your loved one travels
            in complete safety and dignity.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">Our Core Services</h2>

          <div className="space-y-6">
            <ServiceCard
              title="Wheelchair Transport"
              href="/wheelchair-transport"
              icon="♿"
              description="Our flagship service — a fully equipped hydraulic ramp van picks you up from your door
              and drops you directly at your destination anywhere within Lahore. The van is designed
              to accommodate both manual and powered wheelchairs of all standard widths. The driver is
              trained in safe boarding procedures, secures the wheelchair at four anchor points,
              and assists the passenger with a safety lap belt and shoulder harness. You never need
              to transfer out of your wheelchair, eliminating the risk of falls or discomfort."
            />

            <ServiceCard
              title="Hospital & Clinic Transport"
              href="/hospital-transport"
              icon="🏥"
              description="Getting to a hospital appointment should not be stressful. Maya Cabs provides
              pre-booked, time-slot based transport to all major hospitals and clinics in Lahore
              including Services Hospital, Jinnah Hospital, Mayo Hospital, Shaukat Khanum Cancer
              Hospital, Doctors Hospital, Hameed Latif Hospital, and private specialist clinics in
              DHA and Gulberg. You book a 2-, 3-, or 4-hour slot and the driver arrives at your home,
              waits if required during short appointments, and brings you back safely."
            />

            <ServiceCard
              title="Physiotherapy & Therapy Visits"
              href="/how-it-works"
              icon="🏋️"
              description="Physiotherapy, occupational therapy, speech therapy, and rehabilitation sessions
              require regular attendance. Missing these appointments due to transport difficulties
              delays recovery significantly. Maya Cabs offers a reliable weekly or daily transport
              schedule to therapy centres across Lahore. The driver understands the importance of
              punctuality for therapy sessions and ensures you arrive on time, every time."
            />

            <ServiceCard
              title="Airport Transfer"
              href="/airport-transfer"
              icon="✈️"
              description="Allama Iqbal International Airport can be overwhelming for passengers in wheelchairs
              without the right vehicle. Maya Cabs offers pre-booked wheelchair accessible airport
              transfers with ample boot space for folding wheelchairs, luggage, and medical equipment.
              Flights are tracked to allow for delays. The driver assists from your door to the
              airport check-in area, and on arrival, meets you at the arrivals hall."
            />

            <ServiceCard
              title="Daily Assisted Mobility"
              href="/wheelchair-transport"
              icon="🌟"
              description="Beyond medical appointments, wheelchair users deserve the freedom to go to
              weddings, family gatherings, markets, parks, and restaurants. Maya Cabs supports
              everyday movement through Lahore with dignity. Whether it is a family event in
              Johar Town, a visit to Emporium Mall, or attending Friday prayers at a local mosque,
              we are here to make mobility possible."
            />

            <ServiceCard
              title="Wait-and-Return Trips"
              href="/how-it-works"
              icon="🔄"
              description="For appointments where the duration is uncertain — such as doctor consultations,
              diagnostic tests, or blood work — Maya Cabs offers a wait-and-return option. You book
              a 2, 3, or 4-hour time slot. The driver waits at the facility for the full duration
              and returns you home when your appointment is complete. This is ideal for elderly
              patients going alone, or patients whose caregivers cannot take time off work."
            />
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mt-12 mb-4">
            Why Choose an Accessible Van?
          </h2>
          <p className="text-slate-600 leading-relaxed mb-4">
            Standard taxis and ride-hailing apps in Pakistan are not designed for wheelchair users.
            Passengers must struggle out of their wheelchairs, the chair must be folded and lifted
            into the boot, and drivers rarely have any training in assisting mobility-impaired
            passengers. This is not just inconvenient — it is unsafe and undignified.
          </p>
          <p className="text-slate-600 leading-relaxed mb-4">
            Maya Cabs was founded specifically to address this gap. Our vans have been outfitted
            with NPS Authorized Wheelchair Accessible modifications: a floor-level hydraulic ramp
            that deploys at the press of a button, widened side door for easy entry, interior grab
            rails for additional support, and a lowered floor height. All of this ensures that the
            passenger and their wheelchair are loaded and secured without any transfer, without any
            lifting, and without any risk.
          </p>

          <h2 className="text-2xl font-bold text-slate-900 mt-10 mb-4">
            Booking a Service
          </h2>
          <p className="text-slate-600 leading-relaxed mb-6">
            All Maya Cabs services are booked online through this website. You choose your date,
            time slot (2, 3, or 4 hours), enter your pickup and destination addresses, and confirm
            via WhatsApp. Payment is prepaid. An SMS and WhatsApp confirmation is sent once the
            booking is received. The driver calls 30 minutes before arrival.
          </p>

          <Link
            to="/about"
            className="block w-full bg-teal-700 text-white text-center font-bold text-lg rounded-2xl py-4 hover:bg-teal-800 transition"
          >
            Book a Ride →
          </Link>
        </main>
      </div>
    </>
  );
}

function ServiceCard({ title, href, icon, description }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
      <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      <Link to={href} className="inline-block mt-3 text-teal-700 font-semibold text-sm hover:underline">
        Learn more →
      </Link>
    </div>
  );
}
