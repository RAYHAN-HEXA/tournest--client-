import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import useTitle from "../hooks/useTitle";
import { useAuth } from "../context/AuthProvider";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/outline";

const CATEGORIES = [
  "Nature & Adventure",
  "Cultural & Heritage",
  "Food & Local Life",
  "City & Sightseeing",
];

const LANGUAGES = ["Bengali", "English", "Hindi", "Urdu", "Chakma", "French", "Chinese", "Spanish"];

export default function BecomeGuide() {
  useTitle("Become a Guide");
  const { user, dbUser, refreshDbUser } = useAuth();
  const navigate = useNavigate();
  const [existing, setExisting] = useState(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedLangs, setSelectedLangs] = useState([]);
  const [selectedCats, setSelectedCats] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    let alive = true;
    api
      .get("/api/guides/my")
      .then((res) => alive && setExisting(res.data.guide))
      .catch(() => {})
      .finally(() => alive && setChecking(false));
    return () => {
      alive = false;
    };
  }, []);

  const toggle = (list, setList) => (value) =>
    setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const onSubmit = async (data) => {
    if (!selectedLangs.length) return toast.error("Pick at least one language you speak");
    setSubmitting(true);
    try {
      await api.post("/api/guides", {
        photoURL: data.photoURL || user?.photoURL || "",
        location: data.location,
        bio: data.bio,
        expertise: data.expertise,
        experience: Number(data.experience),
        phone: data.phone,
        languages: selectedLangs,
        preferredCategories: selectedCats,
      });
      await refreshDbUser();
      toast.success("Application submitted! An admin will review it shortly.");
      navigate("/my-bookings");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-600 border-t-transparent" />
      </div>
    );
  }

  // Already an approved guide
  if (existing && dbUser?.role === "guide") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-emerald-500" />
        <h1 className="mt-4 section-title">You're already a guide!</h1>
        <p className="mt-3 text-stone-600 dark:text-stone-400">
          Your guide profile is active. Head to your dashboard to manage tours.
        </p>
        <a href="/dashboard" className="btn-primary mt-8">Open Guide Dashboard</a>
      </div>
    );
  }

  // Application pending
  if (dbUser?.guideApplication?.status === "pending") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ClockIcon className="mx-auto h-16 w-16 text-amber-500" />
        <h1 className="mt-4 section-title">Application under review</h1>
        <p className="mt-3 text-stone-600 dark:text-stone-400">
          Thanks for applying! An admin reviews new guide applications, usually within
          a couple of days. You'll get guide access as soon as you're approved.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <header className="text-center">
        <h1 className="section-title">Become a TourNest Guide</h1>
        <p className="section-subtitle mx-auto">
          Share the place you know best. Tell us about yourself and we'll set up
          your guide profile after a quick review.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-10 space-y-5 p-6 sm:p-8" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="g-name" className="label">Full name</label>
            <input id="g-name" className="input" defaultValue={user?.displayName || dbUser?.name || ""} readOnly />
          </div>
          <div>
            <label htmlFor="g-photo" className="label">Profile photo URL</label>
            <input
              id="g-photo"
              className="input"
              placeholder="https://…"
              defaultValue={user?.photoURL || ""}
              {...register("photoURL", { pattern: { value: /^(https?:\/\/).+/, message: "Must start with http(s)://" } })}
            />
            {errors.photoURL && <p className="mt-1 text-xs text-rose-600">{errors.photoURL.message}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="g-location" className="label">Your location (city / region)</label>
            <input
              id="g-location"
              className="input"
              placeholder="e.g. Sylhet, Bangladesh"
              {...register("location", { required: "Location is required" })}
            />
            {errors.location && <p className="mt-1 text-xs text-rose-600">{errors.location.message}</p>}
          </div>
          <div>
            <label htmlFor="g-experience" className="label">Years of experience</label>
            <input
              id="g-experience"
              type="number"
              min="0"
              max="60"
              className="input"
              placeholder="e.g. 5"
              {...register("experience", {
                required: "Experience is required",
                min: { value: 0, message: "Cannot be negative" },
                max: { value: 60, message: "Max is 60 years" },
              })}
            />
            {errors.experience && <p className="mt-1 text-xs text-rose-600">{errors.experience.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="g-expertise" className="label">Travel expertise</label>
          <input
            id="g-expertise"
            className="input"
            placeholder="e.g. Street food, trekking, heritage photography"
            {...register("expertise")}
          />
        </div>

        <div>
          <label htmlFor="g-bio" className="label">Short biography</label>
          <textarea
            id="g-bio"
            rows={4}
            className="input resize-none"
            placeholder="Tell travelers who you are, where you grew up and what makes your tours special…"
            {...register("bio", {
              required: "Bio is required",
              minLength: { value: 40, message: "Tell us a bit more — at least 40 characters" },
            })}
          />
          {errors.bio && <p className="mt-1 text-xs text-rose-600">{errors.bio.message}</p>}
        </div>

        <div>
          <span className="label">Languages you speak</span>
          <div className="flex flex-wrap gap-2">
            {LANGUAGES.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => toggle(selectedLangs, setSelectedLangs)(l)}
                className={`badge px-3.5 py-2 ${
                  selectedLangs.includes(l)
                    ? "bg-teal-600 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="label">Preferred tour categories</span>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggle(selectedCats, setSelectedCats)(c)}
                className={`badge px-3.5 py-2 ${
                  selectedCats.includes(c)
                    ? "bg-amber-500 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="g-phone" className="label">Phone number</label>
            <input
              id="g-phone"
              type="tel"
              className="input"
              placeholder="+880 1XXX-XXXXXX"
              {...register("phone", {
                required: "Phone is required",
                pattern: { value: /^[+\d][\d\s-]{5,}$/, message: "Enter a valid phone number" },
              })}
            />
            {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>}
          </div>
          <div>
            <label htmlFor="g-email" className="label">Contact email (read-only)</label>
            <input id="g-email" className="input opacity-70" value={user?.email || ""} readOnly />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
          {submitting ? "Submitting…" : existing ? "Update Application" : "Submit Application"}
        </button>
      </form>
    </div>
  );
}
