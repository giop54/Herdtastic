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
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
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
    },
  },
  plugins: [],
};
