import type { CSSProperties, ReactNode } from "react";
import { useInView } from "../lib/useInView";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Stagger multiple Reveal siblings by passing increasing delays (ms). */
  delayMs?: number;
}

/** Fades + rises children in once they scroll into view. No-ops to instant under prefers-reduced-motion (handled globally). */
export function Reveal({ children, className = "", delayMs = 0 }: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const style: CSSProperties | undefined = delayMs ? { animationDelay: `${delayMs}ms` } : undefined;

  return (
    <div ref={ref} className={`${inView ? "animate-fade-rise" : "opacity-0"} ${className}`} style={style}>
      {children}
    </div>
  );
}
