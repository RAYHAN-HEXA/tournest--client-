import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/axios";
import useTitle from "../hooks/useTitle";
import TourCard from "../components/TourCard";
import SkeletonGrid from "../components/SkeletonGrid";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const CATEGORIES = [
  "Nature & Adventure",
  "Cultural & Heritage",
  "Food & Local Life",
  "City & Sightseeing",
];

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
];

const PRICE_RANGES = [
  { value: "", label: "Any price" },
  { value: "1500", label: "Under ৳1,500" },
  { value: "3000", label: "Under ৳3,000" },
  { value: "6000", label: "Under ৳6,000" },
];

export default function ExploreTours() {
  useTitle("Explore Tours");
  const [searchParams, setSearchParams] = useSearchParams();

  const [tours, setTours] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [showFilters, setShowFilters] = useState(false);

  const page = parseInt(searchParams.get("page"), 10) || 1;
  const category = searchParams.get("category") || "";
  const search = searchParams.get("search") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sort = searchParams.get("sort") || "newest";

  const setParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page");
    setSearchParams(next, { replace: true });
  };

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== search) setParam("search", searchInput.trim());
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    const params = { page, limit: 9 };
    if (category) params.category = category;
    if (search) params.search = search;
    if (maxPrice) params.maxPrice = maxPrice;
    if (sort && sort !== "newest") params.sort = sort;

    api
      .get("/api/tours", { params })
      .then((res) => {
        if (!alive) return;
        setTours(res.data.tours || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => alive && setTours([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [category, search, maxPrice, sort, page]);

  const hasFilters = useMemo(
    () => Boolean(category || search || maxPrice || (sort && sort !== "newest")),
    [category, search, maxPrice, sort]
  );

  const clearAll = () => {
    setSearchInput("");
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="text-center">
        <h1 className="section-title">Explore Tours</h1>
        <p className="section-subtitle mx-auto">
          {loading ? "Finding the best local experiences…" : `${total} authentic experience${total === 1 ? "" : "s"} led by local guides`}
        </p>
      </header>

      {/* Search + filter bar */}
      <div className="mt-10 card p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by destination, tour or guide name…"
              className="input !pl-11"
              aria-label="Search tours"
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setParam("sort", e.target.value === "newest" ? "" : e.target.value)}
            className="input sm:w-48"
            aria-label="Sort tours"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters((v) => !v)}
            className={`btn-secondary sm:w-auto ${hasFilters ? "!border-teal-500 !text-teal-700 dark:!text-teal-300" : ""}`}
            aria-expanded={showFilters}
          >
            <FunnelIcon className="h-4 w-4" />
            Filters{hasFilters ? " •" : ""}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid gap-4 border-t border-stone-100 pt-4 sm:grid-cols-2 dark:border-stone-800">
            <div>
              <span className="label">Category</span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setParam("category", "")}
                  className={`badge px-3 py-1.5 ${!category ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"}`}
                >
                  All
                </button>
                {CATEGORIES.map((c) => (
                  <button
                    key={c}
                    onClick={() => setParam("category", c)}
                    className={`badge px-3 py-1.5 ${category === c ? "bg-teal-600 text-white" : "bg-stone-100 text-stone-700 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-300"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="label">Max price per person</span>
              <select value={maxPrice} onChange={(e) => setParam("maxPrice", e.target.value)} className="input">
                {PRICE_RANGES.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {hasFilters && (
          <div className="mt-3 flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
            <button onClick={clearAll} className="flex items-center gap-1 font-medium text-rose-600 hover:underline dark:text-rose-400">
              <XMarkIcon className="h-3.5 w-3.5" /> Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="mt-10">
        {loading ? (
          <SkeletonGrid count={9} />
        ) : tours.length === 0 ? (
          <div className="py-24 text-center">
            <p className="text-5xl" aria-hidden="true">🧭</p>
            <h2 className="mt-4 text-xl font-bold text-stone-900 dark:text-white">No tours found</h2>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Try a different search term or clear your filters.
            </p>
            <button onClick={clearAll} className="btn-primary mt-6">Show all tours</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((t) => (
              <TourCard key={t._id} tour={t} />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
          <button
            onClick={() => setParam("page", String(page - 1))}
            disabled={page <= 1}
            className="btn-secondary !px-3 !py-2"
            aria-label="Previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setParam("page", String(p))}
              aria-current={p === page ? "page" : undefined}
              className={`h-9 w-9 rounded-full text-sm font-semibold transition ${
                p === page
                  ? "bg-teal-600 text-white"
                  : "text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              }`}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setParam("page", String(page + 1))}
            disabled={page >= totalPages}
            className="btn-secondary !px-3 !py-2"
            aria-label="Next page"
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
