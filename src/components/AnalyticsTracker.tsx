import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackContact, trackPageView } from "@/lib/track";

/**
 * Google Analytics counts page changes itself (GA4 enhanced measurement:
 * "Page changes based on browser history events"), and index.html records
 * the first page for both tags. This adds the Meta PageView for later pages
 * and records WhatsApp / phone taps anywhere on the site.
 */
export default function AnalyticsTracker() {
  const location = useLocation();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    trackPageView();
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const link = (e.target as HTMLElement | null)?.closest?.("a");
      const href = link?.getAttribute("href") || "";
      if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) trackContact("whatsapp", window.location.pathname);
      else if (href.startsWith("tel:")) trackContact("phone", window.location.pathname);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
