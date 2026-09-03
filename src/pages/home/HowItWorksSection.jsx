import { Reveal } from "react-awesome-reveal";
import { MagnifyingGlassIcon, UserGroupIcon, CalendarDaysIcon, GlobeAltIcon } from "@heroicons/react/24/outline";

const steps = [
  { n: "01", title: "Discover", text: "Browse tours by category, destination or price across Bangladesh.", Icon: MagnifyingGlassIcon },
  { n: "02", title: "Choose Guide", text: "Read profiles, languages and traveler ratings to pick your match.", Icon: UserGroupIcon },
  { n: "03", title: "Book", text: "Pick a date and group size — your total updates instantly.", Icon: CalendarDaysIcon },
  { n: "04", title: "Explore", text: "Meet your guide at the meeting point and live the experience.", Icon: GlobeAltIcon },
];

export default function HowItWorksSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="section-title">How It Works</h2>
        <p className="section-subtitle mx-auto">
          From first click to first footsteps — four simple steps.
        </p>
      </div>
      <div className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
        <div className="absolute left-0 right-0 top-8 hidden border-t-2 border-dashed border-teal-200 lg:block dark:border-teal-900" aria-hidden="true" />
        {steps.map((s, i) => (
          <Reveal key={s.n} delay={i * 120} triggerOnce>
            <div className="relative flex flex-col items-center text-center">
              <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-teal-600 text-white shadow-lg">
                <s.Icon className="h-7 w-7" />
                <span className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-xs font-bold">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-stone-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-400">{s.text}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
