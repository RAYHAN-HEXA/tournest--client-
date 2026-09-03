import { Link } from "react-router-dom";
import { Reveal } from "react-awesome-reveal";
import { TreeIcon, LandmarkIcon, FireIcon, BuildingIcon } from "./icons";

const categories = [
  {
    name: "Nature & Adventure",
    text: "Trek hill tracts, paddle swamp forests and cruise mangrove waterways.",
    Icon: TreeIcon,
    classes: "from-emerald-500/90 to-teal-700/90",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Cultural & Heritage",
    text: "UNESCO mosques, Buddhist viharas and 400-year-old city lanes.",
    Icon: LandmarkIcon,
    classes: "from-amber-500/90 to-orange-700/90",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "Food & Local Life",
    text: "Street-food crawls, tea garden lunches and seafood on the beach.",
    Icon: FireIcon,
    classes: "from-rose-500/90 to-red-700/90",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  },
  {
    name: "City & Sightseeing",
    text: "Markets, riverfronts and the everyday rhythm of Bengali cities.",
    Icon: BuildingIcon,
    classes: "from-sky-500/90 to-blue-700/90",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?auto=format&fit=crop&w=800&q=80",
  },
];

export default function CategorySection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="section-title">Explore by Category</h2>
        <p className="section-subtitle mx-auto">
          Every traveler is different — pick the kind of day that fits yours, and
          a local guide will take it from there.
        </p>
      </div>
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((c, i) => (
          <Reveal key={c.name} delay={i * 100} triggerOnce>
            <Link
              to={`/tours?category=${encodeURIComponent(c.name)}`}
              className="group relative block h-60 overflow-hidden rounded-2xl shadow-sm"
            >
              <img
                src={c.image}
                alt={c.name}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${c.classes} mix-blend-multiply`} />
              <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
                <c.Icon className="h-8 w-8" />
                <h3 className="mt-2 text-lg font-bold">{c.name}</h3>
                <p className="mt-1 text-sm text-white/85">{c.text}</p>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
