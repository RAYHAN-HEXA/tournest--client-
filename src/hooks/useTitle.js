import { useEffect } from "react";

/** Sets a dynamic document title for each route. */
export default function useTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} | TourNest` : "TourNest";
    return () => {
      document.title = prev;
    };
  }, [title]);
}
