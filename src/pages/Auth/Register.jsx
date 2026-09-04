import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import useTitle from "../../hooks/useTitle";
import { useAuth } from "../../context/AuthProvider";

const passwordRules = [
  { test: (v) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v) => v.length >= 6, label: "At least 6 characters" },
];

export default function Register() {
  useTitle("Create Account");
  const { register: registerAuth, googleLogin, syncWithServer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { role: "traveler" } });

  // Registering as a guide auto-approves the guide role immediately (product
  // requirement); travelers can later apply via Become a Guide for admin
  // approval. The choice only matters for brand-new accounts.
  const role = watch("role");

  const onSuccess = (asGuide) => {
    toast.success(
      asGuide
        ? "Guide account created — welcome to TourNest!"
        : "Account created — welcome to TourNest!"
    );
    navigate(asGuide ? "/dashboard" : from, { replace: true });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    const asGuide = data.role === "guide";
    try {
      const cred = await registerAuth({
        name: data.name,
        email: data.email,
        password: data.password,
        photoURL: data.photoURL,
        role: data.role,
      });
      await syncWithServer(cred, { name: data.name, photoURL: data.photoURL });
      onSuccess(asGuide);
    } catch (err) {
      const msg = {
        "auth/email-already-in-use": "This email is already registered. Try logging in.",
        "auth/invalid-email": "That email address looks invalid.",
      }[err?.code];
      toast.error(msg || err?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    try {
      const cred = await googleLogin();
      await syncWithServer(cred, {});
      onSuccess(false);
    } catch (err) {
      if (err?.code !== "auth/popup-closed-by-user") {
        toast.error(err?.message || "Google sign-up failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-16">
      <div className="card p-8">
        <h1 className="text-center text-3xl font-bold text-stone-900 dark:text-white">Join TourNest</h1>
        <p className="mt-2 text-center text-sm text-stone-500 dark:text-stone-400">
          Book local tours — or offer your own
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
          <div>
            <label htmlFor="name" className="label">Full name</label>
            <input
              id="name"
              type="text"
              className="input"
              placeholder="Rahim Uddin"
              {...register("name", { required: "Name is required", minLength: { value: 2, message: "Name is too short" } })}
            />
            {errors.name && <p className="mt-1.5 text-xs text-rose-600">{errors.name.message}</p>}
          </div>

          <div>
            <label htmlFor="photoURL" className="label">Photo URL <span className="font-normal text-stone-400">(optional)</span></label>
            <input
              id="photoURL"
              type="url"
              className="input"
              placeholder="https://example.com/me.jpg"
              {...register("photoURL", {
                pattern: { value: /^(https?:\/\/).+/, message: "Must start with http(s)://" },
              })}
            />
            {errors.photoURL && <p className="mt-1.5 text-xs text-rose-600">{errors.photoURL.message}</p>}
          </div>

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
            <label htmlFor="password" className="label">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              onInput={(e) => setPassword(e.target.value)}
              {...register("password", {
                required: "Password is required",
                validate: {
                  uppercase: (v) => /[A-Z]/.test(v) || "Must contain an uppercase letter",
                  lowercase: (v) => /[a-z]/.test(v) || "Must contain a lowercase letter",
                  length: (v) => v.length >= 6 || "Minimum 6 characters",
                },
              })}
            />
            <ul className="mt-2 space-y-1" aria-label="Password requirements">
              {passwordRules.map((r) => {
                const ok = password && r.test(password);
                return (
                  <li
                    key={r.label}
                    className={`flex items-center gap-1.5 text-xs ${ok ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400"}`}
                  >
                    <span aria-hidden="true">{ok ? "✓" : "○"}</span> {r.label}
                  </li>
                );
              })}
            </ul>
            {errors.password && <p className="mt-1.5 text-xs text-rose-600">{errors.password.message}</p>}
          </div>

          <fieldset>
            <legend className="label">I want to join as</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-300 p-3.5 text-sm has-checked:border-teal-600 has-checked:bg-teal-50 dark:border-stone-700 dark:has-checked:bg-teal-900/30">
                <input type="radio" value="traveler" className="accent-teal-600" {...register("role")} />
                <span>
                  <span className="block font-medium text-stone-800 dark:text-stone-200">Traveler</span>
                  <span className="block text-xs text-stone-500">Book local tours</span>
                </span>
              </label>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-stone-300 p-3.5 text-sm has-checked:border-teal-600 has-checked:bg-teal-50 dark:border-stone-700 dark:has-checked:bg-teal-900/30">
                <input type="radio" value="guide" className="accent-teal-600" {...register("role")} />
                <span>
                  <span className="block font-medium text-stone-800 dark:text-stone-200">Guide</span>
                  <span className="block text-xs text-stone-500">Offer my own tours</span>
                </span>
              </label>
            </div>
            {role === "guide" && (
              <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                Guide accounts are activated immediately — you can publish tours right after signup.
              </p>
            )}
          </fieldset>

          <button type="submit" className="btn-primary w-full !py-3" disabled={submitting}>
            {submitting ? "Creating account…" : "Create Account"}
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
          Sign up with Google
        </button>

        <p className="mt-6 text-center text-sm text-stone-500 dark:text-stone-400">
          Already have an account?{" "}
          <Link to="/login" state={{ from }} className="font-semibold text-teal-700 hover:underline dark:text-teal-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
