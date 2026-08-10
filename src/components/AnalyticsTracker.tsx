import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Extend window interface to avoid TypeScript errors for window.gtag
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = "G-KNYK3K7872";

export default function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag === "function") {
      window.gtag("config", MEASUREMENT_ID, {
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
}