import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthProvider";
import Spinner from "./Spinner";

/**
 * Guards private routes. Uses the firebase auth restoring flag so a page
 * reload never kicks an authenticated user back to /login.
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading, role } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (roles && !roles.includes(role)) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="section-title">Access restricted</h1>
        <p className="mt-4 text-stone-600 dark:text-stone-400">
          This page requires the {roles.join(" or ")} role. You are signed in as a {role}.
        </p>
      </div>
    );
  }

  return children;
}
