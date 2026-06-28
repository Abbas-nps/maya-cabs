export const policyChanges = [
  {
    id: "2026-05-03-two-hour-slot-gap-policy",
    timestamp: "2026-05-03T12:35:00+05:00",
    title: "Two-Hour Gap Between Bookings Enforced",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "A mandatory 2-hour gap is now enforced after every booking before the next ride can start.",
      "Schedule availability, public calendar availability, and admin manual booking checks now follow the same gap rule.",
      "Example: if a ride is booked from 12:00 PM to 6:00 PM, the next available ride can start at 8:00 PM, not 7:00 PM."
    ],
    whyChanged:
      "To allow reliable turnaround time for refueling, cleaning, route reset, and operational preparation between rides.",
    customerImpact:
      "Customers will see slightly fewer same-day back-to-back slot options, but the schedule shown on the booking page and public calendar will be more accurate and operationally reliable."
  },
  {
    id: "2026-05-03-flexible-start-slot-policy",
    timestamp: "2026-05-03T12:20:00+05:00",
    title: "Flexible 24-Hour Start Time Policy",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "Customers can now choose any available hourly start time on a 24-hour clock.",
      "Booking duration remains restricted to exactly 6 hours or exactly 12 hours only.",
      "Admin manual booking now uses the same flexible start-time model and supports Lahore or Karachi selection so manual entries appear correctly on the city calendar."
    ],
    whyChanged:
      "To give customers more control over ride start times while still maintaining standardized booking durations for operations.",
    customerImpact:
      "Customers are no longer limited to a small set of fixed start windows. They can book the start hour that fits their schedule, subject to city-specific availability and overlap rules."
  },
  {
    id: "2026-05-03-city-separated-calendar-policy",
    timestamp: "2026-05-03T11:20:00+05:00",
    title: "City-Separated Booking Calendar Policy",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "City selection now uses city-specific booking paths (/booking/city/lahore and /booking/city/karachi).",
      "Schedule availability now filters bookings by selected city so Lahore and Karachi calendars do not overlap.",
      "Public calendar availability page added at /calender (also available at /calendar)."
    ],
    whyChanged:
      "To prevent cross-city booking conflicts and provide transparent public visibility for city-wise open and closed dates.",
    customerImpact:
      "Customers now see accurate city-specific availability. A booking in Lahore will no longer block Karachi slots and vice versa."
  },
  {
    id: "2026-05-03-crm-airport-manual-booking",
    timestamp: "2026-05-03T11:25:00+05:00",
    title: "CRM Manual Booking Entry Expanded",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "Manual Booking Entry in CRM now includes Airport Pick & Drop as a selectable category."
    ],
    whyChanged:
      "To align CRM manual booking capture with real customer trip types used by operations.",
    customerImpact:
      "Airport rides can now be logged and tracked correctly in CRM reports."
  },
  {
    id: "2026-04-10-customer-login-policy",
    timestamp: "2026-04-10T21:10:00+05:00",
    title: "Customer Login and Profile Policy",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "Customer login uses mobile number as username and PIN as password.",
      "Only one profile is allowed per mobile number.",
      "Mobile numbers are restricted to Pakistan format beginning with +92.",
      "Duplicate profile creation is blocked for existing numbers."
    ],
    whyChanged:
      "To keep account access simple, prevent duplicate customer records, and maintain a local Pakistan-only profile base.",
    customerImpact:
      "Customers sign in with one +92 mobile number and PIN, and the same synced profile is used across devices."
  },
  {
    id: "2026-04-10-ride-number-policy",
    timestamp: "2026-04-10T21:15:00+05:00",
    title: "Ride Number Assignment Policy",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "Each confirmed or completed ride now displays an alphanumeric ride number.",
      "Ride numbers are auto-generated and linked to booking records.",
      "Existing confirmed and completed rides also receive ride numbers in admin view."
    ],
    whyChanged:
      "To improve operational tracking, customer communication, and support reference handling.",
    customerImpact:
      "Customers and support staff can use a unique ride number for quicker identification of confirmed or completed bookings."
  },
  {
    id: "2026-04-06-fixed-slot-policy",
    timestamp: "2026-04-06T21:15:00+05:00",
    title: "Fixed Slot Booking Policy Introduced",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "Booking durations changed to fixed 6-hour and 12-hour slots only.",
      "6-hour slots fixed at 10:00-16:00 and 18:00-00:00.",
      "12-hour slots fixed at 10:00-22:00, 11:00-23:00, and 12:00-00:00.",
      "No slot extensions allowed after booking confirmation."
    ],
    whyChanged:
      "To improve operational reliability, enforce driver break/refuel windows, and reduce schedule conflicts for customers.",
    customerImpact:
      "Customers now select fixed slots instead of flexible hourly ranges. Availability is shown as Available or Booked only."
  },
  {
    id: "2026-04-05-midnight-window-update",
    timestamp: "2026-04-05T20:40:00+05:00",
    title: "Booking End-Time Extended to Midnight",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "Booking windows now support rides ending at 12:00 AM (midnight).",
      "Late-evening slot options were enabled in booking UI."
    ],
    whyChanged:
      "To support hospital and appointment schedules that run later in the evening.",
    customerImpact:
      "Customers can select valid evening windows that end at midnight."
  },
  {
    id: "2026-04-04-pricing-revision",
    timestamp: "2026-04-04T18:30:00+05:00",
    title: "Pricing Revision and Notice Update",
    changedBy: "Maya Cabs Operations",
    whatChanged: [
      "Pricing notice updated to reflect revised rates and policy language.",
      "Booking flow pricing display and totals were updated accordingly."
    ],
    whyChanged:
      "Fuel price volatility required a pricing policy update and clearer communication at booking time.",
    customerImpact:
      "Customers see updated pricing terms before proceeding and during confirmation."
  }
];
