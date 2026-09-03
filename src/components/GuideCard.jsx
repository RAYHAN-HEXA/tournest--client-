import { Link } from "react-router-dom";
import { MapPinIcon, StarIcon, ChatBubbleLeftRightIcon } from "@heroicons/react/24/solid";

export default function GuideCard({ guide }) {
  return (
    <article className="card flex h-full flex-col items-center p-6 text-center">
      <img
        src={guide.photoURL}
        alt={guide.name}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="h-24 w-24 rounded-full border-4 border-teal-100 object-cover dark:border-teal-900"
        onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=600&q=80")}
      />
      <h3 className="mt-4 text-lg font-bold text-stone-900 dark:text-white">{guide.name}</h3>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-500 dark:text-stone-400">
        <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" />
        {guide.location}
      </p>
      <p className="mt-3 line-clamp-3 min-h-[3.75rem] text-sm leading-6 text-stone-600 dark:text-stone-300">
        {guide.bio}
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-1.5">
        {guide.languages?.slice(0, 3).map((l) => (
          <span key={l} className="badge bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300">
            {l}
          </span>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1 text-sm">
        <StarIcon className="h-4.5 w-4.5 text-amber-500" />
        <span className="font-semibold text-stone-900 dark:text-white">
          {guide.rating ? guide.rating.toFixed(1) : "New"}
        </span>
        {guide.reviewCount > 0 && (
          <span className="flex items-center gap-1 text-stone-400">
            <ChatBubbleLeftRightIcon className="h-4 w-4" /> {guide.reviewCount}
          </span>
        )}
      </div>
      <div className="mt-auto w-full pt-5">
        <Link to={`/guides/${guide._id}`} className="btn-secondary w-full">
          View Profile
        </Link>
      </div>
    </article>
  );
}
