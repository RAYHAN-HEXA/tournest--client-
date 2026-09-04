import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import { useThemeContext } from "../context/ThemeContext";
import { toast } from "react-hot-toast";
import Logo from "./Logo";
import { Bars3Icon, XMarkIcon, SunIcon, MoonIcon, ArrowRightStartOnRectangleIcon, MapIcon, TicketIcon, UserGroupIcon, ShieldCheckIcon } from "@heroicons/react/24/outline";

const navLinkClass = ({ isActive }) =>
  `rounded-full px-3.5 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-teal-600 text-white"
      : "text-stone-700 hover:bg-teal-50 hover:text-teal-700 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-teal-300"
  }`;

function AvatarMenu() {
  const { user, dbUser, role, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    toast.success("Logged out — see you on the road!");
    navigate("/");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open profile menu"
      >
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            referrerPolicy="no-referrer"
            alt={user.displayName || "Profile"}
            className="h-9 w-9 rounded-full border-2 border-teal-600 object-cover"
          />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-teal-600 text-sm font-semibold text-white">
            {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xl dark:border-stone-700 dark:bg-stone-900"
          role="menu"
        >
          <div className="flex items-center gap-3 border-b border-stone-200 p-4 dark:border-stone-700">
            {user?.photoURL ? (
              <img src={user.photoURL} referrerPolicy="no-referrer" alt="" className="h-11 w-11 rounded-full object-cover" />
            ) : (
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-600 text-white">
                {(user?.displayName || user?.email || "U").charAt(0).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900 dark:text-white">
                {user?.displayName || dbUser?.name || ""}
              </p>
              <p className="truncate text-xs text-stone-500 dark:text-stone-400">{user?.email}</p>
              <span className="badge mt-1 bg-teal-100 text-teal-800 capitalize dark:bg-teal-900/40 dark:text-teal-300">
                {role}
              </span>
            </div>
          </div>
          <div className="p-1.5">
            <Link
              to="/my-bookings"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
            >
              <TicketIcon className="h-4.5 w-4.5" /> My Bookings
            </Link>
            {(role === "guide" || role === "admin") && (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <MapIcon className="h-4.5 w-4.5" /> Guide Dashboard
              </Link>
            )}
            {role === "admin" && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <ShieldCheckIcon className="h-4.5 w-4.5" /> Admin Panel
              </Link>
            )}
            {role === "traveler" && (
              <Link
                to="/become-a-guide"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800"
              >
                <UserGroupIcon className="h-4.5 w-4.5" /> Become a Guide
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20"
            >
              <ArrowRightStartOnRectangleIcon className="h-4.5 w-4.5" /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ThemeToggle() {
  const { dark, toggleTheme } = useThemeContext();
  return (
    <button
      onClick={toggleTheme}
      className="rounded-full p-2 text-stone-600 transition hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
    </button>
  );
}

export default function Navbar() {
  const { user, role, authReady } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/", label: "Home" },
    { to: "/tours", label: "Explore Tours" },
  ];
  if (user) {
    links.push({ to: "/my-bookings", label: "My Bookings" });
    // Role-dependent links render only once the DB profile (role) is resolved,
    // so a refresh never flashes the wrong menu items.
    if (authReady && (role === "guide" || role === "admin")) {
      links.push({ to: "/dashboard", label: "Guide Dashboard" });
    } else if (authReady && role === "traveler") {
      links.push({ to: "/become-a-guide", label: "Become a Guide" });
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-white/90 backdrop-blur dark:border-stone-800 dark:bg-stone-950/90">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Logo />

        <div className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === "/"} className={navLinkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <AvatarMenu />
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link to="/login" className="btn-secondary !px-5 !py-2">
                Login
              </Link>
              <Link to="/register" className="btn-primary !px-5 !py-2">
                Register
              </Link>
            </div>
          )}
          <button
            className="rounded-full p-2 text-stone-700 hover:bg-stone-100 lg:hidden dark:text-stone-200 dark:hover:bg-stone-800"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-stone-200 bg-white px-4 pb-4 pt-2 lg:hidden dark:border-stone-800 dark:bg-stone-950">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2.5 text-sm font-medium ${
                    isActive
                      ? "bg-teal-600 text-white"
                      : "text-stone-700 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            {!user && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileOpen(false)} className="btn-secondary">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="btn-primary">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
