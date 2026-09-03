import { Reveal } from "react-awesome-reveal";
import { ShieldCheckIcon, MapIcon, HeartIcon, CurrencyBangladeshiIcon } from "@heroicons/react/24/outline";

const reasons = [
  {
    title: "Verified Local Guides",
    text: "Every guide is identity-verified and reviewed by real travelers after each tour.",
    Icon: ShieldCheckIcon,
  },
  {
    title: "Authentic Itineraries",
    text: "No tourist traps. Tours are designed by people who actually live in these places.",
    Icon: MapIcon,
  },
  {
    title: "Flexible Booking",
    text: "Reserve in minutes, message your guide, and cancel free before your tour starts.",
    Icon: HeartIcon,
  },
  {
    title: "Fair Local Pricing",
    text: "You pay local prices — most of every booking goes directly to the guide.",
    Icon: CurrencyBangladeshiIcon,
  },
];

export default function WhyChooseSection() {
  return (
    <section className="bg-teal-900 py-20 text-white dark:bg-teal-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Why Choose TourNest?</h2>
          <p className="mx-auto mt-3 max-w-2xl text-teal-100/80">
            We are not a faceless marketplace — we are a bridge between travelers
            and the communities that host them.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {reasons.map((r, i) => (
            <Reveal key={r.title} delay={i * 100} triggerOnce>
              <div className="h-full rounded-2xl bg-white/5 p-6 ring-1 ring-white/10 backdrop-blur transition hover:bg-white/10">
                <r.Icon className="h-9 w-9 text-amber-400" />
                <h3 className="mt-4 text-lg font-bold">{r.title}</h3>
                <p className="mt-2 text-sm leading-6 text-teal-100/75">{r.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
