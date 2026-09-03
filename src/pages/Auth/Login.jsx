import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import { useAuth } from "../../context/AuthProvider";

export default function Login() {
  useTitle("Login");
  const { login, googleLogin, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm();

  const onSuccess = () => {
    toast.success("Welcome back to TourNest!");
    navigate(from, { replace: true });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      onSuccess();
    } catch (err) {
      const msg = {
        "auth/invalid-credential": "Wrong email or password. Please try again.",
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Wrong email or password. Please try again.",
        "auth/too-many-requests": "Too many attempts — please wait a moment.",
      }[err?.code];
      toast.error(msg || err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      await googleLogin();
      onSuccess();
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error(err?.message || "Google login failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <h1 className="text-center text-3xl font-bold text-stone-900 dark:text-white">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">
          Log in to book tours and manage your trips
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="label">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Enter a valid email" },
              })}
            />
            {errors.email && <p className="mt-1.5 text-xs text-rose-600">{errors.email.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="label">Password</label>
              <button
                type="button"
                className="text-xs font-medium text-teal-700 hover:underline dark:text-teal-400"
                onClick={async () => {
                  const email = getValues("email");
                  if (!email) return toast.error("Enter your email first, then tap resend");
                  try {
                    await resetPassword(email);
                    toast.success(`Reset link sent to ${email}`);
                  } catch {
                    toast.error("Could not send reset email");
                  }
                }}
              >
                Forgot password?
              </button>
            </div>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
            {submitting ? "Logging in…" : "Login"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
          <span className="text-xs uppercase tracking-wider text-stone-400">or</span>
          <div className="h-px flex-1 bg-stone-200 dark:bg-stone-700" />
        </div>

        <button onClick={handleGoogle} disabled={submitting} className="btn-secondary w-full !py-3">
          <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52Z" />
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          New to TourNest?{" "}
          <Link to="/register" state={{ from }} className="font-semibold text-teal-700 hover:underline dark:text-teal-400">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
