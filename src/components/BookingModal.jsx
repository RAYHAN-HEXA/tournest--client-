import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";
import toast from "react-hot-toast";
import { api } from "../api/axios";
import { useAuth } from "../context/AuthProvider";

/**
 * Booking form shown in a modal. Total price is calculated live from
 * price × travelers; the server re-validates everything on submit.
 */
export default function BookingModal({ tour, seatsLeft, onClose }) {
  const { user } = useAuth();
  const maxAllowed = Math.min(seatsLeft, 50);

  const [form, setForm] = useState({
    date: new Date(tour.availableDate).toISOString().slice(0, 10),
    travelers: 1,
    name: user?.displayName || "",
    phone: "",
    meetingNote: "",
    specialRequest: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const total = useMemo(() => tour.price * form.travelers, [tour.price, form.travelers]);

  useEffect(() => {
    const onEsc = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.date) errs.date = "Choose a date";
    else if (new Date(form.date) > new Date(tour.availableDate)) {
      errs.date = "Date is after tour availability";
    }
    if (!form.name.trim()) errs.name = "Your name is required";
    if (!form.phone.trim()) errs.phone = "Phone number is required";
    else if (!/^[+\d][\d\s-]{5,}$/.test(form.phone.trim())) errs.phone = "Enter a valid phone number";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await api.post("/api/bookings", {
        tourId: tour._id,
        bookingDate: form.date,
        travelers: Number(form.travelers),
        phone: form.phone.trim(),
        meetingNote: form.meetingNote.trim(),
        specialRequest: form.specialRequest.trim(),
      });
      toast.success("Booking confirmed! Check My Bookings for details.");
      onClose(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed — please try again");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open onClose={() => onClose()} className="relative z-50">
      <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end justify-center overflow-y-auto p-0 sm:items-center sm:p-4">
        <DialogPanel className="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl dark:bg-stone-900">
          <DialogTitle className="text-xl font-bold text-stone-900 dark:text-white">
            Book “{tour.title}”
          </DialogTitle>

          <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="bk-date" className="label">Tour date</label>
                <input
                  id="bk-date"
                  type="date"
                  className="input"
                  value={form.date}
                  min={new Date().toISOString().slice(0, 10)}
                  max={new Date(tour.availableDate).toISOString().slice(0, 10)}
                  onChange={set("date")}
                />
                {errors.date && <p className="mt-1 text-xs text-rose-600">{errors.date}</p>}
              </div>
              <div>
                <label htmlFor="bk-travelers" className="label">Travelers</label>
                <select id="bk-travelers" className="input" value={form.travelers} onChange={set("travelers")}>
                  {Array.from({ length: maxAllowed }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n} traveler{n > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="bk-name" className="label">Traveler name</label>
                <input id="bk-name" type="text" className="input" value={form.name} onChange={set("name")} placeholder="Your full name" />
                {errors.name && <p className="mt-1 text-xs text-rose-600">{errors.name}</p>}
              </div>
              <div>
                <label htmlFor="bk-email" className="label">Email (read-only)</label>
                <input id="bk-email" type="email" className="input opacity-70" value={user?.email || ""} readOnly />
              </div>
            </div>

            <div>
              <label htmlFor="bk-phone" className="label">Phone number</label>
              <input id="bk-phone" type="tel" className="input" value={form.phone} onChange={set("phone")} placeholder="+880 1XXX-XXXXXX" />
              {errors.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="bk-meeting" className="label">
                Meeting / pickup info <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <input
                id="bk-meeting"
                type="text"
                className="input"
                value={form.meetingNote}
                onChange={set("meetingNote")}
                placeholder={`Default: ${tour.meetingPoint}`}
              />
            </div>

            <div>
              <label htmlFor="bk-request" className="label">
                Special requests <span className="font-normal text-stone-400">(optional)</span>
              </label>
              <textarea
                id="bk-request"
                rows={2}
                className="input resize-none"
                value={form.specialRequest}
                onChange={set("specialRequest")}
                placeholder="Vegetarian lunch, wheelchair access…"
              />
            </div>

            {/* Price summary */}
            <div className="rounded-2xl bg-stone-50 p-4 dark:bg-stone-800">
              <div className="flex justify-between text-sm text-stone-600 dark:text-stone-300">
                <span>৳{tour.price.toLocaleString()} × {form.travelers} traveler{form.travelers > 1 ? "s" : ""}</span>
                <span>৳{tour.price.toLocaleString()}</span>
              </div>
              <div className="mt-2 flex justify-between border-t border-stone-200 pt-2 text-base font-bold text-stone-900 dark:border-stone-700 dark:text-white">
                <span>Total</span>
                <span className="text-teal-700 dark:text-teal-400">৳{total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => onClose()} className="btn-secondary flex-1" disabled={submitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={submitting}>
                {submitting ? "Booking…" : `Confirm · ৳${total.toLocaleString()}`}
              </button>
            </div>
          </form>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
