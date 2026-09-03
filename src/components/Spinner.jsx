export default function Spinner({ size = "md", label = "Loading" }) {
  const sizeClass = { sm: "h-4 w-4 border-2", md: "h-8 w-8 border-[3px]", lg: "h-12 w-12 border-4" }[size];
  return (
    <div className="flex flex-col items-center gap-3" role="status" aria-label={label}>
      <div
        className={`${sizeClass} animate-spin rounded-full border-teal-600 border-t-transparent`}
      />
      <span className="sr-only">{label}…</span>
    </div>
  );
}
