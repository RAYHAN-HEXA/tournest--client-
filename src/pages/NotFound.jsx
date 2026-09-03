import { Link } from "react-router-dom";
import useTitle from "../hooks/useTitle";

export default function NotFound() {
  useTitle("Page Not Found");
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <p className="text-8xl font-bold text-teal-600 dark:text-teal-400" aria-hidden="true">404</p>
      <h1 className="mt-4 text-2xl font-bold text-stone-900 dark:text-white">You've wandered off the trail</h1>
      <p className="mt-3 text-stone-600 dark:text-stone-400">
        The page you're looking for doesn't exist — but plenty of real trails do.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/" className="btn-primary">Back to Home</Link>
        <Link to="/tours" className="btn-secondary">Explore Tours</Link>
      </div>
    </div>
  );
}
