import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import useTitle from "../hooks/useTitle";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import {
  TicketIcon,
  BanknotesIcon,
  UserGroupIcon,
  MapIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckIcon,
  CheckBadgeIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

const STATUS_CLASS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export default function GuideDashboard() {
  useTitle("Guide Dashboard");
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([api.get("/api/tours/my"), api.get("/api/bookings/guide")])
      .then(([t, b]) => {
        setTours(t.data.tours || []);
        setBookings(b.data.bookings || []);
        const byStatus = Object.fromEntries((b.data.stats || []).map((s) => [s._id, s]));
        setStats({
          pending: byStatus.pending?.count || 0,
          confirmed: byStatus.confirmed?.count || 0,
          completed: byStatus.completed?.count || 0,
          revenue:
            (byStatus.confirmed?.revenue || 0) + (byStatus.completed?.revenue || 0),
          travelers:
            (byStatus.confirmed?.travelers || 0) + (byStatus.completed?.travelers || 0),
        });
      })
      .catch(() => toast.error("Could not load dashboard"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(load, [load]);

  const updateStatus = async (booking, status) => {
    try {
      await api.patch(`/api/bookings/${booking._id}/status`, { status });
      toast.success(`Booking marked ${status}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`/api/tours/${target._id}`);
      toast.success(`“${target.title}” deleted`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: "Pending requests", value: stats?.pending ?? 0, Icon: TicketIcon, tone: "text-amber-500" },
    { label: "Confirmed trips", value: stats?.confirmed ?? 0, Icon: CheckBadgeIcon, tone: "text-emerald-500" },
    { label: "Travelers hosted", value: stats?.travelers ?? 0, Icon: UserGroupIcon, tone: "text-sky-500" },
    { label: "Earnings (৳)", value: (stats?.revenue ?? 0).toLocaleString(), Icon: BanknotesIcon, tone: "text-teal-600" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Guide Dashboard</h1>
          <p className="section-subtitle">Manage your tours and incoming booking requests</p>
        </div>
        <Link to="/dashboard/add-tour" className="btn-primary">
          <PlusIcon className="h-4 w-4" /> Add New Tour
        </Link>
      </div>

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, Icon, tone }) => (
          <div key={label} className="card p-5">
            <Icon className={`h-7 w-7 ${tone}`} />
            <p className="mt-2 text-3xl font-bold text-stone-900 dark:text-white">{value}</p>
            <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
          </div>
        ))}
      </div>

      {/* Booking requests */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">Booking requests</h2>
        {bookings.length === 0 ? (
          <div className="card mt-4 p-10 text-center text-stone-500 dark:text-stone-400">
            No booking requests yet. Share your tours to get your first travelers!
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <th className="px-5 py-4">Traveler</th>
                  <th className="px-5 py-4">Tour</th>
                  <th className="hidden px-5 py-4 sm:table-cell">Date</th>
                  <th className="hidden px-5 py-4 sm:table-cell">People</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {bookings.slice(0, 8).map((b) => (
                  <tr key={b._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900 dark:text-white">{b.travelerName}</p>
                      <p className="text-xs text-stone-500">{b.travelerEmail}</p>
                    </td>
                    <td className="px-5 py-4 text-stone-600 dark:text-stone-300">{b.tourTitle}</td>
                    <td className="hidden px-5 py-4 sm:table-cell text-stone-600 dark:text-stone-300">
                      {new Date(b.bookingDate).toLocaleDateString()}
                    </td>
                    <td className="hidden px-5 py-4 sm:table-cell text-stone-600 dark:text-stone-300">{b.travelers}</td>
                    <td className="px-5 py-4 font-semibold text-stone-900 dark:text-white">৳{b.totalAmount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={STATUS_CLASS[b.status]}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1.5">
                        {b.status === "pending" && (
                          <button
                            onClick={() => updateStatus(b, "confirmed")}
                            className="btn-primary !px-3 !py-1.5 !text-xs"
                            title="Confirm booking"
                          >
                            <CheckIcon className="h-3.5 w-3.5" /> Confirm
                          </button>
                        )}
                        {b.status === "confirmed" && (
                          <button
                            onClick={() => updateStatus(b, "completed")}
                            className="btn-primary !bg-sky-600 hover:!bg-sky-700 !px-3 !py-1.5 !text-xs"
                            title="Mark completed"
                          >
                            <CheckBadgeIcon className="h-3.5 w-3.5" /> Complete
                          </button>
                        )}
                        {["pending", "confirmed"].includes(b.status) && (
                          <button
                            onClick={() => updateStatus(b, "cancelled")}
                            className="btn-secondary !px-3 !py-1.5 !text-xs !text-rose-600"
                            title="Reject booking"
                          >
                            <XCircleIcon className="h-3.5 w-3.5" /> Reject
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
      </section>

      {/* My tours */}
      <section className="mt-12">
        <h2 className="text-xl font-bold text-stone-900 dark:text-white">My tours ({tours.length})</h2>
        {tours.length === 0 ? (
          <div className="card mt-4 p-10 text-center">
            <MapIcon className="mx-auto h-12 w-12 text-stone-300 dark:text-stone-700" />
            <p className="mt-3 text-stone-500 dark:text-stone-400">You haven't created any tours yet.</p>
            <Link to="/dashboard/add-tour" className="btn-primary mt-5">Create your first tour</Link>
          </div>
        ) : (
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((t) => (
              <article key={t._id} className="card flex flex-col">
                <img src={t.image} alt={t.title} className="h-40 w-full object-cover" loading="lazy" />
                <div className="flex flex-1 flex-col p-5">
                  <span className="badge w-fit bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300">{t.category}</span>
                  <h3 className="mt-2 line-clamp-1 font-bold text-stone-900 dark:text-white">{t.title}</h3>
                  <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
                    ৳{t.price.toLocaleString()} · {t.duration} · max {t.maxTravelers}
                  </p>
                  <p className="mt-1 text-xs text-stone-400">
                    {new Date(t.availableDate).toLocaleDateString()} · {t.bookedCount} booked
                  </p>
                  <div className="mt-auto flex gap-2 pt-4">
                    <Link to={`/dashboard/update-tour/${t._id}`} className="btn-secondary flex-1 !px-3 !py-2 !text-xs">
                      <PencilSquareIcon className="h-4 w-4" /> Update
                    </Link>
                    <button
                      onClick={() => setDeleteTarget(t)}
                      className="btn-secondary !px-3 !py-2 !text-xs !text-rose-600 hover:!border-rose-400"
                    >
                      <TrashIcon className="h-4 w-4" /> Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-stone-900">
            <TrashIcon className="mx-auto h-12 w-12 text-rose-500" />
            <h2 className="mt-3 text-lg font-bold text-stone-900 dark:text-white">Delete this tour?</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              “{deleteTarget.title}” will be permanently removed. Active bookings on it
              will no longer be bookable.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteTarget(null)} className="btn-secondary">Keep tour</button>
              <button onClick={confirmDelete} className="btn-primary !bg-rose-600 hover:!bg-rose-700">
                Yes, delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
