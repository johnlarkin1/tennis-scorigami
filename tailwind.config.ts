import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/shadcn/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Add your tennis theme colors
        tennis: {
          // Your main green color
          green: {
            DEFAULT: "#4ade80",
            50: "#edfcf4",
            100: "#d3f8e2",
            200: "#aaf0ca",
            300: "#73e2aa",
            400: "#4ade80", // Your primary green
            500: "#20c866",
            600: "#14a550",
            700: "#118343",
            800: "#126737",
            900: "#10542f",
          },
          // Your button/accent yellow
          yellow: {
            DEFAULT: "#c5c75a",
            50: "#fafae8",
            100: "#f3f3c7",
            200: "#e9e993",
            300: "#dada56",
            400: "#c5c75a", // Your button color
            500: "#a9a73a",
            600: "#86842b",
            700: "#656325",
            800: "#525023",
            900: "#454421",
          },
          // Gray scale for backgrounds
          gray: {
            DEFAULT: "#1f2937",
            50: "#f9fafb",
            100: "#f3f4f6",
            200: "#e5e7eb",
            300: "#d1d5db",
            400: "#9ca3af",
            500: "#6b7280",
            600: "#4b5563",
            700: "#374151",
            800: "#1f2937", // Your dark background
            900: "#111827",
          },
        },
        // Keep existing colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      fontFamily: {
        // Add monospace for split-flap displays
        mono: ["Monaco", "Consolas", "Liberation Mono", "monospace"],
        display: ["Share", "sans-serif"], // For split-flap effect
      },
      animation: {
        // Custom animations for your components
        flip: "flip 0.3s ease-in-out",
        "flip-top": "flip-top 0.3s ease-in-out",
        "flip-bottom": "flip-bottom 0.3s ease-in-out",
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
        shine: "shine 6s linear infinite",
      },
      keyframes: {
        flip: {
          "0%": { transform: "rotateX(0deg)" },
          "50%": { transform: "rotateX(90deg)" },
          "100%": { transform: "rotateX(0deg)" },
        },
        "flip-top": {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateX(-90deg)" },
        },
        "flip-bottom": {
          "0%": { transform: "rotateX(90deg)" },
          "100%": { transform: "rotateX(0deg)" },
        },
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.8", transform: "scale(1.05)" },
        },
        glow: {
          "0%, 100%": {
            "box-shadow": "0 0 5px rgba(251, 191, 36, 0.3)",
            opacity: "0.8",
          },
          "50%": {
            "box-shadow":
              "0 0 20px rgba(251, 191, 36, 0.6), 0 0 30px rgba(251, 191, 36, 0.4)",
            opacity: "1",
          },
        },
        shine: {
          "0%,100%": { backgroundPosition: "-200% 0%" },
          "50%": { backgroundPosition: "200% 0%" },
        },
      },
      backgroundImage: {
        // Custom gradients you're using
        "gradient-tennis": "linear-gradient(to right, #4ade80, #22c55e)",
        "gradient-blue": "linear-gradient(to right, #3b82f6, #60a5fa)",
      },
      transitionTimingFunction: {
        // Tennis ball bounce effect
        "bounce-in": "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
        "smooth-out": "cubic-bezier(0.4, 0, 0.2, 1)",
      },
      spacing: {
        // Custom spacing for your fixed-width containers
        "18": "4.5rem",
        "88": "22rem",
        "128": "32rem",
      },
      height: {
        // For your scoreboards
        scoreboard: "400px",
      },
      width: {
        // Fixed widths for consistent layouts
        "stat-number": "140px",
        "stat-gender": "100px",
        "stat-best": "120px",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        smooth:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        "smooth-lg":
          "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
        tennis: "0 4px 14px 0 rgba(74, 222, 128, 0.2)",
      },
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")], // eslint-disable-line @typescript-eslint/no-require-imports
};

export default config;
