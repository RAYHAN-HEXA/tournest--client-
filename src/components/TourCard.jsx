import { Link } from "react-router-dom";
import { MapPinIcon, ClockIcon, StarIcon, UserIcon } from "@heroicons/react/24/solid";
import { CurrencyDollarIcon } from "@heroicons/react/24/outline";

export default function TourCard({ tour }) {
  return (
    <article className="card flex h-full flex-col">
      <div className="relative">
        <img
          src={tour.image}
          alt={tour.title}
          loading="lazy"
          className="h-48 w-full object-cover"
          onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80")}
        />
        <span className="badge absolute left-3 top-3 bg-teal-600/95 text-white">{tour.category}</span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-1 text-lg font-bold text-stone-900 dark:text-white">{tour.title}</h3>
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
          <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          {tour.destination}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-stone-600 dark:text-stone-300">
          <span className="flex items-center gap-1.5">
            <UserIcon className="h-4 w-4 text-stone-400" />
            {tour.guideName || "Local Guide"}
          </span>
          <span className="flex items-center gap-1.5">
            <ClockIcon className="h-4 w-4 text-stone-400" />
            {tour.duration}
          </span>
          <span className="flex items-center gap-1">
            <StarIcon className="h-4 w-4 text-amber-500" />
            <span className="font-medium">{tour.rating ? tour.rating.toFixed(1) : "New"}</span>
            {tour.reviewCount > 0 && <span className="text-stone-400">({tour.reviewCount})</span>}
          </span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-stone-100 pt-4 dark:border-stone-800 mt-4">
          <p className="flex items-baseline gap-1">
            <CurrencyDollarIcon className="h-4.5 w-4.5 text-teal-600 dark:text-teal-400" />
            <span className="text-xl font-bold text-teal-700 dark:text-teal-400">৳{tour.price.toLocaleString()}</span>
            <span className="text-xs text-stone-500">/person</span>
          </p>
          <Link to={`/tours/${tour._id}`} className="btn-primary !px-4 !py-2">
            See Details
          </Link>
        </div>
      </div>
    </article>
  );
}
