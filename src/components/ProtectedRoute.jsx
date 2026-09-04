import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Spinner from "./Spinner";

/**
 * Role-aware route guard.
 *
 * Waits for authReady (firebase restore + JWT session sync + DB profile with
 * role) before deciding, so a page refresh never flashes the wrong role or an
 * unauthorized message while the profile is still loading.
 *
 * - Unauthenticated  → redirect to /login (preserving the intended destination).
 * - Wrong role       → redirect to their own home page.
 * - Authorized       → render children.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, role, authReady, syncError } = useAuth();
  const location = useLocation();

  if (!authReady) {
    if (syncError) {
      // Backend was unreachable during session bootstrap — no verified role.
      return (
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <h1 className="section-title">Session problem</h1>
          <p className="mt-3 text-stone-600 dark:text-stone-400">{syncError}</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-6">
            Retry
          </button>
        </div>
      );
    }
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-stone-500 dark:text-stone-400">Loading your session…</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(role)) {
    // Send the user to the home page of the role they actually have.
    const home = role === "admin" ? "/admin" : role === "guide" ? "/dashboard" : "/";
    return <Navigate to={location.pathname === home ? "/" : home} replace />;
  }

  return children;
}
