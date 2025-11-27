/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Industrial theme colors
        steel: {
          50: "hsl(210, 20%, 98%)",
          100: "hsl(210, 20%, 95%)",
          200: "hsl(210, 20%, 90%)",
          300: "hsl(210, 20%, 80%)",
          400: "hsl(210, 20%, 65%)",
          500: "hsl(210, 20%, 50%)",
          600: "hsl(210, 20%, 40%)",
          700: "hsl(210, 20%, 30%)",
          800: "hsl(210, 20%, 20%)",
          900: "hsl(210, 20%, 10%)",
        },
        copper: {
          50: "hsl(25, 95%, 97%)",
          100: "hsl(25, 90%, 92%)",
          200: "hsl(25, 85%, 85%)",
          300: "hsl(25, 80%, 75%)",
          400: "hsl(25, 75%, 65%)",
          500: "hsl(25, 70%, 55%)",
          600: "hsl(25, 65%, 45%)",
          700: "hsl(25, 60%, 35%)",
          800: "hsl(25, 55%, 25%)",
          900: "hsl(25, 50%, 15%)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
}
