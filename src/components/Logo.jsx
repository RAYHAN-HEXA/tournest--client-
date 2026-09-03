import { Link } from "react-router-dom";

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="TourNest home">
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
        <circle cx="32" cy="32" r="30" fill="#0d9488" />
        <path d="M32 12 L44 40 H36 L32 30 L28 40 H20 Z" fill="#fff" />
        <circle cx="32" cy="49" r="3.5" fill="#f59e0b" />
      </svg>
      {!compact && (
        <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-white">
          Tour<span className="text-teal-600 dark:text-teal-400">Nest</span>
        </span>
      )}
    </Link>
  );
}
