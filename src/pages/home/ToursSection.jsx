import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import TourCard from "../../components/TourCard";
import SkeletonGrid from "../../components/SkeletonGrid";
import { Reveal } from "react-awesome-reveal";

export default function ToursSection() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get("/api/tours/featured")
      .then((res) => alive && setTours(res.data.tours || []))
      .catch(console.error)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="section-title">Popular Tours</h2>
          <p className="section-subtitle">
            Hand-picked experiences our travelers keep recommending.
          </p>
        </div>
        <Link to="/tours" className="btn-primary">
          View All Tours
        </Link>
      </div>

      <div className="mt-12">
        {loading ? (
          <SkeletonGrid count={6} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tours.map((t, i) => (
              <Reveal key={t._id} delay={(i % 3) * 80} triggerOnce>
                <TourCard tour={t} />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
