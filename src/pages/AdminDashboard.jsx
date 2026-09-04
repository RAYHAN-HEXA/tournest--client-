import { useEffect, useState, useCallback } from "react";
import { api } from "../api/axios";
import useTitle from "../hooks/useTitle";
import Spinner from "../components/Spinner";
import toast from "react-hot-toast";
import {
  UsersIcon,
  UserGroupIcon,
  MapIcon,
  TicketIcon,
  BanknotesIcon,
  InboxIcon,
  TrashIcon,
  NoSymbolIcon,
  ShieldCheckIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "applications", label: "Guide Applications" },
  { key: "users", label: "Users" },
  { key: "tours", label: "Tours" },
  { key: "bookings", label: "Bookings" },
];

const STATUS_CLASS = {
  pending: "status-pending",
  confirmed: "status-confirmed",
  completed: "status-completed",
  cancelled: "status-cancelled",
};

export default function AdminDashboard() {
  useTitle("Admin Panel");
  const [tab, setTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [users, setUsers] = useState([]);
  const [tours, setTours] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(
    () => api.get("/api/admin/stats").then((r) => setStats(r.data.stats)).catch(() => {}),
    []
  );

  const loadUsers = useCallback(async () => {
    const res = await api.get("/api/admin/users", { params: { limit: 100 } });
    setUsers(res.data.users || []);
  }, []);
  const loadTours = useCallback(async () => {
    const res = await api.get("/api/admin/tours", { params: { limit: 100 } });
    setTours(res.data.tours || []);
  }, []);
  const loadBookings = useCallback(async () => {
    const res = await api.get("/api/admin/bookings", { params: { limit: 100 } });
    setBookings(res.data.bookings || []);
  }, []);

  // Initial load: stats + pending applications (for the tab badge).
  useEffect(() => {
    setLoading(true);
    Promise.all([loadStats(), api.get("/api/admin/guide-applications", { params: { status: "pending" } }).then((r) => setApplications(r.data.applications || []))])
      .catch(() => toast.error("Could not load admin data"))
      .finally(() => setLoading(false));
  }, [loadStats]);

  // Per-tab data loads.
  useEffect(() => {
    if (tab === "users") loadUsers().catch(() => toast.error("Failed to load users"));
    if (tab === "tours") loadTours().catch(() => toast.error("Failed to load tours"));
    if (tab === "bookings") loadBookings().catch(() => toast.error("Failed to load bookings"));
    if (tab === "applications") {
      api
        .get("/api/admin/guide-applications", { params: { status: "pending" } })
        .then((r) => setApplications(r.data.applications || []))
        .catch(() => toast.error("Failed to load applications"));
    }
  }, [tab, loadUsers, loadTours, loadBookings]);

  const decideApplication = async (app, decision) => {
    try {
      await api.patch(`/api/admin/guide-applications/${app._id}`, { decision });
      toast.success(
        decision === "approved"
          ? `${app.name} approved as guide`
          : `${app.name}'s application rejected`
      );
      setApplications((list) => list.filter((a) => a._id !== app._id));
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const setRole = async (u, role) => {
    try {
      await api.patch(`/api/admin/users/${u._id}/role`, { role });
      toast.success(`${u.name} is now a ${role}`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Role change failed");
    }
  };

  const toggleBlock = async (u) => {
    try {
      await api.patch(`/api/admin/users/${u._id}/block`, { isBlocked: !u.isBlocked });
      toast.success(u.isBlocked ? `${u.name} unblocked` : `${u.name} blocked`);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Delete ${u.name} and all their data? This cannot be undone.`)) return;
    try {
      await api.delete(`/api/admin/users/${u._id}`);
      toast.success(`${u.name} removed from platform`);
      loadUsers();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const removeTour = async (t) => {
    if (!window.confirm(`Remove “${t.title}” from the platform? It will no longer be bookable.`)) return;
    try {
      await api.delete(`/api/admin/tours/${t._id}`);
      toast.success(`“${t.title}” removed from platform`);
      loadTours();
      loadStats();
    } catch (err) {
      toast.error(err.response?.data?.message || "Remove failed");
    }
  };

  if (loading && !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const statCards = [
    { label: "Total users", value: stats?.users ?? 0, Icon: UsersIcon, tone: "text-sky-500" },
    { label: "Active guides", value: stats?.guides ?? 0, Icon: UserGroupIcon, tone: "text-teal-600" },
    { label: "Live tours", value: stats?.tours ?? 0, Icon: MapIcon, tone: "text-emerald-500" },
    { label: "Total bookings", value: stats?.bookings ?? 0, Icon: TicketIcon, tone: "text-amber-500" },
    { label: "Revenue (৳)", value: (stats?.revenue ?? 0).toLocaleString(), Icon: BanknotesIcon, tone: "text-rose-500" },
    { label: "Pending applications", value: stats?.pendingGuideApplications ?? 0, Icon: InboxIcon, tone: "text-indigo-500" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <ShieldCheckIcon className="h-9 w-9 text-teal-600 dark:text-teal-400" />
        <div>
          <h1 className="section-title">Admin Panel</h1>
          <p className="text-sm text-stone-500 dark:text-stone-400">Platform-wide management</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 flex flex-wrap gap-2 border-b border-stone-200 pb-px dark:border-stone-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-t-xl px-4 py-2.5 text-sm font-medium transition ${
              tab === t.key
                ? "border-b-2 border-teal-600 bg-teal-50 text-teal-800 dark:bg-teal-900/20 dark:text-teal-300"
                : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
            }`}
          >
            {t.label}
            {t.key === "applications" && applications.length > 0 && (
              <span className="ml-2 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {applications.length}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "overview" && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {statCards.map(({ label, value, Icon, tone }) => (
              <div key={label} className="card p-6">
                <Icon className={`h-8 w-8 ${tone}`} />
                <p className="mt-3 text-3xl font-bold text-stone-900 dark:text-white">{value}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400">{label}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "applications" && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="card p-12 text-center text-stone-500 dark:text-stone-400">
                No pending guide applications. You're all caught up! 🎉
              </div>
            ) : (
              applications.map((app) => (
                <div key={app._id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                  <img
                    src={app.profile?.photoURL || app.photoURL}
                    alt=""
                    className="h-14 w-14 rounded-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-stone-900 dark:text-white">{app.name}</p>
                    <p className="text-sm text-stone-500 dark:text-stone-400">{app.email}</p>
                    <p className="mt-1.5 text-sm text-stone-600 dark:text-stone-300">
                      {app.profile?.bio || <em className="text-stone-400">No bio provided</em>}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {app.profile?.location} · {app.profile?.experience} yrs experience ·{" "}
                      {(app.profile?.languages || []).join(", ") || "no languages listed"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => decideApplication(app, "approved")} className="btn-primary !px-4 !py-2 !text-xs">
                      <CheckIcon className="h-4 w-4" /> Approve
                    </button>
                    <button
                      onClick={() => decideApplication(app, "rejected")}
                      className="btn-secondary !px-4 !py-2 !text-xs !text-rose-600"
                    >
                      <XMarkIcon className="h-4 w-4" /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {tab === "users" && (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Role</th>
                  <th className="hidden px-5 py-4 sm:table-cell">Joined</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900 dark:text-white">{u.name}</p>
                      <p className="text-xs text-stone-500">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={u.role}
                        onChange={(e) => setRole(u, e.target.value)}
                        className="rounded-lg border border-stone-300 bg-transparent px-2 py-1 text-xs dark:border-stone-700"
                        aria-label={`Change role of ${u.name}`}
                      >
                        <option value="traveler">traveler</option>
                        <option value="guide">guide</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="hidden px-5 py-4 text-stone-500 sm:table-cell">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4">
                      <span className={u.isBlocked ? "status-cancelled" : "status-confirmed"}>
                        {u.isBlocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => toggleBlock(u)}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20"
                          title={u.isBlocked ? "Unblock user" : "Block user"}
                        >
                          <NoSymbolIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => removeUser(u)}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                          title="Delete user"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "tours" && (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <th className="px-5 py-4">Tour</th>
                  <th className="hidden px-5 py-4 sm:table-cell">Guide</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="hidden px-5 py-4 md:table-cell">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {tours.map((t) => (
                  <tr key={t._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={t.image} alt="" className="hidden h-10 w-14 rounded-lg object-cover sm:block" loading="lazy" />
                        <div>
                          <p className="font-medium text-stone-900 dark:text-white">{t.title}</p>
                          <p className="text-xs text-stone-500">{t.destination} · {t.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-5 py-4 text-stone-600 dark:text-stone-300 sm:table-cell">{t.guideName}</td>
                    <td className="px-5 py-4 font-semibold text-stone-900 dark:text-white">৳{t.price.toLocaleString()}</td>
                    <td className="hidden px-5 py-4 md:table-cell">
                      <span className={t.status === "active" ? "status-confirmed" : "status-cancelled"}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {t.status === "active" && (
                        <button
                          onClick={() => removeTour(t)}
                          className="rounded-lg p-1.5 text-stone-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20"
                          title="Remove tour"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === "bookings" && (
          <div className="overflow-x-auto rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
            <table className="min-w-full divide-y divide-stone-200 text-sm dark:divide-stone-800">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  <th className="px-5 py-4">Traveler</th>
                  <th className="hidden px-5 py-4 sm:table-cell">Tour</th>
                  <th className="hidden px-5 py-4 md:table-cell">Guide</th>
                  <th className="px-5 py-4">Total</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Set status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-stone-900 dark:text-white">{b.travelerName}</p>
                      <p className="text-xs text-stone-500">{b.travelerEmail}</p>
                    </td>
                    <td className="hidden px-5 py-4 text-stone-600 dark:text-stone-300 sm:table-cell">{b.tourTitle}</td>
                    <td className="hidden px-5 py-4 text-stone-600 dark:text-stone-300 md:table-cell">{b.guideName}</td>
                    <td className="px-5 py-4 font-semibold text-stone-900 dark:text-white">৳{b.totalAmount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      <span className={STATUS_CLASS[b.status]}>{b.status}</span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <select
                        value={b.status}
                        onChange={async (e) => {
                          try {
                            await api.patch(`/api/admin/bookings/${b._id}/status`, { status: e.target.value });
                            toast.success("Booking status updated");
                            loadBookings();
                          } catch (err) {
                            toast.error(err.response?.data?.message || "Update failed");
                          }
                        }}
                        className="rounded-lg border border-stone-300 bg-transparent px-2 py-1 text-xs dark:border-stone-700"
                        aria-label={`Set status of booking by ${b.travelerName}`}
                      >
                        {["pending", "confirmed", "completed", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
