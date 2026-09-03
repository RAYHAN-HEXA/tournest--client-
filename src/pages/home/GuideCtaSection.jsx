import { Link } from "react-router-dom";
import { Reveal } from "react-awesome-reveal";

export default function GuideCtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <Reveal triggerOnce>
        <div className="relative isolate overflow-hidden rounded-3xl bg-stone-900 px-6 py-16 text-center shadow-2xl sm:px-16">
          <img
            src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=70"
            alt=""
            className="absolute inset-0 -z-10 h-full w-full object-cover opacity-25"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-stone-950/90 to-teal-950/80" />
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Know your city inside out?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-stone-300">
            Turn your local knowledge into income. Publish tours, set your price
            and host travelers from around the world — TourNest handles the rest.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/become-a-guide" className="btn-amber !px-7 !py-3 !text-base">
              Become a Local Guide
            </Link>
            <Link to="/tours" className="btn-secondary !border-white/30 !bg-transparent !px-7 !py-3 !text-base !text-white hover:!border-white">
              Browse Tours First
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
