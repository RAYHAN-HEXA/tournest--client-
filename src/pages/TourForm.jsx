import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import useTitle from "../hooks/useTitle";
import { useAuth } from "../context/AuthProvider";
import Spinner from "../components/Spinner";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const CATEGORIES = [
  "Nature & Adventure",
  "Cultural & Heritage",
  "Food & Local Life",
  "City & Sightseeing",
];

/**
 * Shared form for creating and updating tours.
 * In edit mode, loads the tour and verifies the signed-in guide owns it.
 */
export default function TourForm({ mode }) {
  const isEdit = mode === "edit";
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [denied, setDenied] = useState(null);

  useTitle(isEdit ? "Update Tour" : "Add New Tour");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      category: CATEGORIES[0],
      availableDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    api
      .get(`/api/tours/${id}`)
      .then((res) => {
        if (!alive) return;
        const t = res.data.tour;
        if (t.guideEmail?.toLowerCase() !== user?.email?.toLowerCase() && role !== "admin") {
          setDenied("You can only edit your own tours.");
          return;
        }
        reset({
          title: t.title,
          category: t.category,
          destination: t.destination,
          description: t.description,
          image: t.image,
          price: t.price,
          duration: t.duration,
          maxTravelers: t.maxTravelers,
          meetingPoint: t.meetingPoint,
          availableDate: new Date(t.availableDate).toISOString().slice(0, 10),
        });
      })
      .catch((err) => alive && setDenied(err.response?.data?.message || "Tour not found"))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [isEdit, id, reset, user, role]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/api/tours/${id}`, data);
        toast.success("Tour updated successfully");
      } else {
        await api.post("/api/tours", data);
        toast.success("Tour published! Travelers can now book it.");
      }
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save tour");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (denied) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="section-title">Not allowed</h1>
        <p className="mt-4 text-stone-600 dark:text-stone-400">{denied}</p>
        <Link to="/dashboard" className="btn-primary mt-8">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <Link
        to="/dashboard"
        className="mb-6 flex items-center gap-1.5 text-sm font-medium text-stone-500 hover:text-teal-700 dark:text-stone-400 dark:hover:text-teal-400"
      >
        <ArrowLeftIcon className="h-4 w-4" /> Back to dashboard
      </Link>

      <header>
        <h1 className="section-title">{isEdit ? "Update Tour" : "Add New Tour"}</h1>
        <p className="section-subtitle">
          {isEdit
            ? "Adjust the details — travelers will see the changes immediately."
            : "Describe the experience only you can offer."}
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="card mt-8 space-y-5 p-6 sm:p-8" noValidate>
        <div>
          <label htmlFor="t-title" className="label">Tour title</label>
          <input
            id="t-title"
            className="input"
            placeholder="e.g. Sundarbans Local Explorer Tour"
            {...register("title", { required: "Title is required", minLength: { value: 8, message: "Make the title descriptive (8+ chars)" } })}
          />
          {errors.title && <p className="mt-1 text-xs text-rose-600">{errors.title.message}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="t-category" className="label">Category</label>
            <select id="t-category" className="input" {...register("category", { required: true })}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="t-destination" className="label">Destination</label>
            <input
              id="t-destination"
              className="input"
              placeholder="e.g. Khulna / Sundarbans"
              {...register("destination", { required: "Destination is required" })}
            />
            {errors.destination && <p className="mt-1 text-xs text-rose-600">{errors.destination.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="t-description" className="label">Description</label>
          <textarea
            id="t-description"
            rows={5}
            className="input resize-none"
            placeholder="What will travelers see, eat and experience? What's included?"
            {...register("description", {
              required: "Description is required",
              minLength: { value: 60, message: "Give travelers detail — at least 60 characters" },
            })}
          />
          {errors.description && <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>}
        </div>

        <div>
          <label htmlFor="t-image" className="label">Tour image URL</label>
          <input
            id="t-image"
            className="input"
            placeholder="https://images.unsplash.com/…"
            {...register("image", {
              required: "Image URL is required",
              pattern: { value: /^(https?:\/\/).+/, message: "Must start with http(s)://" },
            })}
          />
          {errors.image && <p className="mt-1 text-xs text-rose-600">{errors.image.message}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          <div>
            <label htmlFor="t-price" className="label">Price / person (৳)</label>
            <input
              id="t-price"
              type="number"
              min="0"
              className="input"
              placeholder="2500"
              {...register("price", {
                required: "Price is required",
                min: { value: 0, message: "Cannot be negative" },
              })}
            />
            {errors.price && <p className="mt-1 text-xs text-rose-600">{errors.price.message}</p>}
          </div>
          <div>
            <label htmlFor="t-duration" className="label">Duration</label>
            <input
              id="t-duration"
              className="input"
              placeholder="e.g. 1 Day"
              {...register("duration", { required: "Duration is required" })}
            />
            {errors.duration && <p className="mt-1 text-xs text-rose-600">{errors.duration.message}</p>}
          </div>
          <div>
            <label htmlFor="t-max" className="label">Max travelers</label>
            <input
              id="t-max"
              type="number"
              min="1"
              max="100"
              className="input"
              placeholder="8"
              {...register("maxTravelers", {
                required: "Required",
                min: { value: 1, message: "Min 1" },
                max: { value: 100, message: "Max 100" },
              })}
            />
            {errors.maxTravelers && <p className="mt-1 text-xs text-rose-600">{errors.maxTravelers.message}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="t-meeting" className="label">Meeting point</label>
            <input
              id="t-meeting"
              className="input"
              placeholder="e.g. Khulna Launch Terminal"
              {...register("meetingPoint", { required: "Meeting point is required" })}
            />
            {errors.meetingPoint && <p className="mt-1 text-xs text-rose-600">{errors.meetingPoint.message}</p>}
          </div>
          <div>
            <label htmlFor="t-date" className="label">Available date</label>
            <input
              id="t-date"
              type="date"
              className="input"
              min={new Date().toISOString().slice(0, 10)}
              {...register("availableDate", { required: "Date is required" })}
            />
            {errors.availableDate && <p className="mt-1 text-xs text-rose-600">{errors.availableDate.message}</p>}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="t-guide-email" className="label">Guide email (read-only)</label>
            <input id="t-guide-email" className="input opacity-70" value={user?.email || ""} readOnly />
          </div>
          <div>
            <label htmlFor="t-created" className="label">Created date</label>
            <input
              id="t-created"
              className="input opacity-70"
              value={isEdit ? "—" : new Date().toLocaleDateString()}
              readOnly
            />
          </div>
        </div>

        <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
          {submitting ? "Saving…" : isEdit ? "Save Changes" : "Publish Tour"}
        </button>
      </form>
    </div>
  );
}
