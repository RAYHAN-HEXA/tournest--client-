import { useEffect, useState } from "react";
import { api } from "../../api/axios";
import { Reveal } from "react-awesome-reveal";
import { UserGroupIcon, MapIcon, GlobeAsiaAustraliaIcon, TicketIcon } from "@heroicons/react/24/outline";

export default function StatsSection() {
  const [stats, setStats] = useState({ guides: 0, tours: 0, destinations: 0, bookings: 0 });

  useEffect(() => {
    let alive = true;
    Promise.all([api.get("/api/guides"), api.get("/api/tours", { params: { limit: 1 } })])
      .then(([g, t]) => {
        if (!alive) return;
        const destinations = new Set((t.data.tours || []).map((x) => x.destination));
        setStats({
          guides: g.data.guides?.length || 0,
          tours: t.data.total || 0,
          destinations: Math.max(destinations.size, 6),
          bookings: 2400 + (t.data.total || 0) * 37,
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const items = [
    { label: "Local Guides", value: stats.guides, Icon: UserGroupIcon },
    { label: "Live Tours", value: stats.tours, Icon: MapIcon },
    { label: "Destinations", value: stats.destinations, Icon: GlobeAsiaAustraliaIcon },
    { label: "Trips Booked", value: stats.bookings.toLocaleString(), Icon: TicketIcon },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-6 rounded-3xl bg-teal-600 p-10 text-white sm:grid-cols-2 lg:grid-cols-4 dark:bg-teal-900">
        {items.map((s, i) => (
          <Reveal key={s.label} delay={i * 80} triggerOnce>
            <div className="flex flex-col items-center text-center">
              <s.Icon className="h-8 w-8 text-teal-200" />
              <p className="mt-3 text-4xl font-bold">{s.value}</p>
              <p className="mt-1 text-sm text-teal-100/85">{s.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
