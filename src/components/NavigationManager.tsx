import { useEffect, useLayoutEffect, useRef } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const HEADER_OFFSET = 112;

export function NavigationManager() {
  const location = useLocation();
  const navigationType = useNavigationType();
  const scrollPositions = useRef(new Map<string, number>());

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  useLayoutEffect(() => {
    const positions = scrollPositions.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frame = window.requestAnimationFrame(() => {
      if (location.hash) {
        const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
        if (target) {
          const top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
          window.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? "auto" : "smooth" });
          if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
          target.focus({ preventScroll: true });
          return;
        }
      }

      const top = navigationType === "POP" ? (positions.get(location.key) ?? 0) : 0;
      window.scrollTo({ top, left: 0, behavior: "auto" });

      if (navigationType !== "POP") {
        document.getElementById("main-content")?.focus({ preventScroll: true });
      }
    });

    return () => {
      window.cancelAnimationFrame(frame);
      positions.set(location.key, window.scrollY);
    };
  }, [location.hash, location.key, location.pathname, navigationType]);

  return null;
}
