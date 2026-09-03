import { Link } from "react-router-dom";
import Logo from "./Logo";
import { MapPinIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

const usefulLinks = [
  { to: "/", label: "Home" },
  { to: "/tours", label: "Explore Tours" },
  { to: "/become-a-guide", label: "Become a Guide" },
  { to: "/my-bookings", label: "My Bookings" },
];

const categories = [
  "Nature & Adventure",
  "Cultural & Heritage",
  "Food & Local Life",
  "City & Sightseeing",
];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-stone-200 bg-stone-900 text-stone-300 dark:border-stone-800 dark:bg-stone-950">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div>
          <div className="[&_span]:!text-white">
            <Logo />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-6 text-stone-400">
            TourNest connects curious travelers with trusted local guides across
            Bangladesh — from mangrove creeks to hill-top villages, every journey
            is led by someone who calls it home.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Useful Links</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {usefulLinks.map((l) => (
              <li key={l.to + l.label}>
                <Link to={l.to} className="transition hover:text-teal-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Travel Categories</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c}>
                <Link
                  to={`/tours?category=${encodeURIComponent(c)}`}
                  className="transition hover:text-teal-400"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Contact & Support</h3>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex items-start gap-2.5">
              <MapPinIcon className="mt-0.5 h-4.5 w-4.5 shrink-0 text-teal-400" />
              <span>House 12, Road 5, Dhanmondi, Dhaka 1205, Bangladesh</span>
            </li>
            <li className="flex items-center gap-2.5">
              <EnvelopeIcon className="h-4.5 w-4.5 shrink-0 text-teal-400" />
              <a href="mailto:support@tournest.dev" className="hover:text-teal-400">
                support@tournest.dev
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <PhoneIcon className="h-4.5 w-4.5 shrink-0 text-teal-400" />
              <a href="tel:+8809612345678" className="hover:text-teal-400">
                +880 9612 345 678
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-800 py-5">
        <p className="text-center text-xs text-stone-500">
          © {new Date().getFullYear()} TourNest — Local Travel Guide Booking Platform. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
