import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Workaround: in some cases Radix Dialog/Overlay can leave scroll-lock styles
 * on the document after route changes, causing the app to appear blank/blocked.
 */
export default function RouteCleanup() {
  const location = useLocation();

  useEffect(() => {
    // On every navigation, ensure document styles are restored.
    const body = document.body;
    const html = document.documentElement;

    const cleanup = () => {
      const hadScrollLock =
        body.getAttribute("data-scroll-locked") != null ||
        html.getAttribute("data-scroll-locked") != null ||
        body.style.overflow === "hidden" ||
        html.style.overflow === "hidden";

      body.style.removeProperty("overflow");
      body.style.removeProperty("padding-right");
      body.style.removeProperty("pointer-events");
      html.style.removeProperty("overflow");

      body.classList.remove("overflow-hidden");
      html.classList.remove("overflow-hidden");

      body.removeAttribute("data-scroll-locked");
      html.removeAttribute("data-scroll-locked");

      // If we detect leftover scroll-lock, aggressively remove Radix portals
      // (common cause: a Dialog overlay stays mounted and covers the page).
      if (hadScrollLock) {
        document.querySelectorAll('[data-radix-portal]').forEach((portal) => {
          portal.parentElement?.removeChild(portal);
        });

        // Also remove any full-screen overlays that match our dialog overlay styles.
        document
          .querySelectorAll('.fixed.inset-0.z-50.bg-black\\/60.backdrop-blur-sm')
          .forEach((el) => el.parentElement?.removeChild(el));
      }
    };

    // Run immediately and again after a tick to catch late-unmount portals.
    cleanup();
    const t = window.setTimeout(cleanup, 0);
    return () => window.clearTimeout(t);
  }, [location.pathname]);

  return null;
}
