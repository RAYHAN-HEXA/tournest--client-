import { Reveal } from "react-awesome-reveal";
import { StarIcon } from "@heroicons/react/24/solid";

const testimonials = [
  {
    name: "Emily Watson",
    origin: "London, UK",
    tour: "Old Dhaka Heritage & Street Food Crawl",
    text: "Tanvir didn't just show us Old Dhaka — he introduced us to it. Shopkeepers greeted him by name, and every jilapi stop came with a story. I've done food tours on four continents; this was the most personal.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Rakesh Menon",
    origin: "Bangalore, India",
    tour: "Sundarbans Mangrove Explorer",
    text: "Three days without a signal and I never once wanted it back. Rashedul spotted a tiger paw print at fifty paces and cooked breakfast better than our hotel. The boat crew treated us like family.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  },
  {
    name: "Sarah Lindqvist",
    origin: "Stockholm, Sweden",
    tour: "Bandarban Hill Tracts Trek",
    text: "I was nervous about the trek but Mitali set a pace everyone could keep. Waking up at Nilgiri above the clouds is a core memory now. Booking through TourNest felt safe from start to finish.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-stone-100/70 py-20 dark:bg-stone-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="section-title">Traveler Stories</h2>
          <p className="section-subtitle mx-auto">
            Over 2,400 travelers have explored with TourNest guides. Here is what
            a few of them said.
          </p>
        </div>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.name} delay={i * 120} triggerOnce>
              <figure className="card flex h-full flex-col p-6">
                <span className="text-5xl leading-none text-teal-600/40 dark:text-teal-400/40" aria-hidden="true">“</span>
                <blockquote className="mt-3 flex-1 text-sm leading-7 text-stone-600 dark:text-stone-300">
                  {t.text}
                </blockquote>
                <div className="mt-4 flex gap-0.5" aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <StarIcon key={s} className="h-4 w-4 text-amber-500" />
                  ))}
                </div>
                <figcaption className="mt-4 flex items-center gap-3 border-t border-stone-100 pt-4 dark:border-stone-800">
                  <img src={t.avatar} alt="" className="h-11 w-11 rounded-full object-cover" referrerPolicy="no-referrer" />
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {t.origin} · {t.tour}
                    </p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
