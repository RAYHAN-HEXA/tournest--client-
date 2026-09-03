import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useTypewriter } from "react-simple-typewriter";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1559827260-dc66d52bef19?auto=format&fit=crop&w=1920&q=80",
    kicker: "Sundarbans · Khulna",
    title: "Wild Waters of the",
    accent: "Sundarbans",
    text: "Cruise the world's largest mangrove forest with a guide who grew up on these rivers.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1518998053901-5348d3961a04?auto=format&fit=crop&w=1920&q=80",
    kicker: "Old Dhaka · Heritage",
    title: "Four Centuries of",
    accent: "Old Dhaka",
    text: "Mughal lanes, colonial churches and the best street food on the subcontinent.",
  },
  {
    image:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80",
    kicker: "Bandarban · Hill Tracts",
    title: "Sleep Above the Clouds in",
    accent: "Bandarban",
    text: "Trek to Keokradong with indigenous guides and wake up inside a sea of clouds.",
  },
];

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback(
    (dir) => setIndex((i) => (i + dir + slides.length) % slides.length),
    []
  );

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => go(1), 6000);
    return () => clearInterval(t);
  }, [paused, go]);

  const slide = slides[index];
  const [typed] = useTypewriter({
    words: [slide.accent],
    loop: false,
    typeSpeed: 60,
    deleteSpeed: 0,
  });

  return (
    <section
      className="relative isolate min-h-[560px] overflow-hidden text-white"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="Featured destinations"
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={s.title}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <img src={s.image} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-950/50 to-stone-950/20" />
        </div>
      ))}

      <div className="relative mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-4 py-24 sm:px-6 lg:px-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-400">
          {slide.kicker}
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {slide.title}{" "}
          <span className="text-teal-400">
            {typed}
            <span className="animate-pulse text-amber-400">|</span>
          </span>
        </h1>
        <p className="mt-5 max-w-xl text-lg text-stone-200">{slide.text}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/tours" className="btn-primary !px-7 !py-3 !text-base">
            Explore Tours
          </Link>
          <Link to="/become-a-guide" className="btn-amber !px-7 !py-3 !text-base">
            Become a Guide
          </Link>
        </div>

        {/* Slide indicators */}
        <div className="mt-12 flex items-center gap-3">
          <button
            onClick={() => go(-1)}
            className="rounded-full border border-white/30 p-2 transition hover:bg-white/10"
            aria-label="Previous slide"
          >
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 rounded-full transition-all ${
                i === index ? "w-8 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
          <button
            onClick={() => go(1)}
            className="rounded-full border border-white/30 p-2 transition hover:bg-white/10"
            aria-label="Next slide"
          >
            <ChevronRightIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
