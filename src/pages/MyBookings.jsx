import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import useTitle from "../hooks/useTitle";
import Spinner from "../components/Spinner";
import { useAuth } from "../context/AuthProvider";
import toast from "react-hot-toast";
import {
  TicketIcon,
  MapPinIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  XCircleIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";

const STATUS_CLASS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export default function MyBookings() {
  useTitle("My Bookings");
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);

  const load = () => {
    setLoading(true);
    api
      .get("/api/bookings/my")
      .then((res) => setBookings(res.data.bookings || []))
      .catch(() => toast.error("Could not load your bookings"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const confirmCancel = async () => {
    const target = cancelTarget;
    setCancelTarget(null);
    try {
      await api.patch(`/api/bookings/${target._id}/status`, { status: "cancelled" });
      toast.success(`Booking for “${target.tourTitle}” cancelled`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel booking");
    }
  };

  const downloadReport = () => {
    if (!bookings.length) return;
    import("jspdf").then(({ default: JsPDF }) => {
      import("jspdf-autotable").then(({ default: autoTable }) => {
        const doc = new JsPDF();
        doc.setFontSize(20);
        doc.setTextColor(13, 148, 136);
        doc.text("TourNest — My Booking Report", 14, 18);
        doc.setFontSize(10);
        doc.setTextColor(120);
        doc.text(`Traveler: ${user?.displayName || bookings[0].travelerName}  (${user?.email})`, 14, 26);
        doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 32);

        autoTable(doc, {
          startY: 40,
          head: [["#", "Tour", "Destination", "Guide", "Date", "Travelers", "Total (৳)", "Status"]],
          body: bookings.map((b, i) => [
            i + 1,
            b.tourTitle,
            b.destination,
            b.guideName,
            new Date(b.bookingDate).toLocaleDateString(),
            b.travelers,
            b.totalAmount.toLocaleString(),
            b.status.charAt(0).toUpperCase() + b.status.slice(1),
          ]),
          styles: { fontSize: 8, cellPadding: 2.5 },
          headStyles: { fillColor: [13, 148, 136] },
          alternateRowStyles: { fillColor: [240, 253, 250] },
        });

        const totalSpent = bookings
          .filter((b) => b.status !== "cancelled")
          .reduce((s, b) => s + b.totalAmount, 0);
        const finalY = doc.lastAutoTable?.finalY || 60;
        doc.setFontSize(11);
        doc.setTextColor(30);
        doc.text(`Total (excluding cancelled): ৳${totalSpent.toLocaleString()}`, 14, finalY + 10);
        doc.save("tournest-my-bookings.pdf");
        toast.success("Booking report downloaded");
      });
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">My Bookings</h1>
          <p className="section-subtitle">
            {bookings.length} booking{bookings.length === 1 ? "" : "s"} on your account
          </p>
        </div>
        {bookings.length > 0 && (
          <button onClick={downloadReport} className="btn-secondary">
            <ArrowDownTrayIcon className="h-4 w-4" /> Download Report (PDF)
          </button>
        )}
      </div>

      {bookings.length === 0 ? (
        <div className="mt-16 py-20 text-center">
          <TicketIcon className="mx-auto h-14 w-14 text-stone-300 dark:text-stone-700" />
          <h2 className="mt-4 text-xl font-bold text-stone-900 dark:text-white">No bookings yet</h2>
          <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
            Your next adventure is a couple of clicks away.
          </p>
          <Link to="/tours" className="btn-primary mt-6">Explore Tours</Link>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
          <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                <th className="px-5 py-4">Tour</th>
                <th className="px-5 py-4">Guide</th>
                <th className="hidden px-5 py-4 md:table-cell">Destination</th>
                <th className="hidden px-5 py-4 sm:table-cell">Date</th>
                <th className="hidden px-5 py-4 sm:table-cell">Travelers</th>
                <th className="px-5 py-4">Total</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
              {bookings.map((b) => (
                <tr key={b._id} className="transition hover:bg-stone-50 dark:hover:bg-stone-800/50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <img src={b.tourImage} alt="" className="hidden h-11 w-16 rounded-lg object-cover sm:block" loading="lazy" />
                      <span className="font-semibold text-stone-900 dark:text-white">{b.tourTitle}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-600 dark:text-stone-300">{b.guideName}</td>
                  <td className="hidden px-5 py-4 md:table-cell">
                    <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                      <MapPinIcon className="h-4 w-4 text-teal-600 dark:text-teal-400" /> {b.destination}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                      <CalendarDaysIcon className="h-4 w-4 text-stone-400" />
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <span className="flex items-center gap-1 text-stone-600 dark:text-stone-300">
                      <UserGroupIcon className="h-4 w-4 text-stone-400" /> {b.travelers}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-stone-900 dark:text-white">৳{b.totalAmount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={STATUS_CLASS[b.status] || "badge bg-stone-100 text-stone-700"}>
                      {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setDetails(b)}
                        className="rounded-lg p-1.5 text-stone-500 hover:bg-stone-100 hover:text-teal-700 dark:hover:bg-stone-800 dark:hover:text-teal-400"
                        title="View details"
                        aria-label={`View details of ${b.tourTitle}`}
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      {["pending", "confirmed"].includes(b.status) && (
                        <button
                          onClick={() => setCancelTarget(b)}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
                          title="Cancel booking"
                          aria-label={`Cancel ${b.tourTitle}`}
                        >
                          <XCircleIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Details drawer */}
      {details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={() => setDetails(null)} />
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-stone-900">
            <h2 className="text-lg font-bold text-stone-900 dark:text-white">Booking details</h2>
            <img src={details.tourImage} alt="" className="mt-4 h-36 w-full rounded-2xl object-cover" />
            <dl className="mt-4 space-y-2.5 text-sm">
              {[
                ["Tour", details.tourTitle],
                ["Destination", details.destination],
                ["Guide", `${details.guideName} (${details.guideEmail})`],
                ["Booking date", new Date(details.bookingDate).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })],
                ["Travelers", String(details.travelers)],
                ["Phone", details.phone],
                ["Meeting note", details.meetingNote || "—"],
                ["Special request", details.specialRequest || "—"],
                ["Booked on", new Date(details.createdAt).toLocaleString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="shrink-0 text-stone-500 dark:text-stone-400">{k}</dt>
                  <dd className="text-right font-medium text-stone-800 dark:text-stone-200">{v}</dd>
                </div>
              ))}
              <div className="flex justify-between border-t border-stone-200 pt-3 text-base dark:border-stone-700">
                <dt className="font-semibold text-stone-900 dark:text-white">Total</dt>
                <dd className="font-bold text-teal-700 dark:text-teal-400">৳{details.totalAmount.toLocaleString()}</dd>
              </div>
            </dl>
            <button onClick={() => setDetails(null)} className="btn-secondary mt-6 w-full">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={() => setCancelTarget(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-stone-900">
            <XCircleIcon className="mx-auto h-12 w-12 text-rose-500" />
            <h2 className="mt-3 text-lg font-bold text-stone-900 dark:text-white">Cancel this booking?</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              “{cancelTarget.tourTitle}” on {new Date(cancelTarget.bookingDate).toLocaleDateString()} will be
              cancelled. This can't be undone.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setCancelTarget(null)} className="btn-secondary">
                Keep booking
              </button>
              <button onClick={confirmCancel} className="btn-primary !bg-rose-600 hover:!bg-rose-700">
                Yes, cancel it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
