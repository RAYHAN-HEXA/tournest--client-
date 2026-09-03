import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/axios";
import useTitle from "../hooks/useTitle";
import Spinner from "../components/Spinner";
import TourCard from "../components/TourCard";
import {
  MapPinIcon,
  StarIcon,
  ChatBubbleLeftRightIcon,
  LanguageIcon,
  BriefcaseIcon,
  SparklesIcon,
} from "@heroicons/react/24/solid";

export default function GuideProfile() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useTitle(data?.guide?.name ? `${data.guide.name} — Guide Profile` : "Guide Profile");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .get(`/api/guides/${id}`)
      .then((res) => alive && setData(res.data))
      .catch((err) => alive && setError(err.response?.data?.message || "Guide not found"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !data?.guide) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="section-title">Guide not found</h1>
        <p className="mt-4 text-stone-600 dark:text-stone-400">{error}</p>
        <Link to="/" className="btn-primary mt-8">Back to Home</Link>
      </div>
    );
  }

  const { guide, tours } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Hero card */}
      <div className="card overflow-hidden">
        <div className="h-36 bg-gradient-to-r from-teal-700 to-teal-500" aria-hidden="true" />
        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col items-start gap-5 sm:flex-row sm:items-end">
            <img
              src={guide.photoURL}
              alt={guide.name}
              referrerPolicy="no-referrer"
              className="h-28 w-28 rounded-2xl border-4 border-white object-cover shadow-lg dark:border-stone-900"
              onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=600&q=80")}
            />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-stone-900 sm:text-3xl dark:text-white">{guide.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-stone-500 dark:text-stone-400">
                <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" /> {guide.location}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {tours.length > 0 && (
                <Link to={`/tours/${tours[0]._id}`} className="btn-primary">
                  Book with {guide.name.split(" ")[0]}
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
              <StarIcon className="h-5 w-5 text-amber-500" />
              <p className="mt-1.5 text-2xl font-bold text-stone-900 dark:text-white">
                {guide.rating ? guide.rating.toFixed(1) : "New"}
              </p>
              <p className="flex items-center gap-1 text-xs text-stone-500 dark:text-stone-400">
                <ChatBubbleLeftRightIcon className="h-3.5 w-3.5" /> {guide.reviewCount} reviews
              </p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
              <BriefcaseIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <p className="mt-1.5 text-2xl font-bold text-stone-900 dark:text-white">{guide.experience} yrs</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">of guiding experience</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
              <SparklesIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <p className="mt-1.5 text-2xl font-bold text-stone-900 dark:text-white">{guide.tourCount}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">tours published</p>
            </div>
            <div className="rounded-xl bg-stone-50 p-4 dark:bg-stone-800">
              <LanguageIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {guide.languages?.length ? (
                  guide.languages.map((l) => (
                    <span key={l} className="badge bg-stone-200 text-stone-700 dark:bg-stone-700 dark:text-stone-200">{l}</span>
                  ))
                ) : (
                  <span className="text-xs text-stone-500">Not specified</span>
                )}
              </div>
            </div>
          </div>

          <section className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">About</h2>
            <p className="mt-2 leading-7 text-stone-600 dark:text-stone-300">{guide.bio}</p>
          </section>

          {guide.expertise && (
            <section className="mt-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Expertise</h2>
              <p className="mt-2 text-stone-600 dark:text-stone-300">{guide.expertise}</p>
            </section>
          )}
        </div>
      </div>

      {/* Published tours */}
      <section className="mt-12">
        <h2 className="section-title">Tours by {guide.name.split(" ")[0]}</h2>
        <p className="section-subtitle">
          {tours.length} experience{tours.length === 1 ? "" : "s"} currently open for booking
        </p>
        {tours.length === 0 ? (
          <div className="py-16 text-center text-stone-500 dark:text-stone-400">
            This guide hasn't published any tours yet — check back soon.
          </div>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((t) => (
              <TourCard key={t._id} tour={t} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
