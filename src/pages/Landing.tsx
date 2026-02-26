import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Heart,
  Phone,
  Shield,
  Accessibility,
  Star,
  Users,
  BadgeCheck,
} from "lucide-react";

const VAN_IMAGE =
  "https://images.unsplash.com/photo-1572015869811-68e5820b1174?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aGVlbGNoYWlyJTIwYWNjZXNzaWJsZSUyMHZhbiUyMHRyYW5zcG9ydCUyMFBha2lzdGFufGVufDF8fHx8MTc3MjA1Mjg4OXww&ixlib=rb-4.1.0&q=80&w=1080";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Hero Section */}
      <div className="relative bg-teal-700 overflow-hidden">
        {/* Hero Image */}
        <div className="relative h-52 overflow-hidden">
          <img
            src={VAN_IMAGE}
            alt="Maya Cabs wheelchair accessible van"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-teal-800/60 to-teal-700" />
        </div>

        {/* Hero Content */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="px-6 pt-4 pb-8 text-white"
        >
          <div className="inline-flex items-center gap-2 bg-white/20 border border-white/30 rounded-full px-3 py-1.5 mb-4">
            <Accessibility size={14} />
            <span className="text-xs font-bold tracking-wide uppercase">
              Wheelchair Accessible Van
            </span>
          </div>

          <h2
            className="text-3xl font-black text-white leading-tight mb-3"
            style={{ lineHeight: 1.2 }}
          >
            Safe transport for wheelchair users in Lahore
          </h2>

          <p className="text-teal-100 text-base leading-relaxed mb-6">
            Pre-booked, door-to-door van service. Trained drivers. Not an
            ambulance — a reliable transport service for appointments, hospital
            visits, and daily needs.
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { value: "10hrs", label: "Daily Service" },
              { value: "4.9★", label: "Avg. Rating" },
              { value: "2025", label: "Est. Since" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white/15 border border-white/20 rounded-xl p-3 text-center"
              >
                <div className="font-black text-lg text-white leading-none">
                  {stat.value}
                </div>
                <div className="text-teal-200 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate("/service-info")}
            className="w-full bg-white text-teal-800 font-black text-lg py-4 px-6 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            Book a Ride
            <ArrowRight className="w-5 h-5" />
          </button>

          <p className="text-teal-200/80 text-xs text-center mt-3">
            Booking confirmed via WhatsApp • Min. 2 hours
          </p>
        </motion.div>
      </div>

      {/* Trust Banner */}
      <div className="bg-amber-50 border-y border-amber-200 px-5 py-3 flex items-center gap-3">
        <Shield size={20} className="text-amber-600 shrink-0" />
        <p className="text-amber-800 text-sm font-semibold leading-tight">
          This is NOT an ambulance service. For medical emergencies, call{" "}
          <span className="font-black">1122</span>.
        </p>
      </div>

      {/* Features */}
      <div className="px-5 py-6">
        <h3
          className="font-black text-slate-800 mb-1"
          style={{ fontSize: "1.1rem" }}
        >
          Why families trust Maya Cabs
        </h3>
        <p className="text-slate-500 text-sm mb-5">
          Built for wheelchair users and their caregivers
        </p>

        <div className="space-y-3">
          <FeatureCard
            icon={<Accessibility className="text-teal-600" size={22} />}
            color="teal"
            title="Wheelchair-Ready Van"
            desc="Hydraulic ramp, secured locking points for all standard and wide wheelchairs."
          />
          <FeatureCard
            icon={<Heart className="text-rose-500" size={22} />}
            color="rose"
            title="Patient, Respectful Drivers"
            desc="Trained to assist elderly and disabled passengers. No rushing. No shortcuts."
          />
          <FeatureCard
            icon={<Clock className="text-blue-600" size={22} />}
            color="blue"
            title="Flexible Hourly Booking"
            desc="Book 2, 3, or 4 hours. Pay per hour. Suitable for multiple stops or long appointments."
          />
          <FeatureCard
            icon={<BadgeCheck className="text-emerald-600" size={22} />}
            color="emerald"
            title="WhatsApp Confirmation"
            desc="Every booking confirmed by our team on WhatsApp before the ride day."
          />
        </div>
      </div>

      {/* How It Works */}
      <div className="px-5 pb-6">
        <h3
          className="font-black text-slate-800 mb-5"
          style={{ fontSize: "1.1rem" }}
        >
          How to book — 3 simple steps
        </h3>
        <div className="space-y-4">
          {[
            {
              step: "1",
              title: "Choose your hours & slot",
              desc: "Pick 2–4 hours and select an available date and time.",
            },
            {
              step: "2",
              title: "Confirm details & pay",
              desc: "Verify wheelchair type, passenger info, and transfer the amount via bank.",
            },
            {
              step: "3",
              title: "WhatsApp confirmation",
              desc: "Our team confirms your booking on WhatsApp. Driver contacts you on the day.",
            },
          ].map((item) => (
            <div key={item.step} className="flex gap-4 items-start">
              <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center font-black text-base shrink-0 mt-0.5">
                {item.step}
              </div>
              <div>
                <div className="font-bold text-slate-800 text-base leading-tight">
                  {item.title}
                </div>
                <div className="text-slate-500 text-sm mt-1 leading-relaxed">
                  {item.desc}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonial */}
      <div className="mx-5 mb-6 bg-teal-50 border border-teal-100 rounded-2xl p-5">
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
          ))}
        </div>
        <p className="text-slate-700 text-sm leading-relaxed italic mb-3">
          "We use Maya Cabs every week for my mother's dialysis. The driver is
          always on time and handles her wheelchair with so much care. Highly
          recommended."
        </p>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-200 rounded-full flex items-center justify-center">
            <Users size={14} className="text-teal-700" />
          </div>
          <div>
            <div className="font-bold text-slate-800 text-sm">
              Hina Bajwa
            </div>
            <div className="text-slate-500 text-xs">Daughter, Lahore</div>
          </div>
        </div>
      </div>

      {/* Book CTA */}
      <div className="px-5 pb-4">
        <button
          onClick={() => navigate("/service-info")}
          className="w-full bg-teal-700 text-white font-black text-lg py-4 rounded-2xl shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
        >
          Book a Ride Now
          <ArrowRight className="w-5 h-5" />
        </button>
        <p className="text-center text-slate-400 text-xs mt-2">
            Minimum 2 hours • PKR 2,500/hr • Bank transfer
          </p>
      </div>

      {/* Footer */}
      <div className="bg-slate-50 border-t border-slate-100 px-5 py-5">
        <p className="text-slate-500 text-sm text-center mb-3">
          Need help or have a question?
        </p>
        <a
          href="tel:+923396292222"
          className="flex items-center justify-center gap-2 text-teal-700 font-bold mx-auto border border-teal-200 px-5 py-3 rounded-xl bg-white shadow-sm w-full"
        >
          <Phone size={16} />
          Call Support: 0339-629-2222
        </a>
        <p className="text-slate-400 text-xs text-center mt-4 leading-relaxed">
          Maya Cabs is a registered transport service in Lahore, Pakistan.
          <br />
          Operating since 2025.
        </p>
      </div>
    </div>
  );
}

const colorMap = {
  teal: "bg-teal-50 border-teal-100",
  rose: "bg-rose-50 border-rose-100",
  blue: "bg-blue-50 border-blue-100",
  emerald: "bg-emerald-50 border-emerald-100",
};

function FeatureCard({
  icon,
  color,
  title,
  desc,
}: {
  icon: React.ReactNode;
  color: "teal" | "rose" | "blue" | "emerald";
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={`flex gap-4 items-start p-4 rounded-2xl border ${colorMap[color]}`}
    >
      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-white shrink-0">
        {icon}
      </div>
      <div>
        <div className="font-bold text-slate-800 text-base leading-tight mb-1">
          {title}
        </div>
        <div className="text-slate-600 text-sm leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  );
}