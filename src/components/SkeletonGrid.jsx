/** Grid of card-shaped skeletons shown while tours/guides load. */
export default function SkeletonGrid({ count = 6 }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-0">
          <div className="skeleton h-48 w-full rounded-none" />
          <div className="space-y-3 p-5">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-4 w-1/2" />
            <div className="skeleton h-4 w-2/3" />
            <div className="flex items-center justify-between pt-2">
              <div className="skeleton h-6 w-20" />
              <div className="skeleton h-9 w-28 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
