/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        red: {
          50: "var(--red-50)",
          100: "var(--red-100)",
          600: "var(--red-600)",
          700: "var(--red-700)",
          800: "var(--red-800)",
          900: "var(--red-900)",
        },
        navy: {
          50: "var(--navy-50)",
          100: "var(--navy-100)",
          600: "var(--navy-600)",
          700: "var(--navy-700)",
          800: "var(--navy-800)",
          900: "var(--navy-900)",
        },
        cream: {
          50: "var(--cream-50)",
          100: "var(--cream-100)",
          200: "var(--cream-200)",
        },
        tan: {
          300: "var(--tan-300)",
        },
        brown: {
          600: "var(--brown-600)",
        },
        ink: {
          400: "var(--ink-400)",
          600: "var(--ink-600)",
          900: "var(--ink-900)",
        },
      },
      fontFamily: {
        display: ["var(--font-display)"],
        condensed: ["var(--font-condensed)"],
        body: ["var(--font-body)"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
        hard: "var(--shadow-hard)",
        "hard-sm": "2px 2px 0 var(--navy-800)",
        // Soft-UI-evolution multi-layer depth for hover/lift states
        soft: "0 1px 2px rgba(28,27,24,0.04), 0 4px 12px rgba(28,27,24,0.06)",
        lift: "0 6px 14px rgba(28,27,24,0.08), 0 16px 32px rgba(28,27,24,0.10)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "16px",
        "2xl": "24px",
        full: "var(--radius-full)",
      },
      letterSpacing: {
        caps: "var(--tracking-caps)",
        wide2: "var(--tracking-wide)",
      },
      transitionTimingFunction: {
        out: "var(--ease-out)",
        snap: "var(--ease-snap)",
      },
      keyframes: {
        "fade-rise": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-rise": "fade-rise 0.55s var(--ease-out) both",
        "fade-in": "fade-in 0.4s var(--ease-out) both",
        "scale-in": "scale-in 0.4s var(--ease-snap) both",
        shimmer: "shimmer 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};
