import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/axios";
import GuideCard from "../../components/GuideCard";
import SkeletonGrid from "../../components/SkeletonGrid";
import { Reveal } from "react-awesome-reveal";

export default function GuidesSection() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    api
      .get("/api/guides", { params: { featured: true, limit: 6 } })
      .then((res) => alive && setGuides(res.data.guides || []))
      .catch(console.error)
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="bg-stone-100/70 py-20 dark:bg-stone-900/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Featured Local Guides</h2>
            <p className="section-subtitle">
              Real people from real places — rated by travelers who walked with them.
            </p>
          </div>
          <Link to="/become-a-guide" className="btn-secondary">
            Become a Guide
          </Link>
        </div>

        <div className="mt-12">
          {loading ? (
            <SkeletonGrid count={3} />
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g, i) => (
                <Reveal key={g._id} delay={i * 80} triggerOnce>
                  <GuideCard guide={g} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
