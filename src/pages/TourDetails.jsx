import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { api } from "../api/axios";
import useTitle from "../hooks/useTitle";
import Spinner from "../components/Spinner";
import BookingModal from "../components/BookingModal";
import { useAuth } from "../context/AuthProvider";
import {
  MapPinIcon,
  ClockIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  StarIcon,
  FlagIcon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function TourDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useTitle(data?.tour?.title || "Tour Details");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    api
      .get(`/api/tours/${id}`)
      .then((res) => alive && setData(res.data))
      .catch((err) => alive && setError(err.response?.data?.message || "Failed to load tour"))
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

  if (error || !data?.tour) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="section-title">Tour unavailable</h1>
        <p className="mt-4 text-stone-600 dark:text-stone-400">{error}</p>
        <Link to="/tours" className="btn-primary mt-8">Back to Explore Tours</Link>
      </div>
    );
  }

  const { tour, guide, bookedSeats } = data;
  const seatsLeft = tour.maxTravelers - (bookedSeats || 0);
  const gallery = tour.gallery?.length ? tour.gallery : [tour.image];
  const dateStr = new Date(tour.availableDate).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-teal-700 dark:text-stone-400 dark:hover:text-teal-400"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        {/* Main column */}
        <div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src={gallery[activeImage]}
              alt={tour.title}
              className="h-72 w-full object-cover sm:h-96"
              onError={(e) => (e.currentTarget.src = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80")}
            />
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 flex gap-3">
              {gallery.map((img, i) => (
                <button
                  key={img + i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 overflow-hidden rounded-lg border-2 transition ${
                    i === activeImage ? "border-teal-600" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View image ${i + 1}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="badge bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">{tour.category}</span>
            <span className={`badge ${seatsLeft > 0 ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300"}`}>
              {seatsLeft > 0 ? `${seatsLeft} of ${tour.maxTravelers} seats left` : "Fully booked"}
            </span>
            {tour.rating > 0 && (
              <span className="badge bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                ★ {tour.rating.toFixed(1)} ({tour.reviewCount} reviews)
              </span>
            )}
          </div>

          <h1 className="mt-4 text-3xl font-bold text-stone-900 sm:text-4xl dark:text-white">{tour.title}</h1>

          <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { Icon: MapPinIcon, label: "Destination", value: tour.destination },
              { Icon: ClockIcon, label: "Duration", value: tour.duration },
              { Icon: CalendarDaysIcon, label: "Available from", value: dateStr },
              { Icon: UserGroupIcon, label: "Group size", value: `Up to ${tour.maxTravelers}` },
            ].map(({ Icon, label, value }) => (
              <div key={label} className="card p-4">
                <Icon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                <dt className="mt-2 text-xs uppercase tracking-wide text-stone-400">{label}</dt>
                <dd className="mt-1 text-sm font-semibold text-stone-800 dark:text-stone-200">{value}</dd>
              </div>
            ))}
          </dl>

          <section className="mt-8">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">About this tour</h2>
            <p className="mt-3 whitespace-pre-line leading-7 text-stone-600 dark:text-stone-300">
              {tour.description}
            </p>
          </section>

          <section className="mt-8 card p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-stone-900 dark:text-white">
              <FlagIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Meeting point
            </h2>
            <p className="mt-2 text-stone-600 dark:text-stone-300">{tour.meetingPoint}</p>
            <p className="mt-1.5 text-sm text-stone-500 dark:text-stone-400">
              Your guide will be waiting with a TourNest sign. Please arrive 10 minutes early.
            </p>
          </section>

          <ReviewsSection tourId={tour._id} />
        </div>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="card p-6">
            <p className="flex items-baseline gap-1.5">
              <CurrencyDollarIcon className="h-6 w-6 text-teal-600 dark:text-teal-400" />
              <span className="text-3xl font-bold text-teal-700 dark:text-teal-400">৳{tour.price.toLocaleString()}</span>
              <span className="text-sm text-stone-500">/ person</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-stone-600 dark:text-stone-300">
              <li className="flex items-center gap-2"><CalendarDaysIcon className="h-4 w-4 text-teal-500" /> {dateStr}</li>
              <li className="flex items-center gap-2"><ClockIcon className="h-4 w-4 text-teal-500" /> {tour.duration}</li>
              <li className="flex items-center gap-2"><UserGroupIcon className="h-4 w-4 text-teal-500" /> {seatsLeft} seats remaining</li>
            </ul>
            {user ? (
              <button
                onClick={() => setBookingOpen(true)}
                disabled={seatsLeft <= 0}
                className="btn-primary mt-6 w-full !py-3"
              >
                {seatsLeft > 0 ? "Book Now" : "Fully Booked"}
              </button>
            ) : (
              <Link to="/login" state={{ from: `/tours/${tour._id}` }} className="btn-primary mt-6 w-full !py-3">
                Login to Book
              </Link>
            )}
            <p className="mt-3 text-center text-xs text-stone-400">
              Free cancellation until 48h before the tour
            </p>
          </div>

          {/* Guide card */}
          {guide && (
            <div className="card p-6">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-stone-400">Your guide</h2>
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={guide.photoURL}
                  alt={guide.name}
                  className="h-16 w-16 rounded-full border-2 border-teal-100 object-cover dark:border-teal-900"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-bold text-stone-900 dark:text-white">{guide.name}</p>
                  <p className="flex items-center gap-1 text-sm text-stone-500 dark:text-stone-400">
                    <MapPinIcon className="h-3.5 w-3.5" /> {guide.location}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1 text-sm">
                    <StarIcon className="h-4 w-4 text-amber-500" />
                    <span className="font-medium">{guide.rating ? guide.rating.toFixed(1) : "New"}</span>
                    {guide.reviewCount > 0 && <span className="text-stone-400">({guide.reviewCount})</span>}
                  </p>
                </div>
              </div>
              <p className="mt-4 line-clamp-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{guide.bio}</p>
              <Link to={`/guides/${guide._id}`} className="btn-secondary mt-4 w-full">
                View Full Profile
              </Link>
            </div>
          )}
        </aside>
      </div>

      {bookingOpen && (
        <BookingModal
          tour={tour}
          seatsLeft={seatsLeft}
          onClose={(booked) => {
            setBookingOpen(false);
            if (booked) {
              // Refresh seat count after a successful booking.
              api.get(`/api/tours/${id}`).then((res) => setData(res.data)).catch(() => {});
            }
          }}
        />
      )}
    </div>
  );
}

function ReviewsSection({ tourId }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    let alive = true;
    api.get(`/api/reviews/tour/${tourId}`).then((res) => alive && setReviews(res.data.reviews || [])).catch(() => {});
    return () => {
      alive = false;
    };
  }, [tourId]);

  if (!reviews.length) return null;

  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 text-xl font-bold text-stone-900 dark:text-white">
        <ChatBubbleLeftRightIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" /> Traveler reviews
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {reviews.slice(0, 4).map((r) => (
          <figure key={r._id} className="card p-5">
            <div className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <StarIcon key={i} className={`h-4 w-4 ${i < r.rating ? "text-amber-500" : "text-stone-300 dark:text-stone-700"}`} />
              ))}
            </div>
            <blockquote className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
              “{r.comment}”
            </blockquote>
            <figcaption className="mt-3 text-xs font-medium text-stone-500 dark:text-stone-400">
              — {r.travelerName || "Traveler"} · {new Date(r.createdAt).toLocaleDateString()}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
